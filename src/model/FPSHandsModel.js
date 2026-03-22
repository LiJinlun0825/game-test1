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
    const leftHand = this.createHand('left');
    leftHand.position.set(-0.18, -0.12, -0.32);
    leftHand.rotation.set(0.1, 0.1, -0.05);
    leftHand.name = 'leftHand';
    this.handsGroup.add(leftHand);

    // 创建右手
    const rightHand = this.createHand('right');
    rightHand.position.set(0.18, -0.12, -0.32);
    rightHand.rotation.set(0.1, -0.1, 0.05);
    rightHand.name = 'rightHand';
    this.handsGroup.add(rightHand);

    // 创建手臂
    const leftArm = this.createArm('left');
    leftArm.position.set(-0.25, 0.05, -0.25);
    leftArm.rotation.set(0.3, 0.2, 0.3);
    this.handsGroup.add(leftArm);

    const rightArm = this.createArm('right');
    rightArm.position.set(0.25, 0.05, -0.25);
    rightArm.rotation.set(0.3, -0.2, -0.3);
    this.handsGroup.add(rightArm);

    // 将手部组添加到相机
    this.camera.add(this.handsGroup);

    console.log('FPS Hands Model initialized');
  }

  /**
   * 创建单只手
   */
  createHand(side) {
    const handGroup = new THREE.Group();
    handGroup.name = `hand-${side}`;

    // 皮肤材质
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xE8C8A8,
      roughness: 0.7,
      metalness: 0.0
    });

    // 手套材质
    const gloveMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.8,
      metalness: 0.1
    });

    // 手套主体
    const gloveGeom = new THREE.BoxGeometry(0.085, 0.035, 0.11);
    const glove = new THREE.Mesh(gloveGeom, gloveMaterial);
    glove.castShadow = true;
    handGroup.add(glove);

    // 手套顶部装饰线
    const gloveLineGeom = new THREE.BoxGeometry(0.087, 0.003, 0.112);
    const gloveLineMaterial = new THREE.MeshStandardMaterial({
      color: 0x3A3A3A,
      roughness: 0.8
    });
    const gloveLine = new THREE.Mesh(gloveLineGeom, gloveLineMaterial);
    gloveLine.position.y = 0.018;
    handGroup.add(gloveLine);

    // 手指配置
    const fingerConfigs = [
      { name: 'pinky', x: -0.032, z: -0.045, length: 0.04, width: 0.012 },
      { name: 'ring', x: -0.011, z: -0.05, length: 0.045, width: 0.013 },
      { name: 'middle', x: 0.01, z: -0.052, length: 0.05, width: 0.014 },
      { name: 'index', x: 0.031, z: -0.048, length: 0.047, width: 0.013 }
    ];

    fingerConfigs.forEach(config => {
      const finger = this.createFinger(config.length, config.width, skinMaterial, gloveMaterial);
      finger.position.set(config.x, 0, config.z);
      finger.name = config.name;
      handGroup.add(finger);
    });

    // 拇指
    const thumb = this.createThumb(skinMaterial, gloveMaterial, side);
    thumb.position.set(-0.045, -0.005, 0.02);
    handGroup.add(thumb);

    // 手腕
    const wristGeom = new THREE.CylinderGeometry(0.035, 0.04, 0.04, 10);
    const wrist = new THREE.Mesh(wristGeom, gloveMaterial);
    wrist.position.set(0, 0, 0.08);
    wrist.rotation.x = Math.PI * 0.5;
    handGroup.add(wrist);

    return handGroup;
  }

  /**
   * 创建手指
   */
  createFinger(length, width, skinMaterial, gloveMaterial) {
    const fingerGroup = new THREE.Group();

    // 第一节（戴手套）- 使用圆柱体+球体
    const seg1Group = new THREE.Group();
    const seg1CylGeom = new THREE.CylinderGeometry(width * 0.5, width * 0.45, length * 0.35, 6);
    const seg1Cyl = new THREE.Mesh(seg1CylGeom, gloveMaterial);
    seg1Group.add(seg1Cyl);
    const seg1CapGeom = new THREE.SphereGeometry(width * 0.45, 6, 4);
    const seg1Cap = new THREE.Mesh(seg1CapGeom, gloveMaterial);
    seg1Cap.position.y = length * 0.175;
    seg1Group.add(seg1Cap);
    seg1Group.rotation.x = Math.PI * 0.5;
    fingerGroup.add(seg1Group);

    // 关节
    const knuckleGeom = new THREE.SphereGeometry(width * 0.45, 6, 6);
    const knuckle = new THREE.Mesh(knuckleGeom, skinMaterial);
    knuckle.position.z = -length * 0.35;
    fingerGroup.add(knuckle);

    // 第二节（皮肤）
    const seg2Group = new THREE.Group();
    const seg2CylGeom = new THREE.CylinderGeometry(width * 0.4, width * 0.35, length * 0.35, 6);
    const seg2Cyl = new THREE.Mesh(seg2CylGeom, skinMaterial);
    seg2Group.add(seg2Cyl);
    seg2Group.position.z = -length * 0.5;
    seg2Group.rotation.x = Math.PI * 0.5;
    fingerGroup.add(seg2Group);

    // 指尖
    const tipGeom = new THREE.SphereGeometry(width * 0.35, 6, 6);
    const tip = new THREE.Mesh(tipGeom, skinMaterial);
    tip.position.z = -length * 0.85;
    fingerGroup.add(tip);

    return fingerGroup;
  }

  /**
   * 创建拇指
   */
  createThumb(skinMaterial, gloveMaterial, side) {
    const thumbGroup = new THREE.Group();

    // 拇指基部（手套）- 使用圆柱体+球体
    const baseCylGeom = new THREE.CylinderGeometry(0.012, 0.011, 0.025, 6);
    const baseCyl = new THREE.Mesh(baseCylGeom, gloveMaterial);
    thumbGroup.add(baseCyl);
    const baseCapGeom = new THREE.SphereGeometry(0.011, 6, 4);
    const baseCap = new THREE.Mesh(baseCapGeom, gloveMaterial);
    baseCap.position.y = 0.015;
    thumbGroup.add(baseCap);
    thumbGroup.rotation.set(Math.PI * 0.3, 0, Math.PI * 0.2);

    // 拇指尖（皮肤）
    const tipGeom = new THREE.SphereGeometry(0.011, 6, 6);
    const tip = new THREE.Mesh(tipGeom, skinMaterial);
    tip.position.set(-0.02, -0.015, -0.015);
    thumbGroup.add(tip);

    return thumbGroup;
  }

  /**
   * 创建手臂
   */
  createArm(side) {
    const armGroup = new THREE.Group();

    // 袖子材质
    const sleeveMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A7A4A,
      roughness: 0.85,
      metalness: 0.0
    });

    // 袖子
    const sleeveGeom = new THREE.CylinderGeometry(0.045, 0.05, 0.15, 10);
    const sleeve = new THREE.Mesh(sleeveGeom, sleeveMaterial);
    sleeve.rotation.x = Math.PI * 0.3;
    armGroup.add(sleeve);

    // 袖口
    const cuffGeom = new THREE.TorusGeometry(0.04, 0.005, 6, 12);
    const cuffMaterial = new THREE.MeshStandardMaterial({
      color: 0x3A6A3A,
      roughness: 0.9
    });
    const cuff = new THREE.Mesh(cuffGeom, cuffMaterial);
    cuff.position.z = -0.06;
    cuff.rotation.y = Math.PI * 0.5;
    armGroup.add(cuff);

    return armGroup;
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