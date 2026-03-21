// js/game/state.js - 游戏状态机
export class GameState {
  constructor() {
    this.current = 'menu';
    this.validStates = ['menu', 'playing', 'paused', 'gameover', 'level_complete'];
  }

  set(newState) {
    if (!this.validStates.includes(newState)) {
      console.warn(`Invalid state: ${newState}`);
      return;
    }
    this.current = newState;
  }

  // 别名方法，保持API兼容性
  setState(newState) {
    this.set(newState);
  }

  is(targetState) {
    return this.current === targetState;
  }

  transition(newState) {
    const transitions = {
      'menu': ['playing'],
      'playing': ['paused', 'gameover', 'level_complete'],
      'paused': ['playing', 'menu'],
      'gameover': ['menu', 'playing'],
      'level_complete': ['playing', 'gameover'],
    };

    if (transitions[this.current]?.includes(newState)) {
      this.set(newState);
      return true;
    }

    console.warn(`Invalid transition: ${this.current} -> ${newState}`);
    return false;
  }
}