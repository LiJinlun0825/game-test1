# Neon Target Challenge 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一款完整的霓虹赛博风格打靶射击游戏，支持桌面和移动设备

**Architecture:** 5 层架构（输入层、游戏核心、实体层、渲染层、音频层），采用纯 HTML/CSS/原生 JavaScript，零依赖

**Tech Stack:** HTML5、CSS3、ES6+ JavaScript、Web Audio API、localStorage

---

## 文件结构总览

```
D:\WorkBuddy\GameProject1\
├── index.html                  # 主页面
├── css/
│   ├── style.css               # 主样式表
│   └── effects.css             # 霓虹特效
├── js/
│   ├── main.js                 # 游戏入口
│   ├── game/
│   │   ├── state.js            # 游戏状态机
│   │   ├── level.js            # 关卡管理
│   │   ├── score.js            # 计分系统
│   │   └── leaderboard.js      # 排行榜
│   ├── entities/
│   │   ├── target.js           # 靶子基类
│   │   ├── targets.js          # 5 种靶子类型
│   │   └── collision.js        # 碰撞检测
│   ├── render/
│   │   ├── renderer.js         # 主渲染器
│   │   ├── particles.js        # 粒子特效
│   │   └── crosshair.js        # 准星渲染
│   ├── input/
│   │   ├── mouse.js            # 鼠标输入
│   │   └── touch.js            # 触摸输入
│   └── audio/
│       └── audio.js            # 音频管理器
└── assets/
    └── audio/                  # 音效文件（可选）
```

---

## Task 1: 项目基础结构

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `css/effects.css`
- Create: `js/main.js`

- [ ] **Step 1: 创建 HTML 主页面**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Neon Target Challenge</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/effects.css">
</head>
<body>
  <div id="game-container">
    <!-- 游戏画布 -->
    <canvas id="game-canvas"></canvas>

    <!-- UI 覆盖层 -->
    <div id="ui-layer">
      <div id="menu-screen" class="screen active">
        <h1 class="neon-title">NEON TARGET</h1>
        <button id="start-btn" class="neon-btn">开始游戏</button>
        <button id="leaderboard-btn" class="neon-btn">排行榜</button>
      </div>

      <div id="game-screen" class="screen">
        <div id="hud">
          <span id="score-display">分数：0</span>
          <span id="level-display">关卡：1</span>
          <span id="time-display">时间：30</span>
          <span id="combo-display"></span>
        </div>
      </div>

      <div id="pause-screen" class="screen">
        <h2 class="neon-title">暂停</h2>
        <button id="resume-btn" class="neon-btn">继续</button>
        <button id="quit-btn" class="neon-btn">退出</button>
      </div>

      <div id="gameover-screen" class="screen">
        <h2 class="neon-title">游戏结束</h2>
        <p id="final-score">最终分数：0</p>
        <button id="restart-btn" class="neon-btn">重新开始</button>
        <button id="menu-btn" class="neon-btn">返回菜单</button>
      </div>

      <div id="leaderboard-screen" class="screen">
        <h2 class="neon-title">排行榜</h2>
        <div id="leaderboard-list"></div>
        <button id="back-btn" class="neon-btn">返回</button>
      </div>
    </div>

    <!-- 准星 -->
    <div id="custom-cursor"></div>
  </div>

  <script src="js/main.js" type="module"></script>
</body>
</html>
```

- [ ] **Step 2: 运行并验证 HTML 结构**

在浏览器中打开 `index.html`，确认所有 UI 元素可见

- [ ] **Step 3: 创建主样式表 css/style.css**

```css
/* 基础重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --neon-cyan: #00ffff;
  --neon-pink: #ff00ff;
  --neon-yellow: #ffff00;
  --neon-orange: #ff8800;
  --neon-red: #ff0000;
  --text-primary: #ffffff;
  --text-secondary: #8888aa;
  --target-base-size: 60px;
  --ui-scale: 1.0;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg-primary);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
  -webkit-user-select: none;
}

#game-container {
  position: relative;
  width: 100%;
  height: 100%;
}

#game-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

#ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(10, 10, 15, 0.9);
  pointer-events: auto;
}

.screen.active {
  display: flex;
}

/* HUD */
#hud {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 10px 20px;
  background: var(--bg-secondary);
  border-bottom: 2px solid var(--neon-cyan);
  font-size: calc(18px * var(--ui-scale));
  color: var(--text-primary);
}

#hud span {
  padding: 5px 15px;
}

#combo-display {
  color: var(--neon-pink);
  font-weight: bold;
}

/* 按钮样式 */
.neon-btn {
  margin: 10px;
  padding: 15px 40px;
  font-size: calc(18px * var(--ui-scale));
  background: transparent;
  border: 2px solid var(--neon-cyan);
  color: var(--neon-cyan);
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.neon-btn:hover {
  background: var(--neon-cyan);
  color: var(--bg-primary);
  box-shadow: 0 0 20px var(--neon-cyan);
}

/* 自定义准星 */
#custom-cursor {
  position: fixed;
  width: 30px;
  height: 30px;
  border: 2px solid var(--neon-cyan);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1000;
  transform: translate(-50%, -50%);
  display: none;
}

