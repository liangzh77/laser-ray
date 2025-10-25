# Data Model - 激光棋游戏

**日期**: 2025-10-26
**分支**: 1-laser-chess-game
**阶段**: Phase 1 设计

## 核心实体定义

### 1. Game (游戏局)

```javascript
class Game {
  constructor(settings) {
    this.id = generateId(); // UUID v4
    this.settings = {
      timeMode: '10+0' | '15+10' | 'unlimited',
      boardSize: { width: 7, height: 7 }
    };
    this.board = new Board(this.settings.boardSize);
    this.players = [
      new Player({ id: 'white', color: 'white', time: this.settings.timeMode }),
      new Player({ id: 'black', color: 'black', time: this.settings.timeMode })
    ];
    this.currentPlayerIndex = 0; // 白方先手
    this.state = 'waiting' | 'playing' | 'laserFiring' | 'gameOver';
    this.winner = null;
    this.startTime = null;
    this.endTime = null;
    this.moveHistory = [];
  }
}
```

**验证规则**:
- 游戏ID必须唯一
- 时间模式必须是预定义的三种之一
- 棋盘大小固定为7×7
- 必须有且仅有两个玩家

### 2. Board (棋盘)

```javascript
class Board {
  constructor(size) {
    this.size = size; // { width: 7, height: 7 }
    this.grid = Array(size.height).fill(null).map(() =>
      Array(size.width).fill(null)
    );
    this.pieces = new Map(); // position -> Piece
  }

  // 位置转换：棋盘坐标 {x, y} <-> 棋谱记法 "a1".."g7"
  positionToNotation(pos) {
    const file = String.fromCharCode(97 + pos.x); // a-g
    const rank = pos.y + 1; // 1-7
    return `${file}${rank}`;
  }

  notationToPosition(notation) {
    const file = notation.charCodeAt(0) - 97; // a=0, g=6
    const rank = parseInt(notation[1]) - 1; // 1=0, 7=6
    return { x: file, y: rank };
  }
}
```

**验证规则**:
- 位置必须在7×7范围内
- 坐标转换必须正确
- 同一位置只能有一个棋子

### 3. Piece (棋子)

```javascript
class Piece {
  constructor(data) {
    this.id = generateId();
    this.type = 'mirror' | 'shield' | 'turret' | 'jumper' | 'splitter';
    this.owner = 'white' | 'black'; // 玩家ID
    this.position = { x: number, y: number }; // 0-6 范围
    this.direction = 0 | 90 | 180 | 270; // 角度，顺时针
    this.isActive = true; // 是否已被移除
    this.moveCount = 0; // 移动次数

    // 棋子类型特定属性
    this.properties = this.getInitialProperties();
  }

  getInitialProperties() {
    switch (this.type) {
      case 'mirror':
        return {
          reflectionAngles: [45, 135], // 有效反射角度
          invalidAngles: [0, 90, 180, 270] // 无效角度（会被摧毁）
        };
      case 'shield':
        return {
          blockingAngles: [0, 90, 180, 270], // 正面阻挡角度
          vulnerableAngles: [45, 135, 225, 315] // 侧面脆弱角度
        };
      case 'turret':
        return {
          firingAngle: this.direction, // 发射角度
          canRotate: true,
          canMove: true
        };
      case 'jumper':
        return {
          jumpDistance: 2, // 跳跃距离
          validEntryAngles: [0, 90, 180, 270]
        };
      case 'splitter':
        return {
          splitAngles: [90, 270], // 分光角度（左右）
          validEntryAngle: this.direction
        };
    }
  }

  // 验证移动是否合法（城堡移动规则：直线移动）
  canMoveTo(newPosition, board) {
    const dx = Math.abs(newPosition.x - this.position.x);
    const dy = Math.abs(newPosition.y - this.position.y);

    // 城堡移动：水平或垂直直线移动
    if (dx > 0 && dy > 0) return false; // 不能斜向移动

    // 检查路径上是否有障碍物
    const path = this.getMovePath(newPosition);
    for (const pos of path) {
      if (board.getPieceAt(pos)) return false;
    }

    return true;
  }

  // 获取移动路径（不包括起始和结束位置）
  getMovePath(targetPos) {
    const path = [];
    const dx = Math.sign(targetPos.x - this.position.x);
    const dy = Math.sign(targetPos.y - this.position.y);

    let current = {
      x: this.position.x + dx,
      y: this.position.y + dy
    };

    while (current.x !== targetPos.x || current.y !== targetPos.y) {
      path.push({ ...current });
      current.x += dx;
      current.y += dy;
    }

    return path;
  }

  // 旋转棋子（90度增量）
  rotate(clockwise = true) {
    const delta = clockwise ? 90 : -90;
    this.direction = (this.direction + delta) % 360;
    if (this.direction < 0) this.direction += 360;

    // 更新属性
    if (this.type === 'turret') {
      this.properties.firingAngle = this.direction;
    } else if (this.type === 'splitter') {
      this.properties.validEntryAngle = this.direction;
    }
  }
}
```

**验证规则**:
- 棋子类型必须是预定义的5种之一
- 位置必须在棋盘范围内
- 方向必须是90度的倍数
- 移动必须遵循城堡规则
- 每个棋子ID必须唯一

### 4. Laser (激光)

