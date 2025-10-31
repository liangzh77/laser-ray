# 激光棋初始棋子布局规范

**日期**: 2025-10-31
**版本**: 1.0
**状态**: 正式规范

## 棋盘坐标系统

- 列标记: a-g (从左到右)
- 行标记: 1-7 (从下到上)
- 白方位于棋盘下方(行1-2)
- 黑方位于棋盘上方(行6-7)

## 白方棋子布局

### 第1行 (白方后排)

| 位置 | 棋子类型 | 朝向 | 说明 |
|------|---------|------|------|
| a1 | 跳台 (Jumper) | 朝上 (up) | 正面向上,背面向下 |
| b1 | 分光器 (Splitter) | 朝左 (left) | 一个箭头向左,两个箭头向上下 |
| c1 | 盾牌 (Shield) | 朝左 (left) | 盾面朝左 |
| d1 | 炮塔 (Turret) | 朝上 (up) | 炮口朝上 |
| e1 | 盾牌 (Shield) | 朝右 (right) | 盾面朝右 |
| f1 | 分光器 (Splitter) | 朝右 (right) | 一个箭头向右,两个箭头向上下 |
| g1 | 跳台 (Jumper) | 朝上 (up) | 正面向上,背面向下 |

### 第2行 (白方前排)

| 位置 | 棋子类型 | 朝向 | 说明 |
|------|---------|------|------|
| a2 | 镜子 (Mirror) | 朝左 (left) | 镜面从左上到右下,正面向左 |
| b2 | 镜子 (Mirror) | 朝左 (left) | 镜面从左上到右下,正面向左 |
| c2 | 镜子 (Mirror) | 朝左 (left) | 镜面从左上到右下,正面向左 |
| d2 | 盾牌 (Shield) | 朝上 (up) | 盾面朝上 |
| e2 | 镜子 (Mirror) | 朝上 (up) | 镜面从左上到右下,正面向上 |
| f2 | 镜子 (Mirror) | 朝上 (up) | 镜面从左上到右下,正面向上 |
| g2 | 镜子 (Mirror) | 朝上 (up) | 镜面从左上到右下,正面向上 |

## 黑方棋子布局

### 第7行 (黑方后排)

| 位置 | 棋子类型 | 朝向 | 说明 |
|------|---------|------|------|
| a7 | 跳台 (Jumper) | 朝下 (down) | 正面向下,背面向上 |
| b7 | 分光器 (Splitter) | 朝左 (left) | 一个箭头向左,两个箭头向上下 |
| c7 | 盾牌 (Shield) | 朝左 (left) | 盾面朝左 |
| d7 | 炮塔 (Turret) | 朝下 (down) | 炮口朝下 |
| e7 | 盾牌 (Shield) | 朝右 (right) | 盾面朝右 |
| f7 | 分光器 (Splitter) | 朝右 (right) | 一个箭头向右,两个箭头向上下 |
| g7 | 跳台 (Jumper) | 朝下 (down) | 正面向下,背面向上 |

### 第6行 (黑方前排)

| 位置 | 棋子类型 | 朝向 | 说明 |
|------|---------|------|------|
| a6 | 镜子 (Mirror) | 朝下 (down) | 镜面从左上到右下,正面向下 |
| b6 | 镜子 (Mirror) | 朝下 (down) | 镜面从左上到右下,正面向下 |
| c6 | 镜子 (Mirror) | 朝下 (down) | 镜面从左上到右下,正面向下 |
| d6 | 盾牌 (Shield) | 朝下 (down) | 盾面朝下 |
| e6 | 镜子 (Mirror) | 朝右 (right) | 镜面从左上到右下,正面向右 |
| f6 | 镜子 (Mirror) | 朝右 (right) | 镜面从左上到右下,正面向右 |
| g6 | 镜子 (Mirror) | 朝右 (right) | 镜面从左上到右下,正面向右 |

## 方向编码规范

为了代码实现的一致性,采用以下方向编码:

```javascript
const DIRECTIONS = {
  UP: 'up',       // 0° - 向上
  RIGHT: 'right', // 90° - 向右
  DOWN: 'down',   // 180° - 向下
  LEFT: 'left'    // 270° - 向左
};
```

## 镜子朝向说明

镜子的视觉设计是固定的45度镜面(从左上到右下的对角线),但棋子本身有四个旋转方向。**棋子的"朝向"决定了镜面的有效反射面**:

- **朝上 (up)**: 镜面朝右上 - 可以反射来自上方和右方的激光
- **朝右 (right)**: 镜面朝右下 - 可以反射来自右方和下方的激光
- **朝下 (down)**: 镜面朝左下 - 可以反射来自下方和左方的激光
- **朝左 (left)**: 镜面朝左上 - 可以反射来自左方和上方的激光

镜面始终是从棋子左上到右下的斜线,但旋转棋子会改变哪一面是"正面"(有效反射面)。

## 数据结构示例

```javascript
// 初始化棋子数据
const INITIAL_SETUP = {
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
      { pos: 'd6', type: 'shield', direction: 'up' },
      { pos: 'e6', type: 'mirror', direction: 'right' },
      { pos: 'f6', type: 'mirror', direction: 'right' },
      { pos: 'g6', type: 'mirror', direction: 'right' }
    ]
  }
};
```

## 视觉布局示意图

```
  a    b    c    d    e    f    g
7 J↓  S←  D←  T↓  D→  S→  J↓   (黑方后排)
6 M↓  M↓  M↓  D↓  M→  M→  M→   (黑方前排)
5 --  --  --  --  --  --  --   (空)
4 --  --  --  --  --  --  --   (空)
3 --  --  --  --  --  --  --   (空)
2 M←  M←  M←  D↑  M↑  M↑  M↑   (白方前排)
1 J↑  S←  D←  T↑  D→  S→  J↑   (白方后排)

图例:
J = Jumper (跳台)
S = Splitter (分光器)
D = Shield (盾牌)
T = Turret (炮塔)
M = Mirror (镜子)
↑↓←→ = 朝向
```

## 设计原则

1. **对称性**: 黑白双方的棋子布局完全对称
2. **战略深度**: 前排镜子提供防御和反射能力,后排多样化棋子提供进攻和防守选项
3. **炮塔保护**: 炮塔位于中央(d列),周围有盾牌和分光器保护
4. **平衡性**: 每方都有相同数量和类型的棋子

## 棋子数量统计

每方各有14个棋子:
- 镜子 (Mirror): 6个
- 盾牌 (Shield): 3个
- 跳台 (Jumper): 2个
- 分光器 (Splitter): 2个
- 炮塔 (Turret): 1个

总计: 28个棋子

## 验证要点

实现时需要验证:
1. ✓ 所有棋子位置不重复
2. ✓ 所有棋子在有效范围内(a1-g7)
3. ✓ 黑白双方棋子数量相等
4. ✓ 每方都有且仅有一个炮塔
5. ✓ 所有朝向都是有效的四个方向之一
6. ✓ 布局关于棋盘中心线对称

## 更新记录

- 2025-10-31: 初始版本,定义完整的棋子初始布局规范
