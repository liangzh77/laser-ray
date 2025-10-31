/**
 * Player Model
 * 玩家模型
 */

import { GAME_CONFIG } from '../config/game-config.js';

export class Player {
  /**
   * @param {Object} config
   * @param {string} config.id - 玩家ID（'white' 或 'black'）
   * @param {string} config.color - 玩家颜色
   * @param {string} config.timeMode - 时间模式ID
   */
  constructor({ id, color, timeMode }) {
    this.id = id;
    this.color = color;
    this.name = id === 'white' ? '白方' : '黑方';

    // 时间管理
    const timeModeConfig = Object.values(GAME_CONFIG.TIME_MODES).find(m => m.id === timeMode);
    this.timeLeft = timeModeConfig ? timeModeConfig.initialTime : Infinity;
    this.timeIncrement = timeModeConfig ? timeModeConfig.increment : 0;

    // 统计信息
    this.moveCount = 0;
    this.piecesLost = 0;
  }

  /**
   * 减少剩余时间
   * @param {number} ms - 减少的毫秒数
   */
  decreaseTime(ms) {
    if (this.timeLeft !== Infinity) {
      this.timeLeft = Math.max(0, this.timeLeft - ms);
    }
  }

  /**
   * 增加回合时间（时间增量）
   */
  addTimeIncrement() {
    if (this.timeLeft !== Infinity && this.timeIncrement > 0) {
      this.timeLeft += this.timeIncrement;
    }
  }

  /**
   * 检查时间是否用尽
   * @returns {boolean}
   */
  isTimeExpired() {
    return this.timeLeft <= 0 && this.timeLeft !== Infinity;
  }

  /**
   * 增加移动计数
   */
  incrementMoveCount() {
    this.moveCount++;
  }

  /**
   * 记录失去的棋子
   */
  incrementPiecesLost() {
    this.piecesLost++;
  }

  /**
   * 获取格式化的剩余时间
   * @returns {string} 格式化时间（例如："10:30"）
   */
  getFormattedTime() {
    if (this.timeLeft === Infinity) {
      return '∞';
    }

    const totalSeconds = Math.floor(this.timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 获取JSON表示
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      color: this.color,
      name: this.name,
      timeLeft: this.timeLeft,
      timeIncrement: this.timeIncrement,
      moveCount: this.moveCount,
      piecesLost: this.piecesLost
    };
  }

  /**
   * 克隆玩家
   * @returns {Player}
   */
  clone() {
    const cloned = new Player({
      id: this.id,
      color: this.color,
      timeMode: this.timeLeft === Infinity ? 'unlimited' : '10+0'
    });
    cloned.timeLeft = this.timeLeft;
    cloned.timeIncrement = this.timeIncrement;
    cloned.moveCount = this.moveCount;
    cloned.piecesLost = this.piecesLost;
    return cloned;
  }
}
