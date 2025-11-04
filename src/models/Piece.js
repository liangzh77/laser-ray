/**
 * Piece Model
 * 棋子基础类 - 所有棋子类型的父类
 */

import { GAME_CONFIG } from '../config/game-config.js';
import {
  rotateDirectionClockwise,
  rotateDirectionCounterClockwise,
  calculateReflection,
  calculateShieldInteraction,
  calculateJump,
  calculateSplit
} from '../utils/geometry.js';

export class Piece {
  /**
   * @param {Object} config
   * @param {string} config.type - 棋子类型
   * @param {string} config.owner - 所有者ID（'white' 或 'black'）
   * @param {Object} config.position - 位置 { col, row }
   * @param {string} config.direction - 朝向
   */
  constructor({ type, owner, position, direction }) {
    this.type = type;
    this.owner = owner;
    this.position = { ...position };
    this.direction = direction;
    this.isDestroyed = false;
    this.id = this.generateId();
  }

  /**
   * 生成唯一ID
   * @private
   */
  generateId() {
    return `${this.owner}_${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 移动棋子到新位置
   * @param {Object} newPosition - { col, row }
   */
  moveTo(newPosition) {
    this.position = { ...newPosition };
  }

  /**
   * 旋转棋子（顺时针90度）
   */
  rotateClockwise() {
    this.direction = rotateDirectionClockwise(this.direction);
  }

  /**
   * 旋转棋子（逆时针90度）
   */
  rotateCounterClockwise() {
    this.direction = rotateDirectionCounterClockwise(this.direction);
  }

  /**
   * 设置朝向
   * @param {string} newDirection
   */
  setDirection(newDirection) {
    const validDirections = Object.values(GAME_CONFIG.DIRECTIONS);
    if (validDirections.includes(newDirection)) {
      this.direction = newDirection;
    }
  }

  /**
   * 标记棋子为已摧毁
   */
  destroy() {
    this.isDestroyed = true;
  }

  /**
   * 检查棋子是否在指定位置
   * @param {Object} position - { col, row }
   * @returns {boolean}
   */
  isAt(position) {
    return this.position.col === position.col && this.position.row === position.row;
  }

  /**
   * 获取棋子的JSON表示
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      owner: this.owner,
      position: { ...this.position },
      direction: this.direction,
      isDestroyed: this.isDestroyed
    };
  }

  /**
   * 克隆棋子
   * @returns {Piece}
   */
  clone() {
    const ClonedClass = this.constructor;
    return new ClonedClass({
      type: this.type,
      owner: this.owner,
      position: { ...this.position },
      direction: this.direction
    });
  }

  /**
   * 处理激光交互（子类需要重写）
   * @param {string} laserDirection - 激光入射方向
   * @returns {Object} 交互结果
   */
  handleLaserInteraction(laserDirection) {
    // 默认实现：激光穿透
    return {
      destroyed: false,
      blocked: false,
      reflected: false,
      split: false
    };
  }
}

/**
 * Mirror - 镜子
 */
export class Mirror extends Piece {
  constructor(config) {
    super({ ...config, type: GAME_CONFIG.PIECE_TYPES.MIRROR });
  }

  handleLaserInteraction(laserDirection) {
    const newDirection = calculateReflection(laserDirection, this.direction);

    if (newDirection === null) {
      // 无效反射 -> 镜子摧毁,激光停止
      // 不在这里调用destroy(),让PhysicsEngine决定
      return {
        destroyed: true,
        blocked: false,
        reflected: false,
        laserStopped: true
      };
    }

    // 有效反射
    return {
      destroyed: false,
      blocked: false,
      reflected: true,
      newDirection
    };
  }
}

/**
 * Shield - 盾牌
 */
export class Shield extends Piece {
  constructor(config) {
    super({ ...config, type: GAME_CONFIG.PIECE_TYPES.SHIELD });
  }

  handleLaserInteraction(laserDirection) {
    const result = calculateShieldInteraction(laserDirection, this.direction);

    if (result.destroyed) {
      // 不在这里调用destroy(),让PhysicsEngine决定
      return {
        destroyed: true,
        blocked: false,
        laserStopped: true
      };
    }

    // 背面穿透
    if (result.penetrated) {
      return {
        destroyed: false,
        blocked: false,
        laserStopped: false,
        penetrated: true
      };
    }

    // 阻挡激光
    return {
      destroyed: false,
      blocked: true,
      laserStopped: true
    };
  }
}

/**
 * Turret - 炮塔
 */
export class Turret extends Piece {
  constructor(config) {
    super({ ...config, type: GAME_CONFIG.PIECE_TYPES.TURRET });
  }

  handleLaserInteraction(laserDirection) {
    // 炮塔从任意方向被击中都会摧毁
    // 不在这里调用destroy(),让PhysicsEngine决定
    return {
      destroyed: true,
      blocked: false,
      gameOver: true, // 特殊标记：游戏结束
      winner: this.owner === 'white' ? 'black' : 'white'
    };
  }

  /**
   * 发射激光
   * @returns {Object} { position, direction }
   */
  fireLaser() {
    return {
      position: { ...this.position },
      direction: this.direction
    };
  }
}

/**
 * Jumper - 跳台
 */
export class Jumper extends Piece {
  constructor(config) {
    super({ ...config, type: GAME_CONFIG.PIECE_TYPES.JUMPER });
  }

  handleLaserInteraction(laserDirection) {
    const result = calculateJump(this.position, laserDirection, this.direction);

    if (result.destroyed) {
      // 不在这里调用destroy(),让PhysicsEngine决定
      return {
        destroyed: true,
        blocked: false,
        laserStopped: true
      };
    }

    // 激光跳跃
    return {
      destroyed: false,
      blocked: false,
      jumped: true,
      newPosition: result.position,
      newDirection: result.direction
    };
  }
}

/**
 * Splitter - 分光器
 */
export class Splitter extends Piece {
  constructor(config) {
    super({ ...config, type: GAME_CONFIG.PIECE_TYPES.SPLITTER });
  }

  handleLaserInteraction(laserDirection) {
    const newDirections = calculateSplit(laserDirection, this.direction);

    if (newDirections === null) {
      // 从背面入射 -> 摧毁
      // 不在这里调用destroy(),让PhysicsEngine决定
      return {
        destroyed: true,
        blocked: false,
        laserStopped: true
      };
    }

    // 分光
    return {
      destroyed: false,
      blocked: false,
      split: true,
      newDirections,
      position: { ...this.position }
    };
  }
}

/**
 * 工厂函数：根据类型创建棋子实例
 */
export function createPiece(config) {
  switch (config.type) {
    case GAME_CONFIG.PIECE_TYPES.MIRROR:
      return new Mirror(config);
    case GAME_CONFIG.PIECE_TYPES.SHIELD:
      return new Shield(config);
    case GAME_CONFIG.PIECE_TYPES.TURRET:
      return new Turret(config);
    case GAME_CONFIG.PIECE_TYPES.JUMPER:
      return new Jumper(config);
    case GAME_CONFIG.PIECE_TYPES.SPLITTER:
      return new Splitter(config);
    default:
      throw new Error(`Unknown piece type: ${config.type}`);
  }
}
