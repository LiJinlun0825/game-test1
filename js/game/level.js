// js/game/level.js - 关卡管理系统

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
    if (this.game.audio) {
      this.game.audio.playSpawn();
    }
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
      if (this.game.audio) {
        this.game.audio.playLevelUp();
      }
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