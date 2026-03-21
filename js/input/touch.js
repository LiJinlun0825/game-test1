// js/input/touch.js - 触摸输入
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