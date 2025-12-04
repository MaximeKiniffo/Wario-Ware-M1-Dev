const GameManager = {
    // Chemins vers les jeux
    gamesList: [
       'Jeu1/jeu1.html',
        'jeu2/jeu2.html', // Modifier selon vos chemins
        'jeu3/jeu3.html',
        'jeu4/jeu4.html',
        'jeu5/jeu5.html',
        'Jeu6/jeu6.html',
        'Jeu7/jeu7.html',
        'Jeu8/jeu8.html',
        'Jeu9/jeu9.html',
        'Jeu10/jeu10.html',
        'Jeu11/jeu11.html',
        'Jeu12/jeu12.html',
        'Jeu13/jeu13.html',
        'Jeu14/jeu14.html',
    ],

    // Commencer le jeu depuis accueil
    startGame: function() {
        sessionStorage.setItem('remainingGames', JSON.stringify(this.gamesList));

        sessionStorage.setItem('totalGames', this.gamesList.length);

        sessionStorage.setItem('currentGameIndex', 0);
        
        this.pickNextGame(this.gamesList);
    },

    onWin: function() {
        console.log("Victoire !");
        
        let remaining = JSON.parse(sessionStorage.getItem('remainingGames'));
        const currentPath = window.location.pathname; 
        
        remaining = remaining.filter(game => !currentPath.includes(game));

        if (remaining.length === 0) {
            // --- LOGIQUE FINALE (VICTOIRE TOTALE) ---
            const currentIndex = parseInt(sessionStorage.getItem('currentGameIndex') || '1', 10);
            const totalGames = parseInt(sessionStorage.getItem('totalGames') || '0', 10);

            // On sauvegarde le score final pour l'écran de victoire
            sessionStorage.setItem('victoryScore', Number.isFinite(currentIndex) ? currentIndex : 0);
            sessionStorage.setItem('victoryTotal', Number.isFinite(totalGames) ? totalGames : 0);

            // On nettoie la session comme dans onLose
            sessionStorage.removeItem('remainingGames'); 
            sessionStorage.removeItem('totalGames');
            sessionStorage.removeItem('currentGameIndex');

            // Redirection vers la page Victoire
            this.redirectToRoot('index.html'); 
        } else {
            // --- CONTINUER LE JEU ---
            let currentIndex = parseInt(sessionStorage.getItem('currentGameIndex') || 1);
            sessionStorage.setItem('currentGameIndex', currentIndex + 1);

            sessionStorage.setItem('remainingGames', JSON.stringify(remaining));
            this.pickNextGame(remaining);
        }
    },

    onLose: function() {
        console.log("Défaite.");

        const currentIndex = parseInt(sessionStorage.getItem('currentGameIndex') || '1', 10);
        const totalGames = parseInt(sessionStorage.getItem('totalGames') || '0', 10);

        sessionStorage.setItem('defeatScore', Number.isFinite(currentIndex) ? currentIndex : 0);
        sessionStorage.setItem('defeatTotal', Number.isFinite(totalGames) ? totalGames : 0);

        sessionStorage.removeItem('remainingGames'); 
        sessionStorage.removeItem('totalGames');
        sessionStorage.removeItem('currentGameIndex');
        this.redirectToRoot('Defaite/defaite.html');
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
        scoreDiv.innerText = `Score ${current} / ${total}`;
        
        // Style CSS injecté directement via JS pour ne pas toucher à tous tes fichiers CSS
        Object.assign(scoreDiv.style, {
            position: 'absolute',
            bottom: '30px', 
            right: '30px',
            fontSize: '1.5rem', // Taille moyenne
            fontFamily: '"Gowun Batang", serif',
            color: '#FDF5E6', // Crème
            backgroundColor: 'rgba(169, 131, 86, 0.9)', // Fond marron clair
            border: '4px solid #5D402B', // Bordure marron foncé
            padding: '10px 20px',
            borderRadius: '8px', 
            zIndex: '1000',
            pointerEvents: 'none', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        });

        document.body.appendChild(scoreDiv);
    }
};
