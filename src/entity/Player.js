/**
 * 玩家角色类
 * 参考和平精英风格 - 高真实度人物模型
 */
import { Entity } from './Entity.js';
import { CharacterController } from '../component/CharacterController.js';
import { Health } from '../component/Health.js';
import { Inventory } from '../component/Inventory.js';
import { WeaponController } from '../component/WeaponController.js';

// 玩家状态
export const PlayerState = {
  IDLE: 'idle',
  WALKING: 'walking',
  RUNNING: 'running',
  JUMPING: 'jumping',
  CROUCHING: 'crouching',
  PRONE: 'prone',
  DEAD: 'dead'
};

// 装备等级
export const ArmorLevel = {
  NONE: 0,
  LEVEL1: 1,
  LEVEL2: 2,
  LEVEL3: 3
};

export class Player extends Entity {
  constructor() {
    super('Player');

    // 玩家状态
    this.state = PlayerState.IDLE;
    this.previousState = PlayerState.IDLE;

    // 移动参数
    this.walkSpeed = 5;
    this.runSpeed = 10;
    this.crouchSpeed = 2.5;
    this.proneSpeed = 1;
    this.jumpForce = 8;
    this.gravity = -20;

    // 角色朝向
    this.rotationY = 0;

    // 装备系统
    this.equipment = {
      helmet: ArmorLevel.LEVEL3,
      vest: ArmorLevel.LEVEL3,
      backpack: ArmorLevel.LEVEL3
    };

    // 添加标签
    this.addTag('player');

    // 初始化组件
    this.characterController = this.addComponent(new CharacterController());
    this.health = this.addComponent(new Health(100));
    this.inventory = this.addComponent(new Inventory());
    this.weaponController = this.addComponent(new WeaponController());

    // 创建角色模型
    this.createModel();
  }

  /**
   * 初始化
   */
  init() {
    super.init();
    if (this.weaponController) {
      this.weaponController.init();
    }
  }

  /**
   * 创建高真实度人物模型
   */
  createModel() {
    const group = new THREE.Group();
    group.name = 'character';

    // 创建材质
    const materials = this.createMaterials();

    // 按身体部位创建模型
    this.createHead(group, materials);
    this.createTorso(group, materials);
    this.createArms(group, materials);
    this.createLegs(group, materials);
    this.createEquipment(group, materials);

    // 存储模型部件引用
    this.modelParts = {
      head: group.getObjectByName('head'),
      torso: group.getObjectByName('torso'),
      leftArm: group.getObjectByName('leftArm'),
      rightArm: group.getObjectByName('rightArm'),
      leftLeg: group.getObjectByName('leftLeg'),
      rightLeg: group.getObjectByName('rightLeg'),
      helmet: group.getObjectByName('helmet'),
      vest: group.getObjectByName('vest')
    };

    this.object3D.add(group);
    this.modelGroup = group;
  }

  /**
   * 创建材质
   */
  createMaterials() {
    return {
      // 皮肤 - 自然的肤色
      skin: new THREE.MeshStandardMaterial({
        color: 0xDEB896,
        roughness: 0.65,
        metalness: 0
      }),

      // 头发 - 深棕色
      hair: new THREE.MeshStandardMaterial({
        color: 0x1A1208,
        roughness: 0.85,
        metalness: 0
      }),

      // 战术衬衫 - 深军绿色
      shirt: new THREE.MeshStandardMaterial({
        color: 0x3D4A35,
        roughness: 0.8,
        metalness: 0.05
      }),

      // 战术裤子 - 卡其色
      pants: new THREE.MeshStandardMaterial({
        color: 0x5A4A38,
        roughness: 0.85,
        metalness: 0
      }),

      // 靴子 - 棕色军靴
      boots: new THREE.MeshStandardMaterial({
        color: 0x3A2818,
        roughness: 0.7,
        metalness: 0.05
      }),

      // 靴底 - 深色橡胶
      bootSole: new THREE.MeshStandardMaterial({
        color: 0x1A1A1A,
        roughness: 0.95,
        metalness: 0
      }),

      // 战术装备 - 橄榄绿
      tactical: new THREE.MeshStandardMaterial({
        color: 0x4A4A38,
        roughness: 0.75,
        metalness: 0.1
      }),

      // 金属配件 - 暗银色
      metal: new THREE.MeshStandardMaterial({
        color: 0x5A5A5A,
        roughness: 0.35,
        metalness: 0.75
      }),

      // 头盔材质 - 深灰金属感
      helmet: new THREE.MeshStandardMaterial({
        color: 0x2A2A28,
        roughness: 0.45,
        metalness: 0.35
      }),

      // 防弹衣材质 - 军绿色凯夫拉
      vest: new THREE.MeshStandardMaterial({
        color: 0x3A4035,
        roughness: 0.65,
        metalness: 0.15
      }),

      // 眼睛材质
      eyeWhite: new THREE.MeshStandardMaterial({ color: 0xFFFAF5, roughness: 0.25 }),
      iris: new THREE.MeshStandardMaterial({ color: 0x4A6A3A, roughness: 0.15, metalness: 0.1 }),
      pupil: new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.05 }),

      // 嘴唇
      lips: new THREE.MeshStandardMaterial({ color: 0xB88070, roughness: 0.5 }),

      // 牙齿
      teeth: new THREE.MeshStandardMaterial({ color: 0xFFF8F0, roughness: 0.3 }),

      // 腰带
      belt: new THREE.MeshStandardMaterial({ color: 0x2A2018, roughness: 0.7 }),
      beltBuckle: new THREE.MeshStandardMaterial({ color: 0xB8960B, roughness: 0.25, metalness: 0.8 }),

