/**
 * 武器控制器组件
 */
import { Weapon, WEAPONS } from '../weapon/WeaponSystem.js';
import { RealisticWeaponModel } from '../model/RealisticWeaponModel.js';
import { FPSHandsModel } from '../model/FPSHandsModel.js';

export class WeaponController {
  constructor() {
    this.entity = null;
    this.weapons = [null, null, null];
    this.currentSlot = 0;
    this.inputManager = null;
    this.world = null;

    this.isShooting = false;
    this.isAiming = false;
    this.raycaster = new THREE.Raycaster();

    // 散射参数
    this.baseSpread = 0.02;
    this.adsSpreadMultiplier = 0.3;

    // 武器模型系统
    this.weaponModelSystem = null;
    this.fpsHandsModel = null;
    this.camera = null;
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
   * 设置相机（用于FPS手部模型）
   */
  setCamera(camera) {
    this.camera = camera;

    // 初始化武器模型系统
    this.weaponModelSystem = new RealisticWeaponModel();
    this.weaponModelSystem.init();

    // 初始化FPS手部模型
    this.fpsHandsModel = new FPSHandsModel(null, camera);
    this.fpsHandsModel.init();

    // 如果已经有武器，更新模型显示
    this.updateWeaponModel();

    console.log('Weapon visual system initialized');
  }

  /**
   * 拾取武器
   */
  pickupWeapon(weaponId) {
    const weapon = new Weapon(weaponId);

    // 添加初始备用弹药
    weapon.reserveAmmo = weapon.magazineSize * 3;

    // 找空槽位
    let slot = -1;
    for (let i = 0; i < this.weapons.length; i++) {
      if (!this.weapons[i]) {
        slot = i;
        break;
      }
    }

    // 如果没有空槽位，替换当前槽位
    if (slot === -1) {
      slot = this.currentSlot;
    }

    this.weapons[slot] = weapon;

    // 如果是当前槽位，更新武器模型
    if (slot === this.currentSlot) {
      this.updateWeaponModel();
    }

    console.log(`Picked up weapon: ${weapon.name} (Ammo: ${weapon.currentAmmo}/${weapon.reserveAmmo})`);

    return true;
  }

  /**
   * 更新武器模型显示
   */
  updateWeaponModel() {
    if (!this.fpsHandsModel || !this.weaponModelSystem) return;

    const weapon = this.getCurrentWeapon();
    if (weapon) {
      const model = this.weaponModelSystem.getModel(weapon.id);
      this.fpsHandsModel.setWeapon(model);
    } else {
      this.fpsHandsModel.setWeapon(null);
    }
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
      this.updateWeaponModel();
      return true;
    }
    return false;
  }

  /**
   * 获取当前散射值
   */
  getCurrentSpread() {
    return this.isAiming
      ? this.baseSpread * this.adsSpreadMultiplier
      : this.baseSpread;
  }

  /**
   * 是否正在瞄准
   */
  getIsAiming() {
    return this.isAiming;
  }

  update(deltaTime, elapsedTime) {
    if (!this.inputManager) return;

    const weapon = this.getCurrentWeapon();

    // 瞄准状态（右键）
    this.isAiming = this.inputManager.isMouseButtonHeld(2);

    if (!weapon) return;

    // 换弹
    weapon.updateReload(deltaTime);
    if (this.inputManager.isKeyPressed('KeyR')) {
      weapon.startReload();
      if (this.fpsHandsModel) {
        this.fpsHandsModel.playReloadAnimation(weapon.reloadTime);
      }
    }

    // 武器切换
    if (this.inputManager.isKeyPressed('Digit1')) this.switchWeapon(0);
    if (this.inputManager.isKeyPressed('Digit2')) this.switchWeapon(1);
    if (this.inputManager.isKeyPressed('Digit3')) this.switchWeapon(2);

    // 射击
    if (this.inputManager.isMouseButtonHeld(0) && !weapon.isReloading) {
      if (weapon.fire(elapsedTime)) {
        this.shoot();
        if (this.fpsHandsModel) {
          this.fpsHandsModel.playShootAnimation();
        }
      }
    }

    // 更新FPS手部模型动画
    if (this.fpsHandsModel && this.entity) {
      const velocity = this.entity.characterController?.velocity || new THREE.Vector3();
      this.fpsHandsModel.update(deltaTime, velocity);
    }
  }

  shoot() {
    if (!this.world || !this.entity) return;

    const weapon = this.getCurrentWeapon();
    if (!weapon) return;

    // 从相机位置发射射线
    const shootOrigin = this.camera ? this.camera.position.clone() : this.entity.position.clone();

    // 射线检测 - 添加散射
    const spread = this.getCurrentSpread();
    const direction = new THREE.Vector3(0, 0, -1);

    // 添加散射偏移
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.normalize();

    // 使用相机方向
    if (this.camera) {
      direction.applyQuaternion(this.camera.quaternion);
    } else {
      direction.applyQuaternion(this.entity.object3D.quaternion);
    }

    this.raycaster.set(shootOrigin, direction);
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
        if (!enemy.object3D) continue;

        // 检查是否是敌人的模型或其子对象
        let isHit = false;
        enemy.object3D.traverse(child => {
          if (child === hit.object) isHit = true;
        });

        if (isHit) {
          enemy.health.damage(weapon.damage);
          console.log(`Hit enemy! Damage: ${weapon.damage}, Enemy health: ${enemy.health.current}`);
          break;
        }
      }
    }
  }
}