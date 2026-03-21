// js/game/score.js - 计分系统
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
    if (this.game.audio) {
      if (isHeadshot) {
        this.game.audio.playHeadshot();
      } else {
        this.game.audio.playHit();
      }

      // 连击音效
      if (this.combo % this.comboThreshold === 0) {
        this.game.audio.playCombo(this.combo);
      }
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