// --- Variables Globales (Éléments DOM et État du Jeu) ---
// On attrape tous les éléments HTML, comme des Pokémon rares ! 🎣
const instructionsElement = document.getElementById('instructions');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const sequenceDisplay = document.getElementById('sequence-display');
const overlay = document.getElementById('overlay');
// On cible les titres de l'overlay pour crier les instructions
const overlayTitle = document.getElementById('overlay-title'); 
const overlayInstructions = document.getElementById('overlay-instructions');


// Variables de jeu
let score = 0; // Le but : avoir plus que Wario lui-même (c'est facile)
// *** Ligne à modifier pour changer le temps du Jeu ***
const TIME_LIMIT = 10; // 10 secondes de pure panique ! 🤯
let timeLeft = TIME_LIMIT;

let currentSequence = ""; // La série de touches à mimer
let currentKeyIndex = 0;  // La position dans la séquence (où en est le mimeur)
let timerInterval; // La bombe à retardement (le compte à rebours) 💣
let isGameOver = false; // L'état du joueur : est-ce fini ? (spoiler: oui, dans 10s)

// Lettres autorisées (pour générer la séquence)
// La seule et unique ligue AZERTY (désolé aux QWERTY)
const ALLOWED_KEYS = 'AZERTYUIOPQSDFGHJKLMWXCVBN'; 

// --- Fonctions de Séquence et Affichage ---

/**
 * La fonction secrète 'Ranger' (alias Chiffre de César). 🕵️‍♂️
 * Déplace chaque lettre dans l'alphabet. Parfait pour écrire des messages secrets ou des recettes de gâteau.
 * * @param {string} texte Le texte à chiffrer/déchiffrer.
 * @param {number} decalage Le nombre de positions à décaler (positif pour chiffrer, négatif pour déchiffrer).
 * @returns {string} Le texte chiffré/déchiffré.
 */
function Ranger(texte, decalage) {
    let resultat = '';
    
    // Assure que le décalage est dans la plage [0, 25] (on ne veut pas tourner 50 fois !)
    decalage = decalage % 26; 

    for (let i = 0; i < texte.length; i++) {
        let charCode = texte.charCodeAt(i);
        
        // Gère les lettres majuscules (A-Z)
        if (charCode >= 65 && charCode <= 90) { 
            // La formule magique pour décaler dans l'alphabet circulaire ! 🔄
            charCode = ((charCode - 65 + decalage) % 26) + 65;
        }
        // Gère les lettres minuscules (a-z)
        else if (charCode >= 97 && charCode <= 122) { 
            charCode = ((charCode - 97 + decalage) % 26) + 97;
        }
        // Laisse les autres caractères (espaces, nombres, ponctuation) inchangés. Ils sont trop timides.
        
        resultat += String.fromCharCode(charCode);
    }
    
    return resultat;
}

// --- Exemple d'utilisation de la fonction de Cryptographie ---
// console.log("Le mot de passe secret est:", Ranger("TOPSECRET", 5)); // 'YTRXJHW'
// console.log("Pour déchiffrer:", Ranger("YTRXJHW", -5)); // 'TOPSECRET'

/**
 * Génère une nouvelle séquence de frappe aléatoire.
 * On tire au sort les touches à presser. Que la chance soit avec vous ! 🍀
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
 * Chaque lettre devient son propre petit panneau d'affichage ! 🚦
 */
function renderSequence() {
    sequenceDisplay.innerHTML = ''; // Nettoie les anciens fantômes de lettres 👻
    currentSequence.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.classList.add('key-char');
        
        // Met en surbrillance la première touche : "C'EST CELLE-LÀ, IDIOT !"
        if (index === currentKeyIndex) {
            span.classList.add('active');
        }
        sequenceDisplay.appendChild(span);
    });
}

/**
 * Met à jour l'affichage après qu'une touche a été tapée correctement.
 * On passe à la touche suivante, comme quand on tourne la page d'un livre. 📖
 */
function updateSequenceDisplay() {
    // 1. Marque la touche précédente comme 'correcte' (verte)
    const previousSpan = sequenceDisplay.children[currentKeyIndex - 1];
    if (previousSpan) {
        previousSpan.classList.remove('active');
        previousSpan.classList.add('correct');
    }
    
    // 2. Met la touche actuelle en surbrillance. "Ton prochain objectif, Agent."
    const currentSpan = sequenceDisplay.children[currentKeyIndex];
    if (currentSpan) {
        currentSpan.classList.add('active');
    }
}

/**
 * Gère le passage à la séquence suivante (nouvel essai).
 * YES ! Un point de plus ! On augmente la difficulté ! 😈
 */
function nextSequence() {
    score++;
    scoreElement.textContent = `Score : ${score}`;
    currentKeyIndex = 0; // Retour à la case départ de la nouvelle séquence
    
    // Règle la difficulté: on ajoute une lettre tous les 3 points. C'est l'escalade ! ⛰️
    let length = 4 + Math.floor(score / 3);
    length = Math.min(length, 8); // Longueur max de 8 pour ne pas écrire un roman
    
    currentSequence = generateSequence(length);
    renderSequence();
}

/**
 * Réinitialise la séquence en cas d'erreur sans arrêter le jeu.
 * "OUPS, tu as glissé ! Retour au début de la séquence, mais continue de te battre !" 💪
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
    // On donne un feedback visuel rapide d'erreur : le rouge de la honte !
    instructionsElement.textContent = 'ERREUR ! Recommencez la séquence.';
    instructionsElement.style.color = 'var(--color-text-light)'; 
    setTimeout(() => {
        instructionsElement.textContent = 'TAPEZ LA SÉQUENCE !';
        instructionsElement.style.color = 'var(--color-accent)';
    }, 500); // 0.5s pour se remettre de ses émotions
}

// --- Logique du Jeu et Contrôles ---

/**
 * Gère l'événement de frappe de touche par l'utilisateur.
 * C'est le cœur du jeu, là où la magie se produit (ou l'échec...). ✨
 * @param {KeyboardEvent} event L'événement clavier
 */
