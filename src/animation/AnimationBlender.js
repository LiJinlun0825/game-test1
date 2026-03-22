/**
 * 动画混合器
 * 处理动画插值、混合和过渡
 */
export class AnimationBlender {
  constructor() {
    // 上半身骨骼列表
    this.upperBodyBones = [
      'spine', 'spine1', 'spine2', 'neck', 'head',
      'leftShoulder', 'leftUpperArm', 'leftForearm', 'leftHand',
      'rightShoulder', 'rightUpperArm', 'rightForearm', 'rightHand'
    ];

    // 下半身骨骼列表
    this.lowerBodyBones = [
      'hips',
      'leftUpperLeg', 'leftLowerLeg', 'leftFoot', 'leftToe',
      'rightUpperLeg', 'rightLowerLeg', 'rightFoot', 'rightToe'
    ];
  }

  /**
   * 在两个关键帧之间插值
   * @param {Array} keyframes - 关键帧数组
   * @param {number} time - 当前时间
   * @param {boolean} loop - 是否循环
   * @returns {Object} 插值结果
   */
  interpolateKeyframes(keyframes, time, loop = true) {
    if (!keyframes || keyframes.length === 0) return null;

    const duration = keyframes[keyframes.length - 1].time;
    let normalizedTime = time;

    if (loop) {
      normalizedTime = time % duration;
    } else {
      normalizedTime = Math.min(time, duration);
    }

    // 找到当前时间所在的关键帧区间
    let prevFrame = keyframes[0];
    let nextFrame = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (normalizedTime >= keyframes[i].time && normalizedTime < keyframes[i + 1].time) {
        prevFrame = keyframes[i];
        nextFrame = keyframes[i + 1];
        break;
      }
    }

    // 计算插值因子
    const range = nextFrame.time - prevFrame.time;
    const factor = range > 0 ? (normalizedTime - prevFrame.time) / range : 0;

    // 平滑插值（使用 smoothstep）
    const smoothFactor = this.smoothstep(factor);

    // 插值结果
    const result = {};

    if (prevFrame.rotation || nextFrame.rotation) {
      result.rotation = this.interpolateRotation(
        prevFrame.rotation || { x: 0, y: 0, z: 0 },
        nextFrame.rotation || { x: 0, y: 0, z: 0 },
        smoothFactor
      );
    }

    if (prevFrame.position || nextFrame.position) {
      result.position = this.interpolatePosition(
        prevFrame.position || { x: 0, y: 0, z: 0 },
        nextFrame.position || { x: 0, y: 0, z: 0 },
        smoothFactor
      );
    }

