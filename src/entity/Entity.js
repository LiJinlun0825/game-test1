/**
 * 实体基类
 * 所有游戏对象的基类
 */
export class Entity {
  constructor(name = 'Entity') {
    this.id = Entity.nextId++;
    this.name = name;
    this.active = true;

    // Three.js 对象
    this.object3D = new THREE.Object3D();
    this.object3D.userData.entity = this;

    // 组件列表
    this.components = [];

    // 标签，用于快速查找
    this.tags = new Set();
  }

  /**
   * 添加组件
   */
  addComponent(component) {
    this.components.push(component);
    component.setEntity(this);
    return component;
  }

  /**
   * 获取组件
   */
  getComponent(componentClass) {
    return this.components.find(c => c instanceof componentClass);
  }

  /**
   * 获取所有组件
   */
  getComponents(componentClass) {
    return this.components.filter(c => c instanceof componentClass);
  }

  /**
   * 添加标签
   */
  addTag(tag) {
    this.tags.add(tag);
  }

  /**
   * 检查标签
   */
  hasTag(tag) {
    return this.tags.has(tag);
  }

  /**
   * 位置
   */
  get position() {
    return this.object3D.position;
  }

  set position(value) {
    this.object3D.position.copy(value);
  }

  /**
   * 旋转
   */
  get rotation() {
    return this.object3D.rotation;
  }

  set rotation(value) {
    this.object3D.rotation.copy(value);
  }

  /**
   * 缩放
   */
  get scale() {
    return this.object3D.scale;
  }

  set scale(value) {
    this.object3D.scale.copy(value);
  }

  /**
   * 初始化
   */
  init() {
    this.components.forEach(c => c.init());
  }

  /**
   * 更新
   */
  update(deltaTime) {
    if (!this.active) return;

    this.components.forEach(c => c.update(deltaTime));
  }

  /**
   * 固定更新（物理）
   */
  fixedUpdate(fixedDeltaTime) {
    if (!this.active) return;

    this.components.forEach(c => c.fixedUpdate && c.fixedUpdate(fixedDeltaTime));
  }

  /**
   * 销毁
   */
  destroy() {
    this.components.forEach(c => c.destroy && c.destroy());

    if (this.object3D.parent) {
      this.object3D.parent.remove(this.object3D);
    }
  }

  /**
   * 设置父节点
   */
  setParent(parent) {
    if (parent.object3D) {
      parent.object3D.add(this.object3D);
    }
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
}

// 静态ID计数器
Entity.nextId = 1;