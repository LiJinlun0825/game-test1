/**
 * 武器配置数据
 * 包含所有武器的详细属性
 */
export const WEAPONS = {
  // ===== 手枪类 =====
  glock17: {
    id: 'glock17',
    name: 'Glock 17',
    category: 'pistol',
    type: 'semi',
    damage: 24,
    fireRate: 0.15,      // 射击间隔(秒)
    accuracy: 0.95,
    range: 50,           // 有效射程(米)
    magazine: 17,
    reloadTime: 1.8,
    caliber: '9mm',
    velocity: 375,       // 弹速(m/s)
    recoil: 0.15,
    recoilRecovery: 0.9,
    slots: {
      scope: true,
      muzzle: true,
      grip: false,
      stock: false,
      magazine: true
    },
    attachments: [],
    color: 0x00FFFF,
    key: '1',
    origin: '奥地利'
  },
  deagle: {
    id: 'deagle',
    name: 'Desert Eagle',
    category: 'pistol',
    type: 'semi',
    damage: 62,
    fireRate: 0.25,
    accuracy: 0.85,
    range: 75,
    magazine: 7,
    reloadTime: 2.2,
    caliber: '.50 AE',
    velocity: 440,
    recoil: 0.45,
    recoilRecovery: 0.75,
    slots: {
      scope: true,
      muzzle: true,
      grip: false,
      stock: false,
      magazine: true
    },
    attachments: [],
    color: 0xFFD700,
    key: '2',
    origin: '以色列'
  },

  // ===== 突击步枪类 =====
  ak47: {
    id: 'ak47',
    name: 'AK-47',
    category: 'assault',
    type: 'auto',
    damage: 35,
    fireRate: 0.1,
    accuracy: 0.75,
    range: 400,
    magazine: 30,
    reloadTime: 2.8,
    caliber: '7.62mm',
    velocity: 715,
    recoil: 0.28,
    recoilRecovery: 0.85,
    slots: {
      scope: true,
      muzzle: true,
      grip: true,
      stock: true,
      magazine: true
    },
    attachments: [],
    color: 0xB87333,
    key: '3',
    origin: '苏联'
  },
  m4a1: {
    id: 'm4a1',
    name: 'M4A1',
    category: 'assault',
    type: 'auto',
    damage: 28,
    fireRate: 0.08,
    accuracy: 0.88,
    range: 500,
    magazine: 30,
    reloadTime: 2.4,
    caliber: '5.56mm',
    velocity: 880,
    recoil: 0.18,
    recoilRecovery: 0.9,
    slots: {
      scope: true,
      muzzle: true,
      grip: true,
      stock: true,
      magazine: true
    },
    attachments: [],
    color: 0x2F4F4F,
    key: '4',
    origin: '美国'
  },
  scarh: {
    id: 'scarh',
    name: 'SCAR-H',
    category: 'assault',
    type: 'auto',
    damage: 40,
    fireRate: 0.1,
    accuracy: 0.85,
    range: 600,
    magazine: 20,
    reloadTime: 2.5,
    caliber: '7.62mm',
    velocity: 790,
    recoil: 0.25,
    recoilRecovery: 0.88,
    slots: {
      scope: true,
      muzzle: true,
      grip: true,
      stock: true,
      magazine: true
    },
    attachments: [],
    color: 0x4A4A4A,
    key: '5',
    origin: '比利时'
  },

  // ===== 冲锋枪类 =====
  mp5: {
    id: 'mp5',
    name: 'MP5',
    category: 'smg',
    type: 'auto',
    damage: 22,
    fireRate: 0.06,
    accuracy: 0.82,
    range: 200,
    magazine: 30,
    reloadTime: 2.0,
    caliber: '9mm',
    velocity: 400,
    recoil: 0.12,
    recoilRecovery: 0.92,
    slots: {
      scope: true,
      muzzle: true,
      grip: false,
      stock: true,
      magazine: true
    },
    attachments: [],
    color: 0x1C1C1C,
    key: '6',
    origin: '德国'
  },
  p90: {
    id: 'p90',
    name: 'P90',
    category: 'smg',
    type: 'auto',
    damage: 18,
    fireRate: 0.05,
    accuracy: 0.78,
    range: 200,
    magazine: 50,
    reloadTime: 2.3,
    caliber: '5.7mm',
    velocity: 715,
    recoil: 0.1,
    recoilRecovery: 0.9,
    slots: {
      scope: true,
      muzzle: true,
      grip: false,
      stock: false,
      magazine: true
    },
    attachments: [],
    color: 0x3D3D3D,
    key: '7',
    origin: '比利时'
  },

  // ===== 狙击枪类 =====
  awp: {
    id: 'awp',
    name: 'AWP',
    category: 'sniper',
    type: 'bolt',
    damage: 115,
    fireRate: 1.5,
    accuracy: 0.98,
    range: 1500,
    magazine: 5,
    reloadTime: 3.5,
    caliber: '.338 Lapua',
    velocity: 905,
    recoil: 0.6,
    recoilRecovery: 0.7,
    slots: {
      scope: true,
      muzzle: true,
      grip: false,
      stock: true,
      magazine: true
    },
    attachments: [],
    color: 0x228B22,
    key: '8',
    origin: '英国'
  },
  kar98k: {
    id: 'kar98k',
    name: 'Kar98k',
    category: 'sniper',
    type: 'bolt',
    damage: 99,
    fireRate: 1.2,
    accuracy: 0.96,
    range: 800,
    magazine: 5,
    reloadTime: 4.0,
    caliber: '7.62mm',
    velocity: 760,
    recoil: 0.55,
    recoilRecovery: 0.75,
    slots: {
      scope: true,
      muzzle: true,
      grip: false,
      stock: true,
      magazine: false
    },
    attachments: [],
    color: 0x8B4513,
    key: '9',
    origin: '德国'
  },

  // ===== 霰弹枪类 =====
  s12k: {
    id: 's12k',
    name: 'S12K',
    category: 'shotgun',
    type: 'auto',
    damage: 22,          // 每颗粒伤害
    pellets: 9,          // 颗粒数
    fireRate: 0.25,
    accuracy: 0.5,
    range: 50,
    magazine: 5,
    reloadTime: 3.0,
    caliber: '12 Gauge',
    velocity: 360,
    recoil: 0.35,
    recoilRecovery: 0.8,
    slots: {
      scope: true,
      muzzle: true,
      grip: false,
      stock: true,
      magazine: true
    },
    attachments: [],
    color: 0x4A4A4A,
    key: '0',
    origin: '俄罗斯'
  }
};

