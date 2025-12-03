//fonction de navigation entre les différents jeux
const navigateIn = (page) => {
    const root = `${page}/${page}.html`;
    window.location.href = root;
}