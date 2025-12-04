const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const statusMessage = document.getElementById("statusMessage");
const timerDisplay = document.getElementById("timerDisplay");

const width = canvas.width;
const height = canvas.height;

// -------------------------
// CONFIG
// -------------------------
const BALL_RADIUS = 12;
const LAUNCH_POWER = 0.08;
const MAX_SPEED = 8;
const FRICTION = 0.999;
const GRAVITY = 0.25;
const TIME_LIMIT = 6;

// Couleurs du thème
const COLORS = {
    salmon: "#CF5E53",
    salmonLight: "#EC6A5F",
    cream: "#FFF1D2",
    deepBrown: "#6D4B27",
    richBrown: "#8E3F38",
    accentBrown: "#B47B41",
    sand: "#DAB289",
};

// -------------------------
// ÉTAT DU JEU
// -------------------------
const gameState = {
    ball: {
        x: width / 2,
        y: height - 40,
        vx: 0,
        vy: 0,
        radius: BALL_RADIUS,
        launched: false,
    },
    brick: {
        width: 120,
        height: 40,
        x: width / 2 - 60,
        y: 120,
        destroyed: false,
    },
    aiming: false,
    aimStart: null,
    aimCurrent: null,
    running: true,
    win: false,
    lose: false,
    startTime: performance.now(),
};

// -------------------------
// UTILITAIRES
// -------------------------
function resetGame() {
    gameState.ball.x = width / 2;
    gameState.ball.y = height - 40;
    gameState.ball.vx = 0;
    gameState.ball.vy = 0;
    gameState.ball.launched = false;
    gameState.aiming = false;
    gameState.aimStart = null;
    gameState.aimCurrent = null;
    gameState.brick.destroyed = false;
    gameState.running = true;
    gameState.win = false;
    gameState.lose = false;
    gameState.startTime = performance.now();
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
}

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// -------------------------
// ENTRÉES SOURIS
// -------------------------
function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: ((evt.clientX - rect.left) / rect.width) * canvas.width,
        y: ((evt.clientY - rect.top) / rect.height) * canvas.height,
    };
}

canvas.addEventListener("mousedown", (e) => {
    if (!gameState.running || gameState.ball.launched) return;

    const pos = getMousePos(e);
    if (
        distance(pos.x, pos.y, gameState.ball.x, gameState.ball.y) <=
        gameState.ball.radius + 5
    ) {
        gameState.aiming = true;
        gameState.aimStart = { x: gameState.ball.x, y: gameState.ball.y };
        gameState.aimCurrent = { x: pos.x, y: pos.y };
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (!gameState.aiming) return;
    const pos = getMousePos(e);
    gameState.aimCurrent = pos;
});

canvas.addEventListener("mouseup", () => {
    if (!gameState.aiming) return;

    const dx = gameState.aimStart.x - gameState.aimCurrent.x;
    const dy = gameState.aimStart.y - gameState.aimCurrent.y;

    let vx = dx * LAUNCH_POWER;
    let vy = dy * LAUNCH_POWER;

    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > MAX_SPEED) {
        const factor = MAX_SPEED / speed;
        vx *= factor;
        vy *= factor;
    }

    gameState.ball.vx = vx;
    gameState.ball.vy = vy;
    gameState.ball.launched = true;
    gameState.aiming = false;
    gameState.aimCurrent = null;
});

canvas.addEventListener("mouseleave", () => {
    if (gameState.aiming) {
        gameState.aiming = false;
        gameState.aimCurrent = null;
    }
});

