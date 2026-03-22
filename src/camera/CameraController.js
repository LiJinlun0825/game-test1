/**
 * 相机控制器管理器
 * 管理第一人称和第三人称视角的动态切换
 */
import { FirstPersonCamera } from './FirstPersonCamera.js';
import { ThirdPersonCamera } from './ThirdPersonCamera.js';

export class CameraController {
  constructor(camera, player) {
    this.camera = camera;
    this.player = player;
    this.inputManager = null;

    // 视角模式
    this.mode = 'first-person'; // 'first-person' | 'third-person'
    this.previousMode = null;

    // 创建两个相机控制器
    this.firstPersonCamera = new FirstPersonCamera(camera, player);
    this.thirdPersonCamera = new ThirdPersonCamera(camera, player);

    // 当前活动的控制器
    this.activeController = this.firstPersonCamera;

    // 切换过渡
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionDuration = 0.3; // 秒

    // 过渡位置和旋转
    this.transitionStartPos = new THREE.Vector3();
    this.transitionEndPos = new THREE.Vector3();

    // 切换按键
    this.toggleKey = 'KeyV';
  }

  setInputManager(inputManager) {
    this.inputManager = inputManager;
    this.firstPersonCamera.setInputManager(inputManager);
    this.thirdPersonCamera.setInputManager(inputManager);
  }

  /**
   * 设置碰撞层（用于第三人称相机碰撞检测）
   */
  setCollisionLayers(objects) {
    this.thirdPersonCamera.setCollisionLayers(objects);
  }

  /**
   * 切换视角模式
   */
  toggleMode() {
    if (this.isTransitioning) return;

    // 保存当前视角状态
    const currentYaw = this.activeController.getYaw();

    // 切换模式
    this.previousMode = this.mode;
    this.mode = this.mode === 'first-person' ? 'third-person' : 'first-person';

    // 同步视角角度
    if (this.mode === 'third-person') {
      this.thirdPersonCamera.yaw = currentYaw;
      this.thirdPersonCamera.targetYaw = currentYaw;
      this.thirdPersonCamera.pitch = 0.3;
      this.thirdPersonCamera.targetPitch = 0.3;
      this.thirdPersonCamera.isInitialized = false;
    } else {
      this.firstPersonCamera.yaw = currentYaw;
      this.firstPersonCamera.targetYaw = currentYaw;
      this.firstPersonCamera.pitch = 0;
      this.firstPersonCamera.targetPitch = 0;
    }

    // 设置新的活动控制器
    this.activeController = this.mode === 'first-person'
      ? this.firstPersonCamera
      : this.thirdPersonCamera;

    // 开始过渡
    this.startTransition();

    console.log(`Camera mode switched to: ${this.mode}`);
  }

  /**
   * 开始过渡动画
   */
  startTransition() {
    this.isTransitioning = true;
    this.transitionProgress = 0;

    // 记录起始位置
    this.transitionStartPos.copy(this.camera.position);
  }

  /**
   * 更新过渡动画
   */
  updateTransition(deltaTime) {
    if (!this.isTransitioning) return;

    this.transitionProgress += deltaTime / this.transitionDuration;

    if (this.transitionProgress >= 1) {
      this.transitionProgress = 1;
      this.isTransitioning = false;
    }
  }

  /**
   * 设置瞄准状态
   */
  setAiming(isAiming) {
    this.firstPersonCamera.setAiming(isAiming);
  }

  /**
   * 获取当前模式
   */
  getMode() {
    return this.mode;
  }

  /**
   * 设置视角模式
   */
  setMode(mode) {
    if (mode === this.mode) return;
    this.toggleMode();
  }

  /**
   * 获取偏航角
   */
  getYaw() {
    return this.activeController.getYaw();
  }

  /**
   * 获取俯仰角
   */
  getPitch() {
    return this.activeController.getPitch();
  }

  reset() {
    this.firstPersonCamera.reset();
    this.thirdPersonCamera.reset();
    this.mode = 'first-person';
    this.activeController = this.firstPersonCamera;
    this.isTransitioning = false;
  }

  update(deltaTime) {
    if (!this.inputManager || !this.player) return;

    // 检测切换按键
    if (this.inputManager.isKeyPressed(this.toggleKey)) {
      this.toggleMode();
    }

    // 更新过渡动画
    this.updateTransition(deltaTime);

    // 更新活动控制器
    this.activeController.update(deltaTime);

    // 控制FPS手部模型的可见性
    if (this.player.weaponController && this.player.weaponController.fpsHandsModel) {
      const fpsHands = this.player.weaponController.fpsHandsModel.handsGroup;
      if (fpsHands) {
        // 第一人称显示，第三人称隐藏
        fpsHands.visible = this.mode === 'first-person';
      }
    }

    // 在第三人称模式下，控制玩家模型的可见性
    if (this.player.modelGroup) {
      // 第一人称隐藏玩家模型，第三人称显示
      this.player.modelGroup.visible = this.mode === 'third-person';
    }
  }

  /**
   * 获取当前状态信息
   */
  getStatus() {
    return {
      mode: this.mode,
      ...this.activeController.getStatus()
    };
  }
}