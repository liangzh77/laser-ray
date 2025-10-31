/**
 * Geometry Utilities
 * 几何计算工具函数，用于激光物理和棋盘操作
 */

import { GAME_CONFIG } from '../config/game-config.js';

/**
 * 计算两点之间的曼哈顿距离
 * @param {Object} pos1 - { col, row }
 * @param {Object} pos2 - { col, row }
 * @returns {number} 曼哈顿距离
 */
export function manhattanDistance(pos1, pos2) {
  return Math.abs(pos1.col - pos2.col) + Math.abs(pos1.row - pos2.row);
}

/**
 * 计算两点之间的欧几里得距离
 * @param {Object} pos1 - { col, row }
 * @param {Object} pos2 - { col, row }
 * @returns {number} 欧几里得距离
 */
export function euclideanDistance(pos1, pos2) {
  const dx = pos2.col - pos1.col;
  const dy = pos2.row - pos1.row;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 检查两个位置是否相同
 * @param {Object} pos1 - { col, row }
 * @param {Object} pos2 - { col, row }
 * @returns {boolean}
 */
export function isSamePosition(pos1, pos2) {
  return pos1.col === pos2.col && pos1.row === pos2.row;
}

/**
 * 获取给定方向的反方向
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @returns {string} 反方向
 */
export function getOppositeDirection(direction) {
  const opposites = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  };
  return opposites[direction];
}

/**
 * 旋转方向（顺时针90度）
 * @param {string} direction - 当前方向
 * @returns {string} 旋转后的方向
 */
export function rotateDirectionClockwise(direction) {
  const rotation = {
    up: 'right',
    right: 'down',
    down: 'left',
    left: 'up'
  };
  return rotation[direction];
}

/**
 * 旋转方向（逆时针90度）
 * @param {string} direction - 当前方向
 * @returns {string} 旋转后的方向
 */
export function rotateDirectionCounterClockwise(direction) {
  const rotation = {
    up: 'left',
    left: 'down',
    down: 'right',
    right: 'up'
  };
  return rotation[direction];
}

/**
 * 根据方向获取下一个位置
 * @param {Object} position - { col, row }
 * @param {string} direction - 移动方向
 * @param {number} steps - 移动步数（默认1）
 * @returns {Object} 新位置 { col, row }
 */
export function getNextPosition(position, direction, steps = 1) {
  const vector = GAME_CONFIG.DIRECTION_VECTORS[direction];
  return {
    col: position.col + vector.dx * steps,
    row: position.row + vector.dy * steps
  };
}

/**
 * 获取从起点到终点的所有中间位置（直线路径）
 * @param {Object} start - { col, row }
 * @param {Object} end - { col, row }
 * @returns {Array<Object>} 路径上的所有位置（不包括起点）
 */
export function getLinearPath(start, end) {
  const path = [];
  const dx = Math.sign(end.col - start.col);
  const dy = Math.sign(end.row - start.row);

  let current = { col: start.col + dx, row: start.row + dy };

  while (!isSamePosition(current, end)) {
    path.push({ ...current });
    current.col += dx;
    current.row += dy;
  }

  path.push({ ...end });
  return path;
}

/**
 * 检查位置是否在棋盘范围内
 * @param {Object} position - { col, row }
 * @returns {boolean}
 */
export function isWithinBoard(position) {
  return position.col >= 0 && position.col < GAME_CONFIG.BOARD.SIZE.WIDTH &&
         position.row >= 0 && position.row < GAME_CONFIG.BOARD.SIZE.HEIGHT;
}

/**
 * 检查两个位置是否在同一行
 * @param {Object} pos1 - { col, row }
 * @param {Object} pos2 - { col, row }
 * @returns {boolean}
 */
export function isInSameRow(pos1, pos2) {
  return pos1.row === pos2.row;
}

/**
 * 检查两个位置是否在同一列
 * @param {Object} pos1 - { col, row }
 * @param {Object} pos2 - { col, row }
 * @returns {boolean}
 */
export function isInSameColumn(pos1, pos2) {
  return pos1.col === pos2.col;
}

/**
 * 检查两个位置是否在同一对角线
 * @param {Object} pos1 - { col, row }
 * @param {Object} pos2 - { col, row }
 * @returns {boolean}
 */
export function isInSameDiagonal(pos1, pos2) {
  const colDiff = Math.abs(pos2.col - pos1.col);
  const rowDiff = Math.abs(pos2.row - pos1.row);
  return colDiff === rowDiff;
}

/**
 * 计算激光反射后的新方向（90度反射）
 * @param {string} incomingDirection - 入射方向
 * @param {string} mirrorOrientation - 镜子朝向
 * @returns {string|null} 反射方向，如果无效反射则返回null
 */
