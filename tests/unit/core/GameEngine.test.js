/**
 * Game Engine Unit Tests
 * 测试游戏引擎胜利条件检查（T076）
 */

import { GameEngine } from '../../../src/core/GameEngine.js';
import { createPiece } from '../../../src/models/Piece.js';

describe('Game Engine - 胜利条件检查', () => {
  let engine;

  beforeEach(() => {
    engine = new GameEngine({ timeMode: 'unlimited' });
    engine.startGame();
  });

  describe('炮塔摧毁胜利', () => {
    test('白方炮塔被摧毁应该黑方获胜', () => {
      // 清空棋盘创建测试场景
      engine.game.board.clear();

      // 白方炮塔
      const whiteTurret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(whiteTurret, { col: 3, row: 6 });

      // 黑方炮塔（发射激光）
      const blackTurret = createPiece({
        type: 'turret',
        owner: 'black',
        position: { col: 3, row: 0 },
        direction: 'down'
      });
      engine.game.board.placePiece(blackTurret, { col: 3, row: 0 });

      // 切换到黑方回合
      engine.game.switchTurn();

      // 黑方发射激光击中白方炮塔
      const result = engine.fireLaser();

      expect(result.gameOver).toBe(true);
      expect(result.gameOverResult.winner).toBe('black');
      expect(result.gameOverResult.reason).toBe('turret_destroyed');
    });

    test('黑方炮塔被摧毁应该白方获胜', () => {
      engine.game.board.clear();

      // 黑方炮塔
      const blackTurret = createPiece({
        type: 'turret',
        owner: 'black',
        position: { col: 3, row: 0 },
        direction: 'down'
      });
      engine.game.board.placePiece(blackTurret, { col: 3, row: 0 });

      // 白方炮塔（发射激光）
      const whiteTurret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(whiteTurret, { col: 3, row: 6 });

      // 白方发射激光击中黑方炮塔
      const result = engine.fireLaser();

      expect(result.gameOver).toBe(true);
      expect(result.gameOverResult.winner).toBe('white');
      expect(result.gameOverResult.reason).toBe('turret_destroyed');
    });
  });

  describe('时间耗尽胜利', () => {
    test('白方时间耗尽应该黑方获胜', () => {
      engine = new GameEngine({ timeMode: '10+0' });
      engine.startGame();

      const whitePlayer = engine.game.getPlayerById('white');

      // 减少白方时间到0
      whitePlayer.timeLeft = 0;

      // 检查时间耗尽
      engine.checkTimeExpired();

      expect(engine.game.isGameOver()).toBe(true);
      expect(engine.game.winner).toBe('black');
      expect(engine.game.winReason).toContain('时间');
    });

    test('黑方时间耗尽应该白方获胜', () => {
      engine = new GameEngine({ timeMode: '10+0' });
      engine.startGame();

      const blackPlayer = engine.game.getPlayerById('black');

      // 减少黑方时间到0
      blackPlayer.timeLeft = 0;

      // 检查时间耗尽
      engine.checkTimeExpired();

      expect(engine.game.isGameOver()).toBe(true);
      expect(engine.game.winner).toBe('white');
      expect(engine.game.winReason).toContain('时间');
    });

    test('无限时间模式不应该因时间耗尽结束', () => {
      // unlimited模式
      const whitePlayer = engine.game.getPlayerById('white');
      const blackPlayer = engine.game.getPlayerById('black');

      // 时间应该是Infinity
      expect(whitePlayer.timeLeft).toBe(Infinity);
      expect(blackPlayer.timeLeft).toBe(Infinity);

      // 检查时间耗尽
      engine.checkTimeExpired();

      // 游戏不应该结束
      expect(engine.game.isGameOver()).toBe(false);
    });
  });

  describe('游戏状态转换', () => {
    test('游戏结束后应该进入gameOver状态', () => {
      engine.game.board.clear();

      const whiteTurret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(whiteTurret, { col: 3, row: 6 });

      const blackTurret = createPiece({
        type: 'turret',
        owner: 'black',
        position: { col: 3, row: 0 },
        direction: 'down'
      });
      engine.game.board.placePiece(blackTurret, { col: 3, row: 0 });

      engine.game.switchTurn();
      engine.fireLaser();

      expect(engine.game.state).toBe('gameOver');
    });

    test('游戏结束后不应该能执行操作', () => {
      engine.game.board.clear();

      const whiteTurret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(whiteTurret, { col: 3, row: 6 });

      const mirror = createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'up'
      });
      engine.game.board.placePiece(mirror, { col: 3, row: 3 });

      // 结束游戏
      engine.stateManager.endGame('white', 'test');

      // 尝试移动棋子（应该失败）
      const result = engine.movePiece({ col: 3, row: 3 }, { col: 4, row: 3 });

      expect(result.success).toBe(false);
      expect(result.reason).toContain('未在进行中');
    });
  });

  describe('游戏时长统计', () => {
    test('应该能获取游戏时长', () => {
      engine.startGame();

      // 等待一小段时间
      const duration = engine.game.getGameDuration();

      expect(duration).toBeGreaterThanOrEqual(0);
    });

    test('游戏结束后时长应该固定', (done) => {
      engine.game.board.clear();

      const whiteTurret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(whiteTurret, { col: 3, row: 6 });

      const blackTurret = createPiece({
        type: 'turret',
        owner: 'black',
        position: { col: 3, row: 0 },
        direction: 'down'
      });
      engine.game.board.placePiece(blackTurret, { col: 3, row: 0 });

      engine.game.switchTurn();
      engine.fireLaser();

      const durationAtEnd = engine.game.getGameDuration();

      setTimeout(() => {
        const durationLater = engine.game.getGameDuration();

        // 时长应该相同（游戏已结束）
        expect(durationLater).toBe(durationAtEnd);
        done();
      }, 100);
    });
  });

  describe('重新开始游戏', () => {
    test('应该能重新开始游戏', () => {
      // 进行一些操作
      engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });
      engine.endTurn();

      // 记录棋子位置
      const pieceBeforeRestart = engine.game.board.getPieceAt({ col: 0, row: 4 });
      expect(pieceBeforeRestart).toBeDefined();

      // 重新开始
      engine.restartGame();

      // 棋子应该回到初始位置
      const pieceAtOriginal = engine.game.board.getPieceAt({ col: 0, row: 5 });
      expect(pieceAtOriginal).toBeDefined();

      const pieceAtMoved = engine.game.board.getPieceAt({ col: 0, row: 4 });
      expect(pieceAtMoved).toBeNull();

      // 游戏状态应该是playing
      expect(engine.game.isPlaying()).toBe(true);

      // 回合应该重置为白方
      expect(engine.game.getCurrentPlayer().id).toBe('white');
    });

    test('重新开始后移动历史应该清空', () => {
      engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });
      engine.endTurn();

      expect(engine.game.moveHistory.length).toBeGreaterThan(0);

      engine.restartGame();

      expect(engine.game.moveHistory.length).toBe(0);
    });
  });

  describe('获胜者判定', () => {
    test('应该正确判定炮塔被摧毁的获胜者', () => {
      engine.game.board.clear();

      // 白方炮塔（会被摧毁）
      const whiteTurret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(whiteTurret, { col: 3, row: 6 });

      // 黑方炮塔
      const blackTurret = createPiece({
        type: 'turret',
        owner: 'black',
        position: { col: 3, row: 0 },
        direction: 'down'
      });
      engine.game.board.placePiece(blackTurret, { col: 3, row: 0 });

      engine.game.switchTurn();
      const result = engine.fireLaser();

      expect(result.gameOverResult.winner).toBe('black');
      expect(engine.game.winner).toBe('black');
    });

    test('应该正确记录获胜原因', () => {
      engine.game.board.clear();

      const whiteTurret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(whiteTurret, { col: 3, row: 6 });

      const blackTurret = createPiece({
        type: 'turret',
        owner: 'black',
        position: { col: 3, row: 0 },
        direction: 'down'
      });
      engine.game.board.placePiece(blackTurret, { col: 3, row: 0 });

      engine.game.switchTurn();
      engine.fireLaser();

      expect(engine.game.winReason).toBe('turret_destroyed');
    });
  });

  describe('游戏状态获取', () => {
    test('应该能获取完整的游戏状态', () => {
      const gameState = engine.getGameState();

      expect(gameState).toHaveProperty('id');
      expect(gameState).toHaveProperty('state');
      expect(gameState).toHaveProperty('players');
      expect(gameState).toHaveProperty('currentPlayerIndex');
      expect(gameState).toHaveProperty('moveHistory');
      expect(gameState).toHaveProperty('startTime');
    });

    test('游戏状态应该包含获胜信息', () => {
      engine.game.board.clear();

      const whiteTurret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(whiteTurret, { col: 3, row: 6 });

      const blackTurret = createPiece({
        type: 'turret',
        owner: 'black',
        position: { col: 3, row: 0 },
        direction: 'down'
      });
      engine.game.board.placePiece(blackTurret, { col: 3, row: 0 });

      engine.game.switchTurn();
      engine.fireLaser();

      const gameState = engine.getGameState();

      expect(gameState.winner).toBe('black');
      expect(gameState.winReason).toBe('turret_destroyed');
      expect(gameState.endTime).toBeDefined();
    });
  });
});
