/**
 * 投掷物系统
 * 处理手雷、烟雾弹等投掷物
 */
export const PROJECTILE_TYPES = {
  fragGrenade: {
    id: 'fragGrenade',
    name: '手雷',
    type: 'explosive',
    damage: 100,
    radius: 8,          // 爆炸半径(米)
    fuseTime: 3,        // 引信时间(秒)
    throwForce: 25,     // 投掷力度
    weight: 0.4,
    maxStack: 3
  },
  smokeGrenade: {
    id: 'smokeGrenade',
    name: '烟雾弹',
    type: 'smoke',
    radius: 10,
    duration: 20,       // 烟雾持续时间(秒)
    fuseTime: 2,
    throwForce: 22,
    weight: 0.4,
    maxStack: 3
  },
  stunGrenade: {
    id: 'stunGrenade',
    name: '震撼弹',
    type: 'stun',
    damage: 10,
    radius: 10,
    stunDuration: 3,    // 眩晕时间(秒)
    fuseTime: 2,
    throwForce: 20,
    weight: 0.3,
    maxStack: 4
  },
  molotov: {
    id: 'molotov',
    name: '燃烧瓶',
    type: 'fire',
    damage: 15,         // 每秒伤害
    radius: 5,
    duration: 10,
    fuseTime: 0,        // 碰撞即爆
    throwForce: 18,
    weight: 0.5,
    maxStack: 2
  }
};

/**
 * 投掷物类
 */
export class Projectile {
  constructor(type, owner) {
    const config = PROJECTILE_TYPES[type];
    if (!config) {
      throw new Error(`Unknown projectile type: ${type}`);
    }

    this.config = config;
    this.id = config.id;
    this.type = config.type;
    this.owner = owner;

    // 创建模型
    this.object3D = this.createModel();

    // 物理状态
    this.velocity = new THREE.Vector3();
    this.angularVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );

    // 引信
    this.fuseTime = config.fuseTime;
    this.fuseActive = false;
    this.hasExploded = false;

    // 状态
    this.active = true;
    this.grounded = false;

