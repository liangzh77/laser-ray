/**
 * State Manager
 * 状态管理器 - 管理游戏状态和状态转换
 */

import { GAME_CONFIG } from '../config/game-config.js';
import { validateStateTransition } from '../utils/validation.js';
import { emit, GAME_EVENTS } from './EventBus.js';

export class StateManager {
  constructor(game) {
    this.game = game;
    this.stateHistory = []; // 状态历史（用于撤销）
    this.maxHistorySize = 50;
  }

  /**
   * 改变游戏状态
   * @param {string} newState
   * @param {Object} metadata - 状态改变的元数据
   */
  changeState(newState, metadata = {}) {
    const currentState = this.game.state;

    // 验证状态转换
    const validation = validateStateTransition(currentState, newState);
    if (!validation.valid) {
      console.error(`Invalid state transition: ${validation.reason}`);
      return false;
    }

    // 保存当前状态到历史
    this.saveStateToHistory(currentState);

    // 更新状态
    this.game.setState(newState);

    // 发布状态变化事件
    emit(GAME_EVENTS.STATE_CHANGED, {
      from: currentState,
      to: newState,
      metadata
    });

    return true;
  }

  /**
   * 开始游戏
   */
  startGame() {
    if (this.game.isWaiting()) {
      this.game.start();
      this.changeState(GAME_CONFIG.GAME_STATES.PLAYING, { action: 'start' });
      emit(GAME_EVENTS.GAME_STARTED, { gameId: this.game.id });
    }
  }

  /**
   * 结束游戏
   * @param {string} winner - 获胜者ID
   * @param {string} reason - 获胜原因
   */
  endGame(winner, reason) {
    if (!this.game.isGameOver()) {
      this.game.end(winner, reason);
      this.changeState(GAME_CONFIG.GAME_STATES.GAME_OVER, { winner, reason });
      emit(GAME_EVENTS.GAME_ENDED, {
        gameId: this.game.id,
        winner,
        reason,
        duration: this.game.getGameDuration()
      });
    }
  }

  /**
   * 进入激光发射状态
   */
  enterLaserFiringState() {
    this.changeState(GAME_CONFIG.GAME_STATES.LASER_FIRING, { action: 'fire_laser' });
  }

  /**
   * 退出激光发射状态
   */
  exitLaserFiringState() {
    this.changeState(GAME_CONFIG.GAME_STATES.PLAYING, { action: 'laser_finished' });
  }

  /**
   * 保存状态到历史
   * @private
   */
  saveStateToHistory(state) {
    this.stateHistory.push({
      state,
      timestamp: Date.now()
    });

    // 限制历史大小
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  /**
   * 获取当前状态
   * @returns {string}
   */
  getCurrentState() {
    return this.game.state;
  }

  /**
   * 获取状态历史
   * @returns {Array}
   */
  getStateHistory() {
    return [...this.stateHistory];
  }

  /**
   * 检查是否可以执行操作
   * @param {string} operation - 操作类型
   * @returns {boolean}
   */
  canPerformOperation(operation) {
    // 只有在PLAYING状态才能执行操作
    if (!this.game.isPlaying()) {
      return false;
    }

    // 每回合只能执行一次操作
    if (this.game.hasOperationThisTurn()) {
      return false;
    }

    return true;
  }

  /**
   * 记录操作
   * @param {string} operation - 操作类型
   */
  recordOperation(operation) {
    this.game.setCurrentOperation(operation);
  }

  /**
   * 清空状态历史
   */
  clearHistory() {
    this.stateHistory = [];
  }
}
