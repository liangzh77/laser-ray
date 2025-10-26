// 激光棋游戏 UI 演示脚本
class LaserChessUI {
    constructor() {
        this.currentScreen = 'main-menu';
        this.selectedGameMode = null;
        this.gameStarted = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.showScreen('main-menu');
        this.initializeDemoMode();
    }

    bindEvents() {
        // 主菜单事件
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectGameMode(e));
        });

        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('rules-btn').addEventListener('click', () => this.showRules());
        document.getElementById('close-rules').addEventListener('click', () => this.hideRules());

        // 游戏界面事件
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.backToMenu());
        document.getElementById('sound-btn').addEventListener('click', () => this.toggleSound());

        // 游戏结束界面事件
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.backToMenu());

        // 棋盘交互演示
        const canvas = document.getElementById('game-board');
        if (canvas) {
            this.initializeCanvas(canvas);
        }

        // 操作按钮演示
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAction(e));
        });
    }

    selectGameMode(e) {
        const mode = e.currentTarget.dataset.mode;

        // 更新选中状态
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        e.currentTarget.classList.add('selected');

        this.selectedGameMode = mode;

        // 启用开始按钮
        const startBtn = document.getElementById('start-game-btn');
        startBtn.disabled = false;

        // 更新按钮文本
        const modeNames = {
            '10+0': '快速对局',
            '15+10': '标准对局',
            'unlimited': '休闲对局'
        };
        startBtn.textContent = `开始${modeNames[mode]}`;
    }

    startGame() {
        if (!this.selectedGameMode) return;

        this.showScreen('game-screen');
        this.gameStarted = true;
        this.initializeGame();
    }

    initializeGame() {
        // 设置游戏模式显示
        document.getElementById('game-mode').textContent = this.selectedGameMode;

        // 初始化时间显示
        const timeDisplay = this.selectedGameMode === 'unlimited' ? '∞' : '10:00';
        document.getElementById('white-time').textContent = timeDisplay;
        document.getElementById('black-time').textContent = timeDisplay;

        // 启用操作按钮
        this.enableActionButtons();

        // 模拟游戏开始
        this.startTurnTimer();
        this.drawInitialBoard();
    }

    initializeCanvas(canvas) {
        const ctx = canvas.getContext('2d');

        // 设置固定画布尺寸
        canvas.width = 560;
        canvas.height = 560;
        canvas.style.width = '560px';
        canvas.style.height = '560px';

        this.canvasContext = ctx;
        this.cellSize = 80; // 560 / 7 = 80px per cell
    }

    drawInitialBoard() {
        const ctx = this.canvasContext;
        const cellSize = this.cellSize;

        // 绘制棋盘格子
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const isLight = (row + col) % 2 === 0;
                ctx.fillStyle = isLight ? '#e2e8f0' : '#475569';
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }

        // 绘制初始棋子（演示）
        this.drawDemoPieces();
    }

    drawDemoPieces() {
        const ctx = this.canvasContext;
        const cellSize = this.cellSize;

        // 按照你指定的初始位置摆放棋子
        // 白方棋子（第1-2排，row 0-1）
        const whitePieces = [
            // 第1排 (row 0): 从左到右
            { row: 0, col: 0, type: 'jumper', direction: 'vertical' },
            { row: 0, col: 1, type: 'splitter', direction: 'left' },
            { row: 0, col: 2, type: 'shield', direction: 'vertical' },
            { row: 0, col: 3, type: 'turret', direction: 'up' },
            { row: 0, col: 4, type: 'shield', direction: 'vertical' },
            { row: 0, col: 5, type: 'splitter', direction: 'right' },
            { row: 0, col: 6, type: 'jumper', direction: 'vertical' },
            // 第2排 (row 1): abc三个朝右上的镜子，d横向的盾，efg三个朝左上的镜子
            { row: 1, col: 0, type: 'mirror', direction: 'up-right' },
            { row: 1, col: 1, type: 'mirror', direction: 'up-right' },
            { row: 1, col: 2, type: 'mirror', direction: 'up-right' },
            { row: 1, col: 3, type: 'shield', direction: 'horizontal' },
            { row: 1, col: 4, type: 'mirror', direction: 'up-left' },
            { row: 1, col: 5, type: 'mirror', direction: 'up-left' },
            { row: 1, col: 6, type: 'mirror', direction: 'up-left' }
        ];

        // 黑方棋子（第6-7排，row 5-6）- 镜像对称布局
        const blackPieces = [
            // 第7排 (row 6): 从左到右（镜像）
            { row: 6, col: 0, type: 'jumper', direction: 'vertical' },
            { row: 6, col: 1, type: 'splitter', direction: 'right' },
            { row: 6, col: 2, type: 'shield', direction: 'vertical' },
            { row: 6, col: 3, type: 'turret', direction: 'down' },
            { row: 6, col: 4, type: 'shield', direction: 'vertical' },
            { row: 6, col: 5, type: 'splitter', direction: 'left' },
            { row: 6, col: 6, type: 'jumper', direction: 'vertical' },
            // 第6排 (row 5): abc三个朝左下的镜子，d横向的盾，efg三个朝右下的镜子
            { row: 5, col: 0, type: 'mirror', direction: 'down-left' },
            { row: 5, col: 1, type: 'mirror', direction: 'down-left' },
            { row: 5, col: 2, type: 'mirror', direction: 'down-left' },
            { row: 5, col: 3, type: 'shield', direction: 'horizontal' },
            { row: 5, col: 4, type: 'mirror', direction: 'down-right' },
            { row: 5, col: 5, type: 'mirror', direction: 'down-right' },
            { row: 5, col: 6, type: 'mirror', direction: 'down-right' }
        ];

        // 绘制白方棋子
        whitePieces.forEach(piece => {
            this.drawPieceWithDirection(piece.row, piece.col, piece.type, 'white', piece.direction);
        });

        // 绘制黑方棋子
        blackPieces.forEach(piece => {
            this.drawPieceWithDirection(piece.row, piece.col, piece.type, 'black', piece.direction);
        });
    }

    drawPieceWithDirection(row, col, type, color, direction) {
        const ctx = this.canvasContext;
        const cellSize = this.cellSize;
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        const radius = cellSize * 0.35;

        // 根据棋子类型绘制不同的几何图形
        switch (type) {
            case 'turret':
                this.drawTurret(x, y, radius, color, direction);
                break;
            case 'mirror':
                this.drawMirror(x, y, radius, color, direction);
                break;
            case 'shield':
                this.drawShield(x, y, radius, color, direction);
                break;
            case 'splitter':
                this.drawSplitter(x, y, radius, color, direction);
                break;
            case 'jumper':
                this.drawJumper(x, y, radius, color, direction);
                break;
            default:
                this.drawDefaultPiece(x, y, radius, color);
        }
    }

    drawTurret(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座（翻转颜色方案）
        ctx.fillStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.strokeStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制激光炮塔（方形基座 + 突出炮口设计）
        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction);

        const baseSize = radius * 0.7;
        const barrelLength = radius * 0.9;
        const barrelWidth = radius * 0.2;

        // 绘制方形基座（颜色更深，更明显）
        ctx.fillStyle = color === 'white' ? '#111827' : '#374151';
        ctx.strokeStyle = color === 'white' ? '#374151' : '#111827';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(-baseSize, -baseSize, baseSize * 2, baseSize * 2);
        ctx.fill();
        ctx.stroke();

        // 添加基座细节
        ctx.strokeStyle = color === 'white' ? '#6b7280' : '#9ca3af';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(-baseSize + 4, -baseSize + 4, baseSize * 2 - 8, baseSize * 2 - 8);
        ctx.stroke();

        // 绘制突出炮口（更明显、颜色更鲜艳）
        ctx.fillStyle = color === 'white' ? '#dc2626' : '#ef4444'; // 更鲜艳的红色
        ctx.strokeStyle = color === 'white' ? '#991b1b' : '#b91c1c';
        ctx.lineWidth = 2;

        ctx.beginPath();
        // 炮口基部（更宽，画在炮台上）
        ctx.moveTo(-barrelWidth * 0.8, -baseSize + 5); // 从炮台表面开始
        ctx.lineTo(-barrelWidth * 0.6, -baseSize - barrelLength * 0.3 + 5);
        ctx.lineTo(barrelWidth * 0.6, -baseSize - barrelLength * 0.3 + 5);
        ctx.lineTo(barrelWidth * 0.8, -baseSize + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 炮口尖端（更突出）
        ctx.beginPath();
        ctx.moveTo(-barrelWidth * 0.6, -baseSize - barrelLength * 0.3 + 5);
        ctx.lineTo(-barrelWidth * 0.4, -baseSize - barrelLength + 5);
        ctx.lineTo(0, -baseSize - barrelLength * 1.2 + 5); // 尖端更突出
        ctx.lineTo(barrelWidth * 0.4, -baseSize - barrelLength + 5);
        ctx.lineTo(barrelWidth * 0.6, -baseSize - barrelLength * 0.3 + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 添加炮口发光效果（更明亮）
        ctx.fillStyle = color === 'white' ? '#fca5a5' : '#fbbf24'; // 更明亮的发光
        ctx.beginPath();
        ctx.arc(0, -baseSize - barrelLength * 1.2 + 5, barrelWidth * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // 添加能量指示器
        ctx.strokeStyle = color === 'white' ? '#fbbf24' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, baseSize + 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // 中心发光核心（颜色翻转）
        ctx.fillStyle = color === 'white' ? '#fbbf24' : '#dc2626';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.12, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMirror(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座（翻转颜色方案）
        ctx.fillStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.strokeStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制镜子（45度镜面设计）
        ctx.save();
        ctx.translate(x, y);
        // 修正：镜子不需要额外旋转，保持固定的45度角
        // 方向只影响激光交互，不影响镜面视觉角度

        const mirrorLength = radius * 1.2; // 镜面长度，从左上到右下
        const mirrorThickness = radius * 0.15; // 镜面厚度

        // 绘制镜面背面（弧形）- 翻转颜色
        ctx.fillStyle = color === 'white' ? '#1e40af' : '#3b82f6';
        ctx.strokeStyle = color === 'white' ? '#60a5fa' : '#1e40af';
        ctx.lineWidth = 2;

        ctx.beginPath();
        // 创建固定的45度镜面（从左上到右下）
        ctx.moveTo(-mirrorLength/2, -mirrorLength/2);
        ctx.quadraticCurveTo(0, -mirrorLength/2 - mirrorThickness, mirrorLength/2, mirrorLength/2);
        ctx.lineTo(mirrorLength/2 - mirrorThickness/2, mirrorLength/2 - mirrorThickness/2);
        ctx.quadraticCurveTo(0, 0, -mirrorLength/2 + mirrorThickness/2, -mirrorLength/2 + mirrorThickness/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 绘制镜面正面（平的亮色边缘）
        ctx.strokeStyle = color === 'white' ? '#93c5fd' : '#60a5fa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-mirrorLength/2, -mirrorLength/2);
        ctx.lineTo(mirrorLength/2, mirrorLength/2);
        ctx.stroke();

        // 添加镜面高光效果
        ctx.strokeStyle = color === 'white' ? '#dbeafe' : '#93c5fd';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-mirrorLength/2 + 4, -mirrorLength/2 + 4);
        ctx.lineTo(mirrorLength/2 - 8, mirrorLength/2 - 8);
        ctx.stroke();

        ctx.restore();
    }

    drawShield(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座（翻转颜色方案）
        ctx.fillStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.strokeStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制盾牌（横向尖端设计，颜色翻转）
        ctx.fillStyle = color === 'white' ? '#059669' : '#10b981';
        ctx.strokeStyle = color === 'white' ? '#10b981' : '#059669';
        ctx.lineWidth = 3;

        const shieldWidth = radius * 0.55; // 宽度变小，高度变大
        const shieldHeight = radius * 1.0;

        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction);

        // 绘制盾牌主体（横向尖端，垂直对称）
        ctx.beginPath();
        // 上左弧形
        ctx.moveTo(-shieldWidth, 0);
        ctx.quadraticCurveTo(-shieldWidth * 0.8, -shieldHeight * 0.7, 0, -shieldHeight);
        // 上右弧形
        ctx.quadraticCurveTo(shieldWidth * 0.8, -shieldHeight * 0.7, shieldWidth, 0);
        // 下右弧形
        ctx.quadraticCurveTo(shieldWidth * 0.8, shieldHeight * 0.7, 0, shieldHeight);
        // 下左弧形
        ctx.quadraticCurveTo(-shieldWidth * 0.8, shieldHeight * 0.7, -shieldWidth, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 添加盾牌中央弧形装饰线（水平对称）
        ctx.strokeStyle = color === 'white' ? '#10b981' : '#059669';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-shieldWidth * 0.3, -shieldHeight * 0.3);
        ctx.quadraticCurveTo(-shieldWidth * 0.5, 0, -shieldWidth * 0.3, shieldHeight * 0.3);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(shieldWidth * 0.3, -shieldHeight * 0.3);
        ctx.quadraticCurveTo(shieldWidth * 0.5, 0, shieldWidth * 0.3, shieldHeight * 0.3);
        ctx.stroke();

        // 添加盾牌中央强化圆点
        ctx.fillStyle = color === 'white' ? '#065f46' : '#047857';
        ctx.strokeStyle = color === 'white' ? '#047857' : '#065f46';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawSplitter(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座（翻转颜色方案）
        ctx.fillStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.strokeStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制分光器（改进的三向箭头设计）
        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction);

        const splitterSize = radius * 0.8;
        const arrowLength = splitterSize * 0.7;
        const arrowWidth = 8;

        // 绘制中心圆形（分光器核心）- 翻转颜色
        ctx.fillStyle = color === 'white' ? '#7c3aed' : '#a855f7';
        ctx.strokeStyle = color === 'white' ? '#a855f7' : '#7c3aed';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, splitterSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制三个主要方向的箭头（上、左、右）- 翻转颜色
        ctx.fillStyle = color === 'white' ? '#6d28d9' : '#7c3aed';
        ctx.strokeStyle = color === 'white' ? '#5b21b6' : '#6d28d9';
        ctx.lineWidth = 2;

        // 向上箭头
        this.drawArrow(ctx, 0, -splitterSize * 0.3, 0, -arrowLength, arrowWidth);

        // 向左箭头
        this.drawArrow(ctx, -splitterSize * 0.3, 0, -arrowLength, 0, arrowWidth);

        // 向右箭头
        this.drawArrow(ctx, splitterSize * 0.3, 0, arrowLength, 0, arrowWidth);

        // 添加分光效果光晕
        ctx.strokeStyle = color === 'white' ? '#a855f7' : '#c084fc';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);

        // 三条分光线（更明显）
        ctx.beginPath();
        ctx.moveTo(0, -splitterSize * 0.3);
        ctx.lineTo(0, -splitterSize * 1.1);
        ctx.moveTo(-splitterSize * 0.3, 0);
        ctx.lineTo(-splitterSize * 1.1, 0);
        ctx.moveTo(splitterSize * 0.3, 0);
        ctx.lineTo(splitterSize * 1.1, 0);
        ctx.stroke();

        ctx.setLineDash([]);

        // 添加能量光点
        ctx.fillStyle = color === 'white' ? '#e9d5ff' : '#f3e8ff';
        const glowPositions = [
            {x: 0, y: -arrowLength},
            {x: -arrowLength, y: 0},
            {x: arrowLength, y: 0}
        ];
        glowPositions.forEach(pos => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    // 辅助方法：绘制箭头
    drawArrow(ctx, fromX, fromY, toX, toY, arrowWidth) {
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowLength = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);

        ctx.save();
        ctx.translate(fromX, fromY);
        ctx.rotate(angle);

        // 绘制箭头主体线
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(arrowLength, 0);
        ctx.stroke();

        // 绘制箭头头部
        ctx.beginPath();
        ctx.moveTo(arrowLength, 0);
        ctx.lineTo(arrowLength - arrowWidth, -arrowWidth/2);
        ctx.lineTo(arrowLength - arrowWidth, arrowWidth/2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawJumper(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座（翻转颜色方案）
        ctx.fillStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.strokeStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制跳台（椭圆主体 + 上下方向箭头设计）
        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction);

        const jumperWidth = radius * 0.85;
        const jumperHeight = radius * 0.45;

        // 绘制椭圆主体（颜色翻转）
        ctx.fillStyle = color === 'white' ? '#d97706' : '#f59e0b';
        ctx.strokeStyle = color === 'white' ? '#f59e0b' : '#d97706';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.ellipse(0, 0, jumperWidth, jumperHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 添加内部椭圆环（增加层次感）
        ctx.strokeStyle = color === 'white' ? '#fbbf24' : '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, jumperWidth * 0.7, jumperHeight * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 添加中心核心
        ctx.fillStyle = color === 'white' ? '#f97316' : '#ea580c';
        ctx.beginPath();
        ctx.ellipse(0, 0, jumperWidth * 0.3, jumperHeight * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // 绘制上下方向双向箭头
        ctx.fillStyle = color === 'white' ? '#92400e' : '#d97706';
        ctx.strokeStyle = color === 'white' ? '#78350f' : '#92400e';
        ctx.lineWidth = 2;

        // 上方向外箭头
        this.drawArrow(ctx, 0, -jumperHeight * 0.7, 0, -jumperHeight * 1.3, 6);
        // 上方向内箭头
        this.drawArrow(ctx, 0, -jumperHeight * 1.3, 0, -jumperHeight * 0.7, 6);

        // 下方向外箭头
        this.drawArrow(ctx, 0, jumperHeight * 0.7, 0, jumperHeight * 1.3, 6);
        // 下方向内箭头
        this.drawArrow(ctx, 0, jumperHeight * 1.3, 0, jumperHeight * 0.7, 6);

        // 添加跳跃轨迹线
        ctx.strokeStyle = color === 'white' ? '#fbbf24' : '#fbbf24';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);

        // 上方跳跃轨迹
        ctx.beginPath();
        ctx.moveTo(0, -jumperHeight * 1.4);
        ctx.lineTo(0, -jumperHeight * 2.0);
        ctx.stroke();

        // 下方跳跃轨迹
        ctx.beginPath();
        ctx.moveTo(0, jumperHeight * 1.4);
        ctx.lineTo(0, jumperHeight * 2.0);
        ctx.stroke();

        ctx.setLineDash([]);

        // 添加跳跃能量光点（上下对称）
        ctx.fillStyle = color === 'white' ? '#fef3c7' : '#fef3c7';
        const glowPoints = [
            {x: 0, y: -jumperHeight * 1.8},
            {x: 0, y: jumperHeight * 1.8}
        ];
        glowPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    drawDefaultPiece(x, y, radius, color) {
        // 默认棋子样式
        const ctx = this.canvasContext;

        ctx.fillStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.font = `${radius * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', x, y);
    }

    rotateForDirection(ctx, direction) {
        // 根据方向旋转画布（修正激光炮塔朝向）
        const rotations = {
            'up': 180,  // 修正：向上发射应该朝下（从炮塔视角）
            'down': 0,    // 修正：向下发射应该朝上
            'left': 90,   // 修正：向左发射应该朝右
            'right': 270, // 修正：向右发射应该朝左
            'up-right': 135,  // 修正：右上发射应朝左下
            'up-left': 225,  // 修正：左上发射应朝右下
            'down-right': 45,   // 修正：右下发射应朝左上
            'down-left': 315,  // 修正：左下发射应朝右上
            'vertical': 180,  // 垂直默认向下
            'horizontal': 90   // 水平默认向右
        };

        ctx.rotate((rotations[direction] || 0) * Math.PI / 180);
    }

    
    enableActionButtons() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = false;
        });
    }

    handleAction(e) {
        const action = e.currentTarget.id;

        // 清除所有激活状态
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 设置当前激活按钮
        e.currentTarget.classList.add('active');

        // 更新选中棋子信息
        this.updateSelectedPieceInfo(action);

        // 模拟操作效果
        this.simulateAction(action);
    }

    updateSelectedPieceInfo(action) {
        const pieceInfo = document.getElementById('selected-piece-info');
        const actionNames = {
            'move-btn': { type: '可移动棋子', position: 'a4', owner: '白方' },
            'rotate-btn': { type: '可旋转棋子', position: 'b3', owner: '白方' },
            'fire-laser-btn': { type: '激光炮塔', position: 'd1', owner: '白方' }
        };

        const info = actionNames[action];
        if (info) {
            pieceInfo.innerHTML = `
                <div class="piece-type">${info.type}</div>
                <div class="piece-position">位置: ${info.position}</div>
                <div class="piece-owner">所属: ${info.owner}</div>
            `;
        }
    }

    simulateAction(action) {
        if (action === 'fire-laser-btn') {
            this.animateLaser();
        } else if (action === 'move-btn' || action === 'rotate-btn') {
            this.animatePieceMove();
        }
    }

    animateLaser() {
        // 演示激光动画效果
        const ctx = this.canvasContext;
        const cellSize = this.cellSize;

        // 模拟激光路径
        const laserPath = [
            { x: 3.5 * cellSize, y: 0.5 * cellSize },
            { x: 3.5 * cellSize, y: 6.5 * cellSize }
        ];

        let progress = 0;
        const animateLaser = () => {
            if (progress <= 1) {
                // 清除之前的激光
                this.drawInitialBoard();

                // 绘制激光
                ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(laserPath[0].x, laserPath[0].y);
                ctx.lineTo(
                    laserPath[0].x + (laserPath[1].x - laserPath[0].x) * progress,
                    laserPath[0].y + (laserPath[1].y - laserPath[0].y) * progress
                );
                ctx.stroke();

                // 添加发光效果
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#dc2626';
                ctx.stroke();
                ctx.shadowBlur = 0;

                progress += 0.05;
                requestAnimationFrame(animateLaser);
            } else {
                // 动画结束后重绘棋盘
                setTimeout(() => this.drawInitialBoard(), 500);
            }
        };

        animateLaser();
    }

    animatePieceMove() {
        // 演示棋子移动动画
        this.drawInitialBoard();
    }

    startTurnTimer() {
        let seconds = 600; // 10分钟
        const updateTimer = () => {
            if (this.gameStarted) {
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                const display = `${minutes}:${secs.toString().padStart(2, '0')}`;

                document.getElementById('white-time').textContent = display;

                seconds--;
                if (seconds >= 0) {
                    setTimeout(updateTimer, 1000);
                }
            }
        };

        updateTimer();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    
    showRules() {
        document.getElementById('rules-modal').classList.add('active');
    }

    hideRules() {
        document.getElementById('rules-modal').classList.remove('active');
    }

    togglePause() {
        const btn = document.getElementById('pause-btn');
        const isPaused = btn.classList.contains('paused');

        if (isPaused) {
            btn.classList.remove('paused');
            btn.innerHTML = '<span class="btn-icon">⏸</span>暂停';
            this.startTurnTimer();
        } else {
            btn.classList.add('paused');
            btn.innerHTML = '<span class="btn-icon">▶</span>继续';
            // 暂停计时器
        }
    }

    restartGame() {
        if (confirm('确定要重新开始游戏吗？')) {
            this.gameStarted = false;
            this.initializeGame();
        }
    }

    backToMenu() {
        if (this.gameStarted && !confirm('确定要离开当前游戏吗？')) {
            return;
        }

        this.gameStarted = false;
        this.selectedGameMode = null;

        // 重置主菜单
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById('start-game-btn').disabled = true;
        document.getElementById('start-game-btn').textContent = '开始游戏';

        this.showScreen('main-menu');
    }

    toggleSound() {
        const btn = document.getElementById('sound-btn');
        const isMuted = !btn.classList.contains('active');

        if (isMuted) {
            btn.classList.remove('active');
            btn.innerHTML = '<span class="btn-icon">🔊</span>音效';
        } else {
            btn.classList.add('active');
            btn.innerHTML = '<span class="btn-icon">🔇</span>音效';
        }
    }

    playAgain() {
        this.showScreen('game-screen');
        this.restartGame();
    }

    initializeDemoMode() {
        // 添加一些演示用的交互提示
        console.log('激光棋游戏 UI 演示模式已启动');
        console.log('这是一个静态UI演示，展示游戏界面的设计和交互效果');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new LaserChessUI();
});

// 处理窗口大小变化
window.addEventListener('resize', () => {
    const canvas = document.getElementById('game-board');
    if (canvas && window.laserChessUI) {
        window.laserChessUI.initializeCanvas(canvas);
        window.laserChessUI.drawInitialBoard();
    }
});