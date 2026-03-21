// Neon Target Challenge 3D - 主入口
import { GameState } from './game/state.js';
import { ScoreManager } from './game/score.js';
import { Leaderboard } from './game/leaderboard.js';
import { AudioManager } from './audio/audio.js';

// 武器配置 - 12种真实枪械
const WEAPONS = {
  // ===== 手枪类 =====
  glock17: {
    id: 'glock17',
    name: 'Glock 17',
    category: 'pistol',
    damage: 12,
    fireRate: 1.2,
    accuracy: 0.95,
    magazine: 17,
    special: '可靠稳定',
    color: 0x00FFFF,
    key: '1',
    caliber: '9mm',
    origin: '奥地利'
  },
  deagle: {
    id: 'deagle',
    name: 'Desert Eagle',
    category: 'pistol',
    damage: 25,
    fireRate: 0.6,
    accuracy: 0.85,
    magazine: 7,
    special: '高伤害',
    color: 0xFFD700,
    key: '2',
    caliber: '.50 AE',
    origin: '以色列'
  },
  revolver: {
    id: 'revolver',
    name: 'Python .357',
    category: 'pistol',
    damage: 22,
    fireRate: 0.5,
    accuracy: 0.9,
    magazine: 6,
    special: '精准致命',
    color: 0xC0C0C0,
    key: '3',
    caliber: '.357 Magnum',
    origin: '美国'
  },

  // ===== 步枪类 =====
  ak47: {
    id: 'ak47',
    name: 'AK-47',
    category: 'rifle',
    damage: 15,
    fireRate: 2.0,
    accuracy: 0.75,
    magazine: 30,
    special: '威力强大',
    color: 0xB87333,
    key: '4',
    caliber: '7.62×39mm',
    origin: '苏联'
  },
  m4a1: {
    id: 'm4a1',
    name: 'M4A1',
    category: 'rifle',
    damage: 10,
    fireRate: 2.8,
    accuracy: 0.88,
    magazine: 30,
    special: '精准连射',
    color: 0x2F4F4F,
    key: '5',
    caliber: '5.56×45mm',
    origin: '美国'
  },
  scarh: {
    id: 'scarh',
    name: 'SCAR-H',
    category: 'rifle',
    damage: 14,
    fireRate: 2.2,
    accuracy: 0.85,
    magazine: 20,
    special: '战术多能',
    color: 0x4A4A4A,
    key: '6',
    caliber: '7.62×51mm',
    origin: '比利时'
  },

  // ===== 冲锋枪类 =====
  mp5: {
    id: 'mp5',
    name: 'MP5',
    category: 'smg',
    damage: 8,
    fireRate: 3.5,
    accuracy: 0.82,
    magazine: 30,
    special: '射速极快',
    color: 0x1C1C1C,
    key: '7',
    caliber: '9mm',
    origin: '德国'
  },
  p90: {
    id: 'p90',
    name: 'P90',
    category: 'smg',
    damage: 7,
    fireRate: 3.8,
    accuracy: 0.78,
    magazine: 50,
    special: '超大弹容',
    color: 0x3D3D3D,
    key: '8',
    caliber: '5.7×28mm',
    origin: '比利时'
  },

  // ===== 狙击枪类 =====
  awp: {
    id: 'awp',
    name: 'AWP',
    category: 'sniper',
    damage: 35,
    fireRate: 0.4,
    accuracy: 1.3,
    magazine: 5,
    special: '一击必杀',
    color: 0x228B22,
    key: '9',
    caliber: '.338 Lapua',
    origin: '英国'
  },
  barrett: {
    id: 'barrett',
    name: 'Barrett M82',
    category: 'sniper',
    damage: 50,
    fireRate: 0.3,
    accuracy: 1.1,
    magazine: 10,
    special: '反器材',
    color: 0x2F2F2F,
    key: '0',
    caliber: '.50 BMG',
    origin: '美国'
  },

  // ===== 霰弹枪类 =====
  spas12: {
    id: 'spas12',
    name: 'SPAS-12',
    category: 'shotgun',
    damage: 18,
    pellets: 8,
    fireRate: 0.6,
    accuracy: 0.65,
    magazine: 8,
    special: '毁灭打击',
    color: 0x1A1A1A,
    key: '-',
    caliber: '12 Gauge',
    origin: '意大利'
  },
  aa12: {
    id: 'aa12',
    name: 'AA-12',
    category: 'shotgun',
    damage: 12,
    pellets: 6,
    fireRate: 1.5,
    accuracy: 0.55,
    magazine: 20,
    special: '全自动霰弹',
    color: 0x0D0D0D,
    key: '=',
    caliber: '12 Gauge',
    origin: '美国'
  }
};

// 武器管理器
class WeaponManager {
  constructor() {
    this.weapons = WEAPONS;
    this.currentWeapon = WEAPONS.glock17;
    this.unlockedWeapons = Object.keys(WEAPONS); // 所有武器已解锁
    this.ammo = {};
    this.maxAmmo = {};

    // 初始化弹药
    Object.values(this.weapons).forEach(w => {
      this.ammo[w.id] = w.magazine;
      this.maxAmmo[w.id] = w.magazine;
    });
  }

  switchWeapon(weaponId) {
    if (this.weapons[weaponId] && this.unlockedWeapons.includes(weaponId)) {
      this.currentWeapon = this.weapons[weaponId];
      return true;
    }
    return false;
  }

  canShoot() {
    return this.ammo[this.currentWeapon.id] > 0;
  }

  shoot() {
    if (this.canShoot()) {
      this.ammo[this.currentWeapon.id]--;
      return true;
    }
    return false;
  }

  reload() {
    this.ammo[this.currentWeapon.id] = this.maxAmmo[this.currentWeapon.id];
  }

  getAmmoPercent() {
    return this.ammo[this.currentWeapon.id] / this.maxAmmo[this.currentWeapon.id];
  }

  unlockWeapon(weaponId) {
    if (!this.unlockedWeapons.includes(weaponId)) {
      this.unlockedWeapons.push(weaponId);
      return true;
    }
    return false;
  }

  reset() {
    Object.values(this.weapons).forEach(w => {
      this.ammo[w.id] = w.magazine;
    });
    this.currentWeapon = WEAPONS.glock17;
  }
}

// 道具系统
const POWERUPS = {
  doubleScore: {
    id: 'doubleScore',
    name: '双倍得分',
    icon: '💰',
    color: 0xFFD700,
    duration: 10,
    effect: '2x分数'
  },
  slowMotion: {
    id: 'slowMotion',
    name: '慢动作',
    icon: '⏱️',
    color: 0x00FFFF,
    duration: 8,
    effect: '靶子减速50%'
  },
  rapidFire: {
    id: 'rapidFire',
    name: '快速射击',
    icon: '⚡',
    color: 0xFF00FF,
    duration: 6,
    effect: '无需换弹'
  },
  shield: {
    id: 'shield',
    name: '护盾',
    icon: '🛡️',
    color: 0x00FF00,
    duration: 15,
    effect: '不扣分'
  }
};

// 道具实体类
class PowerUp3D {
  constructor(scene, type, position) {
    this.scene = scene;
    this.type = type;
    this.config = POWERUPS[type];
    this.shouldRemove = false;
    this.spawnTime = Date.now();
    this.lifetime = 8000;
    this.collected = false;

    this.createMesh(position);
  }

  createMesh(position) {
    this.group = new THREE.Group();

    // 外发光圈
    const outerGeo = new THREE.TorusGeometry(0.5, 0.08, 8, 16);
    const outerMat = new THREE.MeshBasicMaterial({
      color: this.config.color,
      transparent: true,
      opacity: 0.8
    });
    this.outer = new THREE.Mesh(outerGeo, outerMat);
    this.group.add(this.outer);

    // 内圈
    const innerGeo = new THREE.CircleGeometry(0.35, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: this.config.color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    this.inner = new THREE.Mesh(innerGeo, innerMat);
    this.inner.position.z = 0.05;
    this.group.add(this.inner);

    // 中心光点
    const centerGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const centerMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 1
    });
    this.center = new THREE.Mesh(centerGeo, centerMat);
    this.center.position.z = 0.1;
    this.group.add(this.center);

    // 设置位置（在靶架前方）
    this.group.position.copy(position);
    this.group.position.z = -28;
    this.group.position.y = 2.5;

    this.scene.add(this.group);
  }

  update(deltaTime, slowMotion = false) {
    // 检查生命周期
    const elapsed = Date.now() - this.spawnTime;
    if (elapsed > this.lifetime) {
      this.shouldRemove = true;
      return;
    }

    // 慢动作效果
    const speedMultiplier = slowMotion ? 0.5 : 1;

    // 旋转动画
    this.outer.rotation.z += 0.03 * speedMultiplier;

    // 浮动动画
    this.group.position.y = 2.5 + Math.sin(elapsed * 0.003) * 0.3;

    // 闪烁效果（即将消失时）
    if (elapsed > this.lifetime * 0.7) {
      const flash = Math.sin(elapsed * 0.02) > 0 ? 1 : 0.3;
      this.outer.material.opacity = flash * 0.8;
    }
  }

  checkCollision(raycaster) {
    const intersects = raycaster.intersectObjects(this.group.children, true);
    return intersects.length > 0;
  }

  remove() {
    this.scene.remove(this.group);
  }
}

// 道具管理器
class PowerUpManager {
  constructor(game) {
    this.game = game;
    this.activePowerUps = {};
    this.powerUpEntities = [];
    this.spawnTimer = 0;
    this.spawnInterval = 15;
  }

  update(deltaTime) {
    // 更新激活的道具计时
    const now = Date.now();
    Object.keys(this.activePowerUps).forEach(id => {
      const powerUp = this.activePowerUps[id];
      if (now > powerUp.endTime) {
        this.deactivatePowerUp(id);
      }
    });

    // 生成道具
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval && this.powerUpEntities.length < 2) {
      this.spawnTimer = 0;
      this.spawnPowerUp();
    }

    // 更新道具实体
    const slowMotion = this.activePowerUps.slowMotion !== undefined;
    this.powerUpEntities.forEach(p => p.update(deltaTime, slowMotion));

