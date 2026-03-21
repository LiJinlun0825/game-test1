// Neon Target Challenge - 主入口
import { GameState } from './game/state.js';
import { LevelManager } from './game/level.js';
import { ScoreManager } from './game/score.js';
import { Leaderboard } from './game/leaderboard.js';
import { TargetFactory } from './entities/targets.js';
import { CollisionDetector } from './entities/collision.js';
import { Renderer } from './render/renderer.js';
import { ParticleSystem } from './render/particles.js';
import { CrosshairManager } from './render/crosshair.js';
import { MouseInput } from './input/mouse.js';
import { TouchInput } from './input/touch.js';
import { AudioManager } from './audio/audio.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.state = new GameState();
    this.screens = {
      menu: document.getElementById('menu-screen'),
      game: document.getElementById('game-screen'),
      pause: document.getElementById('pause-screen'),
      gameover: document.getElementById('gameover-screen'),
      leaderboard: document.getElementById('leaderboard-screen'),
      help: document.getElementById('help-screen'),
    };

    this.resize();
    this.initManagers();
    this.bindEvents();
    this.update();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initManagers() {
    try {
      this.levelManager = new LevelManager(this);
      this.scoreManager = new ScoreManager(this);
      this.leaderboard = new Leaderboard();
      this.targetFactory = new TargetFactory();
      this.collisionDetector = new CollisionDetector();
      this.renderer = new Renderer(this.ctx);
      this.particles = new ParticleSystem(this.canvas);
      this.crosshair = new CrosshairManager();
      this.audio = new AudioManager();
      this.mouseInput = new MouseInput(this);
      this.touchInput = new TouchInput(this);
    } catch (error) {
      console.error('初始化管理器失败:', error);
      throw error;
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    const startBtn = document.getElementById('start-btn');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const quitBtn = document.getElementById('quit-btn');
    const restartBtn = document.getElementById('restart-btn');
    const menuBtn = document.getElementById('menu-btn');
    const backBtn = document.getElementById('back-btn');
    const helpBtn = document.getElementById('help-btn');
    const helpBackBtn = document.getElementById('help-back-btn');
    const endGameBtn = document.getElementById('end-game-btn');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        console.log('点击开始游戏');
        this.startGame();
      });
    }

    if (leaderboardBtn) {
      leaderboardBtn.addEventListener('click', () => {
        console.log('点击排行榜');
        this.showLeaderboard();
      });
    }

    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        console.log('点击游戏说明');
        this.showHelp();
      });
    }

    if (helpBackBtn) {
      helpBackBtn.addEventListener('click', () => {
        this.showScreen('menu');
      });
    }

    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        this.resumeGame();
      });
    }

    if (quitBtn) {
      quitBtn.addEventListener('click', () => {
        this.quitToMenu();
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.startGame();
      });
    }

    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        this.quitToMenu();
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.showScreen('menu');
      });
    }

    if (endGameBtn) {
      endGameBtn.addEventListener('click', () => {
        console.log('点击结束游戏');
        this.endGame();
      });
    }

    // 暂停功能
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.is('playing')) {
        this.pauseGame();
      }
    });
  }

  showScreen(screenName) {
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
    this.screens[screenName].classList.add('active');
  }

  startGame() {
    this.state.set('playing');
    this.scoreManager.reset();
    this.levelManager.startLevel(1);
    this.showScreen('game');
    // 初始化音频上下文（需要用户交互后）
    this.audio.init();
    this.audio.startBGM();
  }

  pauseGame() {
    this.state.set('paused');
    this.showScreen('pause');
  }

  resumeGame() {
    this.state.set('playing');
    this.showScreen('game');
  }

  quitToMenu() {
    this.state.set('menu');
    this.levelManager.targets = [];
    this.showScreen('menu');
    this.audio.stopBGM();
  }

  endGame() {
    // 直接结束游戏，显示最终结果
    this.gameOver();
  }

  gameOver() {
    this.state.set('gameover');
    const finalScore = this.scoreManager.getScore();
    document.getElementById('final-score').textContent = `最终分数：${finalScore}`;
    this.leaderboard.saveScore({
      score: finalScore,
      level: this.levelManager.currentLevel,
      date: new Date().toISOString().split('T')[0]
    });
    this.showScreen('gameover');
    this.audio.stopBGM();
    this.audio.playGameOver();
  }

  showLeaderboard() {
    const scores = this.leaderboard.getScores();
    const list = document.getElementById('leaderboard-list');
    if (scores.length === 0) {
      list.innerHTML = '<div style="color: #888; padding: 20px; text-align: center;">暂无记录</div>';
    } else {
      list.innerHTML = scores.map((s, i) =>
        `<div style="color: white; padding: 10px; font-size: 18px; border-bottom: 1px solid #333;">
          ${i + 1}. ${s.score}分 - 关卡${s.level} - ${s.date}
        </div>`
      ).join('');
    }
    this.showScreen('leaderboard');
  }

  showHelp() {
    this.showScreen('help');
  }

  update() {
    // 清空画布
    this.ctx.fillStyle = '#0a0a0f';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新游戏逻辑
    if (this.state.is('playing')) {
      this.levelManager.update();
      this.scoreManager.update();

      // 更新 HUD
      document.getElementById('score-display').textContent = `分数：${this.scoreManager.getScore()}`;
      document.getElementById('level-display').textContent = `关卡：${this.levelManager.currentLevel}`;
      document.getElementById('time-display').textContent = `时间：${Math.ceil(this.levelManager.timeRemaining)}`;

      const combo = this.scoreManager.getCombo();
      const comboEl = document.getElementById('combo-display');
      comboEl.textContent = combo >= 5 ? `连击：${combo}x` : '';
    }

    // 渲染
    this.renderer.render(this.levelManager.targets);
    this.particles.update();
    this.crosshair.update(16);

    requestAnimationFrame(() => this.update());
  }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
  try {
    window.game = new Game();
    console.log('游戏初始化成功！');
  } catch (error) {
    console.error('游戏初始化失败:', error);
    alert('游戏加载失败，请刷新页面重试。\n错误: ' + error.message);
  }
});