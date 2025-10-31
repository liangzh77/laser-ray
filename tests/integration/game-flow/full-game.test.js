/**
 * Full Game Flow Integration Tests
 * 测试完整游戏流程（T077）
 */

import { GameEngine } from '../../../src/core/GameEngine.js';
import { createPiece } from '../../../src/models/Piece.js';

describe('完整游戏流程集成测试', () => {
  let engine;

  beforeEach(() => {
    engine = new GameEngine({ timeMode: '10+0' });
  });

  describe('完整游戏循环', () => {
    test('应该能完成一个完整的游戏流程：开始→移动→发射→结束', () => {
      // 1. 开始游戏
      engine.startGame();
      expect(engine.game.isPlaying()).toBe(true);
      expect(engine.game.getCurrentPlayer().id).toBe('white');

      // 2. 白方移动棋子
      const moveResult = engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });
      expect(moveResult.success).toBe(true);

      // 3. 结束白方回合
      engine.endTurn();
      expect(engine.game.getCurrentPlayer().id).toBe('black');

      // 4. 黑方移动棋子
      const blackMoveResult = engine.movePiece({ col: 0, row: 1 }, { col: 0, row: 2 });
      expect(blackMoveResult.success).toBe(true);

      // 5. 结束黑方回合
      engine.endTurn();
      expect(engine.game.getCurrentPlayer().id).toBe('white');

      // 验证移动历史
      expect(engine.game.moveHistory.length).toBeGreaterThanOrEqual(2);
    });

    test('应该能完成激光击败对手的完整流程', () => {
      // 创建简单场景：白方炮塔可以直接击中黑方炮塔
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

      engine.startGame();

      // 白方发射激光
      const laserResult = engine.fireLaser();

      // 游戏应该结束，白方获胜
      expect(laserResult.gameOver).toBe(true);
      expect(laserResult.gameOverResult.winner).toBe('white');
      expect(engine.game.isGameOver()).toBe(true);
    });
  });

  describe('回合管理', () => {
    test('应该正确管理回合切换', () => {
      engine.startGame();

      expect(engine.game.getCurrentPlayer().id).toBe('white');
      expect(engine.game.currentMoveNumber).toBe(1);

      // 白方操作并结束回合
      engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });
      engine.endTurn();

      expect(engine.game.getCurrentPlayer().id).toBe('black');
      expect(engine.game.currentMoveNumber).toBe(2);

      // 黑方操作并结束回合
      engine.movePiece({ col: 0, row: 1 }, { col: 0, row: 2 });
      engine.endTurn();

      expect(engine.game.getCurrentPlayer().id).toBe('white');
      expect(engine.game.currentMoveNumber).toBe(3);
    });

    test('每回合只能执行一次操作', () => {
      engine.startGame();

      // 第一次操作成功
      const result1 = engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });
      expect(result1.success).toBe(true);

      // 第二次操作应该失败
      const result2 = engine.rotatePiece({ col: 0, row: 4 }, 'clockwise');
      expect(result2.success).toBe(false);
    });
  });

  describe('时间管理', () => {
    test('应该正确追踪玩家时间', () => {
      engine.startGame();

      const whitePlayer = engine.game.getPlayerById('white');
      const initialTime = whitePlayer.timeLeft;

      // 模拟时间流逝
      engine.updatePlayerTime('white', 5000);

      expect(whitePlayer.timeLeft).toBe(initialTime - 5000);
    });

    test('时间耗尽应该结束游戏', () => {
      engine.startGame();

      const whitePlayer = engine.game.getPlayerById('white');

      // 耗尽白方时间
      engine.updatePlayerTime('white', whitePlayer.timeLeft + 1000);

      expect(engine.game.isGameOver()).toBe(true);
      expect(engine.game.winner).toBe('black');
    });

    test('时间增量应该正确添加', () => {
      engine = new GameEngine({ timeMode: '15+10' });
      engine.startGame();

      const whitePlayer = engine.game.getPlayerById('white');
      const initialTime = whitePlayer.timeLeft;

      // 执行操作并结束回合（应该添加时间增量）
      engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });

      // 添加时间增量
      whitePlayer.addIncrement();

      expect(whitePlayer.timeLeft).toBe(initialTime + 10 * 1000);
    });
  });

  describe('移动历史记录', () => {
    test('应该记录所有移动', () => {
      engine.startGame();

      const initialHistoryLength = engine.game.moveHistory.length;

      // 执行几步操作
      engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });
      engine.endTurn();

      engine.rotatePiece({ col: 0, row: 1 }, 'clockwise');
      engine.endTurn();

      expect(engine.game.moveHistory.length).toBe(initialHistoryLength + 2);
    });

    test('移动历史应该包含详细信息', () => {
      engine.startGame();

      engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });

      const lastMove = engine.game.moveHistory[engine.game.moveHistory.length - 1];

      expect(lastMove.type).toBe('move');
      expect(lastMove.player).toBe('white');
      expect(lastMove.from).toEqual({ col: 0, row: 5 });
      expect(lastMove.to).toEqual({ col: 0, row: 4 });
    });
  });

  describe('游戏状态持久化', () => {
    test('应该能获取和恢复游戏状态', () => {
      engine.startGame();

      // 执行一些操作
      engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });
      engine.endTurn();

      // 获取状态
      const gameState = engine.getGameState();

      // 验证状态包含所有必要信息
      expect(gameState.currentPlayerIndex).toBe(1); // 黑方回合
      expect(gameState.moveHistory.length).toBeGreaterThan(0);
      expect(gameState.players).toHaveLength(2);
    });
  });

  describe('错误处理', () => {
    test('应该拒绝游戏结束后的操作', () => {
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

      engine.startGame();
      engine.fireLaser();

      // 游戏已结束，尝试操作应该失败
      const result = engine.movePiece({ col: 0, row: 0 }, { col: 1, row: 0 });

      expect(result.success).toBe(false);
    });

    test('应该拒绝无效的移动', () => {
      engine.startGame();

      // 尝试移动到无效位置
      const result = engine.movePiece({ col: 0, row: 5 }, { col: 10, row: 10 });

      expect(result.success).toBe(false);
    });

    test('应该拒绝移动对方棋子', () => {
      engine.startGame();

      // 白方尝试移动黑方棋子
      const result = engine.movePiece({ col: 0, row: 1 }, { col: 0, row: 2 });

      expect(result.success).toBe(false);
      expect(result.reason).toContain('己方');
    });
  });

  describe('性能测试', () => {
    test('完整游戏流程应该保持良好性能', () => {
      engine.startGame();

      const startTime = performance.now();

      // 执行多次操作
      for (let i = 0; i < 10; i++) {
        if (engine.game.isGameOver()) break;

        const pieces = engine.game.board.getAllPieces();
        const currentPlayer = engine.game.getCurrentPlayer();
        const playerPieces = pieces.filter(p => p.owner === currentPlayer.id);

        if (playerPieces.length > 0) {
          const piece = playerPieces[0];

          // 尝试移动
          engine.movePiece(piece.position, {
            col: piece.position.col,
            row: piece.position.row === 0 ? 1 : piece.position.row - 1
          });

          engine.endTurn();
        }
      }

      const endTime = performance.now();

      // 10次操作应该在合理时间内完成（<100ms）
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
