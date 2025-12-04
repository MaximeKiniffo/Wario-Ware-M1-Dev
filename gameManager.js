const GameManager = {
    // Chemins vers les jeux
    gamesList: [
        'jeu2/jeu2.html', // Modifier selon vos chemins
        'jeu3/jeu3.html',
        'Jeu1/Jeu1.html'   
    ],

    // Commencer le jeu depuis accueil
    startGame: function() {
        sessionStorage.setItem('remainingGames', JSON.stringify(this.gamesList));

        sessionStorage.setItem('totalGames', this.gamesList.length);
        
        this.pickNextGame(this.gamesList);
    },

    onWin: function() {
        console.log("Victoire !");
        
        let remaining = JSON.parse(sessionStorage.getItem('remainingGames'));
        
        const currentPath = window.location.pathname; 
        remaining = remaining.filter(game => !currentPath.includes(game));

        if (remaining.length === 0) {
            // Redirection vers l'accueil, ou vers une page de victoire ?
            this.redirectToRoot('Accueil/accueil.html'); 
        } else {
            let currentIndex = parseInt(sessionStorage.getItem('currentGameIndex') || 1);
            sessionStorage.setItem('currentGameIndex', currentIndex + 1);

            sessionStorage.setItem('remainingGames', JSON.stringify(remaining));
            this.pickNextGame(remaining);
        }
    },

    onLose: function() {
        console.log("Défaite.");
        sessionStorage.removeItem('remainingGames'); 
        sessionStorage.removeItem('totalGames');
        sessionStorage.removeItem('currentGameIndex');
        this.redirectToRoot('Accueil/accueil.html');
    },

    pickNextGame: function(gamesArray) {
        const randomIndex = Math.floor(Math.random() * gamesArray.length);
        const nextGame = gamesArray[randomIndex];
        this.redirectToRoot(nextGame);
    },

    redirectToRoot: function(path) {
        window.location.href = '../' + path;
    },

    displayScore: function() {
        const current = sessionStorage.getItem('currentGameIndex') || 1;
        const total = sessionStorage.getItem('totalGames') || '?';

        const scoreDiv = document.createElement('div');
        scoreDiv.innerText = `${current} / ${total}`;
        
        // Style CSS injecté directement via JS pour ne pas toucher à tous tes fichiers CSS
        Object.assign(scoreDiv.style, {
            position: 'absolute',
            bottom: '20px', // En bas à droite
            right: '20px',
            fontSize: '3rem',
            fontFamily: '"Gowun Batang", serif', // On reprend ta police
            fontWeight: 'bold',
            color: '#FDF5E6', // Crème
            backgroundColor: 'rgba(93, 64, 43, 0.8)', // Fond marron semi-transparent
            padding: '10px 20px',
            borderRadius: '10px',
            zIndex: '1000', // S'assure qu'il est au-dessus de tout
            pointerEvents: 'none', // Pour ne pas bloquer les clics
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        });

        document.body.appendChild(scoreDiv);
    }
};