/**
 * AI敌人实体
 */
import { Entity } from './Entity.js';
import { Health } from '../component/Health.js';

export class Enemy extends Entity {
  constructor() {
    super();
    this.health = new Health(100);
    this.aiController = null;
    this.modelGroup = null;
  }

  init() {
    // 创建敌人模型组
    this.modelGroup = new THREE.Group();

    // 身体 - 使用圆柱体代替胶囊体
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.8;
    body.castShadow = true;
    this.modelGroup.add(body);

    // 头部
    const headGeometry = new THREE.SphereGeometry(0.18, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xD2691E,
      roughness: 0.5
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.45;
    head.castShadow = true;
    this.modelGroup.add(head);

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
    switch (ai.state) {
      case 'patrol':
        this.doPatrol(deltaTime);
        break;
      case 'chase':
        this.doChase(deltaTime);
        break;
      case 'attack':
        this.doAttack(deltaTime);
        break;
      case 'flee':
        this.doFlee(deltaTime);
        break;
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
    } else {
      dir.normalize();
      this.position.x += dir.x * ai.moveSpeed * 0.5 * deltaTime;
      this.position.z += dir.z * ai.moveSpeed * 0.5 * deltaTime;
      this.rotation.y = Math.atan2(dir.x, dir.z);
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
  }

  doAttack(deltaTime) {
    // 简单攻击：向玩家射击
    // 实际射击逻辑需要武器系统支持
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
  }

  isDead() {
    return this.health.isDead();
  }
}