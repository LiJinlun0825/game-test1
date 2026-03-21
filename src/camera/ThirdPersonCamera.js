/**
 * 第三人称相机控制器
 * 跟随玩家，支持鼠标控制旋转
 */
export class ThirdPersonCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target; // 跟随目标（玩家）

    // 相机参数
    this.distance = 0;          // 默认第一人称，距离为0
    this.minDistance = 0;       // 最小距离（第一人称）
    this.maxDistance = 8;       // 最大距离
    this.height = 1.6;          // 相机高度偏移
    this.targetOffset = new THREE.Vector3(0, 1.6, 0); // 目标点偏移

    // 旋转角度
    this.yaw = 0;               // 水平旋转角度
    this.pitch = 0;             // 垂直旋转角度
    this.minPitch = -Math.PI / 2.2;  // 最小俯仰角（可看脚下）
    this.maxPitch = Math.PI / 2.5;   // 最大俯仰角

    // 灵敏度
    this.sensitivity = 0.002;
    this.adsSensitivity = 0.001;  // 瞄准时灵敏度

    // 平滑移动
    this.smoothness = 12;
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    // 碰撞检测
    this.collisionEnabled = true;
    this.collisionOffset = 0.3;

    // 视角模式 - 默认第一人称
    this.isFirstPerson = true;
    this.perspectiveTransition = 1;  // 1 = 第一人称
    this.transitionSpeed = 8;

    // 输入管理器引用
    this.inputManager = null;

    // 指针锁定
    this.pointerLocked = false;

    // 瞄准状态
    this.isAiming = false;

    // 视角摇晃
    this.bobTime = 0;
    this.bobAmount = 0;
  }

  /**
   * 设置输入管理器
   */
  setInputManager(inputManager) {
    this.inputManager = inputManager;

    // 绑定鼠标移动事件
    this.inputManager.on('onMouseMove', (e) => {
      if (this.pointerLocked) {
        this.handleMouseMovement(e);
      }
    });

    // 滚轮缩放相机距离
    this.inputManager.on('onWheel', (e) => {
      if (this.pointerLocked && !this.isFirstPerson) {
        this.distance += e.deltaY > 0 ? 0.5 : -0.5;
        this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
      }
    });
  }

  /**
   * 处理鼠标移动
   */
  handleMouseMovement(e) {
    const delta = this.inputManager.getMouseDelta();

    // 根据瞄准状态调整灵敏度
    const sens = this.isAiming ? this.adsSensitivity : this.sensitivity;

    this.yaw -= delta.x * sens;
    this.pitch -= delta.y * sens;

    // 限制俯仰角
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
  }

  /**
   * 切换视角
   */
  togglePerspective() {
    this.isFirstPerson = !this.isFirstPerson;

    // 切换到第三人称时设置默认距离
    if (!this.isFirstPerson && this.distance < 1) {
      this.distance = 4;
    }

    console.log(`视角切换: ${this.isFirstPerson ? '第一人称' : '第三人称'}, 距离: ${this.distance}`);
  }

  /**
   * 设置瞄准状态
   */
  setAiming(aiming) {
    this.isAiming = aiming;
  }

  /**
   * 更新相机
   */
  update(deltaTime) {
    if (!this.target) return;

    // 更新视角过渡
    const targetTransition = this.isFirstPerson ? 1 : 0;
    this.perspectiveTransition += (targetTransition - this.perspectiveTransition) * this.transitionSpeed * deltaTime;

    // 获取目标位置
    const targetPos = this.target.position.clone().add(this.targetOffset);

    // 计算相机位置
    let desiredPosition;
    let lookAtPoint;

    // 使用插值计算实际距离
    const actualDistance = THREE.MathUtils.lerp(this.distance, 0, this.perspectiveTransition);

    if (actualDistance < 0.3) {
      // 第一人称
      desiredPosition = targetPos.clone();

      // 视角摇晃效果（移动时）
      if (this.target.characterController?.isMoving && !this.isAiming) {
        const speed = this.target.characterController.moveSpeed;
        const bobIntensity = speed > 7 ? 0.04 : 0.02;
        this.bobTime += deltaTime * (speed > 7 ? 12 : 8);

        const bobX = Math.sin(this.bobTime) * bobIntensity * 0.5;
        const bobY = Math.abs(Math.sin(this.bobTime)) * bobIntensity;

        desiredPosition.x += bobX;
        desiredPosition.y += bobY;
      }

      // 根据相机旋转计算朝向
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      forward.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);

      lookAtPoint = targetPos.clone().add(forward.multiplyScalar(10));
    } else {
      // 第三人称
      // 计算相机偏移
      const offset = new THREE.Vector3(0, 0, actualDistance);

      // 应用俯仰角旋转
      offset.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);

      // 应用偏航角旋转
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      desiredPosition = targetPos.clone().add(offset);
      lookAtPoint = targetPos.clone().add(new THREE.Vector3(0, -0.3, 0));

      // 碰撞检测
      if (this.collisionEnabled) {
        desiredPosition = this.checkCollision(targetPos, desiredPosition);
      }
    }

    // 平滑移动
    const t = 1 - Math.exp(-this.smoothness * deltaTime);
    this.currentPosition.lerp(desiredPosition, t);
    this.currentLookAt.lerp(lookAtPoint, t);

    // 更新相机
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);

    // 更新角色朝向（跟随相机水平旋转）
    if (this.target.rotationY !== undefined) {
      // 平滑过渡角色朝向
      const targetRotation = this.yaw;
      let diff = targetRotation - this.target.rotationY;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.target.rotationY += diff * 5 * deltaTime;
    }

    // 隐藏/显示角色模型（第一人称时只隐藏头部，身体保持可见）
    if (this.target.modelGroup) {
      this.target.modelGroup.visible = true;

      if (this.perspectiveTransition > 0.5) {
        // 第一人称视角
        // 隐藏头部（相机在头部位置，避免穿模）
        if (this.target.modelParts && this.target.modelParts.head) {
          this.target.modelParts.head.visible = false;
        }
        // 隐藏头盔
        if (this.target.modelParts && this.target.modelParts.helmet) {
          this.target.modelParts.helmet.visible = false;
        }
        // 隐藏上半身手臂（避免遮挡视线）
        if (this.target.modelParts && this.target.modelParts.leftArm) {
          this.target.modelParts.leftArm.visible = false;
        }
        if (this.target.modelParts && this.target.modelParts.rightArm) {
          this.target.modelParts.rightArm.visible = false;
        }

        // 身体和腿部保持可见，恢复透明度
        this.target.modelGroup.traverse((child) => {
          if (child.material && child.material.opacity !== undefined) {
            child.material.opacity = 1;
          }
        });

      } else {
        // 第三人称视角 - 显示所有部位
        if (this.target.modelParts) {
          if (this.target.modelParts.head) this.target.modelParts.head.visible = true;
          if (this.target.modelParts.helmet) this.target.modelParts.helmet.visible = true;
          if (this.target.modelParts.leftArm) this.target.modelParts.leftArm.visible = true;
          if (this.target.modelParts.rightArm) this.target.modelParts.rightArm.visible = true;
        }

        this.target.modelGroup.traverse((child) => {
          if (child.material && child.material.opacity !== undefined) {
            child.material.opacity = 1;
          }
        });
      }
    }
  }

  /**
   * 碰撞检测
   */
  checkCollision(from, to) {
    // 简化版本：只检测直线碰撞
    const direction = to.clone().sub(from).normalize();
    const distance = from.distanceTo(to);

    // 使用射线检测（如果有场景引用）
    if (this.raycaster && this.scene) {
      this.raycaster.set(from, direction);
      this.raycaster.far = distance;

      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      if (intersects.length > 0 && intersects[0].distance < distance) {
        // 碰撞发生，将相机移动到碰撞点之前
        return from.clone().add(direction.multiplyScalar(intersects[0].distance - this.collisionOffset));
      }
    }

    return to;
  }

  /**
   * 设置场景引用（用于碰撞检测）
   */
  setScene(scene) {
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
  }

  /**
   * 获取相机前方向
   */
  getForward() {
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    return forward;
  }

  /**
   * 获取相机右方向
   */
  getRight() {
    const right = new THREE.Vector3(1, 0, 0);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    return right;
  }

  /**
   * 获取相机朝向角度
   */
  getYaw() {
    return this.yaw;
  }

  /**
   * 获取相机俯仰角
   */
  getPitch() {
    return this.pitch;
  }

  /**
   * 设置指针锁定状态
   */
  setPointerLocked(locked) {
    this.pointerLocked = locked;
  }

  /**
   * 设置相机距离
   */
  setDistance(distance) {
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, distance));
  }

  /**
   * 设置灵敏度
   */
  setSensitivity(sensitivity) {
    this.sensitivity = sensitivity;
  }

  /**
   * 重置相机
   */
  reset() {
    this.yaw = 0;
    this.pitch = 0;
    this.isFirstPerson = true;       // 默认第一人称
    this.perspectiveTransition = 1;  // 完全第一人称
    this.distance = 0;               // 距离为0
    this.bobTime = 0;
  }
}