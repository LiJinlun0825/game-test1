/**
 * 第一人称相机控制器
 * 纯FPS视角，支持瞄准、后坐力、视角摇晃
 */
export class FirstPersonCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target; // 跟随目标（玩家）

    // 视角参数
    this.baseFov = 75;           // 基础FOV
    this.adsFov = 45;            // 瞄准FOV
    this.currentFov = 75;        // 当前FOV
    this.targetFov = 75;         // 目标FOV

    this.sensitivity = 0.002;    // 灵敏度
    this.adsSensitivity = 0.0008; // 瞄准灵敏度

    // 旋转角度
    this.yaw = 0;                // 水平旋转
    this.pitch = 0;              // 垂直旋转
    this.minPitch = -Math.PI / 2.1;
    this.maxPitch = Math.PI / 2.1;

    // 相机高度
    this.standHeight = 1.7;
    this.crouchHeight = 1.1;
    this.proneHeight = 0.4;
    this.currentHeight = this.standHeight;

    // 平滑参数
    this.smoothness = 15;
    this.fovSmoothness = 8;
    this.currentPosition = new THREE.Vector3();

    // 瞄准状态
    this.isAiming = false;
    this.adsProgress = 0;

    // 输入管理器
    this.inputManager = null;
    this.pointerLocked = false;

    // 视角摇晃
    this.bobTime = 0;
    this.bobIntensity = 0;

    // 后坐力
    this.recoilOffset = new THREE.Vector2();
    this.recoilRecovery = 8;

    // 屏幕震动
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTime = 0;
  }

  /**
   * 设置输入管理器
   */
  setInputManager(inputManager) {
    this.inputManager = inputManager;

    // 绑定鼠标移动事件
    this.inputManager.on('onMouseMove', (e) => {
      if (this.pointerLocked) {
        this.handleMouseMovement(e);
      }
    });
  }

  /**
   * 处理鼠标移动
   */
  handleMouseMovement(e) {
    const delta = this.inputManager.getMouseDelta();

    // 根据瞄准状态调整灵敏度
    const sens = this.isAiming ? this.adsSensitivity : this.sensitivity;

    // 应用灵敏度
    this.yaw -= delta.x * sens;
    this.pitch -= delta.y * sens;

    // 限制俯仰角
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
  }

  /**
   * 设置瞄准状态
   */
  setAiming(aiming) {
    this.isAiming = aiming;
  }

  /**
   * 应用后坐力
   */
  applyRecoil(vertical, horizontal = 0) {
    this.recoilOffset.x += horizontal * 0.01;
    this.recoilOffset.y += vertical * 0.01;
  }

  /**
   * 应用屏幕震动
   */
  applyShake(intensity, duration) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTime = 0;
  }

  /**
   * 更新相机
   */
  update(deltaTime) {
    if (!this.target) return;

    // 更新瞄准进度
    if (this.isAiming) {
      this.adsProgress = Math.min(1, this.adsProgress + deltaTime * 6);
    } else {
      this.adsProgress = Math.max(0, this.adsProgress - deltaTime * 8);
    }

    // 更新FOV
    this.targetFov = THREE.MathUtils.lerp(this.baseFov, this.adsFov, this.adsProgress);
    this.currentFov += (this.targetFov - this.currentFov) * this.fovSmoothness * deltaTime;
    this.camera.fov = this.currentFov;
    this.camera.updateProjectionMatrix();

    // 后坐力恢复
    this.recoilOffset.multiplyScalar(1 - this.recoilRecovery * deltaTime);

    // 更新屏幕震动
    if (this.shakeTime < this.shakeDuration) {
      this.shakeTime += deltaTime;
    } else {
      this.shakeIntensity *= 0.9;
    }

    // 获取目标位置
    const targetPos = this.target.position.clone();
    targetPos.y += this.currentHeight;

    // 视角摇晃效果
    let bobX = 0, bobY = 0;
    if (this.target.characterController?.isMoving && !this.isAiming) {
      const speed = this.target.characterController.moveSpeed;
      const isSprinting = speed > 7;
      this.bobIntensity = isSprinting ? 0.025 : 0.012;
      this.bobTime += deltaTime * (isSprinting ? 12 : 8);

      bobX = Math.sin(this.bobTime * 0.5) * this.bobIntensity * 0.5;
      bobY = Math.abs(Math.sin(this.bobTime)) * this.bobIntensity;
    } else {
      this.bobTime *= 0.95;
    }

    // 呼吸效果（静止时）
    const breatheTime = performance.now() * 0.001;
    const breatheY = Math.sin(breatheTime * 1.2) * 0.003;
    const breatheX = Math.sin(breatheTime * 0.8) * 0.002;

    // 屏幕震动
    let shakeX = 0, shakeY = 0;
    if (this.shakeIntensity > 0.001) {
      const shakeFreq = this.shakeTime * 30;
      shakeX = Math.sin(shakeFreq) * this.shakeIntensity * 0.02;
      shakeY = Math.cos(shakeFreq * 1.3) * this.shakeIntensity * 0.02;
    }

    // 计算最终位置
    const desiredPosition = targetPos.clone();
    desiredPosition.x += bobX + breatheX + shakeX;
    desiredPosition.y += bobY + breatheY + shakeY;

    // 平滑移动
    const t = 1 - Math.exp(-this.smoothness * deltaTime);
    this.currentPosition.lerp(desiredPosition, t);

    // 应用后坐力到pitch
    const finalPitch = this.pitch + this.recoilOffset.y;
    const finalYaw = this.yaw + this.recoilOffset.x;

    // 更新相机
    this.camera.position.copy(this.currentPosition);

    // 计算朝向
    const lookDirection = new THREE.Vector3(0, 0, -1);
    lookDirection.applyAxisAngle(new THREE.Vector3(1, 0, 0), finalPitch);
    lookDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), finalYaw);

    const lookTarget = this.currentPosition.clone().add(lookDirection.multiplyScalar(10));
    this.camera.lookAt(lookTarget);

    // 更新角色朝向
    if (this.target.rotationY !== undefined) {
      let diff = this.yaw - this.target.rotationY;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.target.rotationY += diff * 10 * deltaTime;
    }

    // 隐藏角色模型（第一人称）
    if (this.target.modelGroup) {
      this.target.modelGroup.visible = false;
    }
  }

  /**
   * 设置蹲伏状态
   */
  setCrouching(crouching) {
    this.currentHeight = crouching ? this.crouchHeight : this.standHeight;
  }

  /**
   * 设置趴下状态
   */
  setProne(prone) {
    this.currentHeight = prone ? this.proneHeight : this.standHeight;
  }

  /**
   * 设置指针锁定状态
   */
  setPointerLocked(locked) {
    this.pointerLocked = locked;
  }

  /**
   * 获取前方向
   */
  getForward() {
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    return forward;
  }

  /**
   * 获取右方向
   */
  getRight() {
    const right = new THREE.Vector3(1, 0, 0);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    return right;
  }

  /**
   * 获取水平朝向
   */
  getYaw() {
    return this.yaw;
  }

  /**
   * 获取垂直朝向
   */
  getPitch() {
    return this.pitch;
  }

  /**
   * 获取完整方向
   */
  getDirection() {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    return direction;
  }

  /**
   * 设置灵敏度
   */
  setSensitivity(sensitivity) {
    this.sensitivity = sensitivity;
    this.adsSensitivity = sensitivity * 0.4;
  }

  /**
   * 重置相机
   */
  reset() {
    this.yaw = 0;
    this.pitch = 0;
    this.currentFov = this.baseFov;
    this.targetFov = this.baseFov;
    this.adsProgress = 0;
    this.isAiming = false;
    this.recoilOffset.set(0, 0);
    this.shakeIntensity = 0;
    this.bobTime = 0;
    this.currentHeight = this.standHeight;
  }
}