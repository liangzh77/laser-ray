/**
 * Validation Utils Unit Tests
 * 测试有效移动计算和验证逻辑
 */

import {
  validateCastleMove,
  validateRotation,
  validateLaserFire,
  getValidCastleMoves
} from '../../../src/utils/validation.js';

describe('Validation Utils', () => {
  describe('城堡移动验证', () => {
    const noPieces = () => false;

    test('应该允许同行直线移动', () => {
      const from = { col: 0, row: 0 };
      const to = { col: 5, row: 0 };

      const result = validateCastleMove(from, to, noPieces);
      expect(result.valid).toBe(true);
    });

    test('应该允许同列直线移动', () => {
      const from = { col: 3, row: 0 };
      const to = { col: 3, row: 6 };

      const result = validateCastleMove(from, to, noPieces);
      expect(result.valid).toBe(true);
    });

    test('应该拒绝对角线移动', () => {
      const from = { col: 0, row: 0 };
      const to = { col: 3, row: 3 };

      const result = validateCastleMove(from, to, noPieces);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('直线');
    });

    test('应该拒绝移动到相同位置', () => {
      const from = { col: 0, row: 0 };
      const to = { col: 0, row: 0 };

      const result = validateCastleMove(from, to, noPieces);
      expect(result.valid).toBe(false);
    });

    test('应该拒绝路径被阻挡的移动', () => {
      const from = { col: 0, row: 0 };
      const to = { col: 5, row: 0 };

      const hasPieceAt = (pos) => pos.col === 2 && pos.row === 0;

      const result = validateCastleMove(from, to, hasPieceAt);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('阻挡');
    });

    test('应该拒绝移动到超出棋盘的位置', () => {
      const from = { col: 0, row: 0 };
      const to = { col: 10, row: 0 };

      const result = validateCastleMove(from, to, noPieces);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('范围');
    });
  });

  describe('旋转验证', () => {
    test('应该允许旋转到不同方向', () => {
      const result = validateRotation('mirror', 'up', 'right');
      expect(result.valid).toBe(true);
    });

    test('应该拒绝旋转到相同方向', () => {
      const result = validateRotation('mirror', 'up', 'up');
      expect(result.valid).toBe(false);
    });

    test('应该拒绝无效的方向', () => {
      const result = validateRotation('mirror', 'up', 'invalid');
      expect(result.valid).toBe(false);
    });
  });

  describe('激光发射验证', () => {
    test('应该允许己方炮塔发射激光', () => {
      const result = validateLaserFire(
        { col: 3, row: 0 },
        'up',
        'white',
        { id: 'white' }
      );
      expect(result.valid).toBe(true);
    });

    test('应该拒绝对方炮塔发射激光', () => {
      const result = validateLaserFire(
        { col: 3, row: 0 },
        'up',
        'white',
        { id: 'black' }
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('己方');
    });

    test('应该拒绝无效的方向', () => {
      const result = validateLaserFire(
        { col: 3, row: 0 },
        'invalid',
        'white',
        { id: 'white' }
      );
      expect(result.valid).toBe(false);
    });
  });

  describe('获取有效移动位置', () => {
    test('应该返回所有方向的可移动位置', () => {
      const from = { col: 3, row: 3 };
      const noPieces = () => false;

      const validMoves = getValidCastleMoves(from, noPieces);

      // 应该有4个方向的移动
      expect(validMoves.length).toBeGreaterThan(10);

      // 检查是否包含特定位置
      expect(validMoves.some(pos => pos.col === 3 && pos.row === 0)).toBe(true); // 向上
      expect(validMoves.some(pos => pos.col === 3 && pos.row === 6)).toBe(true); // 向下
      expect(validMoves.some(pos => pos.col === 0 && pos.row === 3)).toBe(true); // 向左
      expect(validMoves.some(pos => pos.col === 6 && pos.row === 3)).toBe(true); // 向右
    });

    test('应该在遇到棋子时停止', () => {
      const from = { col: 3, row: 3 };
      const hasPieceAt = (pos) => pos.col === 3 && pos.row === 5;

      const validMoves = getValidCastleMoves(from, hasPieceAt);

      // 向下只能到row=4
      const downMoves = validMoves.filter(pos => pos.col === 3 && pos.row > 3);
      expect(downMoves.every(pos => pos.row < 5)).toBe(true);
    });

    test('应该在棋盘边缘停止', () => {
      const from = { col: 0, row: 0 };
      const noPieces = () => false;

      const validMoves = getValidCastleMoves(from, noPieces);

      // 不应该有col<0或row<0的位置
      expect(validMoves.every(pos => pos.col >= 0 && pos.row >= 0)).toBe(true);
      expect(validMoves.every(pos => pos.col <= 6 && pos.row <= 6)).toBe(true);
    });
  });
});
