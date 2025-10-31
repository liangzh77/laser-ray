/**
 * Board Model Unit Tests
 * 测试棋盘初始化和基本操作
 */

import { Board } from '../../../src/models/Board.js';
import { createPiece } from '../../../src/models/Piece.js';
import { GAME_CONFIG } from '../../../src/config/game-config.js';

describe('Board Model', () => {
  let board;

  beforeEach(() => {
    board = new Board();
  });

  describe('初始化', () => {
    test('应该创建7x7的空棋盘', () => {
      expect(board.size.WIDTH).toBe(7);
      expect(board.size.HEIGHT).toBe(7);
      expect(board.getAllPieces()).toHaveLength(0);
    });
  });

  describe('棋子放置', () => {
    test('应该能在有效位置放置棋子', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      board.placePiece(piece, { col: 0, row: 0 });

      expect(board.getPieceAt({ col: 0, row: 0 })).toBe(piece);
      expect(board.hasPieceAt({ col: 0, row: 0 })).toBe(true);
    });

    test('应该拒绝在无效位置放置棋子', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 10, row: 10 },
        direction: 'up'
      });

      expect(() => {
        board.placePiece(piece, { col: 10, row: 10 });
      }).toThrow();
    });

    test('应该更新棋子的位置属性', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      board.placePiece(piece, { col: 3, row: 3 });

      expect(piece.position).toEqual({ col: 3, row: 3 });
    });
  });

  describe('棋子移除', () => {
    test('应该能移除指定位置的棋子', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      board.placePiece(piece, { col: 0, row: 0 });
      const removed = board.removePiece({ col: 0, row: 0 });

      expect(removed).toBe(piece);
      expect(board.hasPieceAt({ col: 0, row: 0 })).toBe(false);
    });

    test('移除不存在的棋子应该返回null', () => {
      const removed = board.removePiece({ col: 0, row: 0 });
      expect(removed).toBeNull();
    });
  });

  describe('棋子移动', () => {
    test('应该能将棋子从一个位置移动到另一个位置', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      board.placePiece(piece, { col: 0, row: 0 });
      const success = board.movePiece({ col: 0, row: 0 }, { col: 3, row: 3 });

      expect(success).toBe(true);
      expect(board.hasPieceAt({ col: 0, row: 0 })).toBe(false);
      expect(board.getPieceAt({ col: 3, row: 3 })).toBe(piece);
    });

    test('移动不存在的棋子应该失败', () => {
      const success = board.movePiece({ col: 0, row: 0 }, { col: 3, row: 3 });
      expect(success).toBe(false);
    });
  });

  describe('棋子查询', () => {
    beforeEach(() => {
      // 放置一些测试棋子
      board.placePiece(createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      }), { col: 0, row: 0 });

      board.placePiece(createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 0 },
        direction: 'up'
      }), { col: 3, row: 0 });

      board.placePiece(createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 0, row: 6 },
        direction: 'down'
      }), { col: 0, row: 6 });
    });

    test('应该能按所有者筛选棋子', () => {
      const whitePieces = board.getPiecesByOwner('white');
      const blackPieces = board.getPiecesByOwner('black');

      expect(whitePieces).toHaveLength(2);
      expect(blackPieces).toHaveLength(1);
    });

    test('应该能按类型筛选棋子', () => {
      const mirrors = board.getPiecesByType('mirror');
      const turrets = board.getPiecesByType('turret');

      expect(mirrors).toHaveLength(2);
      expect(turrets).toHaveLength(1);
    });

    test('应该能获取指定玩家的炮塔', () => {
      const whiteTurret = board.getTurret('white');
      const blackTurret = board.getTurret('black');

      expect(whiteTurret).not.toBeNull();
      expect(whiteTurret.type).toBe('turret');
      expect(whiteTurret.owner).toBe('white');
      expect(blackTurret).toBeNull();
    });
  });

  describe('棋盘克隆', () => {
    test('应该能克隆棋盘及其所有棋子', () => {
      board.placePiece(createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      }), { col: 0, row: 0 });

      const cloned = board.clone();

      expect(cloned).not.toBe(board);
      expect(cloned.getAllPieces()).toHaveLength(1);
      expect(cloned.getPieceAt({ col: 0, row: 0 })).not.toBe(board.getPieceAt({ col: 0, row: 0 }));
    });
  });

  describe('JSON序列化', () => {
    test('应该能序列化为JSON', () => {
      board.placePiece(createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      }), { col: 0, row: 0 });

      const json = board.toJSON();

      expect(json.size).toEqual(board.size);
      expect(json.pieces).toHaveLength(1);
      expect(json.pieces[0].type).toBe('mirror');
    });
  });
});
