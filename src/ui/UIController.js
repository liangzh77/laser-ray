/**
 * UI Controller
 * UI控制器 - 管理用户界面交互
 */

import { on, GAME_EVENTS } from '../core/EventBus.js';
import { getValidCastleMoves } from '../utils/validation.js';

export class UIController {
  constructor(gameEngine, boardRenderer) {
    this.gameEngine = gameEngine;
    this.boardRenderer = boardRenderer;

    this.selectedPiece = null;
    this.validMoves = [];

    // 计时器更新间隔ID
    this.timerIntervalId = null;

    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听游戏事件
    on(GAME_EVENTS.GAME_STARTED, () => this.onGameStarted());
    on(GAME_EVENTS.GAME_ENDED, (data) => this.onGameEnded(data));
    on(GAME_EVENTS.PIECE_MOVED, () => this.render());
    on(GAME_EVENTS.PIECE_ROTATED, () => this.render());
    on(GAME_EVENTS.PIECE_DESTROYED, () => this.render());
    on(GAME_EVENTS.TURN_STARTED, (data) => this.onTurnStarted(data));
  }

  /**
   * 渲染UI
   */
  render() {
    this.boardRenderer.render(this.gameEngine.game.board);

    // 如果有选中的棋子，高亮可移动位置
    if (this.selectedPiece && this.validMoves.length > 0) {
      this.boardRenderer.highlightCells(this.validMoves, 'rgba(0, 255, 0, 0.3)');
    }
  }

  /**
   * 处理棋盘点击
   * @param {Object} position - { col, row }
   */
  handleBoardClick(position) {
    const piece = this.gameEngine.game.board.getPieceAt(position);

    if (this.selectedPiece) {
      // 已有选中的棋子
      if (piece && piece.id === this.selectedPiece.id) {
        // 点击相同棋子 -> 取消选中
        this.deselectPiece();
      } else {
        // 尝试移动到新位置
        this.attemptMove(position);
      }
    } else {
      // 没有选中的棋子 -> 尝试选中
      if (piece) {
        this.selectPiece(piece);
      }
    }
  }

  /**
   * 选中棋子
   * @private
   */
  selectPiece(piece) {
    const currentPlayer = this.gameEngine.game.getCurrentPlayer();

    // 只能选中己方棋子
    if (piece.owner !== currentPlayer.id) {
      return;
    }

    this.selectedPiece = piece;

    // 计算可移动位置
    this.validMoves = getValidCastleMoves(
      piece.position,
      pos => this.gameEngine.game.board.hasPieceAt(pos)
    );

    this.render();
    this.updateActionButtons();
  }

  /**
   * 取消选中棋子
   * @private
   */
  deselectPiece() {
    this.selectedPiece = null;
    this.validMoves = [];
    this.render();
    this.updateActionButtons();
  }

  /**
   * 尝试移动棋子
   * @private
   */
  attemptMove(to) {
    if (!this.selectedPiece) return;

    const result = this.gameEngine.movePiece(this.selectedPiece.position, to);

    if (result.success) {
      this.deselectPiece();
      // 移动成功后自动结束回合
      this.gameEngine.endTurn();
    } else {
      console.log('移动失败:', result.reason);
    }
  }

  /**
   * 游戏开始事件处理
   * @private
   */
  onGameStarted() {
    this.render();
    this.updateStatus('游戏开始！白方先手');
  }

  /**
   * 游戏结束事件处理
   * @private
   */
  onGameEnded(data) {
    const winner = data.winner === 'white' ? '白方' : '黑方';
    this.updateStatus(`游戏结束！${winner}获胜 - ${data.reason}`);
  }

  /**
   * 回合开始事件处理
   * @private
   */
  onTurnStarted(data) {
    const player = data.player === 'white' ? '白方' : '黑方';
    this.updateStatus(`${player}的回合`);
  }

  /**
   * 更新状态显示
   * @private
   */
  updateStatus(message) {
    // 这里应该更新DOM中的状态显示
    console.log('状态:', message);

    const statusElement = document.getElementById('gameStatus');
    if (statusElement) {
      statusElement.textContent = message;
    }
  }

  /**
   * 处理旋转按钮点击
   * @param {string} direction - 'clockwise' 或 'counterclockwise'
   */
  handleRotateClick(direction = 'clockwise') {
    if (!this.selectedPiece) {
      console.log('请先选中一个棋子');
      return;
    }

    const result = this.gameEngine.rotatePiece(this.selectedPiece.position, direction);

    if (result.success) {
      this.deselectPiece();
      // 旋转成功后自动结束回合
      this.gameEngine.endTurn();
    } else {
      console.log('旋转失败:', result.reason);
    }
  }

