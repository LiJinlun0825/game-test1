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

    // 回调
    this.onUpdate = null;
    this.onLateUpdate = null;
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
   * 低饱和度写实风格渲染配置
   */
  initThree() {
    // 创建场景
    this.scene = new THREE.Scene();
    // 低饱和度天空色 - 写实风格
    this.scene.background = new THREE.Color(0xB8B8B8);
    // 浓度雾效 - 增加大气感
    this.scene.fog = new THREE.FogExp2(0xC0C0C0, 0.0008);

    // 创建相机 - 75度FOV（经典FPS视野）
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      4000
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
    // ACES色调映射 + 低曝光
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;

    // 添加到DOM
    const container = document.getElementById('game-canvas');
    if (container) {
      container.appendChild(this.renderer.domElement);
    }
  }

  /**
   * 初始化灯光 - 低饱和度写实风格
   */
  initLights() {
    // 环境光 - 冷灰色
    const ambientLight = new THREE.AmbientLight(0xD0D5D8, 0.5);
    this.scene.add(ambientLight);

    // 方向光（太阳）- 暖色日光
    const sunLight = new THREE.DirectionalLight(0xFFF5E6, 1.2);
    sunLight.position.set(100, 150, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -200;
    sunLight.shadow.camera.right = 200;
    sunLight.shadow.camera.top = 200;
    sunLight.shadow.camera.bottom = -200;
    // 软阴影偏移
    sunLight.shadow.bias = -0.0001;
    this.scene.add(sunLight);

    // 半球光 - 天空冷色/地面暖色
    const hemiLight = new THREE.HemisphereLight(0xB0C4DE, 0x5C4033, 0.4);
    this.scene.add(hemiLight);

    // 填充光 - 柔和阴影填充
    const fillLight = new THREE.DirectionalLight(0xE8E8F0, 0.3);
    fillLight.position.set(-50, 80, -50);
    this.scene.add(fillLight);
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

    // 暂停时不更新
    if (this.isPaused) return;

    // 更新回调
    if (this.onUpdate) {
      this.onUpdate(this.deltaTime, this.elapsedTime);
    }

    // 更新输入管理器
    if (this.inputManager) {
      this.inputManager.update();
    }

    // 更新世界
    if (this.world) {
      this.world.update(this.deltaTime);
    }

    // 更新玩家
    if (this.player) {
      this.player.update(this.deltaTime);
    }

    // 后期更新回调
    if (this.onLateUpdate) {
      this.onLateUpdate(this.deltaTime, this.elapsedTime);
    }

    // 渲染
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

    // 清理场景中的对象
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