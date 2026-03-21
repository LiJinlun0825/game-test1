// js/entities/target.js - 靶子基类
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