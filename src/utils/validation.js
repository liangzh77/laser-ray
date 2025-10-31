/**
 * Validation Utilities
 * 验证工具函数，用于游戏规则验证和输入校验
 */

import { GAME_CONFIG } from '../config/game-config.js';
import {
  isWithinBoard,
  isInSameRow,
  isInSameColumn,
  getLinearPath,
  isSamePosition
} from './geometry.js';

/**
 * 验证城堡移动（国际象棋Rook移动规则）
 * @param {Object} from - 起始位置 { col, row }
 * @param {Object} to - 目标位置 { col, row }
 * @param {Function} isPieceAt - 函数：检查指定位置是否有棋子
 * @returns {Object} { valid: boolean, reason: string }
 */
export function validateCastleMove(from, to, isPieceAt) {
  // 检查目标位置是否在棋盘内
  if (!isWithinBoard(to)) {
    return { valid: false, reason: '目标位置超出棋盘范围' };
  }

  // 检查是否在同一行或同一列
  if (!isInSameRow(from, to) && !isInSameColumn(from, to)) {
    return { valid: false, reason: '城堡移动必须是直线（同行或同列）' };
  }

  // 检查是否移动到了相同位置
  if (isSamePosition(from, to)) {
    return { valid: false, reason: '不能移动到相同位置' };
  }

  // 检查路径上是否有阻挡
  const path = getLinearPath(from, to);
  for (let i = 0; i < path.length - 1; i++) {
    if (isPieceAt(path[i])) {
      return { valid: false, reason: '移动路径被阻挡' };
    }
  }

  // 检查目标位置是否有己方棋子
  if (isPieceAt(to)) {
    return { valid: false, reason: '目标位置已有棋子' };
  }

  return { valid: true };
}

/**
 * 验证棋子旋转操作
 * @param {string} pieceType - 棋子类型
 * @param {string} currentDirection - 当前方向
 * @param {string} newDirection - 新方向
 * @returns {Object} { valid: boolean, reason: string }
 */
export function validateRotation(pieceType, currentDirection, newDirection) {
  // 检查方向是否有效
  const validDirections = Object.values(GAME_CONFIG.DIRECTIONS);
  if (!validDirections.includes(currentDirection) || !validDirections.includes(newDirection)) {
    return { valid: false, reason: '无效的方向参数' };
  }

  // 检查是否旋转到相同方向
  if (currentDirection === newDirection) {
    return { valid: false, reason: '已经是该方向' };
  }

  // 所有棋子都可以旋转到4个方向
  return { valid: true };
}

/**
 * 验证激光发射操作
 * @param {Object} turretPosition - 炮塔位置 { col, row }
 * @param {string} turretDirection - 炮塔朝向
 * @param {string} currentPlayerId - 当前玩家ID
 * @param {Object} turretOwner - 炮塔所有者 { id }
 * @returns {Object} { valid: boolean, reason: string }
 */
export function validateLaserFire(turretPosition, turretDirection, currentPlayerId, turretOwner) {
  // 检查炮塔位置是否在棋盘内
  if (!isWithinBoard(turretPosition)) {
    return { valid: false, reason: '炮塔位置无效' };
  }

  // 检查方向是否有效
  const validDirections = Object.values(GAME_CONFIG.DIRECTIONS);
  if (!validDirections.includes(turretDirection)) {
    return { valid: false, reason: '无效的炮塔方向' };
  }

  // 检查是否是炮塔所有者
  if (turretOwner.id !== currentPlayerId) {
    return { valid: false, reason: '只能操作己方炮塔' };
  }

  return { valid: true };
}

/**
 * 验证时间模式
 * @param {string} timeMode - 时间模式ID
 * @returns {boolean}
 */
export function isValidTimeMode(timeMode) {
  return Object.values(GAME_CONFIG.TIME_MODES).some(mode => mode.id === timeMode);
}

/**
 * 验证玩家颜色
 * @param {string} color - 玩家颜色
 * @returns {boolean}
 */
export function isValidPlayerColor(color) {
  return color === GAME_CONFIG.PLAYERS.WHITE.id ||
         color === GAME_CONFIG.PLAYERS.BLACK.id;
}

/**
 * 验证棋子类型
 * @param {string} pieceType - 棋子类型
 * @returns {boolean}
 */
export function isValidPieceType(pieceType) {
  return Object.values(GAME_CONFIG.PIECE_TYPES).includes(pieceType);
}

/**
 * 验证游戏状态转换
 * @param {string} currentState - 当前状态
 * @param {string} nextState - 下一个状态
 * @returns {Object} { valid: boolean, reason: string }
 */
export function validateStateTransition(currentState, nextState) {
  // 定义有效的状态转换
  const validTransitions = {
    waiting: ['playing'],
    playing: ['laserFiring', 'gameOver'],
    laserFiring: ['playing', 'gameOver'],
    gameOver: ['waiting'] // 重新开始
  };

  if (!validTransitions[currentState]?.includes(nextState)) {
    return {
      valid: false,
      reason: `无效的状态转换：${currentState} -> ${nextState}`
    };
  }

  return { valid: true };
}