#custom-cursor::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: var(--neon-pink);
  transform: translate(-50%, -50%);
}

/* 响应式设计 */
@media (max-width: 767px) {
  :root {
    --target-base-size: 50px;
    --ui-scale: 0.9;
  }

  #custom-cursor {
    display: none !important;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  :root {
    --target-base-size: 60px;
    --ui-scale: 1.0;
  }
}

@media (min-width: 1024px) {
  :root {
    --target-base-size: 70px;
    --ui-scale: 1.0;
  }

  #custom-cursor {
    display: block;
  }
}
```

- [ ] **Step 4: 创建霓虹特效 css/effects.css**

```css
/* 霓虹标题效果 */
.neon-title {
  font-size: calc(48px * var(--ui-scale));
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 40px;
  text-shadow:
    0 0 5px var(--neon-cyan),
    0 0 10px var(--neon-cyan),
    0 0 20px var(--neon-cyan),
    0 0 40px var(--neon-cyan);
  animation: neon-flicker 0.1s infinite alternate;
}

@keyframes neon-flicker {
  0% { opacity: 1; }
  50% { opacity: 0.98; }
  100% { opacity: 1; }
}

/* 霓虹按钮发光 */
.neon-btn {
  box-shadow:
    0 0 5px var(--neon-cyan),
    0 0 10px var(--neon-cyan),
    inset 0 0 5px var(--neon-cyan);
}

.neon-btn:hover {
  box-shadow:
    0 0 10px var(--neon-cyan),
    0 0 20px var(--neon-cyan),
    0 0 40px var(--neon-cyan),
    inset 0 0 10px var(--neon-cyan);
}

/* 靶子发光效果 */
.target-glow {
  filter: drop-shadow(0 0 5px currentColor)
          drop-shadow(0 0 10px currentColor)
          drop-shadow(0 0 20px currentColor);
}

/* 击中闪光 */
@keyframes hit-flash {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.hit-effect {
  animation: hit-flash 0.2s ease-out;
}

/* 粒子特效容器 */
.particle-container {
  position: absolute;
  pointer-events: none;
  z-index: 100;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: particle-fade 0.5s ease-out forwards;
}

@keyframes particle-fade {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0); }
}

/* 连击效果 */
.combo-popup {
  position: absolute;
  font-size: 32px;
  font-weight: bold;
  color: var(--neon-pink);
  text-shadow:
    0 0 10px var(--neon-pink),
    0 0 20px var(--neon-pink);
  animation: combo-rise 1s ease-out forwards;
  pointer-events: none;
}

@keyframes combo-rise {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-50px) scale(1.5); }
}

