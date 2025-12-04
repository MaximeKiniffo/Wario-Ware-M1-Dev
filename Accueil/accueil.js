
document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-btn');
    
    if(playBtn) {
        playBtn.addEventListener('click', () => {
            GameManager.startGame();
        });
    }
});
