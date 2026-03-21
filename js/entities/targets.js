// js/entities/targets.js - 5 种靶子类型
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
    if (game && game.levelManager) {
      game.levelManager.timeRemaining += 5; // 奖励 5 秒
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