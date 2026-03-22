/**
 * 实体基类
 * 所有游戏实体的基础类
 */
export class Entity {
  constructor() {
    this.id = Entity.generateId();
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0);
    this.object3D = new THREE.Object3D();
    this.active = true;
  }

  /**
   * 生成唯一ID
   */
  static generateId() {
    return 'entity_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 初始化
   */
  init() {
    // 子类实现
  }

  /**
   * 更新
   */
  update(deltaTime) {
    // 同步Object3D位置
    this.object3D.position.copy(this.position);
    this.object3D.rotation.copy(this.rotation);
  }

  /**
   * 添加到场景
   */
  addToScene(scene) {
    scene.add(this.object3D);
  }

  /**
   * 从场景移除
   */
  removeFromScene(scene) {
    scene.remove(this.object3D);
  }

  /**
   * 设置位置
   */
  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.object3D.position.set(x, y, z);
  }

  /**
   * 设置旋转
   */
  setRotation(x, y, z) {
    this.rotation.set(x, y, z);
    this.object3D.rotation.set(x, y, z);
  }

  /**
   * 获取前方向
   */
  getForward() {
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.object3D.quaternion);
    return forward;
  }

  /**
   * 获取右方向
   */
  getRight() {
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(this.object3D.quaternion);
    return right;
  }

  /**
   * 获取到目标的方向
   */
  getDirectionTo(target) {
    return new THREE.Vector3()
      .subVectors(target.position, this.position)
      .normalize();
  }

  /**
   * 获取到目标的距离
   */
  getDistanceTo(target) {
    return this.position.distanceTo(target.position);
  }

  /**
   * 看向目标
   */
  lookAt(target) {
    this.object3D.lookAt(target.position);
    this.rotation.copy(this.object3D.rotation);
  }

  /**
   * 清理
   */
  dispose() {
    // 清理Object3D
    this.object3D.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}