const GameManager = {
    // Liste de tous les jeux 
    gamesList: [
        'jeu1_dossier/index.html',
        'jeu2_dossier/game.html',
        'jeu3/jeu3.html',
        // mettre tous les chemins ici
    ],

    // Fonction quand le joueur gagne
    onWin: function() {
        console.log("Victoire ! Calcul du prochain jeu...");
        
        let remaining = JSON.parse(sessionStorage.getItem('remainingGames'));

        if (!remaining || remaining.length === 0) {
             const currentPath = window.location.pathname; 
             remaining = this.gamesList.filter(game => !currentPath.includes(game));
        }

        const currentPath = window.location.pathname;
        remaining = remaining.filter(game => !currentPath.includes(game));

        if (remaining.length === 0) {
            // Victoire, il ne reste aucun jeu
            this.redirectToRoot('index.html'); // Ou une page de victoire ?
        } else {
            // Choix random d'un jeu
            const randomIndex = Math.floor(Math.random() * remaining.length);
            const nextGame = remaining[randomIndex];
            const nextRemaining = remaining.filter(g => g !== nextGame);
            sessionStorage.setItem('remainingGames', JSON.stringify(nextRemaining));

            this.redirectToRoot(nextGame);
        }
    },

    // Fonction quand le joueur perd 
    onLose: function() {
        console.log("Défaite. Retour à l'accueil.");
        sessionStorage.removeItem('remainingGames'); // Reset progress
        this.redirectToRoot('index.html');
    },

    redirectToRoot: function(path) {
        // Il faut monter d'un niveau étant donné que les jeux sont dans un sous dossier
        window.location.href = '../' + path;
    }
};