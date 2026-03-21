// js/game/leaderboard.js - 排行榜系统
export class Leaderboard {
  constructor() {
    this.storageKey = 'neonTarget';
    this.maxScores = 10;
  }

  saveScore(scoreData) {
    const data = this.getData();
    data.highScores.push(scoreData);

    // 按分数降序排序
    data.highScores.sort((a, b) => b.score - a.score);

    // 只保留 Top 10
    data.highScores = data.highScores.slice(0, this.maxScores);

    this.saveData(data);
  }

  getScores() {
    return this.getData().highScores;
  }

  getStats() {
    return this.getData().stats;
  }

  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load leaderboard data');
    }

    return {
      highScores: [],
      stats: {
        totalGames: 0,
        totalHits: 0,
        bestCombo: 0,
        headshots: 0,
      },
      settings: {
        volume: 0.7,
        difficulty: 'normal',
      },
    };
  }

  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save leaderboard data');
    }
  }

  updateStats(updates) {
    const data = this.getData();
    Object.assign(data.stats, updates);
    this.saveData(data);
  }
}