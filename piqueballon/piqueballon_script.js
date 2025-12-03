// ----- VARIABLES GLOBALES -----
let balloons = [];
let correctBalloon = null;

// ----- INITIALISATION DU JEU -----
function startGame() {
    // préparation du jeu
    createBalloons();
}

function createBalloon(container, maxX, maxY){
    const balloon = document.createElement("div");
        balloon.classList.add("balloon");

        balloon.style.left = Math.random() * maxX + "px";
        balloon.style.top = Math.random() * maxY + "px";

        balloon.addEventListener("click", handleBadBalloonClick);

        container.appendChild(balloon);
}

function createBalloonToPop(container, maxX, maxY){
    const balloonToPop = document.createElement("div");
    balloonToPop.classList.add("balloon-to-pop");

    balloonToPop.style.left = Math.random() * maxX + "px";
    balloonToPop.style.top = Math.random() * maxY + "px";

    balloonToPop.addEventListener("click", handleGoodBalloonClick);

    container.appendChild(balloonToPop); 
}

// ----- CRÉATION DES BALLONS -----
function createBalloons() {
    // génération des ballons
    const container = document.querySelector(".balloons-area");
    const maxX = container.offsetWidth - 60;  
    const maxY = container.offsetHeight - 80;
    for(var i = 0; i < 5 ; i++){
        createBalloon(container, maxX, maxY);
    }
    createBalloonToPop(container, maxX, maxY);
}

// ----- GÉRER LE CLIC SUR UN BALLON -----
function handleBadBalloonClick(event) {
    alert("mauvais ballon");
    endGame(false);
}

function handleGoodBalloonClick(event){
    alert("bon ballon");
    endGame(true);
}

// ----- FIN DE PARTIE -----
function endGame(win) {
    if(win) {
        winTitle = document.createElement("h1");
        winTitle.textContent = "GAGNÉ !";
        winTitle.classList.add("win-title");
        document.querySelector(".game-container").appendChild(winTitle);
    } else {
        loseTitle = document.createElement("h1");
        loseTitle.textContent = "PERDU !"
        loseTitle.classList.add("lose-title");
        document.querySelector(".game-container").appendChild(loseTitle);
    }
    document.querySelector(".balloons-area").innerHTML = "";
    

}

// ----- LANCEMENT -----
window.onload = () => {
    startGame();
    
};