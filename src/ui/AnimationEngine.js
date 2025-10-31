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

  /**
   * 创建棋子移动动画
   * @param {Object} piece - 棋子对象
   * @param {Object} from - 起始位置 { col, row }
   * @param {Object} to - 目标位置 { col, row }
   * @param {Function} onUpdate - 更新回调
   * @param {Function} onComplete - 完成回调
   * @param {number} duration - 动画时长（毫秒）
   */
  animateMove(piece, from, to, onUpdate, onComplete, duration = 300) {
    const { boardToPixel } = require('../utils/geometry.js');
    const startPos = boardToPixel(from.col, from.row);
    const endPos = boardToPixel(to.col, to.row);

    this.addAnimation({
      type: 'move',
      piece,
      duration,
      onUpdate: (progress) => {
        // 计算当前位置（线性插值）
        const currentX = startPos.x + (endPos.x - startPos.x) * progress;
        const currentY = startPos.y + (endPos.y - startPos.y) * progress;

        if (onUpdate) {
          onUpdate({ x: currentX, y: currentY }, progress);
        }
      },
      onComplete
    });
  }

  /**
   * 创建棋子旋转动画
   * @param {Object} piece - 棋子对象
   * @param {string} fromDirection - 起始方向
   * @param {string} toDirection - 目标方向
   * @param {Function} onUpdate - 更新回调
   * @param {Function} onComplete - 完成回调
   * @param {number} duration - 动画时长（毫秒）
   */
  animateRotation(piece, fromDirection, toDirection, onUpdate, onComplete, duration = 200) {
    // 方向到角度的映射
    const directionAngles = {
      up: 0,
      right: 90,
      down: 180,
      left: 270
    };

    let startAngle = directionAngles[fromDirection] || 0;
    let endAngle = directionAngles[toDirection] || 0;

    // 选择最短旋转路径
    let angleDiff = endAngle - startAngle;
    if (angleDiff > 180) {
      angleDiff -= 360;
    } else if (angleDiff < -180) {
      angleDiff += 360;
    }

    endAngle = startAngle + angleDiff;

    this.addAnimation({
      type: 'rotation',
      piece,
      duration,
      onUpdate: (progress) => {
        // 计算当前角度（线性插值）
        const currentAngle = startAngle + (endAngle - startAngle) * progress;

        if (onUpdate) {
          onUpdate(currentAngle, progress);
        }
      },
      onComplete
    });
  }

  /**
   * 创建激光动画
   * @param {Array} laserPath - 激光路径点数组
   * @param {Function} onUpdate - 更新回调
   * @param {Function} onComplete - 完成回调
   * @param {number} duration - 动画时长（毫秒）
   */
  animateLaser(laserPath, onUpdate, onComplete, duration = 500) {
    this.addAnimation({
      type: 'laser',
      laserPath,
      duration,
      onUpdate: (progress) => {
        // 计算当前显示到激光路径的哪个部分
        const currentIndex = Math.floor(progress * laserPath.length);
        const currentPath = laserPath.slice(0, currentIndex + 1);

        if (onUpdate) {
          onUpdate(currentPath, progress);
        }
      },
      onComplete
    });
  }

  /**
   * 创建棋子摧毁动画
   * @param {Object} piece - 棋子对象
   * @param {Function} onUpdate - 更新回调
   * @param {Function} onComplete - 完成回调
   * @param {number} duration - 动画时长（毫秒）
   */
  animateDestroy(piece, onUpdate, onComplete, duration = 400) {
    this.addAnimation({
      type: 'destroy',
      piece,
      duration,
      onUpdate: (progress) => {
        // 计算淡出和缩放效果
        const opacity = 1 - progress;
        const scale = 1 - progress * 0.5; // 缩小到50%

        if (onUpdate) {
          onUpdate({ opacity, scale }, progress);
        }
      },
      onComplete
    });
  }
}
