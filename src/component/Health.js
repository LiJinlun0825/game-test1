/**
 * 生命值组件
 */
export class Health {
  constructor(maxHealth = 100) {
    this.max = maxHealth;
    this.current = maxHealth;
  }

  /**
   * 受到伤害
   */
  damage(amount) {
    this.current = Math.max(0, this.current - amount);
    return this.current <= 0;
  }

  /**
   * 治疗
   */
  heal(amount) {
    this.current = Math.min(this.max, this.current + amount);
  }

  /**
   * 重置
   */
  reset() {
    this.current = this.max;
  }

  /**
   * 是否死亡
   */
  isDead() {
    return this.current <= 0;
  }

  /**
   * 获取生命值百分比
   */
  getHealthPercent() {
    return this.current / this.max;
  }
}