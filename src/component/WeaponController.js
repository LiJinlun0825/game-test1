/**
 * 武器控制器组件
 */
import { Weapon, WEAPONS } from '../weapon/WeaponSystem.js';

export class WeaponController {
  constructor() {
    this.entity = null;
    this.weapons = [null, null, null];
    this.currentSlot = 0;
    this.inputManager = null;
    this.world = null;

    this.isShooting = false;
    this.raycaster = new THREE.Raycaster();
  }

  setEntity(entity) {
    this.entity = entity;
  }

  setInputManager(inputManager) {
    this.inputManager = inputManager;
  }

  setWorld(world) {
    this.world = world;
  }

  /**
   * 拾取武器
   */
  pickupWeapon(weaponId) {
    const weapon = new Weapon(weaponId);

    // 找空槽位
    for (let i = 0; i < this.weapons.length; i++) {
      if (!this.weapons[i]) {
        this.weapons[i] = weapon;
        return true;
      }
    }

    // 替换当前槽位
    this.weapons[this.currentSlot] = weapon;
    return true;
  }

  /**
   * 添加弹药
   */
  addAmmo(ammoType, amount) {
    for (const weapon of this.weapons) {
      if (weapon && weapon.ammoType === ammoType) {
        weapon.addAmmo(amount);
      }
    }
  }

  /**
   * 获取当前武器
   */
  getCurrentWeapon() {
    return this.weapons[this.currentSlot];
  }

  /**
   * 切换武器
   */
  switchWeapon(slot) {
    if (slot >= 0 && slot < this.weapons.length && this.weapons[slot]) {
      this.currentSlot = slot;
      return true;
    }
    return false;
  }

  update(deltaTime, elapsedTime) {
    if (!this.inputManager) return;

    const weapon = this.getCurrentWeapon();
    if (!weapon) return;

    // 换弹
    weapon.updateReload(deltaTime);
    if (this.inputManager.isKeyPressed('KeyR')) {
      weapon.startReload();
    }

    // 武器切换
    if (this.inputManager.isKeyPressed('Digit1')) this.switchWeapon(0);
    if (this.inputManager.isKeyPressed('Digit2')) this.switchWeapon(1);
    if (this.inputManager.isKeyPressed('Digit3')) this.switchWeapon(2);

    // 射击
    if (this.inputManager.isMouseButtonHeld(0) && !weapon.isReloading) {
      if (weapon.fire(elapsedTime)) {
        this.shoot();
      }
    }
  }

  shoot() {
    if (!this.world || !this.entity) return;

    const weapon = this.getCurrentWeapon();
    if (!weapon) return;

    // 射线检测
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.entity.object3D.quaternion);

    this.raycaster.set(this.entity.position, direction);
    this.raycaster.far = weapon.range;

    // 检测敌人
    const enemyMeshes = [];
    if (this.world.enemies) {
      for (const enemy of this.world.enemies) {
        if (!enemy.isDead() && enemy.object3D) {
          enemyMeshes.push(enemy.object3D);
        }
      }
    }

    const intersects = this.raycaster.intersectObjects(enemyMeshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      // 找到被击中的敌人
      for (const enemy of this.world.enemies) {
        if (enemy.object3D === hit.object || enemy.object3D.children.includes(hit.object)) {
          enemy.health.damage(weapon.damage);
          break;
        }
      }
    }
  }
}