/**
 * AI控制器
 * 有限状态机实现AI行为
 */
export class AIController {
  constructor(enemy) {
    this.enemy = enemy;
    this.state = 'patrol';
    this.target = null;
    this.detectionRange = 50;
    this.attackRange = 30;
    this.moveSpeed = 3;
  }

  setState(state) {
    this.state = state;
  }

  update(deltaTime, player) {
    if (!this.enemy || this.enemy.isDead()) return;

    const distToPlayer = this.enemy.position.distanceTo(player.position);

    // 状态转换
    if (this.enemy.health.getHealthPercent() < 0.3) {
      this.state = 'flee';
    } else if (distToPlayer <= this.attackRange) {
      this.state = 'attack';
    } else if (distToPlayer <= this.detectionRange) {
      this.state = 'chase';
    }
  }
}