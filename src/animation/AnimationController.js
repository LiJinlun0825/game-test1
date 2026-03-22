/**
 * 动画控制器
 * 管理动画状态机、过渡和多层混合
 */
import { AnimationLibrary } from './AnimationLibrary.js';
import { AnimationBlender } from './AnimationBlender.js';

/**
 * 动画状态定义
 */
const AnimationStates = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run',
  JUMP: 'jump',
  CROUCH: 'crouch',
  AIM: 'aim',
  SHOOT: 'shoot',
  RELOAD: 'reload',
  HURT: 'hurt',
  DEATH: 'death'
};

/**
 * 动画状态机配置
 */
const StateTransitions = {
  // 从任意状态可以过渡到
  any: {
    hurt: { duration: 0.1 },
    death: { duration: 0.2 }
  },
  // 状态转换规则
  idle: {
    walk: { duration: 0.2 },
    run: { duration: 0.15 },
    jump: { duration: 0.1 },
    crouch: { duration: 0.2 },
    aim: { duration: 0.1, mode: 'additive' }
  },
  walk: {
    idle: { duration: 0.2 },
    run: { duration: 0.2 },
    jump: { duration: 0.1 },
    crouch: { duration: 0.2 },
    aim: { duration: 0.1, mode: 'additive' }
  },
  run: {
    idle: { duration: 0.15 },
    walk: { duration: 0.2 },
    jump: { duration: 0.1 },
    aim: { duration: 0.1, mode: 'additive' }
  },
  jump: {
    idle: { duration: 0.2 },
    walk: { duration: 0.2 },
    run: { duration: 0.15 }
  },
  crouch: {
    idle: { duration: 0.2 }
  },
  aim: {
    idle: { duration: 0.1 },
    walk: { duration: 0.1 },
    run: { duration: 0.1 },
    shoot: { duration: 0.05 }
  },
  shoot: {
    aim: { duration: 0.1 }
  },
  reload: {
    aim: { duration: 0.2 }
  },
  hurt: {
    idle: { duration: 0.3 }
  }
};

export class AnimationController {
  constructor(bones, bindPose = null) {
    this.library = new AnimationLibrary();
    this.blender = new AnimationBlender();
    this.bones = bones;
    this.bindPose = bindPose;

    // 当前状态
    this.currentState = AnimationStates.IDLE;
    this.previousState = null;
    this.currentTime = 0;

    // 过渡状态
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionDuration = 0.2;
    this.transitionFromState = null;
    this.transitionFromTime = 0;

    // 动画速度
    this.playbackSpeed = 1.0;

    // 上半身动作状态（独立于下半身）
    this.upperBodyState = null;
    this.upperBodyTime = 0;
    this.upperBodyActive = false;

    // 混合权重
    this.upperBodyWeight = 1.0;

    // 回调
    this.onStateChange = null;
    this.onAnimationComplete = null;
  }

  /**
   * 设置动画状态
   * @param {string} stateName - 目标状态名称
   * @param {boolean} force - 是否强制切换（不经过过渡）
   */
  setState(stateName, force = false) {
    if (!this.library.hasAnimation(stateName)) {
      console.warn(`Animation "${stateName}" not found`);
      return;
    }

    if (stateName === this.currentState && !force) {
      return;
    }

    // 检查是否是上半身动作
    if (this.isUpperBodyAnimation(stateName)) {
      this.setUpperBodyState(stateName);
      return;
    }

    // 查找过渡配置
    const transition = this.getTransition(this.currentState, stateName);

    if (transition && !force) {
      this.startTransition(stateName, transition);
    } else {
      this.immediateTransition(stateName);
    }
  }

  /**
   * 检查是否是上半身动画
   */
  isUpperBodyAnimation(stateName) {
    return ['aim', 'shoot', 'reload'].includes(stateName);
  }

  /**
   * 设置上半身动画状态
   */
  setUpperBodyState(stateName) {
    this.upperBodyState = stateName;
    this.upperBodyTime = 0;
    this.upperBodyActive = true;
  }

  /**
   * 清除上半身动画
   */
  clearUpperBodyState() {
    this.upperBodyState = null;
    this.upperBodyActive = false;
  }

  /**
   * 获取过渡配置
   */
  getTransition(fromState, toState) {
    // 检查任意状态过渡
    if (StateTransitions.any && StateTransitions.any[toState]) {
      return StateTransitions.any[toState];
    }

    // 检查特定状态过渡
    if (StateTransitions[fromState] && StateTransitions[fromState][toState]) {
      return StateTransitions[fromState][toState];
    }

    // 默认过渡
    return { duration: 0.2 };
  }

  /**
   * 开始过渡
   */
  startTransition(toState, transition) {
    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.transitionDuration = transition.duration || 0.2;
    this.transitionFromState = this.currentState;
    this.transitionFromTime = this.currentTime;
    this.previousState = this.currentState;
    this.currentState = toState;
    this.currentTime = 0;

    if (this.onStateChange) {
      this.onStateChange(this.previousState, this.currentState);
    }
  }

  /**
   * 立即切换状态
   */
  immediateTransition(stateName) {
    this.previousState = this.currentState;
    this.currentState = stateName;
    this.currentTime = 0;
    this.isTransitioning = false;

    if (this.onStateChange) {
      this.onStateChange(this.previousState, this.currentState);
    }
  }

