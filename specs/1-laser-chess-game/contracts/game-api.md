# Game API Contract - 激光棋游戏

**版本**: 1.0.0
**日期**: 2025-10-26
**格式**: RESTful API Style (客户端调用)

## API 架构说明

由于这是一个纯客户端游戏，API指的是游戏引擎提供给UI层的接口，而不是HTTP API。所有方法都是同步的JavaScript方法调用。

## 核心 GameEngine API

### 游戏初始化

```javascript
// 创建新游戏
gameEngine.createGame(settings: GameSettings): Game

settings: {
  timeMode: '10+0' | '15+10' | 'unlimited',
  playerNames?: [string, string] // 可选玩家名称
}

返回: {
  id: string,
  board: Board,
  players: [Player, Player],
  currentPlayerIndex: number,
  state: 'waiting',
  settings: GameSettings
}
```

### 游戏控制

```javascript
// 开始游戏
gameEngine.startGame(): boolean

返回: 成功返回true，如果游戏已经在进行中返回false

// 重新开始游戏
gameEngine.restartGame(): Game

返回: 新的游戏实例
```

### 棋子操作

```javascript
// 移动棋子
gameEngine.movePiece(pieceId: string, targetPosition: Position): MoveResult

MoveResult: {
  success: boolean,
  error?: string,
  movedPiece?: Piece,
  capturedPiece?: Piece,
  newGameState?: GameState
}

// 旋转棋子
gameEngine.rotatePiece(pieceId: string, clockwise: boolean = true): RotateResult

RotateResult: {
  success: boolean,
  error?: string,
  rotatedPiece?: Piece,
  newDirection?: number
}

// 发射激光
gameEngine.fireLaser(turretId: string): LaserResult

LaserResult: {
  success: boolean,
  error?: string,
  laserPath?: Position[],
  destroyedPieces?: Piece[],
  gameEnded?: boolean,
  winner?: Player
}
```

### 游戏状态查询

```javascript
// 获取当前游戏状态
gameEngine.getGameState(): GameState

GameState: {
  currentPlayerIndex: number,
  currentTurn: number,
  gamePhase: 'waiting' | 'playing' | 'laserFiring' | 'gameOver',
  timeRemaining: [number, number], // [白方时间, 黑方时间]
  lastMove?: Move,
  winner?: Player
}

// 获取棋盘状态
gameEngine.getBoardState(): BoardState

BoardState: {
  size: { width: number, height: number },
  pieces: Piece[],
  validMoves: Map<string, Position[]> // pieceId -> 可移动位置
}

// 获取可能的移动
gameEngine.getValidMoves(pieceId: string): Position[]

返回: 指定棋子的所有合法移动位置数组

// 获取游戏历史
gameEngine.getMoveHistory(): Move[]

Move: {
  id: string,
  playerId: string,
  type: 'move' | 'rotate' | 'fireLaser',
  pieceId?: string,
  fromPosition?: Position,
  toPosition?: Position,
  rotation?: number,
  timestamp: number
}
```

### 事件系统

```javascript
// 注册事件监听器
gameEngine.addEventListener(eventType: string, callback: Function): void

eventType:
  'gameStarted',
  'pieceMoved',
  'pieceRotated',
  'laserFired',
  'pieceDestroyed',
  'turnChanged',
  'gameEnded',
  'timeWarning'

// 移除事件监听器
gameEngine.removeEventListener(eventType: string, callback: Function): void

// 事件数据格式示例
interface GameEvent {
  type: string,
  timestamp: number,
  data: {
    // 根据事件类型不同的数据结构
    playerId?: string,
    pieceId?: string,
    from?: Position,
    to?: Position,
    laserPath?: Position[],
    destroyedPieces?: Piece[]
  }
}
```

## 棋盘渲染 API

### BoardRenderer API

```javascript
// 初始化渲染器
const renderer = new BoardRenderer(canvasElement: HTMLCanvasElement)

// 渲染棋盘
renderer.renderBoard(board: Board): void

// 渲染棋子
renderer.renderPieces(pieces: Piece[]): void

// 渲染激光动画
renderer.renderLaser(laserPath: Position[], duration: number): Promise<void>

// 高亮显示可移动位置
renderer.highlightValidMoves(positions: Position[]): void

// 高亮显示棋子
renderer.highlightPiece(pieceId: string, color: string): void

// 清除高亮
renderer.clearHighlights(): void

// 棋子动画
renderer.animatePieceMove(piece: Piece, from: Position, to: Position): Promise<void>
renderer.animatePieceRotation(piece: Piece, fromAngle: number, toAngle: number): Promise<void>
renderer.animatePieceDestruction(piece: Piece): Promise<void>
```

## 物理引擎 API

### PhysicsEngine API

```javascript
// 计算激光路径
physicsEngine.calculateLaserPath(
  startPosition: Position,
  direction: Direction,
  board: Board
): LaserPathResult

LaserPathResult: {
  path: Position[],
  interactions: LaserInteraction[],
  finalState: 'outOfBounds' | 'absorbed' | 'turretHit'
}

LaserInteraction: {
  position: Position,
  piece: Piece,
  interactionType: 'reflection' | 'absorption' | 'jump' | 'split' | 'turretHit',
  result: InteractionResult
}

// 验证棋子移动
physicsEngine.validateMove(
  piece: Piece,
  targetPosition: Position,
  board: Board
): boolean

// 检查游戏结束条件
physicsEngine.checkGameEndConditions(board: Board): GameEndCheck

GameEndCheck: {
  isGameOver: boolean,
  winner?: Player,
  reason?: 'turretDestroyed' | 'timeExpired'
}
```

