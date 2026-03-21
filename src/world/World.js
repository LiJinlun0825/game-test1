/**
 * 世界管理器
 * 管理地形、建筑物、环境对象
 */
export class World {
  constructor() {
    this.scene = null;

    // 世界参数
    this.size = 4000;           // 4km x 4km
    this.chunkSize = 100;       // 区块大小 100m
    this.chunks = new Map();    // 区块缓存

    // 地形
    this.terrain = null;

    // 建筑物
    this.buildings = [];

    // 环境对象
    this.environmentObjects = [];

    // 玩家引用
    this.player = null;

    // 敌人列表
    this._enemies = [];

    // 加载范围
    this.loadDistance = 300;    // 加载距离
    this.unloadDistance = 400;  // 卸载距离

    // 粒子效果系统
    this.particles = [];
  }

  /**
   * 初始化世界
   */
  init(scene) {
    this.scene = scene;

    // 创建基础地形
    this.createTerrain();

    // 创建测试建筑物
    this.createTestBuildings();

    // 创建环境
    this.createEnvironment();

    console.log('World initialized');
  }

  /**
   * 创建地形
   */
  createTerrain() {
    // 创建一个大平面作为地面
    const geometry = new THREE.PlaneGeometry(this.size, this.size, 100, 100);
    geometry.rotateX(-Math.PI / 2);

    // 简单的高度变化
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      // 简单的噪声高度
      const height = this.getTerrainHeight(x, z);
      positions.setY(i, height);
    }

    geometry.computeVertexNormals();

