/**
 * 武器控制器组件
 * 处理武器切换、射击、换弹、瞄准
 */
import { Weapon, WEAPONS, ATTACHMENTS } from '../weapon/WeaponSystem.js';

export class WeaponController {
  constructor() {
    this.entity = null;

    // 武器槽位
    this.weapons = [null, null, null];  // 主武器1, 主武器2, 副武器
    this.currentSlot = 0;

    // 状态
    this.isShooting = false;
    this.isAiming = false;
    this.isReloading = false;

    // 输入引用
    this.inputManager = null;
    this.audioManager = null;

    // 世界引用（用于命中检测）
    this.world = null;

    // 射击相关
    this.fireMode = 'single';  // single, auto, burst
    this.burstCount = 0;
    this.burstSize = 3;

    // 瞄准
    this.adsProgress = 0;
    this.adsSpeed = 5;

    // 武器模型
    this.weaponModel = null;
    this.muzzleFlash = null;

    // 射线检测（用于命中判定）
    this.raycaster = new THREE.Raycaster();
  }

  /**
   * 设置所属实体
   */
  setEntity(entity) {
    this.entity = entity;
  }

  /**
   * 设置输入管理器
   */
  setInputManager(inputManager) {
    this.inputManager = inputManager;
  }

  /**
   * 设置音频管理器
   */
  setAudioManager(audioManager) {
    this.audioManager = audioManager;
  }

  /**
   * 设置世界引用
   */
  setWorld(world) {
    this.world = world;
  }

  /**
   * 初始化
   */
  init() {
    // 创建武器模型容器
    this.weaponContainer = new THREE.Group();
    this.entity.object3D.add(this.weaponContainer);
  }

  /**
   * 获取当前武器
   */
  getCurrentWeapon() {
    return this.weapons[this.currentSlot];
  }

  /**
   * 拾取武器
   */
  pickupWeapon(weaponId) {
    const weapon = new Weapon(weaponId);

    // 查找空槽位
    for (let i = 0; i < this.weapons.length; i++) {
      if (this.weapons[i] === null) {
        this.weapons[i] = weapon;
        this.switchToSlot(i);
        return true;
      }
    }

    // 替换当前武器
    // TODO: 掉落当前武器
    this.weapons[this.currentSlot] = weapon;
    this.updateWeaponModel();
    return true;
  }

  /**
   * 丢弃当前武器
   */
  dropCurrentWeapon() {
    const weapon = this.weapons[this.currentSlot];
    if (weapon) {
      this.weapons[this.currentSlot] = null;
      this.clearWeaponModel();
      // TODO: 在地面生成武器物品
      return weapon;
    }
    return null;
  }

