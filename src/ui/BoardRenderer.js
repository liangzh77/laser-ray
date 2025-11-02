/**
 * Board Renderer
 * 棋盘渲染器 - 使用Canvas渲染棋盘和棋子
 */

import { GAME_CONFIG } from '../config/game-config.js';
import { boardToPixel } from '../utils/geometry.js';

export class BoardRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // 设置Canvas尺寸
    this.canvas.width = GAME_CONFIG.BOARD.TOTAL_WIDTH;
    this.canvas.height = GAME_CONFIG.BOARD.TOTAL_HEIGHT;

    this.cellSize = GAME_CONFIG.BOARD.CELL_SIZE;
  }

  /**
   * 渲染整个棋盘
   * @param {Board} board - 棋盘实例
   */
  render(board) {
    this.clearCanvas();
    this.drawGrid();
    this.drawCoordinates();
    this.drawPieces(board);
  }

  /**
   * 清空Canvas
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 绘制棋盘网格
   */
  drawGrid() {
    const { ctx, cellSize } = this;

    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        // 交替颜色
        const isLight = (row + col) % 2 === 0;
        ctx.fillStyle = isLight ?
          GAME_CONFIG.UI.COLORS.BOARD_LIGHT :
          GAME_CONFIG.UI.COLORS.BOARD_DARK;

        ctx.fillRect(
          col * cellSize,
          row * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }

  /**
   * 绘制坐标标签
   */
  drawCoordinates() {
    const { ctx, cellSize } = this;

    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 列标签（a-g）
    GAME_CONFIG.BOARD.COORDINATES.COLUMNS.forEach((letter, col) => {
      ctx.fillText(
        letter,
        col * cellSize + cellSize / 2,
        7 * cellSize + 15
      );
    });

    // 行标签（1-7）
    for (let row = 0; row < 7; row++) {
      const rowNumber = 7 - row;
      ctx.fillText(
        rowNumber.toString(),
        -15,
        row * cellSize + cellSize / 2
      );
    }
  }

  /**
   * 绘制所有棋子
   * @param {Board} board
   */
  drawPieces(board) {
    const pieces = board.getAllPieces();

    pieces.forEach(piece => {
      this.drawPiece(piece);
    });
  }

  /**
   * 绘制单个棋子
   * @param {Piece} piece
   */
  drawPiece(piece) {
    const { col, row } = piece.position;
    const { x, y } = boardToPixel(col, row);

    // 设置颜色
    const color = piece.owner === 'white' ?
      GAME_CONFIG.UI.COLORS.WHITE_PIECE :
      GAME_CONFIG.UI.COLORS.BLACK_PIECE;

    // 根据棋子类型绘制
    switch (piece.type) {
      case 'mirror':
        this.drawMirror(x, y, piece.direction, color);
        break;
      case 'shield':
        this.drawShield(x, y, piece.direction, color);
        break;
      case 'turret':
        this.drawTurret(x, y, piece.direction, color);
        break;
      case 'jumper':
        this.drawJumper(x, y, piece.direction, color);
        break;
      case 'splitter':
        this.drawSplitter(x, y, piece.direction, color);
        break;
    }
  }

  /**
   * 绘制镜子 - 45度斜向镜面(平的)，背面弧线
   */
  drawMirror(x, y, direction, color) {
    const { ctx } = this;
    const size = 30; // 镜面长度
    const arcDepth = 20; // 弧线深度（增加到20让弧线非常明显）

    ctx.save();
    ctx.translate(x, y);
    // 在原有方向基础上向左旋转90°
    ctx.rotate((this.getRotationAngle(direction) - 90) * Math.PI / 180);

    // 1. 先绘制背面大弧线填充（月牙形深色区域）
    // 镜子从左下到右上，弧线在左侧凸出
    const backColor = this.adjustColorBrightness(color, -0.3);  // 背面使用深色
    ctx.fillStyle = backColor.replace(/[\d.]+\)$/, '0.3)');  // 半透明
    ctx.beginPath();
    ctx.moveTo(-size / 2, size / 2);   // 左下
    ctx.lineTo(size / 2, -size / 2);   // 右上
    // 弧线向左侧凸出
    ctx.bezierCurveTo(
      size / 2 - arcDepth, -size / 2 - arcDepth,   // 控制点1：右上方偏左
      -size / 2 - arcDepth, size / 2 + arcDepth,   // 控制点2：左下方偏左
      -size / 2, size / 2                          // 终点：左下
    );
    ctx.closePath();
    ctx.fill();

    // 2. 绘制弧线外边框
    ctx.strokeStyle = this.adjustColorBrightness(color, -0.2);
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(size / 2, -size / 2);   // 右上
    ctx.bezierCurveTo(
      size / 2 - arcDepth, -size / 2 - arcDepth,
      -size / 2 - arcDepth, size / 2 + arcDepth,
      -size / 2, size / 2    // 左下
    );
    ctx.stroke();

    // 3. 绘制镜面（平直）从左下到右上
    ctx.strokeStyle = color;  // 使用传入的颜色
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-size / 2, size / 2);   // 左下
    ctx.lineTo(size / 2, -size / 2);   // 右上
    ctx.stroke();

    // 4. 镜面高光线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-size / 2 + 3, size / 2 - 3);   // 左下偏移
    ctx.lineTo(size / 2 - 3, -size / 2 + 3);   // 右上偏移
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 调整颜色亮度
   * @param {string} color - 颜色值 (支持 rgba 或 hex)
   * @param {number} factor - 亮度调整因子 (-1 到 1)
   * @returns {string} 调整后的颜色
   */
  adjustColorBrightness(color, factor) {
    // 解析rgba颜色
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

    if (match) {
      let [, r, g, b, a = 1] = match;
      r = parseInt(r);
      g = parseInt(g);
      b = parseInt(b);

      // 调整亮度
      if (factor > 0) {
        // 变亮：向255靠近
        r = Math.min(255, Math.round(r + (255 - r) * factor));
        g = Math.min(255, Math.round(g + (255 - g) * factor));
        b = Math.min(255, Math.round(b + (255 - b) * factor));
      } else {
        // 变暗：向0靠近
        r = Math.max(0, Math.round(r * (1 + factor)));
        g = Math.max(0, Math.round(g * (1 + factor)));
        b = Math.max(0, Math.round(b * (1 + factor)));
      }

      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    // 如果无法解析，返回原颜色
    return color;
  }

  /**
   * 绘制盾牌
   */
  drawShield(x, y, direction, color) {
    const { ctx } = this;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.getRotationAngle(direction) * Math.PI / 180);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 20, Math.PI, 0);
    ctx.lineTo(10, 20);
    ctx.lineTo(0, 25);
    ctx.lineTo(-10, 20);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * 绘制炮塔
   */
  drawTurret(x, y, direction, color) {
    const { ctx } = this;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.getRotationAngle(direction) * Math.PI / 180);

    // 基座
    ctx.fillStyle = color;
    ctx.fillRect(-15, -15, 30, 30);

    // 炮口
    ctx.fillRect(-5, -25, 10, 15);

    ctx.restore();
  }

  /**
   * 绘制跳台
   */
  drawJumper(x, y, direction, color) {
    const { ctx } = this;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.getRotationAngle(direction) * Math.PI / 180);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // 绘制箭头
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 20);
    ctx.moveTo(-5, 15);
    ctx.lineTo(0, 20);
    ctx.lineTo(5, 15);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 绘制分光器
   */
  drawSplitter(x, y, direction, color) {
    const { ctx } = this;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.getRotationAngle(direction) * Math.PI / 180);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // 三个方向的箭头
    const drawArrow = (angle) => {
      ctx.save();
      ctx.rotate(angle * Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -20);
      ctx.moveTo(-5, -15);
      ctx.lineTo(0, -20);
      ctx.lineTo(5, -15);
      ctx.stroke();
      ctx.restore();
    };

    drawArrow(0);    // 上
    drawArrow(-90);  // 左
    drawArrow(90);   // 右

    ctx.restore();
  }

  /**
   * 获取旋转角度
   */
  getRotationAngle(direction) {
    const angles = {
      up: 0,
      right: 90,
      down: 180,
      left: 270
    };
    return angles[direction] || 0;
  }

  /**
   * 高亮显示格子
   * @param {Array<Object>} positions - 位置数组
   * @param {string} color - 高亮颜色
   */
  highlightCells(positions, color = 'rgba(255, 255, 0, 0.3)') {
    const { ctx, cellSize } = this;

    ctx.fillStyle = color;

    positions.forEach(pos => {
      ctx.fillRect(
        pos.col * cellSize,
        pos.row * cellSize,
        cellSize,
        cellSize
      );
    });
  }

  /**
   * 绘制激光路径
   * @param {LaserBeam} laserBeam - 激光束集合
   * @param {Object} options - 绘制选项
   */
  drawLaser(laserBeam, options = {}) {
    const {
      color = 'rgba(255, 0, 0, 0.8)',
      width = 3,
      glowIntensity = 0.5
    } = options;

    const { ctx } = this;
    const allLasers = laserBeam.getAllLasers();

    ctx.save();

    // 为每条激光绘制路径
    allLasers.forEach(laser => {
      const path = laser.getPath();
      const jumpPoints = laser.jumpPoints || [];

      if (path.length < 2) return;

      // 将路径分段,在跳跃点处断开
      const segments = this.splitPathAtJumps(path, jumpPoints);

      // 绘制每一段
      segments.forEach(segment => {
        if (segment.length < 2) return;

        // 绘制发光效果
        if (glowIntensity > 0) {
          this.drawLaserGlow(segment, color, width, glowIntensity);
        }

        // 绘制主激光线
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();

        // 转换第一个点为像素坐标
        const start = boardToPixel(segment[0].col, segment[0].row);
        ctx.moveTo(start.x, start.y);

        // 绘制路径
        for (let i = 1; i < segment.length; i++) {
          const point = boardToPixel(segment[i].col, segment[i].row);
          ctx.lineTo(point.x, point.y);
        }

        ctx.stroke();
      });

      // 在激光末端绘制箭头或终点标记
      if (path.length >= 2) {
        const lastPoint = path[path.length - 1];
        const secondLastPoint = path[path.length - 2];
        this.drawLaserEnd(secondLastPoint, lastPoint, color, width);
      }
    });

    ctx.restore();
  }

  /**
   * 将激光路径在跳跃点处分段
   * @private
   * @param {Array} path - 完整路径
   * @param {Array} jumpPoints - 跳跃点索引数组
   * @returns {Array<Array>} 分段后的路径数组
   */
  splitPathAtJumps(path, jumpPoints) {
    if (jumpPoints.length === 0) {
      return [path];
    }

    const segments = [];
    let currentSegment = [];

    for (let i = 0; i < path.length; i++) {
      currentSegment.push(path[i]);

      // 如果当前索引是跳跃点,结束当前段,开始新段
      if (jumpPoints.includes(i)) {
        if (currentSegment.length > 0) {
          segments.push(currentSegment);
        }
        // 从下一个点开始新段(跳过跳跃点的下一个位置)
        currentSegment = [];
        i++; // 跳过下一个点(跳台后的那一格)
      }
    }

    // 添加最后一段
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    return segments;
  }

  /**
   * 绘制激光发光效果
   * @private
   */
  drawLaserGlow(path, color, width, intensity) {
    const { ctx } = this;

    // 绘制多层发光效果
    const glowLayers = 3;

    for (let layer = glowLayers; layer > 0; layer--) {
      const glowWidth = width + layer * 4;
      const alpha = (intensity / glowLayers) * (glowLayers - layer + 1) / glowLayers;

      ctx.strokeStyle = color.replace(/[\d.]+\)$/, `${alpha})`);
      ctx.lineWidth = glowWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();

      const start = boardToPixel(path[0].col, path[0].row);
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < path.length; i++) {
        const point = boardToPixel(path[i].col, path[i].row);
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    }
  }

  /**
   * 绘制激光终点
   * @private
   */
  drawLaserEnd(from, to, color, width) {
    const { ctx } = this;

    const toPoint = boardToPixel(to.col, to.row);

    // 绘制脉冲圆圈
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(toPoint.x, toPoint.y, width + 2, 0, Math.PI * 2);
    ctx.fill();

    // 绘制外围光晕
    const gradient = ctx.createRadialGradient(
      toPoint.x, toPoint.y, 0,
      toPoint.x, toPoint.y, width + 6
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(toPoint.x, toPoint.y, width + 6, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 绘制激光动画帧
   * @param {LaserBeam} laserBeam - 激光束集合
   * @param {number} progress - 动画进度（0-1）
   * @param {Object} options - 绘制选项
   */
  drawLaserAnimated(laserBeam, progress, options = {}) {
    const {
      color = 'rgba(255, 0, 0, 0.8)',
      width = 3,
      speed = 1.5
    } = options;

    const { ctx } = this;
    const allLasers = laserBeam.getAllLasers();

    ctx.save();

    allLasers.forEach(laser => {
      const path = laser.getPath();

      if (path.length < 2) return;

      // 计算当前应该绘制到路径的哪个部分
      const totalLength = path.length - 1;
      const currentLength = totalLength * progress * speed;

      if (currentLength < 1) return;

      // 绘制激光路径（渐进式）
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();

      const start = boardToPixel(path[0].col, path[0].row);
      ctx.moveTo(start.x, start.y);

      const endIndex = Math.min(Math.floor(currentLength) + 1, path.length - 1);

      for (let i = 1; i <= endIndex; i++) {
        const point = boardToPixel(path[i].col, path[i].row);
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();

      // 绘制前进中的激光头部
      if (endIndex < path.length - 1) {
        const headPoint = boardToPixel(path[endIndex].col, path[endIndex].row);

        // 发光效果
        const gradient = ctx.createRadialGradient(
          headPoint.x, headPoint.y, 0,
          headPoint.x, headPoint.y, width + 8
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(headPoint.x, headPoint.y, width + 8, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }
}
