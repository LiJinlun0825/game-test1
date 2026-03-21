/**
 * 输入管理器
 * 处理键盘、鼠标输入
 */
export class InputManager {
  constructor() {
    // 键盘状态
    this.keys = {};
    this.keysPressed = {};
    this.keysReleased = {};

    // 鼠标状态
    this.mouse = {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
      buttons: [false, false, false], // 左、中、右
      wheel: 0
    };

    // 鼠标锁定状态
    this.isPointerLocked = false;

    // 绑定的回调
    this.callbacks = {
      onKeyDown: [],
      onKeyUp: [],
      onMouseDown: [],
      onMouseUp: [],
      onMouseMove: [],
      onWheel: []
    };
  }

  /**
   * 初始化输入管理器
   */
  init() {
    this.bindEvents();
    console.log('InputManager initialized');
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 键盘事件
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));

    // 鼠标事件
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));
    document.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    // 指针锁定事件
    document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    document.addEventListener('pointerlockerror', () => this.onPointerLockError());
  }

  /**
   * 请求指针锁定
   */
  requestPointerLock() {
    const element = document.body;
    element.requestPointerLock = element.requestPointerLock ||
                                  element.mozRequestPointerLock ||
                                  element.webkitRequestPointerLock;
    element.requestPointerLock();
  }

  /**
   * 退出指针锁定
   */
  exitPointerLock() {
    document.exitPointerLock = document.exitPointerLock ||
                               document.mozExitPointerLock ||
                               document.webkitExitPointerLock;
    document.exitPointerLock();
  }

  /**
   * 指针锁定状态改变
   */
  onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement !== null ||
                           document.mozPointerLockElement !== null ||
                           document.webkitPointerLockElement !== null;
  }

  /**
   * 指针锁定错误
   */
  onPointerLockError() {
    console.error('Pointer lock failed');
  }

  /**
   * 键盘按下
   */
  onKeyDown(e) {
    const code = e.code;

    // 防止重复触发
    if (!this.keys[code]) {
      this.keysPressed[code] = true;
    }

    this.keys[code] = true;

    // 触发回调
    this.callbacks.onKeyDown.forEach(cb => cb(e));
  }

  /**
   * 键盘释放
   */
  onKeyUp(e) {
    const code = e.code;

    this.keys[code] = false;
    this.keysReleased[code] = true;

    // 触发回调
    this.callbacks.onKeyUp.forEach(cb => cb(e));
  }

  /**
   * 鼠标移动
   */
  onMouseMove(e) {
    // 更新绝对位置
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    // 更新增量（指针锁定模式下使用movementX/Y）
    if (this.isPointerLocked) {
      this.mouse.deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
      this.mouse.deltaY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
    } else {
      this.mouse.deltaX = 0;
      this.mouse.deltaY = 0;
    }

    // 触发回调
    this.callbacks.onMouseMove.forEach(cb => cb(e));
  }

  /**
   * 鼠标按下
   */
  onMouseDown(e) {
    this.mouse.buttons[e.button] = true;

    // 触发回调
    this.callbacks.onMouseDown.forEach(cb => cb(e));
  }

  /**
   * 鼠标释放
   */
  onMouseUp(e) {
    this.mouse.buttons[e.button] = false;

    // 触发回调
    this.callbacks.onMouseUp.forEach(cb => cb(e));
  }

  /**
   * 鼠标滚轮
   */
  onWheel(e) {
    e.preventDefault();
    this.mouse.wheel = e.deltaY;

    // 触发回调
    this.callbacks.onWheel.forEach(cb => cb(e));
  }

  /**
   * 检查按键是否被按住
   */
  isKeyHeld(code) {
    return this.keys[code] === true;
  }

  /**
   * 检查按键是否刚被按下
   */
  isKeyPressed(code) {
    return this.keysPressed[code] === true;
  }

  /**
   * 检查按键是否刚被释放
   */
  isKeyReleased(code) {
    return this.keysReleased[code] === true;
  }

  /**
   * 检查鼠标按钮是否被按住
   * @param {number} button - 0: 左键, 1: 中键, 2: 右键
   */
  isMouseButtonHeld(button) {
    return this.mouse.buttons[button] === true;
  }

  /**
   * 获取鼠标增量
   */
  getMouseDelta() {
    return {
      x: this.mouse.deltaX,
      y: this.mouse.deltaY
    };
  }

  /**
   * 获取移动输入向量
   * @returns {Object} { x: -1到1, z: -1到1 }
   */
  getMovementInput() {
    let x = 0;
    let z = 0;

    // WASD 移动
    if (this.isKeyHeld('KeyW') || this.isKeyHeld('ArrowUp')) z -= 1;
    if (this.isKeyHeld('KeyS') || this.isKeyHeld('ArrowDown')) z += 1;
    if (this.isKeyHeld('KeyA') || this.isKeyHeld('ArrowLeft')) x -= 1;
    if (this.isKeyHeld('KeyD') || this.isKeyHeld('ArrowRight')) x += 1;

    // 归一化对角线移动
    const length = Math.sqrt(x * x + z * z);
    if (length > 0) {
      x /= length;
      z /= length;
    }

    return { x, z };
  }

  /**
   * 是否在冲刺
   */
  isSprinting() {
    return this.isKeyHeld('ShiftLeft') || this.isKeyHeld('ShiftRight');
  }

  /**
   * 是否蹲伏
   */
  isCrouching() {
    return this.isKeyHeld('KeyC');
  }

  /**
   * 是否趴下
   */
  isProne() {
    return this.isKeyHeld('KeyZ');
  }

  /**
   * 是否跳跃
   */
  isJumping() {
    return this.isKeyPressed('Space');
  }

  /**
   * 每帧更新 - 清除单帧状态
   */
  update() {
    // 清除按下单帧状态
    this.keysPressed = {};
    this.keysReleased = {};

    // 清除鼠标增量
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    this.mouse.wheel = 0;
  }

  /**
   * 注册回调
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  /**
   * 移除回调
   */
  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  /**
   * 清理
   */
  dispose() {
    // 这里不需要移除事件监听器，因为是全局的
  }
}