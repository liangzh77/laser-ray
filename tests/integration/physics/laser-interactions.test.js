/**
 * Laser Interactions Integration Tests
 * 测试激光物理系统的完整交互流程
 */

import { GameEngine } from '../../../src/core/GameEngine.js';
import { createPiece } from '../../../src/models/Piece.js';

describe('激光物理交互集成测试', () => {
  let engine;

  beforeEach(() => {
    engine = new GameEngine({ timeMode: 'unlimited' });
    engine.startGame();
  });

  describe('复杂激光路径场景', () => {
    test('应该能处理镜子连续反射路径', () => {
      // 清空棋盘创建测试场景
      engine.game.board.clear();

      // 白方炮塔在a1，朝右
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 0, row: 6 },
        direction: 'right'
      });
      engine.game.board.placePiece(turret, { col: 0, row: 6 });

      // 镜子1在d1，朝up（反射向上）
      const mirror1 = createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(mirror1, { col: 3, row: 6 });

      // 镜子2在d4，朝right（反射向左）
      const mirror2 = createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'right'
      });
      engine.game.board.placePiece(mirror2, { col: 3, row: 3 });

      // 黑方炮塔在a4（会被击中）
      const blackTurret = createPiece({
        type: 'turret',
        owner: 'black',
        position: { col: 0, row: 3 },
        direction: 'right'
      });
      engine.game.board.placePiece(blackTurret, { col: 0, row: 3 });

      // 发射激光
      const result = engine.fireLaser();

      // 激光应该经过两次反射击中黑方炮塔
      expect(result.success).toBe(true);
      expect(result.gameOver).toBe(true);
      expect(result.gameOverResult.winner).toBe('white');
    });

    test('应该能处理盾牌阻挡激光', () => {
      engine.game.board.clear();

      // 白方炮塔
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(turret, { col: 3, row: 6 });

      // 盾牌正面朝下（阻挡向上的激光）
      const shield = createPiece({
        type: 'shield',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'down'
      });
      engine.game.board.placePiece(shield, { col: 3, row: 3 });

      // 黑方炮塔在后面（不会被击中）
      const blackTurret = createPiece({
        type: 'turret',
        owner: 'black',
        position: { col: 3, row: 0 },
        direction: 'down'
      });
      engine.game.board.placePiece(blackTurret, { col: 3, row: 0 });

      // 发射激光
      const result = engine.fireLaser();

      // 激光应该被盾牌阻挡，游戏不结束
      expect(result.success).toBe(true);
      expect(result.gameOver).toBe(false);
      expect(shield.isDestroyed).toBe(false);
      expect(blackTurret.isDestroyed).toBe(false);
    });

    test('应该能处理盾牌侧面摧毁', () => {
      engine.game.board.clear();

      // 白方炮塔朝右
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 0, row: 3 },
        direction: 'right'
      });
      engine.game.board.placePiece(turret, { col: 0, row: 3 });

      // 盾牌朝上（侧面对着激光）
      const shield = createPiece({
        type: 'shield',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'up'
      });
      engine.game.board.placePiece(shield, { col: 3, row: 3 });

      // 发射激光
      const result = engine.fireLaser();

      // 盾牌应该被摧毁
      expect(result.success).toBe(true);
      expect(shield.isDestroyed).toBe(true);
    });
  });

  describe('分光器场景', () => {
    test('分光器应该产生两束激光', () => {
      engine.game.board.clear();

      // 白方炮塔
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(turret, { col: 3, row: 6 });

      // 分光器朝上
      const splitter = createPiece({
        type: 'splitter',
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });
      engine.game.board.placePiece(splitter, { col: 3, row: 3 });

      // 放置两个棋子在分光后的路径上
      const leftTarget = createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 1, row: 3 },
        direction: 'up'
      });
      engine.game.board.placePiece(leftTarget, { col: 1, row: 3 });

      const rightTarget = createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 5, row: 3 },
        direction: 'up'
      });
      engine.game.board.placePiece(rightTarget, { col: 5, row: 3 });

      // 发射激光
      const result = engine.fireLaser();

      // 激光应该分成两束
      expect(result.success).toBe(true);
      expect(splitter.isDestroyed).toBe(false);

      // 两个目标棋子都应该被激光击中（或至少被检测到）
      const laserBeam = result.laserBeam;
      expect(laserBeam.getAllLasers().length).toBeGreaterThan(2);
    });

    test('分光器背面被击中应该摧毁', () => {
      engine.game.board.clear();

      // 白方炮塔朝下
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 0 },
        direction: 'down'
      });
      engine.game.board.placePiece(turret, { col: 3, row: 0 });

      // 分光器朝up（背面朝down）
      const splitter = createPiece({
        type: 'splitter',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'up'
      });
      engine.game.board.placePiece(splitter, { col: 3, row: 3 });

      // 发射激光
      const result = engine.fireLaser();

      // 分光器应该被摧毁
      expect(result.success).toBe(true);
      expect(splitter.isDestroyed).toBe(true);
    });
  });

  describe('跳台场景', () => {
    test('跳台应该让激光跳跃过障碍物', () => {
      engine.game.board.clear();

      // 白方炮塔
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(turret, { col: 3, row: 6 });

      // 跳台朝up
      const jumper = createPiece({
        type: 'jumper',
        owner: 'white',
        position: { col: 3, row: 4 },
        direction: 'up'
      });
      engine.game.board.placePiece(jumper, { col: 3, row: 4 });

      // 障碍物（会被跳过）
      const obstacle = createPiece({
        type: 'shield',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'up'
      });
      engine.game.board.placePiece(obstacle, { col: 3, row: 3 });

      // 目标棋子
      const target = createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 3, row: 2 },
        direction: 'up'
      });
      engine.game.board.placePiece(target, { col: 3, row: 2 });

      // 发射激光
      const result = engine.fireLaser();

      // 激光应该跳过障碍物
      expect(result.success).toBe(true);
      expect(jumper.isDestroyed).toBe(false);
      expect(obstacle.isDestroyed).toBe(false); // 应该被跳过，不被摧毁
    });

    test('跳台侧面被击中应该摧毁', () => {
      engine.game.board.clear();

      // 白方炮塔朝右
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 0, row: 3 },
        direction: 'right'
      });
      engine.game.board.placePiece(turret, { col: 0, row: 3 });

      // 跳台朝up（侧面对着激光）
      const jumper = createPiece({
        type: 'jumper',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'up'
      });
      engine.game.board.placePiece(jumper, { col: 3, row: 3 });

      // 发射激光
      const result = engine.fireLaser();

      // 跳台应该被摧毁
      expect(result.success).toBe(true);
      expect(jumper.isDestroyed).toBe(true);
    });
  });

  describe('混合场景', () => {
    test('应该能处理反射+分光的组合', () => {
      engine.game.board.clear();

      // 白方炮塔
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 0, row: 6 },
        direction: 'right'
      });
      engine.game.board.placePiece(turret, { col: 0, row: 6 });

      // 镜子（反射向上）
      const mirror = createPiece({
        type: 'mirror',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(mirror, { col: 3, row: 6 });

      // 分光器（分光）
      const splitter = createPiece({
        type: 'splitter',
        owner: 'white',
        position: { col: 3, row: 3 },
        direction: 'up'
      });
      engine.game.board.placePiece(splitter, { col: 3, row: 3 });

      // 发射激光
      const result = engine.fireLaser();

      // 应该成功，且有多束激光
      expect(result.success).toBe(true);
      expect(result.laserBeam.getAllLasers().length).toBeGreaterThan(2);
    });

    test('应该能处理多个盾牌的保护链', () => {
      engine.game.board.clear();

      // 白方炮塔
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(turret, { col: 3, row: 6 });

      // 第一个盾牌（会被侧面击中摧毁）
      const shield1 = createPiece({
        type: 'shield',
        owner: 'black',
        position: { col: 3, row: 4 },
        direction: 'left'
      });
      engine.game.board.placePiece(shield1, { col: 3, row: 4 });

      // 第二个盾牌（会阻挡）
      const shield2 = createPiece({
        type: 'shield',
        owner: 'black',
        position: { col: 3, row: 3 },
        direction: 'down'
      });
      engine.game.board.placePiece(shield2, { col: 3, row: 3 });

      // 黑方炮塔
      const blackTurret = createPiece({
        type: 'turret',
        owner: 'black',
        position: { col: 3, row: 0 },
        direction: 'down'
      });
      engine.game.board.placePiece(blackTurret, { col: 3, row: 0 });

      // 发射激光
      const result = engine.fireLaser();

      // 第一个盾牌被摧毁，第二个阻挡激光
      expect(result.success).toBe(true);
      expect(shield1.isDestroyed).toBe(true);
      expect(shield2.isDestroyed).toBe(false);
      expect(blackTurret.isDestroyed).toBe(false);
      expect(result.gameOver).toBe(false);
    });
  });

  describe('性能和边界测试', () => {
    test('应该在10ms内完成复杂场景的激光计算', () => {
      // 使用默认棋盘布局（28个棋子）
      const startTime = performance.now();
      const result = engine.fireLaser();
      const endTime = performance.now();

      // 应该在10ms内完成
      expect(endTime - startTime).toBeLessThan(10);
      expect(result.success).toBe(true);
    });

    test('应该正确处理激光到达棋盘边界', () => {
      engine.game.board.clear();

      // 炮塔朝向边界
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'down'
      });
      engine.game.board.placePiece(turret, { col: 3, row: 6 });

      // 发射激光（向下到达边界）
      const result = engine.fireLaser();

      // 应该成功，激光到达边界停止
      expect(result.success).toBe(true);
      expect(result.gameOver).toBe(false);
    });

    test('应该记录所有被击中的棋子', () => {
      engine.game.board.clear();

      // 白方炮塔
      const turret = createPiece({
        type: 'turret',
        owner: 'white',
        position: { col: 3, row: 6 },
        direction: 'up'
      });
      engine.game.board.placePiece(turret, { col: 3, row: 6 });

      // 多个棋子在路径上
      const piece1 = createPiece({
        type: 'mirror',
        owner: 'black',
        position: { col: 3, row: 5 },
        direction: 'left'
      });
      engine.game.board.placePiece(piece1, { col: 3, row: 5 });

      const piece2 = createPiece({
        type: 'shield',
        owner: 'black',
        position: { col: 3, row: 4 },
        direction: 'left'
      });
      engine.game.board.placePiece(piece2, { col: 3, row: 4 });

      // 发射激光
      const result = engine.fireLaser();

      // 应该记录被击中的棋子
      expect(result.success).toBe(true);

      // 检查移动历史中的hitPieces
      const lastMove = engine.game.moveHistory[engine.game.moveHistory.length - 1];
      expect(lastMove.type).toBe('fireLaser');
      expect(lastMove.hitPieces).toBeDefined();
    });
  });
});
