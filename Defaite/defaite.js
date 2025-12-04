document.addEventListener('DOMContentLoaded', () => {
    const scoreValue = document.getElementById('score-value');
    const creditsBtn = document.getElementById('credits-btn');
    const replayBtn = document.getElementById('replay-btn');

    const storedScore = parseInt(sessionStorage.getItem('defeatScore'), 10);
    const storedTotal = parseInt(sessionStorage.getItem('defeatTotal'), 10);
    const fallbackTotal = parseInt(sessionStorage.getItem('totalGames'), 10);

    const score = Number.isFinite(storedScore) ? storedScore : 0;
    const total = Number.isFinite(storedTotal)
        ? storedTotal
        : (Number.isFinite(fallbackTotal) ? fallbackTotal : '?');

    scoreValue.textContent = `${score}/${total}`;

    creditsBtn?.addEventListener('click', () => {
        window.location.href = '../credits/credits.html';
    });

    replayBtn?.addEventListener('click', () => {
        window.location.href = '../Accueil/accueil.html';
    });

    sessionStorage.removeItem('defeatScore');
    sessionStorage.removeItem('defeatTotal');
});
