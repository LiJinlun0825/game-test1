/**
 * 游戏引擎主类
 * 负责初始化Three.js场景、渲染器和管理游戏循环
 */
export class Engine {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = null;
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.isPaused = false;

    // 系统引用
    this.inputManager = null;
    this.world = null;
    this.player = null;

    // 光照
    this.ambientLight = null;
    this.sunLight = null;

    // 回调
    this.onUpdate = null;
  }

  /**
   * 初始化引擎
   */
  init() {
    this.initThree();
    this.initLights();
    this.initClock();
    this.onResize();
    window.addEventListener('resize', () => this.onResize());
    console.log('Engine initialized');
  }

  /**
   * 初始化Three.js
   */
  initThree() {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // 天空蓝
    this.scene.fog = new THREE.FogExp2(0xC0C0C0, 0.004);

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 添加到DOM
    const container = document.getElementById('game-canvas');
    if (container) {
      container.appendChild(this.renderer.domElement);
    }
  }

  /**
   * 初始化灯光
   */
  initLights() {
    // 环境光
    this.ambientLight = new THREE.AmbientLight(0xD0D5D8, 0.5);
    this.scene.add(this.ambientLight);

    // 方向光（太阳）
    this.sunLight = new THREE.DirectionalLight(0xFFF5E6, 1.2);
    this.sunLight.position.set(100, 150, 50);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 500;
    this.sunLight.shadow.camera.left = -200;
    this.sunLight.shadow.camera.right = 200;
    this.sunLight.shadow.camera.top = 200;
    this.sunLight.shadow.camera.bottom = -200;
    this.scene.add(this.sunLight);

    // 半球光
    const hemiLight = new THREE.HemisphereLight(0xB0C4DE, 0x5C4033, 0.4);
    this.scene.add(hemiLight);
  }

  /**
   * 初始化时钟
   */
  initClock() {
    this.clock = new THREE.Clock();
  }

  /**
   * 窗口大小调整
   */
  onResize() {
    if (!this.camera || !this.renderer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * 启动游戏循环
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.clock.start();
    this.gameLoop();
  }

  /**
   * 停止游戏循环
   */
  stop() {
    this.isRunning = false;
    this.clock.stop();
  }

  /**
   * 暂停游戏
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * 恢复游戏
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * 游戏主循环
   */
  gameLoop() {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.gameLoop());

    this.deltaTime = this.clock.getDelta();
    this.elapsedTime = this.clock.getElapsedTime();

    if (this.isPaused) return;

    // 更新世界
    if (this.world) {
      this.world.update(this.deltaTime);
    }

    // 更新玩家
    if (this.player) {
      this.player.update(this.deltaTime);
    }

    // 更新回调（包含相机更新，需要使用鼠标移动数据）
    if (this.onUpdate) {
      this.onUpdate(this.deltaTime, this.elapsedTime);
    }

    // 渲染
    this.render();

    // 最后清零输入状态，为下一帧准备
    if (this.inputManager) {
      this.inputManager.update();
    }
  }

  /**
   * 渲染
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 获取场景
   */
  getScene() {
    return this.scene;
  }

  /**
   * 获取相机
   */
  getCamera() {
    return this.camera;
  }

  /**
   * 获取渲染器
   */
  getRenderer() {
    return this.renderer;
  }

  /**
   * 清理资源
   */
  dispose() {
    this.stop();
    window.removeEventListener('resize', this.onResize);

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
  }
}