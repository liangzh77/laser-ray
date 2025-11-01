/**
 * User Feedback Integration Tests
 * 测试UI反馈集成（T092）
 */

import { GameEngine } from '../../../src/core/GameEngine.js';
import { BoardRenderer } from '../../../src/ui/BoardRenderer.js';
import { UIController } from '../../../src/ui/UIController.js';
import { AnimationEngine } from '../../../src/ui/AnimationEngine.js';

describe('UI反馈集成测试', () => {
  let gameEngine;
  let boardRenderer;
  let uiController;
  let animationEngine;
  let mockCanvas;
  let mockContext;

  beforeEach(() => {
    // 创建模拟Canvas
    mockContext = {
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 10 })),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      }))
    };

    mockCanvas = {
      getContext: jest.fn(() => mockContext),
      width: 640,
      height: 640,
      addEventListener: jest.fn(),
      getBoundingClientRect: jest.fn(() => ({
        left: 0,
        top: 0,
        width: 640,
        height: 640
      }))
    };

    gameEngine = new GameEngine({ timeMode: 'unlimited' });
    boardRenderer = new BoardRenderer(mockCanvas);
    uiController = new UIController(gameEngine, boardRenderer);
    animationEngine = new AnimationEngine();

    global.requestAnimationFrame = jest.fn((callback) => {
      setTimeout(callback, 16);
      return 1;
    });
  });

  describe('视觉反馈集成', () => {
    test('选中棋子时应该有高亮反馈', () => {
      gameEngine.startGame();

      const highlightSpy = jest.spyOn(boardRenderer, 'highlightCells');

      // 选中棋子
      uiController.handleBoardClick({ col: 0, row: 5 });

      // 渲染
      uiController.render();

      // 应该高亮可移动位置
      expect(highlightSpy).toHaveBeenCalled();
      expect(uiController.validMoves.length).toBeGreaterThan(0);
    });

    test('移动棋子时应该有动画反馈', (done) => {
      gameEngine.startGame();

      // 选中棋子
      uiController.handleBoardClick({ col: 0, row: 5 });

      // 创建移动动画
      const from = boardRenderer.boardToPixel(0, 5);
      const to = boardRenderer.boardToPixel(0, 4);

      const animation = animationEngine.animateMove(from, to, 300);

      expect(animation).toBeDefined();

      setTimeout(() => {
        // 动画应该已完成
        expect(animationEngine.animations.length).toBe(0);
        done();
      }, 350);
    });

    test('旋转棋子时应该有旋转动画', (done) => {
      gameEngine.startGame();

      uiController.handleBoardClick({ col: 0, row: 5 });
      const piece = uiController.selectedPiece;

      // 创建旋转动画
      const fromAngle = 0;
      const toAngle = 90;

      animationEngine.animateRotate(fromAngle, toAngle, 300);

      setTimeout(() => {
        expect(animationEngine.animations.length).toBe(0);
        done();
      }, 350);
    });
  });

  describe('实时状态更新集成', () => {
    test('移动棋子后应该更新移动计数', () => {
      document.body.innerHTML = `
        <div id="move-count">0</div>
        <div id="current-turn"></div>
        <div id="turn-count"></div>
        <div id="laser-count"></div>
        <div id="game-mode"></div>
        <div id="white-status"></div>
        <div id="black-status"></div>
      `;

      gameEngine.startGame();

      const initialCount = parseInt(document.getElementById('move-count').textContent);

      // 移动棋子
      gameEngine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });

      // 更新UI
      uiController.updateGameStatus();

      const newCount = parseInt(document.getElementById('move-count').textContent);

      expect(newCount).toBeGreaterThan(initialCount);
    });

    test('回合切换后应该更新回合指示器', () => {
      document.body.innerHTML = `
        <div id="current-turn">白方回合</div>
        <div id="turn-count">1</div>
        <div id="move-count">0</div>
        <div id="laser-count">0</div>
        <div id="game-mode">unlimited</div>
        <div id="white-status">等待中</div>
        <div id="black-status">等待中</div>
      `;

      gameEngine.startGame();

      uiController.updateGameStatus();
      expect(document.getElementById('current-turn').textContent).toContain('白方');

      // 移动并结束回合
      gameEngine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });
      gameEngine.endTurn();

      uiController.updateGameStatus();
      expect(document.getElementById('current-turn').textContent).toContain('黑方');
    });

    test('发射激光后应该更新激光计数', () => {
      document.body.innerHTML = `
        <div id="laser-count">0</div>
        <div id="move-count">0</div>
        <div id="current-turn"></div>
        <div id="turn-count"></div>
        <div id="game-mode"></div>
        <div id="white-status"></div>
        <div id="black-status"></div>
      `;

      gameEngine.startGame();

      const initialCount = parseInt(document.getElementById('laser-count').textContent);

      // 发射激光
      gameEngine.fireLaser();

      uiController.updateGameStatus();

      const newCount = parseInt(document.getElementById('laser-count').textContent);

      expect(newCount).toBeGreaterThan(initialCount);
    });
  });

  describe('计时器和状态同步', () => {
    test('游戏开始时应该启动计时器并更新状态', () => {
      document.body.innerHTML = `
        <div id="white-time">10:00</div>
        <div id="black-time">10:00</div>
        <div id="current-turn"></div>
        <div id="turn-count"></div>
        <div id="move-count"></div>
        <div id="laser-count"></div>
        <div id="game-mode"></div>
        <div id="white-status"></div>
        <div id="black-status"></div>
      `;

      gameEngine.startGame();
      uiController.onGameStarted();

      // 计时器应该已启动
      expect(uiController.timerIntervalId).not.toBeNull();

      // 状态应该已更新
      expect(document.getElementById('current-turn').textContent).toContain('白方');

      uiController.stopTimerUpdate();
    });

    test('游戏结束时应该停止计时器并显示结束画面', () => {
      document.body.innerHTML = `
        <div id="game-screen" class="active"></div>
        <div id="game-over-screen"></div>
        <div id="winner-icon"></div>
        <div id="winner-text"></div>
        <div id="win-reason"></div>
        <div id="final-moves"></div>
        <div id="final-time"></div>
        <div id="final-lasers"></div>
      `;

      gameEngine.startGame();
      uiController.startTimerUpdate();

      // 结束游戏
      uiController.onGameEnded({ winner: 'white', reason: 'turret_destroyed' });

      // 计时器应该已停止
      expect(uiController.timerIntervalId).toBeNull();

      // 游戏结束画面应该显示
      expect(document.getElementById('game-over-screen').classList.contains('active')).toBe(true);
    });
  });

  describe('交互流程集成', () => {
    test('完整的移动交互流程应该提供连贯反馈', (done) => {
      document.body.innerHTML = `
        <div id="move-count">0</div>
        <div id="current-turn"></div>
        <div id="turn-count"></div>
        <div id="laser-count"></div>
        <div id="game-mode"></div>
        <div id="white-status"></div>
        <div id="black-status"></div>
      `;

      gameEngine.startGame();

      // 1. 选中棋子
      uiController.handleBoardClick({ col: 0, row: 5 });
      expect(uiController.selectedPiece).toBeDefined();

      // 2. 高亮可移动位置
      expect(uiController.validMoves.length).toBeGreaterThan(0);

      // 3. 移动棋子
      const from = boardRenderer.boardToPixel(0, 5);
      const to = boardRenderer.boardToPixel(0, 4);
      animationEngine.animateMove(from, to, 100);

      // 4. 等待动画完成
      setTimeout(() => {
        // 5. 更新状态
        uiController.updateGameStatus();

        // 移动计数应该增加
        const moveCount = parseInt(document.getElementById('move-count').textContent);
        expect(moveCount).toBeGreaterThan(0);

        done();
      }, 150);
    });

    test('完整的激光发射流程应该提供视觉反馈', (done) => {
      gameEngine.startGame();

      // 发射激光
      const result = gameEngine.fireLaser();

      if (result.success && result.laserBeam) {
        // 创建激光动画
        const path = result.laserBeam.getPath();
        animationEngine.animateLaser(path, 500);

        setTimeout(() => {
          // 动画应该已完成
          expect(animationEngine.animations.length).toBe(0);
          done();
        }, 550);
      } else {
        done();
      }
    });
  });

  describe('错误和边界情况反馈', () => {
    test('无效操作时应该保持当前状态', () => {
      gameEngine.startGame();

      // 选中棋子
      uiController.handleBoardClick({ col: 0, row: 5 });
      const selectedPiece = uiController.selectedPiece;

      // 尝试无效移动
      uiController.handleBoardClick({ col: 5, row: 5 });

      // 选中状态应该保持（因为移动失败）
      expect(uiController.selectedPiece).toBe(selectedPiece);
    });

    test('游戏结束后不应该响应操作', () => {
      document.body.innerHTML = `
        <div id="game-screen" class="active"></div>
        <div id="game-over-screen"></div>
        <div id="winner-icon"></div>
        <div id="winner-text"></div>
        <div id="win-reason"></div>
        <div id="final-moves"></div>
        <div id="final-time"></div>
        <div id="final-lasers"></div>
      `;

      gameEngine.startGame();

      // 结束游戏
      gameEngine.stateManager.endGame('white', 'test');

      // 尝试选中棋子（应该失败）
      uiController.handleBoardClick({ col: 0, row: 5 });

      // 不应该有选中的棋子
      expect(uiController.selectedPiece).toBeNull();
    });
  });

  describe('性能和响应速度', () => {
    test('UI更新应该在合理时间内完成', () => {
      document.body.innerHTML = `
        <div id="move-count">0</div>
        <div id="current-turn"></div>
        <div id="turn-count"></div>
        <div id="laser-count"></div>
        <div id="game-mode"></div>
        <div id="white-status"></div>
        <div id="black-status"></div>
      `;

      gameEngine.startGame();

      const startTime = performance.now();

      // 执行多次状态更新
      for (let i = 0; i < 10; i++) {
        uiController.updateGameStatus();
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 10次更新应该在50ms内完成
      expect(totalTime).toBeLessThan(50);
    });

    test('渲染应该保持流畅', () => {
      gameEngine.startGame();

      const startTime = performance.now();

      // 执行多次渲染
      for (let i = 0; i < 10; i++) {
        uiController.render();
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 10次渲染应该在合理时间内完成
      expect(totalTime).toBeLessThan(200);
    });
  });

  afterEach(() => {
    if (uiController.timerIntervalId) {
      uiController.stopTimerUpdate();
    }

    animationEngine.cancelAll();
    animationEngine.stop();

    document.body.innerHTML = '';
  });
});
