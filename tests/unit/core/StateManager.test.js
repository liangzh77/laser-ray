/**
 * State Manager Unit Tests
 * 测试游戏状态管理器
 */

import { StateManager } from '../../../src/core/StateManager.js';
import { Game } from '../../../src/models/Game.js';
import { GAME_CONFIG } from '../../../src/config/game-config.js';

describe('State Manager - 游戏状态管理', () => {
  let game;
  let stateManager;

  beforeEach(() => {
    game = new Game({ timeMode: 'unlimited' });
    stateManager = new StateManager(game);
  });

  describe('状态转换 (T074)', () => {
    test('应该能从waiting状态转换到playing', () => {
      expect(game.state).toBe('waiting');

      const result = stateManager.changeState('playing');

      expect(result).toBe(true);
      expect(game.state).toBe('playing');
    });

    test('应该能从playing状态转换到laserFiring', () => {
      game.setState('playing');

      const result = stateManager.changeState('laserFiring');

      expect(result).toBe(true);
      expect(game.state).toBe('laserFiring');
    });

    test('应该能从playing状态转换到gameOver', () => {
      game.setState('playing');

      const result = stateManager.changeState('gameOver');

      expect(result).toBe(true);
      expect(game.state).toBe('gameOver');
    });

    test('应该能从laserFiring状态转换回playing', () => {
      game.setState('laserFiring');

      const result = stateManager.changeState('playing');

      expect(result).toBe(true);
      expect(game.state).toBe('playing');
    });

    test('应该拒绝无效的状态转换', () => {
      game.setState('playing');

      // waiting -> playing是唯一允许的从waiting出发的转换
      // 尝试从playing回到waiting是无效的
      const result = stateManager.changeState('waiting');

      expect(result).toBe(false);
      expect(game.state).toBe('playing'); // 状态不变
    });

    test('应该保存状态历史', () => {
      const initialHistoryLength = stateManager.getStateHistory().length;

      stateManager.changeState('playing');

      expect(stateManager.getStateHistory().length).toBe(initialHistoryLength + 1);
    });

    test('应该限制状态历史大小', () => {
      // 进行大量状态变化
      for (let i = 0; i < 100; i++) {
        game.setState('playing');
        stateManager.changeState('laserFiring');
        game.setState('playing');
        stateManager.changeState('playing');
      }

      const history = stateManager.getStateHistory();
      expect(history.length).toBeLessThanOrEqual(50); // maxHistorySize = 50
    });
  });

  describe('游戏开始', () => {
    test('应该能开始游戏', () => {
      stateManager.startGame();

      expect(game.state).toBe('playing');
      expect(game.isPlaying()).toBe(true);
    });

    test('只能从waiting状态开始游戏', () => {
      game.setState('gameOver');

      // 尝试从gameOver状态开始游戏（应该失败）
      stateManager.startGame();

      // 状态不应该改变
      expect(game.state).toBe('gameOver');
    });
  });

  describe('游戏结束', () => {
    test('应该能结束游戏', () => {
      game.setState('playing');

      stateManager.endGame('white', 'turret_destroyed');

      expect(game.state).toBe('gameOver');
      expect(game.isGameOver()).toBe(true);
      expect(game.winner).toBe('white');
      expect(game.winReason).toBe('turret_destroyed');
    });

    test('不应该重复结束游戏', () => {
      game.setState('playing');
      stateManager.endGame('white', 'turret_destroyed');

      // 记录当前时间
      const firstEndTime = game.endTime;

      // 尝试再次结束游戏
      stateManager.endGame('black', 'time_expired');

      // 获胜者和原因不应该改变
      expect(game.winner).toBe('white');
      expect(game.winReason).toBe('turret_destroyed');
      expect(game.endTime).toBe(firstEndTime);
    });
  });

  describe('激光发射状态', () => {
    test('应该能进入激光发射状态', () => {
      game.setState('playing');

      stateManager.enterLaserFiringState();

      expect(game.state).toBe('laserFiring');
    });

    test('应该能退出激光发射状态', () => {
      game.setState('laserFiring');

      stateManager.exitLaserFiringState();

      expect(game.state).toBe('playing');
    });
  });

  describe('操作验证', () => {
    test('只能在playing状态执行操作', () => {
      game.setState('waiting');
      expect(stateManager.canPerformOperation('move')).toBe(false);

      game.setState('playing');
      expect(stateManager.canPerformOperation('move')).toBe(true);

      game.setState('laserFiring');
      expect(stateManager.canPerformOperation('move')).toBe(false);

      game.setState('gameOver');
      expect(stateManager.canPerformOperation('move')).toBe(false);
    });

    test('每回合只能执行一次操作', () => {
      game.setState('playing');

      expect(stateManager.canPerformOperation('move')).toBe(true);

      stateManager.recordOperation('move');

      expect(stateManager.canPerformOperation('rotate')).toBe(false);
      expect(stateManager.canPerformOperation('fireLaser')).toBe(false);
    });

    test('结束回合后应该能再次操作', () => {
      game.setState('playing');

      stateManager.recordOperation('move');
      expect(stateManager.canPerformOperation('move')).toBe(false);

      // 结束回合（清除当前操作）
      game.clearCurrentOperation();

      expect(stateManager.canPerformOperation('move')).toBe(true);
    });
  });

  describe('状态历史管理', () => {
    test('应该能获取状态历史', () => {
      stateManager.changeState('playing');
      stateManager.changeState('laserFiring');
      stateManager.changeState('playing');

      const history = stateManager.getStateHistory();

      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty('state');
      expect(history[0]).toHaveProperty('timestamp');
    });

    test('应该能清空状态历史', () => {
      stateManager.changeState('playing');
      stateManager.changeState('laserFiring');

      stateManager.clearHistory();

      expect(stateManager.getStateHistory().length).toBe(0);
    });

    test('应该能获取当前状态', () => {
      game.setState('playing');

      expect(stateManager.getCurrentState()).toBe('playing');
    });
  });

  describe('状态验证', () => {
    test('应该正确验证有效的状态转换', () => {
      const validTransitions = [
        { from: 'waiting', to: 'playing' },
        { from: 'playing', to: 'laserFiring' },
        { from: 'playing', to: 'gameOver' },
        { from: 'laserFiring', to: 'playing' },
        { from: 'laserFiring', to: 'gameOver' }
      ];

      validTransitions.forEach(({ from, to }) => {
        game.setState(from);
        const result = stateManager.changeState(to);
        expect(result).toBe(true);
      });
    });

    test('应该正确拒绝无效的状态转换', () => {
      const invalidTransitions = [
        { from: 'playing', to: 'waiting' },
        { from: 'laserFiring', to: 'waiting' },
        { from: 'gameOver', to: 'playing' },
        { from: 'gameOver', to: 'laserFiring' }
      ];

      invalidTransitions.forEach(({ from, to }) => {
        game.setState(from);
        const result = stateManager.changeState(to);
        expect(result).toBe(false);
      });
    });
  });

  describe('事件发布', () => {
    test('状态改变应该发布事件', (done) => {
      const { on, GAME_EVENTS } = require('../../../src/core/EventBus.js');

      on(GAME_EVENTS.STATE_CHANGED, (data) => {
        expect(data.from).toBe('waiting');
        expect(data.to).toBe('playing');
        done();
      });

      stateManager.changeState('playing');
    });

    test('游戏开始应该发布事件', (done) => {
      const { on, GAME_EVENTS } = require('../../../src/core/EventBus.js');

      on(GAME_EVENTS.GAME_STARTED, (data) => {
        expect(data.gameId).toBe(game.id);
        done();
      });

      stateManager.startGame();
    });

    test('游戏结束应该发布事件', (done) => {
      const { on, GAME_EVENTS } = require('../../../src/core/EventBus.js');

      game.setState('playing');

      on(GAME_EVENTS.GAME_ENDED, (data) => {
        expect(data.winner).toBe('white');
        expect(data.reason).toBe('turret_destroyed');
        done();
      });

      stateManager.endGame('white', 'turret_destroyed');
    });
  });
});
