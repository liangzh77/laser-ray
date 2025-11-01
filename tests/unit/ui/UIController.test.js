/**
 * UIController Unit Tests
 * 测试UI控制器交互功能（T090）
 */

import { UIController } from '../../../src/ui/UIController.js';
import { GameEngine } from '../../../src/core/GameEngine.js';
import { BoardRenderer } from '../../../src/ui/BoardRenderer.js';

describe('UIController - UI交互功能', () => {
  let uiController;
  let gameEngine;
  let boardRenderer;
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

    // 创建游戏引擎
    gameEngine = new GameEngine({ timeMode: 'unlimited' });

    // 创建棋盘渲染器
    boardRenderer = new BoardRenderer(mockCanvas);

    // 创建UI控制器
    uiController = new UIController(gameEngine, boardRenderer);
  });

  describe('棋子选择交互', () => {
    test('应该能选中己方棋子', () => {
      gameEngine.startGame();

      // 选中白方棋子 (a2位置)
      const piece = gameEngine.game.board.getPieceAt({ col: 0, row: 5 });
      expect(piece).toBeDefined();
      expect(piece.owner).toBe('white');

      uiController.handleBoardClick({ col: 0, row: 5 });

      expect(uiController.selectedPiece).toBeDefined();
      expect(uiController.selectedPiece.id).toBe(piece.id);
    });

    test('不应该能选中对方棋子', () => {
      gameEngine.startGame();

      // 尝试选中黑方棋子 (a7位置)
      const piece = gameEngine.game.board.getPieceAt({ col: 0, row: 1 });
      expect(piece).toBeDefined();
      expect(piece.owner).toBe('black');

      uiController.handleBoardClick({ col: 0, row: 1 });

      expect(uiController.selectedPiece).toBeNull();
    });

    test('应该能取消选中棋子', () => {
      gameEngine.startGame();

      // 选中棋子
      uiController.handleBoardClick({ col: 0, row: 5 });
      expect(uiController.selectedPiece).toBeDefined();

      // 再次点击相同棋子 -> 取消选中
      uiController.handleBoardClick({ col: 0, row: 5 });
      expect(uiController.selectedPiece).toBeNull();
    });

    test('选中棋子时应该高亮可移动位置', () => {
      gameEngine.startGame();

      uiController.handleBoardClick({ col: 0, row: 5 });

      expect(uiController.validMoves).toBeDefined();
      expect(uiController.validMoves.length).toBeGreaterThan(0);
    });
  });

  describe('棋子移动交互', () => {
    test('应该能移动选中的棋子到有效位置', () => {
      gameEngine.startGame();

      // 选中棋子
      uiController.handleBoardClick({ col: 0, row: 5 });
      expect(uiController.selectedPiece).toBeDefined();

      // 移动到有效位置
      const initialPiece = gameEngine.game.board.getPieceAt({ col: 0, row: 5 });
      uiController.handleBoardClick({ col: 0, row: 4 });

      // 棋子应该已移动
      const movedPiece = gameEngine.game.board.getPieceAt({ col: 0, row: 4 });
      expect(movedPiece).toBeDefined();
      expect(movedPiece.id).toBe(initialPiece.id);

      // 选中状态应该清除
      expect(uiController.selectedPiece).toBeNull();
    });

    test('移动失败时应该保持选中状态', () => {
      gameEngine.startGame();

      uiController.handleBoardClick({ col: 0, row: 5 });
      const selectedPiece = uiController.selectedPiece;

      // 尝试移动到无效位置（对角线）
      uiController.handleBoardClick({ col: 1, row: 4 });

      // 选中状态应该保持
      expect(uiController.selectedPiece).toBe(selectedPiece);
    });
  });

  describe('操作按钮交互', () => {
    test('应该能旋转选中的棋子', () => {
      gameEngine.startGame();

      // 选中棋子
      uiController.handleBoardClick({ col: 0, row: 5 });
      const piece = uiController.selectedPiece;
      const oldDirection = piece.direction;

      // 旋转棋子
      uiController.handleRotateClick('clockwise');

      // 方向应该改变
      expect(piece.direction).not.toBe(oldDirection);

      // 选中状态应该清除
      expect(uiController.selectedPiece).toBeNull();
    });

    test('未选中棋子时旋转按钮应该无效', () => {
      gameEngine.startGame();

      // 没有选中棋子
      expect(uiController.selectedPiece).toBeNull();

      // 尝试旋转
      uiController.handleRotateClick('clockwise');

      // 不应该发生任何变化
      expect(uiController.selectedPiece).toBeNull();
    });

    test('应该能发射激光', () => {
      gameEngine.startGame();

      const result = uiController.handleFireLaserClick();

      // 激光应该发射成功
      // 注意: 由于默认棋盘布局, 激光不会立即结束游戏
      expect(gameEngine.game.moveHistory.length).toBeGreaterThan(0);
    });
  });

  describe('状态显示更新', () => {
    test('应该能更新游戏状态显示', () => {
      // 创建模拟DOM元素
      document.body.innerHTML = `
        <div id="current-turn"></div>
        <div id="turn-count"></div>
        <div id="move-count"></div>
        <div id="laser-count"></div>
        <div id="game-mode"></div>
        <div id="white-status"></div>
        <div id="black-status"></div>
      `;

      gameEngine.startGame();
      uiController.updateGameStatus();

      expect(document.getElementById('current-turn').textContent).toContain('白方');
      expect(document.getElementById('game-mode').textContent).toBe('unlimited');
    });

    test('应该能更新计时器显示', () => {
      document.body.innerHTML = `
        <div id="white-time"></div>
        <div id="black-time"></div>
      `;

      gameEngine.startGame();
      uiController.updateTimerDisplay();

      // 无限时间模式应该显示∞
      expect(document.getElementById('white-time').textContent).toBe('∞');
      expect(document.getElementById('black-time').textContent).toBe('∞');
    });
  });

  describe('游戏流程控制', () => {
    test('应该能重新开始游戏', () => {
      // 模拟confirm
      global.confirm = jest.fn(() => true);

      gameEngine.startGame();
      gameEngine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });

      const moveCountBefore = gameEngine.game.moveHistory.length;
      expect(moveCountBefore).toBeGreaterThan(0);

      uiController.handleRestartClick();

      // 游戏应该重置
      expect(gameEngine.game.moveHistory.length).toBe(0);
      expect(gameEngine.game.isPlaying()).toBe(true);
    });

    test('用户取消时不应该重新开始', () => {
      global.confirm = jest.fn(() => false);

      gameEngine.startGame();
      gameEngine.movePiece({ col: 0, row: 5 }, { col: 0, row: 4 });

      const moveCountBefore = gameEngine.game.moveHistory.length;

      uiController.handleRestartClick();

      // 游戏状态不应该改变
      expect(gameEngine.game.moveHistory.length).toBe(moveCountBefore);
    });

    test('应该能暂停和恢复游戏', () => {
      document.body.innerHTML = `
        <button id="pause-btn">
          <span class="btn-icon">⏸</span>
          暂停
        </button>
      `;

      gameEngine.startGame();
      uiController.startTimerUpdate();

      expect(uiController.timerIntervalId).not.toBeNull();

      // 暂停
      uiController.handlePauseClick();
      expect(uiController.timerIntervalId).toBeNull();

      // 恢复
      uiController.handlePauseClick();
      expect(uiController.timerIntervalId).not.toBeNull();

      uiController.stopTimerUpdate();
    });
  });

  describe('事件监听和响应', () => {
    test('游戏开始时应该启动计时器', () => {
      gameEngine.startGame();
      uiController.onGameStarted();

      expect(uiController.timerIntervalId).not.toBeNull();

      uiController.stopTimerUpdate();
    });

    test('游戏结束时应该停止计时器', () => {
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

      expect(uiController.timerIntervalId).not.toBeNull();

      uiController.onGameEnded({ winner: 'white', reason: 'turret_destroyed' });

      expect(uiController.timerIntervalId).toBeNull();
    });

    test('回合切换时应该更新状态显示', () => {
      document.body.innerHTML = `
        <div id="current-turn"></div>
        <div id="turn-count"></div>
        <div id="move-count"></div>
        <div id="laser-count"></div>
        <div id="game-mode"></div>
        <div id="white-status"></div>
        <div id="black-status"></div>
      `;

      gameEngine.startGame();

      uiController.onTurnStarted({ player: 'white', moveNumber: 1 });
      expect(document.getElementById('current-turn').textContent).toContain('白方');

      gameEngine.endTurn();
      uiController.onTurnStarted({ player: 'black', moveNumber: 2 });
      expect(document.getElementById('current-turn').textContent).toContain('黑方');
    });
  });

  describe('渲染功能', () => {
    test('应该能渲染游戏界面', () => {
      gameEngine.startGame();

      // 渲染不应该抛出错误
      expect(() => uiController.render()).not.toThrow();
    });

    test('选中棋子时应该高亮显示', () => {
      gameEngine.startGame();
      uiController.handleBoardClick({ col: 0, row: 5 });

      const highlightSpy = jest.spyOn(boardRenderer, 'highlightCells');

      uiController.render();

      expect(highlightSpy).toHaveBeenCalled();
      expect(highlightSpy).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(String)
      );
    });
  });

  describe('DOM事件监听器设置', () => {
    test('应该能设置所有按钮的事件监听器', () => {
      document.body.innerHTML = `
        <button id="rotate-btn"></button>
        <button id="fire-laser-btn"></button>
        <button id="restart-btn"></button>
        <button id="menu-btn"></button>
        <button id="play-again-btn"></button>
        <button id="back-to-menu-btn"></button>
        <button id="pause-btn"><span class="btn-icon"></span></button>
      `;

      const addEventListenerSpy = jest.spyOn(
        document.getElementById('rotate-btn'),
        'addEventListener'
      );

      uiController.setupDOMListeners();

      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  afterEach(() => {
    // 清理计时器
    if (uiController.timerIntervalId) {
      uiController.stopTimerUpdate();
    }

    // 清理DOM
    document.body.innerHTML = '';
  });
});
