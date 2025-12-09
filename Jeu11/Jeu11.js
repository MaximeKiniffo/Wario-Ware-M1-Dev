const cubes = document.querySelectorAll("td")
let nbcubes = 0
let colorSelect = "green"
let colorUnSelect = "#FFF1D2"
let compteur = 0
let win = false
let lose = false
let timer

const checkCube = (cube) => {
    const backgroundColor = cube.style.backgroundColor
    if (backgroundColor == colorSelect) {
        cube.style.backgroundColor = colorUnSelect
        compteur -= 1
    } else {
        cube.style.backgroundColor = colorSelect
        compteur += 1
    }
    if (compteur >= 9) {
        onWin();
    }
}

cubes.forEach((e) => {
    e.addEventListener("click", (event) => {
        if (!lose & !win)
            checkCube(e)
    })
    nbcubes += 1
})

const onWin = () => {
    console.log("win")
    clearInterval(timer)
    win = true
    document.getElementById("win").style.visibility = "visible";
    setTimeout(() => {
        console.log("jeu suivant")
        GameManager.onWin();
    }, 1000)
}

function startCountdown() {
    let timeLeft = 5; // 5 secondes
    const countdownEl = document.getElementById("countdown");

    countdownEl.textContent = timeLeft;

    timer = setInterval(() => {
        timeLeft -= 0.10;
        timeLeft = timeLeft.toFixed(2)
        countdownEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            lose = true;
            document.getElementById("lost").style.visibility = "visible"
            setTimeout(() => {
                GameManager.onLose();
            }, 1500);
        }

    }, 100);
}

//fonction qui se lance au chargement de la page
const onStart = () => {
    const consigne = document.getElementById("consigneView");
    setTimeout(() => {
        consigne.style.visibility = "hidden"
        startCountdown()
    }, 2000)

}
window.onload = () => {
    GameManager.displayScore()
    onStart()
}

