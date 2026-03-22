/**
 * 大逃杀游戏主入口
 */
import { Engine } from './core/Engine.js';
import { InputManager } from './core/InputManager.js';
import { Player } from './entity/Player.js';
import { Enemy } from './entity/Enemy.js';
import { FirstPersonCamera } from './camera/FirstPersonCamera.js';
import { World } from './world/World.js';

/**
 * 游戏状态管理
 */
class GameState {
  constructor() {
    this.current = 'menu';
    this.validStates = ['menu', 'playing', 'paused', 'gameover'];
  }

  setState(state) {
    if (this.validStates.includes(state)) {
      this.current = state;
    }
  }

  is(state) {
    return this.current === state;
  }
}

/**
 * 大逃杀游戏类
 */
class BattleRoyaleGame {
  constructor() {
    this.engine = null;
    this.inputManager = null;
    this.gameState = null;
    this.player = null;
    this.world = null;
    this.cameraController = null;
    this.enemies = [];

    this.killCount = 0;
    this.aliveCount = 21;
    this.gameStartTime = 0;
    this.surviveTime = 0;

    this.screens = {};
    this.elements = {};
  }

  /**
   * 初始化游戏
   */
  async init() {
    console.log('Initializing game...');

    try {
      this.updateLoadingProgress(10, '创建引擎...');
      this.engine = new Engine();
      this.engine.init();

      this.updateLoadingProgress(20, '创建输入系统...');
      this.inputManager = new InputManager();
      this.inputManager.init();

      this.updateLoadingProgress(30, '创建游戏状态...');
      this.gameState = new GameState();

      this.updateLoadingProgress(40, '创建世界...');
      this.world = new World();
      this.world.init(this.engine.getScene());

      this.updateLoadingProgress(60, '创建玩家...');
      this.player = new Player();
      this.player.init();
      this.player.addToScene(this.engine.getScene());
      this.player.characterController.setInputManager(this.inputManager);
      this.player.weaponController.setInputManager(this.inputManager);
      this.player.weaponController.setWorld(this.world);
      this.player.weaponController.pickupWeapon('m4a1');
      this.player.position.set(0, 0, 0);
      this.world.setPlayer(this.player);

      this.updateLoadingProgress(80, '创建相机...');
      this.cameraController = new FirstPersonCamera(
        this.engine.getCamera(),
        this.player
      );
      this.cameraController.setInputManager(this.inputManager);
      this.player.cameraController = this.cameraController;

      this.updateLoadingProgress(90, '初始化UI...');
      this.initUI();
      this.bindEvents();

      this.updateLoadingProgress(95, '创建敌人...');
      this.createEnemies(5);

      this.engine.inputManager = this.inputManager;
      this.engine.world = this.world;
      this.engine.player = this.player;
      this.engine.onUpdate = (dt, et) => this.update(dt, et);

      this.updateLoadingProgress(100, '准备就绪');

      setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.classList.add('hidden');
      }, 500);

