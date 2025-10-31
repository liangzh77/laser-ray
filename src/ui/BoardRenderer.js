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
   * 绘制镜子
   */
  drawMirror(x, y, direction, color) {
    const { ctx } = this;
    const size = 30;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.getRotationAngle(direction) * Math.PI / 180);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-size / 2, -size / 2);
    ctx.lineTo(size / 2, size / 2);
    ctx.stroke();

    ctx.restore();
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
}
