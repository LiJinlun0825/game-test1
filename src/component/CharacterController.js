/**
 * 角色控制器组件
 * 处理角色移动、跳跃、蹲伏、趴下等
 */
export class CharacterController {
  constructor() {
    this.entity = null;

    // 移动参数
    this.moveDirection = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.isGrounded = true;
    this.groundY = 0;

    // 状态
    this.isJumping = false;
    this.isCrouching = false;
    this.isProne = false;
    this.isSprinting = false;

    // 物理参数
    this.gravity = -20;
    this.jumpForce = 8;
    this.groundCheckDistance = 0.1;

    // 移动速度
    this.walkSpeed = 5;
    this.runSpeed = 10;
    this.crouchSpeed = 2.5;
    this.proneSpeed = 1;

    // 输入引用
    this.inputManager = null;

    // 移动状态（用于动画和UI）
    this.isMoving = false;
    this.moveSpeed = 0;
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
   * 设置输入管理器
   */
  setInputManager(inputManager) {
    this.inputManager = inputManager;
  }

  /**
   * 更新
   */
  update(deltaTime) {
    if (!this.inputManager) return;

    // 获取输入
    const moveInput = this.inputManager.getMovementInput();
    this.isSprinting = this.inputManager.isSprinting();
    const jumpPressed = this.inputManager.isJumping();
    const crouchHeld = this.inputManager.isCrouching();
    const proneHeld = this.inputManager.isProne();

    // 更新姿态状态
    this.isCrouching = crouchHeld && !this.isProne;
    this.isProne = proneHeld;

    // 计算移动速度
    let speed = this.walkSpeed;
    if (this.isSprinting && !this.isCrouching && !this.isProne) {
      speed = this.runSpeed;
    } else if (this.isCrouching) {
      speed = this.crouchSpeed;
    } else if (this.isProne) {
      speed = this.proneSpeed;
    }

    // 计算移动方向（相对于相机朝向）
    this.moveDirection.set(0, 0, 0);

    // 获取相机yaw角度用于计算移动方向
    const cameraYaw = this.entity.cameraController?.getYaw() ?? 0;

    // 计算相机的前方向（投影到水平面）
    const cameraForward = new THREE.Vector3(
      -Math.sin(cameraYaw),
      0,
      -Math.cos(cameraYaw)
    );

    // 相机的右方向
    const cameraRight = new THREE.Vector3(
      Math.cos(cameraYaw),
      0,
      -Math.sin(cameraYaw)
    );

    // 根据输入计算移动方向
    this.moveDirection.addScaledVector(cameraForward, -moveInput.z);
    this.moveDirection.addScaledVector(cameraRight, moveInput.x);

    // 归一化并乘以速度
    if (this.moveDirection.length() > 0) {
      this.moveDirection.normalize();
      this.isMoving = true;
      this.moveSpeed = speed;
    } else {
      this.isMoving = false;
      this.moveSpeed = 0;
    }
    this.moveDirection.multiplyScalar(speed);

    // 应用重力
    if (!this.isGrounded) {
      this.velocity.y += this.gravity * deltaTime;
    }

    // 跳跃
    if (jumpPressed && this.isGrounded && !this.isCrouching && !this.isProne) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
    }

    // 应用移动
    const movement = this.moveDirection.clone().multiplyScalar(deltaTime);
    movement.y = this.velocity.y * deltaTime;

    // 更新位置
    this.entity.position.add(movement);

    // 地面检测
    if (this.entity.position.y <= this.groundY) {
      this.entity.position.y = this.groundY;
      this.isGrounded = true;
      this.isJumping = false;
      this.velocity.y = 0;
    }

    // 更新角色朝向（只在移动时更新，不强制跟随相机）
    if (this.moveDirection.length() > 0.1) {
      const targetRotation = Math.atan2(this.moveDirection.x, this.moveDirection.z);

      // 平滑旋转
      let diff = targetRotation - this.entity.rotationY;

      // 处理角度跨越
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      this.entity.rotationY += diff * 10 * deltaTime;
    }

    // 更新3D对象旋转
    this.entity.object3D.rotation.y = this.entity.rotationY;

    // 更新玩家状态
    this.updatePlayerState();
  }

  /**
   * 更新玩家状态
   */
  updatePlayerState() {
    // 使用延迟导入避免循环依赖
    // PlayerState 枚举值直接在此定义
    const state = this.entity.state;
    const PlayerState = {
      IDLE: 'idle',
      WALKING: 'walking',
      RUNNING: 'running',
      JUMPING: 'jumping',
      CROUCHING: 'crouching',
      PRONE: 'prone',
      DEAD: 'dead'
    };

    if (this.entity.health?.isDead()) {
      this.entity.setState(PlayerState.DEAD);
      return;
    }

    if (this.isProne) {
      this.entity.setState(PlayerState.PRONE);
    } else if (this.isCrouching) {
      this.entity.setState(PlayerState.CROUCHING);
    } else if (this.isJumping || !this.isGrounded) {
      this.entity.setState(PlayerState.JUMPING);
    } else if (this.moveDirection.length() > 0.1) {
      if (this.isSprinting) {
        this.entity.setState(PlayerState.RUNNING);
      } else {
        this.entity.setState(PlayerState.WALKING);
      }
    } else {
      this.entity.setState(PlayerState.IDLE);
    }
  }

  /**
   * 获取当前速度
   */
  getSpeed() {
    if (this.isSprinting) return this.runSpeed;
    if (this.isCrouching) return this.crouchSpeed;
    if (this.isProne) return this.proneSpeed;
    return this.walkSpeed;
  }

  /**
   * 设置地面高度
   */
  setGroundY(y) {
    this.groundY = y;
  }

  /**
   * 销毁
   */
  destroy() {
    this.inputManager = null;
  }
}