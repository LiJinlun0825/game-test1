/**
 * 动画数据库
 * 程序化生成动画关键帧数据
 */
export class AnimationLibrary {
  constructor() {
    this.animations = new Map();
    this.initializeAnimations();
  }

  /**
   * 初始化所有动画
   */
  initializeAnimations() {
    // 基础动作组
    this.addAnimation('idle', this.createIdleAnimation());
    this.addAnimation('walk', this.createWalkAnimation());
    this.addAnimation('run', this.createRunAnimation());
    this.addAnimation('jump', this.createJumpAnimation());
    this.addAnimation('crouch', this.createCrouchAnimation());

    // 战斗动作组
    this.addAnimation('aim', this.createAimAnimation());
    this.addAnimation('shoot', this.createShootAnimation());
    this.addAnimation('reload', this.createReloadAnimation());
    this.addAnimation('hurt', this.createHurtAnimation());
    this.addAnimation('death', this.createDeathAnimation());
  }

  /**
   * 添加动画到库
   */
  addAnimation(name, animation) {
    this.animations.set(name, animation);
  }

  /**
   * 获取动画
   */
  getAnimation(name) {
    return this.animations.get(name);
  }

  /**
   * 创建动画数据结构
   */
  createAnimationData(duration, loop, blendMode = 'blend') {
    return {
      name: '',
      duration: duration,
      loop: loop,
      blendMode: blendMode, // 'blend' | 'additive' | 'override'
      keyframes: {},
      transitions: {}
    };
  }

  // ========== 基础动作 ==========

