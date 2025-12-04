const boutonsFils = document.querySelectorAll(".fil");
const texteFlash = document.getElementById("flash-text");
const chrono = document.getElementById("timer");

// Couleurs possibles pour les fils
const COULEURS = ["rouge", "bleu", "vert"];
// Duree totale d\'une manche en millisecondes (5 secondes)
const DUREE_MS = 5000;

// Variables d\'etat de la partie courante
let cible = null; // couleur a couper
let compteAReboursId = null; // identifiant du setInterval pour le timer
let finTemps = null; // timestamp de fin de manche
let debutTemps = null; // timestamp de debut de manche
let mancheTerminee = false; // evite de traiter deux fois la meme manche

// Tire une couleur aleatoire parmi COULEURS
function randomCouleur() {
  const index = Math.floor(Math.random() * COULEURS.length);
  return COULEURS[index];
}

// Met a jour l\'affichage du texte clignotant avec la nouvelle cible
function afficherCible() {
  cible = randomCouleur();
  texteFlash.textContent = `COUPE LE ${cible.toUpperCase()}`;
}

// Demarre le chronometre : enregistre debut/fin et lance le rafraichissement regulier
function demarrerTimer() {
  debutTemps = Date.now();
  finTemps = debutTemps + DUREE_MS;
  mancheTerminee = false;
  miseAJourTimer();
  compteAReboursId = setInterval(miseAJourTimer, 100);
}

// Actualise l\'affichage du temps restant et gere la fin automatique
function miseAJourTimer() {
  const restant = Math.max(0, finTemps - Date.now());
  const secondes = (restant / 1000).toFixed(1);
  chrono.textContent = `${secondes}s`;
  if (restant <= 0) {
    terminerManche("timeout", 0);
  }
}

// Active/desactive tous les boutons de fils
function verrouillerFils(etat) {
  boutonsFils.forEach((bouton) => {
    bouton.disabled = etat;
    bouton.setAttribute("aria-disabled", etat ? "true" : "false");
  });
}

// Termine la manche selon l\'etat (win/wrong/timeout) et affiche le bon message
function terminerManche(etat, restantMs = Math.max(0, finTemps - Date.now())) {
  if (mancheTerminee) return; // securite anti double execution
  mancheTerminee = true;

  if (compteAReboursId) {
    clearInterval(compteAReboursId);
    compteAReboursId = null;
  }
  verrouillerFils(true);

  if (etat === "win") {
    // Temps utilise = duree totale (5s) - temps restant au moment du clic
    const tempsPris = (DUREE_MS - restantMs) / 1000;
    const tempsFormate = Math.max(0, tempsPris).toFixed(1).replace(".", ",");
    texteFlash.textContent = `VICTOIRE ! Tu as coupé le bon fil en ${tempsFormate} secondes.`;
    
    // Redirection vers le jeu suivant apres 1 seconde
    setTimeout(() => {
      GameManager.onWin();
    }, 1000);
    return;
  }

  if (etat === "wrong") {
    texteFlash.textContent = "DÉFAITE ! Mauvais fil coupé !";
  } else {
    texteFlash.textContent = "TEMPS ÉCOULÉ !";
  }

  // Redirection vers l\'accueil apres 1 seconde
  setTimeout(() => {
    GameManager.onLose();
  }, 1000);
}

// Initialise la manche : choisit une cible, demarre le timer et branche les clics
function initialiser() {
  afficherCible();
  demarrerTimer();
  verrouillerFils(false);

  boutonsFils.forEach((bouton) => {
    bouton.addEventListener("click", () => {
      const restant = Math.max(0, finTemps - Date.now()); // temps restant au clic
      const choix = bouton.dataset.color;
      terminerManche(choix === cible ? "win" : "wrong", restant);
    });
  });
}

// Lance le jeu des que le DOM est pret
window.addEventListener("DOMContentLoaded", initialiser);
GameManager.displayScore();
