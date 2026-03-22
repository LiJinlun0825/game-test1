/**
 * 游戏世界
 * 管理地形、安全区、物品和敌人
 */

/**
 * 安全区类
 */
class SafeZone {
  constructor() {
    this.center = new THREE.Vector2(0, 0);
    this.currentRadius = 250;
    this.targetRadius = 250;
    this.shrinkStartTime = 60;
    this.shrinkDuration = 60;
    this.damagePerSecond = 5;
    this.shrinkStages = [
      { radius: 200, waitTime: 120 },
      { radius: 150, waitTime: 90 },
      { radius: 100, waitTime: 60 },
      { radius: 50, waitTime: 45 },
      { radius: 20, waitTime: 30 }
    ];
    this.currentStage = -1;
    this.stageStartTime = 0;
    this.isShrinking = false;
    this.boundaryMesh = null;
    this.edgeMesh = null;
  }

  initBoundary(scene) {
    const geometry = new THREE.CylinderGeometry(
      this.currentRadius,
      this.currentRadius,
      100,
      64,
      1,
      true
    );

    const material = new THREE.MeshBasicMaterial({
      color: 0x00AAFF,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    this.boundaryMesh = new THREE.Mesh(geometry, material);
    this.boundaryMesh.position.set(this.center.x, 50, this.center.y);
    scene.add(this.boundaryMesh);

    // 边缘线
    const edgeGeometry = new THREE.RingGeometry(
      this.currentRadius - 0.5,
      this.currentRadius + 0.5,
      64
    );
    edgeGeometry.rotateX(-Math.PI / 2);
    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    this.edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
    this.edgeMesh.position.set(this.center.x, 0.1, this.center.y);
    scene.add(this.edgeMesh);
  }

  update(deltaTime, elapsedTime) {
    if (this.currentStage < this.shrinkStages.length - 1) {
      const nextStage = this.shrinkStages[this.currentStage + 1];
      const waitTime = this.currentStage >= 0
        ? this.shrinkStages[this.currentStage].waitTime
        : this.shrinkStartTime;

      if (!this.isShrinking && elapsedTime >= this.stageStartTime + waitTime) {
        this.isShrinking = true;
        this.targetRadius = nextStage.radius;
        this.shrinkStartTime = elapsedTime;
      }
    }

    if (this.isShrinking && this.currentRadius > this.targetRadius) {
      const shrinkProgress = (elapsedTime - this.shrinkStartTime) / this.shrinkDuration;
      if (shrinkProgress >= 1) {
        this.currentRadius = this.targetRadius;
        this.isShrinking = false;
        this.currentStage++;
        this.stageStartTime = elapsedTime;
      } else {
        const startRadius = this.currentStage >= 0
          ? this.shrinkStages[this.currentStage].radius
          : 250;
        this.currentRadius = startRadius + (this.targetRadius - startRadius) * shrinkProgress;
      }
      this.updateBoundary();
    }
  }

  updateBoundary() {
    if (this.boundaryMesh) {
      this.boundaryMesh.geometry.dispose();
      this.boundaryMesh.geometry = new THREE.CylinderGeometry(
        this.currentRadius,
        this.currentRadius,
        100,
        64,
        1,
        true
      );
    }
    if (this.edgeMesh) {
      this.edgeMesh.geometry.dispose();
      this.edgeMesh.geometry = new THREE.RingGeometry(
        this.currentRadius - 0.5,
        this.currentRadius + 0.5,
        64
      );
      this.edgeMesh.geometry.rotateX(-Math.PI / 2);
    }
  }

  isOutside(position) {
    const dx = position.x - this.center.x;
    const dz = position.z - this.center.y;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance > this.currentRadius;
  }
}

/**
 * 世界类
 */
export class World {
  constructor() {
    this.scene = null;
    this.size = { x: 500, z: 500 };
    this.terrain = null;
    this.safeZone = null;
    this.items = [];
    this.enemies = [];
    this.player = null;
  }

  /**
   * 初始化世界
   */
  init(scene) {
    this.scene = scene;
    this.createTerrain();
    this.createBoundaries();
    this.createSafeZone();
    console.log('World initialized');
  }

  /**
   * 创建地形
   */
  createTerrain() {
    // 平坦地面
    const groundGeometry = new THREE.PlaneGeometry(this.size.x, this.size.z, 50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3D5A3D,
      roughness: 0.9,
      metalness: 0.1
    });
    this.terrain = new THREE.Mesh(groundGeometry, groundMaterial);
    this.terrain.rotation.x = -Math.PI / 2;
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);

    // 添加网格线
    const gridHelper = new THREE.GridHelper(this.size.x, 50, 0x2A3A2A, 0x2A3A2A);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  /**
   * 创建边界
   */
  createBoundaries() {
    const wallHeight = 10;
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A5A4A,
      transparent: true,
      opacity: 0.5
    });

    // 四面墙
    const halfX = this.size.x / 2;
    const halfZ = this.size.z / 2;

    const wallGeometry = new THREE.BoxGeometry(this.size.x, wallHeight, 1);

    // 北墙
    const northWall = new THREE.Mesh(wallGeometry, wallMaterial);
    northWall.position.set(0, wallHeight / 2, -halfZ);
    this.scene.add(northWall);

    // 南墙
    const southWall = new THREE.Mesh(wallGeometry, wallMaterial);
    southWall.position.set(0, wallHeight / 2, halfZ);
    this.scene.add(southWall);

    // 东西墙
    const sideWallGeometry = new THREE.BoxGeometry(1, wallHeight, this.size.z);

    // 东墙
    const eastWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    eastWall.position.set(halfX, wallHeight / 2, 0);
    this.scene.add(eastWall);

    // 西墙
    const westWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    westWall.position.set(-halfX, wallHeight / 2, 0);
    this.scene.add(westWall);
  }

  /**
   * 创建安全区
   */
  createSafeZone() {
    this.safeZone = new SafeZone();
    this.safeZone.initBoundary(this.scene);
  }

  /**
   * 设置玩家引用
   */
  setPlayer(player) {
    this.player = player;
  }

  /**
   * 获取地形高度
   */
  getHeightAt(x, z) {
    // 平坦地形，高度为0
    return 0;
  }

  /**
   * 获取附近物品
   */
  getNearbyItems(position, radius) {
    return this.items.filter(item => {
      const distance = position.distanceTo(item.position);
      return distance <= radius;
    });
  }

  /**
   * 移除物品
   */
  removeItem(item) {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      this.scene.remove(item.object3D);
    }
  }

  /**
   * 更新世界
   */
  update(deltaTime, elapsedTime) {
    // 更新安全区
    if (this.safeZone) {
      this.safeZone.update(deltaTime, elapsedTime);

      // 检查玩家是否在安全区外
      if (this.player && this.safeZone.isOutside(this.player.position)) {
        this.player.health.damage(this.safeZone.damagePerSecond * deltaTime);
      }
    }
  }

  /**
   * 清理
   */
  dispose() {
    this.items.forEach(item => item.dispose());
    this.items = [];
  }
}