    // 地形材质
    const material = new THREE.MeshStandardMaterial({
      color: 0x3D5C3D,        // 草地绿色
      roughness: 0.9,
      metalness: 0,
      flatShading: true
    });

    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);

    // 创建水面
    this.createWater();
  }

  /**
   * 获取地形高度
   */
  getTerrainHeight(x, z) {
    // 简单的正弦波模拟地形
    const scale1 = 0.005;
    const scale2 = 0.01;
    const scale3 = 0.02;

    let height = 0;
    height += Math.sin(x * scale1) * Math.cos(z * scale1) * 20;
    height += Math.sin(x * scale2 + 1) * Math.cos(z * scale2 + 1) * 10;
    height += Math.sin(x * scale3) * Math.cos(z * scale3) * 5;

    return height;
  }

  /**
   * 创建水面
   */
  createWater() {
    const waterGeometry = new THREE.PlaneGeometry(this.size, this.size);
    waterGeometry.rotateX(-Math.PI / 2);

    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x006994,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.3
    });

    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = -5;
    water.receiveShadow = true;
    this.scene.add(water);

    this.water = water;
  }

  /**
   * 创建测试建筑物
   */
  createTestBuildings() {
    // 创建一些简单的建筑物用于测试
    const buildingConfigs = [
      { x: 50, z: 50, width: 20, height: 15, depth: 20 },
      { x: -80, z: 30, width: 30, height: 20, depth: 25 },
      { x: 100, z: -50, width: 15, height: 10, depth: 15 },
      { x: -50, z: -80, width: 25, height: 25, depth: 20 },
      { x: 200, z: 200, width: 40, height: 30, depth: 35 },
      { x: -200, z: 150, width: 20, height: 12, depth: 20 },
      { x: 150, z: -200, width: 35, height: 18, depth: 30 },
      { x: -150, z: -150, width: 25, height: 22, depth: 25 }
    ];

    buildingConfigs.forEach(config => {
      const building = this.createBuilding(config);
      this.buildings.push(building);
      this.scene.add(building);
    });
  }

  /**
   * 创建单个建筑物
   */
  createBuilding(config) {
    const group = new THREE.Group();

    // 主体
    const bodyGeometry = new THREE.BoxGeometry(config.width, config.height, config.depth);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B8B8B,
      roughness: 0.8,
      metalness: 0.1
    });

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = config.height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // 屋顶
    const roofGeometry = new THREE.BoxGeometry(config.width + 2, 1, config.depth + 2);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A4A4A,
      roughness: 0.9
    });

    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = config.height + 0.5;
    roof.castShadow = true;
    group.add(roof);

    // 窗户
    this.addWindows(group, config);

    // 设置位置
    const terrainHeight = this.getTerrainHeight(config.x, config.z);
    group.position.set(config.x, terrainHeight, config.z);

    // 存储碰撞信息
    group.userData.isBuilding = true;
    group.userData.bounds = {
      minX: config.x - config.width / 2,
      maxX: config.x + config.width / 2,
      minZ: config.z - config.depth / 2,
      maxZ: config.z + config.depth / 2,
      height: config.height
    };

    return group;
  }

  /**
   * 添加窗户
   */
  addWindows(building, config) {
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87CEEB,
      roughness: 0.1,
      metalness: 0.5,
      transparent: true,
      opacity: 0.8
    });

    const windowSize = 2;
    const windowGap = 4;
    const floors = Math.floor(config.height / windowGap);

    // 前后窗户
    for (let floor = 1; floor < floors; floor++) {
      const y = floor * windowGap;

      // 前面窗户
      const windowGeom = new THREE.PlaneGeometry(windowSize, windowSize);
      const windowFront = new THREE.Mesh(windowGeom, windowMaterial);
      windowFront.position.set(0, y, config.depth / 2 + 0.1);
      building.add(windowFront);

      // 后面窗户
      const windowBack = new THREE.Mesh(windowGeom, windowMaterial);
      windowBack.position.set(0, y, -config.depth / 2 - 0.1);
      windowBack.rotation.y = Math.PI;
      building.add(windowBack);
    }
  }

  /**
   * 创建环境对象（树木、石头等）
   */
  createEnvironment() {
    // 创建一些简单的树木
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * 1000;

      // 避开建筑物
      if (this.isNearBuilding(x, z, 30)) continue;

      const tree = this.createTree();
      const terrainHeight = this.getTerrainHeight(x, z);
      tree.position.set(x, terrainHeight, z);
      this.scene.add(tree);
      this.environmentObjects.push(tree);
    }

    // 添加一些石头
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 800;
      const z = (Math.random() - 0.5) * 800;

      if (this.isNearBuilding(x, z, 20)) continue;

      const rock = this.createRock();
      const terrainHeight = this.getTerrainHeight(x, z);
      rock.position.set(x, terrainHeight, z);
      this.scene.add(rock);
      this.environmentObjects.push(rock);
    }
  }

  /**
   * 创建树木
   */
  createTree() {
    const group = new THREE.Group();

    // 树干
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A3728,
      roughness: 0.9
    });

    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    group.add(trunk);

    // 树冠
    const crownGeometry = new THREE.ConeGeometry(2.5, 5, 8);
    const crownMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.8
    });

    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 5;
    crown.castShadow = true;
    group.add(crown);

    // 随机缩放
    const scale = 0.8 + Math.random() * 0.6;
    group.scale.set(scale, scale, scale);

    return group;
  }

  /**
   * 创建石头
   */
  createRock() {
    const geometry = new THREE.DodecahedronGeometry(1 + Math.random(), 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x696969,
      roughness: 0.9,
      metalness: 0.1
    });

    const rock = new THREE.Mesh(geometry, material);
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    rock.scale.set(
      1 + Math.random(),
      0.5 + Math.random() * 0.5,
      1 + Math.random()
    );
    rock.castShadow = true;

    return rock;
  }

  /**
   * 检查是否靠近建筑物
   */
  isNearBuilding(x, z, distance) {
    for (const building of this.buildings) {
      const bounds = building.userData.bounds;
      if (bounds) {
        const dx = Math.max(bounds.minX - x, 0, x - bounds.maxX);
        const dz = Math.max(bounds.minZ - z, 0, z - bounds.maxZ);
        if (Math.sqrt(dx * dx + dz * dz) < distance) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 设置玩家引用
   */
  setPlayer(player) {
    this.player = player;
  }

  /**
   * 更新世界
   */
  update(deltaTime) {
    // 更新区块加载
    // this.updateChunks();

    // 更新粒子效果
    this.updateParticles(deltaTime);
  }

  /**
   * 创建命中粒子效果 - 增强版
   */
  createHitEffect(position, color = 0xFFAA00) {
    if (!this.scene) return;

    // 命中火花 - 12个黄色火花
    const sparkCount = 12;
    const sparks = [];

    for (let i = 0; i < sparkCount; i++) {
      const size = 0.02 + Math.random() * 0.04;
      const geo = new THREE.SphereGeometry(size, 6, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xFFCC00,
        transparent: true,
        opacity: 1
      });
      const spark = new THREE.Mesh(geo, mat);
      spark.position.copy(position);

      // 随机速度 - 向外喷射
      const speed = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;

      spark.userData.velocity = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.abs(Math.cos(phi)) * speed * 1.2,
        Math.sin(phi) * Math.sin(theta) * speed
      );

      spark.userData.lifetime = 0;
      spark.userData.maxLifetime = 0.3 + Math.random() * 0.3;
      spark.userData.isSpark = true;

      this.scene.add(spark);
      sparks.push(spark);
    }

    // 命中烟雾 - 灰色烟雾扩散
    const smokeCount = 5;
    for (let i = 0; i < smokeCount; i++) {
      const size = 0.1 + Math.random() * 0.15;
      const geo = new THREE.SphereGeometry(size, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.4
      });
      const smoke = new THREE.Mesh(geo, mat);
      smoke.position.copy(position);

      // 缓慢向外扩散
      const speed = 0.5 + Math.random() * 1;
      const angle = Math.random() * Math.PI * 2;

      smoke.userData.velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        0.3 + Math.random() * 0.5,
        Math.sin(angle) * speed
      );

      smoke.userData.lifetime = 0;
      smoke.userData.maxLifetime = 1 + Math.random() * 0.5;
      smoke.userData.isSmoke = true;
      smoke.userData.growRate = 1.5;

      this.scene.add(smoke);
      sparks.push(smoke);
    }

    // 添加闪光效果
    const flashGeo = new THREE.SphereGeometry(0.15, 12, 12);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFCC,
      transparent: true,
      opacity: 0.9
    });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.copy(position);
    flash.userData.lifetime = 0;
    flash.userData.maxLifetime = 0.08;
    flash.userData.isFlash = true;
    this.scene.add(flash);
    sparks.push(flash);

    this.particles.push(...sparks);
  }

  /**
   * 创建血液溅射效果 - 增强版
   */
  createBloodSplatter(position) {
    if (!this.scene) return;

    const bloodCount = 25;
    const bloodDrops = [];

    // 血液颜色
    const bloodColor = 0x8B0000;

    for (let i = 0; i < bloodCount; i++) {
      const size = 0.015 + Math.random() * 0.035;
      const geo = new THREE.SphereGeometry(size, 5, 5);
      const mat = new THREE.MeshBasicMaterial({
        color: bloodColor,
        transparent: true,
        opacity: 0.95
      });
      const drop = new THREE.Mesh(geo, mat);
      drop.position.copy(position);

      // 向外飞溅
      const speed = 3 + Math.random() * 6;
      const angle = Math.random() * Math.PI * 2;
      const upAngle = Math.random() * Math.PI * 0.35;

      drop.userData.velocity = new THREE.Vector3(
        Math.cos(angle) * Math.cos(upAngle) * speed,
        Math.sin(upAngle) * speed * 2.5,
        Math.sin(angle) * Math.cos(upAngle) * speed
      );

      drop.userData.lifetime = 0;
      drop.userData.maxLifetime = 1 + Math.random() * 0.8;
      drop.userData.isBlood = true;

      this.scene.add(drop);
      bloodDrops.push(drop);
    }

    // 血雾效果
    const mistGeo = new THREE.SphereGeometry(0.2, 10, 10);
    const mistMat = new THREE.MeshBasicMaterial({
      color: 0xAA0000,
      transparent: true,
      opacity: 0.3
    });
    const mist = new THREE.Mesh(mistGeo, mistMat);
    mist.position.copy(position);
    mist.userData.lifetime = 0;
    mist.userData.maxLifetime = 0.5;
    mist.userData.isMist = true;
    mist.userData.growRate = 3;
    this.scene.add(mist);
    bloodDrops.push(mist);

    this.particles.push(...bloodDrops);
  }

  /**
   * 创建火花效果（击中金属/硬物）
   */
  createSparkEffect(position) {
    if (!this.scene) return;

    const sparkCount = 10;

    for (let i = 0; i < sparkCount; i++) {
      const length = 0.05 + Math.random() * 0.1;
      const geo = new THREE.CylinderGeometry(0.003, 0.001, length, 4);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xFFFF00,
        transparent: true,
        opacity: 1
      });
      const spark = new THREE.Mesh(geo, mat);
      spark.position.copy(position);

      // 随机方向
      const speed = 5 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;

      spark.userData.velocity = new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * speed,
        Math.cos(phi) * speed,
        Math.sin(theta) * Math.sin(phi) * speed
      );

      // 随机旋转
      spark.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      spark.userData.lifetime = 0;
      spark.userData.maxLifetime = 0.2 + Math.random() * 0.3;
      spark.userData.angularVelocity = new THREE.Vector3(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      );

      this.scene.add(spark);
      this.particles.push(spark);
    }
  }

  /**
   * 更新粒子效果
   */
  updateParticles(deltaTime) {
    const gravity = -15;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.userData.lifetime += deltaTime;

      // 超时移除
      if (particle.userData.lifetime >= particle.userData.maxLifetime) {
        this.scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      // 更新透明度
      const lifeRatio = particle.userData.lifetime / particle.userData.maxLifetime;
      particle.material.opacity = (1 - lifeRatio) * (particle.userData.isMist ? 0.3 : 1);

      // 应用物理
      if (particle.userData.velocity) {
        // 重力
        if (particle.userData.isBlood || particle.userData.isSpark) {
          particle.userData.velocity.y += gravity * deltaTime;
        }

        // 更新位置
        particle.position.x += particle.userData.velocity.x * deltaTime;
        particle.position.y += particle.userData.velocity.y * deltaTime;
        particle.position.z += particle.userData.velocity.z * deltaTime;

        // 血液落地
        if (particle.userData.isBlood && particle.position.y < 0) {
          particle.position.y = 0.01;
          particle.userData.velocity.multiplyScalar(0.1);
        }

        // 烟雾扩散减速
        if (particle.userData.isSmoke) {
          particle.userData.velocity.multiplyScalar(0.98);
          if (particle.userData.growRate) {
            particle.scale.multiplyScalar(1 + particle.userData.growRate * deltaTime);
          }
        }
      }

      // 旋转
      if (particle.userData.angularVelocity) {
        particle.rotation.x += particle.userData.angularVelocity.x * deltaTime;
        particle.rotation.y += particle.userData.angularVelocity.y * deltaTime;
        particle.rotation.z += particle.userData.angularVelocity.z * deltaTime;
      }

      // 闪光效果快速放大
      if (particle.userData.isFlash) {
        particle.scale.multiplyScalar(1.8);
      }

      // 血雾扩散
      if (particle.userData.isMist && particle.userData.growRate) {
        particle.scale.multiplyScalar(1 + particle.userData.growRate * deltaTime);
      }
    }
  }

  /**
   * 获取地形高度
   */
  getHeightAt(x, z) {
    return this.getTerrainHeight(x, z);
  }

  /**
   * 检查是否在建筑内
   */
  isInsideBuilding(x, y, z) {
    for (const building of this.buildings) {
      const bounds = building.userData.bounds;
      if (bounds &&
          x >= bounds.minX && x <= bounds.maxX &&
          z >= bounds.minZ && z <= bounds.maxZ &&
          y <= bounds.height) {
        return building;
      }
    }
    return null;
  }

  /**
   * 获取指定半径内的玩家列表
   */
  getPlayersInRadius(position, radius) {
    const players = [];

    // 检查玩家是否在范围内
    if (this.player) {
      const distance = this.player.position.distanceTo(position);
      if (distance <= radius) {
        players.push(this.player);
      }
    }

    // TODO: 添加AI敌人检查

    return players;
  }

  /**
   * 火焰区域列表
   */
  get fireAreas() {
    if (!this._fireAreas) {
      this._fireAreas = [];
    }
    return this._fireAreas;
  }

  set fireAreas(value) {
    this._fireAreas = value;
  }

  /**
   * 敌人列表
   */
  get enemies() {
    return this._enemies;
  }

  set enemies(value) {
    this._enemies = value;
  }
}