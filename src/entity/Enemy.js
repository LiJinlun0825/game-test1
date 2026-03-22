/**
 * AI敌人实体
 */
import { Entity } from './Entity.js';
import { Health } from '../component/Health.js';
import { HumanModelFactory } from '../model/HumanModelFactory.js';

export class Enemy extends Entity {
  constructor() {
    super();
    this.health = new Health(100);
    this.aiController = null;
    this.modelGroup = null;

    // 动画状态
    this.walkCycle = 0;
    this.walkSpeed = 8;
  }

  init() {
    // 随机敌人外观
    const skinColors = [0xE8C8A8, 0xD4A574, 0xC68642, 0x8D5524, 0xFFDBB4];
    const shirtColors = [0x8B4513, 0x556B2F, 0x4A4A6A, 0x6B3A3A, 0x3A5A5A];
    const pantsColors = [0x2F2F2F, 0x3A3A5A, 0x4A4A4A, 0x5A4A3A];

    const skinColor = skinColors[Math.floor(Math.random() * skinColors.length)];
    const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
    const pantsColor = pantsColors[Math.floor(Math.random() * pantsColors.length)];

    // 使用新的人物模型工厂创建模型
    this.modelGroup = HumanModelFactory.createHumanModel({
      skinColor: skinColor,
      shirtColor: shirtColor,
      pantsColor: pantsColor,
      hairColor: Math.random() > 0.5 ? 0x2A1A0A : 0x4A3A2A,
      isEnemy: true
    });

    this.object3D.add(this.modelGroup);
  }

  initAI(world, player) {
    // 简单AI控制器
    this.aiController = {
      world: world,
      player: player,
      state: 'patrol',
      detectionRange: 50,
      attackRange: 30,
      moveSpeed: 3,
      patrolTarget: null,
      fireRate: 2,
      lastFireTime: 0
    };
    this.setNewPatrolTarget();
  }

  setNewPatrolTarget() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 100;
    this.aiController.patrolTarget = new THREE.Vector3(
      Math.cos(angle) * dist,
      0,
      Math.sin(angle) * dist
    );
  }

  setState(state) {
    if (this.aiController) {
      this.aiController.state = state;
    }
  }

  update(deltaTime) {
    if (!this.aiController || this.isDead()) return;

    const ai = this.aiController;
    const distToPlayer = this.position.distanceTo(ai.player.position);

    // 状态机
    if (this.health.getHealthPercent() < 0.3) {
      ai.state = 'flee';
    } else if (distToPlayer <= ai.attackRange) {
      ai.state = 'attack';
    } else if (distToPlayer <= ai.detectionRange) {
      ai.state = 'chase';
    }

    // 执行行为
    let isMoving = false;
    switch (ai.state) {
      case 'patrol':
        isMoving = this.doPatrol(deltaTime);
        break;
      case 'chase':
        isMoving = this.doChase(deltaTime);
        break;
      case 'attack':
        this.doAttack(deltaTime);
        break;
      case 'flee':
        isMoving = this.doFlee(deltaTime);
        break;
    }

    // 更新行走动画
    if (isMoving) {
      this.walkCycle += deltaTime * this.walkSpeed;
      this.updateWalkAnimation();
    }

    // 更新模型朝向
    if (ai.state === 'chase' || ai.state === 'attack') {
      const dir = new THREE.Vector3()
        .subVectors(ai.player.position, this.position);
      if (dir.length() > 0.1) {
        this.rotation.y = Math.atan2(dir.x, dir.z);
      }
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

    const swing = Math.sin(this.walkCycle) * 0.4;

    if (leftLeg) leftLeg.rotation.x = swing;
    if (rightLeg) rightLeg.rotation.x = -swing;
    if (leftArm) leftArm.rotation.x = -swing * 0.5;
    if (rightArm) rightArm.rotation.x = swing * 0.5;
  }

  doPatrol(deltaTime) {
    const ai = this.aiController;
    if (!ai.patrolTarget) {
      this.setNewPatrolTarget();
    }

    const dir = new THREE.Vector3()
      .subVectors(ai.patrolTarget, this.position);
    dir.y = 0;

    if (dir.length() < 2) {
      this.setNewPatrolTarget();
      return false;
    } else {
      dir.normalize();
      this.position.x += dir.x * ai.moveSpeed * 0.5 * deltaTime;
      this.position.z += dir.z * ai.moveSpeed * 0.5 * deltaTime;
      this.rotation.y = Math.atan2(dir.x, dir.z);
      return true;
    }
  }

  doChase(deltaTime) {
    const ai = this.aiController;
    const dir = new THREE.Vector3()
      .subVectors(ai.player.position, this.position);
    dir.y = 0;
    dir.normalize();

    this.position.x += dir.x * ai.moveSpeed * deltaTime;
    this.position.z += dir.z * ai.moveSpeed * deltaTime;

    // 边界限制
    this.position.x = Math.max(-240, Math.min(240, this.position.x));
    this.position.z = Math.max(-240, Math.min(240, this.position.z));

    return true;
  }

  doAttack(deltaTime) {
    // 简单攻击：向玩家射击
    // 实际射击逻辑需要武器系统支持
    return false;
  }

  doFlee(deltaTime) {
    const ai = this.aiController;
    const dir = new THREE.Vector3()
      .subVectors(this.position, ai.player.position);
    dir.y = 0;
    dir.normalize();

    this.position.x += dir.x * ai.moveSpeed * deltaTime;
    this.position.z += dir.z * ai.moveSpeed * deltaTime;

    // 边界限制
    this.position.x = Math.max(-240, Math.min(240, this.position.x));
    this.position.z = Math.max(-240, Math.min(240, this.position.z));

    return true;
  }

  isDead() {
    return this.health.isDead();
  }
}