  /**
   * 切换武器槽
   */
  switchToSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.weapons.length) return false;
    if (slotIndex === this.currentSlot) return false;

    // 取消换弹
    const currentWeapon = this.getCurrentWeapon();
    if (currentWeapon && currentWeapon.isReloading) {
      currentWeapon.cancelReload();
    }

    this.currentSlot = slotIndex;
    this.updateWeaponModel();
    this.isAiming = false;
    this.adsProgress = 0;

    // 播放切换音效
    if (this.audioManager) {
      this.audioManager.playWeaponSwitch();
    }

    return true;
  }

  /**
   * 切换到下一个武器
   */
  nextWeapon() {
    const startIndex = this.currentSlot;
    let nextSlot = (this.currentSlot + 1) % this.weapons.length;

    while (nextSlot !== startIndex) {
      if (this.weapons[nextSlot] !== null) {
        this.switchToSlot(nextSlot);
        return;
      }
      nextSlot = (nextSlot + 1) % this.weapons.length;
    }
  }

  /**
   * 切换到上一个武器
   */
  previousWeapon() {
    const startIndex = this.currentSlot;
    let prevSlot = (this.currentSlot - 1 + this.weapons.length) % this.weapons.length;

    while (prevSlot !== startIndex) {
      if (this.weapons[prevSlot] !== null) {
        this.switchToSlot(prevSlot);
        return;
      }
      prevSlot = (prevSlot - 1 + this.weapons.length) % this.weapons.length;
    }
  }

  /**
   * 安装配件
   */
  attachAttachment(attachmentId) {
    const weapon = this.getCurrentWeapon();
    if (weapon) {
      return weapon.attachAttachment(attachmentId);
    }
    return false;
  }

  /**
   * 更新武器模型
   */
  updateWeaponModel() {
    this.clearWeaponModel();

    const weapon = this.getCurrentWeapon();
    if (!weapon) return;

    // 创建武器模型
    this.weaponModel = this.createWeaponModel(weapon);
    this.weaponContainer.add(this.weaponModel);

    // 创建枪口闪光
    this.muzzleFlash = this.createMuzzleFlash();
    this.weaponModel.add(this.muzzleFlash);

    // 创建第一人称手部模型
    this.createFirstPersonHands();
  }

  /**
   * 创建第一人称手部模型 - 和平精英风格
   */
  createFirstPersonHands() {
    if (this.handsGroup) {
      this.weaponContainer.remove(this.handsGroup);
    }

    this.handsGroup = new THREE.Group();

    // 材质定义 - 和平精英风格的战术手套
    const materials = {
      // 战术手套主体 - 深灰黑色
      glove: new THREE.MeshStandardMaterial({
        color: 0x1F1F1F,
        roughness: 0.75,
        metalness: 0.05
      }),

      // 手套防滑部分 - 略浅的灰色
      gloveGrip: new THREE.MeshStandardMaterial({
        color: 0x2D2D2D,
        roughness: 0.95,
        metalness: 0
      }),

      // 手套加固部分 - 带点棕色的灰
      gloveReinforcement: new THREE.MeshStandardMaterial({
        color: 0x3A3530,
        roughness: 0.6,
        metalness: 0.15
      }),

      // 袖子（战术服）- 军绿色
      sleeve: new THREE.MeshStandardMaterial({
        color: 0x4A5A45,
        roughness: 0.85,
        metalness: 0.05
      }),

      // 袖子纹理
      sleeveDetail: new THREE.MeshStandardMaterial({
        color: 0x3A4A35,
        roughness: 0.9,
        metalness: 0
      }),

      // 皮肤（手腕露出部分）
      skin: new THREE.MeshStandardMaterial({
        color: 0xE0B090,
        roughness: 0.7,
        metalness: 0
      }),

      // 金属配件
      metal: new THREE.MeshStandardMaterial({
        color: 0x4A4A4A,
        roughness: 0.35,
        metalness: 0.7
      }),

      // 魔术贴
      velcro: new THREE.MeshStandardMaterial({
        color: 0x1A1A1A,
        roughness: 0.95,
        metalness: 0
      })
    };

    // 创建右手（持枪手 - 主手）
    const rightHand = this.createFPSHand(materials, false);
    rightHand.position.set(0.08, -0.15, -0.35);
    rightHand.rotation.set(-0.1, 0.05, 0.1);
    this.handsGroup.add(rightHand);

    // 创建左手（辅助手 - 扶枪管）
    const leftHand = this.createFPSHand(materials, true);
    leftHand.position.set(-0.08, -0.12, -0.42);
    leftHand.rotation.set(-0.15, 0.1, -0.15);
    this.handsGroup.add(leftHand);

    // 创建右手臂
    const rightArm = this.createFPSArm(materials, false);
    rightArm.position.set(0.12, 0.05, 0.1);
    rightArm.rotation.set(-0.4, 0.1, 0.15);
    this.handsGroup.add(rightArm);

    // 创建左手臂
    const leftArm = this.createFPSArm(materials, true);
    leftArm.position.set(-0.1, 0.05, 0.05);
    leftArm.rotation.set(-0.35, -0.05, -0.1);
    this.handsGroup.add(leftArm);

    // 设置手部整体位置 - 屏幕右下方
    this.handsGroup.position.set(0.18, 1.35, -0.25);

    this.weaponContainer.add(this.handsGroup);
  }

  /**
   * 创建FPS风格的手部模型
   */
  createFPSHand(materials, isLeft) {
    const handGroup = new THREE.Group();
    handGroup.name = isLeft ? 'leftHand' : 'rightHand';

    // ===== 手掌 =====
    // 手掌主体 - 更真实的形状
    const palmShape = new THREE.Shape();
    palmShape.moveTo(-0.025, -0.035);
    palmShape.lineTo(0.025, -0.035);
    palmShape.lineTo(0.028, 0.03);
    palmShape.lineTo(-0.028, 0.03);
    palmShape.lineTo(-0.025, -0.035);

    const palmGeo = new THREE.ExtrudeGeometry(palmShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.002,
      bevelSegments: 2
    });
    const palm = new THREE.Mesh(palmGeo, materials.glove);
    palm.rotation.x = Math.PI / 2;
    palm.position.z = 0.011;
    palm.castShadow = true;
    handGroup.add(palm);

    // 手背护甲片
    const armorGeo = new THREE.BoxGeometry(0.045, 0.005, 0.04);
    const armor = new THREE.Mesh(armorGeo, materials.gloveReinforcement);
    armor.position.set(0, 0.014, 0);
    handGroup.add(armor);

    // 护甲装饰线
    for (let i = 0; i < 3; i++) {
      const lineGeo = new THREE.BoxGeometry(0.002, 0.007, 0.035);
      const line = new THREE.Mesh(lineGeo, materials.metal);
      line.position.set(-0.012 + i * 0.012, 0.017, 0);
      handGroup.add(line);
    }

    // 手掌防滑纹理
    for (let i = 0; i < 5; i++) {
      const gripGeo = new THREE.BoxGeometry(0.04, 0.002, 0.008);
      const grip = new THREE.Mesh(gripGeo, materials.gloveGrip);
      grip.position.set(0, -0.012, -0.015 + i * 0.008);
      handGroup.add(grip);
    }

    // ===== 手指 =====
    this.createFPSFingers(handGroup, materials, isLeft);

    // ===== 拇指 =====
    this.createFPSThumb(handGroup, materials, isLeft);

    // ===== 手腕 =====
    const wristGeo = new THREE.CylinderGeometry(0.025, 0.028, 0.03, 14);
    const wrist = new THREE.Mesh(wristGeo, materials.glove);
    wrist.position.set(0, 0.025, 0);
    handGroup.add(wrist);

    // 手腕魔术贴绑带
    const strapGeo = new THREE.BoxGeometry(0.055, 0.012, 0.01);
    const strap = new THREE.Mesh(strapGeo, materials.velcro);
    strap.position.set(0, 0.03, 0.012);
    handGroup.add(strap);

    // 魔术贴扣
    const buckleGeo = new THREE.BoxGeometry(0.015, 0.008, 0.012);
    const buckle = new THREE.Mesh(buckleGeo, materials.metal);
    buckle.position.set(isLeft ? 0.02 : -0.02, 0.032, 0.012);
    handGroup.add(buckle);

    return handGroup;
  }

  /**
   * 创建FPS风格的手指
   */
  createFPSFingers(handGroup, materials, isLeft) {
    // 手指配置 - 握枪姿态
    const fingers = [
      { name: 'index', x: -0.015, baseZ: -0.03, length: 0.045, curl: 0.2 },    // 食指 - 扣扳机
      { name: 'middle', x: 0, baseZ: -0.032, length: 0.048, curl: 0.5 },       // 中指
      { name: 'ring', x: 0.015, baseZ: -0.028, length: 0.042, curl: 0.5 },     // 无名指
      { name: 'pinky', x: 0.026, baseZ: -0.022, length: 0.032, curl: 0.6 }     // 小指
    ];

    fingers.forEach((finger, index) => {
      const fingerGroup = new THREE.Group();
      fingerGroup.name = finger.name;

      // 计算弯曲 - 食指弯曲较小（准备扣扳机），其他手指弯曲握住握把
      const curlAngle = finger.curl;

      // 指根
      const baseGeo = new THREE.SphereGeometry(0.006, 8, 8);
      const base = new THREE.Mesh(baseGeo, materials.glove);
      fingerGroup.add(base);

      // 第一指节
      const seg1Length = finger.length * 0.35;
      const seg1Geo = new THREE.CylinderGeometry(0.0055, 0.005, seg1Length, 8);
      const seg1 = new THREE.Mesh(seg1Geo, materials.glove);
      seg1.position.y = -seg1Length / 2;
      seg1.rotation.x = curlAngle * 0.3;
      fingerGroup.add(seg1);

      // 第一关节
      const joint1Geo = new THREE.SphereGeometry(0.005, 8, 8);
      const joint1 = new THREE.Mesh(joint1Geo, materials.gloveGrip);
      joint1.position.y = -seg1Length;
      fingerGroup.add(joint1);

      // 第二指节
      const seg2Length = finger.length * 0.35;
      const seg2Geo = new THREE.CylinderGeometry(0.0045, 0.005, seg2Length, 8);
      const seg2 = new THREE.Mesh(seg2Geo, materials.glove);
      seg2.position.y = -seg1Length - seg2Length / 2;
      seg2.rotation.x = curlAngle * 0.5;
      fingerGroup.add(seg2);

      // 第二关节
      const joint2Geo = new THREE.SphereGeometry(0.004, 8, 8);
      const joint2 = new THREE.Mesh(joint2Geo, materials.gloveGrip);
      joint2.position.y = -seg1Length - seg2Length;
      fingerGroup.add(joint2);

      // 指尖
      const tipGeo = new THREE.SphereGeometry(0.004, 8, 8);
      const tip = new THREE.Mesh(tipGeo, materials.glove);
      tip.position.y = -seg1Length - seg2Length - 0.005;
      fingerGroup.add(tip);

      // 指甲/手套指尖
      const nailGeo = new THREE.BoxGeometry(0.006, 0.003, 0.006);
      const nail = new THREE.Mesh(nailGeo, materials.gloveGrip);
      nail.position.y = -seg1Length - seg2Length - 0.008;
      nail.position.z = 0.003;
      fingerGroup.add(nail);

      // 设置手指位置
      fingerGroup.position.set(finger.x, -0.005, finger.baseZ);

      handGroup.add(fingerGroup);
    });
  }

  /**
   * 创建FPS风格的拇指
   */
  createFPSThumb(handGroup, materials, isLeft) {
    const thumbGroup = new THREE.Group();
    thumbGroup.name = 'thumb';

    // 拇指位置 - 握枪时拇指在侧面
    const thumbX = isLeft ? 0.03 : -0.03;

    // 拇指根
    const baseGeo = new THREE.SphereGeometry(0.008, 8, 8);
    const base = new THREE.Mesh(baseGeo, materials.glove);
    thumbGroup.add(base);

    // 第一指节
    const seg1Geo = new THREE.CylinderGeometry(0.007, 0.008, 0.025, 8);
    const seg1 = new THREE.Mesh(seg1Geo, materials.glove);
    seg1.position.set(0, -0.01, 0.005);
    seg1.rotation.z = isLeft ? -0.5 : 0.5;
    seg1.rotation.x = 0.3;
    thumbGroup.add(seg1);

    // 关节
    const jointGeo = new THREE.SphereGeometry(0.006, 8, 8);
    const joint = new THREE.Mesh(jointGeo, materials.gloveGrip);
    joint.position.set(isLeft ? 0.01 : -0.01, -0.018, 0.012);
    thumbGroup.add(joint);

    // 第二指节
    const seg2Geo = new THREE.CylinderGeometry(0.005, 0.006, 0.02, 8);
    const seg2 = new THREE.Mesh(seg2Geo, materials.glove);
    seg2.position.set(isLeft ? 0.018 : -0.018, -0.025, 0.018);
    seg2.rotation.z = isLeft ? -0.3 : 0.3;
    thumbGroup.add(seg2);

    // 拇指尖
    const tipGeo = new THREE.SphereGeometry(0.005, 8, 8);
    const tip = new THREE.Mesh(tipGeo, materials.glove);
    tip.position.set(isLeft ? 0.022 : -0.022, -0.032, 0.022);
    thumbGroup.add(tip);

    thumbGroup.position.set(thumbX, 0, -0.005);
    handGroup.add(thumbGroup);
  }

  /**
   * 创建FPS风格的手臂
   */
  createFPSArm(materials, isLeft) {
    const armGroup = new THREE.Group();

    // 前臂 - 从手腕延伸到袖子
    const forearmGeo = new THREE.CylinderGeometry(0.032, 0.04, 0.18, 14);
    const forearm = new THREE.Mesh(forearmGeo, materials.sleeve);
    forearm.position.y = 0.08;
    forearm.castShadow = true;
    armGroup.add(forearm);

    // 袖子纹理 - 横向线条
    for (let i = 0; i < 4; i++) {
      const lineGeo = new THREE.BoxGeometry(0.038, 0.003, 0.002);
      const line = new THREE.Mesh(lineGeo, materials.sleeveDetail);
      line.position.set(0, 0.12 - i * 0.04, 0.02);
      armGroup.add(line);
    }

    // 袖口加固环
    const cuffGeo = new THREE.TorusGeometry(0.035, 0.004, 8, 20);
    const cuff = new THREE.Mesh(cuffGeo, materials.gloveReinforcement);
    cuff.position.y = -0.01;
    cuff.rotation.x = Math.PI / 2;
    armGroup.add(cuff);

    // 袖口魔术贴
    const strapGeo = new THREE.BoxGeometry(0.06, 0.015, 0.008);
    const strap = new THREE.Mesh(strapGeo, materials.velcro);
    strap.position.set(0, 0, 0.025);
    armGroup.add(strap);

    // 袖子口袋（小口袋装饰）
    const pocketGeo = new THREE.BoxGeometry(0.03, 0.025, 0.01);
    const pocket = new THREE.Mesh(pocketGeo, materials.sleeveDetail);
    pocket.position.set(isLeft ? 0.035 : -0.035, 0.1, 0);
    armGroup.add(pocket);

    return armGroup;
  }

  /**
   * 创建武器模型 - 增强版
   */
  createWeaponModel(weapon) {
    const group = new THREE.Group();

    // 通用材质
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.4,
      metalness: 0.8
    });

    const darkMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.3,
      metalness: 0.9
    });

    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x5C4033,
      roughness: 0.8,
      metalness: 0.1
    });

    const rubberMaterial = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.9,
      metalness: 0
    });

    switch (weapon.category) {
      case 'pistol':
        this.createPistolModel(group, weapon, metalMaterial, darkMetalMaterial, rubberMaterial);
        break;
      case 'assault':
        this.createRifleModel(group, weapon, metalMaterial, darkMetalMaterial, rubberMaterial);
        break;
      case 'smg':
        this.createSMGModel(group, weapon, metalMaterial, darkMetalMaterial, rubberMaterial);
        break;
      case 'sniper':
        this.createSniperModel(group, weapon, metalMaterial, darkMetalMaterial, rubberMaterial, woodMaterial);
        break;
      case 'shotgun':
        this.createShotgunModel(group, weapon, metalMaterial, darkMetalMaterial, rubberMaterial, woodMaterial);
        break;
      default:
        this.createPistolModel(group, weapon, metalMaterial, darkMetalMaterial, rubberMaterial);
    }

    // 添加瞄具（如果有）
    if (weapon.attachments.scope) {
      this.addScope(group, weapon.attachments.scope);
    }

    // 根据视角模式设置位置
    // 第一人称：武器在屏幕右下方，呈现握枪姿态
    // 纯第一人称游戏 - 只使用第一人称视角
    // 第一人称视角 - 武器在视野中，呈现握枪姿态
    group.position.set(0.15, -0.12, -0.32);
    group.rotation.set(0.02, Math.PI + 0.03, 0);
    group.scale.set(1.15, 1.15, 1.15);

    return group;
  }

  /**
   * 创建手枪模型
   */
  createPistolModel(group, weapon, metalMat, darkMetalMat, rubberMat) {
    // 滑套
    const slideGeo = new THREE.BoxGeometry(0.03, 0.04, 0.18);
    const slide = new THREE.Mesh(slideGeo, metalMat);
    slide.position.set(0, 0.03, -0.02);
    slide.castShadow = true;
    group.add(slide);

    // 滑套纹路
    for (let i = 0; i < 5; i++) {
      const grooveGeo = new THREE.BoxGeometry(0.032, 0.01, 0.005);
      const groove = new THREE.Mesh(grooveGeo, darkMetalMat);
      groove.position.set(0, 0.032, -0.06 + i * 0.015);
      group.add(groove);
    }

    // 机匣
    const frameGeo = new THREE.BoxGeometry(0.028, 0.035, 0.12);
    const frame = new THREE.Mesh(frameGeo, darkMetalMat);
    frame.position.set(0, 0.005, 0.02);
    frame.castShadow = true;
    group.add(frame);

    // 握把
    const gripGeo = new THREE.BoxGeometry(0.025, 0.08, 0.03);
    const grip = new THREE.Mesh(gripGeo, rubberMat);
    grip.position.set(0, -0.04, 0.06);
    grip.rotation.x = -0.2;
    grip.castShadow = true;
    group.add(grip);

    // 握把纹理
    for (let i = 0; i < 6; i++) {
      const textureGeo = new THREE.BoxGeometry(0.026, 0.008, 0.001);
      const texture = new THREE.Mesh(textureGeo, darkMetalMat);
      texture.position.set(0, -0.02 - i * 0.01, 0.075);
      group.add(texture);
    }

    // 扳机护圈
    const guardGeo = new THREE.TorusGeometry(0.015, 0.003, 8, 16, Math.PI);
    const guard = new THREE.Mesh(guardGeo, metalMat);
    guard.position.set(0, -0.015, 0.04);
    guard.rotation.x = Math.PI / 2;
    group.add(guard);

    // 扳机
    const triggerGeo = new THREE.BoxGeometry(0.005, 0.015, 0.005);
    const trigger = new THREE.Mesh(triggerGeo, metalMat);
    trigger.position.set(0, -0.02, 0.03);
    group.add(trigger);

    // 枪管
    const barrelGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.06, 12);
    const barrel = new THREE.Mesh(barrelGeo, metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.12);
    group.add(barrel);

    // 准星
    const frontSightGeo = new THREE.BoxGeometry(0.005, 0.015, 0.005);
    const frontSight = new THREE.Mesh(frontSightGeo, darkMetalMat);
    frontSight.position.set(0, 0.055, -0.1);
    group.add(frontSight);

    // 照门
    const rearSightGeo = new THREE.BoxGeometry(0.015, 0.012, 0.005);
    const rearSight = new THREE.Mesh(rearSightGeo, darkMetalMat);
    rearSight.position.set(0, 0.052, 0.04);
    group.add(rearSight);
  }

  /**
   * 创建步枪模型
   */
  createRifleModel(group, weapon, metalMat, darkMetalMat, rubberMat) {
    // 机匣
    const receiverGeo = new THREE.BoxGeometry(0.04, 0.05, 0.25);
    const receiver = new THREE.Mesh(receiverGeo, metalMat);
    receiver.position.set(0, 0.02, 0);
    receiver.castShadow = true;
    group.add(receiver);

    // 机匣盖
    const coverGeo = new THREE.BoxGeometry(0.038, 0.015, 0.2);
    const cover = new THREE.Mesh(coverGeo, darkMetalMat);
    cover.position.set(0, 0.05, 0.01);
    group.add(cover);

    // 枪管
    const barrelGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.35, 12);
    const barrel = new THREE.Mesh(barrelGeo, metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.01, -0.28);
    barrel.castShadow = true;
    group.add(barrel);

    // 护木
    const handguardGeo = new THREE.CylinderGeometry(0.025, 0.022, 0.2, 16);
    const handguard = new THREE.Mesh(handguardGeo, rubberMat);
    handguard.rotation.x = Math.PI / 2;
    handguard.position.set(0, 0.01, -0.15);
    handguard.castShadow = true;
    group.add(handguard);

    // 护木纹路
    for (let i = 0; i < 8; i++) {
      const ringGeo = new THREE.TorusGeometry(0.026, 0.002, 8, 24);
      const ring = new THREE.Mesh(ringGeo, darkMetalMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(0, 0.01, -0.08 - i * 0.02);
      group.add(ring);
    }

    // 弹匣
    const magGeo = new THREE.BoxGeometry(0.025, 0.1, 0.04);
    const mag = new THREE.Mesh(magGeo, darkMetalMat);
    mag.position.set(0, -0.05, 0.05);
    mag.castShadow = true;
    group.add(mag);

    // 弹匣纹路
    for (let i = 0; i < 5; i++) {
      const lineGeo = new THREE.BoxGeometry(0.026, 0.002, 0.042);
      const line = new THREE.Mesh(lineGeo, metalMat);
      line.position.set(0, -0.01 - i * 0.02, 0.05);
      group.add(line);
    }

    // 握把
    const gripGeo = new THREE.BoxGeometry(0.025, 0.07, 0.03);
    const grip = new THREE.Mesh(gripGeo, rubberMat);
    grip.position.set(0, -0.05, 0.12);
    grip.rotation.x = -0.3;
    grip.castShadow = true;
    group.add(grip);

    // 枪托
    const stockGeo = new THREE.BoxGeometry(0.03, 0.04, 0.15);
    const stock = new THREE.Mesh(stockGeo, rubberMat);
    stock.position.set(0, 0.01, 0.18);
    stock.castShadow = true;
    group.add(stock);

    // 枪托底板
    const buttpadGeo = new THREE.BoxGeometry(0.032, 0.042, 0.01);
    const buttpad = new THREE.Mesh(buttpadGeo, rubberMat);
    buttpad.position.set(0, 0.01, 0.26);
    group.add(buttpad);

    // 拉机柄
    const chargingHandleGeo = new THREE.BoxGeometry(0.035, 0.015, 0.025);
    const chargingHandle = new THREE.Mesh(chargingHandleGeo, metalMat);
    chargingHandle.position.set(0, 0.04, 0.08);
    group.add(chargingHandle);

    // 准星座
    const frontSightBaseGeo = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    const frontSightBase = new THREE.Mesh(frontSightBaseGeo, metalMat);
    frontSightBase.position.set(0, 0.035, -0.25);
    group.add(frontSightBase);

    const frontSightPostGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.02, 8);
    const frontSightPost = new THREE.Mesh(frontSightPostGeo, darkMetalMat);
    frontSightPost.position.set(0, 0.055, -0.25);
    group.add(frontSightPost);

    // 提把/导轨
    const railGeo = new THREE.BoxGeometry(0.025, 0.01, 0.12);
    const rail = new THREE.Mesh(railGeo, darkMetalMat);
    rail.position.set(0, 0.06, 0);
    group.add(rail);

    // 导轨槽
    for (let i = 0; i < 6; i++) {
      const slotGeo = new THREE.BoxGeometry(0.02, 0.008, 0.003);
      const slot = new THREE.Mesh(slotGeo, metalMat);
      slot.position.set(0, 0.055, -0.04 + i * 0.016);
      group.add(slot);
    }
  }

  /**
   * 创建冲锋枪模型
   */
  createSMGModel(group, weapon, metalMat, darkMetalMat, rubberMat) {
    // 机匣 - 更紧凑
    const receiverGeo = new THREE.BoxGeometry(0.035, 0.045, 0.18);
    const receiver = new THREE.Mesh(receiverGeo, metalMat);
    receiver.position.set(0, 0.02, 0);
    receiver.castShadow = true;
    group.add(receiver);

    // 枪管
    const barrelGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 12);
    const barrel = new THREE.Mesh(barrelGeo, metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.015, -0.18);
    barrel.castShadow = true;
    group.add(barrel);

    // 枪管护套
    const shroudGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.12, 16);
    const shroud = new THREE.Mesh(shroudGeo, darkMetalMat);
    shroud.rotation.x = Math.PI / 2;
    shroud.position.set(0, 0.015, -0.12);
    group.add(shroud);

    // 散热孔
    for (let i = 0; i < 4; i++) {
      const holeGeo = new THREE.TorusGeometry(0.008, 0.002, 8, 12);
      const hole = new THREE.Mesh(holeGeo, metalMat);
      hole.rotation.y = Math.PI / 2;
      hole.position.set(0, 0.015, -0.08 - i * 0.025);
      group.add(hole);
    }

    // 弹匣
    const magGeo = new THREE.BoxGeometry(0.02, 0.12, 0.035);
    const mag = new THREE.Mesh(magGeo, darkMetalMat);
    mag.position.set(0, -0.05, 0.03);
    mag.castShadow = true;
    group.add(mag);

    // 握把
    const gripGeo = new THREE.BoxGeometry(0.022, 0.06, 0.028);
    const grip = new THREE.Mesh(gripGeo, rubberMat);
    grip.position.set(0, -0.045, 0.08);
    grip.rotation.x = -0.25;
    grip.castShadow = true;
    group.add(grip);

    // 折叠枪托
    const stockArmGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.12, 8);
    const stockArmL = new THREE.Mesh(stockArmGeo, metalMat);
    stockArmL.rotation.z = Math.PI / 2;
    stockArmL.position.set(-0.02, 0.015, 0.14);
    group.add(stockArmL);

    const stockArmR = new THREE.Mesh(stockArmGeo.clone(), metalMat);
    stockArmR.rotation.z = Math.PI / 2;
    stockArmR.position.set(0.02, 0.015, 0.14);
    group.add(stockArmR);

    // 扳机护圈
    const guardGeo = new THREE.TorusGeometry(0.018, 0.003, 8, 16, Math.PI);
    const guard = new THREE.Mesh(guardGeo, metalMat);
    guard.position.set(0, -0.01, 0.06);
    guard.rotation.x = Math.PI / 2;
    group.add(guard);
  }

  /**
   * 创建狙击枪模型
   */
  createSniperModel(group, weapon, metalMat, darkMetalMat, rubberMat, woodMat) {
    // 机匣
    const receiverGeo = new THREE.BoxGeometry(0.04, 0.055, 0.2);
    const receiver = new THREE.Mesh(receiverGeo, metalMat);
    receiver.position.set(0, 0.025, 0);
    receiver.castShadow = true;
    group.add(receiver);

    // 长枪管
    const barrelGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.55, 16);
    const barrel = new THREE.Mesh(barrelGeo, metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.35);
    barrel.castShadow = true;
    group.add(barrel);

    // 枪管护木
    const forendGeo = new THREE.CylinderGeometry(0.025, 0.022, 0.25, 16);
    const forend = new THREE.Mesh(forendGeo, woodMat);
    forend.rotation.x = Math.PI / 2;
    forend.position.set(0, 0.02, -0.2);
    forend.castShadow = true;
    group.add(forend);

    // 弹匣
    const magGeo = new THREE.BoxGeometry(0.025, 0.08, 0.05);
    const mag = new THREE.Mesh(magGeo, darkMetalMat);
    mag.position.set(0, -0.03, 0.02);
    mag.castShadow = true;
    group.add(mag);

    // 狙击枪托
    const stockGeo = new THREE.BoxGeometry(0.04, 0.06, 0.2);
    const stock = new THREE.Mesh(stockGeo, woodMat);
    stock.position.set(0, 0.01, 0.15);
    stock.castShadow = true;
    group.add(stock);

    // 枪托贴腮板
    const cheekGeo = new THREE.BoxGeometry(0.03, 0.03, 0.08);
    const cheek = new THREE.Mesh(cheekGeo, woodMat);
    cheek.position.set(0, 0.055, 0.1);
    group.add(cheek);

    // 枪托底板
    const buttpadGeo = new THREE.BoxGeometry(0.042, 0.062, 0.015);
    const buttpad = new THREE.Mesh(buttpadGeo, rubberMat);
    buttpad.position.set(0, 0.01, 0.26);
    group.add(buttpad);

    // 握把
    const gripGeo = new THREE.BoxGeometry(0.025, 0.06, 0.03);
    const grip = new THREE.Mesh(gripGeo, woodMat);
    grip.position.set(0, -0.035, 0.1);
    grip.rotation.x = -0.35;
    grip.castShadow = true;
    group.add(grip);

    // 瞄准镜底座
    const scopeMountGeo = new THREE.BoxGeometry(0.03, 0.025, 0.1);
    const scopeMount = new THREE.Mesh(scopeMountGeo, metalMat);
    scopeMount.position.set(0, 0.065, -0.02);
    group.add(scopeMount);

    // 瞄准镜
    const scopeBodyGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.15, 16);
    const scopeBody = new THREE.Mesh(scopeBodyGeo, metalMat);
    scopeBody.rotation.x = Math.PI / 2;
    scopeBody.position.set(0, 0.09, -0.02);
    group.add(scopeBody);

    // 瞄准镜前后镜头
    const lensGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.01, 16);
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x1A3A5A,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.8
    });

    const frontLens = new THREE.Mesh(lensGeo, lensMat);
    frontLens.rotation.x = Math.PI / 2;
    frontLens.position.set(0, 0.09, -0.09);
    group.add(frontLens);

    const rearLens = new THREE.Mesh(lensGeo.clone(), lensMat);
    rearLens.rotation.x = Math.PI / 2;
    rearLens.position.set(0, 0.09, 0.05);
    group.add(rearLens);

    // 瞄准镜调整旋钮
    for (let i = 0; i < 2; i++) {
      const turretGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.025, 12);
      const turret = new THREE.Mesh(turretGeo, darkMetalMat);
      turret.position.set(i === 0 ? 0.025 : 0, 0.11, i === 0 ? -0.02 : -0.02);
      if (i === 1) turret.rotation.z = Math.PI / 2;
      group.add(turret);
    }

    // 两脚架
    const bipodGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.12, 8);
    const bipodL = new THREE.Mesh(bipodGeo, metalMat);
    bipodL.position.set(-0.03, -0.04, -0.25);
    bipodL.rotation.z = 0.3;
    group.add(bipodL);

    const bipodR = new THREE.Mesh(bipodGeo.clone(), metalMat);
    bipodR.position.set(0.03, -0.04, -0.25);
    bipodR.rotation.z = -0.3;
    group.add(bipodR);
  }

  /**
   * 创建霰弹枪模型
   */
  createShotgunModel(group, weapon, metalMat, darkMetalMat, rubberMat, woodMat) {
    // 机匣
    const receiverGeo = new THREE.BoxGeometry(0.04, 0.05, 0.15);
    const receiver = new THREE.Mesh(receiverGeo, metalMat);
    receiver.position.set(0, 0.025, 0.02);
    receiver.castShadow = true;
    group.add(receiver);

    // 双枪管
    for (let i = -1; i <= 1; i += 2) {
      const barrelGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.45, 16);
      const barrel = new THREE.Mesh(barrelGeo, metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(i * 0.015, 0.02, -0.2);
      barrel.castShadow = true;
      group.add(barrel);
    }

    // 护木
    const forendGeo = new THREE.CylinderGeometry(0.03, 0.028, 0.2, 16);
    const forend = new THREE.Mesh(forendGeo, woodMat);
    forend.rotation.x = Math.PI / 2;
    forend.position.set(0, 0.02, -0.12);
    forend.castShadow = true;
    group.add(forend);

    // 护木纹理
    for (let i = 0; i < 6; i++) {
      const lineGeo = new THREE.BoxGeometry(0.035, 0.002, 0.001);
      const line = new THREE.Mesh(lineGeo, darkMetalMat);
      line.position.set(0, 0.05, -0.05 - i * 0.025);
      line.rotation.x = Math.PI / 2;
      group.add(line);
    }

    // 弹仓
    const tubeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.3, 12);
    const tube = new THREE.Mesh(tubeGeo, metalMat);
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0, -0.01, -0.12);
    group.add(tube);

    // 枪托
    const stockGeo = new THREE.BoxGeometry(0.035, 0.05, 0.18);
    const stock = new THREE.Mesh(stockGeo, woodMat);
    stock.position.set(0, 0.015, 0.14);
    stock.castShadow = true;
    group.add(stock);

    // 枪托握把部分
    const gripStockGeo = new THREE.BoxGeometry(0.03, 0.06, 0.04);
    const gripStock = new THREE.Mesh(gripStockGeo, woodMat);
    gripStock.position.set(0, -0.02, 0.12);
    gripStock.rotation.x = -0.4;
    group.add(gripStock);

    // 枪托底板
    const buttpadGeo = new THREE.BoxGeometry(0.038, 0.052, 0.012);
    const buttpad = new THREE.Mesh(buttpadGeo, rubberMat);
    buttpad.position.set(0, 0.015, 0.24);
    group.add(buttpad);

    // 扳机护圈
    const guardGeo = new THREE.TorusGeometry(0.02, 0.003, 8, 16, Math.PI);
    const guard = new THREE.Mesh(guardGeo, metalMat);
    guard.position.set(0, -0.005, 0.06);
    guard.rotation.x = Math.PI / 2;
    group.add(guard);

    // 扳机
    const triggerGeo = new THREE.BoxGeometry(0.006, 0.018, 0.006);
    const trigger = new THREE.Mesh(triggerGeo, metalMat);
    trigger.position.set(0, -0.015, 0.05);
    group.add(trigger);
  }

  /**
   * 添加瞄准镜
   */
  addScope(group, scopeAttachment) {
    const magnification = scopeAttachment.magnification || 1;

    // 根据倍率调整瞄准镜大小
    const scopeLength = 0.08 + magnification * 0.02;
    const scopeRadius = 0.015 + magnification * 0.003;

    const scopeBodyGeo = new THREE.CylinderGeometry(scopeRadius, scopeRadius, scopeLength, 16);
    const scopeMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.2,
      metalness: 0.8
    });
    const scopeBody = new THREE.Mesh(scopeBodyGeo, scopeMat);
    scopeBody.rotation.x = Math.PI / 2;
    scopeBody.position.set(0, 0.07, -0.05);
    group.add(scopeBody);
  }

  /**
   * 创建枪口闪光 - 增强版
   */
  createMuzzleFlash() {
    const flashGroup = new THREE.Group();

    // 主火焰 - 中心亮白色
    const coreGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    flashGroup.add(core);
    flashGroup.coreFlash = core;

    // 内层火焰 - 橙黄色
    const innerGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xFFAA00,
      transparent: true,
      opacity: 0
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    flashGroup.add(inner);
    flashGroup.innerFlash = inner;

    // 外层火焰 - 橙红色
    const outerGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0
    });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    flashGroup.add(outer);
    flashGroup.outerFlash = outer;

    // 火焰喷出效果 - 前方锥形
    const coneGeo = new THREE.ConeGeometry(0.04, 0.15, 12);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xFFCC00,
      transparent: true,
      opacity: 0
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = -Math.PI / 2;
    cone.position.z = -0.08;
    flashGroup.add(cone);
    flashGroup.coneFlash = cone;

    // 闪光光晕 - 环形
    const ringGeo = new THREE.RingGeometry(0.02, 0.1, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFFAA00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.z = 0.01;
    flashGroup.add(ring);
    flashGroup.ringFlash = ring;

    // 点光源 - 枪口闪光照明
    const light = new THREE.PointLight(0xFFAA00, 0, 5);
    light.position.z = -0.05;
    flashGroup.add(light);
    flashGroup.flashLight = light;

    flashGroup.position.set(0, 0.05, -0.5);
    flashGroup.visible = false;

    return flashGroup;
  }

  /**
   * 清除武器模型
   */
  clearWeaponModel() {
    if (this.weaponModel) {
      this.weaponContainer.remove(this.weaponModel);
      this.weaponModel.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.weaponModel = null;
      this.muzzleFlash = null;
    }
  }

  /**
   * 射击
   */
  shoot() {
    const weapon = this.getCurrentWeapon();
    if (!weapon) return null;

    const result = weapon.shoot();
    if (!result) return null;

    // 播放音效
    if (this.audioManager) {
      this.audioManager.playShoot(weapon.id);
    }

    // 显示枪口闪光
    this.showMuzzleFlash(weapon);

    // 抛出弹壳
    this.createShellCasing();

    // 相机震动（后坐力）
    this.applyRecoil(weapon);

    // 命中检测
    this.performHitDetection(weapon, result);

    return result;
  }

  /**
   * 执行命中检测
   */
  performHitDetection(weapon, result) {
    if (!this.world) return;

    // 获取射击方向
    let origin, direction;

    if (this.entity.cameraController) {
      // 玩家使用相机方向
      const camera = this.entity.cameraController.camera;
      direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);
      origin = camera.position.clone();
    } else {
      // 敌人使用角色朝向
      direction = new THREE.Vector3(0, 0, -1);
      direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.entity.rotationY);
      origin = this.entity.position.clone();
      origin.y += 1.5; // 头部高度
    }

    // 添加散布
    const spread = result.spread * 0.01;
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.normalize();

    // 射线检测
    this.raycaster.set(origin, direction);
    this.raycaster.far = weapon.range;

    // 检测目标
    const targets = [];

    // 如果是敌人，目标是玩家
    if (this.entity.hasTag('enemy') && this.world.player) {
      targets.push(this.world.player);
    }

    // 如果是玩家，目标是敌人
    if (this.entity.hasTag('player')) {
      const enemies = this.world.enemies || [];
      targets.push(...enemies.filter(e => !e.isDead()));
    }

    if (targets.length > 0) {
      const targetObjects = targets.map(t => t.object3D);
      const intersects = this.raycaster.intersectObjects(targetObjects, true);

      if (intersects.length > 0) {
        const hit = intersects[0];

        // 找到被击中的目标
        let hitTarget = null;
        let current = hit.object;

        while (current && !hitTarget) {
          hitTarget = targets.find(t => t.object3D === current);
          current = current.parent;
        }

        if (hitTarget) {
          // 计算伤害（根据距离衰减）
          const distance = hit.distance;
          let damage = weapon.damage;

          if (distance > weapon.range * 0.5) {
            damage *= 1 - (distance - weapon.range * 0.5) / (weapon.range * 0.5);
          }

          // 造成伤害
          hitTarget.takeDamage(Math.floor(damage));

          // 播放命中音效
          if (this.audioManager) {
            this.audioManager.playHit();
          }

          // 创建命中粒子效果
          if (this.world.createHitEffect && this.world.createBloodSplatter) {
            this.world.createHitEffect(hit.point);
            this.world.createBloodSplatter(hit.point);
          }

          console.log(`Hit target for ${Math.floor(damage)} damage`);
        }
      }
    } else {
      // 没有击中目标，检测地形和建筑物
      const staticObjects = [];
      if (this.world.terrain) {
        staticObjects.push(this.world.terrain);
      }
      this.world.buildings.forEach(b => staticObjects.push(b));

      if (staticObjects.length > 0) {
        const staticIntersects = this.raycaster.intersectObjects(staticObjects, true);

        if (staticIntersects.length > 0) {
          const hit = staticIntersects[0];

          // 创建火花效果
          if (this.world.createSparkEffect) {
            this.world.createSparkEffect(hit.point);
          }
        }
      }
    }
  }

  /**
   * 显示枪口闪光 - 增强版
   */
  showMuzzleFlash(weapon) {
    if (!this.muzzleFlash) return;

    const flash = this.muzzleFlash;
    flash.visible = true;

    // 根据武器类型调整闪光大小
    const sizeMultiplier = weapon?.category === 'shotgun' ? 1.5 :
                          weapon?.category === 'sniper' ? 1.8 :
                          weapon?.category === 'pistol' ? 0.7 : 1;

    // 设置各层闪光
    if (flash.coreFlash) {
      flash.coreFlash.material.opacity = 1;
      flash.coreFlash.scale.setScalar(sizeMultiplier);
    }
    if (flash.innerFlash) {
      flash.innerFlash.material.opacity = 0.9;
      flash.innerFlash.scale.setScalar(sizeMultiplier);
    }
    if (flash.outerFlash) {
      flash.outerFlash.material.opacity = 0.7;
      flash.outerFlash.scale.setScalar(sizeMultiplier);
    }
    if (flash.coneFlash) {
      flash.coneFlash.material.opacity = 0.8;
      flash.coneFlash.scale.setScalar(sizeMultiplier);
    }
    if (flash.ringFlash) {
      flash.ringFlash.material.opacity = 0.5;
      flash.ringFlash.scale.setScalar(sizeMultiplier);
    }
    if (flash.flashLight) {
      flash.flashLight.intensity = 3 * sizeMultiplier;
    }

    // 随机旋转增加变化
    flash.rotation.z = Math.random() * Math.PI * 2;

    // 快速衰减动画
    const fadeStart = () => {
      let opacity = 1;
      const fadeInterval = setInterval(() => {
        opacity -= 0.2;

        if (flash.coreFlash) flash.coreFlash.material.opacity = Math.max(0, opacity);
        if (flash.innerFlash) flash.innerFlash.material.opacity = Math.max(0, opacity * 0.9);
        if (flash.outerFlash) flash.outerFlash.material.opacity = Math.max(0, opacity * 0.7);
        if (flash.coneFlash) flash.coneFlash.material.opacity = Math.max(0, opacity * 0.8);
        if (flash.ringFlash) flash.ringFlash.material.opacity = Math.max(0, opacity * 0.5);
        if (flash.flashLight) flash.flashLight.intensity = Math.max(0, opacity * 3);

        if (opacity <= 0) {
          clearInterval(fadeInterval);
          flash.visible = false;
        }
      }, 16); // ~60fps
    };

    setTimeout(fadeStart, 30);
  }

  /**
   * 应用后坐力
   */
  applyRecoil(weapon) {
    // 通过相机控制器应用后坐力
    if (this.entity.cameraController) {
      const recoilAmount = weapon.recoil * (this.isAiming ? 0.5 : 1);
      this.entity.cameraController.pitch += recoilAmount * 0.1;
    }
  }

  /**
   * 开始换弹
   */
  startReload() {
    const weapon = this.getCurrentWeapon();
    if (!weapon) return false;

    if (weapon.startReload()) {
      this.isReloading = true;

      // 播放换弹音效
      if (this.audioManager) {
        this.audioManager.playReload();
      }

      return true;
    }
    return false;
  }

  /**
   * 瞄准
   */
  setAiming(aiming) {
    const weapon = this.getCurrentWeapon();
    if (weapon) {
      weapon.setAiming(aiming);
    }
    this.isAiming = aiming;
  }

  /**
   * 更新
   */
  update(deltaTime) {
    if (!this.inputManager) return;

    const weapon = this.getCurrentWeapon();

    // 更新武器状态
    if (weapon) {
      weapon.update(deltaTime);

      // 检查换弹完成
      if (weapon.isReloading && weapon.getReloadProgress() >= 1) {
        this.isReloading = false;
      }
    }

    // 处理射击输入
    if (this.inputManager.isMouseButtonHeld(0) && !this.isReloading) {
      if (weapon && weapon.type === 'auto') {
        this.shoot();
      } else if (!this.isShooting) {
        this.isShooting = true;
        this.shoot();
      }
    } else {
      this.isShooting = false;
    }

    // 处理瞄准输入
    if (this.inputManager.isMouseButtonHeld(2)) {
      this.setAiming(true);
    } else {
      this.setAiming(false);
    }

    // 更新瞄准进度
    if (this.isAiming) {
      this.adsProgress = Math.min(1, this.adsProgress + this.adsSpeed * deltaTime);
    } else {
      this.adsProgress = Math.max(0, this.adsProgress - this.adsSpeed * deltaTime);
    }

    // 处理换弹输入
    if (this.inputManager.isKeyPressed('KeyR')) {
      this.startReload();
    }

    // 处理武器切换
    this.handleWeaponSwitch();

    // 更新武器模型动画
    this.updateWeaponAnimation(deltaTime);
  }

  /**
   * 处理武器切换
   */
  handleWeaponSwitch() {
    // 数字键切换
    if (this.inputManager.isKeyPressed('Digit1')) {
      this.switchToSlot(0);
    } else if (this.inputManager.isKeyPressed('Digit2')) {
      this.switchToSlot(1);
    } else if (this.inputManager.isKeyPressed('Digit3')) {
      this.switchToSlot(2);
    }

    // 滚轮切换
    const wheelDelta = this.inputManager.mouse.wheel;
    if (wheelDelta !== 0) {
      if (wheelDelta > 0) {
        this.previousWeapon();
      } else {
        this.nextWeapon();
      }
    }
  }

  /**
   * 更新武器动画 - 纯第一人称
   */
  updateWeaponAnimation(deltaTime) {
    if (!this.weaponModel) return;

    // 纯第一人称动画
    // 基础位置 - 与createWeaponModel中的设置匹配
    const baseX = 0.15;
    const baseY = -0.12;
    const baseZ = -0.32;

    // 瞄准时位置变化 - 武器移到屏幕中心
    const adsProgress = this.adsProgress || 0;
    const adsX = baseX - 0.1 * adsProgress;  // 瞄准时武器移到中心
    const adsY = baseY + 0.05 * adsProgress;   // 稍微上移
    const adsZ = baseZ + 0.04 * adsProgress;   // 稍微前移

    // 移动时的晃动 - 幅度减小
    let bobX = 0, bobY = 0;
    if (this.entity.characterController) {
      const isMoving = this.entity.characterController.isMoving;
      if (isMoving && !this.isAiming) {
        const time = performance.now() * 0.003;
        const speed = this.entity.characterController.moveSpeed;
        const bobIntensity = speed > 7 ? 0.008 : 0.004;  // 减小晃动
        bobX = Math.cos(time * 0.5) * bobIntensity;
        bobY = Math.sin(time) * bobIntensity;
      }
    }

    // 呼吸效果 - 更细腻
    const breatheTime = performance.now() * 0.001;
    const breatheY = Math.sin(breatheTime * 1.2) * 0.0015;
    const breatheX = Math.sin(breatheTime * 0.9) * 0.001;

    // 后坐力恢复
    if (this.recoilOffset) {
      this.recoilOffset *= 0.88;
    } else {
      this.recoilOffset = 0;
    }

    // 应用位置
    const targetX = adsX + bobX + breatheX;
    const targetY = adsY + bobY + breatheY + this.recoilOffset * 0.015;
    const targetZ = adsZ - this.recoilOffset * 0.03;

    this.weaponModel.position.x += (targetX - this.weaponModel.position.x) * 18 * deltaTime;
    this.weaponModel.position.y += (targetY - this.weaponModel.position.y) * 18 * deltaTime;
    this.weaponModel.position.z += (targetZ - this.weaponModel.position.z) * 18 * deltaTime;

    // 更新手部模型 - 跟随武器移动
    if (this.handsGroup) {
      // 基础手部位置
      const handBaseX = 0.18 - 0.1 * adsProgress;
      const handBaseY = 1.35 + bobY * 1.2 + breatheY;
      const handBaseZ = -0.25 + bobX * 0.6;

      // 平滑过渡
      this.handsGroup.position.x += (handBaseX - this.handsGroup.position.x) * 15 * deltaTime;
      this.handsGroup.position.y += (handBaseY - this.handsGroup.position.y) * 15 * deltaTime;
      this.handsGroup.position.z += (handBaseZ - this.handsGroup.position.z) * 15 * deltaTime;

      // 后坐力影响
      if (this.recoilOffset > 0.008) {
        this.handsGroup.position.y += this.recoilOffset * 0.02;
        this.handsGroup.position.z -= this.recoilOffset * 0.015;
      }

      this.handsGroup.visible = true;
    }

    // 更新弹壳
    this.updateShellCasings(deltaTime);
  }

  /**
   * 应用后坐力动画
   */
  applyRecoilAnimation(weapon) {
    if (!this.weaponModel) return;

    // 设置后坐力偏移
    const recoilAmount = weapon?.recoil || 0.3;
    this.recoilOffset = recoilAmount;

    // 武器快速上抬
    if (this.entity.cameraController?.isFirstPerson) {
      this.weaponModel.position.z -= recoilAmount * 0.02;
      this.weaponModel.rotation.x -= recoilAmount * 0.1;
    }
  }

  /**
   * 创建弹壳抛出效果
   */
  createShellCasing() {
    if (!this.entity.object3D) return;

    // 弹壳几何体和材质
    const shellGeo = new THREE.CylinderGeometry(0.004, 0.003, 0.025, 8);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0xC4A44A,  // 黄铜色
      roughness: 0.3,
      metalness: 0.8
    });

    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.castShadow = true;

    // 初始位置（枪的抛壳口位置）
    const ejectPos = new THREE.Vector3(-0.15, 1.25, 0);
    ejectPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.entity.rotationY || 0);
    ejectPos.add(this.entity.position);
    shell.position.copy(ejectPos);

    // 随机初始速度
    const velocity = new THREE.Vector3(
      -2 - Math.random() * 2,  // 向左抛出
      2 + Math.random() * 2,   // 向上
      -0.5 + Math.random()     // 略微向前或向后
    );

    // 应用角色朝向
    velocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.entity.rotationY || 0);

    // 随机旋转速度
    const angularVelocity = new THREE.Vector3(
      Math.random() * 20 - 10,
      Math.random() * 20 - 10,
      Math.random() * 20 - 10
    );

    // 存储弹壳数据
    if (!this.shellCasings) {
      this.shellCasings = [];
    }

    this.shellCasings.push({
      mesh: shell,
      velocity: velocity,
      angularVelocity: angularVelocity,
      lifetime: 0,
      maxLifetime: 3,  // 3秒后消失
      grounded: false
    });

    // 添加到场景
    if (this.world && this.world.scene) {
      this.world.scene.add(shell);
    } else if (this.entity.object3D.parent) {
      this.entity.object3D.parent.add(shell);
    }
  }

  /**
   * 更新弹壳物理
   */
  updateShellCasings(deltaTime) {
    if (!this.shellCasings) return;

    const gravity = -15;
    const groundY = this.entity.position ? this.entity.position.y : 0;

    for (let i = this.shellCasings.length - 1; i >= 0; i--) {
      const casing = this.shellCasings[i];
      casing.lifetime += deltaTime;

      // 超时移除
      if (casing.lifetime > casing.maxLifetime) {
        this.removeShellCasing(i);
        continue;
      }

      if (!casing.grounded) {
        // 应用重力
        casing.velocity.y += gravity * deltaTime;

        // 更新位置
        casing.mesh.position.x += casing.velocity.x * deltaTime;
        casing.mesh.position.y += casing.velocity.y * deltaTime;
        casing.mesh.position.z += casing.velocity.z * deltaTime;

        // 旋转
        casing.mesh.rotation.x += casing.angularVelocity.x * deltaTime;
        casing.mesh.rotation.y += casing.angularVelocity.y * deltaTime;
        casing.mesh.rotation.z += casing.angularVelocity.z * deltaTime;

        // 检测落地
        if (casing.mesh.position.y <= groundY + 0.01) {
          casing.grounded = true;
          casing.mesh.position.y = groundY + 0.01;

          // 落地时减速
          casing.velocity.x *= 0.3;
          casing.velocity.z *= 0.3;
          casing.angularVelocity.multiplyScalar(0.2);
        }
      } else {
        // 地面滑动减速
        casing.velocity.x *= 0.95;
        casing.velocity.z *= 0.95;
        casing.angularVelocity.multiplyScalar(0.95);

        casing.mesh.position.x += casing.velocity.x * deltaTime;
        casing.mesh.position.z += casing.velocity.z * deltaTime;
        casing.mesh.rotation.x += casing.angularVelocity.x * deltaTime;
        casing.mesh.rotation.z += casing.angularVelocity.z * deltaTime;
      }
    }

    // 限制弹壳数量
    while (this.shellCasings.length > 30) {
      this.removeShellCasing(0);
    }
  }

  /**
   * 移除弹壳
   */
  removeShellCasing(index) {
    if (!this.shellCasings || index < 0 || index >= this.shellCasings.length) return;

    const casing = this.shellCasings[index];
    if (casing.mesh.parent) {
      casing.mesh.parent.remove(casing.mesh);
    }
    casing.mesh.geometry.dispose();
    casing.mesh.material.dispose();
    this.shellCasings.splice(index, 1);
  }

  /**
   * 获取弹药信息
   */
  getAmmoInfo() {
    const weapon = this.getCurrentWeapon();
    if (!weapon) {
      return { current: 0, max: 0, reserve: 0 };
    }
    return weapon.getAmmoStatus();
  }

  /**
   * 添加弹药
   */
  addAmmo(caliber, count) {
    // 先填充当前武器
    const currentWeapon = this.getCurrentWeapon();
    if (currentWeapon && currentWeapon.caliber === caliber) {
      currentWeapon.addAmmo(count);
    }

    // 再填充其他同口径武器
    this.weapons.forEach(weapon => {
      if (weapon && weapon.caliber === caliber && weapon !== currentWeapon) {
        weapon.addAmmo(count);
      }
    });
  }

  /**
   * 销毁
   */
  destroy() {
    this.clearWeaponModel();
    this.inputManager = null;
    this.audioManager = null;
  }
}