  /**
   * 处理激光发射按钮点击
   */
  handleFireLaserClick() {
    const result = this.gameEngine.fireLaser();

    if (result.success) {
      // 显示激光动画,动画结束后再执行后续操作
      this.showLaserAnimation(result.laserBeam, () => {
        this.deselectPiece();
        // 激光发射后自动结束回合
        this.gameEngine.endTurn();
      });
    } else {
      console.log('发射激光失败:', result.reason);
    }
  }

  /**
   * 显示激光动画
   * @param {LaserBeam} laserBeam - 激光束
   * @param {Function} onComplete - 动画完成后的回调函数
   */
  showLaserAnimation(laserBeam, onComplete) {
    console.log('激光束数据:', laserBeam);

    // 先渲染棋盘
    this.render();

    // 然后绘制激光
    this.boardRenderer.drawLaser(laserBeam, {
      color: 'rgba(255, 50, 50, 0.9)',
      width: 4,
      glowIntensity: 0.8
    });

    // 延迟一段时间后清除激光并执行回调
    setTimeout(() => {
      this.render();
      if (onComplete) {
        onComplete();
      }
    }, 1500);
  }

  /**
   * 更新操作按钮状态
   */
  updateActionButtons() {
    const rotateBtn = document.getElementById('rotate-btn');
    const fireLaserBtn = document.getElementById('fire-laser-btn');

    if (rotateBtn) {
      rotateBtn.disabled = !this.selectedPiece || !this.gameEngine.game.isPlaying();
    }

    if (fireLaserBtn) {
      fireLaserBtn.disabled = !this.gameEngine.game.isPlaying();
    }
  }