  /**
   * 更新动画
   * @param {number} deltaTime - 时间增量
   */
  update(deltaTime) {
    const scaledDelta = deltaTime * this.playbackSpeed;

    // 更新主动画时间
    this.currentTime += scaledDelta;

    // 更新上半身动画时间
    if (this.upperBodyActive && this.upperBodyState) {
      this.upperBodyTime += scaledDelta;
    }

    // 更新过渡
    if (this.isTransitioning) {
      this.transitionProgress += scaledDelta / this.transitionDuration;

      if (this.transitionProgress >= 1) {
        this.transitionProgress = 1;
        this.isTransitioning = false;
        this.transitionFromState = null;
      }
    }

    // 计算并应用骨骼变换
    const boneData = this.computeBoneTransforms();
    this.blender.applyToBones(this.bones, boneData, this.bindPose);
  }

  /**
   * 计算骨骼变换
   * @returns {Object} 骨骼变换数据
   */
  computeBoneTransforms() {
    const currentAnim = this.library.getAnimation(this.currentState);
    if (!currentAnim) return {};

    let result = {};

    // 计算当前动画的骨骼数据
    const currentData = this.blender.evaluateAnimation(currentAnim, this.currentTime);

    // 处理过渡
    if (this.isTransitioning && this.transitionFromState) {
      const fromAnim = this.library.getAnimation(this.transitionFromState);
      if (fromAnim) {
        const fromData = this.blender.evaluateAnimation(fromAnim, this.transitionFromTime);
        const weight = this.blender.calculateTransitionWeight(
          this.transitionProgress * this.transitionDuration,
          this.transitionDuration,
          'smooth'
        );
        result = this.blender.blendAnimations(fromData, currentData, weight);
      }
    } else {
      result = currentData;
    }

    // 应用上半身动画（叠加模式）
    if (this.upperBodyActive && this.upperBodyState) {
      const upperAnim = this.library.getAnimation(this.upperBodyState);
      if (upperAnim) {
        const upperData = this.blender.evaluateAnimation(upperAnim, this.upperBodyTime);

        // 检查上半身动画是否结束（非循环动画）
        if (!upperAnim.loop && this.upperBodyTime >= upperAnim.duration) {
          // 动画完成，返回到瞄准状态或清除
          if (this.upperBodyState === 'shoot') {
            this.setUpperBodyState('aim');
          } else if (this.upperBodyState === 'reload') {
            this.clearUpperBodyState();
          }
        } else {
          // 叠加上半身动画
          result = this.blender.addAnimation(result, upperData, 'upper');
        }
      }
    }

    return result;
  }

  /**
   * 获取当前状态
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * 获取当前动画进度
   */
  getProgress() {
    const anim = this.library.getAnimation(this.currentState);
    if (!anim) return 0;
    return this.currentTime / anim.duration;
  }

  /**
   * 设置播放速度
   */
  setPlaybackSpeed(speed) {
    this.playbackSpeed = Math.max(0.1, Math.min(3.0, speed));
  }

  /**
   * 设置动画时间（用于同步）
   */
  setTime(time) {
    const anim = this.library.getAnimation(this.currentState);
    if (!anim) return;

    if (anim.loop) {
      this.currentTime = time % anim.duration;
    } else {
      this.currentTime = Math.min(time, anim.duration);
    }
  }

  /**
   * 重置动画控制器
   */
  reset() {
    this.currentState = AnimationStates.IDLE;
    this.previousState = null;
    this.currentTime = 0;
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionFromState = null;
    this.upperBodyState = null;
    this.upperBodyActive = false;

    // 重置骨骼到绑定姿态
    if (this.bones && this.bindPose) {
      Object.keys(this.bindPose).forEach(boneName => {
        if (this.bones[boneName]) {
          const pose = this.bindPose[boneName];
          this.bones[boneName].position.copy(pose.position);
          this.bones[boneName].rotation.copy(pose.rotation);
        }
      });
    }
  }

  /**
   * 触发射击动画
   */
  triggerShoot() {
    this.setUpperBodyState('shoot');
  }

  /**
   * 触发换弹动画
   */
  triggerReload() {
    this.setUpperBodyState('reload');
  }

  /**
   * 触发受伤动画
   */
  triggerHurt() {
    this.setState('hurt');
  }

  /**
   * 触发死亡动画
   */
  triggerDeath() {
    this.setState('death', true);
  }

  /**
   * 开始瞄准
   */
  startAiming() {
    this.setUpperBodyState('aim');
  }

  /**
   * 停止瞄准
   */
  stopAiming() {
    if (this.upperBodyState === 'aim') {
      this.clearUpperBodyState();
    }
  }

  /**
   * 根据移动速度自动选择行走/奔跑动画
   * @param {number} speed - 移动速度
   * @param {boolean} isSprinting - 是否在冲刺
   */
  setMovementState(speed, isSprinting = false) {
    if (speed < 0.1) {
      this.setState('idle');
    } else if (isSprinting || speed > 5) {
      this.setState('run');
    } else {
      this.setState('walk');
    }
  }

  /**
   * 获取动画调试信息
   */
  getDebugInfo() {
    return {
      currentState: this.currentState,
      currentTime: this.currentTime.toFixed(2),
      previousState: this.previousState,
      isTransitioning: this.isTransitioning,
      transitionProgress: this.isTransitioning ? (this.transitionProgress * 100).toFixed(0) + '%' : 'N/A',
      upperBodyState: this.upperBodyState || 'none',
      playbackSpeed: this.playbackSpeed.toFixed(2)
    };
  }

  /**
   * 获取所有可用动画
   */
  getAvailableAnimations() {
    return this.library.getAnimationNames();
  }
}

// 导出状态常量
export { AnimationStates };