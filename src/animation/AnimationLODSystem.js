/**
 * 动画LOD系统
 * 根据距离自动调整动画更新频率和模型细节
 */
export class AnimationLODSystem {
  constructor() {
    // LOD 级别配置
    this.lodLevels = [
      { distance: 0, updateInterval: 0, boneCount: 'full', animationQuality: 'full' },
      { distance: 20, updateInterval: 0, boneCount: 'full', animationQuality: 'full' },
      { distance: 50, updateInterval: 1/30, boneCount: 'reduced', animationQuality: 'medium' },
      { distance: 100, updateInterval: 1/20, boneCount: 'simple', animationQuality: 'low' },
      { distance: 200, updateInterval: 1/10, boneCount: 'simple', animationQuality: 'minimal' }
    ];

    // 实体LOD状态缓存
    this.entityLODStates = new Map();

    // 性能统计
    this.stats = {
      entitiesTracked: 0,
      updatesSkipped: 0,
      currentLODDistribution: { high: 0, medium: 0, low: 0, minimal: 0 }
    };
  }

  /**
   * 注册实体到LOD系统
   * @param {Object} entity - 实体对象
   */
  registerEntity(entity) {
    if (!entity || !entity.animationController) return;

    this.entityLODStates.set(entity.id, {
      entity: entity,
      currentLOD: 0,
      lastUpdateTime: 0,
      accumulatedTime: 0,
      forceUpdate: false
    });

    this.stats.entitiesTracked = this.entityLODStates.size;
  }

  /**
   * 从LOD系统移除实体
   * @param {string} entityId - 实体ID
   */
  unregisterEntity(entityId) {
    this.entityLODStates.delete(entityId);
    this.stats.entitiesTracked = this.entityLODStates.size;
  }

  /**
   * 根据距离计算LOD级别
   * @param {number} distance - 到相机的距离
   * @returns {number} LOD级别索引
   */
  calculateLODLevel(distance) {
    for (let i = this.lodLevels.length - 1; i >= 0; i--) {
      if (distance >= this.lodLevels[i].distance) {
        return i;
      }
    }
    return 0;
  }

  /**
   * 更新所有实体的LOD状态
   * @param {number} deltaTime - 时间增量
   * @param {THREE.Vector3} cameraPosition - 相机位置
   */
  update(deltaTime, cameraPosition) {
    // 重置统计
    this.stats.updatesSkipped = 0;
    this.stats.currentLODDistribution = { high: 0, medium: 0, low: 0, minimal: 0 };

    this.entityLODStates.forEach((state, entityId) => {
      const { entity } = state;
      if (!entity || !entity.position) return;

      // 计算距离
      const distance = entity.position.distanceTo(cameraPosition);

      // 计算LOD级别
      const newLOD = this.calculateLODLevel(distance);
      const lodChanged = newLOD !== state.currentLOD;

      if (lodChanged) {
        state.currentLOD = newLOD;
        state.forceUpdate = true;
        this.applyLODChange(entity, newLOD);
      }

      // 获取当前LOD配置
      const lodConfig = this.lodLevels[newLOD];

      // 累积时间
      state.accumulatedTime += deltaTime;

      // 检查是否需要更新动画
      const shouldUpdate = state.forceUpdate ||
                           lodConfig.updateInterval === 0 ||
                           state.accumulatedTime >= lodConfig.updateInterval;

      if (shouldUpdate) {
        // 更新动画
        if (entity.animationController) {
          entity.animationController.update(state.accumulatedTime);
        }
        state.accumulatedTime = 0;
        state.forceUpdate = false;
      } else {
        this.stats.updatesSkipped++;
      }

      // 更新统计
      this.updateLODStats(newLOD);
    });
  }

  /**
   * 应用LOD变化
   * @param {Object} entity - 实体
   * @param {number} lodLevel - LOD级别
   */
  applyLODChange(entity, lodLevel) {
    const lodConfig = this.lodLevels[lodLevel];

    // 更新动画质量
    if (entity.animationController) {
      // 降低远距离的动画更新频率
      if (lodConfig.animationQuality === 'minimal') {
        entity.animationController.setPlaybackSpeed(0.5);
      } else if (lodConfig.animationQuality === 'low') {
        entity.animationController.setPlaybackSpeed(0.75);
      } else {
        entity.animationController.setPlaybackSpeed(1.0);
      }
    }

    // 可以在这里切换模型LOD
    if (entity.setLODLevel) {
      entity.setLODLevel(lodLevel);
    }
  }

  /**
   * 更新LOD统计
   */
  updateLODStats(lodLevel) {
    switch (lodLevel) {
      case 0:
      case 1:
        this.stats.currentLODDistribution.high++;
        break;
      case 2:
        this.stats.currentLODDistribution.medium++;
        break;
      case 3:
        this.stats.currentLODDistribution.low++;
        break;
      case 4:
      default:
        this.stats.currentLODDistribution.minimal++;
        break;
    }
  }

  /**
   * 获取实体当前的LOD状态
   * @param {string} entityId - 实体ID
   * @returns {Object|null} LOD状态
   */
  getEntityLODState(entityId) {
    return this.entityLODStates.get(entityId) || null;
  }

  /**
   * 获取性能统计
   * @returns {Object} 统计数据
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * 设置LOD配置
   * @param {Array} levels - LOD级别配置
   */
  setLODLevels(levels) {
    if (levels && levels.length > 0) {
      this.lodLevels = levels.sort((a, b) => a.distance - b.distance);
    }
  }

  /**
   * 强制更新指定实体
   * @param {string} entityId - 实体ID
   */
  forceUpdateEntity(entityId) {
    const state = this.entityLODStates.get(entityId);
    if (state) {
      state.forceUpdate = true;
    }
  }

  /**
   * 重置系统
   */
  reset() {
    this.entityLODStates.clear();
    this.stats = {
      entitiesTracked: 0,
      updatesSkipped: 0,
      currentLODDistribution: { high: 0, medium: 0, low: 0, minimal: 0 }
    };
  }

  /**
   * 获取调试信息
   */
  getDebugInfo() {
    return {
      entitiesTracked: this.stats.entitiesTracked,
      updatesSkipped: this.stats.updatesSkipped,
      lodDistribution: this.stats.currentLODDistribution,
      lodLevels: this.lodLevels.map((l, i) => ({
        level: i,
        distance: l.distance,
        updateInterval: l.updateInterval.toFixed(3),
        quality: l.animationQuality
      }))
    };
  }
}