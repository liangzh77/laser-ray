# Implementation Plan: Laser Chess Game

**Branch**: `1-laser-chess-game` | **Date**: 2025-10-26 | **Spec**: [./spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-laser-chess-game/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

基于规范说明，激光棋游戏是一个双人对战的网页棋类游戏，核心特色是激光物理引擎和策略元素。技术栈确定为简单HTML/CSS/JS，无需复杂框架。主要实现包括：7×7棋盘系统、5种棋子类型的激光交互逻辑、回合制操作机制、以及计时和胜负判定系统。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (无框架依赖)
**Primary Dependencies**: 仅浏览器原生API (Canvas, CSS Grid, Event Listeners)
**Storage**: 仅内存存储 (localStorage可选用于设置保存)
**Testing**: Jest (单元测试) + Playwright (端到端测试)
**Target Platform**: 现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+)
**Project Type**: 单页面Web应用 (SPA)
**Performance Goals**: 激光物理计算<10ms, UI响应<16ms (60fps), 页面加载<3s
**Constraints**: 离线运行, 无服务器依赖, 1000+并发游戏实例
**Scale/Scope**: 单局游戏, 本地存储, 实时交互

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**章程检查点**：
- [x] 测试驱动开发(TDD)原则是否遵循？ → ✅ 采用Jest+Playwright测试框架，测试金字塔结构
- [x] 是否存在硬编码值或魔法数字？ → ✅ 采用配置驱动设计，GAME_CONFIG集中管理
- [x] 代码架构是否清晰分层？ → ✅ 明确三层架构：models → core → ui，依赖注入
- [x] 错误处理机制是否完整？ → ✅ 定义最小化但完整的错误处理策略
- [x] 代码是否具备可维护性和可扩展性？ → ✅ 模块化设计，单一职责，事件驱动架构

## Project Structure

### Documentation (this feature)

```text
specs/1-laser-chess-game/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── game-api.md      # Game API contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

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
│   ├── models/            # 数据模型测试
│   ├── engines/           # 游戏引擎测试
│   └── utils/             # 工具函数测试
├── integration/           # 集成测试 (20%)
│   ├── game-flow/         # 游戏流程测试
│   └── physics/           # 物理引擎集成测试
└── e2e/                   # 端到端测试 (10%)
    ├── user-journey/      # 用户完整流程
    └── cross-browser/     # 跨浏览器测试

public/
├── index.html
├── css/
│   └── style.css
└── assets/
    └── images/
```

**Structure Decision**: 采用单页面Web应用架构，模块化JavaScript设计。选择Canvas 2D + CSS Grid混合渲染方案，确保性能和实现复杂度的平衡。测试采用金字塔结构：70%单元测试 + 20%集成测试 + 10%端到端测试。

## 核心系统设计

### 激光物理系统 (PhysicsEngine)

激光物理引擎是游戏的核心组件，负责处理激光与各种棋子的交互。最新设计包含以下交互规则：

#### 棋子交互机制
- **镜子**: 45°反射机制，从正面射入向右侧反射，从右侧射入向正面反射，从左侧和背面射入时镜子被摧毁
- **盾牌**: 正面和背面都能阻挡激光，从侧面入射时盾牌被摧毁
- **跳台**: 正面和背面入射时激光跳跃过跳台和后方一格继续前进，侧面入射时跳台被摧毁
- **分光器**: 正面和侧面入射时分光为两个新激光，背面入射时分光器被摧毁
- **激光炮塔**: 从任意方向被击中立即摧毁，触发游戏结束

#### 技术实现策略
- **路径计算**: 递归算法追踪激光路径，支持分光器产生的多束激光
- **性能优化**: 单次激光物理计算目标<10ms，使用空间分割算法优化碰撞检测
- **交互验证**: 每种棋子类型独立的交互逻辑类，便于测试和维护

### 棋子UI设计规范

基于最新规格要求，各棋子采用几何化UI设计：

- **镜子**: 左上到右下45°倾斜的矩形镜面，正面平整，背面弧形
- **盾牌**: 水平中心线对称的椭圆形，正面背面相同弧形设计，两侧尖锐
- **激光炮塔**: 方形基座配突出炮口，炮口朝向明确标识
- **跳台**: 椭圆形主体，左右两侧有双向箭头指示跳跃方向
- **分光器**: 中心点射出三个箭头（上、左、右），表示分光方向

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
