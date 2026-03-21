/**
 * 生命值组件
 */
export class Health {
  constructor(maxHealth = 100) {
    this.entity = null;

    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;

    // 回调
    this.onDamage = null;
    this.onHeal = null;
    this.onDeath = null;

    // 无敌状态
    this.isInvincible = false;
    this.invincibleTime = 0;
  }

  /**
   * 设置所属实体
   */
  setEntity(entity) {
    this.entity = entity;
  }

  /**
   * 初始化
   */
  init() {
    // 初始化完成
  }

  /**
   * 受伤
   */
  takeDamage(amount) {
    if (this.isDead() || this.isInvincible) return false;

    this.currentHealth = Math.max(0, this.currentHealth - amount);

    // 触发受伤回调
    if (this.onDamage) {
      this.onDamage(amount);
    }

    // 检查死亡
    if (this.isDead() && this.onDeath) {
      this.onDeath();
    }

    return true;
  }

  /**
   * 治疗
   */
  heal(amount) {
    if (this.isDead()) return false;

    const oldHealth = this.currentHealth;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);

    const healAmount = this.currentHealth - oldHealth;

    // 触发治疗回调
    if (healAmount > 0 && this.onHeal) {
      this.onHeal(healAmount);
    }

    return healAmount > 0;
  }

  /**
   * 是否死亡
   */
  isDead() {
    return this.currentHealth <= 0;
  }

  /**
   * 获取生命值百分比
   */
  getHealthPercent() {
    return this.currentHealth / this.maxHealth;
  }

  /**
   * 设置无敌状态
   */
  setInvincible(duration = 0) {
    this.isInvincible = true;
    this.invincibleTime = duration;
  }

  /**
   * 更新
   */
  update(deltaTime) {
    // 更新无敌时间
    if (this.isInvincible && this.invincibleTime > 0) {
      this.invincibleTime -= deltaTime;
      if (this.invincibleTime <= 0) {
        this.isInvincible = false;
        this.invincibleTime = 0;
      }
    }
  }

  /**
   * 重置
   */
  reset() {
    this.currentHealth = this.maxHealth;
    this.isInvincible = false;
    this.invincibleTime = 0;
  }

  /**
   * 销毁
   */
  destroy() {
    this.onDamage = null;
    this.onHeal = null;
    this.onDeath = null;
  }
}