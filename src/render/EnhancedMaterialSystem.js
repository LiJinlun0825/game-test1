/**
 * 增强材质系统
 * 提供PBR风格的材质创建和管理
 */
export class EnhancedMaterialSystem {
  constructor() {
    this.materials = new Map();
    this.textureLoader = new THREE.TextureLoader();

    // 材质预设
    this.presets = {
      // 地面材质
      ground: {
        color: 0x3d5c3d,
        roughness: 0.9,
        metalness: 0.0,
        flatShading: true
      },
      // 建筑材质
      building: {
        color: 0x666666,
        roughness: 0.7,
        metalness: 0.1,
        flatShading: true
      },
      // 金属材质
      metal: {
        color: 0x888888,
        roughness: 0.3,
        metalness: 0.8,
        flatShading: true
      },
      // 木头材质
      wood: {
        color: 0x8b4513,
        roughness: 0.8,
        metalness: 0.0,
        flatShading: true
      },
      // 玻璃材质
      glass: {
        color: 0x88ccff,
        roughness: 0.1,
        metalness: 0.0,
        transparent: true,
        opacity: 0.3,
        flatShading: true
      },
      // 布料材质
      fabric: {
        color: 0x444444,
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true
      },
      // 皮肤材质
      skin: {
        color: 0x1a1a1a,
        roughness: 0.6,
        metalness: 0.0,
        flatShading: true
      },
      // 武器材质
      weapon: {
        color: 0x333333,
        roughness: 0.4,
        metalness: 0.7,
        flatShading: true
      }
    };
  }

  /**
   * 获取或创建材质
   */
  getMaterial(presetName, customParams = {}) {
    const key = `${presetName}_${JSON.stringify(customParams)}`;

    if (this.materials.has(key)) {
      return this.materials.get(key);
    }

    const preset = this.presets[presetName] || this.presets.building;
    const params = { ...preset, ...customParams };

    const material = new THREE.MeshStandardMaterial(params);
    this.materials.set(key, material);

    return material;
  }

  /**
   * 创建低多边形材质
   */
  createLowPolyMaterial(color, options = {}) {
    return new THREE.MeshLambertMaterial({
      color: color,
      flatShading: true,
      ...options
    });
  }

  /**
   * 创建渐变材质
   */
  createGradientMaterial(color1, color2, vertical = true) {
    // 简化版：使用单色
    return new THREE.MeshLambertMaterial({
      color: color1,
      flatShading: true
    });
  }

  /**
   * 创建发光材质
   */
  createEmissiveMaterial(color, intensity = 1) {
    return new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8 * intensity
    });
  }

  /**
   * 创建自定义PBR材质
   */
  createPBRMaterial(params) {
    return new THREE.MeshStandardMaterial({
      color: params.color || 0xffffff,
      roughness: params.roughness !== undefined ? params.roughness : 0.5,
      metalness: params.metalness !== undefined ? params.metalness : 0.0,
      flatShading: params.flatShading !== undefined ? params.flatShading : true,
      transparent: params.transparent || false,
      opacity: params.opacity !== undefined ? params.opacity : 1.0,
      side: params.side || THREE.FrontSide
    });
  }

  /**
   * 创建天空材质
   */
  createSkyMaterial(topColor, bottomColor) {
    return new THREE.MeshBasicMaterial({
      color: topColor,
      side: THREE.BackSide
    });
  }

  /**
   * 创建地形材质混合
   */
  createTerrainMaterial(baseColor, slopeColor, blendFactor = 0.5) {
    // 简化版：使用基础颜色
    return new THREE.MeshLambertMaterial({
      color: baseColor,
      flatShading: true
    });
  }

  /**
   * 应用材质变体
   */
  applyVariation(material, seed) {
    // 基于种子微调颜色
    const variation = ((seed % 20) - 10) / 100;
    const color = material.color.clone();
    color.offsetHSL(0, 0, variation);
    material.color = color;
  }

  /**
   * 获取所有材质
   */
  getAllMaterials() {
    return Array.from(this.materials.values());
  }

  /**
   * 清理未使用的材质
   */
  cleanup() {
    this.materials.forEach((material, key) => {
      if (material.userData.refCount === 0) {
        material.dispose();
        this.materials.delete(key);
      }
    });
  }

  /**
   * 销毁所有材质
   */
  destroy() {
    this.materials.forEach(material => {
      material.dispose();
    });
    this.materials.clear();
  }
}