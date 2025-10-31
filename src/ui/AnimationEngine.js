/**
 * Animation Engine
 * 动画引擎 - 处理游戏动画
 */

export class AnimationEngine {
  constructor() {
    this.animations = [];
    this.isRunning = false;
    this.lastTimestamp = 0;
  }

  /**
   * 添加动画
   * @param {Object} animation - 动画配置
   */
  addAnimation(animation) {
    this.animations.push({
      ...animation,
      startTime: Date.now(),
      progress: 0
    });

    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * 启动动画循环
   */
  start() {
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.tick(this.lastTimestamp);
  }

  /**
   * 动画帧
   * @private
   */
  tick(timestamp) {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // 更新所有动画
    this.animations = this.animations.filter(anim => {
      const elapsed = Date.now() - anim.startTime;
      anim.progress = Math.min(elapsed / anim.duration, 1);

      // 调用更新回调
      if (anim.onUpdate) {
        anim.onUpdate(anim.progress);
      }

      // 动画完成
      if (anim.progress >= 1) {
        if (anim.onComplete) {
          anim.onComplete();
        }
        return false; // 移除动画
      }

      return true; // 保留动画
    });

    // 如果还有动画，继续循环
    if (this.animations.length > 0) {
      requestAnimationFrame(this.tick.bind(this));
    } else {
      this.isRunning = false;
    }
  }

  /**
   * 停止所有动画
   */
  stop() {
    this.isRunning = false;
    this.animations = [];
  }

  /**
   * 清空动画队列
   */
  clear() {
    this.animations = [];
  }
}
