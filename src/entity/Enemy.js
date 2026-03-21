/**
 * 敌人实体类
 * 参考和平精英风格重新设计
 */
import { Entity } from './Entity.js';
import { Health } from '../component/Health.js';
import { WeaponController } from '../component/WeaponController.js';
import { AIController, AIState } from '../ai/AIController.js';

export class Enemy extends Entity {
  constructor() {
    super('Enemy');

    // 添加标签
    this.addTag('enemy');

    // 敌人类型
    this.enemyType = Math.random() > 0.5 ? 'soldier' : 'guerrilla';

    // 初始化组件
    this.health = this.addComponent(new Health(100));
    this.weaponController = this.addComponent(new WeaponController());
    this.aiController = this.addComponent(new AIController());

    // 创建模型
    this.createModel();
  }

  /**
   * 创建敌人模型 - 和平精英风格
   */
  createModel() {
    const group = new THREE.Group();

    // 根据敌人类型选择颜色
    const colors = this.getEnemyColors();
    const materials = this.createMaterials(colors);

    // 创建身体各部分
    this.createHead(group, materials, colors);
    this.createTorso(group, materials);
    this.createArms(group, materials);
    this.createLegs(group, materials);
    this.createEquipment(group, materials);

    // 存储引用
    this.modelParts = {
      head: group.getObjectByName('head'),
      torso: group.getObjectByName('torso'),
      leftArm: group.getObjectByName('leftArm'),
      rightArm: group.getObjectByName('rightArm'),
      leftLeg: group.getObjectByName('leftLeg'),
      rightLeg: group.getObjectByName('rightLeg')
    };

    this.object3D.add(group);
    this.modelGroup = group;
  }

  /**
   * 获取敌人颜色方案
   */
  getEnemyColors() {
    if (this.enemyType === 'soldier') {
      // 正规军 - 军绿色/棕色
      return {
        shirt: 0x4A5A3A,
        pants: 0x3D4A35,
        skin: 0xD4A574,
        hair: 0x1A1A1A,
        tactical: 0x3A4A3A,
        helmet: 0x2A3A2A
      };
    } else {
      // 游击队 - 土黄色/棕色
      return {
        shirt: 0x6B5A45,
        pants: 0x5A4A38,
        skin: 0xC9A67A,
        hair: 0x2A2A1A,
        tactical: 0x5A5A4A,
        helmet: 0x4A4A3A
      };
    }
  }

  /**
   * 创建材质
   */
  createMaterials(colors) {
    return {
      skin: new THREE.MeshStandardMaterial({
        color: colors.skin,
        roughness: 0.7,
        metalness: 0
      }),
      hair: new THREE.MeshStandardMaterial({
        color: colors.hair,
        roughness: 0.9,
        metalness: 0
      }),
      shirt: new THREE.MeshStandardMaterial({
        color: colors.shirt,
        roughness: 0.8,
        metalness: 0.05
      }),
      pants: new THREE.MeshStandardMaterial({
        color: colors.pants,
        roughness: 0.85,
        metalness: 0
      }),
      boots: new THREE.MeshStandardMaterial({
        color: 0x1A1A1A,
        roughness: 0.6,
        metalness: 0.1
      }),
      tactical: new THREE.MeshStandardMaterial({
        color: colors.tactical,
        roughness: 0.7,
        metalness: 0.1
      }),
      helmet: new THREE.MeshStandardMaterial({
        color: colors.helmet,
        roughness: 0.5,
        metalness: 0.3
      }),
      metal: new THREE.MeshStandardMaterial({
        color: 0x4A4A4A,
        roughness: 0.4,
        metalness: 0.7
      })
    };
  }

