/**
 * 武器系统
 */

// 武器配置
export const WEAPONS = {
  // 手枪
  glock17: {
    name: 'Glock 17',
    type: 'pistol',
    damage: 25,
    fireRate: 2,
    magazineSize: 17,
    reloadTime: 1.5,
    ammoType: '9mm',
    range: 50
  },
  // 步枪
  m4a1: {
    name: 'M4A1',
    type: 'rifle',
    damage: 35,
    fireRate: 10,
    magazineSize: 30,
    reloadTime: 2.5,
    ammoType: '5.56mm',
    range: 100
  },
  ak47: {
    name: 'AK-47',
    type: 'rifle',
    damage: 40,
    fireRate: 8,
    magazineSize: 30,
    reloadTime: 2.5,
    ammoType: '7.62mm',
    range: 100
  },
  // 狙击枪
  awp: {
    name: 'AWP',
    type: 'sniper',
    damage: 100,
    fireRate: 0.5,
    magazineSize: 5,
    reloadTime: 3,
    ammoType: '.338',
    range: 300
  },
  // 霰弹枪
  spas12: {
    name: 'SPAS-12',
    type: 'shotgun',
    damage: 80,
    fireRate: 1,
    magazineSize: 8,
    reloadTime: 2,
    ammoType: '12ga',
    range: 30
  }
};

/**
 * 武器类
 */
export class Weapon {
  constructor(weaponId) {
    const config = WEAPONS[weaponId];
    if (!config) {
      throw new Error(`Unknown weapon: ${weaponId}`);
    }

    this.id = weaponId;
    this.name = config.name;
    this.type = config.type;
    this.damage = config.damage;
    this.fireRate = config.fireRate;
    this.magazineSize = config.magazineSize;
    this.reloadTime = config.reloadTime;
    this.ammoType = config.ammoType;
    this.range = config.range;

    this.currentAmmo = this.magazineSize;
    this.reserveAmmo = 0;
    this.isReloading = false;
    this.reloadProgress = 0;
    this.lastFireTime = 0;
  }

  /**
   * 射击
   */
  fire(time) {
    if (this.isReloading) return false;
    if (this.currentAmmo <= 0) return false;

    const fireInterval = 1 / this.fireRate;
    if (time - this.lastFireTime < fireInterval) return false;

    this.currentAmmo--;
    this.lastFireTime = time;
    return true;
  }

  /**
   * 开始换弹
   */
  startReload() {
    if (this.isReloading) return false;
    if (this.currentAmmo === this.magazineSize) return false;
    if (this.reserveAmmo <= 0) return false;

    this.isReloading = true;
    this.reloadProgress = 0;
    return true;
  }

  /**
   * 更新换弹进度
   */
  updateReload(deltaTime) {
    if (!this.isReloading) return;

    this.reloadProgress += deltaTime / this.reloadTime;
    if (this.reloadProgress >= 1) {
      this.finishReload();
    }
  }

  /**
   * 完成换弹
   */
  finishReload() {
    const needed = this.magazineSize - this.currentAmmo;
    const available = Math.min(needed, this.reserveAmmo);
    this.currentAmmo += available;
    this.reserveAmmo -= available;
    this.isReloading = false;
    this.reloadProgress = 0;
  }

  /**
   * 添加弹药
   */
  addAmmo(amount) {
    this.reserveAmmo += amount;
  }

  /**
   * 获取换弹进度
   */
  getReloadProgress() {
    return this.reloadProgress;
  }
}