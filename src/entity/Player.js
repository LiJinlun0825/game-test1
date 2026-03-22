/**
 * 玩家实体
 */
import { Entity } from './Entity.js';
import { Health } from '../component/Health.js';
import { CharacterController } from '../component/CharacterController.js';
import { WeaponController } from '../component/WeaponController.js';
import { HumanModelFactory } from '../model/HumanModelFactory.js';
import { AnimationController } from '../animation/AnimationController.js';

export class Player extends Entity {
  constructor() {
    super();
    this.id = 'player';
    this.health = new Health(100);
    this.characterController = new CharacterController();
    this.weaponController = new WeaponController();
    this.cameraController = null;

    this.characterController.setEntity(this);
    this.weaponController.setEntity(this);

    // 骨骼动画系统
    this.animationController = null;
    this.skeletonData = null;

    // 状态追踪
    this.lastIsMoving = false;
    this.lastIsSprinting = false;
    this.lastIsAiming = false;
  }

  init() {
    // 使用人物模型工厂创建带骨骼的模型（玩家专属外观）
    this.skeletonData = HumanModelFactory.createSkinnedHumanModel({
      skinColor: 0xE8C8A8,
      shirtColor: 0x4A7A4A,  // 军绿色衬衫
      pantsColor: 0x4A4A3A,  // 深绿色裤子
      hairColor: 0x2A1A0A,
      isEnemy: false,
      isPlayer: true,
      height: 1.75
    });

    this.modelGroup = this.skeletonData.model;

    // 创建动画控制器
    this.animationController = new AnimationController(
      this.skeletonData.bones,
      this.skeletonData.bindPose
    );

    this.object3D.add(this.modelGroup);

    console.log('Player initialized with skeletal animation');
  }

  update(deltaTime) {
    this.characterController.update(deltaTime);
    this.weaponController.update(deltaTime, 0);

    // 更新动画
    this.updateAnimation(deltaTime);

    super.update(deltaTime);
  }

  /**
   * 更新动画状态
   */
  updateAnimation(deltaTime) {
    if (!this.animationController) return;

    const velocity = this.characterController.velocity;
    const isMoving = Math.abs(velocity.x) > 0.1 || Math.abs(velocity.z) > 0.1;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);

    // 检测是否在冲刺
    const isSprinting = this.characterController.isSprinting || speed > 5;

    // 检测瞄准状态
    const isAiming = this.weaponController?.getIsAiming?.() || false;

    // 更新移动动画
    if (isMoving !== this.lastIsMoving || isSprinting !== this.lastIsSprinting) {
      if (!isMoving) {
        this.animationController.setState('idle');
      } else if (isSprinting) {
        this.animationController.setState('run');
      } else {
        this.animationController.setState('walk');
      }
    }

    // 更新瞄准状态
    if (isAiming !== this.lastIsAiming) {
      if (isAiming) {
        this.animationController.startAiming();
      } else {
        this.animationController.stopAiming();
      }
    }

    // 更新动画时间（根据移动速度调整）
    if (isMoving) {
      const animSpeed = Math.max(0.5, speed / 3);
      this.animationController.setPlaybackSpeed(animSpeed);
    } else {
      this.animationController.setPlaybackSpeed(1.0);
    }

    // 保存状态
    this.lastIsMoving = isMoving;
    this.lastIsSprinting = isSprinting;
    this.lastIsAiming = isAiming;

    // 更新动画控制器
    this.animationController.update(deltaTime);
  }

  /**
   * 触发射击动画
   */
  triggerShootAnimation() {
    if (this.animationController) {
      this.animationController.triggerShoot();
    }
  }

  /**
   * 触发换弹动画
   */
  triggerReloadAnimation() {
    if (this.animationController) {
      this.animationController.triggerReload();
    }
  }

  /**
   * 触发受伤动画
   */
  triggerHurtAnimation() {
    if (this.animationController) {
      this.animationController.triggerHurt();
    }
  }

  /**
   * 触发死亡动画
   */
  triggerDeathAnimation() {
    if (this.animationController) {
      this.animationController.triggerDeath();
    }
  }

  /**
   * 获取动画调试信息
   */
  getAnimationDebugInfo() {
    if (!this.animationController) return null;
    return this.animationController.getDebugInfo();
  }

  isDead() {
    return this.health.isDead();
  }
}