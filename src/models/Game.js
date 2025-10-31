/**
 * Game Model
 * 游戏模型 - 表示完整的游戏状态
 */

import { GAME_CONFIG } from '../config/game-config.js';
import { Board } from './Board.js';
import { Player } from './Player.js';

export class Game {
  /**
   * @param {Object} settings
   * @param {string} settings.timeMode - 时间模式ID
   */
  constructor(settings = {}) {
    this.id = this.generateId();

    // 游戏设置
    this.settings = {
      timeMode: settings.timeMode || '10+0',
      boardSize: { ...GAME_CONFIG.BOARD.SIZE }
    };

    // 初始化棋盘
    this.board = new Board();

    // 初始化玩家
    this.players = [
      new Player({
        id: GAME_CONFIG.PLAYERS.WHITE.id,
        color: GAME_CONFIG.PLAYERS.WHITE.color,
        timeMode: this.settings.timeMode
      }),
      new Player({
        id: GAME_CONFIG.PLAYERS.BLACK.id,
        color: GAME_CONFIG.PLAYERS.BLACK.color,
        timeMode: this.settings.timeMode
      })
    ];

    // 游戏状态
    this.state = GAME_CONFIG.GAME_STATES.WAITING;
    this.currentPlayerIndex = 0; // 白方先手
    this.winner = null;
    this.winReason = null;

    // 时间戳
    this.createdAt = Date.now();
    this.startedAt = null;
    this.endedAt = null;

    // 游戏历史
    this.moveHistory = [];
    this.currentMoveNumber = 0;

    // 当前回合的操作状态
    this.currentOperation = null; // 'move', 'rotate', 'fireLaser'
  }

  /**
   * 生成唯一ID
   * @private
   */
  generateId() {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 开始游戏
   */
  start() {
    this.state = GAME_CONFIG.GAME_STATES.PLAYING;
    this.startedAt = Date.now();
  }

  /**
   * 结束游戏
   * @param {string} winner - 获胜者ID
   * @param {string} reason - 获胜原因
   */
  end(winner, reason) {
    this.state = GAME_CONFIG.GAME_STATES.GAME_OVER;
    this.winner = winner;
    this.winReason = reason;
    this.endedAt = Date.now();
  }

  /**
   * 获取当前玩家
   * @returns {Player}
   */
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  /**
   * 获取对手
   * @returns {Player}
   */
  getOpponent() {
    return this.players[1 - this.currentPlayerIndex];
  }

  /**
   * 根据ID获取玩家
   * @param {string} playerId
   * @returns {Player|null}
   */
  getPlayerById(playerId) {
    return this.players.find(p => p.id === playerId) || null;
  }

  /**
   * 切换回合
   */
  switchTurn() {
    // 给当前玩家增加时间增量
    this.getCurrentPlayer().addTimeIncrement();

    // 切换到对手
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;

    // 增加回合数
    this.currentMoveNumber++;

    // 清空当前操作
    this.currentOperation = null;
  }

  /**
   * 记录移动到历史
   * @param {Object} move - 移动记录
   */
  addMoveToHistory(move) {
    this.moveHistory.push({
      ...move,
      moveNumber: this.currentMoveNumber,
      timestamp: Date.now()
    });
  }

  /**
   * 设置当前操作
   * @param {string} operation - 操作类型
   */
  setCurrentOperation(operation) {
    this.currentOperation = operation;
  }

  /**
   * 清空当前操作（结束回合时调用）
   */
  clearCurrentOperation() {
    this.currentOperation = null;
  }

  /**
   * 检查当前回合是否已执行操作
   * @returns {boolean}
   */
  hasOperationThisTurn() {
    return this.currentOperation !== null;
  }

  /**
   * 检查游戏是否正在进行
   * @returns {boolean}
   */
  isPlaying() {
    return this.state === GAME_CONFIG.GAME_STATES.PLAYING;
  }

  /**
   * 检查游戏是否结束
   * @returns {boolean}
   */
  isGameOver() {
    return this.state === GAME_CONFIG.GAME_STATES.GAME_OVER;
  }

  /**
   * 检查是否在等待开始
   * @returns {boolean}
   */
  isWaiting() {
    return this.state === GAME_CONFIG.GAME_STATES.WAITING;
  }

  /**
   * 检查是否在发射激光
   * @returns {boolean}
   */
  isFiringLaser() {
    return this.state === GAME_CONFIG.GAME_STATES.LASER_FIRING;
  }

  /**
   * 设置游戏状态
   * @param {string} newState
   */
  setState(newState) {
    this.state = newState;
  }

  /**
   * 获取游戏时长（毫秒）
   * @returns {number}
   */
  getGameDuration() {
    if (!this.startedAt) {
      return 0;
    }

    const endTime = this.endedAt || Date.now();
    return endTime - this.startedAt;
  }

  /**
   * 获取格式化的游戏时长
   * @returns {string}
   */
  getFormattedDuration() {
    const ms = this.getGameDuration();
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 重置游戏（重新开始）
   */
  reset() {
    // 清空棋盘
    this.board.clear();

    // 重置玩家
    this.players.forEach(player => {
      const timeModeConfig = Object.values(GAME_CONFIG.TIME_MODES).find(
        m => m.id === this.settings.timeMode
      );
      player.timeLeft = timeModeConfig ? timeModeConfig.initialTime : Infinity;
      player.moveCount = 0;
      player.piecesLost = 0;
    });

    // 重置游戏状态
    this.state = GAME_CONFIG.GAME_STATES.WAITING;
    this.currentPlayerIndex = 0;
    this.winner = null;
    this.winReason = null;
    this.startedAt = null;
    this.endedAt = null;
    this.moveHistory = [];
    this.currentMoveNumber = 0;
    this.currentOperation = null;
  }

  /**
   * 克隆游戏状态（用于预测和回滚）
   * @returns {Game}
   */
  clone() {
    const cloned = new Game(this.settings);
    cloned.id = this.id;
    cloned.board = this.board.clone();
    cloned.players = this.players.map(p => p.clone());
    cloned.state = this.state;
    cloned.currentPlayerIndex = this.currentPlayerIndex;
    cloned.winner = this.winner;
    cloned.winReason = this.winReason;
    cloned.createdAt = this.createdAt;
    cloned.startedAt = this.startedAt;
    cloned.endedAt = this.endedAt;
    cloned.currentMoveNumber = this.currentMoveNumber;
    cloned.currentOperation = this.currentOperation;
    // 不复制历史记录，因为通常用于预测
    return cloned;
  }

  /**
   * 获取JSON表示
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      settings: { ...this.settings },
      board: this.board.toJSON(),
      players: this.players.map(p => p.toJSON()),
      state: this.state,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayer: this.getCurrentPlayer().id,
      winner: this.winner,
      winReason: this.winReason,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      moveHistory: [...this.moveHistory],
      currentMoveNumber: this.currentMoveNumber,
      currentOperation: this.currentOperation,
      gameDuration: this.getFormattedDuration()
    };
  }
}
