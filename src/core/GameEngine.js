/**
 * Game Engine
 * 游戏引擎 - 游戏的主控制器
 */

import { Game } from '../models/Game.js';
import { StateManager } from './StateManager.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { createPiece } from '../models/Piece.js';
import { GAME_CONFIG, positionToIndices } from '../config/game-config.js';
import {
  validateCastleMove,
  validateRotation,
  validateLaserFire,
  validateTurnOperation,
  checkGameOver
} from '../utils/validation.js';
import { emit, GAME_EVENTS } from './EventBus.js';

export class GameEngine {
  constructor(settings = {}) {
    // 创建游戏实例
    this.game = new Game(settings);

    // 创建子系统
    this.stateManager = new StateManager(this.game);
    this.physicsEngine = new PhysicsEngine(this.game);

    // 初始化棋盘布局
    this.initializeBoard();

    // 发布游戏创建事件
    emit(GAME_EVENTS.GAME_CREATED, { gameId: this.game.id });
  }

  /**
   * 初始化棋盘布局
   * @private
   */
  initializeBoard() {
    const setup = GAME_CONFIG.INITIAL_SETUP;

    // 放置白方棋子
    this.placePiecesForSide(setup.white, 'white');

    // 放置黑方棋子
    this.placePiecesForSide(setup.black, 'black');
  }

  /**
   * 为指定方放置棋子
   * @private
   */
  placePiecesForSide(sideSetup, owner) {
    const allPieces = [
      ...(sideSetup.row1 || []),
      ...(sideSetup.row2 || []),
      ...(sideSetup.row6 || []),
      ...(sideSetup.row7 || [])
    ];

    allPieces.forEach(pieceConfig => {
      const position = positionToIndices(pieceConfig.pos);
      const piece = createPiece({
        type: pieceConfig.type,
        owner,
        position,
        direction: pieceConfig.direction
      });

      this.game.board.placePiece(piece, position);
    });
  }

  /**
   * 开始游戏
   */
  startGame() {
    this.stateManager.startGame();
    emit(GAME_EVENTS.TURN_STARTED, {
      player: this.game.getCurrentPlayer().id,
      moveNumber: this.game.currentMoveNumber
    });
  }

  /**
   * 移动棋子
   * @param {Object} from - 起始位置
   * @param {Object} to - 目标位置
   * @returns {Object} { success: boolean, reason: string }
   */
  movePiece(from, to) {
    const currentPlayer = this.game.getCurrentPlayer();
    const piece = this.game.board.getPieceAt(from);

    // 验证操作
    if (!this.stateManager.canPerformOperation('move')) {
      return { success: false, reason: '无法执行操作' };
    }

    if (!piece) {
      return { success: false, reason: '该位置没有棋子' };
    }

    const turnValidation = validateTurnOperation(
      'move',
      currentPlayer.id,
      piece.owner,
      this.game.state
    );

    if (!turnValidation.valid) {
      return { success: false, reason: turnValidation.reason };
    }

    // 验证移动
    const moveValidation = validateCastleMove(
      from,
      to,
      pos => this.game.board.hasPieceAt(pos)
    );

    if (!moveValidation.valid) {
      return { success: false, reason: moveValidation.reason };
    }

    // 执行移动
    this.game.board.movePiece(from, to);
    piece.moveTo(to);

    // 记录操作
    this.stateManager.recordOperation('move');
    this.game.addMoveToHistory({
      type: 'move',
      player: currentPlayer.id,
      piece: piece.type,
      from,
      to
    });

    // 发布事件
    emit(GAME_EVENTS.PIECE_MOVED, {
      piece: piece.toJSON(),
      from,
      to
    });

    return { success: true };
  }

  /**
   * 旋转棋子
   * @param {Object} position - 棋子位置
   * @param {string} direction - 新方向（或 'clockwise'/'counterclockwise'）
   * @returns {Object} { success: boolean, reason: string }
   */
  rotatePiece(position, direction) {
    const currentPlayer = this.game.getCurrentPlayer();
    const piece = this.game.board.getPieceAt(position);

    // 验证操作
    if (!this.stateManager.canPerformOperation('rotate')) {
      return { success: false, reason: '无法执行操作' };
    }

    if (!piece) {
      return { success: false, reason: '该位置没有棋子' };
    }

    const turnValidation = validateTurnOperation(
      'rotate',
      currentPlayer.id,
      piece.owner,
      this.game.state
    );

    if (!turnValidation.valid) {
      return { success: false, reason: turnValidation.reason };
    }

    const oldDirection = piece.direction;

    // 执行旋转
    if (direction === 'clockwise') {
      piece.rotateClockwise();
    } else if (direction === 'counterclockwise') {
      piece.rotateCounterClockwise();
    } else {
      // 验证新方向
      const rotationValidation = validateRotation(
        piece.type,
        oldDirection,
        direction
      );

      if (!rotationValidation.valid) {
        return { success: false, reason: rotationValidation.reason };
      }

      piece.setDirection(direction);
    }

    // 记录操作
    this.stateManager.recordOperation('rotate');
    this.game.addMoveToHistory({
      type: 'rotate',
      player: currentPlayer.id,
      piece: piece.type,
      position,
      from: oldDirection,
      to: piece.direction
    });

    // 发布事件
    emit(GAME_EVENTS.PIECE_ROTATED, {
      piece: piece.toJSON(),
      oldDirection,
      newDirection: piece.direction
    });

    return { success: true };
  }

