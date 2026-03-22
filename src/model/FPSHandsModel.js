/**
 * FPS手部模型渲染系统
 * 在第一人称视角下渲染玩家手部和武器
 */
export class FPSHandsModel {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.handsGroup = null;
    this.currentWeapon = null;
    this.swayAmount = 0.002;
    this.bobAmount = 0.001;
    this.time = 0;

    // 动画状态
    this.animState = {
      isReloading: false,
      isShooting: false,
      reloadProgress: 0,
      shootProgress: 0
    };
  }

  /**
   * 初始化手部模型
   */
  init() {
    this.handsGroup = new THREE.Group();

    // 创建左手
    const leftHand = this.createHand(0x1a1a1a);
    leftHand.position.set(-0.15, -0.1, -0.3);
    leftHand.name = 'leftHand';
    this.handsGroup.add(leftHand);

    // 创建右手
    const rightHand = this.createHand(0x1a1a1a);
    rightHand.position.set(0.15, -0.1, -0.3);
    rightHand.name = 'rightHand';
    this.handsGroup.add(rightHand);

    // 将手部组添加到相机
    this.camera.add(this.handsGroup);

    console.log('FPS Hands Model initialized');
  }

  /**
   * 创建单只手
   */
  createHand(skinColor) {
    const handGroup = new THREE.Group();

    // 手掌
    const palmGeometry = new THREE.BoxGeometry(0.08, 0.03, 0.12);
    const skinMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
    const palm = new THREE.Mesh(palmGeometry, skinMaterial);
    handGroup.add(palm);

    // 手指 (4根手指 + 1根拇指)
    const fingerPositions = [
      { x: -0.025, z: -0.05 },  // 小指
      { x: -0.01, z: -0.055 },   // 无名指
      { x: 0.01, z: -0.055 },    // 中指
      { x: 0.025, z: -0.05 }     // 食指
    ];

    fingerPositions.forEach(pos => {
      const finger = this.createFinger(skinMaterial);
      finger.position.set(pos.x, 0, pos.z);
      handGroup.add(finger);
    });

    // 拇指
    const thumb = this.createFinger(skinMaterial, true);
    thumb.position.set(-0.04, -0.01, 0);
    thumb.rotation.z = Math.PI / 4;
    handGroup.add(thumb);

    return handGroup;
  }

  /**
   * 创建手指
   */
  createFinger(material, isThumb = false) {
    const fingerGroup = new THREE.Group();

    const length = isThumb ? 0.04 : 0.05;
    const width = isThumb ? 0.015 : 0.012;

    // 手指段
    const segment1 = new THREE.Mesh(
      new THREE.BoxGeometry(width, width, length),
      material
    );
    segment1.position.z = -length / 2;
    fingerGroup.add(segment1);

    const segment2 = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.9, width * 0.9, length * 0.8),
      material
    );
    segment2.position.z = -length - length * 0.4;
    fingerGroup.add(segment2);

    return fingerGroup;
  }

  /**
   * 设置当前武器
   */
  setWeapon(weaponModel) {
    // 移除旧武器
    if (this.currentWeapon) {
      this.handsGroup.remove(this.currentWeapon);
    }

    // 添加新武器
    if (weaponModel) {
      weaponModel.position.set(0, -0.05, -0.35);
      this.handsGroup.add(weaponModel);
      this.currentWeapon = weaponModel;
    }
  }

  /**
   * 更新动画
   */
  update(deltaTime, playerVelocity) {
    this.time += deltaTime;

    // 武器摇摆
    const swayX = Math.sin(this.time * 2) * this.swayAmount;
    const swayY = Math.cos(this.time * 3) * this.swayAmount * 0.5;

    // 移动时武器晃动
    let bobX = 0, bobY = 0;
    if (playerVelocity && playerVelocity.length() > 0.1) {
      bobX = Math.sin(this.time * 10) * this.bobAmount * 2;
      bobY = Math.abs(Math.cos(this.time * 10)) * this.bobAmount;
    }

    this.handsGroup.position.x = swayX + bobX;
    this.handsGroup.position.y = swayY + bobY;

    // 处理动画状态
    if (this.animState.isReloading) {
      this.updateReloadAnimation(deltaTime);
    }

    if (this.animState.isShooting) {
      this.updateShootAnimation(deltaTime);
    }
  }

  /**
   * 播放射击动画
   */
  playShootAnimation() {
    this.animState.isShooting = true;
    this.animState.shootProgress = 0;
  }

  /**
   * 播放换弹动画
   */
  playReloadAnimation(duration) {
    this.animState.isReloading = true;
    this.animState.reloadDuration = duration;
    this.animState.reloadProgress = 0;
  }

  /**
   * 更新射击动画
   */
  updateShootAnimation(deltaTime) {
    this.animState.shootProgress += deltaTime * 10;

    // 后坐力效果
    const recoil = Math.sin(this.animState.shootProgress * Math.PI) * 0.05;
    this.handsGroup.position.z = -recoil;
    this.handsGroup.rotation.x = recoil * 0.5;

    if (this.animState.shootProgress >= 1) {
      this.animState.isShooting = false;
      this.handsGroup.position.z = 0;
      this.handsGroup.rotation.x = 0;
    }
  }

  /**
   * 更新换弹动画
   */
  updateReloadAnimation(deltaTime) {
    this.animState.reloadProgress += deltaTime / this.animState.reloadDuration;

    // 换弹动作
    const t = this.animState.reloadProgress;
    const dip = Math.sin(t * Math.PI) * 0.1;
    const rotate = Math.sin(t * Math.PI) * 0.3;

    this.handsGroup.position.y = -dip;
    this.handsGroup.rotation.x = rotate;

    if (this.animState.reloadProgress >= 1) {
      this.animState.isReloading = false;
      this.handsGroup.position.y = 0;
      this.handsGroup.rotation.x = 0;
    }
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.handsGroup) {
      this.camera.remove(this.handsGroup);
      this.handsGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
  }
}