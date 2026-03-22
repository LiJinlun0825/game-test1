/**
 * 第三人称相机控制器
 * 相机跟随玩家，可调节距离和角度
 */
export class ThirdPersonCamera {
  constructor(camera, player) {
    this.camera = camera;
    this.player = player;
    this.inputManager = null;

    // 当前视角角度
    this.yaw = 0;
    this.pitch = 0.3; // 默认略微俯视

    // 目标视角角度（用于平滑插值）
    this.targetYaw = 0;
    this.targetPitch = 0.3;

    // 灵敏度设置
    this.sensitivity = 0.003;

    // 平滑插值参数
    this.smoothing = 0.12;

    // 俯仰角限制
    this.minPitch = -0.5;
    this.maxPitch = 1.2;

    // 相机距离设置
    this.distance = 5;
    this.minDistance = 2;
    this.maxDistance = 10;
    this.targetDistance = 5;

    // 相机高度偏移
    this.heightOffset = 1.5;

    // 碰撞检测
    this.collisionOffset = 0.3;
    this.collisionLayers = null;

    // 平滑位置
    this.currentPosition = new THREE.Vector3();
    this.isInitialized = false;

    // 玩家旋转插值
    this.playerTargetRotation = 0;
  }

  setInputManager(inputManager) {
    this.inputManager = inputManager;
  }

  /**
   * 设置相机距离
   */
  setDistance(distance) {
    this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, distance));
  }

  /**
   * 设置灵敏度
   */
  setSensitivity(value) {
    this.sensitivity = value;
  }

  getYaw() {
    return this.yaw;
  }

  getPitch() {
    return this.pitch;
  }

  reset() {
    this.yaw = 0;
    this.pitch = 0.3;
    this.targetYaw = 0;
    this.targetPitch = 0.3;
    this.distance = 5;
    this.targetDistance = 5;
    this.isInitialized = false;
    this.playerTargetRotation = 0;
  }

  /**
   * 平滑插值
   */
  lerp(current, target, factor) {
    return current + (target - current) * factor;
  }

  /**
   * 角度差计算
   */
  angleDifference(from, to) {
    let diff = to - from;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
  }

  /**
   * 角度归一化
   */
  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  /**
   * 检测相机碰撞
   */
  checkCollision(from, to) {
    if (!this.collisionLayers) return to;

    const direction = new THREE.Vector3().subVectors(to, from).normalize();
    const distance = from.distanceTo(to);

    const raycaster = new THREE.Raycaster(from, direction, 0, distance);

    // 检测与场景中物体的碰撞
    const intersects = raycaster.intersectObjects(this.collisionLayers, true);

    if (intersects.length > 0) {
      // 如果有碰撞，将相机移到碰撞点之前
      const hitPoint = intersects[0].point;
      const offset = direction.multiplyScalar(-this.collisionOffset);
      return hitPoint.add(offset);
    }

    return to;
  }

  /**
   * 设置碰撞层
   */
  setCollisionLayers(objects) {
    this.collisionLayers = objects;
  }

  update(deltaTime) {
    if (!this.inputManager || !this.player) return;

    const mouseDelta = this.inputManager.getMouseDelta();

    // 更新目标角度
    if (mouseDelta.x !== 0 || mouseDelta.y !== 0) {
      this.targetYaw -= mouseDelta.x * this.sensitivity;
      this.targetPitch -= mouseDelta.y * this.sensitivity;

      // 限制俯仰角
      this.targetPitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.targetPitch));
    }

    // 鼠标滚轮调节距离
    const wheel = this.inputManager.getWheelDelta();
    if (wheel !== 0) {
      this.targetDistance += wheel * 0.005;
      this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance));
    }

    // 平滑插值角度
    const yawDiff = this.angleDifference(this.yaw, this.targetYaw);
    const pitchDiff = this.targetPitch - this.pitch;

    const smoothFactor = 1 - Math.pow(1 - this.smoothing, deltaTime * 60);
    this.yaw += yawDiff * smoothFactor;
    this.pitch += pitchDiff * smoothFactor;

    // 平滑插值距离
    this.distance = this.lerp(this.distance, this.targetDistance, smoothFactor);

    // 确保角度在有效范围内
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));

    // 计算相机目标位置
    const playerPos = this.player.position.clone();
    playerPos.y += this.heightOffset;

    // 根据角度计算相机偏移
    const offsetX = Math.sin(this.yaw) * Math.cos(this.pitch) * this.distance;
    const offsetY = Math.sin(this.pitch) * this.distance;
    const offsetZ = Math.cos(this.yaw) * Math.cos(this.pitch) * this.distance;

    const targetCameraPos = new THREE.Vector3(
      playerPos.x - offsetX,
      playerPos.y + offsetY,
      playerPos.z - offsetZ
    );

    // 碰撞检测
    const finalCameraPos = this.checkCollision(playerPos, targetCameraPos);

    // 初始化或平滑移动相机
    if (!this.isInitialized) {
      this.currentPosition.copy(finalCameraPos);
      this.isInitialized = true;
    } else {
      this.currentPosition.lerp(finalCameraPos, smoothFactor * 1.5);
    }

    // 更新相机位置
    this.camera.position.copy(this.currentPosition);

    // 相机看向玩家
    this.camera.lookAt(playerPos);

    // 更新玩家旋转 - 在第三人称模式下，玩家面向移动方向
    const charController = this.player.characterController;
    if (charController) {
      const isMoving = Math.abs(charController.velocity.x) > 0.1 ||
                       Math.abs(charController.velocity.z) > 0.1;

      if (isMoving) {
        // 计算移动方向的角度
        const moveAngle = Math.atan2(charController.velocity.x, charController.velocity.z);
        this.playerTargetRotation = moveAngle;
      }

      // 平滑旋转玩家面向移动方向
      const currentRot = this.normalizeAngle(this.player.rotation.y);
      const targetRot = this.normalizeAngle(this.playerTargetRotation);
      const rotDiff = this.angleDifference(currentRot, targetRot);
      this.player.rotation.y += rotDiff * smoothFactor * 3;
    }
  }

  /**
   * 获取当前状态信息
   */
  getStatus() {
    return {
      yaw: this.yaw,
      pitch: this.pitch,
      distance: this.distance,
      mode: 'third-person'
    };
  }
}