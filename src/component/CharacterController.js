/**
 * 角色控制器组件
 * 处理角色移动、跳跃、蹲伏
 */
export class CharacterController {
  constructor() {
    this.entity = null;
    this.inputManager = null;

    this.moveDirection = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.isGrounded = true;
    this.groundY = 0;

    this.isJumping = false;
    this.isCrouching = false;
    this.isSprinting = false;

    this.gravity = -20;
    this.jumpForce = 8;
    this.walkSpeed = 5;
    this.runSpeed = 10;
    this.crouchSpeed = 2.5;
  }

  setEntity(entity) {
    this.entity = entity;
  }

  setInputManager(inputManager) {
    this.inputManager = inputManager;
  }

  setGroundY(y) {
    this.groundY = y;
  }

  update(deltaTime) {
    if (!this.inputManager || !this.entity) return;

    const moveInput = this.inputManager.getMovementInput();
    this.isSprinting = this.inputManager.isSprinting();
    this.isCrouching = this.inputManager.isCrouching();
    const jumpPressed = this.inputManager.isJumping();

    // 计算速度
    let speed = this.walkSpeed;
    if (this.isSprinting && !this.isCrouching) {
      speed = this.runSpeed;
    } else if (this.isCrouching) {
      speed = this.crouchSpeed;
    }

    // 计算移动方向
    this.moveDirection.set(0, 0, 0);

    // 获取相机yaw角度
    const cameraYaw = this.entity.cameraController?.getYaw() ?? 0;

    // 相对于相机方向移动
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);

    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

    this.moveDirection.add(forward.multiplyScalar(-moveInput.z));
    this.moveDirection.add(right.multiplyScalar(moveInput.x));

    if (this.moveDirection.length() > 0) {
      this.moveDirection.normalize();
    }

    // 水平移动
    this.velocity.x = this.moveDirection.x * speed;
    this.velocity.z = this.moveDirection.z * speed;

    // 跳跃
    if (jumpPressed && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
    }

    // 重力
    if (!this.isGrounded) {
      this.velocity.y += this.gravity * deltaTime;
    }

    // 更新位置
    this.entity.position.x += this.velocity.x * deltaTime;
    this.entity.position.z += this.velocity.z * deltaTime;
    this.entity.position.y += this.velocity.y * deltaTime;

    // 地面检测
    if (this.entity.position.y <= this.groundY) {
      this.entity.position.y = this.groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
      this.isJumping = false;
    }

    // 边界限制
    const boundary = 250;
    this.entity.position.x = Math.max(-boundary, Math.min(boundary, this.entity.position.x));
    this.entity.position.z = Math.max(-boundary, Math.min(boundary, this.entity.position.z));
  }
}