      console.log('Game initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
      throw error;
    }
  }

  updateLoadingProgress(percent, text) {
    const bar = document.getElementById('loading-progress');
    const label = document.getElementById('loading-text');
    if (bar) bar.style.width = percent + '%';
    if (label) label.textContent = text;
  }

  initUI() {
    this.screens = {
      menu: document.getElementById('menu-screen'),
      game: document.getElementById('game-screen'),
      pause: document.getElementById('pause-screen'),
      gameover: document.getElementById('gameover-screen'),
      help: document.getElementById('help-screen')
    };

    this.elements = {
      aliveCount: document.getElementById('alive-count'),
      killCount: document.getElementById('kill-count'),
      surviveTime: document.getElementById('survive-time'),
      healthFill: document.getElementById('health-fill'),
      healthValue: document.getElementById('health-value'),
      minimapCanvas: document.getElementById('minimap-canvas')
    };

    this.minimapCtx = this.elements.minimapCanvas?.getContext('2d');
  }

  bindEvents() {
    document.getElementById('start-btn')?.addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('help-btn')?.addEventListener('click', () => {
      this.showScreen('help');
    });

    document.getElementById('help-back-btn')?.addEventListener('click', () => {
      if (this.gameState.is('playing')) {
        // 从游戏中查看帮助，返回游戏
        this.showScreen('game');
        this.engine.resume();
        this.inputManager.requestPointerLock();
      } else {
        // 从菜单查看帮助，返回菜单
        this.showScreen('menu');
      }
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

    document.getElementById('exit-game-btn')?.addEventListener('click', () => {
      this.pauseGame();
    });

    document.getElementById('in-game-help-btn')?.addEventListener('click', () => {
      this.showInGameHelp();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.gameState.is('playing')) {
          this.pauseGame();
        } else if (this.gameState.is('paused')) {
          this.resumeGame();
        }
      }
    });

    document.addEventListener('pointerlockchange', () => {
      const crosshair = document.getElementById('crosshair');
      if (crosshair) {
        crosshair.style.display = document.pointerLockElement ? 'block' : 'none';
      }
    });
  }

  startGame() {
    console.log('Starting game...');
    this.killCount = 0;
    this.gameStartTime = Date.now();

    const x = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    this.player.position.set(x, 0, z);
    this.player.health.reset();

    if (this.enemies.length === 0) {
      this.createEnemies(20);
    } else {
      this.enemies.forEach(enemy => {
        const ex = (Math.random() - 0.5) * 400;
        const ez = (Math.random() - 0.5) * 400;
        enemy.position.set(ex, 0, ez);
        enemy.health.reset();
        enemy.active = true;
      });
      this.aliveCount = this.enemies.length + 1;
    }

    this.showScreen('game');
    this.gameState.setState('playing');
    this.cameraController.reset();

    setTimeout(() => {
      this.inputManager.requestPointerLock();
    }, 100);

    this.engine.start();
  }

  pauseGame() {
    this.gameState.setState('paused');
    this.engine.pause();
    this.showScreen('pause');
    this.inputManager.exitPointerLock();
  }

  showInGameHelp() {
    this.engine.pause();
    this.inputManager.exitPointerLock();
    // 显示帮助屏幕但不改变游戏状态
    Object.values(this.screens).forEach(s => s?.classList.remove('active'));
    this.screens.help?.classList.add('active');
  }

  resumeGame() {
    this.gameState.setState('playing');
    this.engine.resume();
    this.showScreen('game');
    this.inputManager.requestPointerLock();
  }

  endGame(isVictory) {
    this.gameState.setState('gameover');
    this.engine.pause();
    this.inputManager.exitPointerLock();

    document.getElementById('final-rank').textContent = '#' + (isVictory ? 1 : this.aliveCount);
    document.getElementById('final-kills').textContent = this.killCount;
    document.getElementById('final-time').textContent = this.formatTime(this.surviveTime);

    const title = document.getElementById('result-title');
    if (title) {
      title.textContent = isVictory ? '大吉大利，今晚吃鸡！' : '游戏结束';
    }

    this.showScreen('gameover');
  }

  quitToMenu() {
    this.gameState.setState('menu');
    this.engine.stop();
    this.showScreen('menu');
  }

  showScreen(name) {
    Object.values(this.screens).forEach(s => s?.classList.remove('active'));
    this.screens[name]?.classList.add('active');
  }

  createEnemies(count) {
    for (let i = 0; i < count; i++) {
      const enemy = new Enemy();
      enemy.init();
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 180;
      enemy.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      enemy.addToScene(this.engine.getScene());
      enemy.initAI(this.world, this.player);
      this.enemies.push(enemy);
    }
    this.world.enemies = this.enemies;
    this.aliveCount = count + 1;
    console.log(`Created ${count} enemies`);
  }

  update(deltaTime, elapsedTime) {
    if (!this.gameState.is('playing')) return;

    this.surviveTime = (Date.now() - this.gameStartTime) / 1000;
    this.cameraController.update(deltaTime);
    this.world.update(deltaTime, this.surviveTime);

    const groundY = this.world.getHeightAt(this.player.position.x, this.player.position.z);
    this.player.characterController.setGroundY(groundY);

    // 更新武器控制器
    this.player.weaponController.update(deltaTime, this.surviveTime);

    this.updateEnemies(deltaTime);
    this.updateUI();
  }

  updateEnemies(deltaTime) {
    let alive = 1;
    for (const enemy of this.enemies) {
      if (!enemy.isDead()) {
        enemy.update(deltaTime);
        alive++;
      } else if (enemy.active) {
        this.killCount++;
        enemy.active = false;
      }
    }
    this.aliveCount = alive;
    if (alive === 1) this.endGame(true);
  }

  updateUI() {
    if (this.elements.surviveTime) {
      this.elements.surviveTime.textContent = this.formatTime(this.surviveTime);
    }
    if (this.elements.killCount) {
      this.elements.killCount.textContent = this.killCount;
    }
    if (this.elements.aliveCount) {
      this.elements.aliveCount.textContent = this.aliveCount;
    }
    if (this.elements.healthFill && this.player) {
      const pct = this.player.health.getHealthPercent() * 100;
      this.elements.healthFill.style.width = pct + '%';
    }
    if (this.elements.healthValue && this.player) {
      this.elements.healthValue.textContent = Math.floor(this.player.health.current);
    }
    this.updateMinimap();
  }

  updateMinimap() {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const size = 150;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
    ctx.fillRect(0, 0, size, size);

    // 安全区
    if (this.world.safeZone) {
      const sz = this.world.safeZone;
      ctx.beginPath();
      ctx.arc(size/2, size/2, sz.currentRadius * size / 500, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 敌人
    ctx.fillStyle = '#FF4444';
    for (const enemy of this.enemies) {
      if (!enemy.isDead()) {
        const ex = size/2 + enemy.position.x * size / 500;
        const ey = size/2 - enemy.position.z * size / 500;
        ctx.beginPath();
        ctx.arc(ex, ey, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 玩家
    const px = size/2 + this.player.position.x * size / 500;
    const py = size/2 - this.player.position.z * size / 500;
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
  }

  dispose() {
    this.engine.dispose();
    this.inputManager.dispose();
  }
}

// 初始化游戏
const game = new BattleRoyaleGame();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    game.init().catch(e => console.error('Failed to init:', e));
  });
} else {
  game.init().catch(e => console.error('Failed to init:', e));
}

export { game };