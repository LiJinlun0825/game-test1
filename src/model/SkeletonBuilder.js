/**
 * 骨骼层级构建器
 * 创建完整的人体骨骼系统，用于动画绑定
 */
export class SkeletonBuilder {
  /**
   * 创建完整的人体骨骼层级
   * @param {Object} options - 配置选项
   * @returns {Object} 包含骨骼根节点、骨骼映射和骨骼数组的对象
   */
  static createSkeleton(options = {}) {
    const {
      scale = 1,
      height = 1.75 // 默认身高 1.75m
    } = options;

    const heightScale = height / 1.75;

    // 创建骨骼
    const bones = {};

    // ========== 根骨骼（臀部）==========
    bones.root = new THREE.Bone();
    bones.root.name = 'root';
    bones.root.position.set(0, 0, 0);

    // 骨盆
    bones.hips = new THREE.Bone();
    bones.hips.name = 'hips';
    bones.hips.position.set(0, 0.98 * heightScale, 0);
    bones.root.add(bones.hips);

    // ========== 脊柱链 ==========
    bones.spine = new THREE.Bone();
    bones.spine.name = 'spine';
    bones.spine.position.set(0, 0.12 * heightScale, 0);
    bones.hips.add(bones.spine);

    bones.spine1 = new THREE.Bone();
    bones.spine1.name = 'spine1';
    bones.spine1.position.set(0, 0.15 * heightScale, 0);
    bones.spine.add(bones.spine1);

    bones.spine2 = new THREE.Bone();
    bones.spine2.name = 'spine2';
    bones.spine2.position.set(0, 0.15 * heightScale, 0);
    bones.spine1.add(bones.spine2);

    // ========== 颈部和头部 ==========
    bones.neck = new THREE.Bone();
    bones.neck.name = 'neck';
    bones.neck.position.set(0, 0.18 * heightScale, 0.02);
    bones.spine2.add(bones.neck);

    bones.head = new THREE.Bone();
    bones.head.name = 'head';
    bones.head.position.set(0, 0.12 * heightScale, 0);
    bones.neck.add(bones.head);

    // ========== 左臂链 ==========
    const leftArmBones = this.createArmChain('left', heightScale);
    bones.leftShoulder = leftArmBones.shoulder;
    bones.leftUpperArm = leftArmBones.upperArm;
    bones.leftForearm = leftArmBones.forearm;
    bones.leftHand = leftArmBones.hand;
    bones.spine2.add(bones.leftShoulder);

    // ========== 右臂链 ==========
    const rightArmBones = this.createArmChain('right', heightScale);
    bones.rightShoulder = rightArmBones.shoulder;
    bones.rightUpperArm = rightArmBones.upperArm;
    bones.rightForearm = rightArmBones.forearm;
    bones.rightHand = rightArmBones.hand;
    bones.spine2.add(bones.rightShoulder);

    // ========== 左腿链 ==========
    const leftLegBones = this.createLegChain('left', heightScale);
    bones.leftUpperLeg = leftLegBones.upperLeg;
    bones.leftLowerLeg = leftLegBones.lowerLeg;
    bones.leftFoot = leftLegBones.foot;
    bones.leftToe = leftLegBones.toe;
    bones.hips.add(bones.leftUpperLeg);

    // ========== 右腿链 ==========
    const rightLegBones = this.createLegChain('right', heightScale);
    bones.rightUpperLeg = rightLegBones.upperLeg;
    bones.rightLowerLeg = rightLegBones.lowerLeg;
    bones.rightFoot = rightLegBones.foot;
    bones.rightToe = rightLegBones.toe;
    bones.hips.add(bones.rightUpperLeg);

    // 创建骨骼数组（用于 Skeleton）
    const boneList = this.getBoneList(bones.root);

    return {
      root: bones.root,
      bones: bones,
      boneList: boneList
    };
  }

  /**
   * 创建手臂骨骼链
   */
  static createArmChain(side, heightScale) {
    const isLeft = side === 'left';
    const sideMultiplier = isLeft ? -1 : 1;

    const bones = {};

    // 锁骨/肩膀
    bones.shoulder = new THREE.Bone();
    bones.shoulder.name = `${side}Shoulder`;
    bones.shoulder.position.set(sideMultiplier * 0.08, 0.15 * heightScale, 0);

    // 上臂
    bones.upperArm = new THREE.Bone();
    bones.upperArm.name = `${side}UpperArm`;
    bones.upperArm.position.set(sideMultiplier * 0.12, 0, 0);
    bones.shoulder.add(bones.upperArm);

    // 前臂
    bones.forearm = new THREE.Bone();
    bones.forearm.name = `${side}Forearm`;
    bones.forearm.position.set(0, -0.28 * heightScale, 0);
    bones.upperArm.add(bones.forearm);

    // 手
    bones.hand = new THREE.Bone();
    bones.hand.name = `${side}Hand`;
    bones.hand.position.set(0, -0.26 * heightScale, 0);
    bones.forearm.add(bones.hand);

    // 手指骨骼（简化版）
    bones.thumb = this.createFingerBone('thumb');
    bones.thumb.position.set(sideMultiplier * 0.02, -0.02, 0.02);
    bones.hand.add(bones.thumb);

    bones.indexFinger = this.createFingerBone('index');
    bones.indexFinger.position.set(sideMultiplier * 0.01, -0.03, 0);
    bones.hand.add(bones.indexFinger);

    bones.middleFinger = this.createFingerBone('middle');
    bones.middleFinger.position.set(0, -0.035, 0);
    bones.hand.add(bones.middleFinger);

    bones.ringFinger = this.createFingerBone('ring');
    bones.ringFinger.position.set(-sideMultiplier * 0.01, -0.03, 0);
    bones.hand.add(bones.ringFinger);

    bones.pinkyFinger = this.createFingerBone('pinky');
    bones.pinkyFinger.position.set(-sideMultiplier * 0.02, -0.025, 0);
    bones.hand.add(bones.pinkyFinger);

    return bones;
  }

