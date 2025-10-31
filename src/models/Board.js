/**
 * Board Model
 * 棋盘模型
 */

import { GAME_CONFIG } from '../config/game-config.js';
import { isWithinBoard, isSamePosition } from '../utils/geometry.js';

export class Board {
  constructor() {
    this.size = { ...GAME_CONFIG.BOARD.SIZE };

    // 使用Map存储棋子，key为"col,row"字符串
    this.pieces = new Map();
  }

  /**
   * 将位置转换为key
   * @private
   */
  positionToKey(position) {
    return `${position.col},${position.row}`;
  }

  /**
   * 将key转换为位置
   * @private
   */
  keyToPosition(key) {
    const [col, row] = key.split(',').map(Number);
    return { col, row };
  }

  /**
   * 在指定位置放置棋子
   * @param {Object} piece - 棋子实例
   * @param {Object} position - { col, row }
   */
  placePiece(piece, position) {
    if (!isWithinBoard(position)) {
      throw new Error(`Invalid position: ${JSON.stringify(position)}`);
    }

    const key = this.positionToKey(position);
    this.pieces.set(key, piece);
    piece.position = { ...position };
  }

  /**
   * 从指定位置移除棋子
   * @param {Object} position - { col, row }
   * @returns {Object|null} 移除的棋子
   */
  removePiece(position) {
    const key = this.positionToKey(position);
    const piece = this.pieces.get(key);

    if (piece) {
      this.pieces.delete(key);
    }

    return piece || null;
  }

  /**
   * 获取指定位置的棋子
   * @param {Object} position - { col, row }
   * @returns {Object|null}
   */
  getPieceAt(position) {
    const key = this.positionToKey(position);
    return this.pieces.get(key) || null;
  }

  /**
   * 检查指定位置是否有棋子
   * @param {Object} position - { col, row }
   * @returns {boolean}
   */
  hasPieceAt(position) {
    return this.getPieceAt(position) !== null;
  }

  /**
   * 移动棋子
   * @param {Object} from - 起始位置
   * @param {Object} to - 目标位置
   * @returns {boolean} 是否成功移动
   */
  movePiece(from, to) {
    const piece = this.removePiece(from);

    if (!piece) {
      return false;
    }

    this.placePiece(piece, to);
    return true;
  }

  /**
   * 获取指定玩家的所有棋子
   * @param {string} playerId - 玩家ID
   * @returns {Array<Object>}
   */
  getPiecesByOwner(playerId) {
    const pieces = [];

    for (const piece of this.pieces.values()) {
      if (piece.owner === playerId && !piece.isDestroyed) {
        pieces.push(piece);
      }
    }

    return pieces;
  }

  /**
   * 获取指定类型的所有棋子
   * @param {string} pieceType - 棋子类型
   * @param {string} playerId - 可选，指定玩家ID
   * @returns {Array<Object>}
   */
  getPiecesByType(pieceType, playerId = null) {
    const pieces = [];

    for (const piece of this.pieces.values()) {
      if (piece.type === pieceType && !piece.isDestroyed) {
        if (playerId === null || piece.owner === playerId) {
          pieces.push(piece);
        }
      }
    }

    return pieces;
  }

  /**
   * 获取指定玩家的炮塔
   * @param {string} playerId - 玩家ID
   * @returns {Object|null}
   */
  getTurret(playerId) {
    const turrets = this.getPiecesByType(GAME_CONFIG.PIECE_TYPES.TURRET, playerId);
    return turrets.length > 0 ? turrets[0] : null;
  }

  /**
   * 获取所有棋子
   * @returns {Array<Object>}
   */
  getAllPieces() {
    return Array.from(this.pieces.values()).filter(p => !p.isDestroyed);
  }

  /**
   * 清空棋盘
   */
  clear() {
    this.pieces.clear();
  }

  /**
   * 克隆棋盘
   * @returns {Board}
   */
  clone() {
    const cloned = new Board();

    for (const [key, piece] of this.pieces.entries()) {
      const position = this.keyToPosition(key);
      cloned.placePiece(piece.clone(), position);
    }

    return cloned;
  }

  /**
   * 获取JSON表示
   * @returns {Object}
   */
  toJSON() {
    const piecesArray = [];

    for (const [key, piece] of this.pieces.entries()) {
      piecesArray.push({
        position: this.keyToPosition(key),
        ...piece.toJSON()
      });
    }

    return {
      size: { ...this.size },
      pieces: piecesArray
    };
  }
}
