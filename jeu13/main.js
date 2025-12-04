// --- VARIABLES GLOBALES ET CONSTANTES ---

// Éléments du DOM 
const instructionsElement = document.getElementById('instructions');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const grid = document.getElementById('whack-a-mole-grid');
const endScreen = document.getElementById('end-screen');
const finalMessage = document.getElementById('final-message');
const returnButton = document.getElementById('return-button');
const gameMusic = document.getElementById('game-music');

// VARIABLES DE JEU ET TEMPS
const GAME_DURATION = 10000; // Durée totale du jeu en millisecondes (10 secondes)
// Temps d'apparition d'une nouvelle taupe (en millisecondes). 
// Augmenté à 700ms pour plus de jouabilité. 
// ➡️ MODIFIER ICI POUR CHANGER LA VITESSE DE JEU (plus la valeur est petite, plus c'est rapide)
const MOLE_SPAWN_INTERVAL = 1500; 
const WIN_THRESHOLD = 10; // Score minimum pour gagner (seuil arbitraire)

let score = 0;
let timeLeft = GAME_DURATION;
let gameInterval; // Intervalle pour l'apparition des taupes
let timerInterval; // Intervalle pour le compte à rebours
let isPlaying = false;
let currentActiveMole = null; // Référence à la taupe active

// --- FONCTIONS AUDIO ET SETUP ---

/**
 * Initialise l'audio du jeu (nécessite une interaction utilisateur pour démarrer).
 */
function initialiserAudio() {
    if (gameMusic && gameMusic.paused) {
        gameMusic.volume = 0.4;
        gameMusic.play().catch(error => {
            console.log("Lecture audio bloquée.");
        });
    }
}


/**
 * Crée les 9 trous de la grille au début du jeu.
 */
function creerGrille() {
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.classList.add('mole-hole');
        hole.addEventListener('click', handleMoleClick);
        grid.appendChild(hole);
    }
}

// --- LOGIQUE DU JEU ---

/**
 * Choisit un trou aléatoire pour faire apparaître la taupe.
 */
function choisirTrouAleatoire() {
    const holes = document.querySelectorAll('.mole-hole');
    let newMole = holes[Math.floor(Math.random() * holes.length)];

    // S'assure de ne pas choisir le même trou deux fois de suite
    if (newMole === currentActiveMole) {
        return choisirTrouAleatoire();
    }
    
    // Si une taupe était active, on la cache
    if (currentActiveMole) {
        currentActiveMole.classList.remove('active');
    }
    
    currentActiveMole = newMole;
    
    // Révèle la taupe après un très court délai visuel
    setTimeout(() => {
        if (isPlaying) {
            currentActiveMole.classList.add('active');
        }
    }, 50); 
}


/**
 * Gère le clic sur un trou par le joueur.
 * @param {Event} event 
 */
function handleMoleClick(event) {
    if (!isPlaying) return;
    
    initialiserAudio(); // Démarre le son

    const clickedHole = event.currentTarget;

    if (clickedHole === currentActiveMole) {
        // Clic correct : augmente le score
        score++;
        scoreElement.textContent = `Score : ${score}`;
        
        currentActiveMole.classList.remove('active');
        currentActiveMole = null;
        
        // Change immédiatement de cible pour le prochain cycle
        choisirTrouAleatoire();
        
    } else {
        // Clic incorrect : pénalité
        score = Math.max(0, score - 1); 
        scoreElement.textContent = `Score : ${score}`;
        
        // Feedback visuel de l'erreur
        clickedHole.style.backgroundColor = 'red';
        setTimeout(() => {
            clickedHole.style.backgroundColor = 'var(--color-bg-dark)';
        }, 100);
    }
}

/**
 * Démarre le compte à rebours visuel.
 */
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft -= 100; // Décrémente de 100ms
        
        const displayTime = (timeLeft / 1000).toFixed(2);
        timerElement.textContent = `Temps : ${displayTime}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver(score);
        }
    }, 100);
}

// --- GESTION DE LA PARTIE (Début et Fin) ---

/**
 * Lance le jeu.
 */
function startGame() {
    score = 0;
    timeLeft = GAME_DURATION;
    isPlaying = true;
    scoreElement.textContent = `Score : ${score}`;
    instructionsElement.textContent = `FRAPPEZ ${WIN_THRESHOLD} FOIS !`;
    endScreen.style.display = 'none';
    
    // Démarre l'apparition des taupes
    // ➡️ MODIFIER ICI POUR CHANGER LA VITESSE DE JEU (utilise la constante MOLE_SPAWN_INTERVAL)
    gameInterval = setInterval(choisirTrouAleatoire, MOLE_SPAWN_INTERVAL); 
    
    startTimer();
}

/**
 * Termine le jeu et affiche les résultats, puis redirige automatiquement.
 * @param {number} finalScore Le score final du joueur.
 */
function gameOver(finalScore) {
    isPlaying = false;
    
    // Nettoyage des intervalles
    clearInterval(gameInterval);
    if (gameMusic) gameMusic.pause();
    
    const victoire = finalScore >= WIN_THRESHOLD;
    
    if (victoire) {
        finalMessage.innerHTML = `VICTOIRE ÉCLAIR ! 🏆<br>Vous avez atteint ${finalScore} points !`;
        finalMessage.style.backgroundColor = 'green';
    } else {
        finalMessage.innerHTML = `DÉFAITE ! 💔<br>Score : ${finalScore}. Retour à la ville.`;
        finalMessage.style.backgroundColor = 'red';
    }
    
    endScreen.style.display = 'flex'; // Affiche l'écran de fin
    instructionsElement.textContent = `JEU TERMINÉ !`;

    // ➡️ DÉLAI DE REDIRECTION AUTOMATIQUE (5 secondes)
    const REDIRECTION_DELAY = 5000; 
    
    // On cache le bouton de retour pour forcer la redirection
    returnButton.style.display = 'none'; 

    setTimeout(() => {
        // Redirection vers le menu principal après le délai
        window.location.href = '../index.html'; 
    }, REDIRECTION_DELAY);
    // -----------------------------------------------------------------
}

// --- INITIALISATION ---

// On retire l'écouteur du bouton de retour puisque la redirection est automatique.
// Le bouton sert seulement de placeholder visuel sur l'écran de fin.

// Lance la création de la grille et le jeu au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    creerGrille();
    
    // Masquage initial du bouton de retour
    returnButton.style.display = 'none';
    
    // Séquence de lancement de 3 secondes
    instructionsElement.textContent = 'PRÉPAREZ-VOUS ! 3...';
    setTimeout(() => {
        instructionsElement.textContent = '2...';
    }, 1000);
    setTimeout(() => {
        instructionsElement.textContent = '1...';
    }, 2000);
    setTimeout(startGame, 3000); // Démarre le jeu après 3 secondes d'attente
});