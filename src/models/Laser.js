/**
 * Laser Model
 * 激光模型 - 表示激光束的状态和路径
 */

export class Laser {
  /**
   * @param {Object} config
   * @param {Object} config.position - 起始位置 { col, row }
   * @param {string} config.direction - 激光方向
   * @param {string} config.source - 激光来源（'turret' 或 'splitter'）
   * @param {string} config.owner - 所有者ID
   */
  constructor({ position, direction, source = 'turret', owner }) {
    this.position = { ...position };
    this.direction = direction;
    this.source = source;
    this.owner = owner;
    this.path = [{ ...position }]; // 激光经过的所有位置
    this.interactions = []; // 激光与棋子的交互记录
    this.isActive = true;
    this.id = this.generateId();
  }

  /**
   * 生成唯一ID
   * @private
   */
  generateId() {
    return `laser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 更新激光位置
   * @param {Object} newPosition - { col, row }
   */
  moveTo(newPosition) {
    this.position = { ...newPosition };
    this.path.push({ ...newPosition });
  }

  /**
   * 改变激光方向
   * @param {string} newDirection
   */
  changeDirection(newDirection) {
    this.direction = newDirection;
  }

  /**
   * 记录与棋子的交互
   * @param {Object} interaction
   */
  addInteraction(interaction) {
    this.interactions.push({
      ...interaction,
      position: { ...this.position },
      timestamp: Date.now()
    });
  }

  /**
   * 停止激光
   * @param {string} reason - 停止原因
   */
  stop(reason) {
    this.isActive = false;
    this.stopReason = reason;
  }

  /**
   * 获取激光的完整路径
   * @returns {Array<Object>}
   */
  getPath() {
    return [...this.path];
  }

  /**
   * 获取激光经过的格子数
   * @returns {number}
   */
  getPathLength() {
    return this.path.length;
  }

  /**
   * 获取所有交互记录
   * @returns {Array<Object>}
   */
  getInteractions() {
    return [...this.interactions];
  }

  /**
   * 检查激光是否在指定位置
   * @param {Object} position - { col, row }
   * @returns {boolean}
   */
  isAt(position) {
    return this.position.col === position.col && this.position.row === position.row;
  }

  /**
   * 克隆激光（用于分光器产生新激光）
   * @param {Object} overrides - 覆盖属性
   * @returns {Laser}
   */
  clone(overrides = {}) {
    const cloned = new Laser({
      position: this.position,
      direction: this.direction,
      source: 'splitter',
      owner: this.owner
    });

    // 应用覆盖属性
    Object.assign(cloned, overrides);

    // 复制路径（但不包括交互历史）
    cloned.path = [...this.path];

    return cloned;
  }

  /**
   * 获取JSON表示
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      position: { ...this.position },
      direction: this.direction,
      source: this.source,
      owner: this.owner,
      path: this.getPath(),
      interactions: this.getInteractions(),
      isActive: this.isActive,
      stopReason: this.stopReason
    };
  }
}

/**
 * LaserBeam - 激光束集合（管理多个激光实例）
 */
export class LaserBeam {
  constructor() {
    this.lasers = []; // 所有激光实例
    this.activeLasers = []; // 当前活跃的激光
  }

  /**
   * 添加激光
   * @param {Laser} laser
   */
  addLaser(laser) {
    this.lasers.push(laser);
    if (laser.isActive) {
      this.activeLasers.push(laser);
    }
  }

  /**
   * 移除激光
   * @param {Laser} laser
   */
  removeLaser(laser) {
    const index = this.lasers.indexOf(laser);
    if (index !== -1) {
      this.lasers.splice(index, 1);
    }

    const activeIndex = this.activeLasers.indexOf(laser);
    if (activeIndex !== -1) {
      this.activeLasers.splice(activeIndex, 1);
    }
  }

  /**
   * 停止激光
   * @param {Laser} laser
   * @param {string} reason
   */
  stopLaser(laser, reason) {
    laser.stop(reason);

    const index = this.activeLasers.indexOf(laser);
    if (index !== -1) {
      this.activeLasers.splice(index, 1);
    }
  }

  /**
   * 获取所有激光
   * @returns {Array<Laser>}
   */
  getAllLasers() {
    return [...this.lasers];
  }

  /**
   * 获取活跃的激光
   * @returns {Array<Laser>}
   */
  getActiveLasers() {
    return [...this.activeLasers];
  }

  /**
   * 检查是否有活跃的激光
   * @returns {boolean}
   */
  hasActiveLasers() {
    return this.activeLasers.length > 0;
  }

  /**
   * 清空所有激光
   */
  clear() {
    this.lasers = [];
    this.activeLasers = [];
  }

  /**
   * 获取JSON表示
   * @returns {Object}
   */
  toJSON() {
    return {
      lasers: this.lasers.map(l => l.toJSON()),
      activeLasersCount: this.activeLasers.length
    };
  }
}