    // 移除过期道具
    this.powerUpEntities = this.powerUpEntities.filter(p => {
      if (p.shouldRemove) {
        p.remove();
        return false;
      }
      return true;
    });
  }

  spawnPowerUp() {
    const types = Object.keys(POWERUPS);
    const type = types[Math.floor(Math.random() * types.length)];

    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      0,
      -30
    );

    const powerUp = new PowerUp3D(this.game.scene, type, position);
    this.powerUpEntities.push(powerUp);
  }

  checkCollection(raycaster) {
    for (let i = this.powerUpEntities.length - 1; i >= 0; i--) {
      const powerUp = this.powerUpEntities[i];
      if (powerUp.checkCollision(raycaster)) {
        this.collectPowerUp(powerUp);
        powerUp.remove();
        this.powerUpEntities.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  collectPowerUp(powerUp) {
    this.activatePowerUp(powerUp.type, powerUp.config.duration);
    this.game.audio.playTone(880, 'sine', 0.15, 0.5);
    setTimeout(() => this.game.audio.playTone(1100, 'sine', 0.15, 0.4), 100);
  }

  activatePowerUp(type, duration) {
    this.activePowerUps[type] = {
      endTime: Date.now() + duration * 1000,
      duration: duration
    };

    // 应用效果
    switch (type) {
      case 'rapidFire':
        // 快速射击：自动填弹
        this.game.weaponManager.ammo[this.game.weaponManager.currentWeapon.id] = 999;
        break;
    }

    this.updateUI();
  }

  deactivatePowerUp(type) {
    delete this.activePowerUps[type];

    // 移除效果
    switch (type) {
      case 'rapidFire':
        this.game.weaponManager.reload();
        break;
    }

    this.updateUI();
  }

  isActive(type) {
    return this.activePowerUps[type] !== undefined;
  }

  getRemainingTime(type) {
    if (!this.activePowerUps[type]) return 0;
    return Math.max(0, (this.activePowerUps[type].endTime - Date.now()) / 1000);
  }

  updateUI() {
    const container = document.getElementById('powerup-indicator');
    if (!container) return;

    container.innerHTML = '';

    Object.keys(this.activePowerUps).forEach(type => {
      const config = POWERUPS[type];
      const remaining = Math.ceil(this.getRemainingTime(type));

      const item = document.createElement('div');
      item.className = 'powerup-item';
      item.innerHTML = `
        <span class="icon">${config.icon}</span>
        <span class="timer">${remaining}s</span>
      `;
      container.appendChild(item);
    });
  }

  reset() {
    this.activePowerUps = {};
    this.powerUpEntities.forEach(p => p.remove());
    this.powerUpEntities = [];
    this.spawnTimer = 0;
    this.updateUI();
  }
}

// 成就系统
const ACHIEVEMENTS = {
  firstHit: {
    id: 'firstHit',
    name: '初试身手',
    desc: '首次命中靶子',
    icon: '🎯'
  },
  headshotMaster: {
    id: 'headshotMaster',
    name: '爆头大师',
    desc: '累计10次靶心命中',
    icon: '💀',
    target: 10
  },
  comboKing: {
    id: 'comboKing',
    name: '连击王者',
    desc: '达成20连击',
    icon: '🔥',
    target: 20
  },
  sharpshooter: {
    id: 'sharpshooter',
    name: '神枪手',
    desc: '命中率超过90%',
    icon: '🎖️',
    target: 90
  },
  survivor: {
    id: 'survivor',
    name: '幸存者',
    desc: '生存模式存活10波',
    icon: '🛡️',
    target: 10
  },
  speedDemon: {
    id: 'speedDemon',
    name: '速度恶魔',
    desc: '限时模式得分超过2000',
    icon: '⚡',
    target: 2000
  }
};

class AchievementManager {
  constructor(game) {
    this.game = game;
    this.unlocked = this.loadUnlocked();
    this.stats = {
      headshots: 0,
      maxCombo: 0
    };
  }

  loadUnlocked() {
    try {
      const saved = localStorage.getItem('ntc_achievements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveUnlocked() {
    try {
      localStorage.setItem('ntc_achievements', JSON.stringify(this.unlocked));
    } catch {}
  }

  checkAchievement(type, value) {
    let achievement = null;

    switch (type) {
      case 'firstHit':
        if (!this.unlocked.includes('firstHit')) {
          achievement = ACHIEVEMENTS.firstHit;
        }
        break;

      case 'headshot':
        this.stats.headshots++;
        if (this.stats.headshots >= ACHIEVEMENTS.headshotMaster.target &&
            !this.unlocked.includes('headshotMaster')) {
          achievement = ACHIEVEMENTS.headshotMaster;
        }
        break;

      case 'combo':
        if (value > this.stats.maxCombo) {
          this.stats.maxCombo = value;
        }
        if (value >= ACHIEVEMENTS.comboKing.target &&
            !this.unlocked.includes('comboKing')) {
          achievement = ACHIEVEMENTS.comboKing;
        }
        break;

      case 'accuracy':
        if (value >= ACHIEVEMENTS.sharpshooter.target &&
            !this.unlocked.includes('sharpshooter')) {
          achievement = ACHIEVEMENTS.sharpshooter;
        }
        break;

      case 'wave':
        if (value >= ACHIEVEMENTS.survivor.target &&
            !this.unlocked.includes('survivor')) {
          achievement = ACHIEVEMENTS.survivor;
        }
        break;

      case 'timedScore':
        if (value >= ACHIEVEMENTS.speedDemon.target &&
            !this.unlocked.includes('speedDemon')) {
          achievement = ACHIEVEMENTS.speedDemon;
        }
        break;
    }

    if (achievement) {
      this.unlock(achievement);
    }
  }

  unlock(achievement) {
    if (this.unlocked.includes(achievement.id)) return;

    this.unlocked.push(achievement.id);
    this.saveUnlocked();

    // 显示成就通知
    this.showNotification(achievement);

    // 播放音效
    this.game.audio.playTone(523, 'sine', 0.15, 0.4);
    setTimeout(() => this.game.audio.playTone(659, 'sine', 0.15, 0.4), 100);
    setTimeout(() => this.game.audio.playTone(784, 'sine', 0.2, 0.5), 200);
  }

  showNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <span class="icon">${achievement.icon}</span>
      <div class="content">
        <span class="title">成就解锁!</span>
        <span class="name">${achievement.name}</span>
        <span class="desc">${achievement.desc}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  reset() {
    this.stats = {
      headshots: 0,
      maxCombo: 0
    };
  }
}

// 统计数据
class GameStats {
  constructor() {
    this.reset();
  }
  reset() {
    this.totalShots = 0;
    this.totalHits = 0;
    this.maxCombo = 0;
    this.headshots = 0;
  }
  get accuracy() {
    return this.totalShots > 0 ? Math.round((this.totalHits / this.totalShots) * 100) : 0;
  }
}

// 3D靶子类 - 固定在靶架上
class Target3D {
  constructor(scene, type, parentFrame, frameXPos, options = {}) {
    this.scene = scene;
    this.parentFrame = parentFrame;  // 父靶架
    this.frameXPos = frameXPos;      // 靶架X位置
    this.type = type;
    this.targetZ = 30;  // 虚拟射击距离，用于计分
    this.hp = 1;
    this.maxHp = 1;
    this.points = 10;
    this.shouldRemove = false;
    this.spawnTime = Date.now();
    this.lifetime = 15000;
    this.hitAnimations = [];

    const configs = {
      standard: { color: 0x00FFFF, radius: 1.8, hp: 1, points: 10, speed: 0, lifetime: 15000 },
      fast: { color: 0xFFFF00, radius: 1.2, hp: 1, points: 25, speed: 0.8, lifetime: 3000 },
      armored: { color: 0xFF8800, radius: 2.2, hp: 3, points: 50, speed: 0, lifetime: 20000 },
      bonus: { color: 0xFF00FF, radius: 1.0, hp: 1, points: 100, speed: 0.5, lifetime: 2500 },
      penalty: { color: 0xFF0000, radius: 1.5, hp: 1, points: -50, speed: 0, lifetime: 12000 }
    };

    const config = configs[type] || configs.standard;
    Object.assign(this, config);

    this.createMesh();

    // 上下浮动的速度（针对快速靶和奖励靶）
    this.floatSpeed = this.speed;
    this.floatOffset = Math.random() * Math.PI * 2;
  }

  createMesh() {
    this.group = new THREE.Group();

    // 外环 - 发光效果
    const outerRingGeo = new THREE.TorusGeometry(this.radius, 0.12, 8, 32);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    this.outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    this.group.add(this.outerRing);

    // 中环
    const midRingGeo = new THREE.TorusGeometry(this.radius * 0.65, 0.1, 8, 32);
    const midRingMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    this.midRing = new THREE.Mesh(midRingGeo, midRingMat);
    this.group.add(this.midRing);

    // 内环 - 白色
    const innerRingGeo = new THREE.TorusGeometry(this.radius * 0.35, 0.08, 8, 32);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    this.innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    this.group.add(this.innerRing);

    // 靶心 - 金色
    const centerGeo = new THREE.CircleGeometry(this.radius * 0.18, 32);
    const centerMat = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide
    });
    this.center = new THREE.Mesh(centerGeo, centerMat);
    this.center.position.z = 0.05;
    this.group.add(this.center);

    // 发光背景
    const glowGeo = new THREE.CircleGeometry(this.radius * 1.3, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    this.glow = new THREE.Mesh(glowGeo, glowMat);
    this.glow.position.z = -0.1;
    this.group.add(this.glow);

    // HP指示器（重甲靶）
    if (this.maxHp > 1) {
      this.hpIndicators = [];
      for (let i = 0; i < this.maxHp; i++) {
        const hpGeo = new THREE.CircleGeometry(0.15, 16);
        const hpMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
        const hpMesh = new THREE.Mesh(hpGeo, hpMat);
        hpMesh.position.set(this.radius + 0.4 + i * 0.4, 0, 0);
        this.group.add(hpMesh);
        this.hpIndicators.push(hpMesh);
      }
    }

    // 靶子位置：相对于靶架的中心位置，高度2.5，在靶架前面0.5米
    this.baseY = 2.5;
    this.group.position.set(0, this.baseY, 0.5);  // 相对于靶架的位置

    // 将靶子添加到靶架上
    this.parentFrame.add(this.group);
  }

  update(deltaTime) {
    if (Date.now() - this.spawnTime > this.lifetime) {
      this.shouldRemove = true;
      return;
    }

    // 上下浮动（仅针对快速靶和奖励靶）
    if (this.floatSpeed > 0) {
      this.group.position.y = this.baseY + Math.sin(Date.now() * 0.003 + this.floatOffset) * this.floatSpeed;
    }

    // 旋转动画
    this.outerRing.rotation.z += 0.008;
    this.midRing.rotation.z -= 0.012;
    this.innerRing.rotation.z += 0.015;

    // 发光脉冲
    const pulse = Math.sin(Date.now() * 0.004) * 0.08 + 0.15;
    this.glow.material.opacity = pulse;
    this.hitAnimations = this.hitAnimations.filter(anim => {
      anim.progress += deltaTime * 3;
      if (anim.progress >= 1) {
        this.group.remove(anim.ring);
        return false;
      }
      if (anim.isShockwave) {
        // 冲击波扩散效果
        const scale = 1 + anim.progress * 1.5;
        anim.ring.scale.setScalar(scale);
        anim.ring.material.opacity = 0.6 * (1 - anim.progress);
      } else {
        // 普通击中环
        anim.ring.scale.setScalar(1 + anim.progress * 0.5);
        anim.ring.material.opacity = 1 - anim.progress;
      }
      return true;
    });
  }

  hit(raycaster) {
    const intersects = raycaster.intersectObjects(this.group.children, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const localPoint = this.group.worldToLocal(point.clone());
      const distance = Math.sqrt(localPoint.x ** 2 + localPoint.y ** 2);

      let points, isHeadshot;
      if (distance < this.radius * 0.18) {
        points = 10;
        isHeadshot = true;
      } else if (distance < this.radius * 0.35) {
        points = 5;
        isHeadshot = false;
      } else if (distance < this.radius * 0.65) {
        points = 5;
        isHeadshot = false;
      } else if (distance <= this.radius) {
        points = 3;
        isHeadshot = false;
      } else {
        return null;
      }

      // 击中动画
      this.createHitRing();

      this.hp--;
      if (this.hp <= 0) {
        this.shouldRemove = true;
      } else {
        this.updateHPIndicator();
      }

      return { points, isHeadshot, type: this.type, distance };
    }
    return null;
  }

  createHitRing() {
    // 主击中环
    const ringGeo = new THREE.TorusGeometry(this.radius, 0.2, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 1
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    this.group.add(ring);
    this.hitAnimations.push({ ring, progress: 0 });

    // 外圈冲击波
    const shockGeo = new THREE.RingGeometry(this.radius, this.radius + 0.3, 32);
    const shockMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const shock = new THREE.Mesh(shockGeo, shockMat);
    shock.position.z = 0.1;
    this.group.add(shock);
    this.hitAnimations.push({ ring: shock, progress: 0, isShockwave: true });
  }

  updateHPIndicator() {
    if (this.hpIndicators) {
      const remaining = this.hp;
      this.hpIndicators.forEach((indicator, i) => {
        indicator.material.color.setHex(i < remaining ? 0xFFFFFF : 0x333333);
      });
    }
  }

  remove() {
    // 从父靶架上移除靶子
    if (this.parentFrame) {
      this.parentFrame.remove(this.group);
    }
  }

  onRemove(game) {
    if (this.type === 'bonus' && game && game.levelManager) {
      game.levelManager.timeRemaining += 5;
    }
    if (this.type === 'penalty' && game && game.scoreManager) {
      game.scoreManager.resetCombo();
    }
  }
}

// 3D枪械类 - 第一人称视角
class Gun3D {
  constructor(scene, camera, weaponManager) {
    this.scene = scene;
    this.camera = camera;
    this.weaponManager = weaponManager;
    this.group = new THREE.Group();
    this.recoilAmount = 0;
    this.isRecoiling = false;
    this.swayX = 0;
    this.swayY = 0;
    this.targetSwayX = 0;
    this.targetSwayY = 0;
    this.time = 0;

    this.createGun();
    this.camera.add(this.group);
    this.scene.add(this.camera);
  }

  createGun() {
    // 清除现有模型
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }

    const weapon = this.weaponManager.currentWeapon;

    // 枪械整体偏移（第一人称视角 - 屏幕中心，更靠近相机）
    this.group.position.set(0, -0.35, -0.4);

    // 根据武器类别选择创建方法
    switch (weapon.category) {
      case 'pistol':
        this.createPistolType(weapon.id);
        break;
      case 'rifle':
        this.createRifleType(weapon.id);
        break;
      case 'smg':
        this.createSMGType(weapon.id);
        break;
      case 'sniper':
        this.createSniperType(weapon.id);
        break;
      case 'shotgun':
        this.createShotgunType(weapon.id);
        break;
      default:
        this.createPistolType('glock17');
    }
  }

  // 材质定义
  getMaterials() {
    return {
      bodyMat: new THREE.MeshBasicMaterial({ color: 0x1a1a1a }),
      accentMat: new THREE.MeshBasicMaterial({ color: 0x0d0d0d }),
      metalMat: new THREE.MeshBasicMaterial({ color: 0x3a3a3a }),
      chromeMat: new THREE.MeshBasicMaterial({ color: 0x666666 }),
      neonCyan: new THREE.MeshBasicMaterial({ color: this.weaponManager.currentWeapon.color }),
      neonPink: new THREE.MeshBasicMaterial({ color: 0xFF00FF }),
      goldMat: new THREE.MeshBasicMaterial({ color: 0xFFD700 }),
      rubberMat: new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
    };
  }

  update(deltaTime, mouseX, mouseY) {
    this.time += deltaTime;

    // 计算目标摇摆（鼠标移动）- 水平跟随更明显
    this.targetSwayX = mouseX * 0.15;
    this.targetSwayY = mouseY * 0.08;

    // 平滑过渡到目标摇摆 - 快速响应
    this.swayX += (this.targetSwayX - this.swayX) * 0.18;
    this.swayY += (this.targetSwayY - this.swayY) * 0.18;

    // 呼吸效果（轻微上下浮动）
    const breathOffset = Math.sin(this.time * 2) * 0.003;

    // 应用摇摆和呼吸 - 枪械跟随镜头水平移动
    this.group.position.x = this.swayX;
    this.group.position.y = -0.35 + this.swayY + breathOffset;
    // 水平旋转跟随镜头
    this.group.rotation.y = -this.swayX * 0.3;
    this.group.rotation.z = -this.swayX * 0.6;
    this.group.rotation.x = this.swayY * 0.4;
  }

  // 获取武器后坐力参数
  getRecoilParams() {
    const weapon = this.weaponManager.currentWeapon;
    const categoryParams = {
      pistol: { amount: 0.08, rotation: 3, recovery: 0.75 },
      rifle: { amount: 0.05, rotation: 2, recovery: 0.85 },
      smg: { amount: 0.04, rotation: 1.5, recovery: 0.9 },
      sniper: { amount: 0.2, rotation: 6, recovery: 0.65 },
      shotgun: { amount: 0.25, rotation: 8, recovery: 0.6 }
    };

    // 特定武器微调
    const weaponAdjustments = {
      deagle: { amount: 0.12, rotation: 5 },
      barrett: { amount: 0.3, rotation: 8 },
      aa12: { amount: 0.15, rotation: 5 }
    };

    let params = categoryParams[weapon.category] || categoryParams.pistol;
    const adj = weaponAdjustments[weapon.id];

    if (adj) {
      return { ...params, ...adj };
    }
    return params;
  }

  update(deltaTime, mouseX, mouseY) {
    this.time += deltaTime;

    // 计算目标摇摆（鼠标移动）- 水平跟随更明显
    this.targetSwayX = mouseX * 0.15;
    this.targetSwayY = mouseY * 0.08;

    // 平滑过渡到目标摇摆 - 快速响应
    this.swayX += (this.targetSwayX - this.swayX) * 0.18;
    this.swayY += (this.targetSwayY - this.swayY) * 0.18;

    // 呼吸效果（轻微上下浮动）
    const breathOffset = Math.sin(this.time * 2) * 0.003;

    // 应用摇摆和呼吸 - 枪械跟随镜头水平移动
    this.group.position.x = this.swayX;
    this.group.position.y = -0.35 + this.swayY + breathOffset;
    // 水平旋转跟随镜头
    this.group.rotation.y = -this.swayX * 0.3;
    this.group.rotation.z = -this.swayX * 0.6;
    this.group.rotation.x = this.swayY * 0.4;
  }

  // 手枪类型创建方法
  createPistolType(id) {
    const mat = this.getMaterials();
    const weapon = this.weaponManager.currentWeapon;

    // 基础尺寸根据武器类型调整
    const sizes = {
      glock17: { slide: 0.2, barrel: 0.06, grip: 0.09 },
      deagle: { slide: 0.24, barrel: 0.08, grip: 0.1 },
      revolver: { slide: 0.18, barrel: 0.1, grip: 0.1 }
    };
    const size = sizes[id] || sizes.glock17;

    if (id === 'revolver') {
      // 左轮手枪特殊造型
      // 转轮
      const cylinderGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.035, 16);
      const cylinder = new THREE.Mesh(cylinderGeo, mat.metalMat);
      cylinder.rotation.z = Math.PI / 2;
      cylinder.position.set(0, 0.025, -0.02);
      this.group.add(cylinder);

      // 转轮弹巢孔
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const holeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.036, 8);
        const hole = new THREE.Mesh(holeGeo, mat.accentMat);
        hole.rotation.z = Math.PI / 2;
        hole.position.set(0.018 * Math.cos(angle), 0.025 + 0.018 * Math.sin(angle), -0.02);
        this.group.add(hole);
      }

      // 枪管
      const barrelGeo = new THREE.CylinderGeometry(0.012, 0.014, size.barrel, 12);
      const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.14);
      this.group.add(barrel);

      // 枪管通风槽
      for (let i = 0; i < 4; i++) {
        const ventGeo = new THREE.BoxGeometry(0.003, 0.008, 0.015);
        const vent = new THREE.Mesh(ventGeo, mat.accentMat);
        vent.position.set(0, 0.028, -0.11 - i * 0.015);
        this.group.add(vent);
      }

      // 机匣
      const frameGeo = new THREE.BoxGeometry(0.035, 0.05, 0.12);
      const frame = new THREE.Mesh(frameGeo, mat.metalMat);
      frame.position.set(0, 0, 0.03);
      this.group.add(frame);

      // 握把 - 经典木质风格
      const gripGeo = new THREE.BoxGeometry(0.032, size.grip, 0.04);
      const gripMat = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
      const grip = new THREE.Mesh(gripGeo, gripMat);
      grip.rotation.x = -0.2;
      grip.position.set(0, -0.06, 0.06);
      this.group.add(grip);

      // 击锤
      const hammerGeo = new THREE.BoxGeometry(0.012, 0.02, 0.015);
      const hammer = new THREE.Mesh(hammerGeo, mat.chromeMat);
      hammer.position.set(0, 0.045, 0.05);
      this.group.add(hammer);

    } else if (id === 'deagle') {
      // Desert Eagle - 更大更霸气
      // 滑套
      const slideGeo = new THREE.BoxGeometry(0.05, 0.06, size.slide);
      const slide = new THREE.Mesh(slideGeo, mat.metalMat);
      slide.position.set(0, 0.025, -0.02);
      this.group.add(slide);

      // 滑套三角前端
      const slideFrontGeo = new THREE.BoxGeometry(0.045, 0.04, 0.06);
      const slideFront = new THREE.Mesh(slideFrontGeo, mat.metalMat);
      slideFront.position.set(0, 0.02, -0.14);
      this.group.add(slideFront);

      // 滑套防滑纹
      for (let i = 0; i < 10; i++) {
        const grooveGeo = new THREE.BoxGeometry(0.052, 0.003, 0.008);
        const groove = new THREE.Mesh(grooveGeo, mat.accentMat);
        groove.position.set(0, 0.055, 0.05 - i * 0.018);
        this.group.add(groove);
      }

      // 枪管 - 大口径
      const barrelGeo = new THREE.CylinderGeometry(0.016, 0.018, size.barrel, 12);
      const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.18);
      this.group.add(barrel);

      // 机匣
      const frameGeo = new THREE.BoxGeometry(0.042, 0.05, 0.14);
      const frame = new THREE.Mesh(frameGeo, mat.bodyMat);
      frame.position.set(0, -0.005, 0.03);
      this.group.add(frame);

      // 握把
      const gripGeo = new THREE.BoxGeometry(0.038, size.grip, 0.045);
      const grip = new THREE.Mesh(gripGeo, mat.rubberMat);
      grip.rotation.x = -0.15;
      grip.position.set(0, -0.065, 0.06);
      this.group.add(grip);

      // 弹匣
      const magGeo = new THREE.BoxGeometry(0.032, 0.08, 0.04);
      const mag = new THREE.Mesh(magGeo, mat.bodyMat);
      mag.position.set(0, -0.1, 0.025);
      this.group.add(mag);

    } else {
      // Glock 17 - 默认手枪
      // 滑套
      const slideGeo = new THREE.BoxGeometry(0.045, 0.055, size.slide);
      const slide = new THREE.Mesh(slideGeo, mat.metalMat);
      slide.position.set(0, 0.025, -0.02);
      this.group.add(slide);

      // 滑套顶部斜面
      const slideTopGeo = new THREE.BoxGeometry(0.04, 0.015, 0.18);
      const slideTop = new THREE.Mesh(slideTopGeo, mat.chromeMat);
      slideTop.position.set(0, 0.055, -0.02);
      this.group.add(slideTop);

      // 滑套防滑纹
      for (let i = 0; i < 8; i++) {
        const grooveGeo = new THREE.BoxGeometry(0.048, 0.002, 0.008);
        const groove = new THREE.Mesh(grooveGeo, mat.accentMat);
        groove.position.set(0, 0.05, 0.04 - i * 0.015);
        this.group.add(groove);
      }

      // 枪管
      const barrelGeo = new THREE.CylinderGeometry(0.012, 0.014, size.barrel, 12);
      const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.14);
      this.group.add(barrel);

      // 机匣/枪身
      const frameGeo = new THREE.BoxGeometry(0.038, 0.045, 0.13);
      const frame = new THREE.Mesh(frameGeo, mat.bodyMat);
      frame.position.set(0, -0.005, 0.03);
      this.group.add(frame);

      // 握把
      const gripGeo = new THREE.BoxGeometry(0.035, size.grip, 0.045);
      const grip = new THREE.Mesh(gripGeo, mat.rubberMat);
      grip.rotation.x = -0.15;
      grip.position.set(0, -0.065, 0.06);
      this.group.add(grip);

      // 握把防滑纹
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
          const textureGeo = new THREE.BoxGeometry(0.036, 0.008, 0.008);
          const texture = new THREE.Mesh(textureGeo, mat.accentMat);
          texture.position.set(0, -0.035 - i * 0.012, 0.04 + j * 0.012);
          this.group.add(texture);
        }
      }

      // 弹匣
      const magGeo = new THREE.BoxGeometry(0.028, 0.08, 0.035);
      const mag = new THREE.Mesh(magGeo, mat.bodyMat);
      mag.position.set(0, -0.1, 0.025);
      this.group.add(mag);

      // 弹匣底板
      const magBaseGeo = new THREE.BoxGeometry(0.03, 0.015, 0.037);
      const magBase = new THREE.Mesh(magBaseGeo, mat.chromeMat);
      magBase.position.set(0, -0.14, 0.025);
      this.group.add(magBase);
    }

    // 通用部件
    // 扳机护圈
    const guardGeo = new THREE.TorusGeometry(0.018, 0.003, 8, 16, Math.PI);
    const guard = new THREE.Mesh(guardGeo, mat.metalMat);
    guard.rotation.y = Math.PI / 2;
    guard.rotation.x = Math.PI;
    guard.position.set(0, -0.03, 0.04);
    this.group.add(guard);

    // 扳机
    const triggerGeo = new THREE.BoxGeometry(0.006, 0.02, 0.005);
    const trigger = new THREE.Mesh(triggerGeo, mat.metalMat);
    trigger.position.set(0, -0.035, 0.035);
    this.group.add(trigger);

    // 前准星
    const frontSightGeo = new THREE.BoxGeometry(0.008, 0.015, 0.008);
    const frontSight = new THREE.Mesh(frontSightGeo, mat.metalMat);
    frontSight.position.set(0, 0.065, -0.1);
    this.group.add(frontSight);

    // 后照门
    const rearSightGeo = new THREE.BoxGeometry(0.025, 0.012, 0.008);
    const rearSight = new THREE.Mesh(rearSightGeo, mat.metalMat);
    rearSight.position.set(0, 0.06, 0.05);
    this.group.add(rearSight);

    // 霓虹装饰线
    const lineGeo = new THREE.BoxGeometry(0.002, 0.002, 0.18);
    const neonMat = new THREE.MeshBasicMaterial({ color: weapon.color });
    const lineL = new THREE.Mesh(lineGeo, neonMat);
    lineL.position.set(-0.023, 0.025, -0.02);
    this.group.add(lineL);
    const lineR = new THREE.Mesh(lineGeo, neonMat);
    lineR.position.set(0.023, 0.025, -0.02);
    this.group.add(lineR);

    // 状态指示灯
    const indicatorGeo = new THREE.SphereGeometry(0.004, 8, 8);
    this.indicator = new THREE.Mesh(indicatorGeo, neonMat);
    this.indicator.position.set(0.018, 0.015, 0.08);
    this.group.add(this.indicator);
  }

  // 步枪类型创建方法
  createRifleType(id) {
    const mat = this.getMaterials();
    const weapon = this.weaponManager.currentWeapon;

    // 根据武器类型调整参数
    const configs = {
      ak47: {
        bodyColor: 0x2F1810,
        handguardLen: 0.2,
        barrelLen: 0.3,
        magCurve: true
      },
      m4a1: {
        bodyColor: 0x1C1C1C,
        handguardLen: 0.22,
        barrelLen: 0.25,
        magCurve: false
      },
      scarh: {
        bodyColor: 0x3D3D3D,
        handguardLen: 0.2,
        barrelLen: 0.28,
        magCurve: false
      }
    };
    const config = configs[id] || configs.m4a1;
    const bodyMat = new THREE.MeshBasicMaterial({ color: config.bodyColor });

    if (id === 'ak47') {
      // AK-47 特征：木制护木、弧形弹匣、倾斜枪口
      // 机匣
      const receiverGeo = new THREE.BoxGeometry(0.048, 0.05, 0.18);
      const receiver = new THREE.Mesh(receiverGeo, mat.metalMat);
      receiver.position.set(0, 0.025, 0.02);
      this.group.add(receiver);

      // 机匣盖
      const coverGeo = new THREE.BoxGeometry(0.042, 0.015, 0.16);
      const cover = new THREE.Mesh(coverGeo, mat.bodyMat);
      cover.position.set(0, 0.05, 0.02);
      this.group.add(cover);

      // 木制上护木
      const upperHandguardGeo = new THREE.BoxGeometry(0.035, 0.03, 0.12);
      const woodMat = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
      const upperHandguard = new THREE.Mesh(upperHandguardGeo, woodMat);
      upperHandguard.position.set(0, 0.035, -0.12);
      this.group.add(upperHandguard);

      // 木制下护木
      const lowerHandguardGeo = new THREE.BoxGeometry(0.038, 0.04, 0.15);
      const lowerHandguard = new THREE.Mesh(lowerHandguardGeo, woodMat);
      lowerHandguard.position.set(0, 0.02, -0.12);
      this.group.add(lowerHandguard);

      // 枪管
      const barrelGeo = new THREE.CylinderGeometry(0.012, 0.012, config.barrelLen, 12);
      const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.025, -0.35);
      this.group.add(barrel);

      // 准星座
      const frontSightGeo = new THREE.BoxGeometry(0.02, 0.025, 0.015);
      const frontSight = new THREE.Mesh(frontSightGeo, mat.metalMat);
      frontSight.position.set(0, 0.045, -0.35);
      this.group.add(frontSight);

      // 倾斜枪口
      const muzzleGeo = new THREE.CylinderGeometry(0.015, 0.014, 0.04, 8);
      const muzzle = new THREE.Mesh(muzzleGeo, mat.metalMat);
      muzzle.rotation.x = Math.PI / 2;
      muzzle.rotation.z = 0.3;
      muzzle.position.set(0.005, 0.025, -0.52);
      this.group.add(muzzle);

      // 弧形弹匣
      const magGeo = new THREE.BoxGeometry(0.028, 0.12, 0.04);
      const mag = new THREE.Mesh(magGeo, bodyMat);
      mag.rotation.x = -0.2;
      mag.position.set(0, -0.06, 0.02);
      this.group.add(mag);

      // 木质枪托
      const stockGeo = new THREE.BoxGeometry(0.035, 0.055, 0.2);
      const stock = new THREE.Mesh(stockGeo, woodMat);
      stock.position.set(0, 0.01, 0.18);
      this.group.add(stock);

    } else if (id === 'scarh') {
      // SCAR-H 特征：模块化、两侧导轨、伸缩枪托
      // 上机匣
      const upperGeo = new THREE.BoxGeometry(0.05, 0.05, 0.28);
      const upper = new THREE.Mesh(upperGeo, mat.metalMat);
      upper.position.set(0, 0.04, 0);
      this.group.add(upper);

      // 下机匣
      const lowerGeo = new THREE.BoxGeometry(0.045, 0.04, 0.16);
      const lower = new THREE.Mesh(lowerGeo, bodyMat);
      lower.position.set(0, 0.01, 0.05);
      this.group.add(lower);

      // 护木导轨系统
      const handguardGeo = new THREE.BoxGeometry(0.045, 0.045, config.handguardLen);
      const handguard = new THREE.Mesh(handguardGeo, bodyMat);
      handguard.position.set(0, 0.025, -0.18);
      this.group.add(handguard);

      // 四面导轨
      for (let side = 0; side < 4; side++) {
        const railGeo = new THREE.BoxGeometry(0.04, 0.01, 0.18);
        const rail = new THREE.Mesh(railGeo, mat.metalMat);
        const angle = (side * Math.PI) / 2;
        rail.position.set(
          Math.sin(angle) * 0.025,
          0.025 + Math.cos(angle) * 0.025,
          -0.18
        );
        rail.rotation.z = angle;
        this.group.add(rail);
      }

      // 枪管
      const barrelGeo = new THREE.CylinderGeometry(0.012, 0.012, config.barrelLen, 12);
      const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.025, -0.38);
      this.group.add(barrel);

      // 弹匣
      const magGeo = new THREE.BoxGeometry(0.028, 0.1, 0.035);
      const mag = new THREE.Mesh(magGeo, bodyMat);
      mag.position.set(0, -0.05, 0.02);
      this.group.add(mag);

      // 伸缩枪托
      const stockGeo = new THREE.BoxGeometry(0.035, 0.05, 0.15);
      const stock = new THREE.Mesh(stockGeo, bodyMat);
      stock.position.set(0, 0.02, 0.2);
      this.group.add(stock);

      // 枪托缓冲管
      const tubeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8);
      const tube = new THREE.Mesh(tubeGeo, mat.metalMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(0, 0.04, 0.15);
      this.group.add(tube);

    } else {
      // M4A1 - 默认步枪（使用已有的详细模型）
      this.createM4A1(mat, weapon);
      return;
    }

    // 通用步枪部件
    // 握把
    const gripGeo = new THREE.BoxGeometry(0.032, 0.08, 0.035);
    const grip = new THREE.Mesh(gripGeo, mat.rubberMat);
    grip.rotation.x = -0.25;
    grip.position.set(0, -0.04, 0.1);
    this.group.add(grip);

    // 扳机护圈
    const guardGeo = new THREE.TorusGeometry(0.02, 0.003, 8, 16, Math.PI);
    const guard = new THREE.Mesh(guardGeo, mat.metalMat);
    guard.rotation.z = Math.PI;
    guard.position.set(0, -0.02, 0.08);
    this.group.add(guard);

    // 状态指示灯
    const indicatorGeo = new THREE.SphereGeometry(0.004, 8, 8);
    const neonMat = new THREE.MeshBasicMaterial({ color: weapon.color });
    this.indicator = new THREE.Mesh(indicatorGeo, neonMat);
    this.indicator.position.set(0.02, 0.035, 0.1);
    this.group.add(this.indicator);
  }

  // M4A1 详细模型
  createM4A1(mat, weapon) {
    // 上机匣
    const upperGeo = new THREE.BoxGeometry(0.05, 0.055, 0.28);
    const upper = new THREE.Mesh(upperGeo, mat.metalMat);
    upper.position.set(0, 0.045, 0);
    this.group.add(upper);

    // 上机匣盖板
    const coverGeo = new THREE.BoxGeometry(0.045, 0.015, 0.26);
    const cover = new THREE.Mesh(coverGeo, mat.bodyMat);
    cover.position.set(0, 0.075, 0);
    this.group.add(cover);

    // 下机匣
    const lowerGeo = new THREE.BoxGeometry(0.045, 0.045, 0.18);
    const lower = new THREE.Mesh(lowerGeo, mat.bodyMat);
    lower.position.set(0, 0.01, 0.06);
    this.group.add(lower);

    // 护木
    const handguardGeo = new THREE.BoxGeometry(0.045, 0.055, 0.22);
    const handguard = new THREE.Mesh(handguardGeo, mat.bodyMat);
    handguard.position.set(0, 0.03, -0.2);
    this.group.add(handguard);

    // 护木导轨
    const railGeo = new THREE.BoxGeometry(0.025, 0.015, 0.2);
    const rail = new THREE.Mesh(railGeo, mat.metalMat);
    rail.position.set(0, 0.06, -0.2);
    this.group.add(rail);

    // 枪管
    const barrelGeo = new THREE.CylinderGeometry(0.011, 0.013, 0.25, 12);
    const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.03, -0.4);
    this.group.add(barrel);

    // 枪口制退器
    const muzzleGeo = new THREE.CylinderGeometry(0.018, 0.015, 0.05, 8);
    const muzzle = new THREE.Mesh(muzzleGeo, mat.chromeMat);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, 0.03, -0.54);
    this.group.add(muzzle);

    // 全息瞄准镜
    const scopeGeo = new THREE.BoxGeometry(0.025, 0.032, 0.05);
    const scope = new THREE.Mesh(scopeGeo, mat.bodyMat);
    scope.position.set(0, 0.09, 0.02);
    this.group.add(scope);

    // 弹匣
    const magGeo = new THREE.BoxGeometry(0.028, 0.11, 0.05);
    const mag = new THREE.Mesh(magGeo, mat.bodyMat);
    mag.position.set(0, -0.06, 0.03);
    this.group.add(mag);

    // 握把
    const gripGeo = new THREE.BoxGeometry(0.032, 0.08, 0.03);
    const grip = new THREE.Mesh(gripGeo, mat.rubberMat);
    grip.rotation.x = -0.35;
    grip.position.set(0, -0.045, 0.1);
    this.group.add(grip);

    // 枪托
    const stockGeo = new THREE.BoxGeometry(0.035, 0.055, 0.12);
    const stock = new THREE.Mesh(stockGeo, mat.bodyMat);
    stock.position.set(0, 0.02, 0.24);
    this.group.add(stock);

    // 枪托垫
    const padGeo = new THREE.BoxGeometry(0.04, 0.06, 0.02);
    const pad = new THREE.Mesh(padGeo, mat.rubberMat);
    pad.position.set(0, 0.02, 0.31);
    this.group.add(pad);

    // 霓虹装饰
    const neonMat = new THREE.MeshBasicMaterial({ color: weapon.color });
    const lineGeo = new THREE.BoxGeometry(0.002, 0.002, 0.25);
    const line = new THREE.Mesh(lineGeo, neonMat);
    line.position.set(0, 0.068, -0.18);
    this.group.add(line);

    // 状态指示灯
    const indicatorGeo = new THREE.SphereGeometry(0.004, 8, 8);
    this.indicator = new THREE.Mesh(indicatorGeo, neonMat);
    this.indicator.position.set(0.02, 0.035, 0.1);
    this.group.add(this.indicator);
  }

  // 冲锋枪类型创建方法
  createSMGType(id) {
    const mat = this.getMaterials();
    const weapon = this.weaponManager.currentWeapon;

    if (id === 'p90') {
      // P90 特征：独特外形、顶部弹匣、无托结构
      // 主机身
      const bodyGeo = new THREE.BoxGeometry(0.048, 0.07, 0.28);
      const body = new THREE.Mesh(bodyGeo, mat.bodyMat);
      body.position.set(0, 0.02, 0);
      this.group.add(body);

      // 顶部弹匣
      const magGeo = new THREE.BoxGeometry(0.04, 0.035, 0.18);
      const mag = new THREE.Mesh(magGeo, mat.metalMat);
      mag.position.set(0, 0.075, -0.02);
      this.group.add(mag);

      // 弹匣透明窗口
      const windowGeo = new THREE.BoxGeometry(0.03, 0.015, 0.12);
      const windowMat = new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.6 });
      const window = new THREE.Mesh(windowGeo, windowMat);
      window.position.set(0, 0.08, -0.02);
      this.group.add(window);

      // 枪管
      const barrelGeo = new THREE.CylinderGeometry(0.01, 0.012, 0.2, 12);
      const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.015, -0.25);
      this.group.add(barrel);

      // 握把
      const gripGeo = new THREE.BoxGeometry(0.035, 0.07, 0.03);
      const grip = new THREE.Mesh(gripGeo, mat.rubberMat);
      grip.position.set(0, -0.03, 0.12);
      this.group.add(grip);

      // 瞄准镜
      const sightGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.06, 16);
      const sight = new THREE.Mesh(sightGeo, mat.bodyMat);
      sight.rotation.x = Math.PI / 2;
      sight.position.set(0, 0.095, 0.05);
      this.group.add(sight);

    } else {
      // MP5 - 经典冲锋枪
      // 机匣
      const receiverGeo = new THREE.BoxGeometry(0.04, 0.05, 0.2);
      const receiver = new THREE.Mesh(receiverGeo, mat.metalMat);
      receiver.position.set(0, 0.025, 0);
      this.group.add(receiver);

      // 机匣盖
      const coverGeo = new THREE.BoxGeometry(0.035, 0.02, 0.18);
      const cover = new THREE.Mesh(coverGeo, mat.bodyMat);
      cover.position.set(0, 0.05, 0);
      this.group.add(cover);

      // 护木
      const handguardGeo = new THREE.BoxGeometry(0.038, 0.04, 0.15);
      const handguard = new THREE.Mesh(handguardGeo, mat.rubberMat);
      handguard.position.set(0, 0.015, -0.15);
      this.group.add(handguard);

      // 枪管
      const barrelGeo = new THREE.CylinderGeometry(0.01, 0.011, 0.18, 12);
      const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.28);
      this.group.add(barrel);

      // 弹匣
      const magGeo = new THREE.BoxGeometry(0.022, 0.12, 0.03);
      const mag = new THREE.Mesh(magGeo, mat.bodyMat);
      mag.position.set(0, -0.05, 0.02);
      this.group.add(mag);

      // 握把
      const gripGeo = new THREE.BoxGeometry(0.03, 0.07, 0.03);
      const grip = new THREE.Mesh(gripGeo, mat.rubberMat);
      grip.rotation.x = -0.2;
      grip.position.set(0, -0.04, 0.1);
      this.group.add(grip);

      // 折叠枪托
      const stockGeo = new THREE.BoxGeometry(0.025, 0.03, 0.12);
      const stock = new THREE.Mesh(stockGeo, mat.metalMat);
      stock.position.set(0, 0.03, 0.18);
      this.group.add(stock);
    }

    // 状态指示灯
    const neonMat = new THREE.MeshBasicMaterial({ color: weapon.color });
    const indicatorGeo = new THREE.SphereGeometry(0.004, 8, 8);
    this.indicator = new THREE.Mesh(indicatorGeo, neonMat);
    this.indicator.position.set(0.015, 0.03, 0.08);
    this.group.add(this.indicator);
  }

  // 狙击枪类型创建方法
  createSniperType(id) {
    const mat = this.getMaterials();
    const weapon = this.weaponManager.currentWeapon;

    if (id === 'barrett') {
      // Barrett M82 - 反器材步枪，巨大霸气
      // 主机匣
      const receiverGeo = new THREE.BoxGeometry(0.06, 0.07, 0.35);
      const receiver = new THREE.Mesh(receiverGeo, mat.metalMat);
      receiver.position.set(0, 0.03, 0);
      this.group.add(receiver);

      // 机匣盖
      const coverGeo = new THREE.BoxGeometry(0.055, 0.02, 0.32);
      const cover = new THREE.Mesh(coverGeo, mat.bodyMat);
      cover.position.set(0, 0.07, 0);
      this.group.add(cover);

      // 超长枪管
      const barrelGeo = new THREE.CylinderGeometry(0.018, 0.02, 0.55, 16);
      const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.025, -0.45);
      this.group.add(barrel);

      // 枪管加强段
      const reinforceGeo = new THREE.CylinderGeometry(0.028, 0.025, 0.2, 12);
      const reinforce = new THREE.Mesh(reinforceGeo, mat.bodyMat);
      reinforce.rotation.x = Math.PI / 2;
      reinforce.position.set(0, 0.025, -0.35);
      this.group.add(reinforce);

      // 大型制退器
      const muzzleGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.08, 12);
      const muzzle = new THREE.Mesh(muzzleGeo, mat.chromeMat);
      muzzle.rotation.x = Math.PI / 2;
      muzzle.position.set(0, 0.025, -0.75);
      this.group.add(muzzle);

      // 大型瞄准镜
      const scopeGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.25, 16);
      const scope = new THREE.Mesh(scopeGeo, mat.bodyMat);
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0, 0.09, 0.02);
      this.group.add(scope);

      // 物镜
      const objectiveGeo = new THREE.CircleGeometry(0.035, 16);
      const objectiveMat = new THREE.MeshBasicMaterial({ color: weapon.color, transparent: true, opacity: 0.5 });
      const objective = new THREE.Mesh(objectiveGeo, objectiveMat);
      objective.position.set(0, 0.09, -0.11);
      this.group.add(objective);

      // 弹匣
      const magGeo = new THREE.BoxGeometry(0.035, 0.12, 0.06);
      const mag = new THREE.Mesh(magGeo, mat.bodyMat);
      mag.position.set(0, -0.06, 0.02);
      this.group.add(mag);

      // 两脚架
      for (let i = -1; i <= 1; i += 2) {
        const legGeo = new THREE.CylinderGeometry(0.006, 0.005, 0.15, 6);
        const leg = new THREE.Mesh(legGeo, mat.metalMat);
        leg.rotation.x = 0.5;
        leg.position.set(i * 0.025, -0.04, -0.2);
        this.group.add(leg);
      }

      // 握把
      const gripGeo = new THREE.BoxGeometry(0.035, 0.08, 0.035);
      const grip = new THREE.Mesh(gripGeo, mat.rubberMat);
      grip.rotation.x = -0.2;
      grip.position.set(0, -0.045, 0.12);
      this.group.add(grip);

      // 枪托
      const stockGeo = new THREE.BoxGeometry(0.05, 0.07, 0.15);
      const stock = new THREE.Mesh(stockGeo, mat.bodyMat);
      stock.position.set(0, 0.015, 0.2);
      this.group.add(stock);

    } else {
      // AWP - 精准狙击
      // 主机匣
      const receiverGeo = new THREE.BoxGeometry(0.05, 0.055, 0.35);
      const receiver = new THREE.Mesh(receiverGeo, mat.metalMat);
      receiver.position.set(0, 0.03, -0.02);
      this.group.add(receiver);

      // 机匣盖
      const coverGeo = new THREE.BoxGeometry(0.045, 0.018, 0.32);
      const cover = new THREE.Mesh(coverGeo, mat.bodyMat);
      cover.position.set(0, 0.06, -0.02);
      this.group.add(cover);

      // 枪管
      const barrelGeo = new THREE.CylinderGeometry(0.014, 0.018, 0.55, 16);
      const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.025, -0.45);
      this.group.add(barrel);

      // 枪管加强段
      const reinforceGeo = new THREE.CylinderGeometry(0.02, 0.018, 0.15, 12);
      const reinforce = new THREE.Mesh(reinforceGeo, mat.bodyMat);
      reinforce.rotation.x = Math.PI / 2;
      reinforce.position.set(0, 0.025, -0.25);
      this.group.add(reinforce);

      // 消音器
      const suppressorGeo = new THREE.CylinderGeometry(0.028, 0.025, 0.18, 16);
      const suppressor = new THREE.Mesh(suppressorGeo, mat.bodyMat);
      suppressor.rotation.x = Math.PI / 2;
      suppressor.position.set(0, 0.025, -0.72);
      this.group.add(suppressor);

      // 高倍瞄准镜
      const scopeGeo = new THREE.CylinderGeometry(0.022, 0.025, 0.22, 16);
      const scope = new THREE.Mesh(scopeGeo, mat.bodyMat);
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0, 0.07, 0.02);
      this.group.add(scope);

      // 物镜
      const objectiveGeo = new THREE.CircleGeometry(0.03, 16);
      const objectiveMat = new THREE.MeshBasicMaterial({ color: weapon.color, transparent: true, opacity: 0.5 });
      const objective = new THREE.Mesh(objectiveGeo, objectiveMat);
      objective.position.set(0, 0.07, -0.1);
      this.group.add(objective);

      // 弹匣
      const magGeo = new THREE.BoxGeometry(0.028, 0.09, 0.05);
      const mag = new THREE.Mesh(magGeo, mat.bodyMat);
      mag.position.set(0, -0.045, 0.05);
      this.group.add(mag);

      // 握把
      const gripGeo = new THREE.BoxGeometry(0.032, 0.075, 0.035);
      const grip = new THREE.Mesh(gripGeo, mat.rubberMat);
      grip.rotation.x = -0.2;
      grip.position.set(0, -0.04, 0.12);
      this.group.add(grip);

      // 枪托
      const stockGeo = new THREE.BoxGeometry(0.045, 0.065, 0.22);
      const stock = new THREE.Mesh(stockGeo, mat.bodyMat);
      stock.position.set(0, 0.015, 0.2);
      this.group.add(stock);

      // 贴腮垫
      const cheekGeo = new THREE.BoxGeometry(0.035, 0.025, 0.08);
      const cheek = new THREE.Mesh(cheekGeo, mat.rubberMat);
      cheek.position.set(0, 0.055, 0.15);
      this.group.add(cheek);
    }

    // 状态指示灯
    const neonMat = new THREE.MeshBasicMaterial({ color: weapon.color });
    const indicatorGeo = new THREE.SphereGeometry(0.004, 8, 8);
    this.indicator = new THREE.Mesh(indicatorGeo, neonMat);
    this.indicator.position.set(0.022, 0.035, 0.12);
    this.group.add(this.indicator);
  }

  // 霰弹枪类型创建方法
  createShotgunType(id) {
    const mat = this.getMaterials();
    const weapon = this.weaponManager.currentWeapon;

    if (id === 'aa12') {
      // AA-12 全自动霰弹枪
      // 机匣
      const receiverGeo = new THREE.BoxGeometry(0.055, 0.06, 0.25);
      const receiver = new THREE.Mesh(receiverGeo, mat.metalMat);
      receiver.position.set(0, 0.025, 0.03);
      this.group.add(receiver);

      // 枪管
      const barrelGeo = new THREE.CylinderGeometry(0.02, 0.022, 0.35, 12);
      const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.025, -0.3);
      this.group.add(barrel);

      // 弹鼓
      const drumGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 16);
      const drum = new THREE.Mesh(drumGeo, mat.bodyMat);
      drum.position.set(0, -0.05, 0.03);
      this.group.add(drum);

      // 弹鼓纹路
      for (let i = 0; i < 12; i++) {
        const ribGeo = new THREE.BoxGeometry(0.052, 0.008, 0.002);
        const rib = new THREE.Mesh(ribGeo, mat.accentMat);
        rib.position.set(0, -0.02 - i * 0.006, 0.03);
        this.group.add(rib);
      }

      // 握把
      const gripGeo = new THREE.BoxGeometry(0.035, 0.08, 0.035);
      const grip = new THREE.Mesh(gripGeo, mat.rubberMat);
      grip.rotation.x = -0.15;
      grip.position.set(0, -0.04, 0.12);
      this.group.add(grip);

      // 枪托
      const stockGeo = new THREE.BoxGeometry(0.04, 0.055, 0.15);
      const stock = new THREE.Mesh(stockGeo, mat.bodyMat);
      stock.position.set(0, 0.01, 0.2);
      this.group.add(stock);

    } else {
      // SPAS-12 泵动霰弹枪
      // 机匣
      const receiverGeo = new THREE.BoxGeometry(0.055, 0.06, 0.2);
      const receiver = new THREE.Mesh(receiverGeo, mat.metalMat);
      receiver.position.set(0, 0.025, 0.05);
      this.group.add(receiver);

      // 机匣顶部
      const topGeo = new THREE.BoxGeometry(0.05, 0.02, 0.18);
      const top = new THREE.Mesh(topGeo, mat.bodyMat);
      top.position.set(0, 0.06, 0.05);
      this.group.add(top);

      // 枪管
      const barrelGeo = new THREE.CylinderGeometry(0.018, 0.02, 0.5, 12);
      const barrel = new THREE.Mesh(barrelGeo, mat.metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.025, -0.35);
      this.group.add(barrel);

      // 泵动护木
      const pumpGeo = new THREE.BoxGeometry(0.055, 0.055, 0.14);
      const pump = new THREE.Mesh(pumpGeo, mat.rubberMat);
      pump.position.set(0, 0.02, -0.22);
      this.group.add(pump);

      // 护木防滑纹
      for (let i = 0; i < 10; i++) {
        const grooveGeo = new THREE.BoxGeometry(0.058, 0.003, 0.003);
        const groove = new THREE.Mesh(grooveGeo, mat.accentMat);
        groove.position.set(0, 0.048, -0.28 + i * 0.012);
        this.group.add(groove);
      }

      // 弹仓管
      const tubeGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.4, 8);
      const tube = new THREE.Mesh(tubeGeo, mat.metalMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(0, -0.005, -0.28);
      this.group.add(tube);

      // 枪托
      const stockGeo = new THREE.BoxGeometry(0.05, 0.07, 0.22);
      const stock = new THREE.Mesh(stockGeo, mat.bodyMat);
      stock.position.set(0, 0.01, 0.2);
      this.group.add(stock);

      // 枪托垫
      const padGeo = new THREE.BoxGeometry(0.055, 0.075, 0.025);
      const pad = new THREE.Mesh(padGeo, mat.rubberMat);
      pad.position.set(0, 0.01, 0.32);
      this.group.add(pad);

      // 握把
      const gripGeo = new THREE.BoxGeometry(0.04, 0.09, 0.045);
      const grip = new THREE.Mesh(gripGeo, mat.rubberMat);
      grip.rotation.x = -0.25;
      grip.position.set(0, -0.05, 0.1);
      this.group.add(grip);

      // 钩形握把
      const hookGeo = new THREE.BoxGeometry(0.015, 0.04, 0.02);
      const hook = new THREE.Mesh(hookGeo, mat.metalMat);
      hook.position.set(0.025, -0.035, 0.15);
      this.group.add(hook);
    }

    // 状态指示灯
    const neonMat = new THREE.MeshBasicMaterial({ color: weapon.color });
    const indicatorGeo = new THREE.SphereGeometry(0.005, 8, 8);
    this.indicator = new THREE.Mesh(indicatorGeo, neonMat);
    this.indicator.position.set(0.025, 0.02, 0.1);
    this.group.add(this.indicator);
  }

  shoot() {
    if (this.isRecoiling) return;

    this.isRecoiling = true;
    const recoil = this.getRecoilParams();
    this.recoilAmount = recoil.amount;

    // 射击时指示灯变红
    if (this.indicator) {
      this.indicator.material.color.setHex(0xFF0000);
      setTimeout(() => {
        if (this.indicator) {
          this.indicator.material.color.setHex(this.weaponManager.currentWeapon.color);
        }
      }, 100);
    }

    // 后坐力动画
    const animate = () => {
      if (this.recoilAmount > 0.001) {
        this.recoilAmount *= recoil.recovery;
        // 后坐力：向后移动 + 向上抬起 + 随机左右偏移
        const randomSide = (Math.random() - 0.5) * 0.02;
        this.group.position.z = -0.4 - this.recoilAmount * 0.8;
        this.group.rotation.x = -this.recoilAmount * recoil.rotation;
        this.group.rotation.z = randomSide * this.recoilAmount * 10;
        requestAnimationFrame(animate);
      } else {
        this.group.position.z = -0.4;
        this.group.rotation.x = this.swayY * 0.4;
        this.group.rotation.z = 0;
        this.isRecoiling = false;
      }
    };
    animate();
  }

  switchWeapon(weaponId) {
    this.createGun();
  }
}

