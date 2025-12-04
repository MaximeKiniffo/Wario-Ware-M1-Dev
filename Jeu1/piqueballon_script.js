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

    // l'ajouter d'abord pour que le CSS s'applique (taille réelle)
    container.appendChild(balloon);

    // le placer aléatoirement dans la zone
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

    const padding = 30; // marge d'air par rapport aux bords

    const maxX = containerWidth - balloonWidth - padding;
    const maxY = containerHeight - balloonHeight - padding;

    const x = padding + Math.random() * Math.max(0, maxX);
    const y = padding + Math.random() * Math.max(0, maxY);

    balloon.style.left = x + "px";
    balloon.style.top = y + "px";
}



function createBalloons() {
    const container = document.querySelector(".balloons-area");

    // nettoyer les anciens ballons si besoin
    container.querySelectorAll(".balloon, .balloon-to-pop").forEach(b => b.remove());

    // mauvais ballons
    for (let i = 0; i < 5; i++) {
        createBalloonGeneric(container, "balloon", handleBadBalloonClick);
    }

    // bon ballon
    createBalloonGeneric(container, "balloon-to-pop", handleGoodBalloonClick);

    // timer si tu en as un
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
    } else {
        let loseTitle = document.querySelector(".lose-title");
        loseTitle.classList.remove("hidden");
    }
    const balloons = document.querySelectorAll(".balloon, .balloon-to-pop");
    balloons.forEach(b => b.remove());
}

window.onload = () => {
    startGame();
    
};