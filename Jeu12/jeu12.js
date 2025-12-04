// Variables du jeu
let gameActive = true;
let timeoutId;
let powerLevel = 0;
let isCharging = false;
let chargeInterval;

// Sons
const clockSound = new Audio('assets/clock.mp3');
const slapSound = new Audio('assets/slap.mp3');
const breakSound = new Audio('assets/break.mp3');

// Éléments DOM
const powerFill = document.getElementById('power-fill');
const powerPercentage = document.getElementById('power-percentage');
const wario = document.getElementById('wario');
const log = document.getElementById('log');
const logCracks = document.getElementById('log-cracks');
const instruction = document.getElementById('instruction');

// Initialisation du jeu
function initGame() {
    gameActive = true;
    powerLevel = 0;
    isCharging = false;
    
    // Réinitialiser les éléments
    powerFill.style.width = '0%';
    powerPercentage.textContent = '0%';
    wario.className = '';
    log.className = '';
    logCracks.classList.add('hidden');
    
    document.getElementById('game-over').classList.add('hidden');
    
    // Événements pour maintenir le clic
    document.addEventListener('mousedown', startCharging);
    document.addEventListener('mouseup', releaseAttack);
    document.addEventListener('touchstart', startCharging);
    document.addEventListener('touchend', releaseAttack);
    
    // Redémarrer le timer
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.animation = 'none';
    setTimeout(() => {
        timerBar.style.animation = 'timer-countdown 5s linear forwards';
    }, 10);
    
    // Timer de 5 secondes
    if (timeoutId) clearTimeout(timeoutId);
    
    // Jouer le son de l'horloge
    clockSound.currentTime = 0;
    clockSound.play();
    
    timeoutId = setTimeout(() => {
        if (gameActive) {
            gameActive = false;
            clockSound.pause();
            stopCharging();
            gameOver(false, "TEMPS ÉCOULÉ !");
        }
    }, 5000);
}

// Commencer à charger
function startCharging(e) {
    if (!gameActive || isCharging) return;
    
    e.preventDefault();
    isCharging = true;
    wario.classList.add('charging');
    instruction.textContent = 'RELÂCHE POUR FRAPPER !';
    
    // Augmenter progressivement la puissance
    chargeInterval = setInterval(() => {
        if (powerLevel < 100) {
            powerLevel += 2;
            updatePowerMeter();
        } else {
            // 100% atteint = la bûche tape Wario
            stopCharging();
            warioGetsHit();
        }
    }, 50);
}

// Relâcher l'attaque
function releaseAttack(e) {
    if (!gameActive || !isCharging) return;
    
    e.preventDefault();
    stopCharging();
    
    // Vérifier si la puissance est dans la zone de victoire (85-99%)
    if (powerLevel >= 85 && powerLevel < 100) {
        // VICTOIRE !
        attackLog(true);
    } else {
        // Trop faible
        attackLog(false);
    }
}

// Arrêter le chargement
function stopCharging() {
    isCharging = false;
    wario.classList.remove('charging');
    if (chargeInterval) {
        clearInterval(chargeInterval);
        chargeInterval = null;
    }
}

// Mettre à jour la barre de puissance
function updatePowerMeter() {
    powerFill.style.width = powerLevel + '%';
    powerPercentage.textContent = Math.floor(powerLevel) + '%';
    
    // Changer la couleur selon le niveau
    if (powerLevel >= 100) {
        powerPercentage.style.color = '#CF5E53';
    } else if (powerLevel >= 85) {
        powerPercentage.style.color = '#4CAF50';
    } else {
        powerPercentage.style.color = '#8E3F38';
    }
}

// Attaquer la bûche
function attackLog(success) {
    gameActive = false;
    clearTimeout(timeoutId);
    clockSound.pause();
    
    wario.classList.add('attacking');
    
    setTimeout(() => {
        if (success) {
            // La bûche se casse
            breakSound.play();
            log.classList.add('broken');
            logCracks.classList.remove('hidden');
            logCracks.textContent = '💥';
            
            setTimeout(() => {
                gameOver(true, 'GAGNÉ !');
            }, 500);
        } else {
            // Trop faible, échec
            gameOver(false, 'TROP FAIBLE !');
        }
    }, 300);
}

// Wario se fait frapper par la bûche
function warioGetsHit() {
    gameActive = false;
    clearTimeout(timeoutId);
    clockSound.pause();
    
    slapSound.play();
    wario.classList.add('hit');
    log.classList.add('broken');
    
    // Animation de la bûche qui tourne et frappe
    setTimeout(() => {
        gameOver(false, 'LA BÛCHE T\'A EU !');
    }, 500);
}

// Fin du jeu
function gameOver(isWin, message) {
    const gameOverDiv = document.getElementById('game-over');
    const resultMessage = document.getElementById('result-message');
    
    resultMessage.textContent = message;
    
    setTimeout(() => {
        gameOverDiv.classList.remove('hidden');
        
        // Redirection après 1.7 secondes
        setTimeout(() => {
            // Nettoyer les événements
            document.removeEventListener('mousedown', startCharging);
            document.removeEventListener('mouseup', releaseAttack);
            document.removeEventListener('touchstart', startCharging);
            document.removeEventListener('touchend', releaseAttack);
            
            if (isWin) {
                GameManager.onWin();
            } else {
                GameManager.onLose();
            }
        }, 1700);
    }, 300);
}

// Démarrer le jeu au chargement
window.addEventListener('load', () => {
    GameManager.displayScore();
    initGame();
});
