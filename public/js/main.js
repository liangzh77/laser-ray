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
        // 白方棋子（第1-2行在棋盘底部，Canvas row 6-5）
        const whitePieces = [
            // 第1行 (row 6，棋盘底部): a跳台↑, b分光器←, c盾牌←, d炮塔↑, e盾牌→, f分光器→, g跳台↑
            { row: 6, col: 0, type: 'jumper', direction: 'up' },
            { row: 6, col: 1, type: 'splitter', direction: 'left' },
            { row: 6, col: 2, type: 'shield', direction: 'left' },
            { row: 6, col: 3, type: 'turret', direction: 'up' },
            { row: 6, col: 4, type: 'shield', direction: 'right' },
            { row: 6, col: 5, type: 'splitter', direction: 'right' },
            { row: 6, col: 6, type: 'jumper', direction: 'up' },
            // 第2行 (row 5): abc镜子←, d盾牌↑, efg镜子↑
            { row: 5, col: 0, type: 'mirror', direction: 'left' },
            { row: 5, col: 1, type: 'mirror', direction: 'left' },
            { row: 5, col: 2, type: 'mirror', direction: 'left' },
            { row: 5, col: 3, type: 'shield', direction: 'up' },
            { row: 5, col: 4, type: 'mirror', direction: 'up' },
            { row: 5, col: 5, type: 'mirror', direction: 'up' },
            { row: 5, col: 6, type: 'mirror', direction: 'up' }
        ];

        // 黑方棋子（第6-7行在棋盘顶部，Canvas row 1-0）
        const blackPieces = [
            // 第7行 (row 0，棋盘顶部): a跳台↓, b分光器←, c盾牌←, d炮塔↓, e盾牌→, f分光器→, g跳台↓
            { row: 0, col: 0, type: 'jumper', direction: 'down' },
            { row: 0, col: 1, type: 'splitter', direction: 'left' },
            { row: 0, col: 2, type: 'shield', direction: 'left' },
            { row: 0, col: 3, type: 'turret', direction: 'down' },
            { row: 0, col: 4, type: 'shield', direction: 'right' },
            { row: 0, col: 5, type: 'splitter', direction: 'right' },
            { row: 0, col: 6, type: 'jumper', direction: 'down' },
            // 第6行 (row 1): abc镜子↓, d盾牌↑, efg镜子→
            { row: 1, col: 0, type: 'mirror', direction: 'down' },
            { row: 1, col: 1, type: 'mirror', direction: 'down' },
            { row: 1, col: 2, type: 'mirror', direction: 'down' },
            { row: 1, col: 3, type: 'shield', direction: 'up' },
            { row: 1, col: 4, type: 'mirror', direction: 'right' },
            { row: 1, col: 5, type: 'mirror', direction: 'right' },
            { row: 1, col: 6, type: 'mirror', direction: 'right' }
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

        // 绘制底座（白方用浅色，黑方用深色）
        ctx.fillStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制激光炮塔（方形基座 + 突出炮口设计）
        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction, 'turret');

        const baseSize = radius * 0.7;
        const barrelLength = radius * 0.9;
        const barrelWidth = radius * 0.2;

        // 绘制方形基座（黑白图案）
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(-baseSize, -baseSize, baseSize * 2, baseSize * 2);
        ctx.fill();
        ctx.stroke();

        // 添加基座细节 - 黑白图案
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(-baseSize + 4, -baseSize + 4, baseSize * 2 - 8, baseSize * 2 - 8);
        ctx.stroke();

        // 绘制炮口（从中心画出去，更明显，黑白图案）
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        // 炮口从中心开始，向负Y方向（向上）延伸
        ctx.moveTo(-barrelWidth * 0.5, 0);
        ctx.lineTo(-barrelWidth * 0.8, -barrelLength * 0.3);
        ctx.lineTo(-barrelWidth * 0.6, -barrelLength * 0.7);
        ctx.lineTo(-barrelWidth * 0.3, -barrelLength);
        ctx.lineTo(0, -barrelLength * 1.2);
        ctx.lineTo(barrelWidth * 0.3, -barrelLength);
        ctx.lineTo(barrelWidth * 0.6, -barrelLength * 0.7);
        ctx.lineTo(barrelWidth * 0.8, -barrelLength * 0.3);
        ctx.lineTo(barrelWidth * 0.5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 添加炮口内部细节线
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-barrelWidth * 0.3, 0);
        ctx.lineTo(0, -barrelLength * 0.9);
        ctx.lineTo(barrelWidth * 0.3, 0);
        ctx.stroke();

        // 添加能量指示器 - 黑白图案
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, baseSize + 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // 中心发光核心 - 黑白图案
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.12, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMirror(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座（白方用浅色，黑方用深色）
        ctx.fillStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制镜子（45度镜面设计,根据方向旋转）
        ctx.save();
        ctx.translate(x, y);

        // 根据方向旋转镜子
        // 基础镜面是从左上到右下的45度斜线
        // up: 镜面朝右上, right: 镜面朝右下, down: 镜面朝左下, left: 镜面朝左上
        this.rotateForDirection(ctx, direction, 'mirror');

        const mirrorLength = radius * 1.2; // 镜面长度，从左上到右下
        const mirrorThickness = radius * 0.15; // 镜面厚度

        // 绘制镜面背面（弧形）- 黑白图案
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
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

        // 绘制镜面正面（平的亮色边缘）- 黑白图案
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-mirrorLength/2, -mirrorLength/2);
        ctx.lineTo(mirrorLength/2, mirrorLength/2);
        ctx.stroke();

        // 添加镜面高光效果 - 黑白图案
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-mirrorLength/2 + 4, -mirrorLength/2 + 4);
        ctx.lineTo(mirrorLength/2 - 8, mirrorLength/2 - 8);
        ctx.stroke();

        ctx.restore();
    }

    drawShield(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座（白方用浅色，黑方用深色）
        ctx.fillStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制盾牌（纵向尖端设计，黑白图案）
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 3;

        const shieldWidth = radius * 1.0; // 宽度
        const shieldHeight = radius * 0.55; // 高度

        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction, 'shield');

        // 绘制盾牌主体（纵向尖端，水平对称）
        ctx.beginPath();
        // 左上弧形
        ctx.moveTo(0, -shieldHeight);
        ctx.quadraticCurveTo(-shieldWidth * 0.7, -shieldHeight * 0.8, -shieldWidth, 0);
        // 左下弧形
        ctx.quadraticCurveTo(-shieldWidth * 0.7, shieldHeight * 0.8, 0, shieldHeight);
        // 右下弧形
        ctx.quadraticCurveTo(shieldWidth * 0.7, shieldHeight * 0.8, shieldWidth, 0);
        // 右上弧形
        ctx.quadraticCurveTo(shieldWidth * 0.7, -shieldHeight * 0.8, 0, -shieldHeight);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 添加盾牌中央弧形装饰线（垂直对称）- 黑白图案
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-shieldWidth * 0.3, -shieldHeight * 0.3);
        ctx.quadraticCurveTo(0, -shieldHeight * 0.5, shieldWidth * 0.3, -shieldHeight * 0.3);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(shieldWidth * 0.3, -shieldHeight * 0.3);
        ctx.quadraticCurveTo(shieldWidth * 0.5, 0, shieldWidth * 0.3, shieldHeight * 0.3);
        ctx.stroke();

        // 添加盾牌中央强化圆点 - 黑白图案
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawSplitter(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座（白方用浅色，黑方用深色）
        ctx.fillStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制分光器（改进的三向箭头设计）
        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction, 'splitter');

        const splitterSize = radius * 0.8;
        const arrowLength = splitterSize * 0.7;
        const arrowWidth = 8;

        // 绘制中心圆形（分光器核心）- 黑白图案
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, splitterSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制三个主要方向的箭头（上、左、右）- 黑白图案
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 2;

        // 向上箭头
        this.drawArrow(ctx, 0, -splitterSize * 0.3, 0, -arrowLength, arrowWidth);

        // 向左箭头
        this.drawArrow(ctx, -splitterSize * 0.3, 0, -arrowLength, 0, arrowWidth);

        // 向右箭头
        this.drawArrow(ctx, splitterSize * 0.3, 0, arrowLength, 0, arrowWidth);

        // 绘制粗实线指示方向 - 更明显
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 4;  // 粗实线

        // 三条分光线（实线，更明显）
        ctx.beginPath();
        ctx.moveTo(0, -splitterSize * 0.3);
        ctx.lineTo(0, -splitterSize * 1.2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-splitterSize * 0.3, 0);
        ctx.lineTo(-splitterSize * 1.2, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(splitterSize * 0.3, 0);
        ctx.lineTo(splitterSize * 1.2, 0);
        ctx.stroke();

        // 在每条线的末端画大三角形箭头指示方向
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        const triangleSize = 8;

        // 向上的三角形
        ctx.beginPath();
        ctx.moveTo(0, -splitterSize * 1.25);
        ctx.lineTo(-triangleSize, -splitterSize * 1.25 + triangleSize);
        ctx.lineTo(triangleSize, -splitterSize * 1.25 + triangleSize);
        ctx.closePath();
        ctx.fill();

        // 向左的三角形
        ctx.beginPath();
        ctx.moveTo(-splitterSize * 1.25, 0);
        ctx.lineTo(-splitterSize * 1.25 + triangleSize, -triangleSize);
        ctx.lineTo(-splitterSize * 1.25 + triangleSize, triangleSize);
        ctx.closePath();
        ctx.fill();

        // 向右的三角形
        ctx.beginPath();
        ctx.moveTo(splitterSize * 1.25, 0);
        ctx.lineTo(splitterSize * 1.25 - triangleSize, -triangleSize);
        ctx.lineTo(splitterSize * 1.25 - triangleSize, triangleSize);
        ctx.closePath();
        ctx.fill();

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

        // 绘制底座（白方用浅色，黑方用深色）
        ctx.fillStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制跳台（椭圆主体 + 上下方向箭头设计）
        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction, 'jumper');

        const jumperWidth = radius * 0.85;
        const jumperHeight = radius * 0.45;

        // 绘制椭圆主体（黑白图案）
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.ellipse(0, 0, jumperWidth, jumperHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 添加内部椭圆环（增加层次感）- 黑白图案
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, jumperWidth * 0.7, jumperHeight * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 添加中心核心 - 黑白图案
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 0, jumperWidth * 0.3, jumperHeight * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // 绘制上下方向双向箭头 - 黑白图案
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
        ctx.lineWidth = 2;

        // 上方向外箭头
        this.drawArrow(ctx, 0, -jumperHeight * 0.7, 0, -jumperHeight * 1.3, 6);
        // 上方向内箭头
        this.drawArrow(ctx, 0, -jumperHeight * 1.3, 0, -jumperHeight * 0.7, 6);

        // 下方向外箭头
        this.drawArrow(ctx, 0, jumperHeight * 0.7, 0, jumperHeight * 1.3, 6);
        // 下方向内箭头
        this.drawArrow(ctx, 0, jumperHeight * 1.3, 0, jumperHeight * 0.7, 6);

        // 添加跳跃轨迹线 - 黑白图案
        ctx.strokeStyle = color === 'white' ? '#000000' : '#ffffff';
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

        // 添加跳跃能量光点（上下对称）- 黑白图案
        ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
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

        // 白方用浅色，黑方用深色
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

    rotateForDirection(ctx, direction, pieceType) {
        // 根据方向和棋子类型旋转画布
        // 不同棋子有不同的基础形状,需要不同的旋转规则

        let rotation = 0;

        if (pieceType === 'mirror') {
            // 镜子: 基础镜面从左上到右下，所有方向+90°
            const mirrorRotations = {
                'left': 90,    // 镜面朝左上 -> 向右旋转90°
                'up': 180,     // 镜面朝右上 -> 向右旋转90°
                'right': -90,  // 镜面朝右下 -> 向右旋转90° (270° = -90°)
                'down': 0,     // 镜面朝左下 -> 向右旋转90°
            };
            rotation = mirrorRotations[direction] || 0;
        } else {
            // 其他棋子: 标准旋转(基础形状朝上)
            const standardRotations = {
                'up': 0,       // 朝上,不旋转
                'right': 90,   // 朝右,顺时针90°
                'down': 180,   // 朝下,旋转180°
                'left': -90,   // 朝左,逆时针90°
            };
            rotation = standardRotations[direction] || 0;
        }

        ctx.rotate(rotation * Math.PI / 180);
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