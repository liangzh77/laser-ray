/**
 * Main Entry Point
 * 主入口文件 - 集成游戏引擎和UI
 */

import { GameEngine } from './core/GameEngine.js';
import { BoardRenderer } from './ui/BoardRenderer.js';
import { UIController } from './ui/UIController.js';
import { AnimationEngine } from './ui/AnimationEngine.js';
import { on, GAME_EVENTS } from './core/EventBus.js';

/**
 * 激光棋游戏应用
 */
class LaserChessApp {
  constructor() {
    this.gameEngine = null;
    this.boardRenderer = null;
    this.uiController = null;
    this.animationEngine = null;

    this.currentScreen = 'main-menu';
    this.selectedGameMode = null;

    this.init();
  }

  init() {
    this.bindMenuEvents();
    this.showScreen('main-menu');
  }

  /**
   * 绑定菜单事件
   */
  bindMenuEvents() {
    // 主菜单事件
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectGameMode(e));
    });

    document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
    document.getElementById('rules-btn').addEventListener('click', () => this.showRules());
    document.getElementById('close-rules').addEventListener('click', () => this.hideRules());

    // 游戏界面事件
    document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    document.getElementById('menu-btn').addEventListener('click', () => this.backToMenu());
    document.getElementById('sound-btn').addEventListener('click', () => this.toggleSound());

    // 游戏结束界面事件
    document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
    document.getElementById('back-to-menu-btn').addEventListener('click', () => this.backToMenu());
  }

  /**
   * 绑定游戏界面事件
   */
  bindGameEvents() {
    const canvas = document.getElementById('game-board');

    // 棋盘点击事件
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 转换为棋盘坐标
      const cellSize = canvas.width / 7;
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      this.uiController.handleBoardClick({ col, row });
    });

    // 操作按钮事件
    document.getElementById('move-btn').addEventListener('click', () => {
      // 移动模式由UIController处理
      console.log('移动模式');
    });

    document.getElementById('rotate-btn').addEventListener('click', () => {
      if (this.uiController.selectedPiece) {
        this.uiController.handleRotateClick();
      }
    });

    document.getElementById('fire-laser-btn').addEventListener('click', () => {
      this.uiController.handleFireLaserClick();
    });

    // 监听游戏事件
    on(GAME_EVENTS.GAME_ENDED, (data) => {
      this.showGameOver(data);
    });

    on(GAME_EVENTS.TURN_STARTED, (data) => {
      this.updateTurnDisplay(data);
    });
  }

  /**
   * 选择游戏模式
   */
  selectGameMode(e) {
    const mode = e.currentTarget.dataset.mode;

    // 更新选中状态
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    e.currentTarget.classList.add('selected');

    this.selectedGameMode = mode;

    // 启用开始按钮
    const startBtn = document.getElementById('start-game-btn');
    startBtn.disabled = false;

    // 更新按钮文本
    const modeNames = {
      '10+0': '快速对局',
      '15+10': '标准对局',
      'unlimited': '休闲对局'
    };
    startBtn.textContent = `开始${modeNames[mode]}`;
  }

  /**
   * 开始游戏
   */
  startGame() {
    if (!this.selectedGameMode) return;

    // 切换到游戏界面
    this.showScreen('game-screen');

    // 初始化游戏引擎和UI
    this.initializeGame();

    // 更新游戏模式显示
    document.getElementById('game-mode').textContent = this.selectedGameMode;
  }

  /**
   * 初始化游戏
   */
  initializeGame() {
    // 创建游戏引擎
    const settings = {
      timeControl: this.selectedGameMode,
      mode: 'pvp' // 玩家对玩家
    };
    this.gameEngine = new GameEngine(settings);

    // 创建渲染器
    const canvas = document.getElementById('game-board');
    this.boardRenderer = new BoardRenderer(canvas);

    // 创建UI控制器
    this.uiController = new UIController(this.gameEngine, this.boardRenderer);

    // 创建动画引擎
    this.animationEngine = new AnimationEngine(canvas);

    // 绑定游戏事件
    this.bindGameEvents();

    // 初始渲染
    this.uiController.render();

    // 开始游戏
    this.gameEngine.startGame();

    console.log('游戏引擎已初始化并启动');
  }

  /**
   * 更新回合显示
   */
  updateTurnDisplay(data) {
    const currentTurnEl = document.getElementById('current-turn');
    const turnCountEl = document.getElementById('turn-count');

    currentTurnEl.textContent = `${data.currentPlayer === 'white' ? '白方' : '黑方'}回合`;
    turnCountEl.textContent = data.turnNumber;

    // 更新玩家状态
    document.getElementById('white-status').textContent =
      data.currentPlayer === 'white' ? '行动中' : '等待中';
    document.getElementById('black-status').textContent =
      data.currentPlayer === 'black' ? '行动中' : '等待中';
  }

  /**
   * 显示游戏结束
   */
  showGameOver(data) {
    // 更新胜者信息
    const winnerIcon = document.getElementById('winner-icon');
    const winnerText = document.getElementById('winner-text');
    const winReason = document.getElementById('win-reason');

    winnerIcon.textContent = data.winner === 'white' ? '♔' : '♚';
    winnerText.textContent = `${data.winner === 'white' ? '白方' : '黑方'}获胜！`;
    winReason.textContent = data.reason || '对手激光炮塔被摧毁';

    // 更新统计信息
    document.getElementById('final-moves').textContent = this.gameEngine.game.moveCount;
    document.getElementById('final-lasers').textContent = this.gameEngine.game.laserCount;

    // 计算游戏时长
    const duration = Math.floor((Date.now() - this.gameEngine.game.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    document.getElementById('final-time').textContent =
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // 显示游戏结束界面
    this.showScreen('game-over-screen');
  }

  /**
   * 切换暂停
   */
  togglePause() {
    const btn = document.getElementById('pause-btn');
    const isPaused = btn.classList.contains('paused');

    if (isPaused) {
      btn.classList.remove('paused');
      btn.innerHTML = '<span class="btn-icon">⏸</span>暂停';
      // TODO: 恢复计时器
    } else {
      btn.classList.add('paused');
      btn.innerHTML = '<span class="btn-icon">▶</span>继续';
      // TODO: 暂停计时器
    }
  }

  /**
   * 重新开始游戏
   */
  restartGame() {
    if (confirm('确定要重新开始游戏吗？')) {
      this.initializeGame();
    }
  }

  /**
   * 返回主菜单
   */
  backToMenu() {
    if (this.gameEngine && !confirm('确定要离开当前游戏吗？')) {
      return;
    }

    this.gameEngine = null;
    this.selectedGameMode = null;

    // 重置主菜单
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    document.getElementById('start-game-btn').disabled = true;
    document.getElementById('start-game-btn').textContent = '开始游戏';

    this.showScreen('main-menu');
  }

  /**
   * 再来一局
   */
  playAgain() {
    this.showScreen('game-screen');
    this.initializeGame();
  }

  /**
   * 切换音效
   */
  toggleSound() {
    const btn = document.getElementById('sound-btn');
    const isMuted = btn.classList.contains('muted');

    if (isMuted) {
      btn.classList.remove('muted');
      btn.innerHTML = '<span class="btn-icon">🔊</span>音效';
    } else {
      btn.classList.add('muted');
      btn.innerHTML = '<span class="btn-icon">🔇</span>音效';
    }
  }

  /**
   * 显示规则
   */
  showRules() {
    document.getElementById('rules-modal').classList.add('active');
  }

  /**
   * 隐藏规则
   */
  hideRules() {
    document.getElementById('rules-modal').classList.remove('active');
  }

  /**
   * 显示屏幕
   */
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add('active');
      this.currentScreen = screenId;
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  window.laserChessApp = new LaserChessApp();
  console.log('激光棋游戏已启动（完整版）');
});
