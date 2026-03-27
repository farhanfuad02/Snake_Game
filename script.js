// ===========================
// Snake Game — Full Logic
// ===========================

(() => {
    'use strict';

    // ---- DOM Elements ----
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('high-score');
    const speedEl = document.getElementById('speed-display');
    const scoreCard = document.getElementById('score-card');
    const startScreen = document.getElementById('start-screen');
    const gameoverScreen = document.getElementById('gameover-screen');
    const pauseScreen = document.getElementById('pause-screen');
    const finalScoreEl = document.getElementById('final-score');
    const newHighEl = document.getElementById('new-high');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Difficulty buttons
    const diffEasy = document.getElementById('diff-easy');
    const diffMedium = document.getElementById('diff-medium');
    const diffHard = document.getElementById('diff-hard');

    // Mobile controls
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');

    // ---- Game Constants ----
    const GRID_SIZE = 20; // 20x20 grid
    const CELL_SIZE = canvas.width / GRID_SIZE; // 20px per cell

    const SPEED_MAP = {
        easy: 150,
        medium: 100,
        hard: 65
    };

    // Colors
    const COLORS = {
        bg: '#0d0d24',
        gridLine: 'rgba(0, 255, 136, 0.04)',
        snakeHead: '#00ff88',
        snakeBody: '#00cc6a',
        snakeBodyAlt: '#00b85c',
        snakeGlow: 'rgba(0, 255, 136, 0.4)',
        food: '#ff2d75',
        foodGlow: 'rgba(255, 45, 117, 0.5)',
        bonusFood: '#ffe600',
        bonusFoodGlow: 'rgba(255, 230, 0, 0.5)',
        eye: '#0a0a1a',
    };

    // ---- Game State ----
    let snake = [];
    let direction = { x: 1, y: 0 };
    let nextDirection = { x: 1, y: 0 };
    let food = null;
    let bonusFood = null;
    let bonusFoodTimer = 0;
    let score = 0;
    let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    let speed = 'easy';
    let gameInterval = null;
    let isRunning = false;
    let isPaused = false;
    let particles = [];
    let frameId = null;

    // ---- Initialization ----
    highScoreEl.textContent = highScore;

    // ---- Difficulty Selection ----
    const diffButtons = [diffEasy, diffMedium, diffHard];

    function setDifficulty(level) {
        speed = level;
        diffButtons.forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-speed="${level}"]`).classList.add('active');
    }

    diffEasy.addEventListener('click', () => setDifficulty('easy'));
    diffMedium.addEventListener('click', () => setDifficulty('medium'));
    diffHard.addEventListener('click', () => setDifficulty('hard'));

    // ---- Game Start / Restart ----
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    function startGame() {
        // Reset state
        snake = [
            { x: 5, y: 10 },
            { x: 4, y: 10 },
            { x: 3, y: 10 },
        ];
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
        score = 0;
        bonusFood = null;
        bonusFoodTimer = 0;
        particles = [];
        scoreEl.textContent = '0';
        speedEl.textContent = speed === 'easy' ? '1' : speed === 'medium' ? '2' : '3';

        // Hide overlays
        startScreen.classList.add('hidden');
        gameoverScreen.classList.add('hidden');
        pauseScreen.classList.add('hidden');
        newHighEl.style.display = 'none';

        spawnFood();
        isRunning = true;
        isPaused = false;

        // Clear any previous interval
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, SPEED_MAP[speed]);

        // Start render loop
        if (frameId) cancelAnimationFrame(frameId);
        renderLoop();
    }

    // ---- Spawn Food ----
    function spawnFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
        } while (isOnSnake(newFood) || (bonusFood && newFood.x === bonusFood.x && newFood.y === bonusFood.y));
        food = newFood;
    }

    function spawnBonusFood() {
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
        } while (isOnSnake(pos) || (pos.x === food.x && pos.y === food.y));
        bonusFood = pos;
        bonusFoodTimer = 50; // ticks until it disappears
    }

    function isOnSnake(pos) {
        return snake.some(seg => seg.x === pos.x && seg.y === pos.y);
    }

    // ---- Game Loop (logic tick) ----
    function gameLoop() {
        if (!isRunning || isPaused) return;

        // Apply direction
        direction = { ...nextDirection };

        // Calculate new head position
        const head = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y,
        };

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            gameOver();
            return;
        }

        // Self collision
        if (isOnSnake(head)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        // Check food
        let ate = false;
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            ate = true;
            spawnParticles(food.x, food.y, COLORS.food);
            spawnFood();

            // Chance to spawn bonus food every 5 points
            if (score % 50 === 0 && !bonusFood) {
                spawnBonusFood();
            }
        } else if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
            score += 30;
            ate = true;
            spawnParticles(bonusFood.x, bonusFood.y, COLORS.bonusFood);
            bonusFood = null;
            bonusFoodTimer = 0;
        } else {
            snake.pop();
        }

        if (ate) {
            scoreEl.textContent = score;
            scoreCard.classList.remove('score-pop');
            void scoreCard.offsetWidth; // force reflow
            scoreCard.classList.add('score-pop');
        }

        // Bonus food timer
        if (bonusFood) {
            bonusFoodTimer--;
            if (bonusFoodTimer <= 0) {
                bonusFood = null;
            }
        }
    }

    // ---- Game Over ----
    function gameOver() {
        isRunning = false;
        clearInterval(gameInterval);

        finalScoreEl.textContent = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreEl.textContent = highScore;
            newHighEl.style.display = 'block';
        }

        gameoverScreen.classList.remove('hidden');
    }

    // ---- Pause ----
    function togglePause() {
        if (!isRunning) return;
        isPaused = !isPaused;
        if (isPaused) {
            pauseScreen.classList.remove('hidden');
        } else {
            pauseScreen.classList.add('hidden');
        }
    }

    // ---- Particles ----
    function spawnParticles(gx, gy, color) {
        const cx = gx * CELL_SIZE + CELL_SIZE / 2;
        const cy = gy * CELL_SIZE + CELL_SIZE / 2;
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.5;
            const speed = 1.5 + Math.random() * 2.5;
            particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: color,
                size: 2 + Math.random() * 3,
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03;
            p.size *= 0.97;
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    // ---- Render Loop (60fps) ----
    function renderLoop() {
        draw();
        updateParticles();
        frameId = requestAnimationFrame(renderLoop);
    }

    function draw() {
        // Background
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        drawGrid();

        // Food
        drawFood();

        // Bonus Food
        if (bonusFood) {
            drawBonusFood();
        }

        // Snake
        drawSnake();

        // Particles
        drawParticles();
    }

    function drawGrid() {
        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= GRID_SIZE; i++) {
            const pos = i * CELL_SIZE;
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(canvas.width, pos);
            ctx.stroke();
        }
    }

    function drawSnake() {
        snake.forEach((seg, i) => {
            const x = seg.x * CELL_SIZE;
            const y = seg.y * CELL_SIZE;
            const radius = 4;

            // Glow for head
            if (i === 0) {
                ctx.shadowColor = COLORS.snakeGlow;
                ctx.shadowBlur = 15;
            } else {
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }

            // Gradient body
            const t = i / snake.length;
            const r = Math.round(0 + t * 10);
            const g = Math.round(255 - t * 60);
            const b = Math.round(136 - t * 40);
            ctx.fillStyle = i === 0 ? COLORS.snakeHead : `rgb(${r}, ${g}, ${b})`;

            // Rounded rectangle
            roundRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, radius);
            ctx.fill();

            // Eyes on head
            if (i === 0) {
                ctx.shadowBlur = 0;
                drawEyes(seg);
            }
        });

        ctx.shadowBlur = 0;
    }

    function drawEyes(head) {
        const cx = head.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = head.y * CELL_SIZE + CELL_SIZE / 2;
        const eyeSize = 2.5;
        const eyeOffset = 4;

        let ex1, ey1, ex2, ey2;

        if (direction.x === 1) { // right
            ex1 = cx + eyeOffset; ey1 = cy - 4;
            ex2 = cx + eyeOffset; ey2 = cy + 4;
        } else if (direction.x === -1) { // left
            ex1 = cx - eyeOffset; ey1 = cy - 4;
            ex2 = cx - eyeOffset; ey2 = cy + 4;
        } else if (direction.y === -1) { // up
            ex1 = cx - 4; ey1 = cy - eyeOffset;
            ex2 = cx + 4; ey2 = cy - eyeOffset;
        } else { // down
            ex1 = cx - 4; ey1 = cy + eyeOffset;
            ex2 = cx + 4; ey2 = cy + eyeOffset;
        }

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex1, ey1, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex2, ey2, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = COLORS.eye;
        ctx.beginPath();
        ctx.arc(ex1, ey1, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex2, ey2, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawFood() {
        const x = food.x * CELL_SIZE + CELL_SIZE / 2;
        const y = food.y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 2 - 2;

        // Pulsing glow
        const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 200);

        ctx.shadowColor = COLORS.foodGlow;
        ctx.shadowBlur = 15 * pulse;

        ctx.fillStyle = COLORS.food;
        ctx.beginPath();
        ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    function drawBonusFood() {
        const x = bonusFood.x * CELL_SIZE + CELL_SIZE / 2;
        const y = bonusFood.y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 2 - 1;

        const pulse = 0.8 + 0.2 * Math.sin(Date.now() / 150);

        // Outer glow ring
        ctx.strokeStyle = COLORS.bonusFoodGlow;
        ctx.lineWidth = 2;
        ctx.shadowColor = COLORS.bonusFoodGlow;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = COLORS.bonusFood;
        ctx.beginPath();
        ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Star shape inside
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.font = `${CELL_SIZE * 0.6}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', x, y + 1);
    }

    function drawParticles() {
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // ---- Input Handling ----
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W':
                if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
                e.preventDefault();
                break;
            case 'ArrowDown': case 's': case 'S':
                if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
                e.preventDefault();
                break;
            case 'ArrowLeft': case 'a': case 'A':
                if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
                e.preventDefault();
                break;
            case 'ArrowRight': case 'd': case 'D':
                if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
                e.preventDefault();
                break;
            case ' ':
                e.preventDefault();
                togglePause();
                break;
        }
    });

    // Mobile touch controls
    btnUp.addEventListener('click', () => {
        if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
    });
    btnDown.addEventListener('click', () => {
        if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
    });
    btnLeft.addEventListener('click', () => {
        if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
    });
    btnRight.addEventListener('click', () => {
        if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) < 20) return; // ignore small swipes

        if (absDx > absDy) {
            // Horizontal swipe
            if (dx > 0 && direction.x !== -1) nextDirection = { x: 1, y: 0 };
            else if (dx < 0 && direction.x !== 1) nextDirection = { x: -1, y: 0 };
        } else {
            // Vertical swipe
            if (dy > 0 && direction.y !== -1) nextDirection = { x: 0, y: 1 };
            else if (dy < 0 && direction.y !== 1) nextDirection = { x: 0, y: -1 };
        }
    }, { passive: true });

    // ---- Initial Draw ----
    draw();

})();
