// js/input/mouse.js - 鼠标输入
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