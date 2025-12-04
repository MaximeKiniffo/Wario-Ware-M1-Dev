let clickTimer = null;

function startGame() {
    const instruction = document.querySelector(".instruction");
    
    setTimeout(() => {
        instruction.classList.add("hidden");
        createBalloons();
    }, 2000);
}

function createBalloonGeneric(container, className, clickHandler) {
    const balloon = document.createElement("div");
    balloon.classList.add(className);

    container.appendChild(balloon);

    placeBalloonRandom(container, balloon);

    if (clickHandler) {
        balloon.addEventListener("click", clickHandler);
    }

    return balloon;
}


function placeBalloonRandom(container, balloon) {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (!containerWidth || !containerHeight) {
        console.warn("La zone de ballons n'a pas encore de taille.");
        return;
    }

    const balloonWidth = balloon.offsetWidth;
    const balloonHeight = balloon.offsetHeight;

    const innerRatioX = 0.7;
    const innerRatioY = 0.7;

    const innerWidth = containerWidth * innerRatioX;
    const innerHeight = containerHeight * innerRatioY;

    const innerOffsetX = (containerWidth - innerWidth) / 2;
    const innerOffsetY = (containerHeight - innerHeight) / 2;

    const maxX = innerWidth - balloonWidth;
    const maxY = innerHeight - balloonHeight;

    const x = innerOffsetX + Math.random() * Math.max(0, maxX);
    const y = innerOffsetY + Math.random() * Math.max(0, maxY);

    balloon.style.left = x + "px";
    balloon.style.top = y + "px";
}




function createBalloons() {
    const container = document.querySelector(".balloons-area");

    container.querySelectorAll(".balloon, .balloon-to-pop").forEach(b => b.remove());

    for (let i = 0; i < 5; i++) {
        createBalloonGeneric(container, "balloon", handleBadBalloonClick);
    }

    createBalloonGeneric(container, "balloon-to-pop", handleGoodBalloonClick);

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
        let winTitle = document.querySelector(".win-title");
        winTitle.classList.remove("hidden");
        
        // Redirection vers le jeu suivant après 1 seconde
        setTimeout(() => {
            GameManager.onWin();
        }, 1000);
    } else {
        let loseTitle = document.querySelector(".lose-title");
        loseTitle.classList.remove("hidden");
        
        // Redirection vers l'accueil après 1 seconde
        setTimeout(() => {
            GameManager.onLose();
        }, 1000);
    }
    const balloons = document.querySelectorAll(".balloon, .balloon-to-pop");
    balloons.forEach(b => b.remove());
}


window.onload = () => {
    GameManager.displayScore();
    startGame();
    
};