// 粒子系统
class ParticleSystem3D {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  emit(position, color, count = 15) {
    // 主粒子
    for (let i = 0; i < count; i++) {
      const size = 0.03 + Math.random() * 0.08;
      const geo = new THREE.SphereGeometry(size, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xFFFFFF : color,
        transparent: true,
        opacity: 1
      });
      const particle = new THREE.Mesh(geo, mat);

      particle.position.copy(position);
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.4;
      particle.velocity = new THREE.Vector3(
        Math.cos(angle) * speed * (0.5 + Math.random()),
        (Math.random() - 0.3) * 0.5,
        Math.sin(angle) * speed * 0.5 + Math.random() * 0.2
      );
      particle.life = 1;
      particle.decay = 1.2 + Math.random() * 0.8;

      this.scene.add(particle);
      this.particles.push(particle);
    }

    // 核心闪光
    const flashGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 1
    });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.copy(position);
    flash.isFlash = true;
    flash.life = 0.25;
    this.scene.add(flash);
    this.particles.push(flash);

    // 外发光环
    const ringGeo = new THREE.RingGeometry(0.1, 0.3, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(position);
    ring.lookAt(this.scene.children[0]?.position || new THREE.Vector3(0, 0, 1));
    ring.isRing = true;
    ring.life = 0.5;
    ring.startLife = 0.5;
    this.scene.add(ring);
    this.particles.push(ring);
  }

  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      if (p.isFlash) {
        // 闪光效果快速消失
        p.life -= deltaTime * 6;
        p.material.opacity = Math.max(0, p.life * 4);
        p.scale.multiplyScalar(1 + deltaTime * 4);
      } else if (p.isRing) {
        // 环形扩散
        p.life -= deltaTime * 2;
        const progress = 1 - (p.life / p.startLife);
        p.scale.setScalar(1 + progress * 3);
        p.material.opacity = Math.max(0, p.life * 2);
      } else {
        p.position.add(p.velocity);
        p.velocity.y -= 0.012;
        p.life -= deltaTime * (p.decay || 2);
        p.material.opacity = Math.max(0, p.life);
        p.scale.multiplyScalar(0.97);
      }

      if (p.life <= 0) {
        this.scene.remove(p);
        this.particles.splice(i, 1);
      }
    }
  }
}

