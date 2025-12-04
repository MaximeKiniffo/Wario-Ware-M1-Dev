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
        console.log("win")
    }
}

cubes.forEach((e) => {
    e.addEventListener("click", (event) => {
        checkCube(e)

    })
    nbcubes += 1
})

