// js/render/renderer.js - 主渲染器
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