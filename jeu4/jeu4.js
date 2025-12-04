// Variables du jeu
let correctDoorIndex;
let gameActive = true;
let timeoutId;
let distinctiveSign; // 0: poignée, 1: bordure, 2: croix

// Sons du jeu
const doorSound = new Audio('assets/GrincementPorte.mp3');
const winSound = new Audio('assets/YeahWario.mp3');
const explodeSound = new Audio('assets/Explode.mp3');
const clockSound = new Audio('assets/clock.mp3');

// Initialisation du jeu
function initGame() {
    gameActive = true;
    
    // Réinitialiser le personnage
    const character = document.getElementById('character');
    character.className = '';
    character.textContent = '🧍';
    character.style.bottom = '10%';
    character.style.left = '50%';
    
    // Réinitialiser les portes
    const doors = document.querySelectorAll('.door');
    doors.forEach(door => {
        door.className = 'door';
        door.style.order = '';
        const handle = door.querySelector('.door-handle');
        const frame = door.querySelector('.door-frame');
        const mark = door.querySelector('.door-mark');
        handle.classList.remove('correct-handle');
        frame.classList.remove('correct-border');
        mark.textContent = '';
    });
    
    // Cacher le game over
    document.getElementById('game-over').classList.add('hidden');
    
    // Mélanger les portes aléatoirement
    shuffleDoors();
    
    // Choisir une porte gagnante aléatoire
    correctDoorIndex = Math.floor(Math.random() * 3);
    
    // Choisir un signe distinctif aléatoire (0: poignée, 1: bordure, 2: croix)
    distinctiveSign = Math.floor(Math.random() * 3);
    
    // Placer les symboles et le signe distinctif
    doors.forEach((door, index) => {
        const symbol = door.querySelector('.door-symbol');
        const handle = door.querySelector('.door-handle');
        const frame = door.querySelector('.door-frame');
        const mark = door.querySelector('.door-mark');
        
        if (index === correctDoorIndex) {
            symbol.className = 'door-symbol circle';
            
            // Appliquer le signe distinctif selon le type choisi
            if (distinctiveSign === 0) {
                // Poignée légèrement orange
                handle.classList.add('correct-handle');
            } else if (distinctiveSign === 1) {
                // Bordure légèrement différente
                frame.classList.add('correct-border');
            } else {
                // Petite croix discrète avec position aléatoire
                mark.textContent = '✕';
                // Position aléatoire entre 20% et 70% pour top et left
                const randomTop = 20 + Math.random() * 50;
                const randomLeft = 20 + Math.random() * 50;
                mark.style.top = randomTop + '%';
                mark.style.left = randomLeft + '%';
            }
        } else {
            symbol.className = 'door-symbol cross';
        }
    });
    
    // Ajouter les événements de clic
    doors.forEach((door, index) => {
        door.onclick = () => handleDoorClick(index);
    });
    
    // Redémarrer le timer
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.animation = 'none';
    setTimeout(() => {
        timerBar.style.animation = 'timer-countdown 5s linear forwards';
        // Démarrer le son du timer
        clockSound.currentTime = 0;
        clockSound.play();
    }, 10);
    
    // Timer de 5 secondes
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        if (gameActive) {
            gameActive = false; // Désactiver le jeu immédiatement
            // Arrêter le son du timer
            clockSound.pause();
            clockSound.currentTime = 0;
            // Exploser le personnage
            explodeCharacter();
            setTimeout(() => {
                gameOver(false);
            }, 600);
        }
    }, 5000);
}

// Mélanger l'ordre des portes
function shuffleDoors() {
    const container = document.getElementById('doors-container');
    const doors = Array.from(document.querySelectorAll('.door'));
    
    // Créer un tableau d'indices mélangés
    const indices = [0, 1, 2];
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Appliquer l'ordre
    doors.forEach((door, index) => {
        door.style.order = indices[index];
    });
}

// Gestion du clic sur une porte
function handleDoorClick(doorIndex) {
    if (!gameActive) return;
    
    gameActive = false;
    clearTimeout(timeoutId);
    
    // Arrêter le son du timer
    clockSound.pause();
    clockSound.currentTime = 0;
    
    const doors = document.querySelectorAll('.door');
    const clickedDoor = doors[doorIndex];
    const character = document.getElementById('character');
    
    // Ouvrir la porte
    clickedDoor.classList.add('opening');
    doorSound.currentTime = 0;
    doorSound.play();
    
    // Arrêter le son après 0.8 secondes
    setTimeout(() => doorSound.pause(), 800);
    
    // Déplacer le personnage vers la porte
    const doorRect = clickedDoor.getBoundingClientRect();
    const doorCenterX = doorRect.left + doorRect.width / 2;
    
    character.style.left = doorCenterX + 'px';
    character.classList.add('walking');
    
    setTimeout(() => {
        character.classList.remove('walking');
        
        if (doorIndex === correctDoorIndex) {
            // Bonne porte -> le personnage entre
            winSound.currentTime = 0;
            winSound.play();
            
            
            
            character.classList.add('entering');
            setTimeout(() => {
                gameOver(true);
            }, 800);
        } else {
            // Mauvaise porte -> Macron explosion
            explodeCharacter();
            setTimeout(() => {
                gameOver(false);
            }, 600);
        }
    }, 500);
}

// Animation d'explosion
function explodeCharacter() {
    const character = document.getElementById('character');
    character.textContent = '💥';
    character.classList.add('exploding');
    
    // Jouer le son d'explosion
    explodeSound.currentTime = 0;
    explodeSound.play();
    
    // Créer des particules d'explosion
    const characterRect = character.getBoundingClientRect();
    const centerX = characterRect.left + characterRect.width / 2;
    const centerY = characterRect.top + characterRect.height / 2;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        
        const angle = (Math.PI * 2 * i) / 15;
        const distance = 100 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.animation = 'particle-explode 0.6s ease-out forwards';
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 600);
    }
}

// Fin du jeu
function gameOver(isWin) {
    const gameOverDiv = document.getElementById('game-over');
    const resultMessage = document.getElementById('result-message');
    
    if (isWin) {
        resultMessage.textContent = 'GAGNÉ !';
        resultMessage.className = 'win';
    } else {
        resultMessage.textContent = 'PERDU !';
        resultMessage.className = 'lose';
    }
    
    setTimeout(() => {
        gameOverDiv.classList.remove('hidden');
        
        // Redirection après 1.7 secondes
        setTimeout(() => {
            if (isWin) {
                // Si gagné -> Jeu suivant via GameManager
                GameManager.onWin();
            } else {
                // Si perdu -> Accueil via GameManager
                GameManager.onLose();
            }
        }, 1700);
    }, 300);
}

// Démarrer le jeu au chargement
window.addEventListener('load', () => {
    initGame();
});