/**
 * 配件配置数据
 */
export const ATTACHMENTS = {
  // ===== 瞄具 =====
  redDot: {
    id: 'redDot',
    name: '红点瞄准镜',
    category: 'scope',
    slot: 'scope',
    magnification: 1,
    accuracyBonus: 0.05,
    adsSpeed: 0.2,       // 瞄准速度加成
    rarity: 'common'
  },
  holo: {
    id: 'holo',
    name: '全息瞄准镜',
    category: 'scope',
    slot: 'scope',
    magnification: 1,
    accuracyBonus: 0.05,
    adsSpeed: 0.18,
    rarity: 'common'
  },
  acog2x: {
    id: 'acog2x',
    name: '2倍镜',
    category: 'scope',
    slot: 'scope',
    magnification: 2,
    accuracyBonus: 0.08,
    adsSpeed: 0.15,
    rarity: 'uncommon'
  },
  acog4x: {
    id: 'acog4x',
    name: '4倍镜',
    category: 'scope',
    slot: 'scope',
    magnification: 4,
    accuracyBonus: 0.12,
    adsSpeed: 0.12,
    rarity: 'rare'
  },
  scope6x: {
    id: 'scope6x',
    name: '6倍镜',
    category: 'scope',
    slot: 'scope',
    magnification: 6,
    accuracyBonus: 0.15,
    adsSpeed: 0.1,
    rarity: 'rare'
  },
  scope8x: {
    id: 'scope8x',
    name: '8倍镜',
    category: 'scope',
    slot: 'scope',
    magnification: 8,
    accuracyBonus: 0.18,
    adsSpeed: 0.08,
    rarity: 'epic'
  },

  // ===== 枪口 =====
  suppressor: {
    id: 'suppressor',
    name: '消音器',
    category: 'muzzle',
    slot: 'muzzle',
    recoilReduction: 0.05,
    soundReduction: 0.8,
    rangePenalty: 0.05,
    rarity: 'rare'
  },
  compensator: {
    id: 'compensator',
    name: '补偿器',
    category: 'muzzle',
    slot: 'muzzle',
    recoilReduction: 0.15,
    horizontalRecoilReduction: 0.25,
    rarity: 'uncommon'
  },
  flashHider: {
    id: 'flashHider',
    name: '消焰器',
    category: 'muzzle',
    slot: 'muzzle',
    recoilReduction: 0.1,
    flashReduction: 1.0,
    rarity: 'common'
  },

  // ===== 握把 =====
  verticalGrip: {
    id: 'verticalGrip',
    name: '垂直握把',
    category: 'grip',
    slot: 'grip',
    recoilReduction: 0.15,
    adsSpeed: 0.1,
    rarity: 'common'
  },
  angledGrip: {
    id: 'angledGrip',
    name: '直角握把',
    category: 'grip',
    slot: 'grip',
    recoilReduction: 0.1,
    adsSpeed: 0.2,
    rarity: 'uncommon'
  },
  halfGrip: {
    id: 'halfGrip',
    name: '半截握把',
    category: 'grip',
    slot: 'grip',
    recoilReduction: 0.12,
    horizontalRecoilReduction: 0.15,
    rarity: 'common'
  },

  // ===== 枪托 =====
  tacticalStock: {
    id: 'tacticalStock',
    name: '战术枪托',
    category: 'stock',
    slot: 'stock',
    recoilReduction: 0.1,
    adsSpeed: 0.1,
    rarity: 'common'
  },
  sniperStock: {
    id: 'sniperStock',
    name: '狙击枪托',
    category: 'stock',
    slot: 'stock',
    recoilReduction: 0.2,
    adsSpeed: -0.05,
    rarity: 'rare'
  },

  // ===== 弹夹 =====
  extendedMag: {
    id: 'extendedMag',
    name: '扩容弹夹',
    category: 'magazine',
    slot: 'magazine',
    magazineBonus: 10,
    reloadSpeedPenalty: 0.05,
    rarity: 'uncommon'
  },
  quickDrawMag: {
    id: 'quickDrawMag',
    name: '快速弹夹',
    category: 'magazine',
    slot: 'magazine',
    reloadSpeedBonus: 0.3,
    rarity: 'uncommon'
  },
  extendedQuickMag: {
    id: 'extendedQuickMag',
    name: '扩容快速弹夹',
    category: 'magazine',
    slot: 'magazine',
    magazineBonus: 10,
    reloadSpeedBonus: 0.2,
    rarity: 'rare'
  }
};

