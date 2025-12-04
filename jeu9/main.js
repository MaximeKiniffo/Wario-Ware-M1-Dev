
let score = 0;
let speed = 2000;

const box = document.getElementById("game-box");
const target = document.getElementById("target");
const scoreDisplay = document.getElementById("score");

function popTarget() {
    const boxRect = box.getBoundingClientRect();

    const maxX = boxRect.width - 80;
    const maxY = boxRect.height - 80;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    target.style.left = x + "px";
    target.style.top = y + "px";
    target.style.display = "block";

    // Effet pop
    target.style.animation = "none";
    void target.offsetWidth;
    target.style.animation = "pop 0.2s ease-out";

    // ---- Détection bordure ----
    const margin = 40;

    resetBorders();

    if (x < margin) {
        box.style.borderLeftColor = "#ff0000";
    }
    if (x > maxX - margin) {
        box.style.borderRightColor = "#00aaff";
    }
    if (y < margin) {
        box.style.borderTopColor = "#00ff44";
    }
    if (y > maxY - margin) {
        box.style.borderBottomColor = "#ffaa00";
    }

    const timeout = setTimeout(gameOver, speed);

    target.onclick = () => {
        clearTimeout(timeout);
        score++;
        scoreDisplay.textContent = score;
        target.style.display = "none";

        speed = Math.max(250, speed - 40);

        setTimeout(popTarget, 200);
        if (score == 10) {
            GameManager.onWin()

        }
    };
}

function resetBorders() {
    box.style.borderLeftColor =
        box.style.borderRightColor =
        box.style.borderTopColor =
        box.style.borderBottomColor = "#ffffff55";
}

function gameOver() {
    alert("💀 Perdu ! Score final : " + score);
    setTimeout(() => {
        GameManager.onLose()
    }, 1000)
    // location.reload();
}

popTarget();

window.onload = () => {
    GameManager.displayScore()
}