  /**
   * 创建头部
   */
  createHead(group, mat, colors) {
    const headGroup = new THREE.Group();
    headGroup.name = 'head';

    // 头部主体
    const headGeo = new THREE.SphereGeometry(0.11, 20, 18);
    const head = new THREE.Mesh(headGeo, mat.skin);
    head.scale.set(1, 1.1, 1);
    head.castShadow = true;
    headGroup.add(head);

    // 敌人眼睛 - 略带攻击性的红色
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x8B0000,
      roughness: 0.3,
      emissive: 0x400000,
      emissiveIntensity: 0.3
    });

    const eyeGeo = new THREE.SphereGeometry(0.015, 10, 10);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.04, 0.015, 0.095);
    headGroup.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.x = 0.04;
    headGroup.add(rightEye);

    // 瞳孔
    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x0A0A0A,
      roughness: 0.1
    });
    const pupilGeo = new THREE.SphereGeometry(0.006, 8, 8);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.04, 0.015, 0.108);
    headGroup.add(leftPupil);

    const rightPupil = leftPupil.clone();
    rightPupil.position.x = 0.04;
    headGroup.add(rightPupil);

    // 眉毛 - 更凶悍
    const browGeo = new THREE.BoxGeometry(0.032, 0.006, 0.008);
    const browMat = new THREE.MeshStandardMaterial({
      color: colors.hair,
      roughness: 0.9
    });

    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.04, 0.04, 0.1);
    leftBrow.rotation.z = 0.15;
    headGroup.add(leftBrow);

    const rightBrow = leftBrow.clone();
    rightBrow.position.x = 0.04;
    rightBrow.rotation.z = -0.15;
    headGroup.add(rightBrow);

    // 鼻子
    const noseGeo = new THREE.ConeGeometry(0.012, 0.03, 8);
    const nose = new THREE.Mesh(noseGeo, mat.skin);
    nose.position.set(0, -0.01, 0.1);
    nose.rotation.x = Math.PI / 2;
    headGroup.add(nose);

    // 嘴巴
    const mouthGeo = new THREE.BoxGeometry(0.025, 0.005, 0.006);
    const mouthMat = new THREE.MeshStandardMaterial({
      color: 0x8B6050,
      roughness: 0.7
    });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.04, 0.095);
    headGroup.add(mouth);

    // 头发
    const hairBaseGeo = new THREE.SphereGeometry(0.115, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairBase = new THREE.Mesh(hairBaseGeo, mat.hair);
    hairBase.position.y = 0.01;
    hairBase.scale.set(1.02, 1, 1.02);
    hairBase.castShadow = true;
    headGroup.add(hairBase);

    // 耳朵
    const earGeo = new THREE.SphereGeometry(0.022, 8, 8);
    const leftEar = new THREE.Mesh(earGeo, mat.skin);
    leftEar.position.set(-0.1, 0.01, 0.02);
    leftEar.scale.set(0.5, 1, 0.7);
    headGroup.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.x = 0.1;
    headGroup.add(rightEar);

    // 颈部
    const neckGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.08, 12);
    const neck = new THREE.Mesh(neckGeo, mat.skin);
    neck.position.y = -0.12;
    headGroup.add(neck);

    // 战术头盔
    const helmetMainGeo = new THREE.SphereGeometry(0.125, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const helmetMain = new THREE.Mesh(helmetMainGeo, mat.helmet);
    helmetMain.position.y = 0.02;
    helmetMain.castShadow = true;
    headGroup.add(helmetMain);

    // 头盔边缘
    const rimGeo = new THREE.TorusGeometry(0.12, 0.01, 8, 20, Math.PI);
    const rim = new THREE.Mesh(rimGeo, mat.helmet);
    rim.rotation.x = Math.PI / 2;
    rim.rotation.z = Math.PI;
    headGroup.add(rim);

    headGroup.position.y = 1.62;
    group.add(headGroup);
  }

  /**
   * 创建躯干
   */
  createTorso(group, mat) {
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'torso';

    // 上身
    const upperBodyGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.32, 14);
    const upperBody = new THREE.Mesh(upperBodyGeo, mat.shirt);
    upperBody.position.y = 1.12;
    upperBody.castShadow = true;
    torsoGroup.add(upperBody);

    // 战术背心
    const vestGeo = new THREE.CylinderGeometry(0.17, 0.15, 0.24, 14, 1, true, Math.PI * 0.1, Math.PI * 1.8);
    const vest = new THREE.Mesh(vestGeo, mat.tactical);
    vest.position.y = 1.14;
    vest.castShadow = true;
    torsoGroup.add(vest);

    // 弹匣袋
    for (let i = 0; i < 3; i++) {
      const pouchGeo = new THREE.BoxGeometry(0.025, 0.05, 0.025);
      const pouch = new THREE.Mesh(pouchGeo, mat.tactical);
      pouch.position.set(-0.05 + i * 0.05, 1.08, 0.14);
      pouch.castShadow = true;
      torsoGroup.add(pouch);
    }

    // 下身
    const lowerBodyGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.18, 14);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, mat.pants);
    lowerBody.position.y = 0.82;
    lowerBody.castShadow = true;
    torsoGroup.add(lowerBody);

    // 腰带
    const beltGeo = new THREE.TorusGeometry(0.12, 0.01, 8, 20);
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.7
    });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 0.75;
    belt.rotation.x = Math.PI / 2;
    torsoGroup.add(belt);

    group.add(torsoGroup);
  }

  /**
   * 创建手臂
   */
  createArms(group, mat) {
    // 左臂
    const leftArmGroup = new THREE.Group();
    leftArmGroup.name = 'leftArm';

    const shoulderGeo = new THREE.SphereGeometry(0.05, 10, 8);
    const leftShoulder = new THREE.Mesh(shoulderGeo, mat.shirt);
    leftShoulder.scale.set(1, 0.85, 1);
    leftArmGroup.add(leftShoulder);

    const upperArmGeo = new THREE.CylinderGeometry(0.038, 0.035, 0.2, 10);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, mat.shirt);
    leftUpperArm.position.y = -0.11;
    leftUpperArm.castShadow = true;
    leftArmGroup.add(leftUpperArm);

    const elbowGeo = new THREE.SphereGeometry(0.032, 8, 8);
    const leftElbow = new THREE.Mesh(elbowGeo, mat.skin);
    leftElbow.position.y = -0.22;
    leftArmGroup.add(leftElbow);

    const forearmGeo = new THREE.CylinderGeometry(0.032, 0.028, 0.18, 10);
    const leftForearm = new THREE.Mesh(forearmGeo, mat.skin);
    leftForearm.position.y = -0.32;
    leftForearm.castShadow = true;
    leftArmGroup.add(leftForearm);

    // 手套
    const gloveMat = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.8
    });
    const handGeo = new THREE.BoxGeometry(0.04, 0.05, 0.022);
    const leftHand = new THREE.Mesh(handGeo, gloveMat);
    leftHand.position.y = -0.44;
    leftHand.castShadow = true;
    leftArmGroup.add(leftHand);

    leftArmGroup.position.set(-0.19, 1.26, 0);
    leftArmGroup.rotation.z = 0.08;
    group.add(leftArmGroup);

    // 右臂
    const rightArmGroup = new THREE.Group();
    rightArmGroup.name = 'rightArm';

    const rightShoulder = new THREE.Mesh(shoulderGeo.clone(), mat.shirt);
    rightShoulder.scale.set(1, 0.85, 1);
    rightArmGroup.add(rightShoulder);

    const rightUpperArm = new THREE.Mesh(upperArmGeo.clone(), mat.shirt);
    rightUpperArm.position.y = -0.11;
    rightUpperArm.castShadow = true;
    rightArmGroup.add(rightUpperArm);

    const rightElbow = new THREE.Mesh(elbowGeo.clone(), mat.skin);
    rightElbow.position.y = -0.22;
    rightArmGroup.add(rightElbow);

    const rightForearm = new THREE.Mesh(forearmGeo.clone(), mat.skin);
    rightForearm.position.y = -0.32;
    rightForearm.castShadow = true;
    rightArmGroup.add(rightForearm);

    const rightHand = new THREE.Mesh(handGeo.clone(), gloveMat);
    rightHand.position.y = -0.44;
    rightHand.castShadow = true;
    rightArmGroup.add(rightHand);

    rightArmGroup.position.set(0.19, 1.26, 0);
    rightArmGroup.rotation.z = -0.08;
    group.add(rightArmGroup);
  }

  /**
   * 创建腿部
   */
  createLegs(group, mat) {
    // 左腿
    const leftLegGroup = new THREE.Group();
    leftLegGroup.name = 'leftLeg';

    const thighGeo = new THREE.CylinderGeometry(0.065, 0.05, 0.32, 12);
    const leftThigh = new THREE.Mesh(thighGeo, mat.pants);
    leftThigh.position.y = -0.16;
    leftThigh.castShadow = true;
    leftLegGroup.add(leftThigh);

    const kneeGeo = new THREE.SphereGeometry(0.038, 8, 8);
    const leftKnee = new THREE.Mesh(kneeGeo, mat.pants);
    leftKnee.position.y = -0.33;
    leftKnee.scale.set(1, 0.8, 1);
    leftLegGroup.add(leftKnee);

    const calfGeo = new THREE.CylinderGeometry(0.042, 0.038, 0.3, 12);
    const leftCalf = new THREE.Mesh(calfGeo, mat.pants);
    leftCalf.position.y = -0.5;
    leftCalf.castShadow = true;
    leftLegGroup.add(leftCalf);

    // 靴子
    const bootGeo = new THREE.BoxGeometry(0.065, 0.055, 0.11);
    const leftBoot = new THREE.Mesh(bootGeo, mat.boots);
    leftBoot.position.set(0, -0.68, 0.015);
    leftBoot.castShadow = true;
    leftLegGroup.add(leftBoot);

    leftLegGroup.position.set(-0.08, 0.72, 0);
    group.add(leftLegGroup);

    // 右腿
    const rightLegGroup = new THREE.Group();
    rightLegGroup.name = 'rightLeg';

    const rightThigh = new THREE.Mesh(thighGeo.clone(), mat.pants);
    rightThigh.position.y = -0.16;
    rightThigh.castShadow = true;
    rightLegGroup.add(rightThigh);

    const rightKnee = new THREE.Mesh(kneeGeo.clone(), mat.pants);
    rightKnee.position.y = -0.33;
    rightKnee.scale.set(1, 0.8, 1);
    rightLegGroup.add(rightKnee);

    const rightCalf = new THREE.Mesh(calfGeo.clone(), mat.pants);
    rightCalf.position.y = -0.5;
    rightCalf.castShadow = true;
    rightLegGroup.add(rightCalf);

    const rightBoot = new THREE.Mesh(bootGeo.clone(), mat.boots);
    rightBoot.position.set(0, -0.68, 0.015);
    rightBoot.castShadow = true;
    rightLegGroup.add(rightBoot);

    rightLegGroup.position.set(0.08, 0.72, 0);
    group.add(rightLegGroup);
  }

  /**
   * 创建装备
   */
  createEquipment(group, mat) {
    // 背包
    const backpackGeo = new THREE.BoxGeometry(0.14, 0.18, 0.08);
    const backpack = new THREE.Mesh(backpackGeo, mat.tactical);
    backpack.position.set(0, 1.05, -0.13);
    backpack.castShadow = true;
    group.add(backpack);
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
   * 初始化AI
   */
  initAI(world, player) {
    this.aiController.setWorld(world);
    this.aiController.setTarget(player);

    const patrolPoints = this.generatePatrolPoints(world);
    this.aiController.setPatrolPoints(patrolPoints);

    const weapons = ['ak47', 'm4a1', 'mp5', 'scarh'];
    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
    this.weaponController.pickupWeapon(randomWeapon);

    this.weaponController.addAmmo('7.62mm', 60);
    this.weaponController.addAmmo('5.56mm', 60);
    this.weaponController.addAmmo('9mm', 60);
  }

  /**
   * 生成巡逻点
   */
  generatePatrolPoints(world) {
    const points = [];
    const baseX = this.position.x;
    const baseZ = this.position.z;
    const radius = 50;

    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const distance = radius * 0.5 + Math.random() * radius * 0.5;

      const x = baseX + Math.cos(angle) * distance;
      const z = baseZ + Math.sin(angle) * distance;
      const y = world ? world.getHeightAt(x, z) : 0;

      points.push(new THREE.Vector3(x, y, z));
    }

    return points;
  }

  /**
   * 更新敌人
   */
  update(deltaTime) {
    super.update(deltaTime);
    this.aiController.update(deltaTime);
    this.updateAnimation(deltaTime);
  }

  /**
   * 更新动画
   */
  updateAnimation(deltaTime) {
    if (!this.modelParts) return;

    const time = performance.now() * 0.001;
    const aiState = this.aiController.state;

    const isMoving = aiState === AIState.PATROL ||
                     aiState === AIState.INVESTIGATE ||
                     aiState === AIState.COMBAT;
    const isRunning = aiState === AIState.INVESTIGATE ||
                      aiState === AIState.COMBAT;

    // 呼吸动画
    const breatheSpeed = isMoving ? 2.5 : 1.2;
    const breathe = Math.sin(time * breatheSpeed) * 0.01;

    if (this.modelParts.torso) {
      this.modelParts.torso.scale.z = 1 + breathe;
    }

    // 移动动画
    if (isMoving) {
      const speed = isRunning ? 11 : 6;
      const amplitude = isRunning ? 0.55 : 0.4;

      const legSwing = Math.sin(time * speed) * amplitude;
      this.modelParts.leftLeg.rotation.x = legSwing;
      this.modelParts.rightLeg.rotation.x = -legSwing;

      const armSwing = Math.sin(time * speed) * amplitude * 0.45;
      this.modelParts.leftArm.rotation.x = -armSwing;
      this.modelParts.rightArm.rotation.x = armSwing;

      // 战斗姿态
      if (aiState === AIState.COMBAT) {
        this.modelParts.leftArm.rotation.z = 0.2;
        this.modelParts.rightArm.rotation.z = -0.15;
      }

    } else {
      // 恢复
      this.modelParts.leftLeg.rotation.x *= 0.9;
      this.modelParts.rightLeg.rotation.x *= 0.9;
      this.modelParts.leftArm.rotation.x *= 0.9;
      this.modelParts.rightArm.rotation.x *= 0.9;
      this.modelParts.leftArm.rotation.z = 0.08;
      this.modelParts.rightArm.rotation.z = -0.08;
    }

    // 逃跑
    if (aiState === AIState.FLEE && !this.health.isDead()) {
      const fleeSpeed = 14;
      const legSwing = Math.sin(time * fleeSpeed) * 0.7;
      this.modelParts.leftLeg.rotation.x = legSwing;
      this.modelParts.rightLeg.rotation.x = -legSwing;

      const armSwing = Math.sin(time * fleeSpeed) * 0.6;
      this.modelParts.leftArm.rotation.x = -armSwing;
      this.modelParts.rightArm.rotation.x = armSwing;
      this.modelParts.leftArm.rotation.z = 0.25;
      this.modelParts.rightArm.rotation.z = -0.25;

      if (this.modelGroup) {
        this.modelGroup.rotation.x = 0.15;
      }
    }

    // 死亡
    if (this.health.isDead()) {
      const targetRotX = Math.PI / 2;
      const targetPosY = -0.7;

      this.modelGroup.rotation.x += (targetRotX - this.modelGroup.rotation.x) * 0.08;
      this.modelGroup.position.y += (targetPosY - this.modelGroup.position.y) * 0.08;

      this.modelParts.leftArm.rotation.z = 0;
      this.modelParts.rightArm.rotation.z = 0;
      this.modelParts.leftArm.rotation.x = 0.2;
      this.modelParts.rightArm.rotation.x = 0.2;
      this.modelParts.leftLeg.rotation.x = -0.15;
      this.modelParts.rightLeg.rotation.x = 0.1;
    }
  }

  /**
   * 受伤
   */
  takeDamage(amount) {
    this.health.takeDamage(amount);

    if (this.health.isDead()) {
      this.aiController.setState(AIState.DEAD);
      this.active = false;
    }
  }

  /**
   * 检查是否死亡
   */
  isDead() {
    return this.health.isDead();
  }
}