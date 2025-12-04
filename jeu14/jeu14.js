(function(){
	const board = document.getElementById('board');
	const safeEl = document.getElementById('safe');
	const hint = document.getElementById('hint');
	const canvas = document.getElementById('mazeCanvas');
	if (!board || !safeEl || !canvas) return;

	const WALL_COLOR = {r:207, g:94, b:83, a:255}; // #CF5E53
	const PATH_COLOR = '#FFF1D2';

	// son de succès (joué quand la sortie devient verte)
	const SUCCESS_SOUND_SRC = 'resources/00E2_0010.wav';
	const successAudio = new Audio(SUCCESS_SOUND_SRC);
	successAudio.preload = 'auto';

	// tentatively unlock audio playback on first user interaction (some navigateurs bloquent la lecture
	// automatique sauf après un 'gesture' explicite). On first pointerdown/touchstart on la teste.
	(function unlockAudioOnFirstGesture(){
		function _unlock(){
			// essayer de jouer puis stopper immédiatement pour débloquer l'API audio
			successAudio.play().then(()=>{
				successAudio.pause();
				successAudio.currentTime = 0;
			}).catch(()=>{
				// si échec, on ignore ; l'audio sera tenté à l'événement de succès
			});
			document.removeEventListener('pointerdown', _unlock);
			document.removeEventListener('touchstart', _unlock);
		}
		document.addEventListener('pointerdown', _unlock, {once:true});
		document.addEventListener('touchstart', _unlock, {once:true});
	})();

	// ratio de pixel du périphérique pour un rendu net du canvas
	const DPR = Math.max(1, window.devicePixelRatio || 1);

	// Configuration du labyrinthe (taille des cellules en px) — ajustée pour des cellules circulaires rapprochées
	// Réduire CELL_SIZE rapproche les centres ; augmenter MAX_COLS/ROWS permet plus de cellules si l'espace le permet
		const CELL_SIZE = 100; 
		const MAX_COLS = 8;
		const MAX_ROWS = 8;
		const MAX_STEPS_ALLOWED = 10; 
		const CURSOR_SPEED_PX_PER_SEC = 450;

	let safeSet = false;
	let center = {x:0,y:0};

	// initialiser/redimensionner le canvas en fonction de la taille de la zone
	function resizeCanvas(){
		const w = board.clientWidth;
		const h = board.clientHeight;
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
		canvas.width = Math.floor(w * DPR);
		canvas.height = Math.floor(h * DPR);
	}
	resizeCanvas();
	window.addEventListener('resize', ()=>{
		// regenerate maze on resize
		resizeCanvas();
		generateAndDrawMaze();
		if (safeSet) positionSafeElement();
	});

	const ctx = canvas.getContext('2d');

	// Génération du labyrinthe : backtracker récursif sur une grille de cellules
		function generateMaze(cols, rows){
	// cells : chaque cellule a des murs (top,right,bottom,left) et un drapeau visited
		const cells = new Array(cols * rows).fill(0).map(()=>({top:true,right:true,bottom:true,left:true,visited:false}));

		function index(x,y){ return x + y * cols; }

		const stack = [];
		const startX = Math.floor(Math.random()*cols);
		const startY = Math.floor(Math.random()*rows);
		let cx = startX, cy = startY;
		cells[index(cx,cy)].visited = true;
		let visitedCount = 1;
		const total = cols*rows;

		while(visitedCount < total){
			const neighbors = [];
		
			if (cy > 0 && !cells[index(cx,cy-1)].visited) neighbors.push({nx:cx, ny:cy-1, dir:'top'});
			if (cx < cols-1 && !cells[index(cx+1,cy)].visited) neighbors.push({nx:cx+1, ny:cy, dir:'right'});
			if (cy < rows-1 && !cells[index(cx,cy+1)].visited) neighbors.push({nx:cx, ny:cy+1, dir:'bottom'});
			if (cx > 0 && !cells[index(cx-1,cy)].visited) neighbors.push({nx:cx-1, ny:cy, dir:'left'});

			if (neighbors.length){
				const n = neighbors[Math.floor(Math.random()*neighbors.length)];
				
				const cur = cells[index(cx,cy)];
				const nxt = cells[index(n.nx,n.ny)];
				if (n.dir === 'top'){ cur.top = false; nxt.bottom = false; }
				if (n.dir === 'right'){ cur.right = false; nxt.left = false; }
				if (n.dir === 'bottom'){ cur.bottom = false; nxt.top = false; }
				if (n.dir === 'left'){ cur.left = false; nxt.right = false; }
				stack.push({x:cx,y:cy});
				cx = n.nx; cy = n.ny;
				cells[index(cx,cy)].visited = true;
				visitedCount++;
			} else if (stack.length){
				const p = stack.pop(); cx = p.x; cy = p.y;
			}
		}

		return {cols, rows, cells, index};
	}

	// dessiner le labyrinthe : remplir le fond avec la couleur des murs puis creuser des cellules circulaires et des connecteurs circulaires
		function drawMaze(maze){
			const w = canvas.width; const h = canvas.height;
			// remplir avec la couleur des murs
			ctx.fillStyle = rgbString(WALL_COLOR);
			ctx.fillRect(0,0,w,h);

			const cols = maze.cols; const rows = maze.rows;
			const cellW = Math.floor(w / cols);
			const cellH = Math.floor(h / rows);

			ctx.fillStyle = PATH_COLOR;
			// dessiner les cellules circulaires et les connecteurs circulaires
			for (let y=0;y<rows;y++){
				for (let x=0;x<cols;x++){
					const cell = maze.cells[maze.index(x,y)];

                    const cx = Math.floor(x * cellW + cellW/2);
					const cy = Math.floor(y * cellH + cellH/2);
					// calculer un petit espacement (gap) et définir le rayon pour que les cercles
					// soient proches mais conservent un petit écart visuel quel que soit l'écran
					const minDim = Math.min(cellW, cellH);
					const gapPx = Math.max(2, Math.min(8, Math.floor(minDim * 0.06))); // petit espace relatif
					// réduire légèrement le rayon pour rendre les cercles un peu plus petits
					const radiusRaw = Math.max(6, Math.floor((minDim - gapPx) / 2));
					const radius = Math.max(4, Math.floor(radiusRaw * 0.85));
						// dessiner la cellule circulaire (chemin)
					ctx.beginPath();
					ctx.arc(cx, cy, radius, 0, Math.PI*2);
					ctx.fill();

					// connecteurs : dessiner un cercle intermédiaire si le mur est ouvert (pas de mur)
					if (!cell.right){
						const midx = Math.floor(cx + cellW/2);
						const midy = cy;
						ctx.beginPath(); ctx.arc(midx, midy, radius, 0, Math.PI*2); ctx.fill();
					}
					if (!cell.bottom){
						const midx = cx;
						const midy = Math.floor(cy + cellH/2);
						ctx.beginPath(); ctx.arc(midx, midy, radius, 0, Math.PI*2); ctx.fill();
					}

					// dessiner des segments de contour uniquement là où il y a un mur (le contour apparaît seulement là où les cercles NE se touchent PAS)
					const strokeColor = '#EC6A5F';
					ctx.strokeStyle = strokeColor;
					ctx.lineWidth = Math.max(2, Math.floor(radius * 0.1));
					ctx.lineCap = 'round';
					ctx.lineJoin = 'round';

                    if (cell.top){ ctx.beginPath(); ctx.arc(cx, cy, radius, -3*Math.PI/4, -Math.PI/4); ctx.stroke(); }
					if (cell.right){ ctx.beginPath(); ctx.arc(cx, cy, radius, -Math.PI/4, Math.PI/4); ctx.stroke(); }
					if (cell.bottom){ ctx.beginPath(); ctx.arc(cx, cy, radius, Math.PI/4, 3*Math.PI/4); ctx.stroke(); }
					if (cell.left){ ctx.beginPath(); ctx.arc(cx, cy, radius, 3*Math.PI/4, 5*Math.PI/4); ctx.stroke(); }
				}
			}
		}

	function rgbString(c){ return 'rgba('+c.r+','+c.g+','+c.b+','+(c.a||1)+')'; }

	// choisir un coin aléatoire et creuser une sortie à cet endroit (ouvrir le bord vers l'extérieur)
		function carveExit(maze){
		const cols = maze.cols; const rows = maze.rows;
		// possible corners: top-left, top-right, bottom-left, bottom-right
		const corners = [ {x:0,y:0}, {x:cols-1,y:0}, {x:0,y:rows-1}, {x:cols-1,y:rows-1} ];
		const c = corners[Math.floor(Math.random()*corners.length)];

		const cellW = Math.floor(canvas.width / cols);
		const cellH = Math.floor(canvas.height / rows);
		const pad = Math.max(1, Math.floor(Math.min(cellW,cellH) * 0.12));

			const px = Math.floor(c.x * cellW);
			const py = Math.floor(c.y * cellH);
			// creuser une ouverture circulaire au centre de la cellule et un couloir vers le bord
			ctx.fillStyle = PATH_COLOR;
			const cx = Math.floor(px + cellW/2);
			const cy = Math.floor(py + cellH/2);
			const minDim = Math.min(cellW, cellH);
			const gapPx = Math.max(2, Math.min(8, Math.floor(minDim * 0.06)));
			const radiusRaw = Math.max(6, Math.floor((minDim - gapPx) / 2));
			const radius = Math.max(4, Math.floor(radiusRaw * 0.85));

            ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.fill();
			if (c.x === 0){
				ctx.fillRect(0, cy - radius, cx, radius*2);
			} else {
				ctx.fillRect(cx, cy - radius, canvas.width - cx, radius*2);
			}
			if (c.y === 0){
				ctx.fillRect(cx - radius, 0, radius*2, cy);
			} else {
				ctx.fillRect(cx - radius, cy, radius*2, canvas.height - cy);
			}

					return {x: Math.max(0, cx - radius), y: Math.max(0, cy - radius), w: radius*2, h: radius*2, cellX: c.x, cellY: c.y};
	}

	// régénérer et dessiner un nouveau labyrinthe
	let currentMaze = null;
	let exitRect = null;
	let exitEl = null;
	let exitReached = false;
	let countdownEl = null;
	let countdownInterval = null;
	let countdownRemaining = 0;

	function ensureExitEl(){
		if (exitEl) return;
		exitEl = document.createElement('div');
		exitEl.id = 'exit';
		exitEl.className = 'exit';
		exitEl.setAttribute('aria-hidden','true');
		board.appendChild(exitEl);
	}

	function positionExitElement(){
		if (!exitRect) return;
		ensureExitEl();
		const crect = canvas.getBoundingClientRect();
		const left = crect.left + (exitRect.x / DPR);
		const top = crect.top + (exitRect.y / DPR);
		const w = Math.max(6, exitRect.w / DPR);
		const h = Math.max(6, exitRect.h / DPR);
		exitEl.style.left = left + 'px';
		exitEl.style.top = top + 'px';
		exitEl.style.width = w + 'px';
		exitEl.style.height = h + 'px';
		exitEl.style.transform = 'translate(0,0)';
		exitEl.classList.remove('success');
		exitReached = false;
	}

	function createCountdownEl(){
		if (countdownEl) return;
		countdownEl = document.createElement('div');
		countdownEl.id = 'countdown';
		countdownEl.className = 'countdown';
		countdownEl.setAttribute('aria-hidden','true');
		board.appendChild(countdownEl);
	}

	function clearCountdown(){
		if (countdownInterval){ clearInterval(countdownInterval); countdownInterval = null; }
		if (countdownEl){ countdownEl.remove(); countdownEl = null; }
		countdownRemaining = 0;
	}

	function startCountdown(seconds){
		clearCountdown();
		createCountdownEl();
		countdownRemaining = Math.max(0, Math.floor(seconds));
		if (!countdownEl) return;
		countdownEl.textContent = countdownRemaining + 's';
		countdownInterval = setInterval(()=>{
			countdownRemaining -= 1;
			if (countdownRemaining <= 0){
				clearCountdown();
				if (!exitReached) window.location.href = '../index.html';
				return;
			}
			if (countdownEl) countdownEl.textContent = countdownRemaining + 's';
		}, 1000);
	}
		function generateAndDrawMaze(){
			let cols = Math.floor((canvas.width/DPR) / CELL_SIZE);
			let rows = Math.floor((canvas.height/DPR) / CELL_SIZE);
			cols = Math.max(3, Math.min(MAX_COLS, cols));
			rows = Math.max(3, Math.min(MAX_ROWS, rows));
		// ajuster cols/rows à la grille en pixels du canvas
			// régénérer jusqu'à obtenir un labyrinthe suffisamment simple (chemin court du départ possible à la sortie)
			let attempts = 0;
			let maze = null;
			let exit = null;
			do {
				maze = generateMaze(cols, rows);
				currentMaze = maze;
				drawMaze(maze);
				exit = carveExit(maze);
				attempts++;
				// calculer le nombre de pas maximum autorisés en fonction de la taille d'une cellule
				// et d'une estimation de la vitesse du pointeur pour viser une traversée en ~5s
				const cellW = Math.floor((canvas.width) / cols);
				const cellH = Math.floor((canvas.height) / rows);
				// distance moyenne d'un pas en pixels CSS (convertir des pixels device en px page en divisant par DPR)
				const avgStepPx = ((cellW + cellH) / 2) / DPR;
				const allowedStepsFromSpeed = Math.max(3, Math.floor((5 * CURSOR_SPEED_PX_PER_SEC) / Math.max(1, avgStepPx)));
				const effectiveMaxSteps = Math.min(100, Math.max(3, allowedStepsFromSpeed));
				// si la position safe n'est pas encore définie, on accepte le premier labyrinthe
				if (!safeSet) break;
				// calculer la distance (en pas de cellule) du départ réel à la sortie
				const startCell = pagePointToCell(center.x, center.y, maze);
				const steps = bfsSteps(maze, startCell.x, startCell.y, exit.cellX, exit.cellY);
				if (steps === -1) continue; // non accessible (rare)
				if (steps <= effectiveMaxSteps) break;
			} while(attempts < 10);
			currentMaze = maze;
			exitRect = exit;
			positionExitElement();
			startCountdown(5);
	}

	// convertir une coordonnée page en indices de cellule du labyrinthe
		function pagePointToCell(px, py, maze){
			const rect = canvas.getBoundingClientRect();
			const cellW = Math.floor(canvas.width / maze.cols) / DPR;
			const cellH = Math.floor(canvas.height / maze.rows) / DPR;
			const x = Math.floor((px - rect.left) / cellW);
			const y = Math.floor((py - rect.top) / cellH);
			return {x: Math.max(0, Math.min(maze.cols-1, x)), y: Math.max(0, Math.min(maze.rows-1, y))};
		}

	// BFS pour calculer le nombre de pas entre deux cellules ; retourne -1 si non atteignable
		function bfsSteps(maze, sx, sy, tx, ty){
			const cols = maze.cols, rows = maze.rows;
			const idx = maze.index;
			const visited = new Array(cols*rows).fill(false);
			const q = [];
			q.push({x:sx,y:sy,dist:0});
			visited[idx(sx,sy)] = true;
			while(q.length){
				const u = q.shift();
				if (u.x===tx && u.y===ty) return u.dist;
				const cell = maze.cells[idx(u.x,u.y)];

                if (!cell.top && u.y>0 && !visited[idx(u.x,u.y-1)]){ visited[idx(u.x,u.y-1)] = true; q.push({x:u.x,y:u.y-1,dist:u.dist+1}); }
				if (!cell.right && u.x<cols-1 && !visited[idx(u.x+1,u.y)]){ visited[idx(u.x+1,u.y)] = true; q.push({x:u.x+1,y:u.y,dist:u.dist+1}); }
				if (!cell.bottom && u.y<rows-1 && !visited[idx(u.x,u.y+1)]){ visited[idx(u.x,u.y+1)] = true; q.push({x:u.x,y:u.y+1,dist:u.dist+1}); }
				if (!cell.left && u.x>0 && !visited[idx(u.x-1,u.y)]){ visited[idx(u.x-1,u.y)] = true; q.push({x:u.x-1,y:u.y,dist:u.dist+1}); }
			}
			return -1;
		}

	// positionner l'élément DOM représentant la zone safe au centre donné
	function positionSafeElement(){
		safeEl.style.left = center.x + 'px';
		safeEl.style.top = center.y + 'px';
		safeEl.style.transform = 'translate(-50%,-50%)';
		safeEl.classList.remove('hidden');
	}

	// obtenir la couleur d'un pixel aux coordonnées page (en tenant compte du rect du canvas et du DPR)
	function getCanvasPixelColor(pageX,pageY){
		const rect = canvas.getBoundingClientRect();
		const cx = Math.floor((pageX - rect.left) * DPR);
		const cy = Math.floor((pageY - rect.top) * DPR);
		if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) return null;
		const d = ctx.getImageData(cx,cy,1,1).data;
		return {r:d[0], g:d[1], b:d[2], a:d[3]};
	}

	function colorEquals(c1,c2){ return c1 && c2 && c1.r===c2.r && c1.g===c2.g && c1.b===c2.b; }

	// helper distance (distance euclidienne)
	function dist(x1,y1,x2,y2){ const dx=x1-x2, dy=y1-y2; return Math.sqrt(dx*dx+dy*dy); }

	function onPointerMove(e){
		const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
		const y = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || 0;

		if (!safeSet){
			safeSet = true;
			center.x = x; center.y = y;
			positionSafeElement();
			const radius = Math.max(70, Math.min(200, Math.round((parseFloat(getComputedStyle(safeEl).width)||200)/2)));
			ctx.save();
			ctx.globalCompositeOperation = 'source-over';
			ctx.beginPath();
			ctx.fillStyle = PATH_COLOR;
			const rect = canvas.getBoundingClientRect();
			const cx = (x - rect.left) * DPR;
			const cy = (y - rect.top) * DPR;
			ctx.arc(cx, cy, radius*DPR, 0, Math.PI*2);
			ctx.fill();
			ctx.restore();
			if (hint) hint.classList.add('hidden');
			generateAndDrawMaze();
			positionSafeElement();
			positionExitElement();
			return;
		}

		if (exitRect && !exitReached){
			const crect = canvas.getBoundingClientRect();
			const exLeft = crect.left + (exitRect.x / DPR);
			const exTop = crect.top + (exitRect.y / DPR);
			const exRight = exLeft + (exitRect.w / DPR);
			const exBottom = exTop + (exitRect.h / DPR);
			if (x >= exLeft && x <= exRight && y >= exTop && y <= exBottom){
				// success
				exitReached = true;
				ensureExitEl();
				exitEl.classList.add('success');
				// jouer le son de succès (si possible)
				try {
					successAudio.currentTime = 0;
					const p = successAudio.play();
					if (p && p.catch) p.catch(()=>{});
				} catch (err) { /* ignorer les erreurs de lecture */ }
				clearCountdown();
				window.removeEventListener('pointermove', onPointerMove, {passive:true});
				window.removeEventListener('touchmove', onPointerMove, {passive:true});
				return;
			}
		}

		const radius = Math.max(70, Math.min(200, Math.round((parseFloat(getComputedStyle(safeEl).width)||200)/2)));
		if (dist(x,y, center.x, center.y) <= radius) return;

		const px = getCanvasPixelColor(x,y);
		if (!px) return; 
		if (colorEquals(px, WALL_COLOR)){
			window.location.href = '../index.html';
		}
	}


	generateAndDrawMaze();

	window.addEventListener('pointermove', onPointerMove, {passive:true});
	window.addEventListener('touchmove', onPointerMove, {passive:true});
})();
