let balloons = [];
let correctBalloon = null;
let clickTimer = null;

function startGame() {
    const instruction = document.querySelector(".instruction");
    
    setTimeout(() => {
        instruction.classList.add("hidden");
        createBalloons();
    }, 2000);
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

function createBalloons() {
    const container = document.querySelector(".balloons-area");
    const maxX = container.offsetWidth - 60;  
    const maxY = container.offsetHeight - 80;
    for(var i = 0; i < 5 ; i++){
        createBalloon(container, maxX, maxY);
    }
    createBalloonToPop(container, maxX, maxY);
    clickTimer = setTimeout(() => {
        endGame(false);
    }, 1500);
    
}

function handleBadBalloonClick(event) {
    clearTimeout(clickTimer);
    endGame(false);
}

function handleGoodBalloonClick(event){
    clearTimeout(clickTimer);
    endGame(true);
}

function endGame(win) {
    if(win) {
        winTitle = document.querySelector(".win-title");
        winTitle.classList.remove("hidden");
    } else {
        loseTitle = document.querySelector(".lose-title");
        loseTitle.classList.remove("hidden");
    }
    const balloons = document.querySelectorAll(".balloon, .balloon-to-pop");
    balloons.forEach(b => b.remove());
}

window.onload = () => {
    startGame();
    
};