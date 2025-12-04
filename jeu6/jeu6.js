
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const messageEl = document.getElementById('message');

let player = { x: 175, y: 450, width: 50, height: 50 };
let obstacles = [];
let score = 0;
let timeLeft = 5;
let gameRunning = false;
let gameLoop;
let timerInterval;
let spawnInterval;
let difficulty = 1;

// Controles clavier
let keys = { left: false, right: false };

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
});

// Controle souris
canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - player.width / 2;
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
});

function spawnObstacle() {
    const size = 30 + Math.random() * 30;
    obstacles.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: 3 + Math.random() * 2 * difficulty,
        color: `hsl(${Math.random() * 60}, 100%, 50%)`
    });
}

function drawPlayer() {
    // Corps
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.arc(player.x + 25, player.y + 25, 25, 0, Math.PI * 2);
    ctx.fill();

    // Yeux
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x + 18, player.y + 20, 6, 0, Math.PI * 2);
    ctx.arc(player.x + 32, player.y + 20, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x + 18, player.y + 20, 3, 0, Math.PI * 2);
    ctx.arc(player.x + 32, player.y + 20, 3, 0, Math.PI * 2);
    ctx.fill();

    // Sourire
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x + 25, player.y + 28, 10, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
}

function drawObstacle(obs) {
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    // Effet 3D
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(obs.x + 5, obs.y + 5, obs.width - 5, obs.height - 5);
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width - 5, obs.height - 5);

    // Visage mechant
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(obs.x + obs.width * 0.3, obs.y + obs.height * 0.4, 4, 0, Math.PI * 2);
    ctx.arc(obs.x + obs.width * 0.7, obs.y + obs.height * 0.4, 4, 0, Math.PI * 2);
    ctx.fill();
}

function checkCollision(obs) {
    const playerRadius = 20;
    const playerCenterX = player.x + 25;
    const playerCenterY = player.y + 25;

    const closestX = Math.max(obs.x, Math.min(playerCenterX, obs.x + obs.width));
    const closestY = Math.max(obs.y, Math.min(playerCenterY, obs.y + obs.height));

    const distanceX = playerCenterX - closestX;
    const distanceY = playerCenterY - closestY;

    return (distanceX * distanceX + distanceY * distanceY) < (playerRadius * playerRadius);
}

function update() {
    // Mouvement clavier
    if (keys.left) player.x -= 8;
    if (keys.right) player.x += 8;
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += obstacles[i].speed;

        if (checkCollision(obstacles[i])) {
            gameOver();
            return;
        }

        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            score += 10;
            scoreEl.textContent = score;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fond avec etoiles
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
        ctx.fillRect(
            (i * 73) % canvas.width,
            (i * 91 + Date.now() / 50) % canvas.height,
            2, 2
        );
    }

    obstacles.forEach(drawObstacle);
    drawPlayer();
}

function gameStep() {
    update();
    draw();
    if (gameRunning) {
        gameLoop = requestAnimationFrame(gameStep);
    }
}

function startGame() {
    score = 0;
    timeLeft = 5;
    obstacles = [];
    difficulty = 10;
    player.x = 175;
    gameRunning = true;

    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;
    messageEl.textContent = '';
    startBtn.style.display = 'none';

    timerInterval = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;
        difficulty = 10 + (30 - timeLeft) / 15;

        if (timeLeft <= 0) {
            victory();
        }
    }, 1000);

    spawnInterval = setInterval(spawnObstacle, 800);
    gameStep();
}

function gameOver() {
    endGame();
    messageEl.textContent = 'GAME OVER! Score: ' + score;
    messageEl.style.color = '#ff6b6b';
    GameManager.onLose();
}

function victory() {
    endGame();
    messageEl.textContent = 'VICTOIRE! Score: ' + score;
    messageEl.style.color = '#4ecdc4';
    GameManager.onWin();
}

function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    clearInterval(spawnInterval);
    cancelAnimationFrame(gameLoop);
    startBtn.style.display = 'inline-block';
    startBtn.textContent = 'REJOUER';
}

startBtn.addEventListener('click', startGame);

// Dessin initial
draw();
GameManager.displayScore();