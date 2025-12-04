// --- DÉCLARATIONS ET VARIABLES GLOBALES ---

// On attrape les fils (les cibles) : Nos trois pauvres victimes potentielles. 🔪
const boutonsFils = document.querySelectorAll('.fil');
// Le panneau clignotant : Là où le destin crie sa volonté ! 📢
const texteFlash = document.getElementById('flash-text');
// L'horloge de la potence : Le temps presse, shérif ! ⏳
const chrono = document.getElementById('timer');
// Le bouton pour fuir vers l'accueil : Pour les cow-boys qui n'aiment pas l'explosion. 🏃‍♂️💨
const boutonRetour = document.getElementById('retour-accueil');

// Couleurs possibles pour les fils : Le tiercé gagnant ou perdant. 🔴🔵🟢
const COULEURS = ['rouge', 'bleu', 'vert'];
// Duree totale d'une manche en millisecondes (5 secondes). C'est court ! 😬
const DUREE_MS = 5000;

// Variables d'etat de la partie courante
let cible = null; // La couleur maudite à couper. Si on se trompe, BOUM ! 💥
let compteAReboursId = null; // L'ID du chronomètre (pour pouvoir l'arrêter en cas de panique).
let finTemps = null; // Quand le soleil se couche sur la partie. 🌅
let debutTemps = null; // Quand le soleil se lève. 🌄
let mancheTerminee = false; // Sécurité : on ne meurt qu'une seule fois. 👻

// --- FONCTIONS CLÉS DE LA PARTIE ---

// Tire une couleur aléatoire parmi COULEURS
function randomCouleur() {
  // Le chapeau magique du tireur au sort ! 🎩
  const index = Math.floor(Math.random() * COULEURS.length);
  return COULEURS[index];
}

// Met à jour l'affichage du texte clignotant avec la nouvelle cible
function afficherCible() {
  cible = randomCouleur();
  // On crie l'ordre ! En majuscules, pour que ça rentre ! 📣
  texteFlash.textContent = `COUPE LE ${cible.toUpperCase()}`; 
}

// Démarre le chronomètre : enregistre debut/fin et lance le rafraîchissement régulier
function demarrerTimer() {
  debutTemps = Date.now();
  finTemps = debutTemps + DUREE_MS;
  mancheTerminee = false;
  boutonRetour.hidden = true; // Cache la voie de la lâcheté ! 🤫
  miseAJourTimer();
  // On lance le tic-tac du danger ! 🧨
  compteAReboursId = setInterval(miseAJourTimer, 100); 
}

// Actualise l'affichage du temps restant et gère la fin automatique
function miseAJourTimer() {
  // Le temps restant, sans dépasser 0. On ne voyage pas dans le temps ! 🔙
  const restant = Math.max(0, finTemps - Date.now());
  // Affichage avec une décimale, c'est plus précis pour la panique.
  const secondes = (restant / 1000).toFixed(1);
  chrono.textContent = `${secondes}s`;
  if (restant <= 0) {
    // Le temps est écoulé ! Le cactus explose ! 🌵💥
    terminerManche('timeout', 0);
  }
}

// Active/désactive tous les boutons de fils
function verrouillerFils(etat) {
  // Soit on peut tirer, soit on verrouille le holster. 🔫
  boutonsFils.forEach((bouton) => {
    bouton.disabled = etat;
    bouton.setAttribute('aria-disabled', etat ? 'true' : 'false');
  });
}

// Termine la manche selon l'etat (win/wrong/timeout) et affiche le bon message
function terminerManche(etat, restantMs = Math.max(0, finTemps - Date.now())) {
  if (mancheTerminee) return; // On a déjà explosé/gagné, laissez-nous tranquilles ! 🛑
  mancheTerminee = true;

  if (compteAReboursId) {
    clearInterval(compteAReboursId); // On stoppe l'horloge du destin ! ✋
    compteAReboursId = null;
  }
  verrouillerFils(true); // Plus le droit de toucher aux fils, c'est fini ! ⛔

  if (etat === 'win') {
    // Calcul de la vitesse du cow-boy ! ⚡
    const tempsPris = (DUREE_MS - restantMs) / 1000;
    // On formate ça joliment (et on remplace le point par une virgule, on est en France !) 🇫🇷
    const tempsFormate = Math.max(0, tempsPris).toFixed(1).replace('.', ',');
    
    // Message de gloire ! Le saloon vous offre une tournée ! 🥃
    texteFlash.textContent = `VICTOIRE ! Tu as coupe le bon fil en ${tempsFormate} secondes. YEEHAW! 🤠`;
    boutonRetour.hidden = true; // Pas besoin de retourner, on refait une partie !
    return;
  }

  if (etat === 'wrong') {
    // Oh, la gaffe ! Vous avez coupé la mauvaise mèche ! 😱
    texteFlash.textContent = 'DÉFAITE ! Mauvais fil coupé ! Prépare-toi à l\'onde de choc ! 💥';
  } else {
    // Trop lent ! La bombe a gagné le duel ! 💣
    texteFlash.textContent = 'TEMPS ÉCOULÉ ! Le Shérif a raté le coche !';
  }

  // En cas de défaite, on propose de fuir vers l'accueil. Il faut bien se cacher. 🫣
  boutonRetour.hidden = false; 
}

// Initialise la manche : choisit une cible, démarre le timer et branche les clics
function initialiser() {
  afficherCible();
  demarrerTimer();
  verrouillerFils(false); // On donne les armes au joueur ! 🔫

  boutonsFils.forEach((bouton) => {
    bouton.addEventListener('click', () => {
      // On calcule la rapidité EXACTE du clic ! 📏
      const restant = Math.max(0, finTemps - Date.now()); 
      const choix = bouton.dataset.color; // Quel fil ce cow-boy a-t-il osé couper ?
      
      // On vérifie le verdict ! Gagné ou pas ? Le destin est en jeu.
      terminerManche(choix === cible ? 'win' : 'wrong', restant);
    });
  });

  // Le bouton de fuite (retour à la ville pour se refaire) 🏘️
  boutonRetour.addEventListener('click', () => {
    // Redirection vers le menu principal (On assume que c'est 'index.html' dans le dossier parent !)
    window.location.href = '../index.html'; 
  });
}

// Lance le jeu dès que le DOM est prêt. C'est l'heure d'ouvrir le saloon ! 🥂
window.addEventListener('DOMContentLoaded', initialiser);