// -------------------------
// LOGIQUE DU JEU
// -------------------------
function update(dt) {
    if (!gameState.running) return;

    const now = performance.now();
    const elapsed = (now - gameState.startTime) / 1000;
    const remaining = Math.max(0, TIME_LIMIT - elapsed);
    timerDisplay.textContent = `${remaining.toFixed(1)}s`;

    if (remaining <= 0 && !gameState.win) {
        gameState.running = false;
        gameState.lose = true;
        statusMessage.textContent = "Temps écoulé !";
        statusMessage.className = "status-message lose";
        
        // Redirection vers l'accueil après 1 seconde
        setTimeout(() => {
            GameManager.onLose();
        }, 1000);
        return;
    }

    const ball = gameState.ball;

    if (ball.launched) {
        ball.vy += GRAVITY * dt;
        ball.vx *= FRICTION;
        ball.vy *= FRICTION;

        ball.x += ball.vx * dt * 60;
        ball.y += ball.vy * dt * 60;

        // Sortie par les côtés (gauche ou droite) = défaite
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
            gameState.running = false;
            gameState.lose = true;
            statusMessage.textContent = "La boule est sortie !";
            statusMessage.className = "status-message lose";
            
            // Redirection vers l'accueil après 1 seconde
            setTimeout(() => {
                GameManager.onLose();
            }, 1000);
            return;
        }

        // Collision avec le haut
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy *= -1;
        }

        // Sortie par le bas
        if (ball.y - ball.radius > height) {
            gameState.running = false;
            gameState.lose = true;
            statusMessage.textContent = "La boule est tombée !";
            statusMessage.className = "status-message lose";
            
            // Redirection vers l'accueil après 1 seconde
            setTimeout(() => {
                GameManager.onLose();
            }, 1000);
        }

        // Collision brique
        const brick = gameState.brick;
        if (!brick.destroyed) {
            if (circleRectCollision(ball, brick)) {
                brick.destroyed = true;
                gameState.running = false;
                gameState.win = true;
                statusMessage.textContent = "Brique cassée ! Gagné !";
                statusMessage.className = "status-message win";
                
                // Redirection vers le jeu suivant après 1 seconde
                setTimeout(() => {
                    GameManager.onWin();
                }, 1000);
            }
        }
    }
}

function circleRectCollision(ball, brick) {
    const closestX = clamp(ball.x, brick.x, brick.x + brick.width);
    const closestY = clamp(ball.y, brick.y, brick.y + brick.height);

    const dx = ball.x - closestX;
    const dy = ball.y - closestY;

    const distSq = dx * dx + dy * dy;
    return distSq <= ball.radius * ball.radius;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// -------------------------
// RENDU
// -------------------------
function draw() {
    ctx.clearRect(0, 0, width, height);

    drawBackground();
    drawBrick();
    drawBall();

    if (gameState.aiming && gameState.aimStart && gameState.aimCurrent) {
        drawAimLine();
    }
}

function drawBackground() {
    // Sol
    ctx.fillStyle = COLORS.deepBrown;
    ctx.fillRect(0, height - 20, width, 20);

    // Ligne de départ
    ctx.strokeStyle = COLORS.accentBrown;
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, height - 60);
    ctx.lineTo(width - 40, height - 60);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawBrick() {
    const brick = gameState.brick;
    if (brick.destroyed) return;

    ctx.fillStyle = COLORS.salmon;
    ctx.strokeStyle = COLORS.richBrown;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 8);
    ctx.fill();
    ctx.stroke();

    // Texture
    ctx.strokeStyle = COLORS.deepBrown;
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
        const y = brick.y + (brick.height / 3) * i;
        ctx.beginPath();
        ctx.moveTo(brick.x + 8, y);
        ctx.lineTo(brick.x + brick.width - 8, y);
        ctx.stroke();
    }
}

function drawBall() {
    const ball = gameState.ball;
    
    const gradient = ctx.createRadialGradient(
        ball.x - 4,
        ball.y - 4,
        4,
        ball.x,
        ball.y,
        ball.radius
    );
    gradient.addColorStop(0, COLORS.cream);
    gradient.addColorStop(0.5, COLORS.sand);
    gradient.addColorStop(1, COLORS.accentBrown);

    ctx.fillStyle = gradient;
    ctx.strokeStyle = COLORS.richBrown;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function drawAimLine() {
    const start = gameState.aimStart;
    const current = gameState.aimCurrent;

    ctx.strokeStyle = COLORS.salmonLight;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 5]);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    ctx.setLineDash([]);

    // Flèche
    const dx = start.x - current.x;
    const dy = start.y - current.y;
    const angle = Math.atan2(dy, dx);

    const arrowLength = 18;
    const endX = start.x + Math.cos(angle) * 40;
    const endY = start.y + Math.sin(angle) * 40;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowLength * Math.cos(angle - Math.PI / 6),
        endY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        endX - arrowLength * Math.cos(angle + Math.PI / 6),
        endY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = COLORS.salmonLight;
    ctx.fill();
}

// -------------------------
// BOUCLE DE JEU
// -------------------------
let lastTime = performance.now();
function loop(timestamp) {
    const dt = (timestamp - lastTime) / 16.67;
    lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(loop);
}

// Clic pour rejouer
canvas.addEventListener("click", () => {
    if (!gameState.running) {
        resetGame();
    }
});

// Lancer le jeu
GameManager.displayScore();
resetGame();
requestAnimationFrame(loop);


// Afficher le score
if (typeof GameManager !== 'undefined' && GameManager.displayScore) {
    GameManager.displayScore();
}
