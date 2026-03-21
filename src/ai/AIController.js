/**
 * AI状态枚举
 */
export const AIState = {
  IDLE: 'idle',
  PATROL: 'patrol',
  INVESTIGATE: 'investigate',
  COMBAT: 'combat',
  FLEE: 'flee',
  DEAD: 'dead'
};

/**
 * AI控制器
 * 处理AI行为和决策
 */
export class AIController {
  constructor() {
    this.entity = null;

    // AI状态
    this.state = AIState.IDLE;
    this.previousState = AIState.IDLE;

    // 感知参数
    this.viewDistance = 100;       // 视野距离
    this.viewAngle = Math.PI / 3;  // 视野角度（60度）
    this.hearingDistance = 50;     // 听觉距离
    this.memoryTime = 10;          // 记忆时间（秒）

    // 巡逻参数
    this.patrolPoints = [];
    this.currentPatrolIndex = 0;
    this.patrolWaitTime = 0;

    // 目标
    this.target = null;
    this.lastKnownTargetPos = null;
    this.lastSeenTime = 0;

    // 战斗参数
    this.shootCooldown = 0;
    this.burstCount = 0;
    this.burstSize = 3;

    // 移动参数
    this.moveSpeed = 3;
    this.runSpeed = 6;
    this.turnSpeed = 3;

    // 路径
    this.currentPath = [];
    this.pathIndex = 0;
  }

  /**
   * 设置所属实体
   */
  setEntity(entity) {
    this.entity = entity;
  }

  /**
   * 初始化
   */
  init() {
    // 初始化完成
  }

  /**
   * 设置世界引用
   */
  setWorld(world) {
    this.world = world;
  }

  /**
   * 设置目标
   */
  setTarget(target) {
    this.target = target;
  }

  /**
   * 添加巡逻点
   */
  addPatrolPoint(point) {
    this.patrolPoints.push(point);
  }

  /**
   * 设置巡逻点
   */
  setPatrolPoints(points) {
    this.patrolPoints = points;
  }

  /**
   * 更新AI
   */
  update(deltaTime) {
    // 更新状态机
    switch (this.state) {
      case AIState.IDLE:
        this.updateIdle(deltaTime);
        break;
      case AIState.PATROL:
        this.updatePatrol(deltaTime);
        break;
      case AIState.INVESTIGATE:
        this.updateInvestigate(deltaTime);
        break;
      case AIState.COMBAT:
        this.updateCombat(deltaTime);
        break;
      case AIState.FLEE:
        this.updateFlee(deltaTime);
        break;
    }

    // 更新射击冷却
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime;
    }

    // 检测玩家
    this.detectPlayer();