  /**
   * 发射激光
   * @returns {Object} { success: boolean, laserBeam: LaserBeam, gameOver: boolean }
   */
  fireLaser() {
    const currentPlayer = this.game.getCurrentPlayer();
    const turret = this.game.board.getTurret(currentPlayer.id);

    // 验证操作
    if (!this.stateManager.canPerformOperation('fireLaser')) {
      return { success: false, reason: '无法执行操作' };
    }

    if (!turret) {
      return { success: false, reason: '找不到炮塔' };
    }

    const fireValidation = validateLaserFire(
      turret.position,
      turret.direction,
      currentPlayer.id,
      currentPlayer
    );

    if (!fireValidation.valid) {
      return { success: false, reason: fireValidation.reason };
    }

    // 进入激光发射状态
    this.stateManager.enterLaserFiringState();

    // 发射激光
    const laserStart = turret.fireLaser();

    // 发布激光发射事件
    emit(GAME_EVENTS.LASER_FIRED, {
      player: currentPlayer.id,
      turret: turret.toJSON(),
      laserStart
    });

    // 计算激光路径
    const laserBeam = this.physicsEngine.calculateLaserPath(
      laserStart.position,
      laserStart.direction,
      currentPlayer.id
    );

    // 检查游戏是否结束
    const gameOverResult = this.physicsEngine.checkGameOverFromLaser(laserBeam);

    if (gameOverResult) {
      this.stateManager.endGame(gameOverResult.winner, gameOverResult.reason);
    } else {
      // 退出激光发射状态
      this.stateManager.exitLaserFiringState();
    }

    // 记录操作
    this.stateManager.recordOperation('fireLaser');
    this.game.addMoveToHistory({
      type: 'fireLaser',
      player: currentPlayer.id,
      turret: turret.toJSON(),
      hitPieces: this.physicsEngine.getHitPieces(laserBeam)
    });

    return {
      success: true,
      laserBeam,
      gameOver: gameOverResult !== null,
      gameOverResult
    };
  }

  /**
   * 结束回合
   */
  endTurn() {
    const currentPlayer = this.game.getCurrentPlayer();

    // 增加玩家移动计数
    currentPlayer.incrementMoveCount();

    // 发布回合结束事件
    emit(GAME_EVENTS.TURN_ENDED, {
      player: currentPlayer.id,
      moveNumber: this.game.currentMoveNumber
    });

    // 切换回合
    this.game.switchTurn();

    // 检查时间是否用尽
    this.checkTimeExpired();

    // 发布新回合开始事件
    if (!this.game.isGameOver()) {
      emit(GAME_EVENTS.TURN_STARTED, {
        player: this.game.getCurrentPlayer().id,
        moveNumber: this.game.currentMoveNumber
      });
    }
  }

  /**
   * 检查时间是否用尽
   * @private
   */
  checkTimeExpired() {
    const whiteTurretDestroyed = this.game.board.getTurret('white') === null;
    const blackTurretDestroyed = this.game.board.getTurret('black') === null;

    const whitePlayer = this.game.getPlayerById('white');
    const blackPlayer = this.game.getPlayerById('black');

    const gameOverResult = checkGameOver(
      whiteTurretDestroyed,
      blackTurretDestroyed,
      whitePlayer.timeLeft,
      blackPlayer.timeLeft
    );

    if (gameOverResult) {
      this.stateManager.endGame(gameOverResult.winner, gameOverResult.reason);
    }
  }

  /**
   * 更新玩家时间
   * @param {string} playerId
   * @param {number} deltaTime - 经过的时间（毫秒）
   */
  updatePlayerTime(playerId, deltaTime) {
    const player = this.game.getPlayerById(playerId);

    if (player) {
      player.decreaseTime(deltaTime);

      // 检查时间是否用尽
      if (player.isTimeExpired()) {
        emit(GAME_EVENTS.TIME_EXPIRED, { player: playerId });
        this.checkTimeExpired();
      }
    }
  }

  /**
   * 重新开始游戏
   */
  restartGame() {
    this.game.reset();
    this.initializeBoard();
    this.startGame();
  }

  /**
   * 获取游戏状态
   * @returns {Object}
   */
  getGameState() {
    return this.game.toJSON();
  }
}
