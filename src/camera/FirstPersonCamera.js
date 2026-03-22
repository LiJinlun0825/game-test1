/**
 * 第一人称相机控制器
 */
export class FirstPersonCamera {
  constructor(camera, player) {
    this.camera = camera;
    this.player = player;
    this.inputManager = null;

    this.yaw = 0;
    this.pitch = 0;
    this.sensitivity = 0.002;

    this.minPitch = -Math.PI / 2 + 0.1;
    this.maxPitch = Math.PI / 2 - 0.1;

    this.playerHeight = 1.7;
    this.crouchHeight = 1.0;
  }

  setInputManager(inputManager) {
    this.inputManager = inputManager;
  }

  setPointerLocked(locked) {
    // 可用于UI反馈
  }

  getYaw() {
    return this.yaw;
  }

  reset() {
    this.yaw = 0;
    this.pitch = 0;
  }

  update(deltaTime) {
    if (!this.inputManager || !this.player) return;

    const mouseDelta = this.inputManager.getMouseDelta();

    if (mouseDelta.x !== 0 || mouseDelta.y !== 0) {
      this.yaw -= mouseDelta.x * this.sensitivity;
      this.pitch -= mouseDelta.y * this.sensitivity;

      this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
    }

    // 更新相机位置
    const height = this.player.characterController.isCrouching
      ? this.crouchHeight
      : this.playerHeight;

    this.camera.position.copy(this.player.position);
    this.camera.position.y += height;

    // 更新相机旋转
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // 更新玩家旋转
    this.player.rotation.y = this.yaw;
  }
}