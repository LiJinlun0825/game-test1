/**
 * 背包/物品栏组件
 * 管理武器、配件、道具
 */
export class Inventory {
  constructor() {
    this.entity = null;

    // 武器槽位
    this.weaponSlots = [
      null, // 主武器1
      null, // 主武器2
      null  // 副武器
    ];
    this.currentWeaponSlot = 0;

    // 配件背包
    this.attachments = [];

    // 弹药储备 (按口径分类)
    this.ammo = {
      '9mm': 0,
      '5.56mm': 0,
      '7.62mm': 0,
      '.50 AE': 0,
      '.357 Magnum': 0,
      '.338 Lapua': 0,
      '.50 BMG': 0,
      '12 Gauge': 0,
      '5.7mm': 0
    };

    // 道具
    this.items = [];

    // 背包容量
    this.maxBackpackSize = 3; // 背包等级 0-3
  }

  /**
   * 设置所属实体
   */
  setEntity(entity) {
    this.entity = entity;
  }

  /**
   * 初始化
   */
  init() {
    // 初始化完成
  }

  /**
   * 获取当前武器
   */
  getCurrentWeapon() {
    return this.weaponSlots[this.currentWeaponSlot];
  }

  /**
   * 切换武器槽
   */
  switchWeaponSlot(slotIndex) {
    if (slotIndex >= 0 && slotIndex < this.weaponSlots.length) {
      this.currentWeaponSlot = slotIndex;
      return true;
    }
    return false;
  }

  /**
   * 切换到下一个武器
   */
  nextWeapon() {
    const startIndex = this.currentWeaponSlot;
    do {
      this.currentWeaponSlot = (this.currentWeaponSlot + 1) % this.weaponSlots.length;
    } while (this.weaponSlots[this.currentWeaponSlot] === null &&
             this.currentWeaponSlot !== startIndex);
  }

  /**
   * 切换到上一个武器
   */
  previousWeapon() {
    const startIndex = this.currentWeaponSlot;
    do {
      this.currentWeaponSlot = (this.currentWeaponSlot - 1 + this.weaponSlots.length) %
                                this.weaponSlots.length;
    } while (this.weaponSlots[this.currentWeaponSlot] === null &&
             this.currentWeaponSlot !== startIndex);
  }

  /**
   * 拾取武器
   */
  pickupWeapon(weapon) {
    // 查找空槽位
    for (let i = 0; i < this.weaponSlots.length; i++) {
      if (this.weaponSlots[i] === null) {
        this.weaponSlots[i] = weapon;
        return true;
      }
    }

    // 没有空槽位，替换当前武器
    // TODO: 掉落当前武器
    this.weaponSlots[this.currentWeaponSlot] = weapon;
    return true;
  }

  /**
   * 丢弃武器
   */
  dropWeapon(slotIndex = this.currentWeaponSlot) {
    if (this.weaponSlots[slotIndex]) {
      const weapon = this.weaponSlots[slotIndex];
      this.weaponSlots[slotIndex] = null;
      return weapon;
    }
    return null;
  }

  /**
   * 添加弹药
   */
  addAmmo(caliber, amount) {
    if (this.ammo[caliber] !== undefined) {
      this.ammo[caliber] += amount;
      return true;
    }
    return false;
  }

  /**
   * 消耗弹药
   */
  useAmmo(caliber, amount = 1) {
    if (this.ammo[caliber] !== undefined && this.ammo[caliber] >= amount) {
      this.ammo[caliber] -= amount;
      return true;
    }
    return false;
  }

  /**
   * 获取弹药数量
   */
  getAmmoCount(caliber) {
    return this.ammo[caliber] || 0;
  }

  /**
   * 添加配件
   */
  addAttachment(attachment) {
    this.attachments.push(attachment);
    return true;
  }

  /**
   * 移除配件
   */
  removeAttachment(attachmentId) {
    const index = this.attachments.findIndex(a => a.id === attachmentId);
    if (index !== -1) {
      return this.attachments.splice(index, 1)[0];
    }
    return null;
  }

  /**
   * 添加道具
   */
  addItem(item) {
    // 检查是否可堆叠
    const existingItem = this.items.find(i => i.id === item.id && i.stackable);
    if (existingItem) {
      existingItem.count = (existingItem.count || 1) + (item.count || 1);
      return true;
    }

    this.items.push(item);
    return true;
  }

  /**
   * 使用道具
   */
  useItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (item && item.use) {
      item.use(this.entity);
      if (item.stackable && item.count > 1) {
        item.count--;
      } else {
        this.removeItem(itemId);
      }
      return true;
    }
    return false;
  }

  /**
   * 移除道具
   */
  removeItem(itemId) {
    const index = this.items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      return this.items.splice(index, 1)[0];
    }
    return null;
  }

  /**
   * 获取背包容量
   */
  getCapacity() {
    return this.maxBackpackSize;
  }

  /**
   * 更新
   */
  update(deltaTime) {
    // 更新逻辑
  }

  /**
   * 销毁
   */
  destroy() {
    this.weaponSlots = [null, null, null];
    this.attachments = [];
    this.items = [];
  }
}