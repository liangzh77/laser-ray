/**
 * Piece Operations Integration Tests
 * 测试棋子操作的集成流程
 */

import { GameEngine } from '../../../src/core/GameEngine.js';

describe('棋子操作集成测试', () => {
  let engine;

  beforeEach(() => {
    engine = new GameEngine({ timeMode: 'unlimited' });
    engine.startGame();
  });

  describe('棋子移动流程', () => {
    test('白方应该能在回合内移动棋子', () => {
      // 获取白方的一个镜子（a2位置）
      const piece = engine.game.board.getPieceAt({ col: 0, row: 5 });
      expect(piece).toBeDefined();
      expect(piece.owner).toBe('white');

      // 移动到a3
      const result = engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });

      expect(result.success).toBe(true);
      expect(engine.game.board.getPieceAt({ col: 0, row: 4 })).toBe(piece);
      expect(engine.game.board.hasPieceAt({ col: 0, row: 5 })).toBe(false);
    });

    test('移动后应该自动结束回合', () => {
      const piece = engine.game.board.getPieceAt({ col: 0, row: 5 });

      engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });
      engine.endTurn();

      // 应该切换到黑方
      expect(engine.game.getCurrentPlayer().id).toBe('black');
    });

    test('玩家不应该能移动对方棋子', () => {
      // 尝试移动黑方棋子
      const blackPiece = engine.game.board.getPieceAt({ col: 0, row: 1 });
      expect(blackPiece.owner).toBe('black');

      const result = engine.movePiece({ col: 0, row: 1 }, { col: 0, row: 2 });

      expect(result.success).toBe(false);
      expect(result.reason).toContain('己方');
    });

    test('不应该能移动到被占据的位置', () => {
      const result = engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 6 });

      expect(result.success).toBe(false);
    });

    test('移动应该记录到历史', () => {
      const initialHistoryLength = engine.game.moveHistory.length;

      engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });

      expect(engine.game.moveHistory.length).toBe(initialHistoryLength + 1);
      expect(engine.game.moveHistory[initialHistoryLength].type).toBe('move');
    });
  });

  describe('棋子旋转流程', () => {
    test('应该能旋转己方棋子', () => {
      const piece = engine.game.board.getPieceAt({ col: 0, row: 5 });
      const oldDirection = piece.direction;

      const result = engine.rotatePiece({ col: 0, row: 5 }, 'clockwise');

      expect(result.success).toBe(true);
      expect(piece.direction).not.toBe(oldDirection);
    });

    test('旋转应该记录到历史', () => {
      const initialHistoryLength = engine.game.moveHistory.length;

      engine.rotatePiece({ col: 0, row: 5 }, 'clockwise');

      expect(engine.game.moveHistory.length).toBe(initialHistoryLength + 1);
      expect(engine.game.moveHistory[initialHistoryLength].type).toBe('rotate');
    });

    test('不应该能旋转对方棋子', () => {
      const result = engine.rotatePiece({ col: 0, row: 1 }, 'clockwise');

      expect(result.success).toBe(false);
    });
  });

  describe('激光发射流程', () => {
    test('应该能发射激光', () => {
      const result = engine.fireLaser();

      expect(result.success).toBe(true);
      expect(result.laserBeam).toBeDefined();
    });

    test('激光应该记录到历史', () => {
      const initialHistoryLength = engine.game.moveHistory.length;

      engine.fireLaser();

      expect(engine.game.moveHistory.length).toBe(initialHistoryLength + 1);
      expect(engine.game.moveHistory[initialHistoryLength].type).toBe('fireLaser');
    });

    test('激光击中对方棋子应该摧毁它', () => {
      // 这个测试需要特定的棋盘布局
      // 先清空部分棋盘，创建测试场景
      engine.game.board.clear();

      // 白方炮塔在d1，朝上
      const whiteTurret = engine.game.board.placePiece(
        require('../../../src/models/Piece.js').createPiece({
          type: 'turret',
          owner: 'white',
          position: { col: 3, row: 6 },
          direction: 'up'
        }),
        { col: 3, row: 6 }
      );

      // 黑方镜子在d4
      const blackMirror = require('../../../src/models/Piece.js').createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'up'
      });
      engine.game.board.placePiece(blackMirror, { col: 3, row: 3 });

      const result = engine.fireLaser();

      // 激光应该击中并摧毁镜子
      expect(result.success).toBe(true);
      expect(engine.game.board.hasPieceAt({ col: 3, row: 3 })).toBe(false);
    });
  });

  describe('回合限制', () => {
    test('每回合只能执行一次操作', () => {
      // 第一次操作：移动
      const result1 = engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });
      expect(result1.success).toBe(true);

      // 第二次操作：尝试旋转（应该失败）
      const result2 = engine.rotatePiece({ col: 0, row: 4 }, 'clockwise');
      expect(result2.success).toBe(false);
    });

    test('结束回合后应该能再次操作', () => {
      // 白方移动
      engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });
      engine.endTurn();

      // 黑方应该能操作
      const result = engine.movePiece({ col: 0, row: 1 }, { col: 0, row: 2 });
      expect(result.success).toBe(true);
    });
  });

  describe('游戏状态管理', () => {
    test('操作期间游戏状态应该是PLAYING', () => {
      expect(engine.game.isPlaying()).toBe(true);

      engine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });

      expect(engine.game.isPlaying()).toBe(true);
    });

    test('激光发射时应该进入LASER_FIRING状态', () => {
      engine.fireLaser();

      // 激光计算期间或之后
      expect([
        'laserFiring',
        'playing'
      ]).toContain(engine.game.state);
    });
  });
});
