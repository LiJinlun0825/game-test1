/**
 * 玩家实体
 */
import { Entity } from './Entity.js';
import { Health } from '../component/Health.js';
import { CharacterController } from '../component/CharacterController.js';
import { WeaponController } from '../component/WeaponController.js';
import { HumanModelFactory } from '../model/HumanModelFactory.js';

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

    // 动画状态
    this.walkCycle = 0;
    this.walkSpeed = 10;
  }

  init() {
    // 使用人物模型工厂创建模型（玩家专属外观）
    this.modelGroup = HumanModelFactory.createHumanModel({
      skinColor: 0xE8C8A8,
      shirtColor: 0x4A7A4A,  // 军绿色衬衫
      pantsColor: 0x4A4A3A,  // 深绿色裤子
      hairColor: 0x2A1A0A,
      isEnemy: false,
      isPlayer: true
    });

    this.object3D.add(this.modelGroup);

    console.log('Player initialized');
  }

  update(deltaTime) {
    this.characterController.update(deltaTime);
    this.weaponController.update(deltaTime, 0);

    // 更新行走动画
    const velocity = this.characterController.velocity;
    const isMoving = Math.abs(velocity.x) > 0.1 || Math.abs(velocity.z) > 0.1;

    if (isMoving) {
      this.walkCycle += deltaTime * this.walkSpeed;
      this.updateWalkAnimation();
    }

    super.update(deltaTime);
  }

  /**
   * 更新行走动画
   */
  updateWalkAnimation() {
    if (!this.modelGroup) return;

    // 获取四肢
    const leftLeg = this.modelGroup.getObjectByName('left-leg');
    const rightLeg = this.modelGroup.getObjectByName('right-leg');
    const leftArm = this.modelGroup.getObjectByName('left-arm');
    const rightArm = this.modelGroup.getObjectByName('right-arm');

    const swing = Math.sin(this.walkCycle) * 0.3;

    if (leftLeg) leftLeg.rotation.x = swing;
    if (rightLeg) rightLeg.rotation.x = -swing;
    if (leftArm) leftArm.rotation.x = -swing * 0.5;
    if (rightArm) rightArm.rotation.x = swing * 0.5;
  }

  isDead() {
    return this.health.isDead();
  }
}