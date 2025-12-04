const cubes = document.querySelectorAll("td")
let nbcubes = 0
let colorSelect = "green"
let colorUnSelect = "#FFF1D2"
let compteur = 0

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
        checkCube(e)

    })
    nbcubes += 1
})

const onWin = () => {
    window.location.href = "/"
}

//fonction qui se lance au chargement de la page
const onStart = () => {
    const consigne = document.getElementById("consigneView");
    setTimeout(() => {
        consigne.style.visibility = "hidden"

    }, 2000)
}

onStart()
