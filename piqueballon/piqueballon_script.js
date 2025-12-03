// ----- VARIABLES GLOBALES -----
let balloons = [];
let correctBalloon = null;

// ----- INITIALISATION DU JEU -----
function startGame() {
    // préparation du jeu
    createBalloons();
}

// ----- CRÉATION DES BALLONS -----
function createBalloons() {
    // génération des ballons
    const container = document.querySelector(".balloons-area");
    const maxX = container.offsetWidth - 60;  
    const maxY = container.offsetHeight - 80;
    for(var i = 0; i < 5 ; i++){
        const balloon = document.createElement("div");
        balloon.classList.add("balloon");

        

        balloon.style.left = Math.random() * maxX + "px";
        balloon.style.top = Math.random() * maxY + "px";

        balloon.addEventListener("click", handleBalloonClick);

        container.appendChild(balloon);
    }
    const balloonToPop = document.createElement("div");
    balloonToPop.classList.add("balloon-to-pop");

    balloonToPop.style.left = Math.random() * maxX + "px";
    balloonToPop.style.top = Math.random() * maxY + "px";

    balloonToPop.addEventListener("click", handleBalloonClick);

    container.appendChild(balloonToPop);    
}

// ----- GÉRER LE CLIC SUR UN BALLON -----
function handleBalloonClick(event) {
    alert("Ballon cliqué !");
}

// ----- FIN DE PARTIE -----
function endGame(win) {
    // victoire ou défaite
}

// ----- LANCEMENT -----
window.onload = () => {
    startGame();
    
};