    // 烟雾效果
    this.smokeEffect = null;
  }

  /**
   * 创建投掷物模型
   */
  createModel() {
    const group = new THREE.Group();

    switch (this.type) {
      case 'explosive':
        // 手雷形状
        const bodyGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x2F4F4F,
          roughness: 0.8,
          metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // 安全销
        const pinGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.08, 4);
        const pinMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.set(0.04, 0.05, 0);
        pin.rotation.z = Math.PI / 2;
        group.add(pin);
        break;

      case 'smoke':
        // 烟雾弹形状
        const canGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8);
        const canMat = new THREE.MeshStandardMaterial({
          color: 0x8B0000,
          roughness: 0.6,
          metalness: 0.4
        });
        const can = new THREE.Mesh(canGeo, canMat);
        group.add(can);
        break;

      case 'stun':
        // 震撼弹形状
        const stunGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.1, 8);
        const stunMat = new THREE.MeshStandardMaterial({
          color: 0x4169E1,
          roughness: 0.5,
          metalness: 0.5
        });
        const stun = new THREE.Mesh(stunGeo, stunMat);
        group.add(stun);
        break;

      case 'fire':
        // 燃烧瓶形状
        const bottleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.1, 6);
        const bottleMat = new THREE.MeshStandardMaterial({
          color: 0x228B22,
          transparent: true,
          opacity: 0.6,
          roughness: 0.1
        });
        const bottle = new THREE.Mesh(bottleGeo, bottleMat);
        group.add(bottle);

        // 瓶口
        const neckGeo = new THREE.CylinderGeometry(0.01, 0.015, 0.03, 6);
        const neckMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const neck = new THREE.Mesh(neckGeo, neckMat);
        neck.position.y = 0.06;
        group.add(neck);
        break;
    }

    return group;
  }

  /**
   * 投掷
   */
  throw(direction, force) {
    const throwForce = force || this.config.throwForce;
    this.velocity.copy(direction).multiplyScalar(throwForce);
    this.fuseActive = true;
  }

  /**
   * 更新投掷物
   */
  update(deltaTime, world) {
    if (!this.active) return;

    // 更新引信
    if (this.fuseActive) {
      this.fuseTime -= deltaTime;
      if (this.fuseTime <= 0 && !this.hasExploded) {
        this.explode(world);
        return;
      }
    }

    // 物理更新
    if (!this.grounded) {
      // 重力
      this.velocity.y -= 15 * deltaTime;

      // 空气阻力
      this.velocity.multiplyScalar(0.99);

      // 更新位置
      this.object3D.position.addScaledVector(this.velocity, deltaTime);

      // 旋转
      this.object3D.rotation.x += this.angularVelocity.x * deltaTime;
      this.object3D.rotation.y += this.angularVelocity.y * deltaTime;
      this.object3D.rotation.z += this.angularVelocity.z * deltaTime;

      // 地面碰撞
      const groundHeight = world.getHeightAt(
        this.object3D.position.x,
        this.object3D.position.z
      );

      if (this.object3D.position.y <= groundHeight + 0.05) {
        this.object3D.position.y = groundHeight + 0.05;
        this.grounded = true;

        // 燃烧瓶碰撞即爆
        if (this.type === 'fire' && !this.hasExploded) {
          this.explode(world);
          return;
        }

        // 减少旋转
        this.angularVelocity.multiplyScalar(0.5);
      }
    }
  }

  /**
   * 爆炸
   */
  explode(world) {
    if (this.hasExploded) return;

    this.hasExploded = true;

    switch (this.type) {
      case 'explosive':
        this.explodeFrag(world);
        break;
      case 'smoke':
        this.createSmoke(world);
        break;
      case 'stun':
        this.explodeStun(world);
        break;
      case 'fire':
        this.createFire(world);
        break;
    }
  }

  /**
   * 手雷爆炸
   */
  explodeFrag(world) {
    const pos = this.object3D.position.clone();

    // 创建爆炸效果
    const explosion = this.createExplosionEffect(pos);
    world.scene.add(explosion);

    // 伤害计算
    const players = world.getPlayersInRadius(pos, this.config.radius);
    players.forEach(player => {
      const distance = player.position.distanceTo(pos);
      const damageFactor = 1 - (distance / this.config.radius);
      const damage = this.config.damage * damageFactor;

      player.takeDamage(Math.floor(damage));
    });

    // 播放音效
    // TODO: 爆炸音效

    // 移除投掷物
    this.active = false;
    if (this.object3D.parent) {
      this.object3D.parent.remove(this.object3D);
    }
  }

  /**
   * 创建烟雾
   */
  createSmoke(world) {
    const pos = this.object3D.position.clone();

    // 创建烟雾粒子系统
    const smokeGroup = new THREE.Group();
    smokeGroup.position.copy(pos);

    for (let i = 0; i < 50; i++) {
      const size = 1 + Math.random() * 2;
      const geometry = new THREE.SphereGeometry(size, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.3
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(
        (Math.random() - 0.5) * this.config.radius,
        Math.random() * 5,
        (Math.random() - 0.5) * this.config.radius
      );
      smokeGroup.add(particle);
    }

    world.scene.add(smokeGroup);
    this.smokeEffect = smokeGroup;

    // 设置定时器移除烟雾
    setTimeout(() => {
      world.scene.remove(smokeGroup);
      this.active = false;
      if (this.object3D.parent) {
        this.object3D.parent.remove(this.object3D);
      }
    }, this.config.duration * 1000);
  }

  /**
   * 震撼弹爆炸
   */
  explodeStun(world) {
    const pos = this.object3D.position.clone();

    // 闪光效果
    const flash = new THREE.PointLight(0xffffff, 10, this.config.radius * 2);
    flash.position.copy(pos);
    world.scene.add(flash);

    setTimeout(() => {
      world.scene.remove(flash);
    }, 200);

    // 眩晕玩家
    const players = world.getPlayersInRadius(pos, this.config.radius);
    players.forEach(player => {
      const distance = player.position.distanceTo(pos);
      if (distance < this.config.radius) {
        // TODO: 实现眩晕效果
      }
    });

    this.active = false;
    if (this.object3D.parent) {
      this.object3D.parent.remove(this.object3D);
    }
  }

  /**
   * 创建火焰
   */
  createFire(world) {
    const pos = this.object3D.position.clone();

    // 创建火焰区域
    const fireArea = {
      position: pos,
      radius: this.config.radius,
      damage: this.config.damage,
      duration: this.config.duration,
      startTime: Date.now()
    };

    world.fireAreas.push(fireArea);

    // 创建火焰视觉效果
    const fireGroup = new THREE.Group();
    fireGroup.position.copy(pos);

    for (let i = 0; i < 20; i++) {
      const size = 0.5 + Math.random();
      const geometry = new THREE.ConeGeometry(size, size * 2, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.8
      });

      const flame = new THREE.Mesh(geometry, material);
      flame.position.set(
        (Math.random() - 0.5) * this.config.radius,
        size,
        (Math.random() - 0.5) * this.config.radius
      );
      fireGroup.add(flame);
    }

    world.scene.add(fireGroup);

    // 设置定时器移除火焰
    setTimeout(() => {
      const index = world.fireAreas.indexOf(fireArea);
      if (index > -1) world.fireAreas.splice(index, 1);
      world.scene.remove(fireGroup);
    }, this.config.duration * 1000);

    this.active = false;
    if (this.object3D.parent) {
      this.object3D.parent.remove(this.object3D);
    }
  }

  /**
   * 创建爆炸效果
   */
  createExplosionEffect(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    // 火球
    const fireballGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const fireballMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 1
    });
    const fireball = new THREE.Mesh(fireballGeo, fireballMat);
    group.add(fireball);

    // 动画
    let scale = 1;
    const animate = () => {
      scale += 0.2;
      fireball.scale.set(scale, scale, scale);
      fireballMat.opacity -= 0.1;

      if (fireballMat.opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        if (group.parent) {
          group.parent.remove(group);
        }
      }
    };
    animate();

    return group;
  }

  /**
   * 获取位置
   */
  getPosition() {
    return this.object3D.position;
  }

  /**
   * 设置位置
   */
  setPosition(position) {
    this.object3D.position.copy(position);
  }

  /**
   * 是否活跃
   */
  isActive() {
    return this.active;
  }

  /**
   * 销毁
   */
  dispose() {
    if (this.object3D.parent) {
      this.object3D.parent.remove(this.object3D);
    }

    this.object3D.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}

/**
 * 投掷物管理器
 */
export class ProjectileManager {
  constructor() {
    this.projectiles = [];
    this.world = null;
  }

  /**
   * 设置世界引用
   */
  setWorld(world) {
    this.world = world;
  }

  /**
   * 投掷物品
   */
  throwProjectile(type, owner, position, direction, force) {
    const projectile = new Projectile(type, owner);
    projectile.setPosition(position);
    projectile.throw(direction, force);

    // 添加到世界
    this.world.scene.add(projectile.object3D);
    this.projectiles.push(projectile);

    return projectile;
  }

  /**
   * 更新所有投掷物
   */
  update(deltaTime) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];

      projectile.update(deltaTime, this.world);

      // 移除非活跃的投掷物
      if (!projectile.isActive()) {
        projectile.dispose();
        this.projectiles.splice(i, 1);
      }
    }
  }

  /**
   * 清除所有投掷物
   */
  clear() {
    this.projectiles.forEach(p => p.dispose());
    this.projectiles = [];
  }
}