    return result;
  }

  /**
   * 旋转插值
   */
  interpolateRotation(from, to, factor) {
    return {
      x: this.lerp(from.x || 0, to.x || 0, factor),
      y: this.lerp(from.y || 0, to.y || 0, factor),
      z: this.lerp(from.z || 0, to.z || 0, factor)
    };
  }

  /**
   * 位置插值
   */
  interpolatePosition(from, to, factor) {
    return {
      x: this.lerp(from.x || 0, to.x || 0, factor),
      y: this.lerp(from.y || 0, to.y || 0, factor),
      z: this.lerp(from.z || 0, to.z || 0, factor)
    };
  }

  /**
   * 线性插值
   */
  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * 平滑插值（smoothstep）
   */
  smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  /**
   * 混合两个动画数据
   * @param {Object} animA - 动画A数据
   * @param {Object} animB - 动画B数据
   * @param {number} weight - B的权重 (0-1)
   * @returns {Object} 混合后的数据
   */
  blendAnimations(animA, animB, weight) {
    const result = {};
    const allBones = new Set([
      ...Object.keys(animA || {}),
      ...Object.keys(animB || {})
    ]);

    allBones.forEach(boneName => {
      const dataA = animA?.[boneName] || {};
      const dataB = animB?.[boneName] || {};

      result[boneName] = {};

      // 混合旋转
      if (dataA.rotation || dataB.rotation) {
        const rotA = dataA.rotation || { x: 0, y: 0, z: 0 };
        const rotB = dataB.rotation || { x: 0, y: 0, z: 0 };
        result[boneName].rotation = {
          x: this.lerp(rotA.x, rotB.x, weight),
          y: this.lerp(rotA.y, rotB.y, weight),
          z: this.lerp(rotA.z, rotB.z, weight)
        };
      }

      // 混合位置
      if (dataA.position || dataB.position) {
        const posA = dataA.position || { x: 0, y: 0, z: 0 };
        const posB = dataB.position || { x: 0, y: 0, z: 0 };
        result[boneName].position = {
          x: this.lerp(posA.x, posB.x, weight),
          y: this.lerp(posA.y, posB.y, weight),
          z: this.lerp(posA.z, posB.z, weight)
        };
      }
    });

    return result;
  }

  /**
   * 叠加动画（用于上半身/下半身分离）
   * @param {Object} baseAnim - 基础动画
   * @param {Object} additiveAnim - 叠加动画
   * @param {string} bodyPart - 'upper' | 'lower' | 'all'
   * @returns {Object} 叠加后的数据
   */
  addAnimation(baseAnim, additiveAnim, bodyPart = 'all') {
    const result = JSON.parse(JSON.stringify(baseAnim || {}));

    if (!additiveAnim) return result;

    const targetBones = bodyPart === 'upper' ? this.upperBodyBones :
                        bodyPart === 'lower' ? this.lowerBodyBones :
                        [...this.upperBodyBones, ...this.lowerBodyBones];

    targetBones.forEach(boneName => {
      if (additiveAnim[boneName]) {
        if (!result[boneName]) result[boneName] = {};

        // 叠加旋转
        if (additiveAnim[boneName].rotation) {
          const baseRot = result[boneName].rotation || { x: 0, y: 0, z: 0 };
          const addRot = additiveAnim[boneName].rotation;
          result[boneName].rotation = {
            x: baseRot.x + addRot.x,
            y: baseRot.y + addRot.y,
            z: baseRot.z + addRot.z
          };
        }

        // 叠加位置
        if (additiveAnim[boneName].position) {
          const basePos = result[boneName].position || { x: 0, y: 0, z: 0 };
          const addPos = additiveAnim[boneName].position;
          result[boneName].position = {
            x: basePos.x + addPos.x,
            y: basePos.y + addPos.y,
            z: basePos.z + addPos.z
          };
        }
      }
    });

    return result;
  }

  /**
   * 计算动画过渡权重
   * @param {number} elapsed - 已过时间
   * @param {number} duration - 过渡持续时间
   * @param {string} easing - 缓动类型
   * @returns {number} 权重 (0-1)
   */
  calculateTransitionWeight(elapsed, duration, easing = 'smooth') {
    const t = Math.min(elapsed / duration, 1);

    switch (easing) {
      case 'linear':
        return t;
      case 'smooth':
        return this.smoothstep(t);
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return 1 - (1 - t) * (1 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      default:
        return this.smoothstep(t);
    }
  }

  /**
   * 评估单个动画在指定时间的骨骼数据
   * @param {Object} animation - 动画数据
   * @param {number} time - 当前时间
   * @returns {Object} 所有骨骼的变换数据
   */
  evaluateAnimation(animation, time) {
    if (!animation || !animation.keyframes) return {};

    const result = {};
    const { keyframes, loop } = animation;

    Object.keys(keyframes).forEach(boneName => {
      const boneKeyframes = keyframes[boneName];
      const interpolated = this.interpolateKeyframes(boneKeyframes, time, loop);
      if (interpolated) {
        result[boneName] = interpolated;
      }
    });

    return result;
  }

  /**
   * 混合多个动画
   * @param {Array} layers - 动画层列表 [{animation, time, weight, blendMode}]
   * @returns {Object} 最终骨骼数据
   */
  blendLayers(layers) {
    if (!layers || layers.length === 0) return {};

    let result = {};

    layers.forEach(layer => {
      const { animation, time, weight = 1, blendMode = 'blend', bodyPart = 'all' } = layer;

      const layerData = this.evaluateAnimation(animation, time);

      switch (blendMode) {
        case 'blend':
          result = this.blendAnimations(result, layerData, weight);
          break;
        case 'additive':
          result = this.addAnimation(result, layerData, bodyPart);
          break;
        case 'override':
          Object.assign(result, layerData);
          break;
      }
    });

    return result;
  }

  /**
   * 应用骨骼变换到实际骨骼
   * @param {Object} bones - 骨骼映射
   * @param {Object} boneData - 骨骼变换数据
   * @param {Object} bindPose - 绑定姿态（可选，用于重置）
   */
  applyToBones(bones, boneData, bindPose = null) {
    Object.keys(boneData).forEach(boneName => {
      const bone = bones[boneName];
      if (!bone) return;

      const data = boneData[boneName];

      // 应用旋转
      if (data.rotation) {
        // 获取绑定姿态旋转作为基础
        const bindRot = bindPose?.[boneName]?.rotation;
        if (bindRot) {
          bone.rotation.x = bindRot.x + data.rotation.x;
          bone.rotation.y = bindRot.y + data.rotation.y;
          bone.rotation.z = bindRot.z + data.rotation.z;
        } else {
          bone.rotation.x = data.rotation.x;
          bone.rotation.y = data.rotation.y;
          bone.rotation.z = data.rotation.z;
        }
      }

      // 应用位置
      if (data.position) {
        const bindPos = bindPose?.[boneName]?.position;
        if (bindPos) {
          bone.position.x = bindPos.x + data.position.x;
          bone.position.y = bindPos.y + data.position.y;
          bone.position.z = bindPos.z + data.position.z;
        } else {
          bone.position.x = data.position.x;
          bone.position.y = data.position.y;
          bone.position.z = data.position.z;
        }
      }
    });
  }

  /**
   * 创建动画混合树节点
   */
  static createBlendNode(type, options = {}) {
    return {
      type: type, // 'clip' | 'blend' | 'additive' | 'override'
      ...options
    };
  }
}