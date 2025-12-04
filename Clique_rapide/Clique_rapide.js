
document.addEventListener("click", (event) => {
    // Vérifie si ce n'est pas le bouton
    if (event.target.id !== "monBouton") {
        console.log("click sur la page");
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

function bougerBouton() {
    if (!bouton) return;

    // largeur et hauteur de la fenêtre
    const largeur = window.innerWidth - bouton.offsetWidth;
    const hauteur = window.innerHeight - bouton.offsetHeight;

    // position aléatoire
    const nouvelleGauche = Math.floor(Math.random() * largeur);
    const nouvelleHaut = Math.floor(Math.random() * hauteur);

    bouton.style.position = "absolute"; // nécessaire pour le déplacement
    bouton.style.left = nouvelleGauche + "px";
    bouton.style.top = nouvelleHaut + "px";
    bouton.style.zIndex = 9999; // toujours au-dessus
}

function handlePressButton() {
    // redirection correcte
    window.location.href = "/";
    console.log("asasa");
}

// bouge toutes les X secondes (ici 1 seconde)
setInterval(bougerBouton, 300);