  /**
   * 待机动画 - 轻微呼吸起伏
   */
  createIdleAnimation() {
    const anim = this.createAnimationData(3.0, true);
    anim.name = 'idle';

    // 脊柱呼吸动画
    anim.keyframes.spine = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 1.5, rotation: { x: 0.02, y: 0, z: 0 } },
      { time: 3.0, rotation: { x: 0, y: 0, z: 0 } }
    ];

    anim.keyframes.spine1 = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 1.5, rotation: { x: 0.01, y: 0, z: 0 } },
      { time: 3.0, rotation: { x: 0, y: 0, z: 0 } }
    ];

    anim.keyframes.spine2 = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 1.5, rotation: { x: 0.01, y: 0, z: 0 } },
      { time: 3.0, rotation: { x: 0, y: 0, z: 0 } }
    ];

    // 头部轻微晃动
    anim.keyframes.head = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 1.0, rotation: { x: 0, y: 0.02, z: 0.01 } },
      { time: 2.0, rotation: { x: 0, y: -0.02, z: -0.01 } },
      { time: 3.0, rotation: { x: 0, y: 0, z: 0 } }
    ];

    // 手臂自然下垂微动
    anim.keyframes.leftUpperArm = [
      { time: 0, rotation: { x: 0, y: 0, z: 0.05 } },
      { time: 1.5, rotation: { x: 0, y: 0, z: 0.08 } },
      { time: 3.0, rotation: { x: 0, y: 0, z: 0.05 } }
    ];

    anim.keyframes.rightUpperArm = [
      { time: 0, rotation: { x: 0, y: 0, z: -0.05 } },
      { time: 1.5, rotation: { x: 0, y: 0, z: -0.08 } },
      { time: 3.0, rotation: { x: 0, y: 0, z: -0.05 } }
    ];

    return anim;
  }

  /**
   * 行走动画
   */
  createWalkAnimation() {
    const anim = this.createAnimationData(1.0, true);
    anim.name = 'walk';

    // 腿部摆动
    anim.keyframes.leftUpperLeg = [
      { time: 0, rotation: { x: 0.3, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: -0.3, y: 0, z: 0 } },
      { time: 1.0, rotation: { x: 0.3, y: 0, z: 0 } }
    ];

    anim.keyframes.rightUpperLeg = [
      { time: 0, rotation: { x: -0.3, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0.3, y: 0, z: 0 } },
      { time: 1.0, rotation: { x: -0.3, y: 0, z: 0 } }
    ];

    anim.keyframes.leftLowerLeg = [
      { time: 0, rotation: { x: -0.2, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0.4, y: 0, z: 0 } },
      { time: 0.75, rotation: { x: 0, y: 0, z: 0 } },
      { time: 1.0, rotation: { x: -0.2, y: 0, z: 0 } }
    ];

    anim.keyframes.rightLowerLeg = [
      { time: 0, rotation: { x: 0.4, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: -0.2, y: 0, z: 0 } },
      { time: 0.75, rotation: { x: 0, y: 0, z: 0 } },
      { time: 1.0, rotation: { x: 0.4, y: 0, z: 0 } }
    ];

    // 手臂摆动
    anim.keyframes.leftUpperArm = [
      { time: 0, rotation: { x: -0.2, y: 0, z: 0.1 } },
      { time: 0.5, rotation: { x: 0.2, y: 0, z: 0.1 } },
      { time: 1.0, rotation: { x: -0.2, y: 0, z: 0.1 } }
    ];

    anim.keyframes.rightUpperArm = [
      { time: 0, rotation: { x: 0.2, y: 0, z: -0.1 } },
      { time: 0.5, rotation: { x: -0.2, y: 0, z: -0.1 } },
      { time: 1.0, rotation: { x: 0.2, y: 0, z: -0.1 } }
    ];

    anim.keyframes.leftForearm = [
      { time: 0, rotation: { x: 0.1, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: -0.1, y: 0, z: 0 } },
      { time: 1.0, rotation: { x: 0.1, y: 0, z: 0 } }
    ];

    anim.keyframes.rightForearm = [
      { time: 0, rotation: { x: -0.1, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0.1, y: 0, z: 0 } },
      { time: 1.0, rotation: { x: -0.1, y: 0, z: 0 } }
    ];

    // 身体上下起伏
    anim.keyframes.hips = [
      { time: 0, position: { x: 0, y: 0, z: 0 } },
      { time: 0.25, position: { x: 0, y: 0.02, z: 0 } },
      { time: 0.5, position: { x: 0, y: 0, z: 0 } },
      { time: 0.75, position: { x: 0, y: 0.02, z: 0 } },
      { time: 1.0, position: { x: 0, y: 0, z: 0 } }
    ];

    // 脊柱轻微摇摆
    anim.keyframes.spine = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0, y: 0.05, z: 0 } },
      { time: 1.0, rotation: { x: 0, y: 0, z: 0 } }
    ];

    return anim;
  }

  /**
   * 奔跑动画
   */
  createRunAnimation() {
    const anim = this.createAnimationData(0.5, true);
    anim.name = 'run';

    // 腿部大幅摆动
    anim.keyframes.leftUpperLeg = [
      { time: 0, rotation: { x: 0.6, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: -0.5, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0.6, y: 0, z: 0 } }
    ];

    anim.keyframes.rightUpperLeg = [
      { time: 0, rotation: { x: -0.5, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: 0.6, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: -0.5, y: 0, z: 0 } }
    ];

    anim.keyframes.leftLowerLeg = [
      { time: 0, rotation: { x: -0.3, y: 0, z: 0 } },
      { time: 0.15, rotation: { x: 0.8, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: 0.6, y: 0, z: 0 } },
      { time: 0.4, rotation: { x: -0.3, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: -0.3, y: 0, z: 0 } }
    ];

    anim.keyframes.rightLowerLeg = [
      { time: 0, rotation: { x: 0.6, y: 0, z: 0 } },
      { time: 0.1, rotation: { x: -0.3, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: -0.3, y: 0, z: 0 } },
      { time: 0.35, rotation: { x: 0.8, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0.6, y: 0, z: 0 } }
    ];

    // 手臂大幅摆动
    anim.keyframes.leftUpperArm = [
      { time: 0, rotation: { x: -0.5, y: 0, z: 0.15 } },
      { time: 0.25, rotation: { x: 0.5, y: 0, z: 0.15 } },
      { time: 0.5, rotation: { x: -0.5, y: 0, z: 0.15 } }
    ];

    anim.keyframes.rightUpperArm = [
      { time: 0, rotation: { x: 0.5, y: 0, z: -0.15 } },
      { time: 0.25, rotation: { x: -0.5, y: 0, z: -0.15 } },
      { time: 0.5, rotation: { x: 0.5, y: 0, z: -0.15 } }
    ];

    anim.keyframes.leftForearm = [
      { time: 0, rotation: { x: 0.3, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: -0.3, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0.3, y: 0, z: 0 } }
    ];

    anim.keyframes.rightForearm = [
      { time: 0, rotation: { x: -0.3, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: 0.3, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: -0.3, y: 0, z: 0 } }
    ];

    // 身体前倾和起伏
    anim.keyframes.spine = [
      { time: 0, rotation: { x: 0.15, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: 0.2, y: 0.03, z: 0 } },
      { time: 0.5, rotation: { x: 0.15, y: 0, z: 0 } }
    ];

    anim.keyframes.hips = [
      { time: 0, position: { x: 0, y: 0, z: 0 } },
      { time: 0.125, position: { x: 0, y: 0.05, z: 0 } },
      { time: 0.25, position: { x: 0, y: 0, z: 0 } },
      { time: 0.375, position: { x: 0, y: 0.05, z: 0 } },
      { time: 0.5, position: { x: 0, y: 0, z: 0 } }
    ];

    return anim;
  }

  /**
   * 跳跃动画 - 三阶段
   */
  createJumpAnimation() {
    const anim = this.createAnimationData(1.0, false);
    anim.name = 'jump';

    // 起跳阶段 (0-0.3)
    // 空中阶段 (0.3-0.7)
    // 落地阶段 (0.7-1.0)

    anim.keyframes.spine = [
      { time: 0, rotation: { x: 0.2, y: 0, z: 0 } },      // 起跳准备
      { time: 0.2, rotation: { x: -0.1, y: 0, z: 0 } },   // 伸展
      { time: 0.5, rotation: { x: 0, y: 0, z: 0 } },      // 空中
      { time: 0.8, rotation: { x: 0.2, y: 0, z: 0 } },    // 落地准备
      { time: 1.0, rotation: { x: 0, y: 0, z: 0 } }       // 恢复
    ];

    anim.keyframes.hips = [
      { time: 0, position: { x: 0, y: -0.1, z: 0 } },     // 下蹲
      { time: 0.2, position: { x: 0, y: 0.1, z: 0 } },    // 跳起
      { time: 0.5, position: { x: 0, y: 0.15, z: 0 } },   // 空中
      { time: 0.8, position: { x: 0, y: 0, z: 0 } },      // 落地
      { time: 1.0, position: { x: 0, y: 0, z: 0 } }
    ];

    // 腿部
    anim.keyframes.leftUpperLeg = [
      { time: 0, rotation: { x: -0.5, y: 0, z: 0 } },     // 起跳蓄力
      { time: 0.3, rotation: { x: 0.4, y: 0, z: 0 } },    // 空中收腿
      { time: 0.7, rotation: { x: 0.3, y: 0, z: 0 } },    // 准备落地
      { time: 1.0, rotation: { x: 0, y: 0, z: 0 } }
    ];

    anim.keyframes.rightUpperLeg = [
      { time: 0, rotation: { x: -0.5, y: 0, z: 0 } },
      { time: 0.3, rotation: { x: 0.4, y: 0, z: 0 } },
      { time: 0.7, rotation: { x: 0.3, y: 0, z: 0 } },
      { time: 1.0, rotation: { x: 0, y: 0, z: 0 } }
    ];

    // 手臂上扬
    anim.keyframes.leftUpperArm = [
      { time: 0, rotation: { x: -0.3, y: 0, z: 0.2 } },
      { time: 0.3, rotation: { x: -0.8, y: 0, z: 0.3 } }, // 手臂上扬
      { time: 0.7, rotation: { x: -0.5, y: 0, z: 0.2 } },
      { time: 1.0, rotation: { x: 0, y: 0, z: 0 } }
    ];

    anim.keyframes.rightUpperArm = [
      { time: 0, rotation: { x: -0.3, y: 0, z: -0.2 } },
      { time: 0.3, rotation: { x: -0.8, y: 0, z: -0.3 } },
      { time: 0.7, rotation: { x: -0.5, y: 0, z: -0.2 } },
      { time: 1.0, rotation: { x: 0, y: 0, z: 0 } }
    ];

    return anim;
  }

  /**
   * 蹲下动画
   */
  createCrouchAnimation() {
    const anim = this.createAnimationData(0.3, false);
    anim.name = 'crouch';

    anim.keyframes.hips = [
      { time: 0, position: { x: 0, y: 0, z: 0 } },
      { time: 0.3, position: { x: 0, y: -0.3, z: 0.1 } }
    ];

    anim.keyframes.spine = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.3, rotation: { x: 0.3, y: 0, z: 0 } }  // 前倾
    ];

    anim.keyframes.leftUpperLeg = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.3, rotation: { x: 1.2, y: 0, z: 0.1 } }
    ];

    anim.keyframes.rightUpperLeg = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.3, rotation: { x: 1.2, y: 0, z: -0.1 } }
    ];

    anim.keyframes.leftLowerLeg = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.3, rotation: { x: -1.5, y: 0, z: 0 } }
    ];

    anim.keyframes.rightLowerLeg = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.3, rotation: { x: -1.5, y: 0, z: 0 } }
    ];

    return anim;
  }

  // ========== 战斗动作 ==========

  /**
   * 瞄准动画
   */
  createAimAnimation() {
    const anim = this.createAnimationData(0.2, true);
    anim.name = 'aim';
    anim.blendMode = 'additive'; // 叠加到基础动画上

    // 上半身朝向目标
    anim.keyframes.spine = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.2, rotation: { x: 0.05, y: 0, z: 0 } }
    ];

    anim.keyframes.spine1 = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.2, rotation: { x: 0.05, y: 0, z: 0 } }
    ];

    anim.keyframes.spine2 = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.2, rotation: { x: 0.05, y: 0, z: 0 } }
    ];

    // 右臂举起瞄准
    anim.keyframes.rightUpperArm = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.2, rotation: { x: -1.2, y: 0.1, z: -0.1 } }
    ];

    anim.keyframes.rightForearm = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.2, rotation: { x: -0.5, y: 0, z: 0 } }
    ];

    anim.keyframes.rightHand = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.2, rotation: { x: 0, y: 0, z: 0 } }
    ];

    // 左臂支撑
    anim.keyframes.leftUpperArm = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.2, rotation: { x: -0.8, y: 0.2, z: 0.3 } }
    ];

    anim.keyframes.leftForearm = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.2, rotation: { x: -0.6, y: 0, z: 0 } }
    ];

    // 头部朝向目标
    anim.keyframes.head = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.2, rotation: { x: -0.05, y: 0, z: 0 } }
    ];

    return anim;
  }

  /**
   * 射击动画 - 后坐力
   */
  createShootAnimation() {
    const anim = this.createAnimationData(0.15, false);
    anim.name = 'shoot';

    // 后坐力效果
    anim.keyframes.rightUpperArm = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.03, rotation: { x: 0.15, y: 0, z: 0 } },  // 快速后坐
      { time: 0.15, rotation: { x: 0, y: 0, z: 0 } }      // 恢复
    ];

    anim.keyframes.rightForearm = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.03, rotation: { x: 0.1, y: 0, z: 0 } },
      { time: 0.15, rotation: { x: 0, y: 0, z: 0 } }
    ];

    // 身体轻微后仰
    anim.keyframes.spine2 = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.03, rotation: { x: 0.03, y: 0, z: 0 } },
      { time: 0.15, rotation: { x: 0, y: 0, z: 0 } }
    ];

    return anim;
  }

  /**
   * 换弹动画
   */
  createReloadAnimation() {
    const anim = this.createAnimationData(1.5, false);
    anim.name = 'reload';

    // 左手去拿弹夹
    anim.keyframes.leftUpperArm = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.3, rotation: { x: -0.5, y: -0.3, z: 0.5 } },
      { time: 0.6, rotation: { x: -0.8, y: -0.2, z: 0.4 } },
      { time: 1.0, rotation: { x: -0.5, y: 0, z: 0.3 } },
      { time: 1.5, rotation: { x: 0, y: 0, z: 0 } }
    ];

    anim.keyframes.leftForearm = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.3, rotation: { x: 0.5, y: 0, z: 0 } },
      { time: 0.8, rotation: { x: 0.8, y: 0, z: 0 } },
      { time: 1.2, rotation: { x: 0.3, y: 0, z: 0 } },
      { time: 1.5, rotation: { x: 0, y: 0, z: 0 } }
    ];

    // 右手配合
    anim.keyframes.rightUpperArm = [
      { time: 0, rotation: { x: -1.2, y: 0.1, z: -0.1 } },
      { time: 0.5, rotation: { x: -1.0, y: 0.2, z: 0 } },
      { time: 1.0, rotation: { x: -1.3, y: 0.1, z: -0.1 } },
      { time: 1.5, rotation: { x: -1.2, y: 0.1, z: -0.1 } }
    ];

    // 头部看向武器
    anim.keyframes.head = [
      { time: 0, rotation: { x: -0.05, y: 0, z: 0 } },
      { time: 0.3, rotation: { x: 0.2, y: -0.3, z: 0 } },
      { time: 1.2, rotation: { x: 0.2, y: -0.3, z: 0 } },
      { time: 1.5, rotation: { x: -0.05, y: 0, z: 0 } }
    ];

    return anim;
  }

  /**
   * 受伤动画
   */
  createHurtAnimation() {
    const anim = this.createAnimationData(0.5, false);
    anim.name = 'hurt';

    // 身体后仰
    anim.keyframes.spine = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.1, rotation: { x: -0.15, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0, y: 0, z: 0 } }
    ];

    anim.keyframes.spine1 = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.1, rotation: { x: -0.1, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0, y: 0, z: 0 } }
    ];

    // 踉跄
    anim.keyframes.hips = [
      { time: 0, position: { x: 0, y: 0, z: 0 } },
      { time: 0.1, position: { x: 0, y: -0.05, z: -0.1 } },
      { time: 0.3, position: { x: 0.05, y: 0, z: 0 } },
      { time: 0.5, position: { x: 0, y: 0, z: 0 } }
    ];

    // 头部晃动
    anim.keyframes.head = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.1, rotation: { x: -0.2, y: 0.1, z: 0.1 } },
      { time: 0.5, rotation: { x: 0, y: 0, z: 0 } }
    ];

    return anim;
  }

  /**
   * 死亡动画
   */
  createDeathAnimation() {
    const anim = this.createAnimationData(1.5, false);
    anim.name = 'death';

    // 身体瘫软倒下
    anim.keyframes.spine = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.3, rotation: { x: 0.3, y: 0, z: 0.2 } },
      { time: 0.8, rotation: { x: 0.8, y: 0.1, z: 0.3 } },
      { time: 1.5, rotation: { x: 1.2, y: 0, z: 0.2 } }
    ];

    anim.keyframes.spine1 = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.4, rotation: { x: 0.2, y: 0, z: 0.1 } },
      { time: 1.0, rotation: { x: 0.5, y: 0, z: 0.2 } },
      { time: 1.5, rotation: { x: 0.6, y: 0, z: 0.1 } }
    ];

    anim.keyframes.hips = [
      { time: 0, position: { x: 0, y: 0, z: 0 } },
      { time: 0.5, position: { x: 0, y: -0.3, z: 0 } },
      { time: 1.0, position: { x: 0, y: -0.7, z: 0.3 } },
      { time: 1.5, position: { x: 0, y: -0.85, z: 0.5 } }
    ];

    // 腿部瘫软
    anim.keyframes.leftUpperLeg = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: -0.3, y: 0, z: 0.2 } },
      { time: 1.5, rotation: { x: -0.5, y: 0.1, z: 0.3 } }
    ];

    anim.keyframes.rightUpperLeg = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: -0.3, y: 0, z: -0.2 } },
      { time: 1.5, rotation: { x: -0.5, y: -0.1, z: -0.3 } }
    ];

    // 手臂垂下
    anim.keyframes.leftUpperArm = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0.3, y: 0, z: 0.3 } },
      { time: 1.5, rotation: { x: 0.5, y: 0, z: 0.5 } }
    ];

    anim.keyframes.rightUpperArm = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0.3, y: 0, z: -0.3 } },
      { time: 1.5, rotation: { x: 0.5, y: 0, z: -0.5 } }
    ];

    // 头部垂下
    anim.keyframes.head = [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: -0.3, y: 0, z: 0 } },
      { time: 1.5, rotation: { x: -0.5, y: 0, z: 0 } }
    ];

    return anim;
  }

  /**
   * 获取动画名称列表
   */
  getAnimationNames() {
    return Array.from(this.animations.keys());
  }

  /**
   * 检查动画是否存在
   */
  hasAnimation(name) {
    return this.animations.has(name);
  }
}