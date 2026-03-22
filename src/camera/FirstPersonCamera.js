/**
 * 第一人称相机控制器
 * 优化版本：平滑插值、动态灵敏度、自然视角控制
 */
export class FirstPersonCamera {
  constructor(camera, player) {
    this.camera = camera;
    this.player = player;
    this.inputManager = null;

    // 当前视角角度
    this.yaw = 0;
    this.pitch = 0;

    // 目标视角角度（用于平滑插值）
    this.targetYaw = 0;
    this.targetPitch = 0;

    // 灵敏度设置
    this.sensitivity = 0.002;
    this.adsSensitivityMultiplier = 0.5; // 瞄准时灵敏度降低
    this.currentSensitivity = this.sensitivity;

    // 平滑插值参数
    this.smoothing = 0.15; // 平滑系数 (0-1, 越小越平滑)
    this.useSmoothing = true;

    // 俯仰角限制
    this.minPitch = -Math.PI / 2 + 0.01;
    this.maxPitch = Math.PI / 2 - 0.01;

    // 玩家高度
    this.playerHeight = 1.7;
    this.crouchHeight = 1.0;

    // 视角晃动参数
    this.bobEnabled = true;
    this.bobTimer = 0;
    this.bobSpeed = 10;
    this.bobAmount = 0.03;
    this.currentBob = { x: 0, y: 0 };

    // 头部倾斜（转向时）
    this.tiltAmount = 0;
    this.maxTilt = 0.03;
    this.tiltSpeed = 5;

    // 当前状态
    this.isAiming = false;
  }

  setInputManager(inputManager) {
    this.inputManager = inputManager;
  }

  /**
   * 设置瞄准状态
   */
  setAiming(isAiming) {
    this.isAiming = isAiming;
  }

  /**
   * 设置灵敏度
   */
  setSensitivity(value) {
    this.sensitivity = value;
    this.currentSensitivity = value;
  }

  /**
   * 设置平滑系数
   */
  setSmoothing(value) {
    this.smoothing = Math.max(0.01, Math.min(1, value));
  }

  /**
   * 启用/禁用平滑
   */
  setSmoothingEnabled(enabled) {
    this.useSmoothing = enabled;
  }

  /**
   * 启用/禁用视角晃动
   */
  setBobEnabled(enabled) {
    this.bobEnabled = enabled;
  }

  getYaw() {
    return this.yaw;
  }

  getPitch() {
    return this.pitch;
  }

  reset() {
    this.yaw = 0;
    this.pitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.bobTimer = 0;
    this.tiltAmount = 0;
  }

  /**
   * 平滑插值
   */
  lerp(current, target, factor) {
    return current + (target - current) * factor;
  }

  /**
   * 角度差计算（处理 -PI 到 PI 的回绕）
   */
  angleDifference(from, to) {
    let diff = to - from;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
  }

  /**
   * 更新视角晃动
   */
  updateBob(deltaTime, isMoving, isSprinting) {
    if (!this.bobEnabled) {
      this.currentBob.x = 0;
      this.currentBob.y = 0;
      return;
    }

    if (isMoving && !this.isAiming) {
      const speed = isSprinting ? this.bobSpeed * 1.5 : this.bobSpeed;
      const amount = isSprinting ? this.bobAmount * 1.3 : this.bobAmount;

      this.bobTimer += deltaTime * speed;

      // 正弦波晃动
      this.currentBob.x = Math.sin(this.bobTimer) * amount * 0.5;
      this.currentBob.y = Math.abs(Math.sin(this.bobTimer)) * amount;
    } else {
      // 平滑恢复到零
      this.currentBob.x *= 0.9;
      this.currentBob.y *= 0.9;
      this.bobTimer = 0;
    }
  }

  /**
   * 更新头部倾斜
   */
  updateTilt(deltaTime, yawDelta) {
    // 根据转向速度计算倾斜
    const targetTilt = -yawDelta * 50;
    this.tiltAmount = this.lerp(this.tiltAmount, targetTilt, this.tiltSpeed * deltaTime);

    // 限制最大倾斜
    this.tiltAmount = Math.max(-this.maxTilt, Math.min(this.maxTilt, this.tiltAmount));

    // 缓慢恢复
    if (Math.abs(yawDelta) < 0.001) {
      this.tiltAmount *= 0.95;
    }
  }

  update(deltaTime) {
    if (!this.inputManager || !this.player) return;

    const mouseDelta = this.inputManager.getMouseDelta();

    // 计算当前灵敏度（瞄准时降低）
    this.currentSensitivity = this.isAiming
      ? this.sensitivity * this.adsSensitivityMultiplier
      : this.sensitivity;

    // 更新目标角度
    if (mouseDelta.x !== 0 || mouseDelta.y !== 0) {
      this.targetYaw -= mouseDelta.x * this.currentSensitivity;
      this.targetPitch -= mouseDelta.y * this.currentSensitivity;

      // 限制俯仰角
      this.targetPitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.targetPitch));
    }

    // 平滑插值或直接应用
    if (this.useSmoothing) {
      const yawDiff = this.angleDifference(this.yaw, this.targetYaw);
      const pitchDiff = this.targetPitch - this.pitch;

      // 使用帧率无关的平滑
      const smoothFactor = 1 - Math.pow(1 - this.smoothing, deltaTime * 60);
      this.yaw += yawDiff * smoothFactor;
      this.pitch += pitchDiff * smoothFactor;
    } else {
      this.yaw = this.targetYaw;
      this.pitch = this.targetPitch;
    }

    // 确保角度在有效范围内
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));

    // 计算视角晃动
    const charController = this.player.characterController;
    const isMoving = charController && (Math.abs(charController.velocity.x) > 0.1 ||
                                         Math.abs(charController.velocity.z) > 0.1);
    const isSprinting = charController && charController.isSprinting;
    this.updateBob(deltaTime, isMoving, isSprinting);

    // 更新头部倾斜
    this.updateTilt(deltaTime, mouseDelta.x * this.currentSensitivity);

    // 更新相机位置
    const height = charController && charController.isCrouching
      ? this.crouchHeight
      : this.playerHeight;

    this.camera.position.copy(this.player.position);
    this.camera.position.y += height;
    this.camera.position.y += this.currentBob.y;

    // 更新相机旋转
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = this.tiltAmount + this.currentBob.x;

    // 更新玩家旋转（仅 yaw）
    this.player.rotation.y = this.yaw;
  }

  /**
   * 获取当前状态信息（调试用）
   */
  getStatus() {
    return {
      yaw: this.yaw,
      pitch: this.pitch,
      sensitivity: this.currentSensitivity,
      smoothing: this.useSmoothing ? this.smoothing : 0,
      isAiming: this.isAiming,
      bobEnabled: this.bobEnabled
    };
  }
}