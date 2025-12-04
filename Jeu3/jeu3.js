// --- CONSTANTES ET VARIABLES GLOBALES (Le Matériel du Shérif) ---
const GAME_DURATION = 10000; // Le temps pour dégainer (10 secondes) ⏳
const THRESHOLD = 160;       // La largeur critique : au-delà, c'est que l'écran du DevTools a été ouvert ! 🧐

let isPlaying = true;      // Le duel est-il en cours ? 🔫
let startTime;             // L'heure où le coup de sifflet a retenti. 🕛
let devToolsOpen = false;  // Le joueur a-t-il triché et ouvert son grand livre de code ? 😈

const bug = document.getElementById('hidden-bug'); // Le bug ! La cible ! Le vilain petit canard ! 🦆
const timerBar = document.getElementById('timer-bar'); // La barre d'énergie du bandit (le temps) 💪
const winScreen = document.getElementById('win-screen'); // Le message de gloire et de whisky gratuit. 🥃
const loseScreen = document.getElementById('lose-screen'); // Le message de défaite et de cactus. 🌵

// --- FONCTIONS D'ANIMATION ET DE MOUVEMENT (Les Pistes) ---

/**
 * Lance le tremblement du bug (la cible bouge, le lâche !) 🤪
 * @param {HTMLElement} element L'élément à faire gigoter.
 */
function startJitter(element) {
    if (element.jitterInterval) return;
    element.jitterInterval = setInterval(() => {
        // Un peu de rotation et de zoom pour rendre la visée difficile ! 🌪️
        const rotation = (Math.random() - 0.5) * 10;
        const scale = 1 + (Math.random() * 0.2 - 0.1); 
        element.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    }, 100);
}

/**
 * Arrête le tremblement. Le bug est vaincu... ou le temps est écoulé. 😴
 * @param {HTMLElement} element 
 */
function stopJitter(element) {
    if (element.jitterInterval) {
        clearInterval(element.jitterInterval);
        element.jitterInterval = null;
        element.style.transform = 'none'; // On le remet d'aplomb
    }
}

/**
 * Démarre le jeu. Le soleil est haut, le duel commence ! 🌞
 */
function startGame() {
    console.clear(); // On nettoie le tableau des anciens duels. 🧹            
    startTime = Date.now();
    placeBugRandomly(); // On cache le bug quelque part dans le désert. 🤫
    gameLoop(); // On lance la boucle du destin !
}

/**
 * Cache le bug n'importe où sur l'écran.
 * On ne sait jamais où le bandit va se cacher ! 🕵️‍♂️
 */
function placeBugRandomly() {
    // On s'assure que le bug reste à l'intérieur des limites de l'écran. Pas de fuite ! 🚧
    const x = Math.random() * (window.innerWidth - 80);
    const y = Math.random() * (window.innerHeight - 80);
    bug.style.left = x + 'px';
    bug.style.top = y + 'px';
}

/**
 * La boucle principale du jeu. Le vent siffle... 💨
 */
function gameLoop() {
    if (!isPlaying) return; // Si le bandit est déjà vaincu, on s'arrête. 🛑

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, GAME_DURATION - elapsed);
    const percentage = (remaining / GAME_DURATION) * 100;
    
    // On met à jour la barre de temps. Elle fond comme neige au soleil ! 🌡️
    timerBar.style.width = percentage + "%";
    
    // Change la couleur de la barre selon le danger (comme un feu de signalisation de l'Ouest) 🚦
    if (percentage < 30) {
        timerBar.style.backgroundColor = '#7B3F39'; // Rouge foncé (Danger Max!) 🚨
    } else if (percentage < 60) {
        timerBar.style.backgroundColor = '#E57368'; // Corail (Attention!)
    } else {
        timerBar.style.backgroundColor = '#A98356'; // Ocre (Tout va bien... pour l'instant)
    }

    if (remaining <= 0) {
        gameOver(false); // Temps écoulé ! Défaite amère. 😭
        return;
    }

    // --- Détecter l'ouverture de Devtools (La tricherie du cow-boy !) ---
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    // Si la différence de taille d'écran dépasse le seuil, c'est que les DevTools sont ouverts ! 😱
    if (!devToolsOpen && (widthDiff > THRESHOLD || heightDiff > THRESHOLD)) {
        revealBug(); // Le bandit sort de sa cachette !
    }

    // On rappelle la fonction pour la prochaine image. La boucle du destin continue... 🔄
    requestAnimationFrame(gameLoop);
}

/**
 * Révèle le bug quand le joueur triche.
 * Le bug se dit : "Ah, tu voulais m'attraper facilement ? Viens donc !" 😜
 */
function revealBug() {
    if (devToolsOpen) return; 
    devToolsOpen = true; // On a repéré la triche !
    
    bug.style.display = 'flex'; // Le bug apparaît enfin ! 👀
    startJitter(bug); // Il panique et se met à trembler ! 😬
    placeBugRandomly(); // Il s'enfuit à un autre endroit immédiatement !
}

// --- GESTION DES ÉVÉNEMENTS (Le Clic Final) ---

// Quand le joueur clique sur le bug (il l'a attrapé !)
bug.addEventListener('click', () => {
    if (isPlaying) {
        gameOver(true); // VICTOIRE ! Il est temps de toucher la prime. 💰
    }
});

/**
 * Fin de partie. Que la poudre retombe. 🪦
 * @param {boolean} win Vrai si le bug est cliqué, Faux si le temps est écoulé.
 */
function gameOver(win) {
    isPlaying = false;
    stopJitter(bug); // Le bug ne bouge plus. Paix à son âme.
    
    if (win) {
        winScreen.style.display = 'flex'; // Affichage du panneau "PRIME REÇUE" 🥳
        
        // Redirection vers le niveau suivant (la prochaine ville de l'Ouest) 🗺️
        setTimeout(() => {
            window.location.href = 'ouvrir_bonne_porte/ouvrir_bonne_porte.html';
        }, 2000); 
        
        // Notification au parent (si le jeu est dans un iframe) 📢
        if(window.parent && window.parent.onGameWin) window.parent.onGameWin();
    } else {
        loseScreen.style.display = 'flex'; // Affichage du panneau "PENDU" 🕸️
        if(window.parent && window.parent.onGameLose) window.parent.onGameLose();
    }
}

// Le bug s'enfuit si la fenêtre change de taille (il est malin !)
window.addEventListener('resize', () => {
    if(devToolsOpen && isPlaying) {
        placeBugRandomly(); // Nouvelle cachette immédiatement ! 🏃
    }
});

// --- Lancement (C'est l'heure du DUEL !) ---
startGame();