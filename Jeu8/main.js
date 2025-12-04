// --- Variables Globales (Éléments DOM et État du Jeu) ---
const instructionsElement = document.getElementById('instructions');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const sequenceDisplay = document.getElementById('sequence-display');
const overlay = document.getElementById('overlay');
// NOUVELLES VARIABLES pour cibler les éléments de l'overlay
const overlayTitle = document.getElementById('overlay-title');
const overlayInstructions = document.getElementById('overlay-instructions');


// Variables de jeu
let score = 0;
// *** Ligne à modifier pour changer le temps du Jeu ***
const TIME_LIMIT = 10; 
let timeLeft = TIME_LIMIT;

let currentSequence = ""; 
let currentKeyIndex = 0;  
let timerInterval;
let isGameOver = false;

// Lettres autorisées (pour générer la séquence)
const ALLOWED_KEYS = 'AZERTYUIOPQSDFGHJKLMWXCVBN'; 

// --- Fonctions de Séquence et Affichage ---

/**
 * Génère une nouvelle séquence de frappe aléatoire.
 * @param {number} length La longueur de la séquence
 */
function generateSequence(length) {
    let sequence = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * ALLOWED_KEYS.length);
        sequence += ALLOWED_KEYS[randomIndex];
    }
    return sequence;
}

/**
 * Affiche la séquence dans l'élément HTML en utilisant des spans.
 */
function renderSequence() {
    sequenceDisplay.innerHTML = ''; 
    currentSequence.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.classList.add('key-char');
        
        // Met en surbrillance la première touche à taper
        if (index === currentKeyIndex) {
            span.classList.add('active');
        }
        sequenceDisplay.appendChild(span);
    });
}

/**
 * Met à jour l'affichage après qu'une touche a été tapée correctement.
 */
function updateSequenceDisplay() {
    // 1. Marque la touche précédente comme 'correcte' (verte)
    const previousSpan = sequenceDisplay.children[currentKeyIndex - 1];
    if (previousSpan) {
        previousSpan.classList.remove('active');
        previousSpan.classList.add('correct');
    }
    
    // 2. Met la touche actuelle en surbrillance
    const currentSpan = sequenceDisplay.children[currentKeyIndex];
    if (currentSpan) {
        currentSpan.classList.add('active');
    }
}

/**
 * Gère le passage à la séquence suivante (nouvel essai).
 */
function nextSequence() {
    score++;
    scoreElement.textContent = `Score : ${score}`;
    currentKeyIndex = 0;
    
    // Règle la difficulté: augmente la longueur de la séquence tous les 3 points
    let length = 4 + Math.floor(score / 3);
    length = Math.min(length, 8); 
    
    currentSequence = generateSequence(length);
    renderSequence();
}

/**
 * Réinitialise la séquence en cas d'erreur sans arrêter le jeu.
 */
function resetSequence() {
    currentKeyIndex = 0;
    // La séquence reste la même, mais les couleurs sont réinitialisées
    currentSequence.split('').forEach((_, index) => {
        const span = sequenceDisplay.children[index];
        if (span) {
            span.classList.remove('active', 'correct');
            if (index === 0) {
                 span.classList.add('active');
            }
        }
    });
    // On donne un feedback visuel rapide d'erreur
    instructionsElement.textContent = 'ERREUR ! Recommencez la séquence.';
    instructionsElement.style.color = 'var(--color-text-light)'; // Rouge
    setTimeout(() => {
        instructionsElement.textContent = 'TAPEZ LA SÉQUENCE !';
        instructionsElement.style.color = 'var(--color-accent)';
    }, 500);
}

// --- Logique du Jeu et Contrôles ---

/**
 * Gère l'événement de frappe de touche par l'utilisateur.
 * @param {KeyboardEvent} event L'événement clavier
 */
function handleKeyPress(event) {
    if (isGameOver) return;

    const pressedKey = event.key.toUpperCase();
    const requiredKey = currentSequence[currentKeyIndex];

    // Vérifie si la touche est une lettre valide (pour ignorer Shift, Alt, etc.)
    if (!ALLOWED_KEYS.includes(pressedKey)) {
        return;
    }

    if (pressedKey === requiredKey) {
        // Touche correcte
        currentKeyIndex++;
        updateSequenceDisplay();

        if (currentKeyIndex >= currentSequence.length) {
            // Séquence complétée !
            nextSequence();
        }
    } else {
        // Touche incorrecte -> Réinitialisation de la séquence
        resetSequence();
    }
}

/**
 * Commence le compte à rebours.
 */
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft -= 0.01; 
        
        let displayTime = Math.max(0, timeLeft).toFixed(2); 
        timerElement.textContent = `Temps restant : ${displayTime}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval); 
            endGame(`TEMPS ÉCOULÉ ! ${score} séquences complétées.`); 
        }
    }, 10); 
}

/**
 * Démarre la boucle principale du jeu.
 */
function startGame() {
    score = 0;
    timeLeft = TIME_LIMIT;
    isGameOver = false;

    // --- CORRECTION CLÉ : Masque l'overlay ---
    overlay.style.display = 'none';

    instructionsElement.textContent = 'TAPEZ LA SÉQUENCE !';
    instructionsElement.classList.remove('game-over-text');
    scoreElement.textContent = `Score : ${score}`;
    timerElement.textContent = `Temps restant : ${timeLeft.toFixed(2)}`;
    instructionsElement.style.color = 'var(--color-accent)';

    // Initialise la première séquence
    nextSequence();

    // Ajoute l'écouteur d'événement pour le clavier
    document.addEventListener('keydown', handleKeyPress);

    // Démarre le timer
    startTimer();
}

/**
 * Termine le jeu et affiche les résultats.
 * @param {string} resultText Le message de fin de jeu.
 */
function endGame(resultText) {
    isGameOver = true;
    
    // Nettoyage
    clearInterval(timerInterval);
    document.removeEventListener('keydown', handleKeyPress);
    
    // Affichage des résultats dans l'overlay
    overlayTitle.textContent = `JEU TERMINÉ ! Score : ${score}`;
    overlayInstructions.innerHTML = `
        FÉLICITATIONS ! Vous avez complété ${score} séquences.<br>
        Le prochain micro-jeu commence dans 4 secondes.
    `;
    // Révèle l'overlay
    overlay.style.display = 'flex';
    
    // Simule la boucle: redémarrage après 4 secondes
    setTimeout(() => {
        // Réinitialisation de l'overlay pour les instructions du prochain tour
        overlayTitle.textContent = `JEU : TAPEZ LA SÉQUENCE !`;
        overlayInstructions.innerHTML = `
            Reproduisez les touches affichées le plus vite possible.<br>
            Une erreur réinitialise la séquence, mais ne met pas fin au jeu !<br><br>
            Le jeu commence dans 3 secondes...
        `;
        // Prépare le lancement (avec l'attente initiale de 3s)
        setTimeout(startGame, 3000); 
    }, 4000); 
}

/**
 * Fonction d'initialisation au chargement de la page.
 */
window.onload = () => {
    // --- CORRECTION CLÉ : Affiche l'overlay pour l'instruction initiale ---
    overlay.style.display = 'flex';
    
    // Démarre le jeu après le temps d'instruction initial (3 secondes)
    setTimeout(startGame, 3000); 
};