/**
 * Event Bus
 * 事件总线系统 - 实现组件间的解耦通信
 * 采用发布-订阅模式
 */

export class EventBus {
  constructor() {
    // 存储事件监听器: { eventName: [callbacks] }
    this.listeners = new Map();

    // 存储事件历史（用于调试）
    this.history = [];
    this.maxHistorySize = 100;

    // 是否启用调试模式
    this.debug = false;
  }

  /**
   * 订阅事件
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} context - 回调函数的上下文（this绑定）
   * @returns {Function} 取消订阅函数
   */
  on(eventName, callback, context = null) {
    if (typeof callback !== 'function') {
      throw new Error('回调必须是函数');
    }

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    const listener = { callback, context };
    this.listeners.get(eventName).push(listener);

    if (this.debug) {
      console.log(`[EventBus] 订阅事件: ${eventName}`);
    }

    // 返回取消订阅函数
    return () => this.off(eventName, callback);
  }

  /**
   * 订阅事件（仅触发一次）
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} context - 回调函数的上下文
   * @returns {Function} 取消订阅函数
   */
  once(eventName, callback, context = null) {
    const wrappedCallback = (...args) => {
      this.off(eventName, wrappedCallback);
      callback.apply(context, args);
    };

    return this.on(eventName, wrappedCallback, context);
  }

  /**
   * 取消订阅事件
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 要移除的回调函数
   */
  off(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      return;
    }

    const listeners = this.listeners.get(eventName);
    const index = listeners.findIndex(listener => listener.callback === callback);

    if (index !== -1) {
      listeners.splice(index, 1);

      if (this.debug) {
        console.log(`[EventBus] 取消订阅: ${eventName}`);
      }
    }

    // 如果没有监听器了，删除该事件
    if (listeners.length === 0) {
      this.listeners.delete(eventName);
    }
  }

  /**
   * 发布事件
   * @param {string} eventName - 事件名称
   * @param {*} data - 事件数据
   */
  emit(eventName, data) {
    // 记录事件历史
    this.addToHistory(eventName, data);

    if (this.debug) {
      console.log(`[EventBus] 发布事件: ${eventName}`, data);
    }

    if (!this.listeners.has(eventName)) {
      return;
    }

    const listeners = this.listeners.get(eventName);

    // 创建监听器副本，避免在回调中修改订阅导致问题
    const listenersCopy = [...listeners];

    listenersCopy.forEach(listener => {
      try {
        if (listener.context) {
          listener.callback.call(listener.context, data);
        } else {
          listener.callback(data);
        }
      } catch (error) {
        console.error(`[EventBus] 事件处理错误 (${eventName}):`, error);
      }
    });
  }

  /**
   * 清除所有监听器
   * @param {string} eventName - 可选，指定要清除的事件名称
   */
  clear(eventName = null) {
    if (eventName) {
      this.listeners.delete(eventName);
      if (this.debug) {
        console.log(`[EventBus] 清除事件监听器: ${eventName}`);
      }
    } else {
      this.listeners.clear();
      if (this.debug) {
        console.log('[EventBus] 清除所有事件监听器');
      }
    }
  }

  /**
   * 获取事件的监听器数量
   * @param {string} eventName - 事件名称
   * @returns {number}
   */
  listenerCount(eventName) {
    return this.listeners.has(eventName) ? this.listeners.get(eventName).length : 0;
  }

  /**
   * 获取所有事件名称
   * @returns {Array<string>}
   */
  eventNames() {
    return Array.from(this.listeners.keys());
  }

  /**
   * 添加事件到历史记录
   * @private
   */
  addToHistory(eventName, data) {
    this.history.push({
      eventName,
      data,
      timestamp: Date.now()
    });

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * 获取事件历史
   * @param {string} eventName - 可选，过滤特定事件
   * @returns {Array}
   */
  getHistory(eventName = null) {
    if (eventName) {
      return this.history.filter(entry => entry.eventName === eventName);
    }
    return [...this.history];
  }

  /**
   * 清空事件历史
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * 启用/禁用调试模式
   * @param {boolean} enabled
   */
  setDebug(enabled) {
    this.debug = enabled;
  }
}

// 游戏事件常量
export const GAME_EVENTS = {
  // 游戏生命周期
  GAME_CREATED: 'game:created',
  GAME_STARTED: 'game:started',
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',
  GAME_ENDED: 'game:ended',

  // 回合管理
  TURN_STARTED: 'turn:started',
  TURN_ENDED: 'turn:ended',

  // 棋子操作
  PIECE_SELECTED: 'piece:selected',
  PIECE_DESELECTED: 'piece:deselected',
  PIECE_MOVED: 'piece:moved',
  PIECE_ROTATED: 'piece:rotated',
  PIECE_DESTROYED: 'piece:destroyed',

  // 激光事件
  LASER_FIRED: 'laser:fired',
  LASER_PATH_CALCULATED: 'laser:path_calculated',
  LASER_INTERACTION: 'laser:interaction',
  LASER_ANIMATION_START: 'laser:animation_start',
  LASER_ANIMATION_END: 'laser:animation_end',

  // 时间管理
  TIMER_TICK: 'timer:tick',
  TIMER_WARNING: 'timer:warning', // 时间快用完警告
  TIME_EXPIRED: 'time:expired',

  // UI事件
  UI_READY: 'ui:ready',
  UI_RENDER: 'ui:render',
  UI_ERROR: 'ui:error',

  // 状态变化
  STATE_CHANGED: 'state:changed',

  // 错误事件
  ERROR: 'error',
  VALIDATION_ERROR: 'error:validation'
};

// 创建全局事件总线实例
export const globalEventBus = new EventBus();

// 便捷的全局函数
export function on(eventName, callback, context) {
  return globalEventBus.on(eventName, callback, context);
}

export function once(eventName, callback, context) {
  return globalEventBus.once(eventName, callback, context);
}

export function off(eventName, callback) {
  globalEventBus.off(eventName, callback);
}

export function emit(eventName, data) {
  globalEventBus.emit(eventName, data);
}

export function clearListeners(eventName) {
  globalEventBus.clear(eventName);
}
