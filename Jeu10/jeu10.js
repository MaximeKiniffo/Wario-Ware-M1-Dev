let lost = false;
let win = false;
const sonClick = new Audio("assets/musicNoel.mp3");
const tictac = new Audio("assets/tictac.mp3")

document.addEventListener("click", (event) => {
    //jouer le son tictac
    tictac.currentTime = 0;
    tictac.play()
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

function bougerBouton() {
    if (!win) {
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

}

function handlePressWin() {
    console.log("win")
    win = true
    document.getElementById("win").style.visibility = "visible";
    setTimeout(() => {
        console.log("jeu suivant")
        GameManager.onWin();
    }, 1000)
}

//gestion du compte à rebours
function startCountdown() {
    let timeLeft = 5; // 5 secondes
    const countdownEl = document.getElementById("countdown");

    countdownEl.textContent = timeLeft;

    const timer = setInterval(() => {
        if (!win) {
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
        }

    }, 1000);
}

// bouge toutes les X secondes (ici 0.7 seconde)
setInterval(bougerBouton, 700);

// Démarre le compte à rebours dès le chargement
window.onload = startCountdown;


