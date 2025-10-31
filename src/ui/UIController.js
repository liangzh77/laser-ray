/**
 * UI Controller
 * UI控制器 - 管理用户界面交互
 */

import { on, GAME_EVENTS } from '../core/EventBus.js';

export class UIController {
  constructor(gameEngine, boardRenderer) {
    this.gameEngine = gameEngine;
    this.boardRenderer = boardRenderer;

    this.selectedPiece = null;
    this.validMoves = [];

    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听游戏事件
    on(GAME_EVENTS.GAME_STARTED, () => this.onGameStarted());
    on(GAME_EVENTS.GAME_ENDED, (data) => this.onGameEnded(data));
    on(GAME_EVENTS.PIECE_MOVED, () => this.render());
    on(GAME_EVENTS.PIECE_ROTATED, () => this.render());
    on(GAME_EVENTS.PIECE_DESTROYED, () => this.render());
    on(GAME_EVENTS.TURN_STARTED, (data) => this.onTurnStarted(data));
  }

  /**
   * 渲染UI
   */
  render() {
    this.boardRenderer.render(this.gameEngine.game.board);

    // 如果有选中的棋子，高亮可移动位置
    if (this.selectedPiece && this.validMoves.length > 0) {
      this.boardRenderer.highlightCells(this.validMoves, 'rgba(0, 255, 0, 0.3)');
    }
  }

  /**
   * 处理棋盘点击
   * @param {Object} position - { col, row }
   */
  handleBoardClick(position) {
    const piece = this.gameEngine.game.board.getPieceAt(position);

    if (this.selectedPiece) {
      // 已有选中的棋子
      if (piece && piece.id === this.selectedPiece.id) {
        // 点击相同棋子 -> 取消选中
        this.deselectPiece();
      } else {
        // 尝试移动到新位置
        this.attemptMove(position);
      }
    } else {
      // 没有选中的棋子 -> 尝试选中
      if (piece) {
        this.selectPiece(piece);
      }
    }
  }

  /**
   * 选中棋子
   * @private
   */
  selectPiece(piece) {
    const currentPlayer = this.gameEngine.game.getCurrentPlayer();

    // 只能选中己方棋子
    if (piece.owner !== currentPlayer.id) {
      return;
    }

    this.selectedPiece = piece;

    // 计算可移动位置
    const { getValidCastleMoves } = require('../utils/validation.js');
    this.validMoves = getValidCastleMoves(
      piece.position,
      pos => this.gameEngine.game.board.hasPieceAt(pos)
    );

    this.render();
  }

  /**
   * 取消选中棋子
   * @private
   */
  deselectPiece() {
    this.selectedPiece = null;
    this.validMoves = [];
    this.render();
  }

  /**
   * 尝试移动棋子
   * @private
   */
  attemptMove(to) {
    if (!this.selectedPiece) return;

    const result = this.gameEngine.movePiece(this.selectedPiece.position, to);

    if (result.success) {
      this.deselectPiece();
      // 移动成功后自动结束回合
      this.gameEngine.endTurn();
    } else {
      console.log('移动失败:', result.reason);
    }
  }

  /**
   * 游戏开始事件处理
   * @private
   */
  onGameStarted() {
    this.render();
    this.updateStatus('游戏开始！白方先手');
  }

  /**
   * 游戏结束事件处理
   * @private
   */
  onGameEnded(data) {
    const winner = data.winner === 'white' ? '白方' : '黑方';
    this.updateStatus(`游戏结束！${winner}获胜 - ${data.reason}`);
  }

  /**
   * 回合开始事件处理
   * @private
   */
  onTurnStarted(data) {
    const player = data.player === 'white' ? '白方' : '黑方';
    this.updateStatus(`${player}的回合`);
  }

  /**
   * 更新状态显示
   * @private
   */
  updateStatus(message) {
    // 这里应该更新DOM中的状态显示
    console.log('状态:', message);
  }
}
