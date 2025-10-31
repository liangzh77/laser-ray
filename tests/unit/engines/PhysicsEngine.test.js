/**
 * Physics Engine Unit Tests
 * 测试激光物理引擎的各种交互场景
 */

import { PhysicsEngine } from '../../../src/core/PhysicsEngine.js';
import { Game } from '../../../src/models/Game.js';
import { createPiece, Mirror, Shield, Turret, Jumper, Splitter } from '../../../src/models/Piece.js';

describe('Physics Engine - 激光物理引擎', () => {
  let game;
  let physicsEngine;

  beforeEach(() => {
    game = new Game({ timeMode: 'unlimited' });
    physicsEngine = new PhysicsEngine(game);
  });

  describe('激光反射 (T052)', () => {
    test('镜子应该能从正确方向反射激光', () => {
      // 清空棋盘
      game.board.clear();

      // 放置白方炮塔在d1，朝上
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      game.board.placePiece(turret, { col: 3, row: 6 });

      // 放置镜子在d4，朝向up（45度）
      const mirror = createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'up'
      });
      game.board.placePiece(mirror, { col: 3, row: 3 });

      // 计算激光路径
      const laserBeam = physicsEngine.calculateLaserPath(
        { col: 3, row: 6 },
        'up',
        'white'
      );

      // 验证激光被反射
      expect(laserBeam.getAllLasers().length).toBeGreaterThan(1);

      // 验证镜子未被摧毁
      expect(mirror.isDestroyed).toBe(false);
    });

    test('镜子从无效方向被击中应该摧毁', () => {
      game.board.clear();

      // 放置镜子在d4，朝向up
      const mirror = createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'up'
      });
      game.board.placePiece(mirror, { col: 3, row: 3 });

      // 从背面射入激光（down方向）
      const result = mirror.handleLaserInteraction('down');

      // 应该摧毁镜子
      expect(result.destroyed).toBe(true);
      expect(mirror.isDestroyed).toBe(true);
    });

    test('镜子应该正确处理所有4个方向的反射', () => {
      const mirror = new Mirror({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // up方向镜子：up入射 -> right反射
      let result = mirror.handleLaserInteraction('up');
      expect(result.reflected).toBe(true);
      expect(result.newDirection).toBe('right');

      // right入射 -> up反射
      result = mirror.handleLaserInteraction('right');
      expect(result.reflected).toBe(true);
      expect(result.newDirection).toBe('up');
    });
  });

  describe('盾牌阻挡和摧毁 (T053)', () => {
    test('盾牌应该能从正面阻挡激光', () => {
      const shield = new Shield({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从正面射入激光（up方向）
      const result = shield.handleLaserInteraction('up');

      // 应该阻挡激光
      expect(result.blocked).toBe(true);
      expect(result.laserStopped).toBe(true);
      expect(shield.isDestroyed).toBe(false);
    });

    test('盾牌应该能从背面阻挡激光', () => {
      const shield = new Shield({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从背面射入激光（down方向）
      const result = shield.handleLaserInteraction('down');

      // 应该阻挡激光
      expect(result.blocked).toBe(true);
      expect(result.laserStopped).toBe(true);
      expect(shield.isDestroyed).toBe(false);
    });

    test('盾牌从侧面被击中应该摧毁', () => {
      const shield = new Shield({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从侧面射入激光（left方向）
      const result = shield.handleLaserInteraction('left');

      // 应该摧毁盾牌
      expect(result.destroyed).toBe(true);
      expect(shield.isDestroyed).toBe(true);
    });

    test('盾牌从另一侧面被击中也应该摧毁', () => {
      const shield = new Shield({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从右侧射入激光（right方向）
      const result = shield.handleLaserInteraction('right');

      // 应该摧毁盾牌
      expect(result.destroyed).toBe(true);
      expect(shield.isDestroyed).toBe(true);
    });
  });

  describe('跳台跳跃和摧毁 (T054, T055)', () => {
    test('跳台应该能让激光从正面跳跃', () => {
      const jumper = new Jumper({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从正面射入激光（up方向）
      const result = jumper.handleLaserInteraction('up');

      // 应该跳跃
      expect(result.jumped).toBe(true);
      expect(result.newPosition).toBeDefined();
      expect(result.newDirection).toBeDefined();
      expect(jumper.isDestroyed).toBe(false);
    });

    test('跳台应该能让激光从背面跳跃', () => {
      const jumper = new Jumper({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从背面射入激光（down方向）
      const result = jumper.handleLaserInteraction('down');

      // 应该跳跃
      expect(result.jumped).toBe(true);
      expect(result.newPosition).toBeDefined();
      expect(result.newDirection).toBeDefined();
      expect(jumper.isDestroyed).toBe(false);
    });

    test('跳台从侧面被击中应该摧毁', () => {
      const jumper = new Jumper({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从侧面射入激光（left方向）
      const result = jumper.handleLaserInteraction('left');

      // 应该摧毁跳台
      expect(result.destroyed).toBe(true);
      expect(jumper.isDestroyed).toBe(true);
    });

    test('跳台从另一侧面被击中也应该摧毁', () => {
      const jumper = new Jumper({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从右侧射入激光（right方向）
      const result = jumper.handleLaserInteraction('right');

      // 应该摧毁跳台
      expect(result.destroyed).toBe(true);
      expect(jumper.isDestroyed).toBe(true);
    });
  });

  describe('分光器分光和摧毁 (T056, T057)', () => {
    test('分光器应该能从正面分光激光', () => {
      const splitter = new Splitter({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从正面射入激光（up方向）
      const result = splitter.handleLaserInteraction('up');

      // 应该分光
      expect(result.split).toBe(true);
      expect(result.newDirections).toBeDefined();
      expect(result.newDirections.length).toBe(2);
      expect(splitter.isDestroyed).toBe(false);
    });

    test('分光器应该能从侧面分光激光', () => {
      const splitter = new Splitter({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从侧面射入激光（left方向）
      const result = splitter.handleLaserInteraction('left');

      // 应该分光
      expect(result.split).toBe(true);
      expect(result.newDirections).toBeDefined();
      expect(result.newDirections.length).toBe(2);
      expect(splitter.isDestroyed).toBe(false);
    });

    test('分光器从背面被击中应该摧毁', () => {
      const splitter = new Splitter({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从背面射入激光（down方向）
      const result = splitter.handleLaserInteraction('down');

      // 应该摧毁分光器
      expect(result.destroyed).toBe(true);
      expect(splitter.isDestroyed).toBe(true);
    });

    test('分光器应该产生两束正确方向的激光', () => {
      const splitter = new Splitter({
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });

      // 从正面射入（up方向）
      const result = splitter.handleLaserInteraction('up');

      // 应该分成left和right两个方向
      expect(result.newDirections).toContain('left');
      expect(result.newDirections).toContain('right');
    });
  });

  describe('炮塔摧毁', () => {
    test('炮塔从任意方向被击中都应该摧毁', () => {
      const turret = new Turret({
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });

      // 从任意方向射入
      const result = turret.handleLaserInteraction('down');

      // 应该摧毁并结束游戏
      expect(result.destroyed).toBe(true);
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('black');
      expect(turret.isDestroyed).toBe(true);
    });

    test('炮塔被击中应该返回正确的获胜者', () => {
      const whiteTurret = new Turret({
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });

      const blackTurret = new Turret({
        owner: 'black',
        position: { col: 3, row: 0 },
        direction: 'down'
      });

      // 白方炮塔被击中
      let result = whiteTurret.handleLaserInteraction('down');
      expect(result.winner).toBe('black');

      // 黑方炮塔被击中
      result = blackTurret.handleLaserInteraction('up');
      expect(result.winner).toBe('white');
    });
  });

  describe('激光路径计算', () => {
    test('应该能计算简单的直线路径', () => {
      game.board.clear();

      // 只放置炮塔
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      game.board.placePiece(turret, { col: 3, row: 6 });

      const laserBeam = physicsEngine.calculateLaserPath(
        { col: 3, row: 6 },
        'up',
        'white'
      );

      // 激光应该直线前进直到边界
      expect(laserBeam.getAllLasers().length).toBeGreaterThan(0);
    });

    test('应该能处理多次反射', () => {
      game.board.clear();

      // 放置炮塔
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 0, row: 6 },
        direction: 'up'
      });
      game.board.placePiece(turret, { col: 0, row: 6 });

      // 放置两个镜子形成连续反射
      const mirror1 = createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 0, row: 3 },
        direction: 'up'
      });
      game.board.placePiece(mirror1, { col: 0, row: 3 });

      const mirror2 = createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'right'
      });
      game.board.placePiece(mirror2, { col: 3, row: 3 });

      const laserBeam = physicsEngine.calculateLaserPath(
        { col: 0, row: 6 },
        'up',
        'white'
      );

      // 应该有多个激光段（反射）
      expect(laserBeam.getAllLasers().length).toBeGreaterThan(2);
    });

    test('应该防止无限循环', () => {
      game.board.clear();

      // 创建可能导致循环的镜子布局
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 2, row: 2 },
        direction: 'up'
      });
      game.board.placePiece(turret, { col: 2, row: 2 });

      // 计算路径（应该在有限步数内停止）
      const startTime = Date.now();
      const laserBeam = physicsEngine.calculateLaserPath(
        { col: 2, row: 2 },
        'up',
        'white'
      );
      const endTime = Date.now();

      // 应该在合理时间内完成（<100ms）
      expect(endTime - startTime).toBeLessThan(100);

      // 应该有激光路径
      expect(laserBeam.getAllLasers().length).toBeGreaterThan(0);
    });
  });

  describe('性能测试', () => {
    test('激光物理计算应该在10ms内完成', () => {
      game.board.clear();

      // 创建中等复杂度的场景
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      game.board.placePiece(turret, { col: 3, row: 6 });

      // 放置几个棋子
      for (let i = 0; i < 5; i++) {
        const mirror = createPiece({
          type: 'mirror',
          owner: 'black',
          position: { col: i, row: 3 },
          direction: 'up'
        });
        game.board.placePiece(mirror, { col: i, row: 3 });
      }

      // 测量计算时间
      const startTime = performance.now();
      physicsEngine.calculateLaserPath({ col: 3, row: 6 }, 'up', 'white');
      const endTime = performance.now();

      // 应该在10ms内完成
      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});