```javascript
class Laser {
  constructor(position, direction, source) {
    this.id = generateId();
    this.position = { ...position }; // 起始位置
    this.direction = direction; // 'up' | 'down' | 'left' | 'right'
    this.source = source; // 来源棋子ID
    this.path = [{ ...position }]; // 激光路径
    this.isActive = true;
    this.intensity = 1.0; // 激光强度（用于分光器）
  }

  // 获取下一个位置
  getNextPosition() {
    const current = this.path[this.path.length - 1];
    const delta = this.getDirectionDelta(this.direction);
    return {
      x: current.x + delta.x,
      y: current.y + delta.y
    };
  }

  getDirectionDelta(direction) {
    switch (direction) {
      case 'up': return { x: 0, y: -1 };
      case 'down': return { x: 0, y: 1 };
      case 'left': return { x: -1, y: 0 };
      case 'right': return { x: 1, y: 0 };
      default: return { x: 0, y: 0 };
    }
  }

  // 检查激光是否超出边界
  isOutOfBounds(boardSize) {
    const next = this.getNextPosition();
    return next.x < 0 || next.x >= boardSize.width ||
           next.y < 0 || next.y >= boardSize.height;
  }

  // 计算反射方向
  calculateReflection(mirrorAngle, incomingDirection) {
    // 简化的反射计算
    const directionMap = {
      0: { up: 'right', right: 'up', down: 'left', left: 'down' },
      90: { up: 'left', right: 'down', down: 'right', left: 'up' },
      180: { up: 'left', right: 'down', down: 'right', left: 'up' },
      270: { up: 'right', right: 'up', down: 'left', left: 'down' }
    };

    return directionMap[mirrorAngle][incomingDirection];
  }
}
```

**验证规则**:
- 方向必须是四个基本方向之一
- 位置必须在棋盘范围内或刚超出边界
- 激光ID必须唯一

### 5. Player (玩家)

```javascript
class Player {
  constructor(data) {
    this.id = data.id; // 'white' | 'black'
    this.color = data.color; // 'white' | 'black'
    this.time = this.parseTimeMode(data.time); // 剩余时间（秒）
    this.initialTime = this.time; // 初始时间
    this.pieces = new Set(); // 拥有的棋子ID集合
    this.isActive = true;
  }

  parseTimeMode(timeMode) {
    switch (timeMode) {
      case '10+0': return 600; // 10分钟
      case '15+10': return 900; // 15分钟 + 10秒 increment
      case 'unlimited': return Infinity;
      default: return 600;
    }
  }

  consumeTime(seconds) {
    if (this.time !== Infinity) {
      this.time = Math.max(0, this.time - seconds);
      if (this.time === 0) {
        this.isActive = false;
      }
    }
    return this.time;
  }

  addTime(seconds) {
    if (this.time !== Infinity) {
      this.time += seconds;
    }
  }
}
```

**验证规则**:
- 玩家ID和颜色必须匹配
- 时间不能为负数
- 每个棋子必须有明确的所有者

### 6. GameEvent (游戏事件)

```javascript
class GameEvent {
  constructor(type, data) {
    this.id = generateId();
    this.timestamp = Date.now();
    this.type = type;
    this.data = data;
  }
}

// 事件类型定义
const EVENT_TYPES = {
  GAME_STARTED: 'gameStarted',
  MOVE_MADE: 'moveMade',
  PIECE_ROTATED: 'pieceRotated',
  LASER_FIRED: 'laserFired',
  LASER_REFLECTED: 'laserReflected',
  PIECE_DESTROYED: 'pieceDestroyed',
  TURN_CHANGED: 'turnChanged',
  GAME_ENDED: 'gameEnded',
  TIME_EXPIRED: 'timeExpired'
};
```

## 状态转换图

```
[waiting] -- startGame() --> [playing]
[playing] -- fireLaser() --> [laserFiring]
[laserFiring] -- laserComplete() --> [playing]
[playing] -- gameOver() --> [gameOver]
[playing] -- timeExpired() --> [gameOver]
```

## 约束和不变量

### 游戏规则约束
1. **回合制**: 每回合只能执行一个操作（移动、旋转或发射激光）
2. **胜利条件**: 击中对方炮塔或对方时间用尽
3. **棋子限制**: 每种棋子的初始数量和位置由预定义布局决定
4. **移动规则**: 所有棋子遵循城堡移动规则（水平或垂直直线移动）
5. **激光物理**: 遵循预定义的反射、阻挡、跳跃、分光规则

### 数据完整性约束
1. **唯一性**: 所有游戏对象必须有唯一ID
2. **引用完整性**: 所有引用必须指向存在的对象
3. **范围约束**: 位置必须在棋盘范围内
4. **状态一致性**: 游戏状态必须与实际棋盘状态一致

### 性能约束
1. **计算时间**: 激光物理计算必须在10ms内完成
2. **内存使用**: 单个游戏实例内存占用不超过1MB
3. **并发性**: 支持至少1000个并发游戏实例

## 扩展点

### 未来可能的扩展
1. **棋子类型**: 可以轻松添加新的棋子类型
2. **棋盘大小**: 架构支持不同大小的棋盘
3. **时间模式**: 可以添加新的时间控制模式
4. **游戏模式**: 可以支持多人游戏或AI对手
5. **动画系统**: 可以扩展更复杂的动画效果
6. **音效系统**: 可以添加音效支持

### 配置化设计
```javascript
// 游戏配置示例
const GAME_CONFIG = {
  boardSize: { width: 7, height: 7 },
  timeModes: ['10+0', '15+10', 'unlimited'],
  pieceTypes: ['mirror', 'shield', 'turret', 'jumper', 'splitter'],
  performanceTargets: {
    laserCalculation: 10, // ms
    uiResponse: 16, // ms (60fps)
    pageLoad: 3000 // ms
  }
};
```