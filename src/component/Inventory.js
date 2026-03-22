/**
 * 物品栏组件
 */
export class Inventory {
  constructor(maxWeaponSlots = 3) {
    this.maxWeaponSlots = maxWeaponSlots;
    this.weapons = [null, null, null];
    this.currentSlot = 0;
    this.ammo = {};
  }

  /**
   * 添加武器到指定槽位
   */
  addWeapon(weapon, slot) {
    if (slot >= 0 && slot < this.maxWeaponSlots) {
      this.weapons[slot] = weapon;
      return true;
    }
    return false;
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
    if (slot >= 0 && slot < this.maxWeaponSlots) {
      this.currentSlot = slot;
      return true;
    }
    return false;
  }

  /**
   * 添加弹药
   */
  addAmmo(type, amount) {
    if (!this.ammo[type]) {
      this.ammo[type] = 0;
    }
    this.ammo[type] += amount;
  }

  /**
   * 使用弹药
   */
  useAmmo(type, amount = 1) {
    if (this.ammo[type] && this.ammo[type] >= amount) {
      this.ammo[type] -= amount;
      return true;
    }
    return false;
  }

  /**
   * 获取弹药数量
   */
  getAmmo(type) {
    return this.ammo[type] || 0;
  }
}