      // 手套
      glove: new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.85, metalness: 0.05 })
    };
  }

  /**
   * 创建头部 - 高精度模型
   */
  createHead(group, mat) {
    const headGroup = new THREE.Group();
    headGroup.name = 'head';

    // ===== 头颅 =====
    // 主体 - 椭球形
    const skullGeo = new THREE.SphereGeometry(0.1, 28, 24);
    const skull = new THREE.Mesh(skullGeo, mat.skin);
    skull.scale.set(1, 1.12, 1.02);
    skull.castShadow = true;
    headGroup.add(skull);

    // 前额区域 - 稍微突出
    const foreheadGeo = new THREE.SphereGeometry(0.09, 20, 16, 0, Math.PI, 0, Math.PI * 0.4);
    const forehead = new THREE.Mesh(foreheadGeo, mat.skin);
    forehead.position.set(0, 0.03, 0.03);
    forehead.scale.set(1.05, 1, 1.1);
    headGroup.add(forehead);

    // ===== 眼睛区域 =====
    // 眼窝
    const eyeSocketGeo = new THREE.SphereGeometry(0.022, 14, 12, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.7);
    const eyeSocketMat = new THREE.MeshStandardMaterial({ color: 0xC8A080, roughness: 0.8 });

    const leftSocket = new THREE.Mesh(eyeSocketGeo, eyeSocketMat);
    leftSocket.position.set(-0.035, 0.012, 0.085);
    leftSocket.rotation.x = Math.PI / 2;
    headGroup.add(leftSocket);

    const rightSocket = leftSocket.clone();
    rightSocket.position.x = 0.035;
    headGroup.add(rightSocket);

    // 眼白
    const eyeWhiteGeo = new THREE.SphereGeometry(0.018, 14, 14);
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, mat.eyeWhite);
    leftEyeWhite.position.set(-0.035, 0.012, 0.092);
    headGroup.add(leftEyeWhite);

    const rightEyeWhite = leftEyeWhite.clone();
    rightEyeWhite.position.x = 0.035;
    headGroup.add(rightEyeWhite);

    // 虹膜
    const irisGeo = new THREE.SphereGeometry(0.011, 12, 12);
    const leftIris = new THREE.Mesh(irisGeo, mat.iris);
    leftIris.position.set(-0.035, 0.012, 0.1);
    headGroup.add(leftIris);

    const rightIris = leftIris.clone();
    rightIris.position.x = 0.035;
    headGroup.add(rightIris);

    // 瞳孔
    const pupilGeo = new THREE.SphereGeometry(0.005, 10, 10);
    const leftPupil = new THREE.Mesh(pupilGeo, mat.pupil);
    leftPupil.position.set(-0.035, 0.012, 0.105);
    headGroup.add(leftPupil);

    const rightPupil = leftPupil.clone();
    rightPupil.position.x = 0.035;
    headGroup.add(rightPupil);

    // ===== 眉毛 =====
    const browGeo = new THREE.BoxGeometry(0.032, 0.006, 0.01);
    const leftBrow = new THREE.Mesh(browGeo, mat.hair);
    leftBrow.position.set(-0.035, 0.035, 0.095);
    leftBrow.rotation.z = -0.08;
    leftBrow.rotation.x = -0.15;
    headGroup.add(leftBrow);

    const rightBrow = leftBrow.clone();
    rightBrow.position.x = 0.035;
    rightBrow.rotation.z = 0.08;
    headGroup.add(rightBrow);

    // ===== 鼻子 =====
    // 鼻梁
    const noseBridgeGeo = new THREE.BoxGeometry(0.015, 0.035, 0.012);
    const noseBridge = new THREE.Mesh(noseBridgeGeo, mat.skin);
    noseBridge.position.set(0, 0, 0.095);
    headGroup.add(noseBridge);

    // 鼻尖
    const noseTipGeo = new THREE.SphereGeometry(0.012, 12, 10);
    const noseTip = new THREE.Mesh(noseTipGeo, mat.skin);
    noseTip.position.set(0, -0.018, 0.1);
    noseTip.scale.set(1, 0.8, 0.9);
    headGroup.add(noseTip);

    // 鼻翼
    const nostrilGeo = new THREE.SphereGeometry(0.006, 8, 8);
    const leftNostril = new THREE.Mesh(nostrilGeo, mat.skin);
    leftNostril.position.set(-0.01, -0.02, 0.095);
    leftNostril.scale.set(1.2, 0.7, 0.8);
    headGroup.add(leftNostril);

    const rightNostril = leftNostril.clone();
    rightNostril.position.x = 0.01;
    headGroup.add(rightNostril);

    // ===== 嘴巴 =====
    // 上唇
    const upperLipGeo = new THREE.TorusGeometry(0.015, 0.005, 8, 16, Math.PI);
    const upperLip = new THREE.Mesh(upperLipGeo, mat.lips);
    upperLip.position.set(0, -0.038, 0.095);
    upperLip.rotation.x = Math.PI / 2;
    upperLip.rotation.z = Math.PI;
    headGroup.add(upperLip);

    // 下唇
    const lowerLipGeo = new THREE.TorusGeometry(0.014, 0.006, 8, 16, Math.PI);
    const lowerLip = new THREE.Mesh(lowerLipGeo, mat.lips);
    lowerLip.position.set(0, -0.05, 0.09);
    lowerLip.rotation.x = Math.PI / 2;
    lowerLip.rotation.z = Math.PI;
    headGroup.add(lowerLip);

    // ===== 下巴 =====
    const chinGeo = new THREE.SphereGeometry(0.045, 16, 12, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.6);
    const chin = new THREE.Mesh(chinGeo, mat.skin);
    chin.position.set(0, -0.055, 0.03);
    chin.rotation.x = 0.2;
    headGroup.add(chin);

    // ===== 颧骨 =====
    const cheekGeo = new THREE.SphereGeometry(0.03, 12, 10);
    const leftCheek = new THREE.Mesh(cheekGeo, mat.skin);
    leftCheek.position.set(-0.065, 0, 0.06);
    leftCheek.scale.set(0.8, 0.9, 0.6);
    headGroup.add(leftCheek);

    const rightCheek = leftCheek.clone();
    rightCheek.position.x = 0.065;
    headGroup.add(rightCheek);

    // ===== 耳朵 =====
    // 耳廓
    const earOuterGeo = new THREE.TorusGeometry(0.022, 0.008, 8, 16);
    const leftEarOuter = new THREE.Mesh(earOuterGeo, mat.skin);
    leftEarOuter.position.set(-0.1, 0.005, 0.01);
    leftEarOuter.rotation.y = Math.PI / 2;
    leftEarOuter.rotation.z = -0.1;
    headGroup.add(leftEarOuter);

    const rightEarOuter = leftEarOuter.clone();
    rightEarOuter.position.x = 0.1;
    rightEarOuter.rotation.y = -Math.PI / 2;
    rightEarOuter.rotation.z = 0.1;
    headGroup.add(rightEarOuter);

    // 耳垂
    const earLobeGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const leftEarLobe = new THREE.Mesh(earLobeGeo, mat.skin);
    leftEarLobe.position.set(-0.1, -0.015, 0.01);
    leftEarLobe.scale.set(0.8, 1, 0.5);
    headGroup.add(leftEarLobe);

    const rightEarLobe = leftEarLobe.clone();
    rightEarLobe.position.x = 0.1;
    headGroup.add(rightEarLobe);

    // ===== 头发 =====
    // 头发基底
    const hairBaseGeo = new THREE.SphereGeometry(0.105, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairBase = new THREE.Mesh(hairBaseGeo, mat.hair);
    hairBase.position.y = 0.01;
    hairBase.scale.set(1.03, 1.02, 1.02);
    hairBase.castShadow = true;
    headGroup.add(hairBase);

    // 头发层次 - 顶部
    const hairTopGeo = new THREE.SphereGeometry(0.095, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.35);
    const hairTop = new THREE.Mesh(hairTopGeo, mat.hair);
    hairTop.position.y = 0.025;
    hairTop.scale.set(1.05, 0.9, 1);
    headGroup.add(hairTop);

    // 刘海
    const bangsGeo = new THREE.BoxGeometry(0.16, 0.025, 0.055);
    const bangs = new THREE.Mesh(bangsGeo, mat.hair);
    bangs.position.set(0, 0.07, 0.065);
    bangs.rotation.x = 0.25;
    bangs.castShadow = true;
    headGroup.add(bangs);

    // 侧发
    const sideHairGeo = new THREE.BoxGeometry(0.025, 0.07, 0.04);
    const leftSideHair = new THREE.Mesh(sideHairGeo, mat.hair);
    leftSideHair.position.set(-0.095, 0.02, 0.04);
    leftSideHair.rotation.z = 0.15;
    headGroup.add(leftSideHair);

    const rightSideHair = leftSideHair.clone();
    rightSideHair.position.x = 0.095;
    rightSideHair.rotation.z = -0.15;
    headGroup.add(rightSideHair);

    // ===== 颈部 =====
    // 颈部主体
    const neckGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.1, 16);
    const neck = new THREE.Mesh(neckGeo, mat.skin);
    neck.position.y = -0.135;
    neck.castShadow = true;
    headGroup.add(neck);

    // 喉结（男性特征）
    const adamsAppleGeo = new THREE.SphereGeometry(0.015, 10, 10);
    const adamsApple = new THREE.Mesh(adamsAppleGeo, mat.skin);
    adamsApple.position.set(0, -0.115, 0.04);
    adamsApple.scale.set(0.8, 1.2, 0.6);
    headGroup.add(adamsApple);

    // 斜方肌过渡
    const trapeziusGeo = new THREE.BoxGeometry(0.12, 0.03, 0.06);
    const trapezius = new THREE.Mesh(trapeziusGeo, mat.skin);
    trapezius.position.set(0, -0.175, -0.01);
    trapezius.rotation.x = 0.3;
    headGroup.add(trapezius);

    headGroup.position.y = 1.62;
    group.add(headGroup);
  }

  /**
   * 创建躯干 - 高精度模型
   */
  createTorso(group, mat) {
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'torso';

    // ===== 胸部 =====
    // 胸腔
    const chestGeo = new THREE.CylinderGeometry(0.16, 0.15, 0.25, 20);
    const chest = new THREE.Mesh(chestGeo, mat.shirt);
    chest.position.y = 1.22;
    chest.castShadow = true;
    torsoGroup.add(chest);

    // 胸肌轮廓（衬衫下）
    const pectoralGeo = new THREE.SphereGeometry(0.07, 14, 12);
    const leftPectoral = new THREE.Mesh(pectoralGeo, mat.shirt);
    leftPectoral.position.set(-0.07, 1.25, 0.12);
    leftPectoral.scale.set(1.2, 0.7, 0.6);
    torsoGroup.add(leftPectoral);

    const rightPectoral = leftPectoral.clone();
    rightPectoral.position.x = 0.07;
    torsoGroup.add(rightPectoral);

    // ===== 腹部 =====
    const abdomenGeo = new THREE.CylinderGeometry(0.14, 0.13, 0.18, 18);
    const abdomen = new THREE.Mesh(abdomenGeo, mat.shirt);
    abdomen.position.y = 1.02;
    abdomen.castShadow = true;
    torsoGroup.add(abdomen);

    // 衬衫褶皱细节
    for (let i = 0; i < 5; i++) {
      const foldGeo = new THREE.BoxGeometry(0.002, 0.15, 0.003);
      const fold = new THREE.Mesh(foldGeo, mat.shirt);
      fold.position.set(-0.04 + i * 0.02, 1.08, 0.13);
      torsoGroup.add(fold);
    }

    // ===== 腰部 =====
    const waistGeo = new THREE.CylinderGeometry(0.13, 0.12, 0.1, 16);
    const waist = new THREE.Mesh(waistGeo, mat.pants);
    waist.position.y = 0.88;
    waist.castShadow = true;
    torsoGroup.add(waist);

    // ===== 腰带 =====
    // 腰带主体
    const beltGeo = new THREE.TorusGeometry(0.125, 0.015, 10, 28);
    const belt = new THREE.Mesh(beltGeo, mat.belt);
    belt.position.y = 0.82;
    belt.rotation.x = Math.PI / 2;
    torsoGroup.add(belt);

    // 腰带扣
    const buckleGeo = new THREE.BoxGeometry(0.045, 0.03, 0.02);
    const buckle = new THREE.Mesh(buckleGeo, mat.beltBuckle);
    buckle.position.set(0, 0.82, 0.12);
    torsoGroup.add(buckle);

    // 腰带孔
    for (let i = 0; i < 5; i++) {
      const holeGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.005, 8);
      const hole = new THREE.Mesh(holeGeo, mat.beltBuckle);
      hole.position.set(0.08 - i * 0.02, 0.82, 0.14);
      hole.rotation.x = Math.PI / 2;
      torsoGroup.add(hole);
    }

    // ===== 臀部 =====
    const hipGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.12, 16);
    const hip = new THREE.Mesh(hipGeo, mat.pants);
    hip.position.y = 0.76;
    hip.castShadow = true;
    torsoGroup.add(hip);

    // ===== 背部 =====
    const backGeo = new THREE.CylinderGeometry(0.15, 0.14, 0.35, 16, 1, true, Math.PI * 0.5, Math.PI);
    const back = new THREE.Mesh(backGeo, mat.shirt);
    back.position.y = 1.1;
    back.rotation.y = Math.PI;
    torsoGroup.add(back);

    // ===== 衣领 =====
    const collarGeo = new THREE.TorusGeometry(0.085, 0.012, 8, 20, Math.PI * 1.2);
    const collar = new THREE.Mesh(collarGeo, mat.shirt);
    collar.position.set(0, 1.35, 0.03);
    collar.rotation.x = Math.PI / 2;
    collar.rotation.z = Math.PI * 0.6;
    torsoGroup.add(collar);

    group.add(torsoGroup);
  }

  /**
   * 创建手臂 - 高精度模型
   */
  createArms(group, mat) {
    // ===== 左臂 =====
    const leftArmGroup = new THREE.Group();
    leftArmGroup.name = 'leftArm';

    // 肩部
    const shoulderGeo = new THREE.SphereGeometry(0.058, 14, 12);
    const leftShoulder = new THREE.Mesh(shoulderGeo, mat.shirt);
    leftShoulder.scale.set(1, 0.9, 0.95);
    leftShoulder.castShadow = true;
    leftArmGroup.add(leftShoulder);

    // 上臂
    const upperArmGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.24, 14);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, mat.shirt);
    leftUpperArm.position.y = -0.13;
    leftUpperArm.castShadow = true;
    leftArmGroup.add(leftUpperArm);

    // 三角肌
    const deltoidGeo = new THREE.SphereGeometry(0.04, 12, 10);
    const leftDeltoid = new THREE.Mesh(deltoidGeo, mat.shirt);
    leftDeltoid.position.set(0, -0.04, 0.02);
    leftDeltoid.scale.set(1.1, 0.8, 0.9);
    leftArmGroup.add(leftDeltoid);

    // 肘部
    const elbowGeo = new THREE.SphereGeometry(0.038, 12, 10);
    const leftElbow = new THREE.Mesh(elbowGeo, mat.skin);
    leftElbow.position.y = -0.26;
    leftArmGroup.add(leftElbow);

    // 前臂
    const forearmGeo = new THREE.CylinderGeometry(0.038, 0.032, 0.22, 14);
    const leftForearm = new THREE.Mesh(forearmGeo, mat.skin);
    leftForearm.position.y = -0.38;
    leftForearm.castShadow = true;
    leftArmGroup.add(leftForearm);

    // 前臂肌肉
    const forearmMuscleGeo = new THREE.SphereGeometry(0.025, 10, 8);
    const leftForearmMuscle = new THREE.Mesh(forearmMuscleGeo, mat.skin);
    leftForearmMuscle.position.set(0.01, -0.32, 0.015);
    leftForearmMuscle.scale.set(1.3, 0.6, 1);
    leftArmGroup.add(leftForearmMuscle);

    // 手腕
    const wristGeo = new THREE.CylinderGeometry(0.03, 0.028, 0.04, 12);
    const leftWrist = new THREE.Mesh(wristGeo, mat.skin);
    leftWrist.position.y = -0.5;
    leftArmGroup.add(leftWrist);

    // 手套
    const gloveGeo = new THREE.CylinderGeometry(0.028, 0.032, 0.03, 12, 1, true);
    const leftGlove = new THREE.Mesh(gloveGeo, mat.glove);
    leftGlove.position.y = -0.52;
    leftArmGroup.add(leftGlove);

    // 手部
    this.createHand(leftArmGroup, mat, -0.58, true);

    leftArmGroup.position.set(-0.21, 1.27, 0);
    leftArmGroup.rotation.z = 0.12;
    group.add(leftArmGroup);

    // ===== 右臂 =====
    const rightArmGroup = new THREE.Group();
    rightArmGroup.name = 'rightArm';

    const rightShoulder = new THREE.Mesh(shoulderGeo.clone(), mat.shirt);
    rightShoulder.scale.set(1, 0.9, 0.95);
    rightShoulder.castShadow = true;
    rightArmGroup.add(rightShoulder);

    const rightUpperArm = new THREE.Mesh(upperArmGeo.clone(), mat.shirt);
    rightUpperArm.position.y = -0.13;
    rightUpperArm.castShadow = true;
    rightArmGroup.add(rightUpperArm);

    const rightDeltoid = new THREE.Mesh(deltoidGeo.clone(), mat.shirt);
    rightDeltoid.position.set(0, -0.04, 0.02);
    rightDeltoid.scale.set(1.1, 0.8, 0.9);
    rightArmGroup.add(rightDeltoid);

    const rightElbow = new THREE.Mesh(elbowGeo.clone(), mat.skin);
    rightElbow.position.y = -0.26;
    rightArmGroup.add(rightElbow);

    const rightForearm = new THREE.Mesh(forearmGeo.clone(), mat.skin);
    rightForearm.position.y = -0.38;
    rightForearm.castShadow = true;
    rightArmGroup.add(rightForearm);

    const rightForearmMuscle = new THREE.Mesh(forearmMuscleGeo.clone(), mat.skin);
    rightForearmMuscle.position.set(-0.01, -0.32, 0.015);
    rightForearmMuscle.scale.set(1.3, 0.6, 1);
    rightArmGroup.add(rightForearmMuscle);

    const rightWrist = new THREE.Mesh(wristGeo.clone(), mat.skin);
    rightWrist.position.y = -0.5;
    rightArmGroup.add(rightWrist);

    const rightGlove = new THREE.Mesh(gloveGeo.clone(), mat.glove);
    rightGlove.position.y = -0.52;
    rightArmGroup.add(rightGlove);

    this.createHand(rightArmGroup, mat, -0.58, false);

    rightArmGroup.position.set(0.21, 1.27, 0);
    rightArmGroup.rotation.z = -0.12;
    group.add(rightArmGroup);
  }

  /**
   * 创建手部 - 高精度模型
   */
  createHand(armGroup, mat, yPos, isLeft) {
    const handGroup = new THREE.Group();

    // 手掌
    const palmGeo = new THREE.BoxGeometry(0.05, 0.055, 0.028);
    const palm = new THREE.Mesh(palmGeo, mat.glove);
    palm.castShadow = true;
    handGroup.add(palm);

    // 手掌纹理
    for (let i = 0; i < 4; i++) {
      const lineGeo = new THREE.BoxGeometry(0.035, 0.002, 0.001);
      const line = new THREE.Mesh(lineGeo, mat.glove);
      line.position.set(0, -0.015, -0.012 + i * 0.008);
      handGroup.add(line);
    }

    // 手指
    const fingerData = [
      { x: -0.018, length: 0.038, z: -0.02 },
      { x: -0.006, length: 0.045, z: -0.022 },
      { x: 0.006, length: 0.042, z: -0.022 },
      { x: 0.018, length: 0.032, z: -0.018 }
    ];

    fingerData.forEach((data, idx) => {
      const fingerGroup = new THREE.Group();

      // 手指三节
      const segLength = data.length / 3;

      // 第一节
      const seg1Geo = new THREE.CylinderGeometry(0.006, 0.0065, segLength, 10);
      const seg1 = new THREE.Mesh(seg1Geo, mat.glove);
      seg1.position.y = -segLength / 2;
      fingerGroup.add(seg1);

      // 关节
      const joint1Geo = new THREE.SphereGeometry(0.0055, 8, 8);
      const joint1 = new THREE.Mesh(joint1Geo, mat.glove);
      joint1.position.y = -segLength;
      fingerGroup.add(joint1);

      // 第二节
      const seg2Geo = new THREE.CylinderGeometry(0.0055, 0.006, segLength, 10);
      const seg2 = new THREE.Mesh(seg2Geo, mat.glove);
      seg2.position.y = -segLength * 1.5;
      fingerGroup.add(seg2);

      // 关节
      const joint2 = new THREE.Mesh(joint1Geo.clone(), mat.glove);
      joint2.position.y = -segLength * 2;
      fingerGroup.add(joint2);

      // 第三节
      const seg3Geo = new THREE.CylinderGeometry(0.004, 0.005, segLength * 0.9, 10);
      const seg3 = new THREE.Mesh(seg3Geo, mat.glove);
      seg3.position.y = -segLength * 2.5;
      fingerGroup.add(seg3);

      // 指尖
      const tipGeo = new THREE.SphereGeometry(0.004, 8, 8);
      const tip = new THREE.Mesh(tipGeo, mat.glove);
      tip.position.y = -segLength * 3;
      fingerGroup.add(tip);

      fingerGroup.position.set(data.x, -0.022, data.z);
      fingerGroup.rotation.x = 0.15;
      handGroup.add(fingerGroup);
    });

    // 拇指
    const thumbGroup = new THREE.Group();

    const thumbBaseGeo = new THREE.CylinderGeometry(0.008, 0.009, 0.02, 10);
    const thumbBase = new THREE.Mesh(thumbBaseGeo, mat.glove);
    thumbBase.rotation.z = isLeft ? Math.PI / 4 : -Math.PI / 4;
    thumbGroup.add(thumbBase);

    const thumbTipGeo = new THREE.CylinderGeometry(0.006, 0.007, 0.018, 10);
    const thumbTip = new THREE.Mesh(thumbTipGeo, mat.glove);
    thumbTip.position.set(isLeft ? 0.01 : -0.01, -0.012, 0);
    thumbTip.rotation.z = isLeft ? Math.PI / 5 : -Math.PI / 5;
    thumbGroup.add(thumbTip);

    thumbGroup.position.set(isLeft ? 0.03 : -0.03, -0.01, 0);
    handGroup.add(thumbGroup);

    handGroup.position.y = yPos;
    armGroup.add(handGroup);
  }

  /**
   * 创建腿部 - 高精度模型
   */
  createLegs(group, mat) {
    // ===== 左腿 =====
    const leftLegGroup = new THREE.Group();
    leftLegGroup.name = 'leftLeg';

    // 髋关节
    const hipJointGeo = new THREE.SphereGeometry(0.055, 12, 10);
    const leftHipJoint = new THREE.Mesh(hipJointGeo, mat.pants);
    leftLegGroup.add(leftHipJoint);

    // 大腿
    const thighGeo = new THREE.CylinderGeometry(0.075, 0.06, 0.36, 16);
    const leftThigh = new THREE.Mesh(thighGeo, mat.pants);
    leftThigh.position.y = -0.18;
    leftThigh.castShadow = true;
    leftLegGroup.add(leftThigh);

    // 大腿肌肉
    const thighMuscleGeo = new THREE.SphereGeometry(0.04, 12, 10);
    const leftThighMuscle = new THREE.Mesh(thighMuscleGeo, mat.pants);
    leftThighMuscle.position.set(0, -0.12, 0.03);
    leftThighMuscle.scale.set(1.5, 0.8, 1);
    leftLegGroup.add(leftThighMuscle);

    // 膝盖
    const kneeGeo = new THREE.SphereGeometry(0.042, 12, 10);
    const leftKnee = new THREE.Mesh(kneeGeo, mat.pants);
    leftKnee.position.y = -0.38;
    leftKnee.scale.set(1, 0.85, 1.05);
    leftLegGroup.add(leftKnee);

    // 小腿
    const calfGeo = new THREE.CylinderGeometry(0.05, 0.042, 0.34, 16);
    const leftCalf = new THREE.Mesh(calfGeo, mat.pants);
    leftCalf.position.y = -0.56;
    leftCalf.castShadow = true;
    leftLegGroup.add(leftCalf);

    // 小腿肌肉
    const calfMuscleGeo = new THREE.SphereGeometry(0.03, 10, 10);
    const leftCalfMuscle = new THREE.Mesh(calfMuscleGeo, mat.pants);
    leftCalfMuscle.position.set(0, -0.45, 0.025);
    leftCalfMuscle.scale.set(1.3, 0.7, 1);
    leftLegGroup.add(leftCalfMuscle);

    // 脚踝
    const ankleGeo = new THREE.SphereGeometry(0.028, 10, 10);
    const leftAnkle = new THREE.Mesh(ankleGeo, mat.skin);
    leftAnkle.position.y = -0.74;
    leftAnkle.scale.set(1, 0.8, 1);
    leftLegGroup.add(leftAnkle);

    // 靴子
    this.createBoot(leftLegGroup, mat, -0.78);

    leftLegGroup.position.set(-0.09, 0.72, 0);
    group.add(leftLegGroup);

    // ===== 右腿 =====
    const rightLegGroup = new THREE.Group();
    rightLegGroup.name = 'rightLeg';

    const rightHipJoint = new THREE.Mesh(hipJointGeo.clone(), mat.pants);
    rightLegGroup.add(rightHipJoint);

    const rightThigh = new THREE.Mesh(thighGeo.clone(), mat.pants);
    rightThigh.position.y = -0.18;
    rightThigh.castShadow = true;
    rightLegGroup.add(rightThigh);

    const rightThighMuscle = new THREE.Mesh(thighMuscleGeo.clone(), mat.pants);
    rightThighMuscle.position.set(0, -0.12, 0.03);
    rightThighMuscle.scale.set(1.5, 0.8, 1);
    rightLegGroup.add(rightThighMuscle);

    const rightKnee = new THREE.Mesh(kneeGeo.clone(), mat.pants);
    rightKnee.position.y = -0.38;
    rightKnee.scale.set(1, 0.85, 1.05);
    rightLegGroup.add(rightKnee);

    const rightCalf = new THREE.Mesh(calfGeo.clone(), mat.pants);
    rightCalf.position.y = -0.56;
    rightCalf.castShadow = true;
    rightLegGroup.add(rightCalf);

    const rightCalfMuscle = new THREE.Mesh(calfMuscleGeo.clone(), mat.pants);
    rightCalfMuscle.position.set(0, -0.45, 0.025);
    rightCalfMuscle.scale.set(1.3, 0.7, 1);
    rightLegGroup.add(rightCalfMuscle);

    const rightAnkle = new THREE.Mesh(ankleGeo.clone(), mat.skin);
    rightAnkle.position.y = -0.74;
    rightAnkle.scale.set(1, 0.8, 1);
    rightLegGroup.add(rightAnkle);

    this.createBoot(rightLegGroup, mat, -0.78);

    rightLegGroup.position.set(0.09, 0.72, 0);
    group.add(rightLegGroup);
  }

  /**
   * 创建靴子 - 高精度模型
   */
  createBoot(legGroup, mat, yPos) {
    const bootGroup = new THREE.Group();

    // 靴筒
    const shaftGeo = new THREE.CylinderGeometry(0.045, 0.042, 0.1, 14);
    const shaft = new THREE.Mesh(shaftGeo, mat.boots);
    shaft.position.y = 0.05;
    shaft.castShadow = true;
    bootGroup.add(shaft);

    // 靴筒装饰线
    for (let i = 0; i < 3; i++) {
      const lineGeo = new THREE.TorusGeometry(0.044, 0.002, 6, 20);
      const line = new THREE.Mesh(lineGeo, mat.bootSole);
      line.position.y = 0.02 + i * 0.03;
      line.rotation.x = Math.PI / 2;
      bootGroup.add(line);
    }

    // 靴身主体
    const bootBodyGeo = new THREE.BoxGeometry(0.085, 0.07, 0.14);
    const bootBody = new THREE.Mesh(bootBodyGeo, mat.boots);
    bootBody.position.set(0, -0.01, 0.02);
    bootBody.castShadow = true;
    bootGroup.add(bootBody);

    // 靴子前端（上翘）
    const toeGeo = new THREE.SphereGeometry(0.042, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const toe = new THREE.Mesh(toeGeo, mat.boots);
    toe.position.set(0, -0.02, 0.08);
    toe.rotation.x = -Math.PI / 4;
    toe.scale.set(1, 0.8, 1);
    bootGroup.add(toe);

    // 靴后跟
    const heelGeo = new THREE.BoxGeometry(0.065, 0.035, 0.025);
    const heel = new THREE.Mesh(heelGeo, mat.boots);
    heel.position.set(0, -0.03, -0.045);
    bootGroup.add(heel);

    // 靴底
    const soleGeo = new THREE.BoxGeometry(0.09, 0.018, 0.16);
    const sole = new THREE.Mesh(soleGeo, mat.bootSole);
    sole.position.set(0, -0.055, 0.02);
    sole.castShadow = true;
    bootGroup.add(sole);

    // 靴底纹路
    for (let i = 0; i < 5; i++) {
      const treadGeo = new THREE.BoxGeometry(0.08, 0.003, 0.02);
      const tread = new THREE.Mesh(treadGeo, mat.bootSole);
      tread.position.set(0, -0.065, -0.04 + i * 0.025);
      bootGroup.add(tread);
    }

    // 鞋带孔
    for (let i = 0; i < 4; i++) {
      const eyeletGeo = new THREE.TorusGeometry(0.006, 0.002, 6, 12);
      const leftEyelet = new THREE.Mesh(eyeletGeo, mat.metal);
      leftEyelet.position.set(-0.025, 0.06 - i * 0.02, 0.05);
      leftEyelet.rotation.y = Math.PI / 2;
      bootGroup.add(leftEyelet);

      const rightEyelet = leftEyelet.clone();
      rightEyelet.position.x = 0.025;
      bootGroup.add(rightEyelet);
    }

    bootGroup.position.y = yPos;
    legGroup.add(bootGroup);
  }

  /**
   * 创建装备（头盔、防弹衣、背包）- 高精度模型
   */
  createEquipment(group, mat) {
    // ===== 三级头盔 =====
    const helmetGroup = new THREE.Group();
    helmetGroup.name = 'helmet';

    // 头盔主体
    const helmetMainGeo = new THREE.SphereGeometry(0.135, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const helmetMain = new THREE.Mesh(helmetMainGeo, mat.helmet);
    helmetMain.position.y = 1.75;
    helmetMain.castShadow = true;
    helmetGroup.add(helmetMain);

    // 头盔边缘
    const rimGeo = new THREE.TorusGeometry(0.13, 0.015, 10, 28, Math.PI * 1.15);
    const rim = new THREE.Mesh(rimGeo, mat.helmet);
    rim.position.set(0, 1.68, 0.02);
    rim.rotation.x = Math.PI / 2;
    helmetGroup.add(rim);

    // 头盔顶部通风口
    for (let i = 0; i < 5; i++) {
      const ventGeo = new THREE.BoxGeometry(0.015, 0.008, 0.025);
      const vent = new THREE.Mesh(ventGeo, mat.metal);
      vent.position.set(-0.04 + i * 0.02, 1.85, 0);
      vent.rotation.x = 0.3;
      helmetGroup.add(vent);
    }

    // 面罩
    const visorGeo = new THREE.BoxGeometry(0.19, 0.055, 0.03);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.08,
      metalness: 0.6,
      transparent: true,
      opacity: 0.75
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.66, 0.115);
    helmetGroup.add(visor);

    // 侧面导轨
    for (let side = -1; side <= 1; side += 2) {
      const railGeo = new THREE.BoxGeometry(0.02, 0.06, 0.015);
      const rail = new THREE.Mesh(railGeo, mat.metal);
      rail.position.set(side * 0.12, 1.72, 0.02);
      helmetGroup.add(rail);
    }

    // 金色装饰条
    const stripeGeo = new THREE.BoxGeometry(0.025, 0.1, 0.14);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      roughness: 0.35,
      metalness: 0.7
    });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 1.72, 0);
    helmetGroup.add(stripe);

    // 头盔后部
    const backGeo = new THREE.CylinderGeometry(0.11, 0.12, 0.08, 16, 1, true, Math.PI * 0.6, Math.PI * 0.8);
    const back = new THREE.Mesh(backGeo, mat.helmet);
    back.position.set(0, 1.72, -0.06);
    helmetGroup.add(back);

    group.add(helmetGroup);

    // ===== 三级防弹衣 =====
    const vestGroup = new THREE.Group();
    vestGroup.name = 'vest';

    // 防弹衣主体
    const vestMainGeo = new THREE.CylinderGeometry(0.19, 0.17, 0.3, 20, 1, true, Math.PI * 0.12, Math.PI * 1.76);
    const vestMain = new THREE.Mesh(vestMainGeo, mat.vest);
    vestMain.position.y = 1.12;
    vestMain.castShadow = true;
    vestGroup.add(vestMain);

    // 前防弹板
    const frontPlateGeo = new THREE.BoxGeometry(0.2, 0.18, 0.035);
    const frontPlate = new THREE.Mesh(frontPlateGeo, mat.vest);
    frontPlate.position.set(0, 1.12, 0.15);
    frontPlate.castShadow = true;
    vestGroup.add(frontPlate);

    // 防弹板纹理
    for (let i = 0; i < 3; i++) {
      const plateLineGeo = new THREE.BoxGeometry(0.18, 0.002, 0.001);
      const plateLine = new THREE.Mesh(plateLineGeo, mat.metal);
      plateLine.position.set(0, 1.05 + i * 0.07, 0.17);
      vestGroup.add(plateLine);
    }

    // 弹匣袋
    for (let i = 0; i < 3; i++) {
      const pouchGeo = new THREE.BoxGeometry(0.035, 0.07, 0.03);
      const pouch = new THREE.Mesh(pouchGeo, mat.tactical);
      pouch.position.set(-0.07 + i * 0.07, 1.08, 0.175);
      pouch.castShadow = true;
      vestGroup.add(pouch);

      // 弹匣袋盖
      const flapGeo = new THREE.BoxGeometry(0.032, 0.015, 0.005);
      const flap = new THREE.Mesh(flapGeo, mat.tactical);
      flap.position.set(-0.07 + i * 0.07, 1.12, 0.19);
      vestGroup.add(flap);
    }

    // 侧边保护
    for (let side = -1; side <= 1; side += 2) {
      const sidePanelGeo = new THREE.BoxGeometry(0.025, 0.22, 0.12);
      const sidePanel = new THREE.Mesh(sidePanelGeo, mat.vest);
      sidePanel.position.set(side * 0.18, 1.1, 0);
      vestGroup.add(sidePanel);
    }

    // 肩带
    for (let side = -1; side <= 1; side += 2) {
      const strapGeo = new THREE.BoxGeometry(0.025, 0.15, 0.015);
      const strap = new THREE.Mesh(strapGeo, mat.tactical);
      strap.position.set(side * 0.16, 1.25, 0.08);
      strap.rotation.x = 0.3;
      vestGroup.add(strap);
    }

    group.add(vestGroup);

    // ===== 三级背包 =====
    const backpackGroup = new THREE.Group();
    backpackGroup.name = 'backpack';

    // 背包主体
    const packMainGeo = new THREE.BoxGeometry(0.18, 0.25, 0.12);
    const packMain = new THREE.Mesh(packMainGeo, mat.tactical);
    packMain.position.set(0, 1.05, -0.16);
    packMain.castShadow = true;
    backpackGroup.add(packMain);

    // 背包顶部口袋
    const topPocketGeo = new THREE.BoxGeometry(0.16, 0.06, 0.1);
    const topPocket = new THREE.Mesh(topPocketGeo, mat.tactical);
    topPocket.position.set(0, 1.2, -0.15);
    backpackGroup.add(topPocket);

    // 背包前面口袋
    const frontPocketGeo = new THREE.BoxGeometry(0.15, 0.12, 0.05);
    const frontPocket = new THREE.Mesh(frontPocketGeo, mat.tactical);
    frontPocket.position.set(0, 1.02, -0.225);
    backpackGroup.add(frontPocket);

    // 侧袋
    for (let side = -1; side <= 1; side += 2) {
      const sidePocketGeo = new THREE.BoxGeometry(0.05, 0.12, 0.06);
      const sidePocket = new THREE.Mesh(sidePocketGeo, mat.tactical);
      sidePocket.position.set(side * 0.11, 1.0, -0.14);
      backpackGroup.add(sidePocket);
    }

    // 背包拉链
    for (let i = 0; i < 3; i++) {
      const zipperGeo = new THREE.BoxGeometry(0.12 - i * 0.02, 0.005, 0.003);
      const zipper = new THREE.Mesh(zipperGeo, mat.metal);
      zipper.position.set(0, 1.15 - i * 0.08, -0.2);
      backpackGroup.add(zipper);
    }

    // 背包带
    for (let side = -1; side <= 1; side += 2) {
      const strapGeo = new THREE.BoxGeometry(0.025, 0.35, 0.01);
      const strap = new THREE.Mesh(strapGeo, mat.tactical);
      strap.position.set(side * 0.15, 1.15, -0.08);
      strap.rotation.x = 0.2;
      backpackGroup.add(strap);
    }

    group.add(backpackGroup);
  }

  /**
   * 设置装备
   */
  setEquipment(type, level) {
    this.equipment[type] = level;
  }

  /**
   * 设置玩家状态
   */
  setState(newState) {
    if (this.state !== newState) {
      this.previousState = this.state;
      this.state = newState;
    }
  }

  /**
   * 更新玩家
   */
  update(deltaTime) {
    super.update(deltaTime);
    this.updateAnimation(deltaTime);
  }

  /**
   * 更新动画
   */
  updateAnimation(deltaTime) {
    if (!this.modelParts) return;

    const time = performance.now() * 0.001;
    const isMoving = this.state === PlayerState.WALKING ||
                     this.state === PlayerState.RUNNING;
    const isSprinting = this.state === PlayerState.RUNNING;

    // 呼吸动画
    const breatheSpeed = isMoving ? (isSprinting ? 3 : 2) : 1;
    const breathe = Math.sin(time * breatheSpeed) * 0.006;

    if (this.modelParts.torso) {
      this.modelParts.torso.scale.z = 1 + breathe;
    }

    // 移动动画
    if (isMoving) {
      const speed = isSprinting ? 12 : 7;
      const amplitude = isSprinting ? 0.45 : 0.3;

      const legSwing = Math.sin(time * speed) * amplitude;
      this.modelParts.leftLeg.rotation.x = legSwing;
      this.modelParts.rightLeg.rotation.x = -legSwing;

      const armSwing = Math.sin(time * speed) * amplitude * 0.4;
      this.modelParts.leftArm.rotation.x = -armSwing;
      this.modelParts.rightArm.rotation.x = armSwing;

      if (this.modelGroup) {
        this.modelGroup.rotation.x = isSprinting ? 0.06 : 0.02;
      }
    } else {
      this.modelParts.leftLeg.rotation.x *= 0.9;
      this.modelParts.rightLeg.rotation.x *= 0.9;
      this.modelParts.leftArm.rotation.x *= 0.9;
      this.modelParts.rightArm.rotation.x *= 0.9;

      if (this.modelGroup) {
        this.modelGroup.rotation.x *= 0.9;
      }
    }

    // 蹲伏
    if (this.state === PlayerState.CROUCHING) {
      if (this.modelGroup) {
        this.modelGroup.scale.y = 0.7;
        this.modelGroup.position.y = -0.35;
      }
      this.modelParts.leftLeg.rotation.x = -0.7;
      this.modelParts.rightLeg.rotation.x = -0.7;
    } else if (this.state === PlayerState.PRONE) {
      if (this.modelGroup) {
        this.modelGroup.rotation.x = Math.PI / 2 - 0.1;
        this.modelGroup.position.y = -0.8;
        this.modelGroup.scale.y = 1;
      }
    } else if (this.state !== PlayerState.JUMPING) {
      if (this.modelGroup) {
        this.modelGroup.scale.y = 1;
        this.modelGroup.position.y = 0;
      }
    }
  }

  /**
   * 受伤
   */
  takeDamage(amount) {
    const vestReduction = this.equipment.vest * 0.15;
    const helmetReduction = this.equipment.helmet * 0.1;
    const actualDamage = amount * (1 - vestReduction - helmetReduction);
    this.health.takeDamage(Math.floor(actualDamage));

    if (this.health.isDead()) {
      this.setState(PlayerState.DEAD);
    }
  }

  /**
   * 治疗
   */
  heal(amount) {
    this.health.heal(amount);
  }

  /**
   * 获取头部位置
   */
  getHeadPosition() {
    const pos = this.position.clone();
    pos.y += 1.65;
    return pos;
  }

  /**
   * 获取中心位置
   */
  getCenterPosition() {
    const pos = this.position.clone();
    pos.y += 1.0;
    return pos;
  }
}