export function calculateReflection(incomingDirection, mirrorOrientation) {
  // 镜子反射规则：
  // 镜面45°倾斜，从左上到右下
  // 根据镜子朝向和入射方向决定反射方向

  const reflectionTable = {
    // 镜子朝上：正面向上，右面向右
    up: {
      up: 'right',    // 从上入射 -> 向右反射
      right: 'up',    // 从右入射 -> 向上反射
      down: null,     // 从下入射 -> 摧毁（背面）
      left: null      // 从左入射 -> 摧毁（侧面）
    },
    // 镜子朝右：正面向右，下面向下
    right: {
      right: 'down',  // 从右入射 -> 向下反射
      down: 'right',  // 从下入射 -> 向右反射
      left: null,     // 从左入射 -> 摧毁（背面）
      up: null        // 从上入射 -> 摧毁（侧面）
    },
    // 镜子朝下：正面向下，左面向左
    down: {
      down: 'left',   // 从下入射 -> 向左反射
      left: 'down',   // 从左入射 -> 向下反射
      up: null,       // 从上入射 -> 摧毁（背面）
      right: null     // 从右入射 -> 摧毁（侧面）
    },
    // 镜子朝左：正面向左，上面向上
    left: {
      left: 'up',     // 从左入射 -> 向上反射
      up: 'left',     // 从上入射 -> 向左反射
      right: null,    // 从右入射 -> 摧毁（背面）
      down: null      // 从下入射 -> 摧毁（侧面）
    }
  };

  return reflectionTable[mirrorOrientation]?.[incomingDirection] || null;
}

/**
 * 计算激光是否被盾牌阻挡
 * @param {string} incomingDirection - 入射方向
 * @param {string} shieldOrientation - 盾牌朝向
 * @returns {Object} { blocked: boolean, destroyed: boolean }
 */
export function calculateShieldInteraction(incomingDirection, shieldOrientation) {
  const oppositeDir = getOppositeDirection(shieldOrientation);

  // 从正面或背面入射 -> 阻挡
  if (incomingDirection === shieldOrientation || incomingDirection === oppositeDir) {
    return { blocked: true, destroyed: false };
  }

  // 从侧面入射 -> 盾牌摧毁
  return { blocked: false, destroyed: true };
}

/**
 * 计算激光跳跃后的位置和方向
 * @param {Object} jumperPosition - 跳台位置 { col, row }
 * @param {string} incomingDirection - 入射方向
 * @param {string} jumperOrientation - 跳台朝向
 * @returns {Object|null} { position, direction, destroyed } 或 null（无效）
 */
export function calculateJump(jumperPosition, incomingDirection, jumperOrientation) {
  const oppositeDir = getOppositeDirection(jumperOrientation);

  // 从正面或背面入射 -> 跳跃
  if (incomingDirection === jumperOrientation || incomingDirection === oppositeDir) {
    // 跳过跳台和后方一格
    const newPosition = getNextPosition(jumperPosition, incomingDirection, 2);
    return {
      position: newPosition,
      direction: incomingDirection, // 方向不变
      destroyed: false
    };
  }

  // 从侧面入射 -> 跳台摧毁
  return { destroyed: true };
}

/**
 * 计算分光器产生的新激光方向
 * @param {string} incomingDirection - 入射方向
 * @param {string} splitterOrientation - 分光器朝向
 * @returns {Array<string>|null} 新激光方向数组，如果摧毁则返回null
 */
export function calculateSplit(incomingDirection, splitterOrientation) {
  // 分光器规则：
  // - 从正面入射：分裂为左右两束
  // - 从侧面入射：分裂为正面和另一侧面
  // - 从背面入射：分光器摧毁

  const oppositeDir = getOppositeDirection(splitterOrientation);

  // 从背面入射 -> 摧毁
  if (incomingDirection === oppositeDir) {
    return null;
  }

  // 从正面入射 -> 分裂为左右
  if (incomingDirection === splitterOrientation) {
    const left = rotateDirectionCounterClockwise(splitterOrientation);
    const right = rotateDirectionClockwise(splitterOrientation);
    return [left, right];
  }

  // 从左侧入射 -> 分裂为正面和右侧
  const leftSide = rotateDirectionCounterClockwise(splitterOrientation);
  if (incomingDirection === leftSide) {
    const right = rotateDirectionClockwise(splitterOrientation);
    return [splitterOrientation, right];
  }

  // 从右侧入射 -> 分裂为正面和左侧
  const rightSide = rotateDirectionClockwise(splitterOrientation);
  if (incomingDirection === rightSide) {
    return [splitterOrientation, leftSide];
  }

  return null;
}

/**
 * 将像素坐标转换为棋盘坐标
 * @param {number} x - 像素X坐标
 * @param {number} y - 像素Y坐标
 * @returns {Object} { col, row }
 */
export function pixelToBoard(x, y) {
  const col = Math.floor(x / GAME_CONFIG.BOARD.CELL_SIZE);
  const row = Math.floor(y / GAME_CONFIG.BOARD.CELL_SIZE);
  return { col, row };
}

/**
 * 将棋盘坐标转换为像素坐标（中心点）
 * @param {number} col - 列索引
 * @param {number} row - 行索引
 * @returns {Object} { x, y }
 */
export function boardToPixel(col, row) {
  const x = col * GAME_CONFIG.BOARD.CELL_SIZE + GAME_CONFIG.BOARD.CELL_SIZE / 2;
  const y = row * GAME_CONFIG.BOARD.CELL_SIZE + GAME_CONFIG.BOARD.CELL_SIZE / 2;
  return { x, y };
}
