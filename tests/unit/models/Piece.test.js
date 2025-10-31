/**
 * Piece Model Unit Tests
 * 测试棋子移动和旋转功能
 */

import { createPiece, Mirror, Shield, Turret } from '../../../src/models/Piece.js';
import { GAME_CONFIG } from '../../../src/config/game-config.js';

describe('Piece Model - 移动和旋转', () => {
  describe('棋子创建', () => {
    test('应该能创建各种类型的棋子', () => {
      const types = ['mirror', 'shield', 'turret', 'jumper', 'splitter'];

      types.forEach(type => {
        const piece = createPiece({
          type,
          owner: 'white',
          position: { col: 0, row: 0 },
          direction: 'up'
        });

        expect(piece.type).toBe(type);
        expect(piece.owner).toBe('white');
        expect(piece.direction).toBe('up');
      });
    });

    test('应该有唯一ID', () => {
      const piece1 = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      const piece2 = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      expect(piece1.id).not.toBe(piece2.id);
    });
  });

  describe('棋子移动', () => {
    test('应该能移动到新位置', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      piece.moveTo({ col: 3, row: 3 });

      expect(piece.position).toEqual({ col: 3, row: 3 });
    });

    test('isAt()应该正确判断位置', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 2, row: 2 },
        direction: 'up'
      });

      expect(piece.isAt({ col: 2, row: 2 })).toBe(true);
      expect(piece.isAt({ col: 3, row: 3 })).toBe(false);
    });
  });

  describe('棋子旋转', () => {
    test('应该能顺时针旋转90度', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      piece.rotateClockwise();
      expect(piece.direction).toBe('right');

      piece.rotateClockwise();
      expect(piece.direction).toBe('down');

      piece.rotateClockwise();
      expect(piece.direction).toBe('left');

      piece.rotateClockwise();
      expect(piece.direction).toBe('up');
    });

    test('应该能逆时针旋转90度', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      piece.rotateCounterClockwise();
      expect(piece.direction).toBe('left');

      piece.rotateCounterClockwise();
      expect(piece.direction).toBe('down');

      piece.rotateCounterClockwise();
      expect(piece.direction).toBe('right');

      piece.rotateCounterClockwise();
      expect(piece.direction).toBe('up');
    });

    test('应该能设置特定方向', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      piece.setDirection('down');
      expect(piece.direction).toBe('down');

      piece.setDirection('left');
      expect(piece.direction).toBe('left');
    });
  });

  describe('棋子摧毁', () => {
    test('应该能标记棋子为已摧毁', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      expect(piece.isDestroyed).toBe(false);

      piece.destroy();

      expect(piece.isDestroyed).toBe(true);
    });
  });

  describe('棋子克隆', () => {
    test('应该能克隆棋子', () => {
      const piece = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 2, row: 2 },
        direction: 'right'
      });

      const cloned = piece.clone();

      expect(cloned).not.toBe(piece);
      expect(cloned.type).toBe(piece.type);
      expect(cloned.owner).toBe(piece.owner);
      expect(cloned.position).toEqual(piece.position);
      expect(cloned.direction).toBe(piece.direction);
      expect(cloned.id).not.toBe(piece.id);
    });
  });

  describe('激光交互', () => {
    test('镜子应该能反射激光', () => {
      const mirror = new Mirror({
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      // 从上方射入 -> 向右反射
      const result = mirror.handleLaserInteraction('up');
      expect(result.reflected).toBe(true);
      expect(result.newDirection).toBe('right');
      expect(mirror.isDestroyed).toBe(false);
    });

    test('镜子从无效方向被击中应该摧毁', () => {
      const mirror = new Mirror({
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      // 从背面射入 -> 摧毁
      const result = mirror.handleLaserInteraction('down');
      expect(result.destroyed).toBe(true);
      expect(mirror.isDestroyed).toBe(true);
    });

    test('盾牌应该能阻挡激光', () => {
      const shield = new Shield({
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      // 从正面射入 -> 阻挡
      const result = shield.handleLaserInteraction('up');
      expect(result.blocked).toBe(true);
      expect(result.laserStopped).toBe(true);
      expect(shield.isDestroyed).toBe(false);
    });

    test('盾牌从侧面被击中应该摧毁', () => {
      const shield = new Shield({
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      // 从侧面射入 -> 摧毁
      const result = shield.handleLaserInteraction('left');
      expect(result.destroyed).toBe(true);
      expect(shield.isDestroyed).toBe(true);
    });

    test('炮塔被击中应该游戏结束', () => {
      const turret = new Turret({
        owner: 'white',
        position: { col: 0, row: 0 },
        direction: 'up'
      });

      const result = turret.handleLaserInteraction('down');
      expect(result.destroyed).toBe(true);
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('black');
      expect(turret.isDestroyed).toBe(true);
    });
  });
});
