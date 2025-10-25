# laser-ray Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-26

## Active Technologies

- HTML5 + CSS3 + JavaScript ES2022 (1-laser-chess-game)
- Testing: Jest + Playwright (1-laser-chess-game)

## Project Structure

```text
src/
├── core/                   # 游戏核心逻辑
│   ├── GameEngine.js       # 主游戏引擎
│   ├── PhysicsEngine.js    # 激光物理引擎
│   ├── StateManager.js     # 状态管理
│   └── EventBus.js         # 事件总线
├── models/                 # 数据模型
│   ├── Board.js           # 棋盘模型
│   ├── Piece.js           # 棋子模型
│   ├── Laser.js           # 激光模型
│   └── Player.js          # 玩家模型
├── ui/                     # UI层
│   ├── BoardRenderer.js   # 棋盘渲染器
│   ├── AnimationEngine.js # 动画引擎
│   └── UIController.js    # UI控制器
├── utils/                  # 工具函数
│   ├── geometry.js        # 几何计算
│   └── validation.js      # 验证逻辑
└── main.js                 # 入口文件

tests/
├── unit/                   # 单元测试 (70%)
├── integration/           # 集成测试 (20%)
└── e2e/                   # 端到端测试 (10%)

public/
├── index.html
├── css/
└── assets/
```

## Commands

npm run dev          # Start development server
npm test             # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run build        # Build production version

## Code Style

JavaScript ES2022: Follow modern JavaScript conventions, use ES6 modules, prefer functional programming patterns

## Architecture Principles

- **TDD First**: Write failing tests before implementing features
- **No Hardcoding**: Use configuration-driven design
- **Clear Layering**: models → core → ui (unidirectional dependencies)
- **Error Handling**: Minimal but complete error handling
- **Performance Targets**: Laser physics <10ms, UI response <16ms

## Recent Changes

- 1-laser-chess-game: Added HTML5 + CSS3 + JavaScript ES2022 + Jest + Playwright
- Implemented modular architecture with Canvas 2D + CSS Grid rendering
- Defined comprehensive API contracts and data models

## Game-Specific Guidelines

### Canvas Rendering
- Use Canvas 2D for dynamic elements (laser animations, piece movements)
- Use CSS Grid for static board layout
- Implement offscreen canvas for performance optimization

### Game Logic
- Implement state machine pattern for game phases
- Use immutable state for game state management
- Follow dependency injection for testability

### Testing Focus
- Prioritize laser physics engine accuracy (99.9% target)
- Test all game state transitions
- Include cross-browser E2E testing

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
