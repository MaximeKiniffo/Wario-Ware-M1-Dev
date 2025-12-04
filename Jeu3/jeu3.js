
const GAME_DURATION = 10000;
const THRESHOLD = 160; 

let isPlaying = true;
let startTime;
let devToolsOpen = false;

const bug = document.getElementById('hidden-bug');
const timerBar = document.getElementById('timer-bar');
const winScreen = document.getElementById('win-screen');
const loseScreen = document.getElementById('lose-screen');

function startJitter(element) {
    if (element.jitterInterval) return;
    element.jitterInterval = setInterval(() => {
        const rotation = (Math.random() - 0.5) * 10;
        const scale = 1 + (Math.random() * 0.2 - 0.1); 
        element.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    }, 100);
}

function stopJitter(element) {
    if (element.jitterInterval) {
        clearInterval(element.jitterInterval);
        element.jitterInterval = null;
        element.style.transform = 'none';
    }
}

function startGame() {
    console.clear();            
    startTime = Date.now();
    placeBugRandomly();
    gameLoop();
}

function placeBugRandomly() {
    const x = Math.random() * (window.innerWidth - 80);
    const y = Math.random() * (window.innerHeight - 80);
    bug.style.left = x + 'px';
    bug.style.top = y + 'px';
}

function gameLoop() {
    if (!isPlaying) return;

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, GAME_DURATION - elapsed);
    const percentage = (remaining / GAME_DURATION) * 100;
    timerBar.style.width = percentage + "%";
    
    if (percentage < 30) {
        timerBar.style.backgroundColor = '#7B3F39'; 
    } else if (percentage < 60) {
        timerBar.style.backgroundColor = '#E57368'; 
    } else {
        timerBar.style.backgroundColor = '#A98356'; 
    }

    if (remaining <= 0) {
        gameOver(false);
        return;
    }

    // Détecter l'ouverture de Devtools
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (!devToolsOpen && (widthDiff > THRESHOLD || heightDiff > THRESHOLD)) {
        revealBug();
    }

    requestAnimationFrame(gameLoop);
}

function revealBug() {
    if (devToolsOpen) return; 
    devToolsOpen = true;
    
    bug.style.display = 'flex'; 
    startJitter(bug); 
    placeBugRandomly(); 
}

bug.addEventListener('click', () => {
    if (isPlaying) {
        gameOver(true);
    }
});

function gameOver(win) {
    isPlaying = false;
    stopJitter(bug);

    if (win) {
        winScreen.style.display = 'flex';
        
        setTimeout(() => {
            GameManager.onWin(); 
        }, 2000); 
        
    } else {
        loseScreen.style.display = 'flex';
        
        setTimeout(() => {
            GameManager.onLose();
        }, 2000);
    }
}

window.addEventListener('resize', () => {
    if(devToolsOpen && isPlaying) {
        placeBugRandomly(); 
    }
});

startGame();