/**
 * 验证回合操作
 * @param {string} operationType - 操作类型
 * @param {string} currentPlayerId - 当前玩家ID
 * @param {string} pieceOwnerId - 棋子所有者ID
 * @param {string} gameState - 游戏状态
 * @returns {Object} { valid: boolean, reason: string }
 */
export function validateTurnOperation(operationType, currentPlayerId, pieceOwnerId, gameState) {
  // 检查游戏状态是否允许操作
  if (gameState !== GAME_CONFIG.GAME_STATES.PLAYING) {
    return { valid: false, reason: '游戏未在进行中' };
  }

  // 检查操作类型是否有效
  if (!Object.values(GAME_CONFIG.OPERATION_TYPES).includes(operationType)) {
    return { valid: false, reason: '无效的操作类型' };
  }

  // 检查是否操作己方棋子
  if (pieceOwnerId !== currentPlayerId) {
    return { valid: false, reason: '只能操作己方棋子' };
  }

  return { valid: true };
}

/**
 * 验证初始棋子布局
 * @param {Object} setup - 初始布局配置
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export function validateInitialSetup(setup) {
  const errors = [];

  // 检查是否有白方和黑方
  if (!setup.white || !setup.black) {
    errors.push('缺少白方或黑方配置');
    return { valid: false, errors };
  }

  // 验证每方的棋子
  const validateSide = (side, sideColor) => {
    const pieces = [...(side.row1 || []), ...(side.row2 || []), ...(side.row6 || []), ...(side.row7 || [])];

    // 检查炮塔数量（每方必须有且仅有一个）
    const turretCount = pieces.filter(p => p.type === 'turret').length;
    if (turretCount !== 1) {
      errors.push(`${sideColor}方炮塔数量错误：${turretCount}（应为1）`);
    }

    // 检查棋子类型是否有效
    pieces.forEach(piece => {
      if (!isValidPieceType(piece.type)) {
        errors.push(`无效的棋子类型：${piece.type}`);
      }

      // 检查方向是否有效
      const validDirections = Object.values(GAME_CONFIG.DIRECTIONS);
      if (!validDirections.includes(piece.direction)) {
        errors.push(`无效的棋子方向：${piece.direction} (位置：${piece.pos})`);
      }
    });

    // 检查位置是否重复
    const positions = pieces.map(p => p.pos);
    const uniquePositions = new Set(positions);
    if (positions.length !== uniquePositions.size) {
      errors.push(`${sideColor}方存在重复的棋子位置`);
    }
  };

  validateSide(setup.white, '白');
  validateSide(setup.black, '黑');

  return { valid: errors.length === 0, errors };
}

/**
 * 获取所有可能的城堡移动位置
 * @param {Object} from - 起始位置 { col, row }
 * @param {Function} isPieceAt - 函数：检查指定位置是否有棋子
 * @returns {Array<Object>} 可移动位置数组
 */
export function getValidCastleMoves(from, isPieceAt) {
  const validMoves = [];

  // 检查四个方向
  const directions = ['up', 'down', 'left', 'right'];

  directions.forEach(direction => {
    const vector = GAME_CONFIG.DIRECTION_VECTORS[direction];
    let steps = 1;

    // 沿着方向继续移动直到遇到棋子或边界
    while (true) {
      const to = {
        col: from.col + vector.dx * steps,
        row: from.row + vector.dy * steps
      };

      // 检查是否超出棋盘
      if (!isWithinBoard(to)) {
        break;
      }

      // 检查是否有棋子
      if (isPieceAt(to)) {
        break;
      }

      validMoves.push(to);
      steps++;
    }
  });

  return validMoves;
}

/**
 * 检查游戏是否结束
 * @param {boolean} whiteTurretDestroyed - 白方炮塔是否被摧毁
 * @param {boolean} blackTurretDestroyed - 黑方炮塔是否被摧毁
 * @param {number} whiteTimeLeft - 白方剩余时间（毫秒）
 * @param {number} blackTimeLeft - 黑方剩余时间（毫秒）
 * @returns {Object|null} { winner: string, reason: string } 或 null（游戏未结束）
 */
export function checkGameOver(whiteTurretDestroyed, blackTurretDestroyed, whiteTimeLeft, blackTimeLeft) {
  // 白方炮塔被摧毁
  if (whiteTurretDestroyed) {
    return { winner: 'black', reason: '白方炮塔被摧毁' };
  }

  // 黑方炮塔被摧毁
  if (blackTurretDestroyed) {
    return { winner: 'white', reason: '黑方炮塔被摧毁' };
  }

  // 白方时间耗尽
  if (whiteTimeLeft <= 0) {
    return { winner: 'black', reason: '白方时间耗尽' };
  }

  // 黑方时间耗尽
  if (blackTimeLeft <= 0) {
    return { winner: 'white', reason: '黑方时间耗尽' };
  }

  return null; // 游戏未结束
}
