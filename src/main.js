/**
 * 大逃杀游戏主入口
 * 整合所有模块，初始化游戏
 * 纯第一人称射击游戏
 */
import { Engine } from './core/Engine.js';
import { InputManager } from './core/InputManager.js';
import { Player } from './entity/Player.js';
import { Enemy } from './entity/Enemy.js';
import { FirstPersonCamera } from './camera/FirstPersonCamera.js';
import { World } from './world/World.js';
import { AudioManager } from '../js/audio/audio.js';
import { GameState } from '../js/game/state.js';

/**
 * 大逃杀游戏类
 */
class BattleRoyaleGame {
  constructor() {
    // 核心系统
    this.engine = null;
    this.inputManager = null;
    this.audioManager = null;
    this.gameState = null;

    // 游戏对象
    this.player = null;
    this.world = null;
    this.cameraController = null;
    this.enemies = [];

    // UI元素
    this.screens = {};
    this.elements = {};

    // 游戏数据
    this.killCount = 0;
    this.aliveCount = 100;
    this.gameStartTime = 0;
    this.surviveTime = 0;

    // 指针锁定
    this.isPointerLocked = false;
  }

  /**
   * 初始化游戏
   */
  async init() {
    this.updateLoadingProgress(10, '初始化引擎...');

    // 创建引擎
    this.engine = new Engine();
    this.engine.init();

    this.updateLoadingProgress(20, '初始化输入系统...');

    // 创建输入管理器
    this.inputManager = new InputManager();
    this.inputManager.init();

    this.updateLoadingProgress(30, '初始化音频系统...');

    // 创建音频管理器
    this.audioManager = new AudioManager();
    this.audioManager.init();

    this.updateLoadingProgress(40, '创建游戏状态...');

    // 创建游戏状态
    this.gameState = new GameState();

    this.updateLoadingProgress(50, '创建世界...');

    // 创建世界
    this.world = new World();
    this.world.init(this.engine.getScene());

    this.updateLoadingProgress(70, '创建玩家...');

    // 创建玩家
    this.player = new Player();
    this.player.init();
    this.player.addToScene(this.engine.getScene());

    // 设置角色控制器引用
    this.player.characterController.setInputManager(this.inputManager);

    // 设置武器控制器引用
    this.player.weaponController.setInputManager(this.inputManager);
    this.player.weaponController.setAudioManager(this.audioManager);

    // 给玩家默认武器和弹药
    this.player.weaponController.pickupWeapon('m4a1');
    this.player.weaponController.addAmmo('5.56mm', 90);

    // 设置玩家在世界中的位置
    this.player.position.set(0, this.world.getHeightAt(0, 0), 0);
    this.world.setPlayer(this.player);

    // 设置世界引用给武器控制器（用于命中检测）
    this.player.weaponController.setWorld(this.world);

    this.updateLoadingProgress(80, '设置相机...');

    // 创建第一人称相机控制器
    this.cameraController = new FirstPersonCamera(
      this.engine.getCamera(),
      this.player
    );
    this.cameraController.setInputManager(this.inputManager);

    // 保存相机控制器引用给玩家
    this.player.cameraController = this.cameraController;

    this.updateLoadingProgress(90, '初始化UI...');

    // 初始化UI
    this.initUI();

    // 绑定事件
    this.bindEvents();

    // 创建敌人
    this.updateLoadingProgress(95, '生成敌人...');
    this.createEnemies(5);

    // 设置引擎更新回调
    this.engine.inputManager = this.inputManager;
    this.engine.world = this.world;
    this.engine.player = this.player;

    this.engine.onUpdate = (deltaTime, elapsedTime) => {
      this.update(deltaTime, elapsedTime);
    };

    this.updateLoadingProgress(100, '准备就绪');

    // 隐藏加载屏幕
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
    }, 500);

    console.log('Battle Royale Game initialized');
  }

  /**
   * 更新加载进度
   */
  updateLoadingProgress(percent, text) {
    const progressBar = document.getElementById('loading-progress');
    const loadingText = document.getElementById('loading-text');

    if (progressBar) {
      progressBar.style.width = percent + '%';
    }
    if (loadingText) {
      loadingText.textContent = text;
    }
  }

  /**
   * 初始化UI
   */
  initUI() {
    // 保存屏幕引用
    this.screens = {
      menu: document.getElementById('menu-screen'),
      game: document.getElementById('game-screen'),
      pause: document.getElementById('pause-screen'),
      gameover: document.getElementById('gameover-screen'),
      help: document.getElementById('help-screen')
    };

    // 保存元素引用
    this.elements = {
      aliveCount: document.getElementById('alive-count'),
      killCount: document.getElementById('kill-count'),
      surviveTime: document.getElementById('survive-time'),
      healthFill: document.getElementById('health-fill'),
      energyFill: document.getElementById('energy-fill'),
      crosshair: document.getElementById('crosshair'),
      // 武器槽位
      slot1: document.getElementById('slot1'),
      slot2: document.getElementById('slot2'),
      slot3: document.getElementById('slot3'),
      // 当前武器详情
      currentAmmo: document.getElementById('current-ammo'),
      reserveAmmo: document.getElementById('reserve-ammo'),
      fireMode: document.getElementById('fire-mode')
    };
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 菜单按钮
    document.getElementById('start-btn')?.addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('help-btn')?.addEventListener('click', () => {
      this.showScreen('help');
    });

    document.getElementById('help-back-btn')?.addEventListener('click', () => {
      this.showScreen('menu');
    });

    document.getElementById('settings-btn')?.addEventListener('click', () => {
      // TODO: 实现设置界面
      console.log('Settings button clicked');
    });

    // 游戏中按钮
    document.getElementById('end-game-btn')?.addEventListener('click', () => {
      this.endGame();
    });

    document.getElementById('resume-btn')?.addEventListener('click', () => {
      this.resumeGame();
    });

    document.getElementById('quit-btn')?.addEventListener('click', () => {
      this.quitToMenu();
    });

    document.getElementById('restart-btn')?.addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('menu-btn')?.addEventListener('click', () => {
      this.quitToMenu();
    });

    // 指针锁定
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement !== null;
      this.cameraController.setPointerLocked(this.isPointerLocked);

      // 显示/隐藏准星
      const crosshair = document.getElementById('crosshair');
      if (crosshair) {
        crosshair.style.display = this.isPointerLocked ? 'block' : 'none';
      }

      // 更新鼠标光标
      document.body.style.cursor = this.isPointerLocked ? 'none' : 'default';
    });

    // 点击游戏区域请求指针锁定
    document.addEventListener('click', (e) => {
      if (this.gameState.is('playing') && !this.isPointerLocked &&
          !e.target.closest('button') && !e.target.closest('.screen:not(#game-screen)')) {
        this.inputManager.requestPointerLock();
      }
    });

    // 鼠标移动时更新准星位置（非锁定模式下）
    document.addEventListener('mousemove', (e) => {
      if (this.gameState.is('playing') && !this.isPointerLocked) {
        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
          crosshair.style.left = e.clientX + 'px';
          crosshair.style.top = e.clientY + 'px';
          crosshair.style.transform = 'translate(-50%, -50%)';
        }
      }
    });

    // ESC键暂停
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.gameState.is('playing')) {
          this.pauseGame();
        } else if (this.gameState.is('paused')) {
          this.resumeGame();
        }
      }
    });
  }

  /**
   * 更新视角UI - 纯第一人称
   */
  updatePerspectiveUI() {
    const crosshair = document.getElementById('crosshair');

    if (crosshair) {
      crosshair.classList.add('first-person');
    }

    // 更新武器模型位置
    if (this.player && this.player.weaponController) {
      this.player.weaponController.updateWeaponModel();
    }
  }

  /**
   * 开始游戏
   */
  startGame() {
    console.log('Starting game...');

    // 重置游戏状态
    this.killCount = 0;
    this.gameStartTime = Date.now();

    // 重置玩家
    this.player.position.set(0, this.world.getHeightAt(0, 0), 0);
    this.player.health.reset();

    // 重置玩家武器
    this.player.weaponController.pickupWeapon('m4a1');
    this.player.weaponController.addAmmo('5.56mm', 90);

    // 重置相机为第一人称
    this.cameraController.reset();
    this.updatePerspectiveUI();

    // 重置或创建敌人
    if (this.enemies.length === 0) {
      this.createEnemies(5);
    } else {
      // 重置现有敌人
      this.enemies.forEach((enemy, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 200;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const y = this.world.getHeightAt(x, z);

        enemy.position.set(x, y, z);
        enemy.health.reset();
        enemy.active = true;
        enemy.modelGroup.rotation.x = 0;
        enemy.modelGroup.position.y = 0;
        enemy.aiController.setState('patrol');
      });
      this.aliveCount = this.enemies.length + 1;
    }

    // 显示游戏屏幕
    this.showScreen('game');
    document.body.classList.add('playing');

    // 设置游戏状态
    this.gameState.setState('playing');

    // 请求指针锁定
    setTimeout(() => {
      this.inputManager.requestPointerLock();
    }, 100);

    // 启动游戏循环
    this.engine.start();

    // 播放游戏开始音效
    this.audioManager.playGameStart();
  }

  /**
   * 暂停游戏
   */
  pauseGame() {
    this.gameState.setState('paused');
    this.engine.pause();
    this.showScreen('pause');
    this.inputManager.exitPointerLock();
  }

  /**
   * 恢复游戏
   */
  resumeGame() {
    this.gameState.setState('playing');
    this.engine.resume();
    this.showScreen('game');
    this.inputManager.requestPointerLock();
  }

  /**
   * 结束游戏
   */
  endGame(isVictory = false) {
    this.gameState.setState('gameover');
    this.engine.pause();
    this.inputManager.exitPointerLock();

    // 更新结果面板
    const rank = isVictory ? 1 : this.aliveCount;
    document.getElementById('final-rank').textContent = '#' + rank;
    document.getElementById('final-kills').textContent = this.killCount;
    document.getElementById('final-damage').textContent = Math.floor(Math.random() * 500);
    document.getElementById('final-time').textContent = this.formatTime(this.surviveTime);

    // 更新标题
    const title = document.querySelector('#gameover-screen .neon-title');
    if (title) {
      title.textContent = isVictory ? '大吉大利，今晚吃鸡！' : '游戏结束';
    }

    this.showScreen('gameover');
    document.body.classList.remove('playing');

    // 播放游戏结束音效
    if (isVictory) {
      this.audioManager.playLevelUp();
    } else {
      this.audioManager.playGameOver();
    }
  }

  /**
   * 退出到菜单
   */
  quitToMenu() {
    this.gameState.setState('menu');
    this.engine.stop();
    this.showScreen('menu');
    document.body.classList.remove('playing');
  }

  /**
   * 显示指定屏幕
   */
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.classList.remove('active');
    });

    if (this.screens[screenName]) {
      this.screens[screenName].classList.add('active');
    }
  }

  /**
   * 创建敌人
   */
  createEnemies(count) {
    const scene = this.engine.getScene();

    for (let i = 0; i < count; i++) {
      const enemy = new Enemy();
      enemy.init();

      // 随机位置（在玩家周围100-300米范围内）
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 200;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = this.world.getHeightAt(x, z);

      enemy.position.set(x, y, z);
      enemy.addToScene(scene);

      // 初始化AI
      enemy.initAI(this.world, this.player);

      // 设置武器控制器的世界引用
      enemy.weaponController.setWorld(this.world);

      this.enemies.push(enemy);
    }

    // 设置敌人列表到世界
    this.world.enemies = this.enemies;

    this.aliveCount = count + 1; // 敌人数量 + 玩家
    console.log(`Created ${count} enemies`);
  }

  /**
   * 游戏更新
   */
  update(deltaTime, elapsedTime) {
    if (!this.gameState.is('playing')) return;

    // 更新存活时间
    this.surviveTime = (Date.now() - this.gameStartTime) / 1000;

    // 更新相机
    this.cameraController.update(deltaTime);

    // 更新玩家地面高度
    const groundHeight = this.world.getHeightAt(
      this.player.position.x,
      this.player.position.z
    );
    this.player.characterController.setGroundY(groundHeight);

    // 更新敌人
    this.updateEnemies(deltaTime);

    // 更新UI
    this.updateUI();
  }

  /**
   * 更新敌人
   */
  updateEnemies(deltaTime) {
    let aliveCount = 1; // 玩家

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (!enemy.isDead()) {
        enemy.update(deltaTime);
        aliveCount++;
      } else {
        // 检查是否是新击杀
        if (enemy.active) {
          this.killCount++;
          enemy.active = false;
        }
      }
    }

    // 更新存活人数
    this.aliveCount = aliveCount;

    // 检查胜利条件
    if (aliveCount === 1) {
      // 只有玩家存活
      this.endGame(true);
    }
  }

  /**
   * 更新UI
   */
  updateUI() {
    // 更新存活时间
    if (this.elements.surviveTime) {
      this.elements.surviveTime.textContent = this.formatTime(this.surviveTime);
    }

    // 更新击杀数
    if (this.elements.killCount) {
      this.elements.killCount.textContent = this.killCount;
    }

    // 更新存活人数
    if (this.elements.aliveCount) {
      this.elements.aliveCount.textContent = this.aliveCount;
    }

    // 更新生命值和警告
    const healthPercent = this.player.health.getHealthPercent();
    if (this.elements.healthFill) {
      this.elements.healthFill.style.width = (healthPercent * 100) + '%';

      // 低血量时改变颜色
      if (healthPercent < 0.3) {
        this.elements.healthFill.style.background = 'linear-gradient(90deg, #FF4444, #FF6666)';
      } else if (healthPercent < 0.5) {
        this.elements.healthFill.style.background = 'linear-gradient(90deg, #FFAA00, #FFCC00)';
      } else {
        this.elements.healthFill.style.background = '';
      }
    }

    // 血量警告
    const healthWarning = document.getElementById('health-warning');
    if (healthPercent < 0.25) {
      healthWarning?.classList.add('show');
      document.body.classList.add('low-health');
    } else {
      healthWarning?.classList.remove('show');
      document.body.classList.remove('low-health');
    }

    // 更新武器UI
    this.updateWeaponUI();
  }

  /**
   * 更新武器UI
   */
  updateWeaponUI() {
    const wc = this.player.weaponController;
    const currentWeapon = wc.getCurrentWeapon();

    // 更新武器槽位
    for (let i = 0; i < 3; i++) {
      const slotElement = this.elements[`slot${i + 1}`];
      if (!slotElement) continue;

      const weapon = wc.weapons[i];
      const isActive = wc.currentSlot === i;

      slotElement.classList.toggle('active', isActive);

      const nameEl = slotElement.querySelector('.weapon-name');
      const ammoEl = slotElement.querySelector('.ammo-count');

      if (weapon) {
        if (nameEl) nameEl.textContent = weapon.name;
        if (ammoEl) {
          ammoEl.textContent = `${weapon.currentAmmo}/${weapon.magazineSize}`;
        }
        // 换弹状态
        slotElement.classList.toggle('reloading', weapon.isReloading);
        const reloadBar = slotElement.querySelector('.reload-bar');
        if (reloadBar && weapon.isReloading) {
          reloadBar.style.width = (weapon.getReloadProgress() * 100) + '%';
        }

        // 低弹药警告颜色
        if (isActive && weapon.currentAmmo <= weapon.magazineSize * 0.25) {
          slotElement.classList.add('low-ammo');
        } else {
          slotElement.classList.remove('low-ammo');
        }
      } else {
        if (nameEl) nameEl.textContent = '空';
        if (ammoEl) ammoEl.textContent = '';
      }
    }

    // 更新当前武器详情
    if (currentWeapon) {
      if (this.elements.currentAmmo) {
        this.elements.currentAmmo.textContent = currentWeapon.currentAmmo;

        // 低弹药警告颜色
        if (currentWeapon.currentAmmo <= currentWeapon.magazineSize * 0.25) {
          this.elements.currentAmmo.style.color = '#FF4444';
        } else {
          this.elements.currentAmmo.style.color = '';
        }
      }
      if (this.elements.reserveAmmo) {
        this.elements.reserveAmmo.textContent = currentWeapon.reserveAmmo;
      }
      if (this.elements.fireMode) {
        this.elements.fireMode.textContent = currentWeapon.type.toUpperCase();
      }

      // 低弹药警告显示
      const lowAmmoWarning = document.getElementById('low-ammo-warning');
      if (currentWeapon.currentAmmo <= 5 && !currentWeapon.isReloading) {
        lowAmmoWarning?.classList.add('show');
      } else {
        lowAmmoWarning?.classList.remove('show');
      }

      // 换弹提示
      const reloadIndicator = document.getElementById('reload-indicator');
      if (currentWeapon.isReloading) {
        reloadIndicator?.classList.add('show');
      } else {
        reloadIndicator?.classList.remove('show');
      }
    }
  }

  /**
   * 格式化时间
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
  }

  /**
   * 清理
   */
  dispose() {
    this.engine.dispose();
    this.inputManager.dispose();
  }
}

// 初始化游戏
const game = new BattleRoyaleGame();
game.init().catch(error => {
  console.error('Failed to initialize game:', error);
});

// 导出游戏实例
export { game };