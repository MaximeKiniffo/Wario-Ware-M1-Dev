const GameManager = {
    // Chemins vers les jeux
    gamesList: [

        'Jeu9/jeu9.html',

    ],

    // Commencer le jeu depuis accueil
    startGame: function () {
        sessionStorage.setItem('remainingGames', JSON.stringify(this.gamesList));

        sessionStorage.setItem('totalGames', this.gamesList.length);

        sessionStorage.setItem('currentGameIndex', '0');

        this.pickNextGame(this.gamesList);
    },

    onWin: function () {
        console.log("Victoire !");

        let remaining = JSON.parse(sessionStorage.getItem('remainingGames'));
        const currentPath = window.location.pathname;

        remaining = remaining.filter(game => !currentPath.includes(game));

        // Incrémenter le score AVANT de vérifier s'il reste des jeux
        let currentIndex = parseInt(sessionStorage.getItem('currentGameIndex') || '0', 10);
        currentIndex++;
        sessionStorage.setItem('currentGameIndex', currentIndex);

        if (remaining.length === 0) {
            // --- LOGIQUE FINALE (VICTOIRE TOTALE) ---
            const totalGames = parseInt(sessionStorage.getItem('totalGames') || '0', 10);

            // On sauvegarde le score final pour l'écran de victoire
            sessionStorage.setItem('victoryScore', currentIndex);
            sessionStorage.setItem('victoryTotal', totalGames);

            // On nettoie la session comme dans onLose
            sessionStorage.removeItem('remainingGames');
            sessionStorage.removeItem('totalGames');
            sessionStorage.removeItem('currentGameIndex');

            // Redirection vers la page Victoire
            this.redirectToRoot('Victoire/victoire.html');
        } else {
            // --- CONTINUER LE JEU ---
            sessionStorage.setItem('remainingGames', JSON.stringify(remaining));
            this.pickNextGame(remaining);
        }
    },

    onLose: function () {
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

    pickNextGame: function (gamesArray) {
        const randomIndex = Math.floor(Math.random() * gamesArray.length);
        const nextGame = gamesArray[randomIndex];
        this.redirectToRoot(nextGame);
    },

    redirectToRoot: function (path) {
        window.location.href = '../' + path;
    },

    displayScore: function () {
        const current = parseInt(sessionStorage.getItem('currentGameIndex') || '0', 10);
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
