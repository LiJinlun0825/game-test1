/**
 * 人物模型工厂
 * 生成精美的人体模型（支持骨骼绑定）
 */
import { SkeletonBuilder } from './SkeletonBuilder.js';

export class HumanModelFactory {
  /**
   * 创建完整的人体模型
   * @param {Object} options - 配置选项
   * @returns {THREE.Group} 人体模型组
   */
  static createHumanModel(options = {}) {
    const {
      skinColor = 0xE8C8A8,
      shirtColor = 0x4A7A4A,
      pantsColor = 0x3A3A5A,
      hairColor = 0x2A1A0A,
      isEnemy = false,
      isPlayer = false,
      height = 1.75
    } = options;

    const heightScale = height / 1.75;

    // 创建骨骼系统
    const skeletonData = SkeletonBuilder.createSkeleton({ height });
    const { root: skeletonRoot, bones, boneList } = skeletonData;

    // 创建 Three.js Skeleton
    const skeleton = new THREE.Skeleton(boneList);

    // 创建模型组
    const human = new THREE.Group();
    human.name = 'skinned-human-model';

    // 添加骨骼根节点到模型组
    human.add(skeletonRoot);

    // 材质定义
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.75,
      metalness: 0.0,
      flatShading: false,
      side: THREE.DoubleSide
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: shirtColor,
      roughness: 0.85,
      metalness: 0.0,
      flatShading: false,
      side: THREE.DoubleSide
    });

    const pantsMaterial = new THREE.MeshStandardMaterial({
      color: pantsColor,
      roughness: 0.85,
      metalness: 0.0,
      flatShading: false,
      side: THREE.DoubleSide
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.6,
      metalness: 0.1,
      flatShading: false
    });

    const bootMaterial = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.7,
      metalness: 0.1,
      flatShading: false,
      side: THREE.DoubleSide
    });

    // ========== 创建蒙皮网格 ==========

    // 头部蒙皮网格
    const headMesh = this.createHeadSkinnedMesh(skinMaterial, hairMaterial, bones, heightScale);
    human.add(headMesh);

    // 躯干蒙皮网格
    const torsoMesh = this.createTorsoSkinnedMesh(shirtMaterial, pantsMaterial, bones, heightScale);
    human.add(torsoMesh);

    // 手臂蒙皮网格
    const leftArmMesh = this.createArmSkinnedMesh(skinMaterial, shirtMaterial, 'left', bones, heightScale);
    human.add(leftArmMesh);

    const rightArmMesh = this.createArmSkinnedMesh(skinMaterial, shirtMaterial, 'right', bones, heightScale);
    human.add(rightArmMesh);

    // 腿部蒙皮网格
    const leftLegMesh = this.createLegSkinnedMesh(pantsMaterial, bootMaterial, 'left', bones, heightScale);
    human.add(leftLegMesh);

    const rightLegMesh = this.createLegSkinnedMesh(pantsMaterial, bootMaterial, 'right', bones, heightScale);
    human.add(rightLegMesh);

    // ========== 装备 ==========
    if (isPlayer) {
      this.addPlayerGearSkinned(human, shirtMaterial, bones, heightScale);
    } else if (isEnemy) {
      this.addEnemyDetailsSkinned(human, skinMaterial, shirtMaterial, bones, heightScale);
    }

    // 保存绑定姿态
    const bindPose = SkeletonBuilder.getBindPose(bones);

    // 存储骨骼引用
    human.userData.skeleton = skeleton;
    human.userData.bones = bones;
    human.userData.bindPose = bindPose;
    human.userData.skeletonRoot = skeletonRoot;

    return {
      model: human,
      skeleton: skeleton,
      bones: bones,
      bindPose: bindPose
    };
  }

  /**
   * 创建头部蒙皮网格
   */
  static createHeadSkinnedMesh(skinMaterial, hairMaterial, bones, heightScale) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const skinIndices = [];
    const skinWeights = [];

    // 头部中心位置
    const headCenterY = 1.58 * heightScale;

    // 简化的头部几何体 - 球体
    const headRadius = 0.11;
    const headSegments = 12;

    for (let i = 0; i <= headSegments; i++) {
      const phi = (i / headSegments) * Math.PI;
      for (let j = 0; j <= headSegments; j++) {
        const theta = (j / headSegments) * Math.PI * 2;

        const x = headRadius * Math.sin(phi) * Math.cos(theta);
        const y = headRadius * Math.cos(phi) * 1.1 + headCenterY;
        const z = headRadius * Math.sin(phi) * Math.sin(theta) * 0.95;

        positions.push(x, y, z);

        // 绑定到头部骨骼
        skinIndices.push(this.getBoneIndex(bones, 'head'), 0, 0, 0);
        skinWeights.push(1, 0, 0, 0);
      }
    }

    // 创建索引
    const indices = [];
    for (let i = 0; i < headSegments; i++) {
      for (let j = 0; j < headSegments; j++) {
        const a = i * (headSegments + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (headSegments + 1) + j;
        const d = c + 1;

        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
    geometry.computeVertexNormals();

    const mesh = new THREE.SkinnedMesh(geometry, skinMaterial);
    mesh.castShadow = true;
    mesh.name = 'head-mesh';

    // 添加头发（非蒙皮，跟随头部）
    const hairGroup = new THREE.Group();
    hairGroup.name = 'hair';

    const hairTopGeom = new THREE.SphereGeometry(0.115, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairTop = new THREE.Mesh(hairTopGeom, hairMaterial);
    hairTop.position.y = headCenterY + 0.01;
    hairTop.castShadow = true;
    hairGroup.add(hairTop);

    // 刘海
    const bangsGeom = new THREE.BoxGeometry(0.18, 0.04, 0.08);
    const bangs = new THREE.Mesh(bangsGeom, hairMaterial);
    bangs.position.set(0, headCenterY + 0.06, 0.08);
    bangs.castShadow = true;
    hairGroup.add(bangs);

    mesh.add(hairGroup);

    // 添加眼睛
    const eyeGroup = this.createEyes(headCenterY);
    mesh.add(eyeGroup);

    return mesh;
  }

  /**
   * 创建眼睛组
   */
  static createEyes(headCenterY) {
    const eyeGroup = new THREE.Group();
    eyeGroup.name = 'eyes';

    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xFAFAFA,
      roughness: 0.2
    });

    const pupilMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A4A6A,
      roughness: 0.1,
      metalness: 0.2
    });

    // 眼白
    const eyeWhiteGeom = new THREE.SphereGeometry(0.022, 8, 6);

    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMaterial);
    leftEyeWhite.position.set(-0.04, headCenterY + 0.015, 0.09);
    eyeGroup.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMaterial);
    rightEyeWhite.position.set(0.04, headCenterY + 0.015, 0.09);
    eyeGroup.add(rightEyeWhite);

    // 瞳孔
    const pupilGeom = new THREE.SphereGeometry(0.012, 6, 4);

    const leftPupil = new THREE.Mesh(pupilGeom, pupilMaterial);
    leftPupil.position.set(-0.04, headCenterY + 0.015, 0.105);
    eyeGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeom, pupilMaterial);
    rightPupil.position.set(0.04, headCenterY + 0.015, 0.105);
    eyeGroup.add(rightPupil);

    return eyeGroup;
  }

  /**
   * 创建躯干蒙皮网格
   */
  static createTorsoSkinnedMesh(shirtMaterial, pantsMaterial, bones, heightScale) {
    const group = new THREE.Group();
    group.name = 'torso-group';

    // 使用简化的躯干几何体
    const torsoGeometry = this.createTorsoGeometry(heightScale);
    const skinData = this.skinTorsoGeometry(torsoGeometry, bones, heightScale);

    torsoGeometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinData.indices, 4));
    torsoGeometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinData.weights, 4));

    const torsoMesh = new THREE.SkinnedMesh(torsoGeometry, shirtMaterial);
    torsoMesh.castShadow = true;
    torsoMesh.name = 'torso-mesh';
    group.add(torsoMesh);

    // 臀部（裤子材质）
    const hipGeometry = this.createHipGeometry(heightScale);
    const hipSkinData = this.skinHipGeometry(hipGeometry, bones, heightScale);

    hipGeometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(hipSkinData.indices, 4));
    hipGeometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(hipSkinData.weights, 4));

    const hipMesh = new THREE.SkinnedMesh(hipGeometry, pantsMaterial);
    hipMesh.castShadow = true;
    hipMesh.name = 'hip-mesh';
    group.add(hipMesh);

    return group;
  }

  /**
   * 创建躯干几何体
   */
  static createTorsoGeometry(heightScale) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const indices = [];

    // 简化的躯干 - 使用圆柱体近似
    const segments = 12;
    const levels = 5; // 胸部到腰部的层级
    const radii = [0.17, 0.16, 0.15, 0.14, 0.13];
    const heights = [1.32, 1.22, 1.12, 1.02, 0.92].map(h => h * heightScale);

    for (let level = 0; level < levels; level++) {
      const y = heights[level];
      const radius = radii[level];

      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        positions.push(x, y, z);
      }
    }

    // 创建面片
    for (let level = 0; level < levels - 1; level++) {
      for (let i = 0; i < segments; i++) {
        const a = level * segments + i;
        const b = level * segments + ((i + 1) % segments);
        const c = (level + 1) * segments + i;
        const d = (level + 1) * segments + ((i + 1) % segments);

        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  /**
   * 为躯干几何体添加蒙皮数据
   */
  static skinTorsoGeometry(geometry, bones, heightScale) {
    const positions = geometry.attributes.position.array;
    const skinIndices = [];
    const skinWeights = [];

    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1] / heightScale;

      // 根据高度决定骨骼权重
      let boneName, weight;
      if (y > 1.2) {
        boneName = 'spine2';
        weight = 1;
      } else if (y > 1.1) {
        boneName = 'spine1';
        weight = 1;
      } else {
        boneName = 'spine';
        weight = 1;
      }

      skinIndices.push(this.getBoneIndex(bones, boneName), 0, 0, 0);
      skinWeights.push(weight, 0, 0, 0);
    }

    return { indices: skinIndices, weights: skinWeights };
  }

  /**
   * 创建臀部几何体
   */
  static createHipGeometry(heightScale) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const indices = [];

    const segments = 12;
    const radius = 0.14;
    const y = 0.78 * heightScale;

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    }

    // 简化为一个环
    for (let i = 0; i < segments; i++) {
      const a = i;
      const b = (i + 1) % segments;
      indices.push(a, b, segments); // 使用中心点
    }

    // 添加中心点
    positions.push(0, y, 0);

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  /**
   * 为臀部几何体添加蒙皮数据
   */
  static skinHipGeometry(geometry, bones, heightScale) {
    const positions = geometry.attributes.position.array;
    const skinIndices = [];
    const skinWeights = [];

    for (let i = 0; i < positions.length; i += 3) {
      skinIndices.push(this.getBoneIndex(bones, 'hips'), 0, 0, 0);
      skinWeights.push(1, 0, 0, 0);
    }

    return { indices: skinIndices, weights: skinWeights };
  }

  /**
   * 创建手臂蒙皮网格
   */
  static createArmSkinnedMesh(skinMaterial, shirtMaterial, side, bones, heightScale) {
    const group = new THREE.Group();
    group.name = `${side}-arm-group`;

    const isLeft = side === 'left';
    const sideMult = isLeft ? -1 : 1;

    // 上臂（衣袖）
    const upperArmGeom = new THREE.CylinderGeometry(0.045, 0.038, 0.22, 8);
    const upperArmSkinData = this.skinArmGeometry(upperArmGeom, bones, side, 'upperArm', heightScale);
    upperArmGeom.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(upperArmSkinData.indices, 4));
    upperArmGeom.setAttribute('skinWeight', new THREE.Float32BufferAttribute(upperArmSkinData.weights, 4));

    const upperArmMesh = new THREE.SkinnedMesh(upperArmGeom, shirtMaterial);
    upperArmMesh.position.set(sideMult * 0.22, 1.18 * heightScale, 0);
    upperArmMesh.castShadow = true;
    upperArmMesh.name = `${side}-upper-arm-mesh`;
    group.add(upperArmMesh);

    // 前臂（皮肤）
    const forearmGeom = new THREE.CylinderGeometry(0.032, 0.025, 0.2, 8);
    const forearmSkinData = this.skinArmGeometry(forearmGeom, bones, side, 'forearm', heightScale);
    forearmGeom.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(forearmSkinData.indices, 4));
    forearmGeom.setAttribute('skinWeight', new THREE.Float32BufferAttribute(forearmSkinData.weights, 4));

    const forearmMesh = new THREE.SkinnedMesh(forearmGeom, skinMaterial);
    forearmMesh.position.set(sideMult * 0.22, 0.92 * heightScale, 0);
    forearmMesh.castShadow = true;
    forearmMesh.name = `${side}-forearm-mesh`;
    group.add(forearmMesh);

    // 手（简化版）
    const handGeom = new THREE.BoxGeometry(0.045, 0.025, 0.06);
    const handSkinData = this.skinArmGeometry(handGeom, bones, side, 'hand', heightScale);
    handGeom.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(handSkinData.indices, 4));
    handGeom.setAttribute('skinWeight', new THREE.Float32BufferAttribute(handSkinData.weights, 4));

    const handMesh = new THREE.SkinnedMesh(handGeom, skinMaterial);
    handMesh.position.set(sideMult * 0.22, 0.72 * heightScale, 0);
    handMesh.castShadow = true;
    handMesh.name = `${side}-hand-mesh`;
    group.add(handMesh);

    return group;
  }

  /**
   * 为手臂几何体添加蒙皮数据
   */
  static skinArmGeometry(geometry, bones, side, part, heightScale) {
    const positions = geometry.attributes.position.array;
    const skinIndices = [];
    const skinWeights = [];

    const boneName = `${side}${part.charAt(0).toUpperCase() + part.slice(1)}`;
    const boneIndex = this.getBoneIndex(bones, boneName);

    for (let i = 0; i < positions.length; i += 3) {
      skinIndices.push(boneIndex, 0, 0, 0);
      skinWeights.push(1, 0, 0, 0);
    }

    return { indices: skinIndices, weights: skinWeights };
  }

  /**
   * 创建腿部蒙皮网格
   */
  static createLegSkinnedMesh(pantsMaterial, bootMaterial, side, bones, heightScale) {
    const group = new THREE.Group();
    group.name = `${side}-leg-group`;

    const isLeft = side === 'left';
    const sideMult = isLeft ? -1 : 1;

    // 大腿
    const thighGeom = new THREE.CylinderGeometry(0.065, 0.05, 0.32, 8);
    const thighSkinData = this.skinLegGeometry(thighGeom, bones, side, 'upperLeg', heightScale);
    thighGeom.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(thighSkinData.indices, 4));
    thighGeom.setAttribute('skinWeight', new THREE.Float32BufferAttribute(thighSkinData.weights, 4));

    const thighMesh = new THREE.SkinnedMesh(thighGeom, pantsMaterial);
    thighMesh.position.set(sideMult * 0.07, 0.62 * heightScale, 0);
    thighMesh.castShadow = true;
    thighMesh.name = `${side}-thigh-mesh`;
    group.add(thighMesh);

    // 小腿
    const calfGeom = new THREE.CylinderGeometry(0.045, 0.035, 0.3, 8);
    const calfSkinData = this.skinLegGeometry(calfGeom, bones, side, 'lowerLeg', heightScale);
    calfGeom.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(calfSkinData.indices, 4));
    calfGeom.setAttribute('skinWeight', new THREE.Float32BufferAttribute(calfSkinData.weights, 4));

    const calfMesh = new THREE.SkinnedMesh(calfGeom, pantsMaterial);
    calfMesh.position.set(sideMult * 0.07, 0.32 * heightScale, 0);
    calfMesh.castShadow = true;
    calfMesh.name = `${side}-calf-mesh`;
    group.add(calfMesh);

    // 靴子
    const bootGeom = new THREE.BoxGeometry(0.08, 0.08, 0.14);
    const bootSkinData = this.skinLegGeometry(bootGeom, bones, side, 'foot', heightScale);
    bootGeom.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(bootSkinData.indices, 4));
    bootGeom.setAttribute('skinWeight', new THREE.Float32BufferAttribute(bootSkinData.weights, 4));

    const bootMesh = new THREE.SkinnedMesh(bootGeom, bootMaterial);
    bootMesh.position.set(sideMult * 0.07, 0.08, 0.02);
    bootMesh.castShadow = true;
    bootMesh.name = `${side}-boot-mesh`;
    group.add(bootMesh);

    return group;
  }

  /**
   * 为腿部几何体添加蒙皮数据
   */
  static skinLegGeometry(geometry, bones, side, part, heightScale) {
    const positions = geometry.attributes.position.array;
    const skinIndices = [];
    const skinWeights = [];

    const boneName = `${side}${part.charAt(0).toUpperCase() + part.slice(1)}`;
    const boneIndex = this.getBoneIndex(bones, boneName);

    for (let i = 0; i < positions.length; i += 3) {
      skinIndices.push(boneIndex, 0, 0, 0);
      skinWeights.push(1, 0, 0, 0);
    }

    return { indices: skinIndices, weights: skinWeights };
  }

  /**
   * 获取骨骼索引
   */
  static getBoneIndex(bones, boneName) {
    if (bones[boneName]) {
      let index = 0;
      let parent = bones[boneName].parent;
      while (parent) {
        if (parent.isBone) index++;
        parent = parent.parent;
      }
      // 简化：直接查找骨骼在列表中的位置
      const boneList = SkeletonBuilder.getBoneList(bones.root);
      return boneList.indexOf(bones[boneName]);
    }
    return 0;
  }

  /**
   * 添加玩家特有装备（蒙皮版本）
   */
  static addPlayerGearSkinned(human, shirtMaterial, bones, heightScale) {
    // 战术背心（静态，跟随躯干）
    const vestGeom = new THREE.BoxGeometry(0.32, 0.28, 0.15);
    const vestMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A5A4A,
      roughness: 0.85,
      metalness: 0.05
    });
    const vest = new THREE.Mesh(vestGeom, vestMaterial);
    vest.position.set(0, 1.08 * heightScale, 0.02);
    vest.castShadow = true;
    human.add(vest);

    // 护膝
    const kneePadGeom = new THREE.BoxGeometry(0.08, 0.1, 0.04);
    const kneePadMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.8
    });

    const leftKneePad = new THREE.Mesh(kneePadGeom, kneePadMaterial);
    leftKneePad.position.set(-0.07, 0.42 * heightScale, 0.08);
    human.add(leftKneePad);

    const rightKneePad = new THREE.Mesh(kneePadGeom, kneePadMaterial);
    rightKneePad.position.set(0.07, 0.42 * heightScale, 0.08);
    human.add(rightKneePad);
  }

  /**
   * 添加敌人特有的装饰（蒙皮版本）
   */
  static addEnemyDetailsSkinned(human, skinMaterial, shirtMaterial, bones, heightScale) {
    // 战术背心
    const vestGeom = new THREE.BoxGeometry(0.32, 0.26, 0.14);
    const vestMaterial = new THREE.MeshStandardMaterial({
      color: 0x3A3A3A,
      roughness: 0.9
    });
    const vest = new THREE.Mesh(vestGeom, vestMaterial);
    vest.position.set(0, 1.05 * heightScale, 0);
    vest.castShadow = true;
    human.add(vest);

    // 头巾/面罩
    const maskGeom = new THREE.BoxGeometry(0.2, 0.08, 0.08);
    const maskMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.9
    });
    const mask = new THREE.Mesh(maskGeom, maskMaterial);
    mask.position.set(0, 1.52 * heightScale, 0.08);
    human.add(mask);
  }

  // ========== 原有的静态模型方法（保留用于LOD或简单场景）==========

  /**
   * 创建完整的人体模型（静态版本，无骨骼）
   */
  static createHumanModel(options = {}) {
    const {
      skinColor = 0xE8C8A8,
      shirtColor = 0x4A7A4A,
      pantsColor = 0x3A3A5A,
      hairColor = 0x2A1A0A,
      isEnemy = false,
      isPlayer = false
    } = options;

    const human = new THREE.Group();
    human.name = 'human-model';

    // 材质定义
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.75,
      metalness: 0.0,
      flatShading: false
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: shirtColor,
      roughness: 0.85,
      metalness: 0.0,
      flatShading: false
    });

    const pantsMaterial = new THREE.MeshStandardMaterial({
      color: pantsColor,
      roughness: 0.85,
      metalness: 0.0,
      flatShading: false
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.6,
      metalness: 0.1,
      flatShading: false
    });

    const bootMaterial = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.7,
      metalness: 0.1,
      flatShading: false
    });

    // ========== 头部 ==========
    const headGroup = new THREE.Group();
    headGroup.name = 'head';
    headGroup.position.y = 1.58;

    const headGeom = new THREE.SphereGeometry(0.11, 16, 12);
    headGeom.scale(1, 1.1, 0.95);
    const head = new THREE.Mesh(headGeom, skinMaterial);
    head.castShadow = true;
    headGroup.add(head);

    // 头发
    const hairGroup = new THREE.Group();
    const hairTopGeom = new THREE.SphereGeometry(0.115, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairTop = new THREE.Mesh(hairTopGeom, hairMaterial);
    hairTop.position.y = 0.01;
    hairTop.castShadow = true;
    hairGroup.add(hairTop);

    const bangsGeom = new THREE.BoxGeometry(0.18, 0.04, 0.08);
    const bangs = new THREE.Mesh(bangsGeom, hairMaterial);
    bangs.position.set(0, 0.06, 0.08);
    bangs.castShadow = true;
    hairGroup.add(bangs);

    const sideHairGeom = new THREE.BoxGeometry(0.03, 0.08, 0.06);
    const leftSideHair = new THREE.Mesh(sideHairGeom, hairMaterial);
    leftSideHair.position.set(-0.11, 0, 0.02);
    hairGroup.add(leftSideHair);

    const rightSideHair = new THREE.Mesh(sideHairGeom, hairMaterial);
    rightSideHair.position.set(0.11, 0, 0.02);
    hairGroup.add(rightSideHair);

    headGroup.add(hairGroup);

    // 眉毛
    const eyebrowGeom = new THREE.BoxGeometry(0.035, 0.008, 0.01);
    const eyebrowMaterial = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.8
    });

    const leftEyebrow = new THREE.Mesh(eyebrowGeom, eyebrowMaterial);
    leftEyebrow.position.set(-0.04, 0.04, 0.1);
    leftEyebrow.rotation.z = 0.1;
    headGroup.add(leftEyebrow);

    const rightEyebrow = new THREE.Mesh(eyebrowGeom, eyebrowMaterial);
    rightEyebrow.position.set(0.04, 0.04, 0.1);
    rightEyebrow.rotation.z = -0.1;
    headGroup.add(rightEyebrow);

    // 眼睛
    const eyeGroup = new THREE.Group();

    const eyeWhiteGeom = new THREE.SphereGeometry(0.022, 10, 8);
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xFAFAFA,
      roughness: 0.2
    });

    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMaterial);
    leftEyeWhite.position.set(-0.04, 0.015, 0.09);
    eyeGroup.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMaterial);
    rightEyeWhite.position.set(0.04, 0.015, 0.09);
    eyeGroup.add(rightEyeWhite);

    const pupilGeom = new THREE.SphereGeometry(0.012, 8, 6);
    const pupilMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A4A6A,
      roughness: 0.1,
      metalness: 0.2
    });

    const leftPupil = new THREE.Mesh(pupilGeom, pupilMaterial);
    leftPupil.position.set(-0.04, 0.015, 0.105);
    eyeGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeom, pupilMaterial);
    rightPupil.position.set(0.04, 0.015, 0.105);
    eyeGroup.add(rightPupil);

    const highlightGeom = new THREE.SphereGeometry(0.004, 6, 4);
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    const leftHighlight = new THREE.Mesh(highlightGeom, highlightMaterial);
    leftHighlight.position.set(-0.037, 0.018, 0.112);
    eyeGroup.add(leftHighlight);

    const rightHighlight = new THREE.Mesh(highlightGeom, highlightMaterial);
    rightHighlight.position.set(0.043, 0.018, 0.112);
    eyeGroup.add(rightHighlight);

    headGroup.add(eyeGroup);

    // 鼻子
    const noseGeom = new THREE.ConeGeometry(0.012, 0.03, 6);
    const nose = new THREE.Mesh(noseGeom, skinMaterial);
    nose.position.set(0, -0.01, 0.1);
    nose.rotation.x = Math.PI * 0.5;
    headGroup.add(nose);

    // 嘴巴
    const mouthGeom = new THREE.BoxGeometry(0.04, 0.008, 0.01);
    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: 0x8A5A5A,
      roughness: 0.8
    });
    const mouth = new THREE.Mesh(mouthGeom, mouthMaterial);
    mouth.position.set(0, -0.04, 0.095);
    headGroup.add(mouth);

    // 耳朵
    const earGeom = new THREE.BoxGeometry(0.02, 0.04, 0.015);
    const leftEar = new THREE.Mesh(earGeom, skinMaterial);
    leftEar.position.set(-0.11, 0, 0);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeom, skinMaterial);
    rightEar.position.set(0.11, 0, 0);
    headGroup.add(rightEar);

    human.add(headGroup);

    // ========== 脖子 ==========
    const neckGeom = new THREE.CylinderGeometry(0.045, 0.055, 0.1, 10);
    const neck = new THREE.Mesh(neckGeom, skinMaterial);
    neck.position.y = 1.43;
    neck.castShadow = true;
    human.add(neck);

    // ========== 躯干 ==========
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'torso';
    torsoGroup.position.y = 1.0;

    const shoulderGeom = new THREE.SphereGeometry(0.08, 10, 8);
    const leftShoulder = new THREE.Mesh(shoulderGeom, shirtMaterial);
    leftShoulder.position.set(-0.2, 0.22, 0);
    leftShoulder.scale.set(1, 0.7, 0.8);
    torsoGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeom, shirtMaterial);
    rightShoulder.position.set(0.2, 0.22, 0);
    rightShoulder.scale.set(1, 0.7, 0.8);
    torsoGroup.add(rightShoulder);

    const chestGeom = new THREE.CylinderGeometry(0.17, 0.15, 0.32, 12);
    const chest = new THREE.Mesh(chestGeom, shirtMaterial);
    chest.position.y = 0.18;
    chest.castShadow = true;
    torsoGroup.add(chest);

    const pectoralGeom = new THREE.SphereGeometry(0.06, 8, 6);
    const leftPectoral = new THREE.Mesh(pectoralGeom, shirtMaterial);
    leftPectoral.position.set(-0.07, 0.22, 0.1);
    leftPectoral.scale.set(1.2, 0.8, 0.6);
    torsoGroup.add(leftPectoral);

    const rightPectoral = new THREE.Mesh(pectoralGeom, shirtMaterial);
    rightPectoral.position.set(0.07, 0.22, 0.1);
    rightPectoral.scale.set(1.2, 0.8, 0.6);
    torsoGroup.add(rightPectoral);

    const abdomenGeom = new THREE.CylinderGeometry(0.14, 0.13, 0.22, 12);
    const abdomen = new THREE.Mesh(abdomenGeom, shirtMaterial);
    abdomen.position.y = -0.08;
    abdomen.castShadow = true;
    torsoGroup.add(abdomen);

    const beltGeom = new THREE.TorusGeometry(0.14, 0.02, 8, 24);
    const beltMaterial = new THREE.MeshStandardMaterial({
      color: 0x3A2A1A,
      roughness: 0.7,
      metalness: 0.1
    });
    const belt = new THREE.Mesh(beltGeom, beltMaterial);
    belt.position.y = -0.22;
    belt.rotation.x = Math.PI * 0.5;
    torsoGroup.add(belt);

    const buckleGeom = new THREE.BoxGeometry(0.05, 0.04, 0.02);
    const buckleMaterial = new THREE.MeshStandardMaterial({
      color: 0xC0A040,
      roughness: 0.3,
      metalness: 0.6
    });
    const buckle = new THREE.Mesh(buckleGeom, buckleMaterial);
    buckle.position.set(0, -0.22, 0.14);
    torsoGroup.add(buckle);

    const hipGeom = new THREE.CylinderGeometry(0.13, 0.14, 0.12, 12);
    const hip = new THREE.Mesh(hipGeom, pantsMaterial);
    hip.position.y = -0.32;
    hip.castShadow = true;
    torsoGroup.add(hip);

    human.add(torsoGroup);

    // ========== 手臂 ==========
    const leftArm = this.createArm(skinMaterial, shirtMaterial, -0.22, isPlayer);
    leftArm.name = 'left-arm';
    human.add(leftArm);

    const rightArm = this.createArm(skinMaterial, shirtMaterial, 0.22, isPlayer);
    rightArm.name = 'right-arm';
    human.add(rightArm);

    // ========== 腿部 ==========
    const leftLeg = this.createLeg(pantsMaterial, bootMaterial, -0.07);
    leftLeg.name = 'left-leg';
    human.add(leftLeg);

    const rightLeg = this.createLeg(pantsMaterial, bootMaterial, 0.07);
    rightLeg.name = 'right-leg';
    human.add(rightLeg);

    // ========== 装备 ==========
    if (isPlayer) {
      this.addPlayerGear(human, shirtMaterial);
    } else if (isEnemy) {
      this.addEnemyDetails(human, skinMaterial, shirtMaterial);
    }

    return human;
  }

  /**
   * 创建手臂（静态版本）
   */
  static createArm(skinMaterial, shirtMaterial, offsetX, isPlayer = false) {
    const armGroup = new THREE.Group();
    armGroup.position.set(offsetX, 1.18, 0);

    const upperArmGeom = new THREE.CylinderGeometry(0.045, 0.038, 0.22, 10);
    const upperArm = new THREE.Mesh(upperArmGeom, shirtMaterial);
    upperArm.position.y = -0.08;
    upperArm.castShadow = true;
    armGroup.add(upperArm);

    const elbowGeom = new THREE.SphereGeometry(0.035, 8, 6);
    const elbow = new THREE.Mesh(elbowGeom, skinMaterial);
    elbow.position.y = -0.2;
    armGroup.add(elbow);

    const forearmGeom = new THREE.CylinderGeometry(0.032, 0.025, 0.2, 10);
    const forearm = new THREE.Mesh(forearmGeom, skinMaterial);
    forearm.position.y = -0.32;
    forearm.castShadow = true;
    armGroup.add(forearm);

    const wristGeom = new THREE.SphereGeometry(0.022, 8, 6);
    const wrist = new THREE.Mesh(wristGeom, skinMaterial);
    wrist.position.y = -0.44;
    armGroup.add(wrist);

    const handGroup = new THREE.Group();
    handGroup.position.y = -0.48;

    const palmGeom = new THREE.BoxGeometry(0.045, 0.025, 0.06);
    const palm = new THREE.Mesh(palmGeom, skinMaterial);
    handGroup.add(palm);

    const fingerPositions = [
      { x: -0.018, z: -0.025 },
      { x: -0.006, z: -0.028 },
      { x: 0.006, z: -0.028 },
      { x: 0.018, z: -0.025 }
    ];

    fingerPositions.forEach(pos => {
      const fingerGroup = new THREE.Group();
      const fingerCylGeom = new THREE.CylinderGeometry(0.006, 0.005, 0.025, 6);
      const fingerCyl = new THREE.Mesh(fingerCylGeom, skinMaterial);
      fingerGroup.add(fingerCyl);
      const fingerTipGeom = new THREE.SphereGeometry(0.005, 6, 4);
      const fingerTip = new THREE.Mesh(fingerTipGeom, skinMaterial);
      fingerTip.position.y = -0.015;
      fingerGroup.add(fingerTip);
      fingerGroup.position.set(pos.x, 0, pos.z);
      fingerGroup.rotation.x = Math.PI * 0.5;
      handGroup.add(fingerGroup);
    });

    const thumbGroup = new THREE.Group();
    const thumbCylGeom = new THREE.CylinderGeometry(0.007, 0.006, 0.02, 6);
    const thumbCyl = new THREE.Mesh(thumbCylGeom, skinMaterial);
    thumbGroup.add(thumbCyl);
    const thumbTipGeom = new THREE.SphereGeometry(0.006, 6, 4);
    const thumbTip = new THREE.Mesh(thumbTipGeom, skinMaterial);
    thumbTip.position.y = -0.012;
    thumbGroup.add(thumbTip);
    thumbGroup.position.set(-0.025, -0.005, 0.01);
    thumbGroup.rotation.z = Math.PI * 0.3;
    handGroup.add(thumbGroup);

    armGroup.add(handGroup);

    return armGroup;
  }

  /**
   * 创建腿部（静态版本）
   */
  static createLeg(pantsMaterial, bootMaterial, offsetX) {
    const legGroup = new THREE.Group();
    legGroup.position.set(offsetX, 0.72, 0);

    const thighGeom = new THREE.CylinderGeometry(0.065, 0.05, 0.32, 10);
    const thigh = new THREE.Mesh(thighGeom, pantsMaterial);
    thigh.position.y = -0.1;
    thigh.castShadow = true;
    legGroup.add(thigh);

    const kneeGeom = new THREE.SphereGeometry(0.045, 8, 6);
    const knee = new THREE.Mesh(kneeGeom, pantsMaterial);
    knee.position.y = -0.28;
    legGroup.add(knee);

    const calfGeom = new THREE.CylinderGeometry(0.045, 0.035, 0.3, 10);
    const calf = new THREE.Mesh(calfGeom, pantsMaterial);
    calf.position.y = -0.45;
    calf.castShadow = true;
    legGroup.add(calf);

    const ankleGeom = new THREE.SphereGeometry(0.025, 8, 6);
    const ankle = new THREE.Mesh(ankleGeom, pantsMaterial);
    ankle.position.y = -0.62;
    legGroup.add(ankle);

    const bootGroup = new THREE.Group();
    bootGroup.position.y = -0.68;

    const bootGeom = new THREE.BoxGeometry(0.08, 0.08, 0.14);
    const boot = new THREE.Mesh(bootGeom, bootMaterial);
    boot.position.z = 0.02;
    boot.castShadow = true;
    bootGroup.add(boot);

    const soleGeom = new THREE.BoxGeometry(0.085, 0.015, 0.16);
    const sole = new THREE.Mesh(soleGeom, bootMaterial);
    sole.position.set(0, -0.04, 0.02);
    bootGroup.add(sole);

    const bootTopGeom = new THREE.BoxGeometry(0.07, 0.02, 0.08);
    const bootTopMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.8
    });
    const bootTop = new THREE.Mesh(bootTopGeom, bootTopMaterial);
    bootTop.position.set(0, 0.04, 0);
    bootGroup.add(bootTop);

    legGroup.add(bootGroup);

    return legGroup;
  }

  /**
   * 添加玩家特有装备（静态版本）
   */
  static addPlayerGear(human, shirtMaterial) {
    const vestGeom = new THREE.BoxGeometry(0.32, 0.28, 0.15);
    const vestMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A5A4A,
      roughness: 0.85,
      metalness: 0.05
    });
    const vest = new THREE.Mesh(vestGeom, vestMaterial);
    vest.position.set(0, 1.08, 0.02);
    vest.castShadow = true;
    human.add(vest);

    const pouchGeom = new THREE.BoxGeometry(0.05, 0.06, 0.03);
    const pouchMaterial = new THREE.MeshStandardMaterial({
      color: 0x3A4A3A,
      roughness: 0.9
    });

    const leftPouch = new THREE.Mesh(pouchGeom, pouchMaterial);
    leftPouch.position.set(-0.1, 1.02, 0.12);
    human.add(leftPouch);

    const rightPouch = new THREE.Mesh(pouchGeom, pouchMaterial);
    rightPouch.position.set(0.1, 1.02, 0.12);
    human.add(rightPouch);

    const kneePadGeom = new THREE.BoxGeometry(0.08, 0.1, 0.04);
    const kneePadMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.8
    });

    const leftKneePad = new THREE.Mesh(kneePadGeom, kneePadMaterial);
    leftKneePad.position.set(-0.07, 0.42, 0.08);
    human.add(leftKneePad);

    const rightKneePad = new THREE.Mesh(kneePadGeom, kneePadMaterial);
    rightKneePad.position.set(0.07, 0.42, 0.08);
    human.add(rightKneePad);

    const gloveMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.8
    });

    const leftGloveGeom = new THREE.BoxGeometry(0.04, 0.03, 0.05);
    const leftGlove = new THREE.Mesh(leftGloveGeom, gloveMaterial);
    leftGlove.position.set(-0.22, 0.68, 0);
    human.add(leftGlove);

    const rightGlove = new THREE.Mesh(leftGloveGeom, gloveMaterial);
    rightGlove.position.set(0.22, 0.68, 0);
    human.add(rightGlove);
  }

  /**
   * 添加敌人特有的装饰（静态版本）
   */
  static addEnemyDetails(human, skinMaterial, shirtMaterial) {
    const vestGeom = new THREE.BoxGeometry(0.32, 0.26, 0.14);
    const vestMaterial = new THREE.MeshStandardMaterial({
      color: 0x3A3A3A,
      roughness: 0.9
    });
    const vest = new THREE.Mesh(vestGeom, vestMaterial);
    vest.position.set(0, 1.05, 0);
    vest.castShadow = true;
    human.add(vest);

    const pouchGeom = new THREE.BoxGeometry(0.055, 0.07, 0.03);
    const pouchMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.9
    });

    const positions = [-0.1, 0, 0.1];
    positions.forEach(x => {
      const pouch = new THREE.Mesh(pouchGeom, pouchMaterial);
      pouch.position.set(x, 1.0, 0.1);
      human.add(pouch);
    });

    const maskGeom = new THREE.BoxGeometry(0.2, 0.08, 0.08);
    const maskMaterial = new THREE.MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.9
    });
    const mask = new THREE.Mesh(maskGeom, maskMaterial);
    mask.position.set(0, 1.52, 0.08);
    human.add(mask);
  }

  /**
   * 创建简单的低多边形人体（用于远距离LOD）
   */
  static createSimpleHuman(options = {}) {
    const {
      skinColor = 0xE8C8A8,
      shirtColor = 0x4A7A4A,
      pantsColor = 0x3A3A5A
    } = options;

    const human = new THREE.Group();

    const bodyGroup = new THREE.Group();
    const bodyCylGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.75, 10);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: shirtColor,
      roughness: 0.8
    });
    const bodyCyl = new THREE.Mesh(bodyCylGeom, bodyMaterial);
    bodyGroup.add(bodyCyl);
    const topSphereGeom = new THREE.SphereGeometry(0.18, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const topSphere = new THREE.Mesh(topSphereGeom, bodyMaterial);
    topSphere.position.y = 0.375;
    bodyGroup.add(topSphere);
    const bottomSphereGeom = new THREE.SphereGeometry(0.18, 8, 6, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
    const bottomSphere = new THREE.Mesh(bottomSphereGeom, bodyMaterial);
    bottomSphere.position.y = -0.375;
    bodyGroup.add(bottomSphere);

    bodyGroup.position.y = 0.9;
    bodyGroup.traverse(child => { if (child.isMesh) child.castShadow = true; });
    human.add(bodyGroup);

    const headGeom = new THREE.SphereGeometry(0.12, 8, 6);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.8
    });
    const head = new THREE.Mesh(headGeom, headMaterial);
    head.position.y = 1.55;
    head.castShadow = true;
    human.add(head);

    const legGeom = new THREE.CylinderGeometry(0.055, 0.045, 0.48, 6);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: pantsColor,
      roughness: 0.9
    });

    const leftLeg = new THREE.Mesh(legGeom, legMaterial);
    leftLeg.position.set(-0.07, 0.24, 0);
    leftLeg.castShadow = true;
    human.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeom, legMaterial);
    rightLeg.position.set(0.07, 0.24, 0);
    rightLeg.castShadow = true;
    human.add(rightLeg);

    return human;
  }

  /**
   * 创建带LOD的多级细节模型
   * @param {Object} options - 配置选项
   * @returns {THREE.LOD} LOD对象
   */
  static createLODModel(options = {}) {
    const {
      skinColor = 0xE8C8A8,
      shirtColor = 0x4A7A4A,
      pantsColor = 0x3A3A5A,
      hairColor = 0x2A1A0A,
      isEnemy = false,
      isPlayer = false,
      lodDistances = [0, 30, 80, 150]
    } = options;

    const lod = new THREE.LOD();

    // LOD 0 - 高精度骨骼模型（近距离）
    const highDetail = this.createHumanModel({
      skinColor, shirtColor, pantsColor, hairColor, isEnemy, isPlayer
    });
    lod.addLevel(highDetail, lodDistances[0]);

    // LOD 1 - 中等精度模型
    const mediumDetail = this.createMediumDetailModel({
      skinColor, shirtColor, pantsColor
    });
    lod.addLevel(mediumDetail, lodDistances[1]);

    // LOD 2 - 低精度模型
    const lowDetail = this.createLowDetailModel({
      skinColor, shirtColor, pantsColor
    });
    lod.addLevel(lowDetail, lodDistances[2]);

    // LOD 3 - 简化模型（远距离）
    const simpleModel = this.createSimpleHuman({
      skinColor, shirtColor, pantsColor
    });
    lod.addLevel(simpleModel, lodDistances[3]);

    // 保存骨骼数据引用到userData
    lod.userData.skeleton = highDetail.skeleton;
    lod.userData.bones = highDetail.bones;
    lod.userData.bindPose = highDetail.bindPose;
    lod.userData.highDetailModel = highDetail.model;

    return lod;
  }

  /**
   * 创建中等细节模型
   */
  static createMediumDetailModel(options = {}) {
    const { skinColor, shirtColor, pantsColor } = options;

    const human = new THREE.Group();
    human.name = 'medium-detail-human';

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.75
    });

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: shirtColor,
      roughness: 0.85
    });

    const pantsMaterial = new THREE.MeshStandardMaterial({
      color: pantsColor,
      roughness: 0.85
    });

    // 头部（简化球体）
    const headGeom = new THREE.SphereGeometry(0.11, 12, 8);
    const head = new THREE.Mesh(headGeom, skinMaterial);
    head.position.y = 1.58;
    head.scale.set(1, 1.1, 0.95);
    head.castShadow = true;
    human.add(head);

    // 躯干
    const torsoGeom = new THREE.CylinderGeometry(0.17, 0.14, 0.8, 10);
    const torso = new THREE.Mesh(torsoGeom, shirtMaterial);
    torso.position.y = 1.0;
    torso.castShadow = true;
    human.add(torso);

    // 手臂（简化圆柱）
    const armGeom = new THREE.CylinderGeometry(0.04, 0.03, 0.5, 6);
    const leftArm = new THREE.Mesh(armGeom, shirtMaterial);
    leftArm.position.set(-0.22, 1.0, 0);
    leftArm.rotation.z = 0.2;
    leftArm.castShadow = true;
    human.add(leftArm);

    const rightArm = new THREE.Mesh(armGeom, shirtMaterial);
    rightArm.position.set(0.22, 1.0, 0);
    rightArm.rotation.z = -0.2;
    rightArm.castShadow = true;
    human.add(rightArm);

    // 腿部
    const legGeom = new THREE.CylinderGeometry(0.06, 0.04, 0.7, 6);
    const leftLeg = new THREE.Mesh(legGeom, pantsMaterial);
    leftLeg.position.set(-0.07, 0.35, 0);
    leftLeg.castShadow = true;
    human.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeom, pantsMaterial);
    rightLeg.position.set(0.07, 0.35, 0);
    rightLeg.castShadow = true;
    human.add(rightLeg);

    return human;
  }

  /**
   * 创建低细节模型
   */
  static createLowDetailModel(options = {}) {
    const { skinColor, shirtColor, pantsColor } = options;

    const human = new THREE.Group();
    human.name = 'low-detail-human';

    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: shirtColor,
      roughness: 0.85
    });

    const pantsMaterial = new THREE.MeshStandardMaterial({
      color: pantsColor,
      roughness: 0.85
    });

    // 整体躯干（包含头部）
    const bodyGeom = new THREE.CylinderGeometry(0.18, 0.16, 1.0, 8);
    const body = new THREE.Mesh(bodyGeom, shirtMaterial);
    body.position.y = 1.1;
    body.castShadow = true;
    human.add(body);

    // 头部（简化）
    const headGeom = new THREE.SphereGeometry(0.12, 6, 4);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.75
    });
    const head = new THREE.Mesh(headGeom, headMaterial);
    head.position.y = 1.7;
    head.castShadow = true;
    human.add(head);

    // 腿部（简化圆柱）
    const legGeom = new THREE.CylinderGeometry(0.06, 0.04, 0.7, 4);
    const leftLeg = new THREE.Mesh(legGeom, pantsMaterial);
    leftLeg.position.set(-0.07, 0.35, 0);
    leftLeg.castShadow = true;
    human.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeom, pantsMaterial);
    rightLeg.position.set(0.07, 0.35, 0);
    rightLeg.castShadow = true;
    human.add(rightLeg);

    return human;
  }

  /**
   * 获取模型面数统计
   */
  static getModelStats(model) {
    let triangles = 0;
    let vertices = 0;

    model.traverse(child => {
      if (child.isMesh && child.geometry) {
        const geo = child.geometry;
        if (geo.index) {
          triangles += geo.index.count / 3;
        } else if (geo.attributes.position) {
          triangles += geo.attributes.position.count / 3;
        }
        if (geo.attributes.position) {
          vertices += geo.attributes.position.count;
        }
      }
    });

    return { triangles: Math.floor(triangles), vertices };
  }
}