// 3D游戏主类
class Game3D {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 250;  // 增加检测距离到250米
    this.mouse = new THREE.Vector2();
    this.targets = [];
    this.gun = null;
    this.particles = null;

    // 武器管理器
    this.weaponManager = new WeaponManager();

    // 靶架相关
    this.targetFrames = [];  // 存储靶架对象

    // 环境元素引用
    this.envElements = {
      rangeGround: null,
      distanceMarkers: [],
      targetScaleGroup: null
    };

    this.state = new GameState();
    this.scoreManager = new ScoreManager(this);
    this.leaderboard = new Leaderboard();
    this.audio = new AudioManager();
    this.stats = new GameStats();
    this.achievementManager = new AchievementManager(this);

    // 道具管理器
    this.powerUpManager = null; // 初始化在 initThree 之后

    // 游戏模式
    this.gameMode = 'classic'; // classic, survival, precision, timed

    this.currentLevel = 1;
    this.timeRemaining = 30;
    this.targetScore = 100;
    this.spawnTimer = 0;
    this.spawnInterval = 1.8;
    this.shootingDistance = 30;
    this.baseFOV = 70;
    this.currentFOV = 70;    // 当前FOV（用于平滑过渡）
    this.targetFOV = 70;     // 目标FOV
    this.fovNeedsUpdate = false;  // FOV是否需要更新