  /**
   * 设置DOM事件监听器
   */
  setupDOMListeners() {
    const rotateBtn = document.getElementById('rotate-btn');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => this.handleRotateClick('clockwise'));
    }

    const fireLaserBtn = document.getElementById('fire-laser-btn');
    if (fireLaserBtn) {
      fireLaserBtn.addEventListener('click', () => this.handleFireLaserClick());
    }

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.handleRestartClick());
    }

    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => this.handleReturnToMenuClick());
    }

    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => this.handlePlayAgainClick());
    }

    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    if (backToMenuBtn) {
      backToMenuBtn.addEventListener('click', () => this.handleReturnToMenuClick());
    }

    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.handlePauseClick());
    }
  }

  // ============ US4: 游戏流程和胜负判定 UI功能 ============

  /**
   * T084: 创建计时器显示
   * 启动计时器更新
   */
  startTimerUpdate() {
    // 停止之前的计时器
    this.stopTimerUpdate();

    // 立即更新一次
    this.updateTimerDisplay();

    // 每100ms更新一次计时器显示
    this.timerIntervalId = setInterval(() => {
      this.updateTimerDisplay();
      this.updatePlayerTime();
    }, 100);
  }

  /**
   * T084: 停止计时器更新
   */
  stopTimerUpdate() {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  /**
   * T084: 更新计时器显示
   */
  updateTimerDisplay() {
    const whitePlayer = this.gameEngine.game.getPlayerById('white');
    const blackPlayer = this.gameEngine.game.getPlayerById('black');

    const whiteTimeEl = document.getElementById('white-time');
    const blackTimeEl = document.getElementById('black-time');

    if (whiteTimeEl && whitePlayer) {
      whiteTimeEl.textContent = whitePlayer.getFormattedTime();
    }

    if (blackTimeEl && blackPlayer) {
      blackTimeEl.textContent = blackPlayer.getFormattedTime();
    }
  }

  /**
   * T084: 更新当前玩家的时间（递减）
   */
  updatePlayerTime() {
    if (!this.gameEngine.game.isPlaying()) {
      return;
    }

    const currentPlayer = this.gameEngine.game.getCurrentPlayer();
    if (currentPlayer && currentPlayer.timeLeft !== Infinity) {
      this.gameEngine.updatePlayerTime(currentPlayer.id, 100); // 减少100ms
    }
  }

  /**
   * T085: 更新游戏状态显示
   */
  updateGameStatus() {
    const game = this.gameEngine.game;
    const currentPlayer = game.getCurrentPlayer();

    // 更新当前回合指示器
    const currentTurnEl = document.getElementById('current-turn');
    if (currentTurnEl) {
      const playerName = currentPlayer.id === 'white' ? '白方' : '黑方';
      currentTurnEl.textContent = `${playerName}回合`;
    }

    // 更新回合数
    const turnCountEl = document.getElementById('turn-count');
    if (turnCountEl) {
      turnCountEl.textContent = Math.floor(game.currentMoveNumber / 2) + 1;
    }

    // 更新移动次数
    const moveCountEl = document.getElementById('move-count');
    if (moveCountEl) {
      moveCountEl.textContent = game.moveHistory.length;
    }

    // 更新激光发射次数
    const laserCountEl = document.getElementById('laser-count');
    if (laserCountEl) {
      const laserMoves = game.moveHistory.filter(m => m.type === 'fireLaser');
      laserCountEl.textContent = laserMoves.length;
    }

    // 更新游戏模式
    const gameModeEl = document.getElementById('game-mode');
    if (gameModeEl) {
      gameModeEl.textContent = game.settings.timeMode;
    }

    // 更新玩家状态指示器
    const whiteStatusEl = document.getElementById('white-status');
    const blackStatusEl = document.getElementById('black-status');

    if (whiteStatusEl) {
      whiteStatusEl.textContent = currentPlayer.id === 'white' ? '进行中' : '等待中';
    }

    if (blackStatusEl) {
      blackStatusEl.textContent = currentPlayer.id === 'black' ? '进行中' : '等待中';
    }
  }

  /**
   * T086: 显示游戏结束画面
   */
  showGameOverScreen() {
    const game = this.gameEngine.game;

    // 停止计时器
    this.stopTimerUpdate();

    // 隐藏游戏界面
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
      gameScreen.classList.remove('active');
    }

    // 显示游戏结束界面
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
      gameOverScreen.classList.add('active');
    }

    // 更新获胜者信息
    const winnerIcon = document.getElementById('winner-icon');
    const winnerText = document.getElementById('winner-text');
    const winReason = document.getElementById('win-reason');

    if (winnerIcon && winnerText && winReason) {
      const winnerName = game.winner === 'white' ? '白方' : '黑方';
      winnerIcon.textContent = game.winner === 'white' ? '♔' : '♚';
      winnerText.textContent = `${winnerName}获胜！`;

      // 翻译获胜原因
      let reasonText = game.winReason;
      if (game.winReason === 'turret_destroyed') {
        reasonText = '激光炮塔被摧毁';
      } else if (game.winReason.includes('时间')) {
        reasonText = '对手时间耗尽';
      }

      winReason.textContent = reasonText;
    }

    // 更新游戏统计
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const finalLasers = document.getElementById('final-lasers');

    if (finalMoves) {
      finalMoves.textContent = game.moveHistory.length;
    }

    if (finalTime) {
      finalTime.textContent = game.getFormattedDuration();
    }

    if (finalLasers) {
      const laserCount = game.moveHistory.filter(m => m.type === 'fireLaser').length;
      finalLasers.textContent = laserCount;
    }
  }

  /**
   * T088: 返回主菜单
   */
  handleReturnToMenuClick() {
    // 停止计时器
    this.stopTimerUpdate();

    // 隐藏游戏界面和游戏结束界面
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const mainMenu = document.getElementById('main-menu');

    if (gameScreen) {
      gameScreen.classList.remove('active');
    }

    if (gameOverScreen) {
      gameOverScreen.classList.remove('active');
    }

    if (mainMenu) {
      mainMenu.classList.add('active');
    }

    // 重置游戏
    this.gameEngine.game.reset();
  }

  /**
   * T087: 重新开始游戏
   */
  handleRestartClick() {
    if (confirm('确定要重新开始游戏吗？')) {
      this.gameEngine.restartGame();
      this.startTimerUpdate();
      this.updateGameStatus();
      this.render();
    }
  }

  /**
   * T086: 再来一局（从游戏结束界面）
   */
  handlePlayAgainClick() {
    // 隐藏游戏结束界面
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
      gameOverScreen.classList.remove('active');
    }

    // 显示游戏界面
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
      gameScreen.classList.add('active');
    }

    // 重新开始游戏
    this.gameEngine.restartGame();
    this.startTimerUpdate();
    this.updateGameStatus();
    this.render();
  }

  /**
   * 暂停/恢复游戏
   */
  handlePauseClick() {
    const pauseBtn = document.getElementById('pause-btn');
    if (!pauseBtn) return;

    if (this.timerIntervalId) {
      // 当前正在运行，暂停
      this.stopTimerUpdate();
      pauseBtn.querySelector('.btn-icon').textContent = '▶';
      pauseBtn.lastChild.textContent = '继续';
    } else {
      // 当前已暂停，恢复
      this.startTimerUpdate();
      pauseBtn.querySelector('.btn-icon').textContent = '⏸';
      pauseBtn.lastChild.textContent = '暂停';
    }
  }

  /**
   * 扩展游戏开始事件处理
   * @override
   */
  onGameStarted() {
    this.render();
    this.startTimerUpdate();
    this.updateGameStatus();
    this.updateActionButtons();
    this.updateStatus('游戏开始！白方先手');
  }

  /**
   * 扩展游戏结束事件处理
   * @override
   */
  onGameEnded(data) {
    const winner = data.winner === 'white' ? '白方' : '黑方';
    this.updateStatus(`游戏结束！${winner}获胜 - ${data.reason}`);
    this.showGameOverScreen();
  }

  /**
   * 扩展回合开始事件处理
   * @override
   */
  onTurnStarted(data) {
    const player = data.player === 'white' ? '白方' : '黑方';
    this.updateStatus(`${player}的回合`);
    this.updateGameStatus();
    this.updateActionButtons();
  }
}