/**
 * 弹药配置
 */
export const AMMO_TYPES = {
  '9mm': {
    name: '9mm',
    maxStack: 100,
    weight: 0.01
  },
  '5.56mm': {
    name: '5.56mm',
    maxStack: 100,
    weight: 0.012
  },
  '7.62mm': {
    name: '7.62mm',
    maxStack: 100,
    weight: 0.015
  },
  '.50 AE': {
    name: '.50 AE',
    maxStack: 50,
    weight: 0.025
  },
  '.338 Lapua': {
    name: '.338 Lapua',
    maxStack: 30,
    weight: 0.04
  },
  '12 Gauge': {
    name: '12 Gauge',
    maxStack: 30,
    weight: 0.035
  },
  '5.7mm': {
    name: '5.7mm',
    maxStack: 100,
    weight: 0.01
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

    this.config = config;
    this.id = config.id;
    this.name = config.name;
    this.category = config.category;
    this.type = config.type;

    // 基础属性
    this.damage = config.damage;
    this.fireRate = config.fireRate;
    this.accuracy = config.accuracy;
    this.range = config.range;
    this.caliber = config.caliber;
    this.velocity = config.velocity;

    // 弹药
    this.magazineSize = config.magazine;
    this.currentAmmo = config.magazine;
    this.reserveAmmo = 0;

    // 后坐力
    this.recoil = config.recoil;
    this.recoilRecovery = config.recoilRecovery;
    this.currentRecoil = 0;

    // 换弹
    this.reloadTime = config.reloadTime;
    this.isReloading = false;
    this.reloadProgress = 0;

    // 配件槽
    this.slots = { ...config.slots };
    this.attachments = {};

    // 霰弹枪颗粒数
    this.pellets = config.pellets || 1;

    // 状态
    this.canShoot = true;
    this.lastFireTime = 0;
    this.isAiming = false;
  }

  /**
   * 安装配件
   */
  attachAttachment(attachmentId) {
    const attachment = ATTACHMENTS[attachmentId];
    if (!attachment) return false;

    // 检查是否有此槽位
    if (!this.slots[attachment.slot]) return false;

    // 移除旧配件（如果有）
    if (this.attachments[attachment.slot]) {
      this.removeAttachment(attachment.slot);
    }

    // 安装新配件
    this.attachments[attachment.slot] = attachment;
    this.applyAttachmentEffects(attachment, true);

    return true;
  }

  /**
   * 移除配件
   */
  removeAttachment(slot) {
    const attachment = this.attachments[slot];
    if (!attachment) return null;

    this.applyAttachmentEffects(attachment, false);
    delete this.attachments[slot];

    return attachment;
  }

  /**
   * 应用配件效果
   */
  applyAttachmentEffects(attachment, add) {
    const multiplier = add ? 1 : -1;

    if (attachment.accuracyBonus) {
      this.accuracy = Math.min(1, this.accuracy + attachment.accuracyBonus * multiplier);
    }
    if (attachment.recoilReduction) {
      this.recoil *= (1 - attachment.recoilReduction * multiplier);
    }
    if (attachment.magazineBonus && add) {
      this.magazineSize += attachment.magazineBonus;
      this.currentAmmo = Math.min(this.currentAmmo + attachment.magazineBonus, this.magazineSize);
    } else if (attachment.magazineBonus && !add) {
      this.magazineSize -= attachment.magazineBonus;
      this.currentAmmo = Math.min(this.currentAmmo, this.magazineSize);
    }
    if (attachment.reloadSpeedBonus) {
      this.reloadTime *= (1 - attachment.reloadSpeedBonus * multiplier);
    }
  }

  /**
   * 射击
   */
  shoot() {
    if (!this.canShoot || this.isReloading || this.currentAmmo <= 0) {
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = performance.now();
    this.canShoot = false;

    // 后坐力累积
    this.currentRecoil = Math.min(1, this.currentRecoil + this.recoil);

    // 计算散布
    const spread = this.calculateSpread();

    // 设置射击冷却
    setTimeout(() => {
      this.canShoot = true;
    }, this.fireRate * 1000);

    return {
      damage: this.damage,
      pellets: this.pellets,
      spread: spread,
      range: this.range,
      velocity: this.velocity
    };
  }

  /**
   * 计算散布
   */
  calculateSpread() {
    let spread = (1 - this.accuracy) * 10; // 基础散布

    // 后坐力影响
    spread += this.currentRecoil * 2;

    // 移动惩罚
    // TODO: 检查玩家是否在移动

    // 瞄准时减少散布
    if (this.isAiming) {
      spread *= 0.5;
    }

    return spread;
  }

  /**
   * 更新后坐力恢复
   */
  update(deltaTime) {
    // 后坐力恢复
    if (this.currentRecoil > 0) {
      this.currentRecoil = Math.max(0, this.currentRecoil - this.recoilRecovery * deltaTime);
    }

    // 换弹进度
    if (this.isReloading) {
      this.reloadProgress += deltaTime;
      if (this.reloadProgress >= this.reloadTime) {
        this.finishReload();
      }
    }
  }

  /**
   * 开始换弹
   */
  startReload() {
    if (this.isReloading || this.currentAmmo >= this.magazineSize || this.reserveAmmo <= 0) {
      return false;
    }

    this.isReloading = true;
    this.reloadProgress = 0;
    return true;
  }

  /**
   * 取消换弹
   */
  cancelReload() {
    this.isReloading = false;
    this.reloadProgress = 0;
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
  addAmmo(count) {
    this.reserveAmmo += count;
  }

  /**
   * 设置瞄准状态
   */
  setAiming(aiming) {
    this.isAiming = aiming;
  }

  /**
   * 获取弹药状态
   */
  getAmmoStatus() {
    return {
      current: this.currentAmmo,
      max: this.magazineSize,
      reserve: this.reserveAmmo,
      percent: this.currentAmmo / this.magazineSize
    };
  }

  /**
   * 获取换弹进度
   */
  getReloadProgress() {
    return this.isReloading ? this.reloadProgress / this.reloadTime : 0;
  }
}