    // 连续射击相关
    this.isMouseDown = false;
    this.shootInterval = null;
    this.lastShootTime = 0;

    this.screens = {};
    this.lastTime = performance.now();

    this.initThree();
    this.initScreens();
    this.bindEvents();
    this.animate();
  }

  initThree() {
    // 场景 - 明亮的天蓝色背景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);

    // 相机 - 固定在玩家位置 (z=0)，看向靶架固定位置
    this.camera = new THREE.PerspectiveCamera(this.baseFOV, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 3, 0);
    this.camera.lookAt(0, 2.5, -30);  // 看向固定靶架位置（30米）

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0a0a1a);  // 深色科技风背景
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-canvas').appendChild(this.renderer.domElement);

    // 枪械
    this.gun = new Gun3D(this.scene, this.camera, this.weaponManager);

    // 粒子系统
    this.particles = new ParticleSystem3D(this.scene);

    // 道具管理器
    this.powerUpManager = new PowerUpManager(this);

    // 环境
    this.createEnvironment();

    // 初始化环境状态（立即设置FOV）
    this.updateEnvironment(this.shootingDistance, true);

    console.log('Scene initialized, background color:', this.scene.background);
  }

  createEnvironment() {
    console.log('Creating environment...');

    // ===== 地面 - 深色金属风格 =====
    const groundGeo = new THREE.PlaneGeometry(600, 400);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a12,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    this.scene.add(ground);

    // 网格地面效果
    const gridHelper = new THREE.GridHelper(200, 50, 0x00ffff, 0x002233);
    gridHelper.position.y = -1.99;
    gridHelper.position.z = -50;
    this.scene.add(gridHelper);

    // 射击场地面 - 金属质感
    const rangeGroundGeo = new THREE.PlaneGeometry(100, 100);
    const rangeGroundMat = new THREE.MeshBasicMaterial({
      color: 0x151520,
      side: THREE.DoubleSide
    });
    const rangeGround = new THREE.Mesh(rangeGroundGeo, rangeGroundMat);
    rangeGround.rotation.x = -Math.PI / 2;
    rangeGround.position.y = -1.98;
    rangeGround.position.z = -30;
    this.scene.add(rangeGround);

    // 发光射击线
    const laneGeo = new THREE.PlaneGeometry(60, 0.5);
    const laneMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    const lane = new THREE.Mesh(laneGeo, laneMat);
    lane.rotation.x = -Math.PI / 2;
    lane.position.y = -1.97;
    lane.position.z = -3;
    this.scene.add(lane);

    // ===== 霓虹天空装饰 =====
    // 大型霓虹环
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(80 + i * 30, 0.5, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x00ffff : (i === 1 ? 0xff00ff : 0xffff00),
        transparent: true,
        opacity: 0.4
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 50, -150);
      this.scene.add(ring);
    }

    // 远处的城市轮廓
    for (let i = 0; i < 30; i++) {
      const height = 20 + Math.random() * 60;
      const width = 8 + Math.random() * 15;
      const buildingGeo = new THREE.BoxGeometry(width, height, width);
      const buildingMat = new THREE.MeshBasicMaterial({
        color: 0x0a0a15,
        transparent: true,
        opacity: 0.9
      });
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.position.set(
        -200 + i * 14 + Math.random() * 5,
        height / 2 - 2,
        -180 - Math.random() * 20
      );
      this.scene.add(building);

      // 建筑窗户灯光
      for (let w = 0; w < 5; w++) {
        const windowGeo = new THREE.PlaneGeometry(1, 1.5);
        const windowMat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.3 ? 0x00ffff : 0xff00ff,
          transparent: true,
          opacity: 0.6 + Math.random() * 0.4
        });
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(
          building.position.x + (Math.random() - 0.5) * width * 0.8,
          building.position.y + (Math.random() - 0.3) * height * 0.8,
          building.position.z + width / 2 + 0.1
        );
        this.scene.add(windowMesh);
      }
    }

    // ===== 靶架 - 霓虹框架风格 =====
    this.targetFrames = [];
    const fixedTargetDistance = 30;
    for (let i = -2; i <= 2; i++) {
      const frameGroup = new THREE.Group();

      // 金属框架
      const frameMat = new THREE.MeshBasicMaterial({ color: 0x333344 });

      // 左立柱
      const leftPostGeo = new THREE.BoxGeometry(0.2, 5, 0.2);
      const leftPost = new THREE.Mesh(leftPostGeo, frameMat);
      leftPost.position.set(-1.5, 0.5, 0);
      frameGroup.add(leftPost);

      // 右立柱
      const rightPost = new THREE.Mesh(leftPostGeo, frameMat);
      rightPost.position.set(1.5, 0.5, 0);
      frameGroup.add(rightPost);

      // 横杆
      const beamGeo = new THREE.BoxGeometry(3.5, 0.2, 0.2);
      const beam = new THREE.Mesh(beamGeo, frameMat);
      beam.position.y = 3;
      frameGroup.add(beam);

      // 霓虹边框
      const neonMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
      });

      // 左霓虹线
      const leftNeonGeo = new THREE.BoxGeometry(0.05, 5, 0.05);
      const leftNeon = new THREE.Mesh(leftNeonGeo, neonMat);
      leftNeon.position.set(-1.55, 0.5, 0.1);
      frameGroup.add(leftNeon);

      // 右霓虹线
      const rightNeon = new THREE.Mesh(leftNeonGeo, neonMat);
      rightNeon.position.set(1.55, 0.5, 0.1);
      frameGroup.add(rightNeon);

      // 顶霓虹线
      const topNeonGeo = new THREE.BoxGeometry(3.2, 0.05, 0.05);
      const topNeon = new THREE.Mesh(topNeonGeo, neonMat);
      topNeon.position.y = 3.05;
      topNeon.position.z = 0.1;
      frameGroup.add(topNeon);

      frameGroup.position.set(i * 10, 0, -fixedTargetDistance);
      this.scene.add(frameGroup);
      this.targetFrames.push(frameGroup);
    }

    // ===== 侧边霓虹灯柱 =====
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 10; i++) {
        const pillarGeo = new THREE.BoxGeometry(0.3, 8, 0.3);
        const pillarMat = new THREE.MeshBasicMaterial({ color: 0x222233 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(side * 35, 2, -10 - i * 12);
        this.scene.add(pillar);

        // 霓虹灯条
        const lightGeo = new THREE.BoxGeometry(0.1, 6, 0.1);
        const lightMat = new THREE.MeshBasicMaterial({
          color: side === -1 ? 0x00ffff : 0xff00ff,
          transparent: true,
          opacity: 0.9
        });
        const light = new THREE.Mesh(lightGeo, lightMat);
        light.position.set(side * 35.2, 2.5, -10 - i * 12);
        this.scene.add(light);
      }
    }

    // ===== 距离标记 =====
    for (let dist = 15; dist <= 200; dist += 30) {
      // 距离牌
      const signGeo = new THREE.BoxGeometry(2, 1, 0.1);
      const signMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(40, 0, -dist);
      this.scene.add(sign);

      // 发光文字效果（用平面代替）
      const textBgGeo = new THREE.PlaneGeometry(1.8, 0.8);
      const textBgMat = new THREE.MeshBasicMaterial({
        color: 0x001111,
        transparent: true,
        opacity: 0.9
      });
      const textBg = new THREE.Mesh(textBgGeo, textBgMat);
      textBg.position.set(40, 0, -dist + 0.06);
      this.scene.add(textBg);
    }

    console.log('Environment created with neon theme');
  }

  // 更新环境随距离变化 - 只调整视觉，不缩放场景
  updateEnvironment(distance, immediate = false) {
    // 靶架固定在30米物理位置
    // 只通过FOV调整模拟距离感，不缩放任何物体

    // 计算目标FOV - 模拟视觉距离
    // 近距离(15m)：小FOV(35) → 靶子看起来大，视野窄
    // 远距离(200m)：大FOV(85) → 场景范围大，靶子看起来小且远
    const minFOV = 35;
    const maxFOV = 85;
    const minDist = 15;
    const distanceRatio = (distance - minDist) / (200 - minDist); // 0 到 1
    this.targetFOV = minFOV + (distanceRatio * (maxFOV - minFOV));

    if (immediate) {
      this.currentFOV = this.targetFOV;
      this.camera.fov = this.currentFOV;
      this.camera.updateProjectionMatrix();
    }
    this.fovNeedsUpdate = true;

    // 更新靶子的虚拟距离（用于计分）
    this.targets.forEach(target => {
      target.targetZ = distance;
    });

    // 更新UI显示
    const crosshairDist = document.getElementById('crosshair-distance');
    if (crosshairDist) {
      crosshairDist.textContent = `${distance}m`;
    }

    const distanceValue = document.getElementById('distance-value');
    if (distanceValue) {
      distanceValue.textContent = distance;
    }
  }

  initScreens() {
    this.screens = {
      menu: document.getElementById('menu-screen'),
      game: document.getElementById('game-screen'),
      pause: document.getElementById('pause-screen'),
      gameover: document.getElementById('gameover-screen'),
      leaderboard: document.getElementById('leaderboard-screen'),
      help: document.getElementById('help-screen'),
      mode: document.getElementById('mode-screen'),
      weapons: document.getElementById('weapons-screen'),
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    document.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // 更新准星位置
      if (this.state.is('playing')) {
        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
          crosshair.style.left = e.clientX + 'px';
          crosshair.style.top = e.clientY + 'px';
        }
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (this.state.is('playing') && e.button === 0 && !e.target.closest('button') && !e.target.closest('input')) {
        this.isMouseDown = true;
        this.shoot(); // 立即射击一次
        this.startAutoFire();
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isMouseDown = false;
        this.stopAutoFire();
      }
    });

    document.addEventListener('mouseleave', () => {
      this.isMouseDown = false;
      this.stopAutoFire();
    });

    document.addEventListener('touchstart', (e) => {
      if (this.state.is('playing') && !e.target.closest('button') && !e.target.closest('input')) {
        const touch = e.touches[0];
        this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        // 更新准星位置
        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
          crosshair.style.left = touch.clientX + 'px';
          crosshair.style.top = touch.clientY + 'px';
        }

        this.isMouseDown = true;
        this.shoot();
        this.startAutoFire();
      }
    });

    document.addEventListener('touchend', () => {
      this.isMouseDown = false;
      this.stopAutoFire();
    });

    const distanceSlider = document.getElementById('distance-slider');
    if (distanceSlider) {
      distanceSlider.addEventListener('input', (e) => {
        this.shootingDistance = parseInt(e.target.value);
        // 更新整个环境（FOV、靶架缩放、UI显示等）
        this.updateEnvironment(this.shootingDistance);
      });

      // 鼠标进入距离控件时显示正常指针
      const distanceControl = document.getElementById('distance-control');
      if (distanceControl) {
        distanceControl.addEventListener('mouseenter', () => {
          if (this.state.is('playing')) {
            document.body.style.cursor = 'auto';
            const crosshair = document.getElementById('crosshair');
            if (crosshair) crosshair.style.opacity = '0.3';
          }
        });
        distanceControl.addEventListener('mouseleave', () => {
          if (this.state.is('playing')) {
            document.body.style.cursor = 'none';
            const crosshair = document.getElementById('crosshair');
            if (crosshair) crosshair.style.opacity = '1';
          }
        });
      }
    }

    // 结束游戏按钮鼠标悬停效果
    const endGameBtn = document.getElementById('end-game-btn');
    if (endGameBtn) {
      endGameBtn.addEventListener('mouseenter', () => {
        if (this.state.is('playing')) {
          document.body.style.cursor = 'pointer';
          const crosshair = document.getElementById('crosshair');
          if (crosshair) crosshair.style.opacity = '0.3';
        }
      });
      endGameBtn.addEventListener('mouseleave', () => {
        if (this.state.is('playing')) {
          document.body.style.cursor = 'none';
          const crosshair = document.getElementById('crosshair');
          if (crosshair) crosshair.style.opacity = '1';
        }
      });
    }

    // 鼠标滚轮调整射击距离
    document.addEventListener('wheel', (e) => {
      if (!this.state.is('playing')) return;

      // 阻止默认滚动行为
      e.preventDefault();

      // 滚轮向上（deltaY < 0）增加距离，滚轮向下减少距离
      const step = 5;
      const minDist = 15;
      const maxDist = 200;

      let newDistance = this.shootingDistance;
      if (e.deltaY < 0) {
        newDistance = Math.min(maxDist, this.shootingDistance + step);
      } else {
        newDistance = Math.max(minDist, this.shootingDistance - step);
      }

      // 只有距离真正改变时才更新
      if (newDistance !== this.shootingDistance) {
        this.shootingDistance = newDistance;

        // 同步更新滑块位置
        const slider = document.getElementById('distance-slider');
        if (slider) {
          slider.value = this.shootingDistance;
        }

        // 更新环境（不立即更新FOV，由渲染循环平滑处理）
        this.updateEnvironment(this.shootingDistance);
      }
    }, { passive: false });

    document.getElementById('start-btn')?.addEventListener('click', () => {
      console.log('Start button clicked');
      this.startGame();
    });
    document.getElementById('help-btn')?.addEventListener('click', () => this.showScreen('help'));
    document.getElementById('help-back-btn')?.addEventListener('click', () => this.showScreen('menu'));
    document.getElementById('leaderboard-btn')?.addEventListener('click', () => this.showLeaderboard());
    document.getElementById('back-btn')?.addEventListener('click', () => this.showScreen('menu'));
    document.getElementById('resume-btn')?.addEventListener('click', () => this.resumeGame());
    document.getElementById('quit-btn')?.addEventListener('click', () => this.quitToMenu());
    document.getElementById('restart-btn')?.addEventListener('click', () => this.startGame());
    document.getElementById('menu-btn')?.addEventListener('click', () => this.quitToMenu());
    document.getElementById('end-game-btn')?.addEventListener('click', () => this.endGame());

    // 新按钮事件
    document.getElementById('mode-btn')?.addEventListener('click', () => this.showScreen('mode'));
    document.getElementById('mode-back-btn')?.addEventListener('click', () => this.showScreen('menu'));
    document.getElementById('weapons-btn')?.addEventListener('click', () => this.showScreen('weapons'));
    document.getElementById('weapons-back-btn')?.addEventListener('click', () => this.showScreen('menu'));

    // 模式选择卡片事件
    document.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        const mode = card.dataset.mode;
        this.selectGameMode(mode);
      });
    });

    // 武器选择卡片事件
    document.querySelectorAll('.weapon-card').forEach(card => {
      card.addEventListener('click', () => {
        const weapon = card.dataset.weapon;
        this.switchWeapon(weapon);
      });
    });

    // 游戏中武器栏点击事件
    document.querySelectorAll('.weapon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.state.is('playing')) {
          this.switchWeapon(btn.dataset.weapon);
        }
      });
    });

    // 武器导航按钮
    const prevBtn = document.getElementById('weapon-prev');
    const nextBtn = document.getElementById('weapon-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.state.is('playing')) {
          this.switchToPreviousWeapon();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.state.is('playing')) {
          this.switchToNextWeapon();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.is('playing')) {
        this.pauseGame();
      }

      // 武器切换 (数字键 1-0, - 和 =)
      if (this.state.is('playing') || this.state.is('menu')) {
        const weaponKeys = {
          '1': 'glock17', '2': 'deagle', '3': 'revolver',
          '4': 'ak47', '5': 'm4a1', '6': 'scarh',
          '7': 'mp5', '8': 'p90',
          '9': 'awp', '0': 'barrett',
          '-': 'spas12', '=': 'aa12'
        };
        if (weaponKeys[e.key]) {
          this.switchWeapon(weaponKeys[e.key]);
        }

        // Q键切换上一把武器
        if (e.key === 'q' || e.key === 'Q') {
          this.switchToPreviousWeapon();
        }
      }

      // R键换弹
      if (e.key === 'r' || e.key === 'R') {
        if (this.state.is('playing')) {
          this.reloadWeapon();
        }
      }
    });
  }

  switchWeapon(weaponId) {
    if (this.weaponManager.switchWeapon(weaponId)) {
      this.gun.switchWeapon(weaponId);
      this.updateWeaponUI();
      this.audio.playWeaponSwitch();

      // 切换武器时重置连续射击间隔
      if (this.isMouseDown && this.state.is('playing')) {
        this.stopAutoFire();
        this.startAutoFire();
      }
    }
  }

  reloadWeapon() {
    this.weaponManager.reload();
    this.updateWeaponUI();
    this.audio.playReload();
  }

  switchToNextWeapon() {
    const weaponIds = Object.keys(WEAPONS);
    const currentIndex = weaponIds.indexOf(this.weaponManager.currentWeapon.id);
    const nextIndex = (currentIndex + 1) % weaponIds.length;
    this.switchWeapon(weaponIds[nextIndex]);
  }

  switchToPreviousWeapon() {
    const weaponIds = Object.keys(WEAPONS);
    const currentIndex = weaponIds.indexOf(this.weaponManager.currentWeapon.id);
    const prevIndex = (currentIndex - 1 + weaponIds.length) % weaponIds.length;
    this.switchWeapon(weaponIds[prevIndex]);
  }

  selectGameMode(mode) {
    this.gameMode = mode;

    // 更新模式卡片选中状态
    document.querySelectorAll('.mode-card').forEach(card => {
      card.classList.remove('selected');
      if (card.dataset.mode === mode) {
        card.classList.add('selected');
      }
    });

    // 根据模式设置游戏参数
    switch (mode) {
      case 'classic':
        this.modeConfig = { time: 30, lives: -1, ammo: -1 };
        break;
      case 'survival':
        this.modeConfig = { time: -1, lives: 3, ammo: -1 };
        break;
      case 'precision':
        this.modeConfig = { time: 60, lives: -1, ammo: 50 };
        break;
      case 'timed':
        this.modeConfig = { time: 60, lives: -1, ammo: -1 };
        break;
    }

    // 开始游戏
    this.startGame();
  }

  updateWeaponUI() {
    const weapon = this.weaponManager.currentWeapon;
    const weaponDisplay = document.getElementById('weapon-name');
    const ammoDisplay = document.getElementById('ammo-count');

    if (weaponDisplay) {
      weaponDisplay.textContent = weapon.name;
    }
    if (ammoDisplay) {
      ammoDisplay.textContent = `${this.weaponManager.ammo[weapon.id]}/${weapon.magazine}`;
    }

    // 更新弹药条
    const ammoFill = document.getElementById('ammo-fill');
    if (ammoFill) {
      ammoFill.style.width = `${this.weaponManager.getAmmoPercent() * 100}%`;
    }

    // 更新游戏中当前武器按钮显示
    const currentWeaponBtn = document.getElementById('current-weapon-btn');
    if (currentWeaponBtn) {
      currentWeaponBtn.dataset.weapon = weapon.id;
      const label = currentWeaponBtn.querySelector('.weapon-label');
      const num = currentWeaponBtn.querySelector('.weapon-num');
      if (label) label.textContent = weapon.name;
      // 显示武器在列表中的位置
      const weaponIds = Object.keys(WEAPONS);
      const index = weaponIds.indexOf(weapon.id) + 1;
      if (num) num.textContent = index;
    }

    // 更新武器库卡片选中状态
    document.querySelectorAll('.weapon-card').forEach(card => {
      card.classList.remove('selected');
      if (card.dataset.weapon === weapon.id) {
        card.classList.add('selected');
      }
    });
  }

  startAutoFire() {
    if (this.shootInterval) return;

    // 根据武器射速计算射击间隔（毫秒）
    // fireRate 1.0 = 200ms间隔, fireRate 2.5 = 80ms间隔
    const baseInterval = 200;
    const interval = baseInterval / this.weaponManager.currentWeapon.fireRate;

    this.shootInterval = setInterval(() => {
      if (this.isMouseDown && this.state.is('playing')) {
        this.shoot();
      } else {
        this.stopAutoFire();
      }
    }, interval);
  }

  stopAutoFire() {
    if (this.shootInterval) {
      clearInterval(this.shootInterval);
      this.shootInterval = null;
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  showScreen(screenName) {
    Object.values(this.screens).forEach(s => s?.classList.remove('active'));
    this.screens[screenName]?.classList.add('active');

    const crosshair = document.getElementById('crosshair');
    const distanceControl = document.getElementById('distance-control');
    const ammoDisplay = document.getElementById('ammo-display');

    // 控制鼠标显示
    if (screenName === 'game') {
      document.body.classList.add('playing');
      document.body.style.cursor = 'none';  // 游戏中隐藏鼠标
      if (crosshair) {
        crosshair.style.display = 'block';
        crosshair.classList.remove('hit', 'headshot', 'miss');
        crosshair.classList.add('default');
        // 初始化准星位置到屏幕中心
        crosshair.style.left = '50%';
        crosshair.style.top = '50%';
      }
      if (distanceControl) distanceControl.style.display = 'flex';
      if (ammoDisplay) ammoDisplay.style.display = 'flex';

      // 更新准星距离显示
      const crosshairDist = document.getElementById('crosshair-distance');
      if (crosshairDist) {
        crosshairDist.textContent = `${this.shootingDistance}m`;
      }
    } else {
      document.body.classList.remove('playing');
      document.body.style.cursor = 'auto';  // 确保鼠标正常显示
      if (crosshair) crosshair.style.display = 'none';
      if (distanceControl) distanceControl.style.display = 'none';
      if (ammoDisplay) ammoDisplay.style.display = 'none';
    }
  }

  startGame() {
    console.log('startGame called');

    // 播放游戏开始音效
    this.audio.init();
    this.audio.playGameStart();

    this.state.set('playing');
    this.scoreManager.reset();
    this.stats.reset();
    this.weaponManager.reset();
    this.achievementManager.reset();
    this.gun.createGun();
    this.currentLevel = 1;
    this.spawnInterval = 1.8;

    // 根据游戏模式设置参数
    switch (this.gameMode) {
      case 'classic':
        this.timeRemaining = 30;
        this.targetScore = 100;
        this.lives = -1;
        this.totalAmmo = -1;
        break;
      case 'survival':
        this.timeRemaining = -1;
        this.targetScore = 0;
        this.lives = 3;
        this.totalAmmo = -1;
        this.wave = 1;
        break;
      case 'precision':
        this.timeRemaining = 60;
        this.targetScore = 0;
        this.lives = -1;
        this.totalAmmo = 50;
        break;
      case 'timed':
        this.timeRemaining = 60;
        this.targetScore = 0;
        this.lives = -1;
        this.totalAmmo = -1;
        break;
    }

    this.targets.forEach(t => t.remove());
    this.targets = [];

    // 重置道具管理器
    this.powerUpManager.reset();

    // 初始化环境状态（立即设置）
    this.updateEnvironment(this.shootingDistance, true);
    this.updateWeaponUI();
    this.updateModeUI();

    this.showScreen('game');
    this.audio.init();
    this.audio.startBGM();
    console.log('Game started successfully');
  }

  updateModeUI() {
    // 更新HUD显示模式特定信息
    const timeLabel = document.querySelector('.hud-item:nth-child(3) .hud-label');
    const timeDisplay = document.getElementById('time-display');

    if (this.gameMode === 'survival') {
      if (timeLabel) timeLabel.textContent = '生命';
      if (timeDisplay) timeDisplay.textContent = '❤️'.repeat(this.lives);
    } else if (this.gameMode === 'precision') {
      if (timeLabel) timeLabel.textContent = '弹药';
      if (timeDisplay) timeDisplay.textContent = this.totalAmmo;
    } else {
      if (timeLabel) timeLabel.textContent = '时间';
    }
  }

  pauseGame() {
    this.stopAutoFire();
    this.isMouseDown = false;
    this.state.set('paused');
    this.showScreen('pause');
  }

  resumeGame() {
    this.state.set('playing');
    this.showScreen('game');
  }

  quitToMenu() {
    this.stopAutoFire();
    this.isMouseDown = false;
    this.state.set('menu');
    this.targets.forEach(t => t.remove());
    this.targets = [];
    this.showScreen('menu');
    this.audio.stopBGM();
  }

  endGame() {
    this.gameOver();
  }

  gameOver() {
    this.stopAutoFire();
    this.isMouseDown = false;
    this.state.set('gameover');

    const finalScore = this.scoreManager.getScore();
    document.getElementById('final-score').textContent = finalScore;
    document.getElementById('final-level').textContent = this.currentLevel;
    document.getElementById('final-combo').textContent = this.stats.maxCombo;
    document.getElementById('final-accuracy').textContent = `${this.stats.accuracy}%`;

    // 检查成就
    this.achievementManager.checkAchievement('accuracy', this.stats.accuracy);
    if (this.gameMode === 'survival') {
      this.achievementManager.checkAchievement('wave', this.wave || this.currentLevel);
    }
    if (this.gameMode === 'timed') {
      this.achievementManager.checkAchievement('timedScore', finalScore);
    }

    this.leaderboard.saveScore({
      score: finalScore,
      level: this.currentLevel,
      mode: this.gameMode,
      date: new Date().toISOString().split('T')[0]
    });

    this.showScreen('gameover');
    this.audio.stopBGM();
    this.audio.playGameOver();
  }

  showLeaderboard() {
    const scores = this.leaderboard.getScores();
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = scores.length === 0
      ? '<div style="color: #888; padding: 30px; text-align: center;">暂无记录<br><br>开始游戏创造你的成绩吧！</div>'
      : scores.map((s, i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:15px;margin:5px 0;background:rgba(0,255,255,0.05);border-radius:8px;border-left:3px solid ${i === 0 ? '#FFD700' : '#00FFFF'};">
            <span style="font-size:24px;color:${i === 0 ? '#FFD700' : '#FFF'}">#${i + 1}</span>
            <div style="text-align:right">
              <div style="font-size:22px;color:#00FFFF">${s.score}分</div>
              <div style="font-size:12px;color:#888">关卡${s.level} · ${s.date}</div>
            </div>
          </div>
        `).join('');
    this.showScreen('leaderboard');
  }

  shoot() {
    // 检查弹药（快速射击道具除外）
    if (!this.powerUpManager.isActive('rapidFire') && !this.weaponManager.canShoot()) {
      this.audio.playEmpty();
      return;
    }

    // 精准模式检查总弹药
    if (this.gameMode === 'precision' && this.totalAmmo <= 0) {
      this.audio.playEmpty();
      return;
    }

    this.weaponManager.shoot();
    this.stats.totalShots++;

    // 播放武器特定射击音效
    this.audio.playShoot(this.weaponManager.currentWeapon.id);

    // 精准模式扣除总弹药
    if (this.gameMode === 'precision') {
      this.totalAmmo--;
      this.updateModeUI();
    }

    this.gun.shoot();
    this.updateWeaponUI();

    // 屏幕震动 - 根据武器类型
    this.addScreenShake(this.getShakeIntensity());

    // 枪口闪光 - 根据武器类型显示不同效果
    const muzzle = document.getElementById('muzzle-flash');
    const weaponId = this.weaponManager.currentWeapon.id;
    muzzle.className = weaponId; // 应用武器特定的闪光类
    void muzzle.offsetWidth; // 强制重排
    muzzle.classList.add('active');

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 检查道具收集
    if (this.powerUpManager.checkCollection(this.raycaster)) {
      // 道具已收集，显示提示
    }

    // 霰弹枪多发弹丸
    const pellets = this.weaponManager.currentWeapon.pellets || 1;
    const accuracy = this.weaponManager.currentWeapon.accuracy;

    let hitTarget = null;
    let hitResult = null;
    let totalPoints = 0;
    let headshotCount = 0;

    for (let p = 0; p < pellets; p++) {
      // 精准度偏移
      const offset = (1 - accuracy) * 0.1;
      const offsetX = (Math.random() - 0.5) * offset;
      const offsetY = (Math.random() - 0.5) * offset;

      const testMouse = new THREE.Vector2(
        this.mouse.x + offsetX,
        this.mouse.y + offsetY
      );

      this.raycaster.setFromCamera(testMouse, this.camera);

      for (let i = this.targets.length - 1; i >= 0; i--) {
        const target = this.targets[i];
        const result = target.hit(this.raycaster);

        if (result) {
          hitTarget = target;
          hitResult = result;

          // 应用武器伤害
          const weaponDamage = this.weaponManager.currentWeapon.damage;
          const damageMultiplier = weaponDamage / 10;

          // 距离加成（每30米加1分）
          const distanceBonus = Math.floor(this.shootingDistance / 30);
          let basePoints = Math.round((result.points + distanceBonus) * damageMultiplier);

          // 双倍得分道具
          if (this.powerUpManager.isActive('doubleScore')) {
            basePoints *= 2;
          }

          totalPoints += basePoints;
          if (result.isHeadshot) headshotCount++;

          if (hitTarget.shouldRemove) {
            hitTarget.onRemove(this);
            hitTarget.remove();
            const idx = this.targets.indexOf(hitTarget);
            if (idx > -1) this.targets.splice(idx, 1);
          }
          break;
        }
      }
    }

    if (totalPoints > 0) {
      this.stats.totalHits++;
      if (headshotCount > 0) this.stats.headshots++;

      const isHeadshot = headshotCount > 0;
      const finalPoints = this.scoreManager.addScore(totalPoints, isHeadshot);

      // 检查成就
      this.achievementManager.checkAchievement('firstHit');
      if (isHeadshot) {
        this.achievementManager.checkAchievement('headshot');
      }
      this.achievementManager.checkAchievement('combo', this.scoreManager.getCombo());

      // 更新最大连击
      if (this.scoreManager.getCombo() > this.stats.maxCombo) {
        this.stats.maxCombo = this.scoreManager.getCombo();
      }

      // 粒子效果
      const hitPoint = new THREE.Vector3();
      const fixedTargetDistance = 30;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      this.raycaster.ray.at(fixedTargetDistance, hitPoint);
      hitPoint.z = -fixedTargetDistance;
      this.particles.emit(hitPoint, hitTarget?.color || 0x00FFFF, isHeadshot ? 30 : 18);

      // 音效
      this.audio.playHit();

      // UI反馈
      this.showHitIndicator(isHeadshot);
      this.showScorePopup(finalPoints, isHeadshot);

      // 准星效果
      const crosshair = document.getElementById('crosshair');
      crosshair.classList.remove('default', 'aiming', 'miss');
      crosshair.classList.add('hit');
      if (isHeadshot) {
        crosshair.classList.add('headshot');
        this.addScreenShake();
        this.addHitFlash('#FFD700');
      } else {
        this.addHitFlash('#00FFFF');
      }
      setTimeout(() => {
        crosshair.classList.remove('hit', 'headshot');
        crosshair.classList.add('default');
      }, 200);
    } else {
      // 未命中
      const crosshair = document.getElementById('crosshair');
      crosshair.classList.remove('default', 'aiming');
      crosshair.classList.add('miss');
      this.audio.playTone(150, 'square', 0.08, 0.15);
      setTimeout(() => {
        crosshair.classList.remove('miss');
        crosshair.classList.add('default');
      }, 150);
    }

    // 弹药条动画
    const ammoFill = document.getElementById('ammo-fill');
    ammoFill.style.width = '30%';
    setTimeout(() => {
      this.updateWeaponUI();
    }, 100);
  }

  showHitIndicator(isHeadshot) {
    const hitText = document.getElementById('hit-text');
    const combo = this.scoreManager.getCombo();

    let text = isHeadshot ? '🎯 靶心!' : '✓ 命中';

    // 连击提示
    if (combo >= 5 && combo % 5 === 0) {
      text = `🔥 ${combo}连击!`;
    }

    hitText.textContent = text;
    hitText.className = 'show' + (isHeadshot ? ' headshot' : '');

    setTimeout(() => {
      hitText.classList.remove('show');
    }, 600);
  }

  showScorePopup(points, isBonus) {
    const popup = document.getElementById('score-popup');
    const crosshair = document.getElementById('crosshair');
    const item = document.createElement('div');
    item.className = 'score-popup-item' + (isBonus ? ' bonus' : (points < 0 ? ' penalty' : ''));
    item.textContent = (points > 0 ? '+' : '') + points;

    // 获取准星位置
    if (crosshair) {
      const rect = crosshair.getBoundingClientRect();
      item.style.left = rect.left + rect.width / 2 + 'px';
      item.style.top = rect.top + 'px';
    } else {
      item.style.left = '50%';
      item.style.top = '45%';
    }

    popup.appendChild(item);
    setTimeout(() => item.remove(), 1200);
  }

  addScreenShake(intensity = 1) {
    const container = document.getElementById('game-container');

    // 根据强度添加不同的震动类
    const shakeClasses = ['screen-shake', 'screen-shake-light', 'screen-shake-heavy'];

    // 移除所有震动类
    shakeClasses.forEach(cls => container.classList.remove(cls));

    // 根据强度选择震动效果
    let shakeClass = 'screen-shake';
    let duration = 150;

    if (intensity >= 2) {
      shakeClass = 'screen-shake-heavy';
      duration = 200;
    } else if (intensity <= 0.5) {
      shakeClass = 'screen-shake-light';
      duration = 80;
    }

    container.classList.add(shakeClass);
    setTimeout(() => {
      container.classList.remove(shakeClass);
    }, duration);
  }

  // 根据武器获取震动强度
  getShakeIntensity() {
    const weapon = this.weaponManager.currentWeapon;
    const intensities = {
      pistol: 0.5,
      rifle: 0.8,
      sniper: 2.0,
      shotgun: 2.5
    };
    return intensities[weapon.id] || 1;
  }

  addHitFlash(color) {
    const container = document.getElementById('game-container');
    const flash = document.createElement('div');
    flash.className = 'hit-flash-overlay';
    // 使用rgba格式
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    flash.style.background = `radial-gradient(circle at 50% 50%, rgba(${r},${g},${b},0.4) 0%, transparent 60%)`;
    container.appendChild(flash);
    setTimeout(() => flash.remove(), 200);
  }

  spawnTarget() {
    const weights = {
      1: { standard: 100 },
      2: { standard: 75, fast: 25 },
      3: { standard: 60, fast: 25, bonus: 10, armored: 5 },
      4: { standard: 50, fast: 25, armored: 15, bonus: 5, penalty: 5 },
      5: { standard: 40, fast: 25, armored: 20, bonus: 10, penalty: 5 }
    };

    const levelWeights = weights[Math.min(this.currentLevel, 5)];
    const rand = Math.random() * 100;
    let cumulative = 0;
    let type = 'standard';

    for (const [t, w] of Object.entries(levelWeights)) {
      cumulative += w;
      if (rand < cumulative) {
        type = t;
        break;
      }
    }

    // 随机选择一个靶架
    const frameIndex = Math.floor(Math.random() * this.targetFrames.length);
    const selectedFrame = this.targetFrames[frameIndex];
    const frameXPos = [-20, -10, 0, 10, 20][frameIndex];

    // 创建靶子，挂载到选中的靶架上
    const target = new Target3D(this.scene, type, selectedFrame, frameXPos);
    target.targetZ = this.shootingDistance;  // 虚拟距离用于计分

    this.targets.push(target);
    this.audio.playSpawn();
  }

  update(deltaTime) {
    // 更新粒子
    this.particles.update(deltaTime);

    // 平滑过渡FOV（在渲染循环中更新，避免抖动）
    if (this.fovNeedsUpdate && Math.abs(this.currentFOV - this.targetFOV) > 0.05) {
      this.currentFOV += (this.targetFOV - this.currentFOV) * 0.08;
      this.camera.fov = this.currentFOV;
      this.camera.updateProjectionMatrix();
    } else if (this.fovNeedsUpdate) {
      this.currentFOV = this.targetFOV;
      this.camera.fov = this.currentFOV;
      this.camera.updateProjectionMatrix();
      this.fovNeedsUpdate = false;
    }

    // 更新枪械（摇摆和呼吸效果）- 即使不在游戏中也要更新
    if (this.gun) {
      this.gun.update(deltaTime, this.mouse.x, this.mouse.y);
    }

    if (!this.state.is('playing')) return;

    // 更新道具管理器
    this.powerUpManager.update(deltaTime);

    // 根据游戏模式更新
    switch (this.gameMode) {
      case 'classic':
        this.updateClassicMode(deltaTime);
        break;
      case 'survival':
        this.updateSurvivalMode(deltaTime);
        break;
      case 'precision':
        this.updatePrecisionMode(deltaTime);
        break;
      case 'timed':
        this.updateTimedMode(deltaTime);
        break;
    }

    // 更新靶子
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      target.update(deltaTime);

      if (target.shouldRemove) {
        target.remove();
        this.targets.splice(i, 1);
      }
    }

    // 更新HUD
    document.getElementById('score-display').textContent = this.scoreManager.getScore();
    document.getElementById('level-display').textContent = this.currentLevel;

    const combo = this.scoreManager.getCombo();
    const comboEl = document.getElementById('combo-display');
    comboEl.textContent = combo >= 5 ? `${combo}x COMBO` : '';
  }

  updateClassicMode(deltaTime) {
    this.timeRemaining -= deltaTime;
    if (this.timeRemaining <= 0) {
      this.checkLevelComplete();
      return;
    }

    document.getElementById('time-display').textContent = Math.ceil(this.timeRemaining);

    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnTarget();
    }
  }

  updateSurvivalMode(deltaTime) {
    // 生存模式：无限波次
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnTarget();
    }

    // 检查波次完成
    if (this.targets.length === 0 && this.spawnTimer < 0.5) {
      this.wave++;
      this.spawnInterval = Math.max(0.3, 1.5 - this.wave * 0.1);
      this.currentLevel = this.wave;

      // 波次奖励
      this.scoreManager.addScore(this.wave * 50, false);
      this.audio.playLevelUp();
    }

    // 更新生命显示
    document.getElementById('time-display').textContent = '❤️'.repeat(Math.max(0, this.lives));
  }

  updatePrecisionMode(deltaTime) {
    this.timeRemaining -= deltaTime;
    if (this.timeRemaining <= 0) {
      this.gameOver();
      return;
    }

    // 检查弹药
    if (this.totalAmmo <= 0 && !this.weaponManager.canShoot()) {
      this.gameOver();
      return;
    }

    document.getElementById('time-display').textContent = this.totalAmmo;

    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnTarget();
    }
  }

  updateTimedMode(deltaTime) {
    this.timeRemaining -= deltaTime;
    if (this.timeRemaining <= 0) {
      this.gameOver();
      return;
    }

    document.getElementById('time-display').textContent = Math.ceil(this.timeRemaining);

    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnTarget();
    }
  }

  checkLevelComplete() {
    if (this.gameMode !== 'classic') {
      this.gameOver();
      return;
    }

    if (this.scoreManager.getScore() >= this.targetScore) {
      this.currentLevel++;
      this.timeRemaining = 30 + this.currentLevel * 5;
      this.targetScore = this.currentLevel * 120;
      this.spawnInterval = Math.max(0.6, 1.8 - this.currentLevel * 0.15);
      this.audio.playLevelUp();

      // 清除现有靶子
      this.targets.forEach(t => t.remove());
      this.targets = [];
    } else {
      this.gameOver();
    }
  }

  // 生存模式失去生命
  loseLife() {
    if (this.gameMode === 'survival') {
      this.lives--;
      this.updateModeUI();
      if (this.lives <= 0) {
        this.gameOver();
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.update(deltaTime);
    this.renderer.render(this.scene, this.camera);
  }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded, initializing game...');
  try {
    console.log('Creating Game3D instance...');
    window.game = new Game3D();
    console.log('🎮 3D射击场初始化成功！');
    console.log('Game state:', window.game.state.current);
    console.log('Screens:', Object.keys(window.game.screens));
  } catch (error) {
    console.error('游戏初始化失败:', error);
    console.error('Stack trace:', error.stack);
    alert('游戏加载失败，请刷新页面重试。\n错误: ' + error.message);
  }
});