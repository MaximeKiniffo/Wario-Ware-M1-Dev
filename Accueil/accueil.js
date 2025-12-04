
document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-btn');
    const creditsBtn = document.getElementById('credits-btn');
    
    if(playBtn) {
        playBtn.addEventListener('click', () => {
            GameManager.startGame();
        });
    }
    
    if(creditsBtn) {
        creditsBtn.addEventListener('click', () => {
            window.location.href = '../credits/credits.html';
        });
    }
});
