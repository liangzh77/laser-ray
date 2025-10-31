/**
 * Timer
 * 计时器系统 - 管理游戏时间和倒计时
 */

export class Timer {
  /**
   * @param {Object} config
   * @param {number} config.initialTime - 初始时间（毫秒），Infinity表示无限时间
   * @param {number} config.increment - 时间增量（毫秒）
   */
  constructor({ initialTime, increment = 0 }) {
    this.initialTime = initialTime;
    this.timeLeft = initialTime;
    this.increment = increment;
    this.isRunning = false;
    this.intervalId = null;
    this.lastUpdate = null;
    this.onExpired = null; // 时间耗尽回调
  }

  /**
   * 启动计时器
   */
  start() {
    if (this.isRunning || this.timeLeft === Infinity) {
      return;
    }

    this.isRunning = true;
    this.lastUpdate = Date.now();

    // 每100ms更新一次时间
    this.intervalId = setInterval(() => {
      this.update();
    }, 100);
  }

  /**
   * 停止计时器
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.lastUpdate = null;
  }

  /**
   * 暂停计时器
   */
  pause() {
    if (this.isRunning) {
      this.update(); // 更新到最新时间
      this.stop();
    }
  }

  /**
   * 恢复计时器
   */
  resume() {
    if (!this.isRunning && this.timeLeft > 0 && this.timeLeft !== Infinity) {
      this.start();
    }
  }

  /**
   * 更新时间（内部调用）
   * @private
   */
  update() {
    if (!this.isRunning || this.timeLeft === Infinity) {
      return;
    }

    const now = Date.now();
    const elapsed = now - this.lastUpdate;
    this.lastUpdate = now;

    this.decreaseTime(elapsed);
  }

  /**
   * 减少时间
   * @param {number} ms - 减少的毫秒数
   */
  decreaseTime(ms) {
    if (this.timeLeft === Infinity) {
      return;
    }

    const previousTime = this.timeLeft;
    this.timeLeft = Math.max(0, this.timeLeft - ms);

    // 检查是否刚好耗尽时间
    if (previousTime > 0 && this.timeLeft === 0) {
      this.stop();
      if (this.onExpired) {
        this.onExpired();
      }
    }
  }

  /**
   * 增加时间增量
   */
  addIncrement() {
    if (this.timeLeft !== Infinity && this.increment > 0) {
      this.timeLeft += this.increment;
    }
  }

  /**
   * 检查时间是否耗尽
   * @returns {boolean}
   */
  isExpired() {
    return this.timeLeft <= 0 && this.timeLeft !== Infinity;
  }

  /**
   * 获取格式化的时间字符串
   * @returns {string} 格式化时间（例如："10:30"）
   */
  getFormattedTime() {
    if (this.timeLeft === Infinity) {
      return '∞';
    }

    const totalSeconds = Math.floor(this.timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 重置计时器
   */
  reset() {
    this.stop();
    this.timeLeft = this.initialTime;
  }

  /**
   * 获取计时器状态
   * @returns {Object}
   */
  getState() {
    return {
      timeLeft: this.timeLeft,
      isRunning: this.isRunning,
      isExpired: this.isExpired(),
      formattedTime: this.getFormattedTime()
    };
  }

  /**
   * 从状态恢复计时器
   * @param {Object} state
   */
  setState(state) {
    this.stop(); // 先停止当前运行

    this.timeLeft = state.timeLeft;

    if (state.isRunning && !this.isExpired()) {
      this.start();
    }
  }

  /**
   * 清理资源（销毁计时器）
   */
  destroy() {
    this.stop();
    this.onExpired = null;
  }
}
