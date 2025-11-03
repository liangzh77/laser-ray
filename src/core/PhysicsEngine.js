/**
 * Physics Engine
 * 激光物理引擎 - 处理激光传播和与棋子的交互
 */

import { getNextPosition, isWithinBoard } from '../utils/geometry.js';
import { Laser, LaserBeam } from '../models/Laser.js';
import { emit, GAME_EVENTS } from './EventBus.js';

export class PhysicsEngine {
  constructor(game) {
    this.game = game;
    this.maxIterations = 1000; // 防止无限循环
  }

  /**
   * 计算激光路径
   * @param {Object} startPosition - 起始位置 { col, row }
   * @param {string} startDirection - 起始方向
   * @param {string} owner - 激光所有者
   * @returns {LaserBeam} 激光束集合（包含所有激光路径）
   */
  calculateLaserPath(startPosition, startDirection, owner) {
    const laserBeam = new LaserBeam();

    // 创建初始激光
    const initialLaser = new Laser({
      position: startPosition,
      direction: startDirection,
      source: 'turret',
      owner
    });

    laserBeam.addLaser(initialLaser);

    // 处理所有活跃的激光
    let iterations = 0;
    while (laserBeam.hasActiveLasers() && iterations < this.maxIterations) {
      const activeLasers = laserBeam.getActiveLasers();

      // 处理每个活跃的激光
      for (const laser of activeLasers) {
        this.processLaserStep(laser, laserBeam);
      }

      iterations++;
    }

    if (iterations >= this.maxIterations) {
      console.warn('激光计算达到最大迭代次数，可能存在无限循环');
    }

    // 发布激光路径计算完成事件
    emit(GAME_EVENTS.LASER_PATH_CALCULATED, {
      laserBeam: laserBeam.toJSON()
    });

    return laserBeam;
  }

  /**
   * 处理单个激光的一步移动
   * @private
   */
  processLaserStep(laser, laserBeam) {
    // 计算下一个位置
    const nextPosition = getNextPosition(laser.position, laser.direction);

    // 检查是否超出棋盘
    if (!isWithinBoard(nextPosition)) {
      laserBeam.stopLaser(laser, 'out_of_bounds');
      return;
    }

    // 移动激光到下一个位置
    laser.moveTo(nextPosition);

    // 检查该位置是否有棋子
    const piece = this.game.board.getPieceAt(nextPosition);

    if (piece) {
      // 处理激光与棋子的交互
      this.handleLaserInteraction(laser, piece, laserBeam);
    }
  }

  /**
   * 处理激光与棋子的交互
   * @private
   */
  handleLaserInteraction(laser, piece, laserBeam) {
    // 调试信息
    console.log(`激光交互: 激光所有者=${laser.owner}, 棋子=${piece.type}, 棋子所有者=${piece.owner}, 位置=(${piece.position.col},${piece.position.row})`);

    // 检查是否是己方棋子（炮塔除外）
    if (laser.owner === piece.owner && piece.type !== 'turret') {
      console.log(`  → 己方棋子，激光穿透`);
      // 己方棋子不受激光影响，激光穿透
      return;
    }

    // 调用棋子的交互处理方法
    const result = piece.handleLaserInteraction(laser.direction);
    console.log(`  → 交互结果:`, result);

    // 记录交互
    laser.addInteraction({
      pieceType: piece.type,
      pieceOwner: piece.owner,
      result
    });

    // 发布交互事件
    emit(GAME_EVENTS.LASER_INTERACTION, {
      laser: laser.toJSON(),
      piece: piece.toJSON(),
      result
    });

    // 根据交互结果处理

    // 棋子被摧毁
    if (result.destroyed) {
      this.game.board.removePiece(piece.position);
      emit(GAME_EVENTS.PIECE_DESTROYED, {
        piece: piece.toJSON(),
        reason: 'laser_hit',
        position: piece.position
      });

      // 如果是炮塔被摧毁，游戏结束
      if (result.gameOver) {
        laserBeam.stopLaser(laser, 'turret_destroyed');
        return;
      }
    }

    // 激光被阻挡或停止
    if (result.blocked || result.laserStopped) {
      laserBeam.stopLaser(laser, 'blocked');
      return;
    }

    // 激光反射
    if (result.reflected) {
      laser.changeDirection(result.newDirection);
      return;
    }

    // 激光跳跃
    if (result.jumped) {
      // 标记当前位置(跳台位置)为跳跃点
      laser.markJump();
      // 移动到跳跃后的位置
      laser.moveTo(result.newPosition);
      laser.changeDirection(result.newDirection);
      return;
    }

    // 激光分光
    if (result.split) {
      // 停止当前激光
      laserBeam.stopLaser(laser, 'split');

      // 创建新的激光束
      result.newDirections.forEach(direction => {
        const newLaser = laser.clone({
          direction,
          position: result.position
        });
        laserBeam.addLaser(newLaser);
      });
    }
  }

  /**
   * 检查游戏是否因激光击中炮塔而结束
   * @param {LaserBeam} laserBeam
   * @returns {Object|null} { winner, reason } 或 null
   */
  checkGameOverFromLaser(laserBeam) {
    const allLasers = laserBeam.getAllLasers();

    for (const laser of allLasers) {
      const interactions = laser.getInteractions();

      for (const interaction of interactions) {
        if (interaction.result.gameOver) {
          return {
            winner: interaction.result.winner,
            reason: 'turret_destroyed'
          };
        }
      }
    }

    return null;
  }

  /**
   * 获取激光击中的所有棋子
   * @param {LaserBeam} laserBeam
   * @returns {Array<Object>}
   */
  getHitPieces(laserBeam) {
    const hitPieces = [];
    const allLasers = laserBeam.getAllLasers();

    for (const laser of allLasers) {
      const interactions = laser.getInteractions();

      for (const interaction of interactions) {
        if (interaction.result.destroyed) {
          hitPieces.push({
            type: interaction.pieceType,
            owner: interaction.pieceOwner,
            position: interaction.position
          });
        }
      }
    }

    return hitPieces;
  }
}
