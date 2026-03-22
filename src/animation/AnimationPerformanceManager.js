/**
 * 动画性能管理器
 * 处理动画缓存、内存池和性能监控
 */
export class AnimationPerformanceManager {
  constructor() {
    // 对象池
    this.vector3Pool = [];
    this.quaternionPool = [];
    this.eulerPool = [];

    // 动画数据缓存
    this.animationCache = new Map();

    // 性能监控
    this.metrics = {
      frameTime: 0,
      updateTime: 0,
      boneUpdateTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      poolHits: 0,
      poolMisses: 0
    };

    // 帧时间历史
    this.frameTimeHistory = [];
    this.maxHistoryLength = 60;

    // 预分配对象池
    this.preallocatePools();
  }

  /**
   * 预分配对象池
   */
  preallocatePools() {
    // 预分配 Vector3
    for (let i = 0; i < 50; i++) {
      this.vector3Pool.push(new THREE.Vector3());
    }

    // 预分配 Quaternion
    for (let i = 0; i < 30; i++) {
      this.quaternionPool.push(new THREE.Quaternion());
    }

    // 预分配 Euler
    for (let i = 0; i < 30; i++) {
      this.eulerPool.push(new THREE.Euler());
    }
  }

  /**
   * 从池中获取 Vector3
   */
  getVector3() {
    const vec = this.vector3Pool.pop();
    if (vec) {
      this.metrics.poolHits++;
      vec.set(0, 0, 0);
      return vec;
    }
    this.metrics.poolMisses++;
    return new THREE.Vector3();
  }

  /**
   * 归还 Vector3 到池
   */
  returnVector3(vec) {
    if (this.vector3Pool.length < 100) {
      this.vector3Pool.push(vec);
    }
  }

  /**
   * 从池中获取 Quaternion
   */
  getQuaternion() {
    const quat = this.quaternionPool.pop();
    if (quat) {
      this.metrics.poolHits++;
      quat.identity();
      return quat;
    }
    this.metrics.poolMisses++;
    return new THREE.Quaternion();
  }

  /**
   * 归还 Quaternion 到池
   */
  returnQuaternion(quat) {
    if (this.quaternionPool.length < 50) {
      this.quaternionPool.push(quat);
    }
  }

  /**
   * 从池中获取 Euler
   */
  getEuler() {
    const euler = this.eulerPool.pop();
    if (euler) {
      this.metrics.poolHits++;
      euler.set(0, 0, 0);
      return euler;
    }
    this.metrics.poolMisses++;
    return new THREE.Euler();
  }

  /**
   * 归还 Euler 到池
   */
  returnEuler(euler) {
    if (this.eulerPool.length < 50) {
      this.eulerPool.push(euler);
    }
  }

  /**
   * 缓存动画数据
   */
  cacheAnimationData(key, data) {
    this.animationCache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * 获取缓存的动画数据
   */
  getCachedAnimationData(key) {
    const cached = this.animationCache.get(key);
    if (cached) {
      this.metrics.cacheHits++;
      return cached.data;
    }
    this.metrics.cacheMisses++;
    return null;
  }

  /**
   * 清理过期缓存
   */
  cleanupCache(maxAge = 60000) {
    const now = Date.now();
    const keysToDelete = [];

    this.animationCache.forEach((value, key) => {
      if (now - value.timestamp > maxAge) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.animationCache.delete(key));
  }

  /**
   * 开始性能测量
   */
  beginMeasure() {
    this.metrics.frameTime = performance.now();
  }

  /**
   * 结束性能测量
   */
  endMeasure() {
    const endTime = performance.now();
    const frameTime = endTime - this.metrics.frameTime;

    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > this.maxHistoryLength) {
      this.frameTimeHistory.shift();
    }
  }

  /**
   * 记录更新时间
   */
  recordUpdateTime(time) {
    this.metrics.updateTime = time;
  }

  /**
   * 记录骨骼更新时间
   */
  recordBoneUpdateTime(time) {
    this.metrics.boneUpdateTime = time;
  }

  /**
   * 获取平均帧时间
   */
  getAverageFrameTime() {
    if (this.frameTimeHistory.length === 0) return 0;
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.frameTimeHistory.length;
  }

  /**
   * 获取FPS
   */
  getFPS() {
    const avgFrameTime = this.getAverageFrameTime();
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
  }

  /**
   * 获取性能统计
   */
  getStats() {
    return {
      fps: this.getFPS().toFixed(1),
      avgFrameTime: this.getAverageFrameTime().toFixed(2) + 'ms',
      updateTime: this.metrics.updateTime.toFixed(2) + 'ms',
      boneUpdateTime: this.metrics.boneUpdateTime.toFixed(2) + 'ms',
      cacheHitRate: this.getCacheHitRate().toFixed(1) + '%',
      poolHitRate: this.getPoolHitRate().toFixed(1) + '%',
      poolSize: {
        vector3: this.vector3Pool.length,
        quaternion: this.quaternionPool.length,
        euler: this.eulerPool.length
      },
      cacheSize: this.animationCache.size
    };
  }

  /**
   * 获取缓存命中率
   */
  getCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;
  }

  /**
   * 获取池命中率
   */
  getPoolHitRate() {
    const total = this.metrics.poolHits + this.metrics.poolMisses;
    return total > 0 ? (this.metrics.poolHits / total) * 100 : 0;
  }

  /**
   * 重置性能计数器
   */
  resetCounters() {
    this.metrics.cacheHits = 0;
    this.metrics.cacheMisses = 0;
    this.metrics.poolHits = 0;
    this.metrics.poolMisses = 0;
    this.frameTimeHistory = [];
  }

  /**
   * 优化骨骼更新 - 批量更新
   */
  batchUpdateBones(bones, transforms) {
    const startTime = performance.now();

    Object.keys(transforms).forEach(boneName => {
      const bone = bones[boneName];
      if (!bone) return;

      const transform = transforms[boneName];

      if (transform.rotation) {
        bone.rotation.x = transform.rotation.x;
        bone.rotation.y = transform.rotation.y;
        bone.rotation.z = transform.rotation.z;
      }

      if (transform.position) {
        bone.position.x = transform.position.x;
        bone.position.y = transform.position.y;
        bone.position.z = transform.position.z;
      }
    });

    this.recordBoneUpdateTime(performance.now() - startTime);
  }

  /**
   * 创建性能报告
   */
  generateReport() {
    const stats = this.getStats();

    return `
=== 动画性能报告 ===
FPS: ${stats.fps}
平均帧时间: ${stats.avgFrameTime}
动画更新时间: ${stats.updateTime}
骨骼更新时间: ${stats.boneUpdateTime}

缓存命中率: ${stats.cacheHitRate}
池命中率: ${stats.poolHitRate}

对象池大小:
  - Vector3: ${stats.poolSize.vector3}
  - Quaternion: ${stats.poolSize.quaternion}
  - Euler: ${stats.poolSize.euler}

缓存条目数: ${stats.cacheSize}
==================
    `.trim();
  }
}