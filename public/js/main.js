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

        // 绘制圆形底座
        ctx.fillStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制激光炮塔图标
        ctx.fillStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 2;

        // 炮塔主体
        const baseSize = radius * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, baseSize, 0, Math.PI * 2);
        ctx.fill();

        // 炮管
        const barrelLength = radius * 0.8;
        const barrelWidth = radius * 0.15;

        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction);

        ctx.beginPath();
        ctx.moveTo(0, -baseSize);
        ctx.lineTo(-barrelWidth/2, -baseSize - barrelLength);
        ctx.lineTo(barrelWidth/2, -baseSize - barrelLength);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // 中心发光点
        ctx.fillStyle = color === 'white' ? '#dc2626' : '#dc2626';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMirror(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座
        ctx.fillStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制镜子（45度角的对角线）
        ctx.fillStyle = color === 'white' ? '#60a5fa' : '#60a5fa';
        ctx.strokeStyle = color === 'white' ? '#1e40af' : '#1e40af';
        ctx.lineWidth = 2;

        const mirrorSize = radius * 0.7;

        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction);

        ctx.beginPath();
        ctx.moveTo(-mirrorSize/2, -mirrorSize/2);
        ctx.lineTo(mirrorSize/2, mirrorSize/2);
        ctx.lineTo(mirrorSize/2 + 4, mirrorSize/2);
        ctx.lineTo(mirrorSize/2, mirrorSize/2 - 4);
        ctx.lineTo(mirrorSize/2, mirrorSize/2);
        ctx.lineTo(-mirrorSize/2, -mirrorSize/2);
        ctx.lineTo(-mirrorSize/2, -mirrorSize/2 - 4);
        ctx.lineTo(-mirrorSize/2 + 4, -mirrorSize/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawShield(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座
        ctx.fillStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制盾牌（带弧度的六边形）
        ctx.fillStyle = color === 'white' ? '#10b981' : '#10b981';
        ctx.strokeStyle = color === 'white' ? '#059669' : '#059669';
        ctx.lineWidth = 2;

        const shieldSize = radius * 0.7;

        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction);

        ctx.beginPath();
        ctx.moveTo(0, -shieldSize);
        ctx.lineTo(-shieldSize * 0.8, -shieldSize * 0.3);
        ctx.lineTo(-shieldSize * 0.8, shieldSize * 0.3);
        ctx.lineTo(0, shieldSize);
        ctx.lineTo(shieldSize * 0.8, shieldSize * 0.3);
        ctx.lineTo(shieldSize * 0.8, -shieldSize * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 添加盾牌中央装饰
        ctx.fillStyle = color === 'white' ? '#059669' : '#059669';
        ctx.beginPath();
        ctx.arc(0, 0, shieldSize * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawSplitter(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座
        ctx.fillStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制分光器（钻石形状）
        ctx.fillStyle = color === 'white' ? '#a855f7' : '#a855f7';
        ctx.strokeStyle = color === 'white' ? '#7c3aed' : '#7c3aed';
        ctx.lineWidth = 2;

        const splitterSize = radius * 0.6;

        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction);

        ctx.beginPath();
        ctx.moveTo(0, -splitterSize);
        ctx.lineTo(-splitterSize * 0.7, 0);
        ctx.lineTo(0, splitterSize);
        ctx.lineTo(splitterSize * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 添加分光线条
        ctx.strokeStyle = color === 'white' ? '#7c3aed' : '#7c3aed';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-splitterSize * 0.5, -splitterSize * 0.5);
        ctx.moveTo(0, 0);
        ctx.lineTo(-splitterSize * 0.5, splitterSize * 0.5);
        ctx.moveTo(0, 0);
        ctx.lineTo(splitterSize * 0.5, -splitterSize * 0.5);
        ctx.moveTo(0, 0);
        ctx.lineTo(splitterSize * 0.5, splitterSize * 0.5);
        ctx.stroke();

        ctx.restore();
    }

    drawJumper(x, y, radius, color, direction) {
        const ctx = this.canvasContext;

        // 绘制底座
        ctx.fillStyle = color === 'white' ? '#f8fafc' : '#1e293b';
        ctx.strokeStyle = color === 'white' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制跳台（带箭头的圆环）
        ctx.fillStyle = color === 'white' ? '#f59e0b' : '#f59e0b';
        ctx.strokeStyle = color === 'white' ? '#d97706' : '#d97706';
        ctx.lineWidth = 2;

        const jumperSize = radius * 0.8;

        ctx.save();
        ctx.translate(x, y);
        this.rotateForDirection(ctx, direction);

        // 外环
        ctx.beginPath();
        ctx.arc(0, 0, jumperSize, 0, Math.PI * 2);
        ctx.stroke();

        // 内环
        ctx.beginPath();
        ctx.arc(0, 0, jumperSize * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        // 跳跃箭头
        ctx.fillStyle = color === 'white' ? '#d97706' : '#d97706';
        ctx.beginPath();
        ctx.moveTo(0, -jumperSize - 5);
        ctx.lineTo(-5, -jumperSize + 2);
        ctx.lineTo(5, -jumperSize + 2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, jumperSize + 5);
        ctx.lineTo(-5, jumperSize - 2);
        ctx.lineTo(5, jumperSize - 2);
        ctx.closePath();
        ctx.fill();

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
        // 根据方向旋转画布
        const rotations = {
            'up': 0,
            'down': 180,
            'left': 270,
            'right': 90,
            'up-right': 45,
            'up-left': 315,
            'down-right': 135,
            'down-left': 225,
            'vertical': 0,
            'horizontal': 90
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