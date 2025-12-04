

const sonClick = new Audio("assets/musicNoel.mp3");
document.addEventListener("click", (event) => {
    // Vérifie si ce n'est pas le bouton
    if (event.target.id !== "monBouton") {
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

const bouton = document.getElementById("monBouton");
const gameZone = document.getElementById("gameZone");

function bougerBouton() {
    const largeur = gameZone.clientWidth - bouton.offsetWidth;
    const hauteur = gameZone.clientHeight - bouton.offsetHeight;

    const nouvelleGauche = Math.floor(Math.random() * largeur);
    const nouvelleHaut = Math.floor(Math.random() * hauteur);

    bouton.style.left = nouvelleGauche + "px";
    bouton.style.top = nouvelleHaut + "px";
}

function handlePressButton() {
    // redirection correcte
    window.location.href = "/";
    console.log("asasa");
}

// bouge toutes les X secondes (ici 1 seconde)
setInterval(bougerBouton, 300);