    // 检查血量，决定是否逃跑
    if (this.entity.health && this.entity.health.getHealthPercent() < 0.2) {
      if (this.state !== AIState.FLEE && this.state !== AIState.DEAD) {
        this.setState(AIState.FLEE);
      }
    }
  }

  /**
   * 更新空闲状态
   */
  updateIdle(deltaTime) {
    // 有巡逻点就切换到巡逻
    if (this.patrolPoints.length > 0) {
      this.setState(AIState.PATROL);
      return;
    }

    // 检查是否看到敌人
    if (this.target && this.canSeeTarget()) {
      this.setState(AIState.COMBAT);
    }
  }

  /**
   * 更新巡逻状态
   */
  updatePatrol(deltaTime) {
    if (this.patrolPoints.length === 0) {
      this.setState(AIState.IDLE);
      return;
    }

    // 检查是否看到敌人
    if (this.target && this.canSeeTarget()) {
      this.setState(AIState.COMBAT);
      return;
    }

    // 等待
    if (this.patrolWaitTime > 0) {
      this.patrolWaitTime -= deltaTime;
      return;
    }

    // 移动到下一个巡逻点
    const targetPoint = this.patrolPoints[this.currentPatrolIndex];
    if (this.moveToPoint(targetPoint, this.moveSpeed, deltaTime)) {
      // 到达巡逻点，等待一会
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
      this.patrolWaitTime = 2 + Math.random() * 3;
    }
  }

  /**
   * 更新调查状态
   */
  updateInvestigate(deltaTime) {
    if (!this.lastKnownTargetPos) {
      this.setState(AIState.PATROL);
      return;
    }

    // 检查是否看到敌人
    if (this.target && this.canSeeTarget()) {
      this.setState(AIState.COMBAT);
      return;
    }

    // 移动到最后知道的位置
    if (this.moveToPoint(this.lastKnownTargetPos, this.runSpeed, deltaTime)) {
      // 到达位置但没看到敌人，返回巡逻
      this.lastKnownTargetPos = null;
      this.setState(AIState.PATROL);
    }

    // 记忆超时
    if (Date.now() / 1000 - this.lastSeenTime > this.memoryTime) {
      this.lastKnownTargetPos = null;
      this.setState(AIState.PATROL);
    }
  }

  /**
   * 更新战斗状态
   */
  updateCombat(deltaTime) {
    if (!this.target) {
      this.setState(AIState.PATROL);
      return;
    }

    // 检查是否能看到目标
    if (!this.canSeeTarget()) {
      // 丢失目标，记录最后位置
      this.lastKnownTargetPos = this.target.position.clone();
      this.lastSeenTime = Date.now() / 1000;
      this.setState(AIState.INVESTIGATE);
      return;
    }

    // 更新最后看到的位置
    this.lastKnownTargetPos = this.target.position.clone();
    this.lastSeenTime = Date.now() / 1000;

    // 面向目标
    this.lookAt(this.target.position);

    // 保持距离
    const distance = this.entity.position.distanceTo(this.target.position);
    const idealDistance = 30;

    if (distance < idealDistance - 10) {
      // 太近，后退
      this.moveAwayFrom(this.target.position, this.moveSpeed * 0.5, deltaTime);
    } else if (distance > idealDistance + 20) {
      // 太远，靠近
      this.moveToPoint(this.target.position, this.runSpeed, deltaTime);
    }

    // 射击
    if (this.shootCooldown <= 0) {
      this.shoot();
      this.burstCount++;

      if (this.burstCount >= this.burstSize) {
        this.burstCount = 0;
        this.shootCooldown = 0.5 + Math.random() * 1.5;
      } else {
        this.shootCooldown = 0.1;
      }
    }
  }

  /**
   * 更新逃跑状态
   */
  updateFlee(deltaTime) {
    if (!this.target) {
      this.setState(AIState.PATROL);
      return;
    }

    // 远离目标
    this.moveAwayFrom(this.target.position, this.runSpeed, deltaTime);

    // 寻找掩护（简化版本：随机方向）
    // TODO: 实现真正的掩护点检测
  }

  /**
   * 检测玩家
   */
  detectPlayer() {
    if (!this.world || !this.world.player) return;

    const player = this.world.player;
    if (player.health && player.health.isDead()) return;

    // 计算距离
    const distance = this.entity.position.distanceTo(player.position);

    // 检查视野
    if (distance <= this.viewDistance) {
      // 计算角度
      const toPlayer = new THREE.Vector3()
        .subVectors(player.position, this.entity.position)
        .normalize();

      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.entity.rotationY);

      const angle = Math.acos(toPlayer.dot(forward));

      if (angle <= this.viewAngle) {
        // TODO: 视线检测（是否有遮挡物）
        this.setTarget(player);
        this.lastKnownTargetPos = player.position.clone();
        this.lastSeenTime = Date.now() / 1000;

        if (this.state !== AIState.COMBAT && this.state !== AIState.FLEE) {
          this.setState(AIState.COMBAT);
        }
      }
    }
  }

  /**
   * 检查是否能看到目标
   */
  canSeeTarget() {
    if (!this.target) return false;

    const distance = this.entity.position.distanceTo(this.target.position);
    if (distance > this.viewDistance) return false;

    // 检查角度
    const toTarget = new THREE.Vector3()
      .subVectors(this.target.position, this.entity.position)
      .normalize();

    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.entity.rotationY);

    const angle = Math.acos(toTarget.dot(forward));
    if (angle > this.viewAngle) return false;

    // TODO: 视线检测
    return true;
  }

  /**
   * 移动到指定点
   */
  moveToPoint(point, speed, deltaTime) {
    const direction = new THREE.Vector3()
      .subVectors(point, this.entity.position);

    direction.y = 0; // 忽略Y轴

    if (direction.length() < 1) {
      return true; // 到达
    }

    direction.normalize();

    // 更新朝向
    const targetRotation = Math.atan2(direction.x, direction.z);
    this.entity.rotationY = this.lerpAngle(
      this.entity.rotationY,
      targetRotation,
      this.turnSpeed * deltaTime
    );

    // 移动
    const movement = direction.multiplyScalar(speed * deltaTime);
    this.entity.position.add(movement);

    // 更新地面高度
    if (this.world) {
      this.entity.position.y = this.world.getHeightAt(
        this.entity.position.x,
        this.entity.position.z
      );
    }

    return false;
  }

  /**
   * 远离指定点
   */
  moveAwayFrom(point, speed, deltaTime) {
    const direction = new THREE.Vector3()
      .subVectors(this.entity.position, point);

    direction.y = 0;
    direction.normalize();

    // 移动
    const movement = direction.multiplyScalar(speed * deltaTime);
    this.entity.position.add(movement);

    // 更新地面高度
    if (this.world) {
      this.entity.position.y = this.world.getHeightAt(
        this.entity.position.x,
        this.entity.position.z
      );
    }
  }

  /**
   * 面向指定点
   */
  lookAt(point) {
    const direction = new THREE.Vector3()
      .subVectors(point, this.entity.position);

    const targetRotation = Math.atan2(direction.x, direction.z);
    this.entity.rotationY = this.lerpAngle(
      this.entity.rotationY,
      targetRotation,
      this.turnSpeed * 2 * 0.016
    );
  }

  /**
   * 射击
   */
  shoot() {
    // 通过武器控制器射击
    if (this.entity.weaponController) {
      const weapon = this.entity.weaponController.getCurrentWeapon();
      if (weapon && weapon.currentAmmo > 0) {
        this.entity.weaponController.shoot();
      }
    }
  }

  /**
   * 设置状态
   */
  setState(state) {
    if (this.state !== state) {
      this.previousState = this.state;
      this.state = state;
    }
  }

  /**
   * 角度插值
   */
  lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return a + diff * t;
  }
}