  /**
   * 创建手指骨骼
   */
  static createFingerBone(name) {
    const bone = new THREE.Bone();
    bone.name = name;
    return bone;
  }

  /**
   * 创建腿部骨骼链
   */
  static createLegChain(side, heightScale) {
    const isLeft = side === 'left';
    const sideMultiplier = isLeft ? -1 : 1;

    const bones = {};

    // 大腿
    bones.upperLeg = new THREE.Bone();
    bones.upperLeg.name = `${side}UpperLeg`;
    bones.upperLeg.position.set(sideMultiplier * 0.08, -0.06 * heightScale, 0);

    // 小腿
    bones.lowerLeg = new THREE.Bone();
    bones.lowerLeg.name = `${side}LowerLeg`;
    bones.lowerLeg.position.set(0, -0.42 * heightScale, 0);
    bones.upperLeg.add(bones.lowerLeg);

    // 脚
    bones.foot = new THREE.Bone();
    bones.foot.name = `${side}Foot`;
    bones.foot.position.set(0, -0.42 * heightScale, 0);
    bones.lowerLeg.add(bones.foot);

    // 脚趾
    bones.toe = new THREE.Bone();
    bones.toe.name = `${side}Toe`;
    bones.toe.position.set(0, 0, 0.1);
    bones.foot.add(bones.toe);

    return bones;
  }

  /**
   * 递归获取骨骼列表
   */
  static getBoneList(root) {
    const list = [];

    function traverse(bone) {
      list.push(bone);
      bone.children.forEach(child => {
        if (child.isBone) {
          traverse(child);
        }
      });
    }

    traverse(root);
    return list;
  }

  /**
   * 创建骨骼辅助显示
   */
  static createSkeletonHelper(skeleton) {
    const helper = new THREE.SkeletonHelper(skeleton.bones[0]);
    helper.material.linewidth = 2;
    return helper;
  }

  /**
   * 获取骨骼默认姿态（用于动画重置）
   */
  static getBindPose(bones) {
    const pose = {};

    Object.keys(bones).forEach(name => {
      const bone = bones[name];
      pose[name] = {
        position: bone.position.clone(),
        rotation: bone.rotation.clone(),
        quaternion: bone.quaternion.clone()
      };
    });

    return pose;
  }

  /**
   * 重置骨骼到绑定姿态
   */
  static resetToBindPose(bones, bindPose) {
    Object.keys(bindPose).forEach(name => {
      if (bones[name]) {
        const pose = bindPose[name];
        bones[name].position.copy(pose.position);
        bones[name].rotation.copy(pose.rotation);
        bones[name].quaternion.copy(pose.quaternion);
      }
    });
  }

  /**
   * 创建简化骨骼（用于LOD）
   */
  static createSimpleSkeleton(options = {}) {
    const { height = 1.75 } = options;
    const heightScale = height / 1.75;

    const bones = {};

    // 根骨骼
    bones.root = new THREE.Bone();
    bones.root.name = 'root';

    // 脊柱（简化为单个骨骼）
    bones.spine = new THREE.Bone();
    bones.spine.name = 'spine';
    bones.spine.position.set(0, 0.98 * heightScale, 0);
    bones.root.add(bones.spine);

    // 头部
    bones.head = new THREE.Bone();
    bones.head.name = 'head';
    bones.head.position.set(0, 0.6 * heightScale, 0);
    bones.spine.add(bones.head);

    // 左臂
    bones.leftArm = new THREE.Bone();
    bones.leftArm.name = 'leftArm';
    bones.leftArm.position.set(-0.2, 0.45 * heightScale, 0);
    bones.spine.add(bones.leftArm);

    // 右臂
    bones.rightArm = new THREE.Bone();
    bones.rightArm.name = 'rightArm';
    bones.rightArm.position.set(0.2, 0.45 * heightScale, 0);
    bones.spine.add(bones.rightArm);

    // 左腿
    bones.leftLeg = new THREE.Bone();
    bones.leftLeg.name = 'leftLeg';
    bones.leftLeg.position.set(-0.08, 0, 0);
    bones.spine.add(bones.leftLeg);

    // 右腿
    bones.rightLeg = new THREE.Bone();
    bones.rightLeg.name = 'rightLeg';
    bones.rightLeg.position.set(0.08, 0, 0);
    bones.spine.add(bones.rightLeg);

    const boneList = this.getBoneList(bones.root);

    return {
      root: bones.root,
      bones: bones,
      boneList: boneList
    };
  }

  /**
   * 获取骨骼层级信息（用于调试）
   */
  static getSkeletonInfo(root, indent = 0) {
    let info = '  '.repeat(indent) + root.name;
    if (root.position) {
      info += ` [${root.position.x.toFixed(3)}, ${root.position.y.toFixed(3)}, ${root.position.z.toFixed(3)}]`;
    }
    info += '\n';

    root.children.forEach(child => {
      if (child.isBone) {
        info += this.getSkeletonInfo(child, indent + 1);
      }
    });

    return info;
  }
}