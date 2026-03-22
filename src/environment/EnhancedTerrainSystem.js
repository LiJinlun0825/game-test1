/**
 * 增强地形系统
 * 提供程序化地形生成、高度图、纹理混合等功能
 */
export class EnhancedTerrainSystem {
  constructor(scene) {
    this.scene = scene;
    this.terrain = null;
    this.size = 500;
    this.segments = 50;
    this.heightData = null;
  }

  /**
   * 初始化地形
   */
  init(options = {}) {
    this.size = options.size || 500;
    this.segments = options.segments || 50;

    this.createTerrain(options);

    console.log('Enhanced Terrain System initialized');
    return this;
  }

  /**
   * 创建地形
   */
  createTerrain(options) {
    const geometry = new THREE.PlaneGeometry(
      this.size,
      this.size,
      this.segments,
      this.segments
    );
    geometry.rotateX(-Math.PI / 2);

    // 应用高度变化
    this.applyHeightMap(geometry, options.heightScale || 0);

    // 计算法线
    geometry.computeVertexNormals();

    // 创建材质
    const material = this.createTerrainMaterial(options);

    // 创建网格
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.receiveShadow = true;
    this.terrain.name = 'terrain';

    this.scene.add(this.terrain);

    // 存储高度数据
    this.heightData = this.extractHeightData(geometry);
  }

  /**
   * 应用高度图
   */
  applyHeightMap(geometry, scale) {
    const positions = geometry.attributes.position.array;
    const halfSize = this.size / 2;
    const segmentSize = this.size / this.segments;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];

      // 使用噪声函数生成高度
      const height = this.generateHeight(x, z, scale);
      positions[i + 1] = height;
    }

    geometry.attributes.position.needsUpdate = true;
  }

  /**
   * 生成高度值
   */
  generateHeight(x, z, scale) {
    // 简单的多层噪声
    const noise1 = Math.sin(x * 0.01) * Math.cos(z * 0.01) * scale;
    const noise2 = Math.sin(x * 0.02 + 1.5) * Math.cos(z * 0.02 + 0.5) * scale * 0.5;
    const noise3 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * scale * 0.25;

    return noise1 + noise2 + noise3;
  }

  /**
   * 创建地形材质
   */
  createTerrainMaterial(options) {
    const baseColor = options.color || 0x3d5c3d;

    return new THREE.MeshLambertMaterial({
      color: baseColor,
      flatShading: true,
      side: THREE.DoubleSide
    });
  }

  /**
   * 提取高度数据
   */
  extractHeightData(geometry) {
    const positions = geometry.attributes.position.array;
    const data = new Float32Array((this.segments + 1) * (this.segments + 1));
    let index = 0;

    for (let i = 1; i < positions.length; i += 3) {
      data[index++] = positions[i];
    }

    return data;
  }

  /**
   * 获取指定位置的高度
   */
  getHeightAt(x, z) {
    // 将世界坐标转换为网格坐标
    const halfSize = this.size / 2;

    // 边界检查
    if (x < -halfSize || x > halfSize || z < -halfSize || z > halfSize) {
      return 0;
    }

    // 简化：使用噪声函数重新计算
    return this.generateHeight(x, z, 0);
  }

  /**
   * 添加细节对象（草、石头等）
   */
  addDetails(objects) {
    const group = new THREE.Group();
    group.name = 'terrain-details';

    objects.forEach(obj => {
      // 确保对象在地形上
      const height = this.getHeightAt(obj.position.x, obj.position.z);
      obj.position.y = Math.max(0, height);
      group.add(obj);
    });

    this.scene.add(group);
    return group;
  }

  /**
   * 创建网格装饰
   */
  createGridDecoration() {
    const gridHelper = new THREE.GridHelper(this.size, 20, 0x000000, 0x444444);
    gridHelper.position.y = 0.1;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);

    return gridHelper;
  }

  /**
   * 创建边界墙
   */
  createBoundaryWalls(height = 20, color = 0x444444) {
    const walls = new THREE.Group();
    walls.name = 'boundary-walls';

    const halfSize = this.size / 2;
    const wallThickness = 2;

    // 四面墙
    const wallPositions = [
      { x: 0, z: -halfSize, rotY: 0 },
      { x: 0, z: halfSize, rotY: 0 },
      { x: -halfSize, z: 0, rotY: Math.PI / 2 },
      { x: halfSize, z: 0, rotY: Math.PI / 2 }
    ];

    wallPositions.forEach(pos => {
      const wallGeometry = new THREE.BoxGeometry(this.size, height, wallThickness);
      const wallMaterial = new THREE.MeshLambertMaterial({
        color: color,
        transparent: true,
        opacity: 0.5
      });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(pos.x, height / 2, pos.z);
      wall.rotation.y = pos.rotY;
      walls.add(wall);
    });

    this.scene.add(walls);
    return walls;
  }

  /**
   * 更新地形
   */
  update(deltaTime) {
    // 地形通常是静态的，这里可以添加动态效果
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.terrain) {
      this.scene.remove(this.terrain);
      this.terrain.geometry.dispose();
      this.terrain.material.dispose();
    }

    // 移除装饰和边界
    const details = this.scene.getObjectByName('terrain-details');
    if (details) {
      this.scene.remove(details);
    }

    const walls = this.scene.getObjectByName('boundary-walls');
    if (walls) {
      walls.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scene.remove(walls);
    }
  }
}