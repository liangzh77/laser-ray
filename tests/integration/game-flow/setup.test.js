/**
 * Game Setup Integration Tests
 * 测试游戏设置和初始化流程
 */

import { GameEngine } from '../../../src/core/GameEngine.js';
import { GAME_CONFIG } from '../../../src/config/game-config.js';

describe('游戏设置流程集成测试', () => {
  describe('游戏创建', () => {
    test('应该能创建新游戏实例', () => {
      const engine = new GameEngine({ timeMode: '10+0' });

      expect(engine.game).toBeDefined();
      expect(engine.game.settings.timeMode).toBe('10+0');
    });

    test('应该初始化棋盘布局', () => {
      const engine = new GameEngine();
      const pieces = engine.game.board.getAllPieces();

      // 应该有28个棋子（每方14个）
      expect(pieces).toHaveLength(28);

      // 检查白方炮塔
      const whiteTurret = engine.game.board.getTurret('white');
      expect(whiteTurret).toBeDefined();
      expect(whiteTurret.position).toEqual({ col: 3, row: 6 }); // d1

      // 检查黑方炮塔
      const blackTurret = engine.game.board.getTurret('black');
      expect(blackTurret).toBeDefined();
      expect(blackTurret.position).toEqual({ col: 3, row: 0 }); // d7
    });

    test('应该初始化两个玩家', () => {
      const engine = new GameEngine({ timeMode: '15+10' });

      expect(engine.game.players).toHaveLength(2);
      expect(engine.game.players[0].id).toBe('white');
      expect(engine.game.players[1].id).toBe('black');

      // 检查时间设置
      expect(engine.game.players[0].timeLeft).toBe(15 * 60 * 1000);
      expect(engine.game.players[0].timeIncrement).toBe(10 * 1000);
    });
  });

  describe('游戏开始', () => {
    test('应该将游戏状态从waiting改为playing', () => {
      const engine = new GameEngine();

      expect(engine.game.state).toBe(GAME_CONFIG.GAME_STATES.WAITING);

      engine.startGame();

      expect(engine.game.state).toBe(GAME_CONFIG.GAME_STATES.PLAYING);
      expect(engine.game.startedAt).not.toBeNull();
    });

    test('应该设置白方为当前玩家', () => {
      const engine = new GameEngine();
      engine.startGame();

      const currentPlayer = engine.game.getCurrentPlayer();
      expect(currentPlayer.id).toBe('white');
    });
  });

  describe('时间模式', () => {
    test('10+0模式应该正确初始化', () => {
      const engine = new GameEngine({ timeMode: '10+0' });

      engine.game.players.forEach(player => {
        expect(player.timeLeft).toBe(10 * 60 * 1000);
        expect(player.timeIncrement).toBe(0);
      });
    });

    test('15+10模式应该正确初始化', () => {
      const engine = new GameEngine({ timeMode: '15+10' });

      engine.game.players.forEach(player => {
        expect(player.timeLeft).toBe(15 * 60 * 1000);
        expect(player.timeIncrement).toBe(10 * 1000);
      });
    });

    test('无限时间模式应该正确初始化', () => {
      const engine = new GameEngine({ timeMode: 'unlimited' });

      engine.game.players.forEach(player => {
        expect(player.timeLeft).toBe(Infinity);
        expect(player.timeIncrement).toBe(0);
      });
    });
  });

  describe('初始布局验证', () => {
    test('白方应该在第1-2行', () => {
      const engine = new GameEngine();
      const whitePieces = engine.game.board.getPiecesByOwner('white');

      whitePieces.forEach(piece => {
        expect(piece.position.row).toBeGreaterThanOrEqual(5); // 行6-7（反转后的1-2）
      });
    });

    test('黑方应该在第6-7行', () => {
      const engine = new GameEngine();
      const blackPieces = engine.game.board.getPiecesByOwner('black');

      blackPieces.forEach(piece => {
        expect(piece.position.row).toBeLessThanOrEqual(1); // 行0-1（反转后的6-7）
      });
    });

    test('每方应该有正确数量的各类棋子', () => {
      const engine = new GameEngine();

      const checkPieceCounts = (owner) => {
        expect(engine.game.board.getPiecesByType('mirror', owner)).toHaveLength(6);
        expect(engine.game.board.getPiecesByType('shield', owner)).toHaveLength(3);
        expect(engine.game.board.getPiecesByType('turret', owner)).toHaveLength(1);
        expect(engine.game.board.getPiecesByType('jumper', owner)).toHaveLength(2);
        expect(engine.game.board.getPiecesByType('splitter', owner)).toHaveLength(2);
      };

      checkPieceCounts('white');
      checkPieceCounts('black');
    });
  });

  describe('游戏重启', () => {
    test('应该能重置游戏到初始状态', () => {
      const engine = new GameEngine();
      engine.startGame();

      // 移动一个棋子
      const piece = engine.game.board.getPieceAt({ col: 0, row: 6 });
      if (piece) {
        engine.movePiece(piece.position, { col: 0, row: 5 });
      }

      // 重启游戏
      engine.restartGame();

      expect(engine.game.state).toBe(GAME_CONFIG.GAME_STATES.PLAYING);
      expect(engine.game.currentPlayerIndex).toBe(0);
      expect(engine.game.moveHistory).toHaveLength(0);
      expect(engine.game.board.getAllPieces()).toHaveLength(28);
    });
  });
});
