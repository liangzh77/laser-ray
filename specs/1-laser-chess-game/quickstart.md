# 激光棋游戏快速开始指南

**版本**: 1.0.0
**日期**: 2025-10-26
**目标受众**: 开发者、测试人员

## 项目概述

激光棋是一个双人对战的网页棋类游戏，核心特色是激光物理引擎和策略元素。游戏采用纯前端技术栈，无需服务器支持。

**技术栈**: HTML5 + CSS3 + JavaScript ES2022
**测试框架**: Jest + Playwright
**部署**: 静态文件托管

## 快速启动

### 环境要求

- 现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+)
- Node.js 16+ (用于开发和测试)
- Git

### 本地开发设置

```bash
# 1. 克隆仓库
git clone <repository-url>
cd laser-ray

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
http://localhost:8080
```

### 构建和测试

```bash
# 运行单元测试
npm test

# 运行端到端测试
npm run test:e2e

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 游戏规则快速理解

### 基本规则

1. **棋盘**: 7×7网格，坐标从a1到g7
2. **玩家**: 白方和黑方，白方先手
3. **操作**: 每回合只能执行一个操作（移动、旋转或发射激光）
4. **胜利条件**: 击中对方激光炮塔或对方时间用尽

### 棋子类型

| 棋子 | 功能 | 特殊规则 |
|------|------|----------|
| **镜子** | 反射激光 | 从正确角度反射90°，错误角度会被摧毁 |
| **盾牌** | 阻挡激光 | 正面阻挡激光，侧面被击中会被摧毁 |
| **激光炮塔** | 发射激光 | 可以移动和旋转，被击中则游戏结束 |
| **跳台** | 跳跃障碍 | 激光跳过跳台和后方一格继续前进 |
| **分光器** | 分裂激光 | 激光分成两路，主激光消失 |

### 激光物理规则

- **反射**: 激光击中镜子产生90度反射
- **阻挡**: 盾牌正面完全阻挡激光
- **跳跃**: 跳台让激光跳过障碍
- **分光**: 分光器将激光分成两路

## 开发指南

### 项目结构

```
laser-ray/
├── src/
│   ├── core/                   # 游戏核心逻辑
│   │   ├── GameEngine.js       # 主游戏引擎
│   │   ├── PhysicsEngine.js    # 激光物理引擎
│   │   ├── StateManager.js     # 状态管理
│   │   └── EventBus.js         # 事件总线
│   ├── models/                 # 数据模型
│   │   ├── Board.js           # 棋盘模型
│   │   ├── Piece.js           # 棋子模型
│   │   ├── Laser.js           # 激光模型
│   │   └── Player.js          # 玩家模型
│   ├── ui/                     # UI层
│   │   ├── BoardRenderer.js   # 棋盘渲染器
│   │   ├── AnimationEngine.js # 动画引擎
│   │   └── UIController.js    # UI控制器
│   ├── utils/                  # 工具函数
│   │   ├── geometry.js        # 几何计算
│   │   └── validation.js      # 验证逻辑
│   └── main.js                 # 入口文件
├── tests/
│   ├── unit/                   # 单元测试
│   ├── integration/           # 集成测试
│   └── e2e/                   # 端到端测试
├── public/                     # 静态资源
│   ├── index.html
│   ├── css/
│   └── assets/
└── docs/                       # 文档
```

### 核心API使用

```javascript
// 初始化游戏
const gameEngine = new GameEngine();
const game = gameEngine.createGame({ timeMode: '10+0' });

// 设置渲染器
const canvas = document.getElementById('game-canvas');
const renderer = new BoardRenderer(canvas);

// 监听游戏事件
gameEngine.addEventListener('gameStarted', () => {
  renderer.renderBoard(game.board);
});

gameEngine.addEventListener('pieceMoved', (event) => {
  const { piece, from, to } = event.data;
  renderer.animatePieceMove(piece, from, to);
});

// 开始游戏
gameEngine.startGame();

// 移动棋子
function movePiece(pieceId, targetPosition) {
  const result = gameEngine.movePiece(pieceId, targetPosition);
  if (!result.success) {
    console.error('移动失败:', result.error);
  }
}

// 发射激光
function fireLaser(turretId) {
  const result = gameEngine.fireLaser(turretId);
  if (result.success) {
    console.log('激光发射成功，路径:', result.laserPath);
  }
}
```

### 添加新功能

1. **添加新棋子类型**:
```javascript
// 在Piece.js中添加新的棋子类型
class NewPieceType extends Piece {
  getInitialProperties() {
    return {
      // 定义新棋子的特殊属性
    };
  }
}