/* 屏幕震动 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.screen-shake {
  animation: shake 0.3s ease-in-out;
}

/* 渐变背景动画 */
@keyframes bg-pulse {
  0% { background: var(--bg-primary); }
  50% { background: #0f0f1a; }
  100% { background: var(--bg-primary); }
}

.bg-animate {
  animation: bg-pulse 4s ease-in-out infinite;
}
```

- [ ] **Step 5: 创建主入口 js/main.js**

```javascript
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
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    document.getElementById('start-btn').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('leaderboard-btn').addEventListener('click', () => {
      this.showLeaderboard();
    });

    document.getElementById('resume-btn').addEventListener('click', () => {
      this.resumeGame();
    });

    document.getElementById('quit-btn').addEventListener('click', () => {
      this.quitToMenu();
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('menu-btn').addEventListener('click', () => {
      this.quitToMenu();
    });

    document.getElementById('back-btn').addEventListener('click', () => {
      this.showScreen('menu');
    });

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
    this.audio.playGameOver();
  }

  showLeaderboard() {
    const scores = this.leaderboard.getScores();
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = scores.map((s, i) =>
      `<div style="color: white; padding: 10px; font-size: 18px;">
        ${i + 1}. ${s.score}分 - 关卡${s.level} - ${s.date}
      </div>`
    ).join('');
    this.showScreen('leaderboard');
  }

  update() {
    // 清空画布
    this.ctx.fillStyle = '#0a0a0f';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新游戏逻辑
    if (this.state.is('playing')) {
      this.levelManager.update();
      this.scoreManager.update();
    }

    // 渲染
    this.renderer.render(this.levelManager.targets);
    this.particles.update();

    requestAnimationFrame(() => this.update());
  }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
```

- [ ] **Step 6: 提交**

```bash
git add index.html css/ js/main.js
git commit -m "feat: 创建项目基础结构和 HTML/CSS 框架"
```

---

## Task 2: 游戏状态机

**Files:**
- Create: `js/game/state.js`
- Test: `js/game/state.test.js`

- [ ] **Step 1: 编写状态机测试**

```javascript
// js/game/state.test.js
import { GameState } from './state.js';

describe('GameState', () => {
  test('初始状态为 menu', () => {
    const state = new GameState();
    expect(state.current).toBe('menu');
  });

  test('可以转换到 playing 状态', () => {
    const state = new GameState();
    state.set('playing');
    expect(state.is('playing')).toBe(true);
  });

  test('可以转换到 paused 状态', () => {
    const state = new GameState();
    state.set('playing');
    state.set('paused');
    expect(state.is('paused')).toBe(true);
  });

  test('可以转换到 gameover 状态', () => {
    const state = new GameState();
    state.set('playing');
    state.set('gameover');
    expect(state.is('gameover')).toBe(true);
  });

  test('is 方法对错误状态返回 false', () => {
    const state = new GameState();
    state.set('playing');
    expect(state.is('paused')).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js js/game/state.test.js
```
预期：FAIL（模块不存在）

- [ ] **Step 3: 实现状态机**

```javascript
// js/game/state.js
export class GameState {
  constructor() {
    this.current = 'menu';
    this.validStates = ['menu', 'playing', 'paused', 'gameover', 'level_complete'];
  }

  set(newState) {
    if (!this.validStates.includes(newState)) {
      console.warn(`Invalid state: ${newState}`);
      return;
    }
    this.current = newState;
  }

  is(targetState) {
    return this.current === targetState;
  }

  transition(newState) {
    const transitions = {
      'menu': ['playing'],
      'playing': ['paused', 'gameover', 'level_complete'],
      'paused': ['playing', 'menu'],
      'gameover': ['menu', 'playing'],
      'level_complete': ['playing', 'gameover'],
    };

    if (transitions[this.current]?.includes(newState)) {
      this.set(newState);
      return true;
    }

    console.warn(`Invalid transition: ${this.current} -> ${newState}`);
    return false;
  }
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js js/game/state.test.js
```
预期：PASS 5/5

- [ ] **Step 5: 提交**

```bash
git add js/game/state.js js/game/state.test.js
git commit -m "feat: 实现游戏状态机"
```

---

## Task 3: 计分系统

**Files:**
- Create: `js/game/score.js`
- Test: `js/game/score.test.js`

- [ ] **Step 1: 编写计分测试**

```javascript
// js/game/score.test.js
import { ScoreManager } from './score.js';

describe('ScoreManager', () => {
  let scoreManager;

  beforeEach(() => {
    const mockGame = {
      audio: { playHit: () => {}, playHeadshot: () => {}, playCombo: () => {} }
    };
    scoreManager = new ScoreManager(mockGame);
  });

  test('初始分数为 0', () => {
    expect(scoreManager.getScore()).toBe(0);
  });

  test('重置后分数清零', () => {
    scoreManager.addScore(100);
    scoreManager.reset();
    expect(scoreManager.getScore()).toBe(0);
  });

  test('靶心得 10 分', () => {
    scoreManager.addScore(10);
    expect(scoreManager.getScore()).toBe(10);
  });

  test('内环得 5 分', () => {
    scoreManager.addScore(5);
    expect(scoreManager.getScore()).toBe(5);
  });

  test('外环得 3 分', () => {
    scoreManager.addScore(3);
    expect(scoreManager.getScore()).toBe(3);
  });

  test('连击达到 5 触发奖励', () => {
    for (let i = 0; i < 5; i++) {
      scoreManager.addScore(10);
    }
    expect(scoreManager.getCombo()).toBe(5);
  });

  test('连击奖励 50%', () => {
    scoreManager.reset();
    // 先建立 4 连击
    for (let i = 0; i < 4; i++) {
      scoreManager.addScore(10);
    }
    // 第 5 次应该有奖励
    const beforeScore = scoreManager.getScore();
    scoreManager.addScore(10); // 应该得 15 分（10 + 5 连击奖励）
    expect(scoreManager.getScore() - beforeScore).toBeGreaterThanOrEqual(10);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

- [ ] **Step 3: 实现计分系统**

```javascript
// js/game/score.js
export class ScoreManager {
  constructor(game) {
    this.game = game;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.headshots = 0;
    this.comboThreshold = 5;
  }

  reset() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.headshots = 0;
  }

  getScore() {
    return this.score;
  }

  getCombo() {
    return this.combo;
  }

  addScore(basePoints, isHeadshot = false) {
    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    if (isHeadshot) {
      this.headshots++;
      basePoints *= 2; // 靶心双倍
    }

    // 连击奖励：每 5 连击增加 50% 分数
    const comboMultiplier = 1 + Math.floor(this.combo / this.comboThreshold) * 0.5;
    const finalPoints = Math.floor(basePoints * comboMultiplier);

    this.score += finalPoints;

    // 播放音效
    if (isHeadshot) {
      this.game.audio.playHeadshot();
    } else {
      this.game.audio.playHit();
    }

    // 连击音效
    if (this.combo % this.comboThreshold === 0) {
      this.game.audio.playCombo(this.combo);
    }

    return finalPoints;
  }

  resetCombo() {
    this.combo = 0;
  }

  update() {
    // 可以在这里添加时间相关的计分逻辑
  }
}
```

- [ ] **Step 4: 运行测试验证通过**

- [ ] **Step 5: 提交**

```bash
git add js/game/score.js js/game/score.test.js
git commit -m "feat: 实现计分系统（含连击奖励）"
```

---

## Task 4: 关卡管理系统

**Files:**
- Create: `js/game/level.js`
- Test: `js/game/level.test.js`

- [ ] **Step 1: 编写关卡测试**

```javascript
// js/game/level.test.js
import { LevelManager } from './level.js';

describe('LevelManager', () => {
  let levelManager;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      canvas: { width: 800, height: 600 },
      state: { is: () => true, set: () => {} },
      scoreManager: { resetCombo: () => {} },
      audio: { playSpawn: () => {} }
    };
    levelManager = new LevelManager(mockGame);
  });

  test('初始关卡为 1', () => {
    expect(levelManager.currentLevel).toBe(1);
  });

  test('startLevel 初始化关卡参数', () => {
    levelManager.startLevel(1);
    expect(levelManager.timeRemaining).toBe(30);
    expect(levelManager.targetScore).toBe(100);
  });

  test('关卡 2 难度提升', () => {
    levelManager.startLevel(2);
    expect(levelManager.speedMultiplier).toBe(1.2);
    expect(levelManager.targetSizeMultiplier).toBe(0.9);
  });

  test('关卡 5 引入惩罚靶', () => {
    levelManager.startLevel(5);
    expect(levelManager.spawnRates.penalty).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 实现关卡管理器**

```javascript
// js/game/level.js
import { Target } from './target.js';

export class LevelManager {
  constructor(game) {
    this.game = game;
    this.targets = [];
    this.currentLevel = 1;
    this.timeRemaining = 30;
    this.targetScore = 100;
    this.spawnTimer = 0;
    this.lastSpawnTime = 0;

    // 难度参数
    this.speedMultiplier = 1.0;
    this.targetSizeMultiplier = 1.0;
    this.spawnInterval = 1.5;
    this.spawnRates = { standard: 100 };

    this.loadLevelConfig();
  }

  loadLevelConfig() {
    this.levelConfigs = {
      1: { time: 30, score: 100, speed: 1.0, size: 1.0, interval: 1.5, rates: { standard: 100 } },
      2: { time: 45, score: 250, speed: 1.2, size: 0.9, interval: 1.2, rates: { standard: 80, fast: 20 } },
      3: { time: 60, score: 500, speed: 1.5, size: 0.8, interval: 1.0, rates: { standard: 70, fast: 20, bonus: 10 } },
      4: { time: 60, score: 800, speed: 1.8, size: 0.7, interval: 0.8, rates: { standard: 60, fast: 20, armored: 20 } },
      5: { time: 75, score: 1200, speed: 2.0, size: 0.6, interval: 0.6, rates: { standard: 50, fast: 25, armored: 15, bonus: 5, penalty: 5 } },
    };
  }

  startLevel(level) {
    this.currentLevel = level;
    const config = this.levelConfigs[Math.min(level, 5)] || this.levelConfigs[5];
    this.timeRemaining = config.time;
    this.targetScore = config.score;
    this.speedMultiplier = config.speed;
    this.targetSizeMultiplier = config.size;
    this.spawnInterval = config.interval;
    this.spawnRates = config.rates;
    this.targets = [];
  }

  update(deltaTime = 16) {
    // 更新倒计时
    this.timeRemaining -= deltaTime / 1000;

    if (this.timeRemaining <= 0) {
      this.checkLevelComplete();
      return;
    }

    // 生成靶子
    this.spawnTimer += deltaTime / 1000;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnTarget();
    }

    // 更新靶子
    this.targets.forEach(target => target.update(deltaTime, this.game.canvas));

    // 移除消失的靶子
    this.targets = this.targets.filter(t => !t.shouldRemove);
  }

  spawnTarget() {
    const type = this.randomTargetType();
    const target = this.game.targetFactory.create(type, this.game.canvas, {
      speedMultiplier: this.speedMultiplier,
      sizeMultiplier: this.targetSizeMultiplier,
    });
    this.targets.push(target);
    this.game.audio.playSpawn();
  }

  randomTargetType() {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const [type, rate] of Object.entries(this.spawnRates)) {
      cumulative += rate;
      if (rand < cumulative) return type;
    }
    return 'standard';
  }

  checkLevelComplete() {
    if (this.game.scoreManager.getScore() >= this.targetScore) {
      this.game.state.set('level_complete');
      this.game.audio.playLevelUp();
      setTimeout(() => {
        this.startLevel(this.currentLevel + 1);
        this.game.state.set('playing');
      }, 2000);
    } else {
      this.game.gameOver();
    }
  }

  removeTarget(target) {
    target.shouldRemove = true;
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add js/game/level.js js/game/level.test.js
git commit -m "feat: 实现关卡管理系统（含难度曲线）"
```

---

## Task 5: 靶子实体系统

**Files:**
- Create: `js/entities/target.js`
- Create: `js/entities/targets.js`
- Create: `js/entities/collision.js`

- [ ] **Step 1: 实现靶子基类**

```javascript
// js/entities/target.js
export class Target {
  constructor(x, y, radius, color, type, options = {}) {
    this.x = x;
    this.y = y;
    this.radius = radius * (options.sizeMultiplier || 1);
    this.baseRadius = radius;
    this.color = color;
    this.type = type;
    this.speedMultiplier = options.speedMultiplier || 1;
    this.hp = options.hp || 1;
    this.maxHp = this.hp;
    this.points = options.points || 10;
    this.shouldRemove = false;
    this.opacity = 1;
    this.spawnTimer = 0;
    this.spawnDuration = 300; // 渐显时间
  }

  update(deltaTime, canvas) {
    this.move(deltaTime, canvas);

    // 渐显效果
    if (this.spawnTimer < this.spawnDuration) {
      this.spawnTimer += deltaTime;
      this.opacity = Math.min(1, this.spawnTimer / this.spawnDuration);
    }
  }

  move(deltaTime, canvas) {
    // 子类实现
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // 发光效果
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.stroke();

    // 生命值显示（重甲靶）
    if (this.hp < this.maxHp) {
      ctx.fillStyle = 'white';
      ctx.font = `${this.radius}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.hp, this.x, this.y);
    }

    ctx.restore();
  }

  hit(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.radius) return null;

    // 计算环数
    const ratio = distance / this.radius;
    let points, isHeadshot;

    if (ratio < 0.3) {
      points = 10;
      isHeadshot = true;
    } else if (ratio < 0.6) {
      points = 5;
      isHeadshot = false;
    } else {
      points = 3;
      isHeadshot = false;
    }

    this.hp--;
    if (this.hp <= 0) {
      this.shouldRemove = true;
    }

    return { points, isHeadshot, type: this.type };
  }

  onRemove() {
    // 子类可以重写
  }
}
```

- [ ] **Step 2: 实现 5 种靶子类型**

```javascript
// js/entities/targets.js
import { Target } from './target.js';

export class StandardTarget extends Target {
  constructor(x, y, options = {}) {
    super(x, y, 30, '#00FFFF', 'standard', { ...options, hp: 1, points: 10 });
    this.vx = (Math.random() - 0.5) * 2 * this.speedMultiplier;
    this.vy = (Math.random() - 0.5) * 2 * this.speedMultiplier;
  }

  move(deltaTime, canvas) {
    this.x += this.vx * (deltaTime / 16);
    this.y += this.vy * (deltaTime / 16);

    // 边界反弹
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.vy *= -1;
  }
}

export class FastTarget extends Target {
  constructor(x, y, options = {}) {
    super(x, y, 20, '#FFFF00', 'fast', { ...options, hp: 1, points: 25 });
    this.vx = (Math.random() - 0.5) * 4 * this.speedMultiplier;
    this.vy = (Math.random() - 0.5) * 4 * this.speedMultiplier;
    this.lifetime = 0;
    this.maxLifetime = 3000; // 3 秒后消失
  }

  move(deltaTime, canvas) {
    this.lifetime += deltaTime;
    if (this.lifetime > this.maxLifetime) {
      this.shouldRemove = true;
      return;
    }

    this.x += this.vx * (deltaTime / 16);
    this.y += this.vy * (deltaTime / 16);

    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.vy *= -1;
  }
}

export class ArmoredTarget extends Target {
  constructor(x, y, options = {}) {
    super(x, y, 40, '#FF8800', 'armored', { ...options, hp: 3, points: 50 });
    this.vx = (Math.random() - 0.5) * 1 * this.speedMultiplier;
    this.vy = (Math.random() - 0.5) * 1 * this.speedMultiplier;
  }

  move(deltaTime, canvas) {
    this.x += this.vx * (deltaTime / 16);
    this.y += this.vy * (deltaTime / 16);

    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.vy *= -1;
  }
}

export class BonusTarget extends Target {
  constructor(x, y, options = {}) {
    super(x, y, 15, '#FF00FF', 'bonus', { ...options, hp: 1, points: 100 });
    this.vx = (Math.random() - 0.5) * 3 * this.speedMultiplier;
    this.vy = (Math.random() - 0.5) * 3 * this.speedMultiplier;
    this.lifetime = 0;
    this.maxLifetime = 2000;
  }

  move(deltaTime, canvas) {
    this.lifetime += deltaTime;
    if (this.lifetime > this.maxLifetime) {
      this.shouldRemove = true;
      return;
    }

    this.x += this.vx * (deltaTime / 16);
    this.y += this.vy * (deltaTime / 16);

    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.vy *= -1;
  }

  onRemove(game) {
    if (game && game.timeRemaining) {
      game.timeRemaining += 5; // 奖励 5 秒
    }
  }
}

export class PenaltyTarget extends Target {
  constructor(x, y, options = {}) {
    super(x, y, 25, '#FF0000', 'penalty', { ...options, hp: 1, points: -50 });
    this.vx = (Math.random() - 0.5) * 3 * this.speedMultiplier;
    this.vy = (Math.random() - 0.5) * 3 * this.speedMultiplier;
  }

  move(deltaTime, canvas) {
    this.x += this.vx * (deltaTime / 16);
    this.y += this.vy * (deltaTime / 16);

    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.vx *= -1;
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.vy *= -1;
  }

  onRemove(game) {
    if (game && game.scoreManager) {
      game.scoreManager.resetCombo(); // 击中惩罚靶清零连击
    }
  }
}

export class TargetFactory {
  create(type, canvas, options = {}) {
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = Math.random() * (canvas.height - 100) + 50;

    switch (type) {
      case 'fast': return new FastTarget(x, y, options);
      case 'armored': return new ArmoredTarget(x, y, options);
      case 'bonus': return new BonusTarget(x, y, options);
      case 'penalty': return new PenaltyTarget(x, y, options);
      default: return new StandardTarget(x, y, options);
    }
  }
}
```

- [ ] **Step 3: 实现碰撞检测**

```javascript
// js/entities/collision.js
export class CollisionDetector {
  detect(targets, x, y) {
    // 从后往前检测（后绘制的在上层）
    for (let i = targets.length - 1; i >= 0; i--) {
      const target = targets[i];
      const result = target.hit(x, y);

      if (result) {
        if (target.shouldRemove) {
          target.onRemove(null);
        }
        return { target, result };
      }
    }
    return null;
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add js/entities/
git commit -m "feat: 实现靶子实体系统（5 种类型 + 碰撞检测）"
```

---

## Task 6: 渲染系统

**Files:**
- Create: `js/render/renderer.js`
- Create: `js/render/particles.js`
- Create: `js/render/crosshair.js`

- [ ] **Step 1: 实现主渲染器**

```javascript
// js/render/renderer.js
export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  render(targets) {
    // 绘制靶子
    targets.forEach(target => target.draw(this.ctx));
  }

  drawHUD(score, level, time, combo) {
    // 如果需要 Canvas 绘制 HUD，可以在这里实现
  }

  drawScorePopup(x, y, points, combo) {
    // 绘制分数弹出效果
    this.ctx.save();
    this.ctx.fillStyle = points > 0 ? '#00ffff' : '#ff0000';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    const sign = points > 0 ? '+' : '';
    this.ctx.fillText(`${sign}${points}`, x, y);
    this.ctx.restore();
  }
}
```

- [ ] **Step 2: 实现粒子系统**

```javascript
// js/render/particles.js
export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.particles = [];
    this.container = document.createElement('div');
    this.container.className = 'particle-container';
    document.getElementById('game-container').appendChild(this.container);
  }

  spawn(x, y, color) {
    const count = 8 + Math.random() * 4; // 8-12 个粒子
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 1, // 轻微重力
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        color,
      });
    }
  }

  update() {
    this.container.innerHTML = '';

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // 重力
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      const elem = document.createElement('div');
      elem.className = 'particle';
      elem.style.left = p.x + 'px';
      elem.style.top = p.y + 'px';
      elem.style.backgroundColor = p.color;
      elem.style.opacity = p.life;
      this.container.appendChild(elem);
    }
  }

  clear() {
    this.particles = [];
    this.container.innerHTML = '';
  }
}
```

- [ ] **Step 3: 实现准星管理器**

```javascript
// js/render/crosshair.js
export class CrosshairManager {
  constructor() {
    this.cursor = document.getElementById('custom-cursor');
    this.x = 0;
    this.y = 0;
    this.wobble = 0;
    this.wobbleSpeed = 0.05;

    if (this.cursor) {
      document.addEventListener('mousemove', (e) => {
        this.x = e.clientX;
        this.y = e.clientY;
        this.cursor.style.left = this.x + 'px';
        this.cursor.style.top = this.y + 'px';
      });
    }
  }

  update(deltaTime) {
    // 轻微晃动效果
    this.wobble += this.wobbleSpeed * deltaTime;
    const offset = Math.sin(this.wobble) * 2;

    if (this.cursor) {
      this.cursor.style.transform = `translate(-50%, -50%) translate(${offset}px, ${offset}px)`;
    }
  }

  hide() {
    if (this.cursor) this.cursor.style.display = 'none';
  }

  show() {
    if (this.cursor) this.cursor.style.display = 'block';
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add js/render/
git commit -m "feat: 实现渲染系统（粒子特效 + 准星）"
```

---

## Task 7: 输入处理

**Files:**
- Create: `js/input/mouse.js`
- Create: `js/input/touch.js`

- [ ] **Step 1: 实现鼠标输入**

```javascript
// js/input/mouse.js
export class MouseInput {
  constructor(game) {
    this.game = game;

    this.game.canvas.addEventListener('click', (e) => {
      if (!this.game.state.is('playing')) return;

      const rect = this.game.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.handleClick(x, y);
    });
  }

  handleClick(x, y) {
    const result = this.game.collisionDetector.detect(
      this.game.levelManager.targets,
      x, y
    );

    if (result) {
      const { target, result: hitResult } = result;

      // 计分
      const points = this.game.scoreManager.addScore(
        hitResult.points,
        hitResult.isHeadshot
      );

      // 粒子特效
      this.game.particles.spawn(x, y, target.color);

      // 奖励靶效果
      if (hitResult.type === 'bonus') {
        target.onRemove(this.game);
      }

      // 惩罚靶效果
      if (hitResult.type === 'penalty') {
        target.onRemove(this.game);
        this.game.canvas.classList.add('screen-shake');
        setTimeout(() => this.game.canvas.classList.remove('screen-shake'), 300);
      }
    }
  }
}
```

- [ ] **Step 2: 实现触摸输入**

```javascript
// js/input/touch.js
export class TouchInput {
  constructor(game) {
    this.game = game;

    this.game.canvas.addEventListener('touchstart', (e) => {
      if (!this.game.state.is('playing')) return;
      e.preventDefault();

      const rect = this.game.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.handleClick(x, y);
    }, { passive: false });
  }

  handleClick(x, y) {
    const result = this.game.collisionDetector.detect(
      this.game.levelManager.targets,
      x, y
    );

    if (result) {
      const { target, result: hitResult } = result;

      this.game.scoreManager.addScore(
        hitResult.points,
        hitResult.isHeadshot
      );

      this.game.particles.spawn(x, y, target.color);

      if (hitResult.type === 'bonus') {
        target.onRemove(this.game);
      }

      if (hitResult.type === 'penalty') {
        target.onRemove(this.game);
        this.game.canvas.classList.add('screen-shake');
        setTimeout(() => this.game.canvas.classList.remove('screen-shake'), 300);
      }
    }
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add js/input/
git commit -m "feat: 实现输入处理（鼠标 + 触摸）"
```

---

## Task 8: 音频系统

**Files:**
- Create: `js/audio/audio.js`
- Test: 手动测试音频播放

- [ ] **Step 1: 实现音频管理器**

```javascript
// js/audio/audio.js
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.volume = 0.7;
    this.bgmOscillator = null;
    this.bgmGain = null;

    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  init() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, vol = 1) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(vol * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playHit() {
    this.playTone(800 + Math.random() * 200, 'sine', 0.15, 0.5);
  }

  playHeadshot() {
    this.playTone(1200, 'sine', 0.2, 0.6);
    setTimeout(() => this.playTone(1800, 'sine', 0.15, 0.4), 50);
  }

  playSpawn() {
    this.playTone(400 + Math.random() * 100, 'triangle', 0.05, 0.2);
  }

  playCombo(count) {
    const baseFreq = 440;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(baseFreq + (count % 5) * 100 + i * 100, 'square', 0.1, 0.3);
      }, i * 80);
    }
  }

  playLevelUp() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.2, 0.3), i * 150);
    });
  }

  playGameOver() {
    [523, 466, 440, 415, 392, 349].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.3, 0.3), i * 200);
    });
  }

  startBGM() {
    // 简单的循环背景音
    if (!this.ctx) return;

    this.stopBGM();

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.1 * this.volume;
    this.bgmGain.connect(this.ctx.destination);

    // 创建简单的低音循环
    const createLoop = () => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 60;
      osc.connect(this.bgmGain);
      osc.start();
      this.bgmOscillator = osc;
    };

    createLoop();
  }

  stopBGM() {
    if (this.bgmOscillator) {
      this.bgmOscillator.stop();
      this.bgmOscillator.disconnect();
      this.bgmOscillator = null;
    }
    if (this.bgmGain) {
      this.bgmGain.disconnect();
      this.bgmGain = null;
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add js/audio/
git commit -m "feat: 实现音频系统（Web Audio API 合成音效）"
```

---

## Task 9: 排行榜系统

**Files:**
- Create: `js/game/leaderboard.js`
- Test: `js/game/leaderboard.test.js`

- [ ] **Step 1: 编写测试**

```javascript
// js/game/leaderboard.test.js
import { Leaderboard } from './leaderboard.js';

describe('Leaderboard', () => {
  let leaderboard;

  beforeEach(() => {
    localStorage.clear();
    leaderboard = new Leaderboard();
  });

  test('初始排行榜为空', () => {
    expect(leaderboard.getScores()).toEqual([]);
  });

  test('保存分数后添加到排行榜', () => {
    leaderboard.saveScore({ score: 100, level: 1, date: '2026-03-19' });
    const scores = leaderboard.getScores();
    expect(scores.length).toBe(1);
    expect(scores[0].score).toBe(100);
  });

  test '排行榜只保留 Top 10', () => {
    for (let i = 1; i <= 15; i++) {
      leaderboard.saveScore({ score: i * 100, level: i, date: '2026-03-19' });
    }
    const scores = leaderboard.getScores();
    expect(scores.length).toBe(10);
    expect(scores[0].score).toBe(1500); // 最高分
  });

  test '分数按降序排列', () => {
    leaderboard.saveScore({ score: 300, level: 1, date: '2026-03-19' });
    leaderboard.saveScore({ score: 500, level: 2, date: '2026-03-19' });
    leaderboard.saveScore({ score: 100, level: 3, date: '2026-03-19' });
    const scores = leaderboard.getScores();
    expect(scores[0].score).toBe(500);
    expect(scores[2].score).toBe(100);
  });
});
```

- [ ] **Step 2: 实现排行榜**

```javascript
// js/game/leaderboard.js
export class Leaderboard {
  constructor() {
    this.storageKey = 'neonTarget';
    this.maxScores = 10;
  }

  saveScore(scoreData) {
    const data = this.getData();
    data.highScores.push(scoreData);

    // 按分数降序排序
    data.highScores.sort((a, b) => b.score - a.score);

    // 只保留 Top 10
    data.highScores = data.highScores.slice(0, this.maxScores);

    this.saveData(data);
  }

  getScores() {
    return this.getData().highScores;
  }

  getStats() {
    return this.getData().stats;
  }

  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load leaderboard data');
    }

    return {
      highScores: [],
      stats: {
        totalGames: 0,
        totalHits: 0,
        bestCombo: 0,
        headshots: 0,
      },
      settings: {
        volume: 0.7,
        difficulty: 'normal',
      },
    };
  }

  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save leaderboard data');
    }
  }

  updateStats(updates) {
    const data = this.getData();
    Object.assign(data.stats, updates);
    this.saveData(data);
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add js/game/leaderboard.js js/game/leaderboard.test.js
git commit -m "feat: 实现排行榜系统（localStorage 存储 Top 10）"
```

---

## Task 10: 集成测试与优化

**Files:**
- 修改：`js/main.js`
- Create: `tests/integration/game.test.js`

- [ ] **Step 1: 完善主入口集成**

更新 `js/main.js` 以正确连接所有模块，确保：
- 游戏循环正确更新所有管理器
- 输入事件正确绑定
- UI 状态正确切换
- 粒子特效在击中时触发

- [ ] **Step 2: 添加 UI 更新逻辑**

在 `js/main.js` 的 `update()` 方法中添加：

```javascript
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
```

- [ ] **Step 3: 手动测试游戏流程**

1. 打开浏览器访问 `index.html`
2. 点击"开始游戏"按钮
3. 验证靶子生成和移动
4. 点击靶子验证击中反馈（分数、粒子、音效）
5. 验证连击系统
6. 验证关卡时间结束后的结果判定
7. 验证排行榜保存和显示

- [ ] **Step 4: 性能优化**

确保：
- 动画保持 60 FPS
- 点击响应 < 100ms
- 内存使用合理（靶子正确清理）

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: 完成集成测试与性能优化"
```

---

## Task 11: 响应式测试与最终调整

- [ ] **Step 1: 移动端测试**

在移动设备上测试：
- 触摸输入响应
- UI 布局适配
- 准星自动隐藏

- [ ] **Step 2: 跨浏览器测试**

测试浏览器：
- Chrome
- Firefox
- Safari
- Edge

- [ ] **Step 3: 最终调整**

根据测试结果调整：
- 靶子大小
- 生成频率
- 音量平衡

- [ ] **Step 4: 提交最终版本**

```bash
git add -A
git commit -m "chore: 响应式测试与最终调整"
```

---

## 验收标准

- [ ] 游戏可以在桌面浏览器正常运行
- [ ] 移动设备触摸操作正常
- [ ] 5 种靶子类型都有独特行为
- [ ] 计分系统（含连击奖励）正常工作
- [ ] 关卡难度递增曲线合理
- [ ] 霓虹视觉效果完整
- [ ] 音效系统正常工作
- [ ] 排行榜正确保存和显示 Top 10
- [ ] 性能达标（60 FPS, <100ms 响应）

---

## 可选扩展

如果时间允许，可以添加：
- 成就系统
- 更多关卡（6+ 关卡）
- Boss 战模式
- 难度选择（简单/普通/困难）
- 音频文件替换合成音
