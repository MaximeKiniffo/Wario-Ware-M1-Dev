document.addEventListener('DOMContentLoaded', () => {
    const scoreValue = document.getElementById('score-value');
    const creditsBtn = document.getElementById('credits-btn');
    const replayBtn = document.getElementById('replay-btn');

    // Récupération des scores stockés par GameManager.onWin
    const storedScore = parseInt(sessionStorage.getItem('victoryScore'), 10);
    const storedTotal = parseInt(sessionStorage.getItem('victoryTotal'), 10);
    
    // Valeur par défaut si jamais la session est vide (sécurité)
    const score = Number.isFinite(storedScore) ? storedScore : 0;
    const total = Number.isFinite(storedTotal) ? storedTotal : '?';

    scoreValue.textContent = `${score}/${total}`;

    creditsBtn?.addEventListener('click', () => {
        window.location.href = '../credits/credits.html';
    });

    replayBtn?.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // Nettoyage après affichage
    sessionStorage.removeItem('victoryScore');
    sessionStorage.removeItem('victoryTotal');
});