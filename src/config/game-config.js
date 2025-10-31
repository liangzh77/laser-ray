/**
 * Game Configuration
 * 集中管理游戏的所有配置参数，避免硬编码
 */

export const GAME_CONFIG = {
  // 棋盘配置
  BOARD: {
    SIZE: {
      WIDTH: 7,
      HEIGHT: 7
    },
    CELL_SIZE: 80, // pixels
    TOTAL_WIDTH: 560, // 7 * 80
    TOTAL_HEIGHT: 560,
    COORDINATES: {
      COLUMNS: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      ROWS: [1, 2, 3, 4, 5, 6, 7]
    }
  },

  // 时间控制模式
  TIME_MODES: {
    BLITZ: {
      id: '10+0',
      initialTime: 10 * 60 * 1000, // 10分钟（毫秒）
      increment: 0
    },
    RAPID: {
      id: '15+10',
      initialTime: 15 * 60 * 1000, // 15分钟
      increment: 10 * 1000 // 每回合增加10秒
    },
    UNLIMITED: {
      id: 'unlimited',
      initialTime: Infinity,
      increment: 0
    }
  },

  // 棋子类型
  PIECE_TYPES: {
    MIRROR: 'mirror',
    SHIELD: 'shield',
    TURRET: 'turret',
    JUMPER: 'jumper',
    SPLITTER: 'splitter'
  },

  // 方向定义
  DIRECTIONS: {
    UP: 'up',       // 0° - 向上
    RIGHT: 'right', // 90° - 向右
    DOWN: 'down',   // 180° - 向下
    LEFT: 'left'    // 270° - 向左
  },

  // 方向向量（用于激光物理计算）
  DIRECTION_VECTORS: {
    up: { dx: 0, dy: -1 },
    right: { dx: 1, dy: 0 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 }
  },

  // 玩家配置
  PLAYERS: {
    WHITE: {
      id: 'white',
      color: 'white',
      name: '白方',
      homeRows: [1, 2]
    },
    BLACK: {
      id: 'black',
      color: 'black',
      name: '黑方',
      homeRows: [6, 7]
    }
  },

  // 游戏状态
  GAME_STATES: {
    WAITING: 'waiting',       // 等待开始
    PLAYING: 'playing',       // 游戏进行中
    LASER_FIRING: 'laserFiring', // 激光发射中
    GAME_OVER: 'gameOver'     // 游戏结束
  },

  // 操作类型
  OPERATION_TYPES: {
    MOVE: 'move',
    ROTATE: 'rotate',
    FIRE_LASER: 'fireLaser'
  },

  // UI配置
  UI: {
    // 颜色方案
    COLORS: {
      BOARD_LIGHT: '#f0d9b5',
      BOARD_DARK: '#b58863',
      WHITE_PIECE: '#e8e8e8',
      BLACK_PIECE: '#333333',
      HIGHLIGHT: '#ffff00',
      LASER: '#ff0000',
      VALID_MOVE: '#00ff00'
    },

    // 动画时长
    ANIMATION_DURATION: {
      MOVE: 300,        // ms
      ROTATE: 200,      // ms
      LASER: 1500,      // ms
      DESTRUCTION: 500  // ms
    },

    // Z-index层级
    Z_INDEX: {
      BOARD: 1,
      PIECES: 2,
      LASER: 3,
      UI: 4
    }
  },

  // 性能目标
  PERFORMANCE: {
    LASER_CALC_MAX_TIME: 10,      // ms - 激光物理计算
    UI_RESPONSE_MAX_TIME: 200,    // ms - 用户操作响应
    FRAME_TIME: 16,                // ms - 60fps
    PAGE_LOAD_MAX_TIME: 3000,      // ms - 页面加载
    MAX_GAME_INSTANCES: 1000,      // 并发游戏实例
    MAX_MEMORY_PER_GAME: 1          // MB
  },

  // 初始棋子布局（参考initial-setup.md）
  INITIAL_SETUP: {
    white: {
      row1: [
        { pos: 'a1', type: 'jumper', direction: 'up' },
        { pos: 'b1', type: 'splitter', direction: 'left' },
        { pos: 'c1', type: 'shield', direction: 'left' },
        { pos: 'd1', type: 'turret', direction: 'up' },
        { pos: 'e1', type: 'shield', direction: 'right' },
        { pos: 'f1', type: 'splitter', direction: 'right' },
        { pos: 'g1', type: 'jumper', direction: 'up' }
      ],
      row2: [
        { pos: 'a2', type: 'mirror', direction: 'left' },
        { pos: 'b2', type: 'mirror', direction: 'left' },
        { pos: 'c2', type: 'mirror', direction: 'left' },
        { pos: 'd2', type: 'shield', direction: 'up' },
        { pos: 'e2', type: 'mirror', direction: 'up' },
        { pos: 'f2', type: 'mirror', direction: 'up' },
        { pos: 'g2', type: 'mirror', direction: 'up' }
      ]
    },
    black: {
      row7: [
        { pos: 'a7', type: 'jumper', direction: 'down' },
        { pos: 'b7', type: 'splitter', direction: 'left' },
        { pos: 'c7', type: 'shield', direction: 'left' },
        { pos: 'd7', type: 'turret', direction: 'down' },
        { pos: 'e7', type: 'shield', direction: 'right' },
        { pos: 'f7', type: 'splitter', direction: 'right' },
        { pos: 'g7', type: 'jumper', direction: 'down' }
      ],
      row6: [
        { pos: 'a6', type: 'mirror', direction: 'down' },
        { pos: 'b6', type: 'mirror', direction: 'down' },
        { pos: 'c6', type: 'mirror', direction: 'down' },
        { pos: 'd6', type: 'shield', direction: 'down' },
        { pos: 'e6', type: 'mirror', direction: 'right' },
        { pos: 'f6', type: 'mirror', direction: 'right' },
        { pos: 'g6', type: 'mirror', direction: 'right' }
      ]
    }
  }
};

// 工具函数：根据ID获取时间模式配置
export function getTimeModeConfig(modeId) {
  return Object.values(GAME_CONFIG.TIME_MODES).find(mode => mode.id === modeId);
}

// 工具函数：坐标转换（棋盘记号 <-> 数组索引）
export function positionToIndices(position) {
  // 例如: 'a1' -> { col: 0, row: 6 }（注意：Canvas Y轴从上到下）
  const col = GAME_CONFIG.BOARD.COORDINATES.COLUMNS.indexOf(position[0]);
  const row = 7 - parseInt(position[1]); // 反转Y轴
  return { col, row };
}

export function indicesToPosition(col, row) {
  // 例如: { col: 0, row: 6 } -> 'a1'
  const colLetter = GAME_CONFIG.BOARD.COORDINATES.COLUMNS[col];
  const rowNumber = 7 - row; // 反转Y轴
  return `${colLetter}${rowNumber}`;
}

// 工具函数：验证位置是否在棋盘范围内
export function isValidPosition(col, row) {
  return col >= 0 && col < 7 && row >= 0 && row < 7;
}

// 工具函数：获取方向的旋转角度
export function getRotationAngle(direction) {
  const angles = {
    up: 0,
    right: 90,
    down: 180,
    left: 270
  };
  return angles[direction] || 0;
}