// 在PhysicsEngine.js中添加交互逻辑
calculateLaserInteraction(laser, piece) {
  if (piece.type === 'newPieceType') {
    // 实现新棋子的激光交互逻辑
  }
}
```

2. **添加新游戏模式**:
```javascript
// 在GameEngine.js中扩展游戏设置
class GameEngine {
  createGame(settings) {
    // 支持新的游戏模式设置
    if (settings.mode === 'newMode') {
      return this.createNewModeGame(settings);
    }
    return this.createStandardGame(settings);
  }
}
```

### 测试指南

#### 单元测试示例

```javascript
// tests/unit/PhysicsEngine.test.js
describe('PhysicsEngine', () => {
  let physicsEngine;
  let board;

  beforeEach(() => {
    physicsEngine = new PhysicsEngine();
    board = new Board({ width: 7, height: 7 });
  });

  describe('激光反射计算', () => {
    test('激光从正确角度击中镜子应产生90度反射', () => {
      const laser = new Laser({ x: 0, y: 0 }, 'right');
      const mirror = new Mirror({ x: 2, y: 0 }, '45deg');

      const result = physicsEngine.calculateReflection(laser, mirror);

      expect(result.direction).toBe('up');
      expect(result.position).toEqual({ x: 2, y: 0 });
    });
  });
});
```

#### 端到端测试示例

```javascript
// tests/e2e/game-flow.spec.js
test('完整游戏流程', async ({ page }) => {
  await page.goto('/');

  // 开始游戏
  await page.click('[data-testid="start-game"]');
  await expect(page.locator('[data-testid="board"]')).toBeVisible();

  // 移动棋子
  await page.click('[data-testid="piece-mirror-1"]');
  await page.click('[data-testid="position-b1"]');

  // 发射激光
  await page.click('[data-testid="turret-white"]');
  await page.click('[data-testid="fire-laser"]');

  // 验证游戏结束
  await expect(page.locator('[data-testid="game-result"]')).toBeVisible();
});
```

## 性能优化建议

### Canvas优化

```javascript
// 使用离屏Canvas预渲染静态元素
class OptimizedRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');

    this.preRenderStaticElements();
  }

  preRenderStaticElements() {
    // 预渲染棋盘网格等静态元素到离屏Canvas
  }

  render() {
    // 先绘制离屏Canvas内容
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    // 再绘制动态元素
    this.renderDynamicElements();
  }
}
```

### 游戏循环优化

```javascript
// 使用requestAnimationFrame确保流畅动画
class GameLoop {
  constructor() {
    this.lastTime = 0;
    this.dt = 1000 / 60; // 60 FPS
  }

  start(gameEngine) {
    const loop = (timestamp) => {
      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;

      // 固定时间步长更新
      if (deltaTime >= this.dt) {
        gameEngine.update(this.dt);
      }

      gameEngine.render();
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
```

## 常见问题

### Q: 如何调试激光物理计算？
A: 使用PhysicsEngine的调试模式：
```javascript
physicsEngine.enableDebugMode();
const result = physicsEngine.calculateLaserPath(start, direction, board);
console.log('激光路径:', result.path);
console.log('交互点:', result.interactions);
```

### Q: 如何添加自定义动画？
A: 扩展AnimationEngine：
```javascript
class CustomAnimation extends Animation {
  constructor(piece, targetState) {
    super();
    this.piece = piece;
    this.targetState = targetState;
  }

  update(progress) {
    // 实现自定义动画逻辑
  }
}

animationEngine.play(new CustomAnimation(piece, targetState));
```

### Q: 如何优化性能？
A: 1. 使用离屏Canvas预渲染
2. 减少重绘区域
3. 使用对象池管理棋子和激光对象
4. 避免频繁的垃圾回收

### Q: 如何支持移动设备？
A: 添加触摸事件支持：
```javascript
// 在UIController.js中添加触摸事件
class UIController {
  constructor() {
    this.addTouchSupport();
  }

  addTouchSupport() {
    const canvas = document.getElementById('game-canvas');

    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }
}
```

## 部署指南

### 静态文件部署

```bash
# 构建生产版本
npm run build

# 部署到任意静态文件服务器
# 例如：Netlify, Vercel, GitHub Pages, 或自己的服务器
```

### GitHub Pages部署示例

```bash
# 安装gh-pages
npm install --save-dev gh-pages

# 添加部署脚本到package.json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# 执行部署
npm run deploy
```

## 贡献指南

1. Fork仓库
2. 创建功能分支 (`git checkout -b feature/new-feature`)
3. 提交更改 (`git commit -am 'Add new feature'`)
4. 推送到分支 (`git push origin feature/new-feature`)
5. 创建Pull Request

### 代码规范

- 使用ES6+语法
- 遵循单一职责原则
- 编写单元测试
- 添加JSDoc注释
- 遵循项目已有的命名约定

## 支持

如需帮助，请：
1. 查看文档目录
2. 搜索现有Issues
3. 创建新Issue描述问题
4. 联系开发团队

**项目地址**: [GitHub Repository]
**文档**: [Documentation Site]
**反馈**: [Issue Tracker]