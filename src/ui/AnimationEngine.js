/**
 * Animation Engine
 * 动画引擎 - 处理游戏动画
 */

export class AnimationEngine {
  constructor() {
    this.animations = [];
    this.isRunning = false;
    this.lastTimestamp = 0;
    this.animationFrameId = null;

    // 缓动函数 (T095-T097)
    this.easings = {
      linear: (t) => t,
      easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeOut: (t) => t * (2 - t),
      easeIn: (t) => t * t,
      easeOutCubic: (t) => (--t) * t * t + 1,
      easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    };
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
      let progress = Math.min(elapsed / anim.duration, 1);

      // 应用缓动函数 (T095)
      if (anim.easing && this.easings[anim.easing]) {
        progress = this.easings[anim.easing](progress);
      }

      anim.progress = progress;

      // 调用更新回调
      if (anim.onUpdate) {
        anim.onUpdate(progress);
      }

      // 动画完成
      if (elapsed >= anim.duration) {
        if (anim.onComplete) {
          anim.onComplete();
        }
        return false; // 移除动画
      }

      return true; // 保留动画
    });

    // 如果还有动画，继续循环
    if (this.animations.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
    } else {
      this.isRunning = false;
      this.animationFrameId = null;
    }
  }

  /**
   * 停止所有动画
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.animations = [];
  }

  /**
   * 取消所有动画（别名）
   */
  cancelAll() {
    this.stop();
  }

  /**
   * 清空动画队列
   */
  clear() {
    this.animations = [];
  }

  /**
   * 创建棋子移动动画 (T095)
   * @param {Object|Object} from - 棋子对象或起始位置 { x, y } / { col, row }
   * @param {Object} to - 目标位置 { x, y } / { col, row }
   * @param {number} duration - 动画时长（毫秒）
   * @param {Function} onUpdate - 更新回调
   * @param {Function} onComplete - 完成回调
   * @param {string} easing - 缓动函数名称
   */
  animateMove(from, to, duration = 300, onUpdate, onComplete, easing = 'easeOut') {
    let startPos = from;
    let endPos = to;

    // 如果是棋盘坐标，转换为像素坐标
    if (from.col !== undefined && from.row !== undefined) {
      const { boardToPixel } = require('../utils/geometry.js');
      startPos = boardToPixel(from.col, from.row);
      endPos = boardToPixel(to.col, to.row);
    }

    const animation = {
      type: 'move',
      from: startPos,
      to: endPos,
      duration,
      easing,
      onUpdate: (progress) => {
        // 计算当前位置（使用缓动插值）
        const currentX = startPos.x + (endPos.x - startPos.x) * progress;
        const currentY = startPos.y + (endPos.y - startPos.y) * progress;

        if (onUpdate) {
          onUpdate({ x: currentX, y: currentY }, progress);
        }
      },
      onComplete
    };

    this.addAnimation(animation);
    return animation;
  }

  /**
   * 创建棋子旋转动画 (T095)
   * @param {number|string} fromAngle - 起始角度或方向
   * @param {number|string} toAngle - 目标角度或方向
   * @param {number} duration - 动画时长（毫秒）
   * @param {Function} onUpdate - 更新回调
   * @param {Function} onComplete - 完成回调
   * @param {string} easing - 缓动函数名称
   */
  animateRotate(fromAngle, toAngle, duration = 200, onUpdate, onComplete, easing = 'easeOut') {
    // 方向到角度的映射
    const directionAngles = {
      up: 0,
      right: 90,
      down: 180,
      left: 270
    };

    let startAngle = typeof fromAngle === 'string' ? (directionAngles[fromAngle] || 0) : fromAngle;
    let endAngle = typeof toAngle === 'string' ? (directionAngles[toAngle] || 0) : toAngle;

    // 选择最短旋转路径
    let angleDiff = endAngle - startAngle;
    if (angleDiff > 180) {
      angleDiff -= 360;
    } else if (angleDiff < -180) {
      angleDiff += 360;
    }

    endAngle = startAngle + angleDiff;

    const animation = {
      type: 'rotate',
      fromAngle: startAngle,
      toAngle: endAngle,
      duration,
      easing,
      onUpdate: (progress) => {
        // 计算当前角度（使用缓动插值）
        const currentAngle = startAngle + (endAngle - startAngle) * progress;

        if (onUpdate) {
          onUpdate(currentAngle, progress);
        }
      },
      onComplete
    };

    this.addAnimation(animation);
    return animation;
  }

  /**
   * 旋转动画的别名（兼容旧API）
   */
  animateRotation(piece, fromDirection, toDirection, onUpdate, onComplete, duration = 200) {
    return this.animateRotate(fromDirection, toDirection, duration, onUpdate, onComplete);
  }

  /**
   * 创建激光动画 (T096)
   * @param {Array} path - 激光路径点数组 或 LaserBeam对象
   * @param {number} duration - 动画时长（毫秒）
   * @param {Function} onUpdate - 更新回调
   * @param {Function} onComplete - 完成回调
   * @param {string} easing - 缓动函数名称
   */
  animateLaser(path, duration = 500, onUpdate, onComplete, easing = 'linear') {
    const laserPath = Array.isArray(path) ? path : (path.getPath ? path.getPath() : []);

    const animation = {
      type: 'laser',
      path: laserPath,
      duration,
      easing,
      onUpdate: (progress) => {
        if (onUpdate) {
          onUpdate(progress);
        }
      },
      onComplete
    };

    this.addAnimation(animation);
    return animation;
  }

  /**
   * 创建棋子摧毁动画 (T097)
   * @param {Object} position - 位置 { x, y } 或棋子对象
   * @param {number} duration - 动画时长（毫秒）
   * @param {Function} onUpdate - 更新回调
   * @param {Function} onComplete - 完成回调
   * @param {string} easing - 缓动函数名称
   */
  animateDestroy(position, duration = 400, onUpdate, onComplete, easing = 'easeOut') {
    const animation = {
      type: 'destroy',
      position,
      duration,
      easing,
      onUpdate: (progress) => {
        // 计算淡出和缩放效果
        const opacity = 1 - progress;
        const scale = 1 - progress * 0.5; // 缩小到50%
        const rotation = progress * 180; // 旋转180度

        if (onUpdate) {
          onUpdate({
            opacity,
            scale,
            rotation,
            progress
          });
        }
      },
      onComplete
    };

    this.addAnimation(animation);
    return animation;
  }
}