function handleKeyPress(event) {
    if (isGameOver) return; // Ne réagit plus si c'est la fin du monde (du jeu)

    const pressedKey = event.key.toUpperCase();
    const requiredKey = currentSequence[currentKeyIndex];

    // Sécurité: on ignore les touches bizarres (CTRL, ALT, etc.). Seules les lettres comptent.
    if (!ALLOWED_KEYS.includes(pressedKey)) {
        return;
    }

    if (pressedKey === requiredKey) {
        // Touche correcte : "Bien joué, champion !" 🌟
        currentKeyIndex++;
        updateSequenceDisplay();

        if (currentKeyIndex >= currentSequence.length) {
            // Séquence complétée ! BAM !
            nextSequence();
        }
    } else {
        // Touche incorrecte : "Dommage, mais tu peux te rattraper !"
        resetSequence();
    }
}

/**
 * Commence le compte à rebours.
 * Tic-tac, tic-tac... ⏳
 */
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft -= 0.01; // On compte en centièmes pour l'effet dramatique !
        
        let displayTime = Math.max(0, timeLeft).toFixed(2); 
        timerElement.textContent = `Temps restant : ${displayTime}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval); 
            endGame(`TEMPS ÉCOULÉ ! ${score} séquences complétées.`); // Fin de partie, le rideau tombe 🎭
        }
    }, 10); // Exécution toutes les 10ms
}

/**
 * Démarre la boucle principale du jeu.
 * C'est l'heure du show ! 🎬
 */
function startGame() {
    score = 0;
    timeLeft = TIME_LIMIT;
    isGameOver = false;

    // --- MAGIE NOIRE : Masque l'overlay pour démarrer le jeu ---
    overlay.style.display = 'none';

    instructionsElement.textContent = 'TAPEZ LA SÉQUENCE !';
    instructionsElement.classList.remove('game-over-text');
    scoreElement.textContent = `Score : ${score}`;
    timerElement.textContent = `Temps restant : ${timeLeft.toFixed(2)}`;
    instructionsElement.style.color = 'var(--color-accent)';

    // Initialise la première séquence
    nextSequence();

    // Ajoute l'écouteur d'événement pour le clavier. Le jeu est maintenant ACTIF !
    document.addEventListener('keydown', handleKeyPress);

    // Démarre le timer
    startTimer();
}

/**
 * Termine le jeu et affiche les résultats.
 * On fait le bilan et on prépare le prochain tour (ou la page d'accueil). 🥳
 * @param {string} resultText Le message de fin de jeu.
 */
function endGame(resultText) {
    isGameOver = true;
    
    // Nettoyage : On coupe tout ! Plus de compte à rebours ni de frappes.
    clearInterval(timerInterval);
    document.removeEventListener('keydown', handleKeyPress);
    
    // Affichage des résultats dans l'overlay
    overlayTitle.textContent = `JEU TERMINÉ ! Score : ${score}`;
    overlayInstructions.innerHTML = `
        FÉLICITATIONS ! Vous avez complété ${score} séquences.<br>
        Le prochain micro-jeu commence dans 4 secondes... ou peut-être la page d'accueil ? 😉
    `;
    // Révèle l'overlay : "Salut ! Regardez mon score !"
    overlay.style.display = 'flex';
    
    // Simule la boucle: redémarrage après 4 secondes (ou redirection vers la page d'accueil)
    setTimeout(() => {
        // Si on était dans un système de redirection vers l'accueil, ce serait ici :
        // window.location.href = 'index.html'; 
        
        // Pour cet exemple, on prépare le lancement du MÊME jeu (boucle infinie WarioWare !)
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
 * La première chose que le navigateur voit. C'est le DJ du jeu ! 🎧
 */
window.onload = () => {
    // --- CORRECTION : Affiche l'overlay pour l'instruction initiale ---
    overlay.style.display = 'flex';
    
    // Démarre le jeu après le temps d'instruction initial (3 secondes)
    setTimeout(startGame, 3000); 
};


/* ---------------------------------------------------------------- */
/* -------------------- FONCTIONNALITÉ ALÉATOIRE -------------------- */
/* ---------------------------------------------------------------- */

/**
 * Fonction pour générer un identifiant aléatoire unique (UUID court).
 * C'est comme donner un nom de code secret à chaque partie. 🤫
 * @param {number} longueur La longueur désirée pour l'identifiant (par défaut : 8).
 * @returns {string} L'identifiant unique généré.
 */
function genererIdentifiantAleatoire(longueur = 8) {
    // Caractères possibles pour l'identifiant : le grand mélange !
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let identifiant = '';
    
    // Boucle pour sélectionner des caractères aléatoires
    for (let i = 0; i < longueur; i++) {
        // Math.random() * longueur : le secret de l'aléatoire
        const indexAleatoire = Math.floor(Math.random() * caracteres.length);
        
        // Ajoute le caractère correspondant à l'identifiant
        identifiant += caracteres.charAt(indexAleatoire);
    }
    
    return identifiant;
} 

// --- Exemple d'utilisation de la fonction Aléatoire ---
// const idJeu = genererIdentifiantAleatoire(12);
// console.log("ID de Jeu Aléatoire (Pour le suivi !):", idJeu); // Sortie: ex. 'a7FpLzD4Xq2R'