## 状态管理 API

### StateManager API

```javascript
// 创建游戏状态快照
stateManager.createSnapshot(): GameState

// 恢复到指定快照
stateManager.restoreSnapshot(snapshot: GameState): void

// 获取状态变更历史
stateManager.getStateHistory(): StateTransition[]

StateTransition: {
  fromState: GameState,
  toState: GameState,
  action: GameAction,
  timestamp: number
}

// 验证状态转换合法性
stateManager.validateTransition(
  currentState: GameState,
  action: GameAction
): boolean
```

## 计时器 API

### Timer API

```javascript
// 启动计时器
timer.start(): void

// 暂停计时器
timer.pause(): void

// 恢复计时器
timer.resume(): void

// 重置计时器
timer.reset(): void

// 获取剩余时间
timer.getRemainingTime(playerId: string): number

// 设置时间警告回调
timer.setTimeWarning(threshold: number, callback: Function): void

// 设置超时回调
timer.setTimeoutCallback(callback: Function): void
```

## 配置 API

### GameConfig API

```javascript
// 获取游戏配置
config.getGameConfig(): GameConfig

GameConfig: {
  boardSize: { width: 7, height: 7 },
  timeModes: TimeMode[],
  pieceTypes: PieceType[],
  animationSettings: {
    moveDuration: number,
    rotationDuration: number,
    laserDuration: number,
    destructionDuration: number
  },
  performanceSettings: {
    targetFPS: number,
    maxConcurrentGames: number
  }
}

// 获取棋子配置
config.getPieceConfig(pieceType: string): PieceConfig

PieceConfig: {
  initialCount: number,
  canMove: boolean,
  canRotate: boolean,
  validRotations: number[],
  interactionRules: InteractionRule[]
}

// 更新配置（开发模式）
config.updateConfig(newConfig: Partial<GameConfig>): void
```

## 错误处理 API

### ErrorHandler API

```javascript
// 注册错误处理器
errorHandler.addHandler(errorType: string, handler: Function): void

// 处理错误
errorHandler.handleError(error: GameError): GameErrorResult

GameError: {
  type: 'InvalidMove' | 'InvalidRotation' | 'InvalidLaserTarget' | 'StateError',
  message: string,
  context: any,
  recoverable: boolean
}

GameErrorResult: {
  handled: boolean,
  userMessage?: string,
  recoveryAction?: 'undo' | 'retry' | 'ignore'
}
```

## 使用示例

### 完整游戏流程示例

```javascript
// 1. 初始化游戏
const gameEngine = new GameEngine();
const game = gameEngine.createGame({ timeMode: '10+0' });

// 2. 设置渲染器
const canvas = document.getElementById('game-canvas');
const renderer = new BoardRenderer(canvas);

// 3. 注册事件监听器
gameEngine.addEventListener('gameStarted', (event) => {
  console.log('游戏开始');
  renderer.renderBoard(game.board);
});

gameEngine.addEventListener('pieceMoved', (event) => {
  const { piece, from, to } = event.data;
  renderer.animatePieceMove(piece, from, to);
});

gameEngine.addEventListener('laserFired', (event) => {
  const { laserPath, destroyedPieces } = event.data;
  renderer.renderLaser(laserPath, 1000);

  destroyedPieces.forEach(piece => {
    renderer.animatePieceDestruction(piece);
  });
});

// 4. 开始游戏
gameEngine.startGame();

// 5. 玩家操作示例
function onPieceClick(pieceId) {
  const validMoves = gameEngine.getValidMoves(pieceId);
  renderer.highlightValidMoves(validMoves);
}

function onCellClick(position) {
  if (selectedPiece) {
    const result = gameEngine.movePiece(selectedPiece.id, position);
    if (result.success) {
      selectedPiece = null;
      renderer.clearHighlights();
    } else {
      showError(result.error);
    }
  }
}

function onRotateClick(pieceId) {
  const result = gameEngine.rotatePiece(pieceId, true);
  if (result.success) {
    // 旋转成功
  }
}

function onFireLaserClick(turretId) {
  const result = gameEngine.fireLaser(turretId);
  if (result.success && result.gameEnded) {
    showGameResult(result.winner);
  }
}
```

## 性能要求

1. **响应时间**: 所有API调用必须在1ms内返回结果
2. **内存使用**: 游戏实例内存占用不超过1MB
3. **并发性**: 支持至少1000个游戏实例同时运行
4. **动画性能**: 激光动画和棋子移动动画保持60fps
5. **计算优化**: 激光路径计算在10ms内完成

## 测试覆盖

所有API都必须有以下测试覆盖：
- 单元测试：每个方法的正常流程和边界条件
- 集成测试：API之间的交互测试
- 性能测试：响应时间和内存使用测试
- 错误处理测试：各种错误情况的正确处理