const GameManager = {
    // Chemins vers les jeux
    gamesList: [
        'jeu1/jeu1.html',
        'jeu2/jeu2.html', // Modifier selon vos chemins
        'jeu3/jeu3.html',
        'jeu4/jeu4.html',
        'jeu5/jeu5.html',
        'jeu6/jeu6.html',
        'jeu7/jeu7.html',
        'jeu8/jeu8.html',
        'jeu9/jeu9.html',
        'jeu10/jeu10.html',
        'jeu11/jeu11.html',
        'jeu12/jeu12.html',
        'jeu13/jeu13.html',
        'jeu14/jeu14.html'
    ],

    // Commencer le jeu depuis accueil
    startGame: function() {
        sessionStorage.setItem('remainingGames', JSON.stringify(this.gamesList));
        
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
            sessionStorage.setItem('remainingGames', JSON.stringify(remaining));
            this.pickNextGame(remaining);
        }
    },

    onLose: function() {
        console.log("Défaite.");
        sessionStorage.removeItem('remainingGames'); 
        this.redirectToRoot('Accueil/accueil.html');
    },

    pickNextGame: function(gamesArray) {
        const randomIndex = Math.floor(Math.random() * gamesArray.length);
        const nextGame = gamesArray[randomIndex];
        this.redirectToRoot(nextGame);
    },

    redirectToRoot: function(path) {
        window.location.href = '../' + path;
    }
};