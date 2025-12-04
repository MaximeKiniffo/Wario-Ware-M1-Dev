const sonClick = new Audio("assets/musicNoel.mp3");
document.addEventListener("click", (event) => {
    // Vérifie si ce n'est pas le bouton
    if (event.target.id !== "monBouton" && event.target.id !== "lost") {
        sonClick.currentTime = 0; // remet au début si on clique vite
        sonClick.play();
        console.log("Bouton cliqué !");
        const lost = document.getElementById("maGrandMere");
        if (lost) {
            lost.style.visibility = "visible";
            setTimeout(() => {
                lost.style.visibility = "hidden";
            }, 1000);
        }
    }
});


let lost = false;
function bougerBouton() {
    const bouton = document.getElementById("monBouton");
    const gameZone = document.getElementById("gameZone");
    if (!lost) {
        const largeur = gameZone.clientWidth - bouton.offsetWidth;
        const hauteur = gameZone.clientHeight - bouton.offsetHeight;

        const nouvelleGauche = Math.floor(Math.random() * largeur);
        const nouvelleHaut = Math.floor(Math.random() * hauteur);

        bouton.style.left = nouvelleGauche + "px";
        bouton.style.top = nouvelleHaut + "px";
    }
}

function handlePressButton() {
    console.log("win")
    GameManager.onWin();
}

// bouge toutes les X secondes (ici 0.5 seconde)
setInterval(bougerBouton, 700);

//gestion du compte à rebours
function startCountdown() {
    let timeLeft = 5; // 5 secondes
    const countdownEl = document.getElementById("countdown");

    countdownEl.textContent = timeLeft;

    const timer = setInterval(() => {
        timeLeft--;
        countdownEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            lost = true;
            document.getElementById("lost").style.visibility = "visible";
            setTimeout(() => {
                GameManager.onLose();

            }, 2000);
        }
    }, 1000);
}

// Démarre le compte à rebours dès le chargement
window.onload = startCountdown;
