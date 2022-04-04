const WALL = 'WALL';
const FLOOR = 'FLOOR';
const GAMER = 'GAMER';
const BALL = 'BALL';
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">';
const BALL_IMG = '<img src="img/ball.png">';
const GLUE_IMG = '<img src="img/candy.png">';

// Model:
var gBoard;
var gGamerPos;
var gGlueIntervalId;
var gBallIntervalId;
var gCollectedBalls = 0;
var gCountBalls = 2;
var gIsGlued = false;



function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	gBallIntervalId = setInterval(addBall, 5000);
	gGlueIntervalId = setInterval(addGlue, 5000);

}

function resetGame() {
	initGame()
	var elModal = document.querySelector('.victory-modal')
	elModal.style.display = 'none';
	gCollectedBalls = 0;
	gCountBalls = 2;
	var elCounter = document.querySelector('.counter')
	elCounter.innerText = gCollectedBalls;
}

function buildBoard() {
	var board = createMat(10, 12);

	for (var i = 0; i < board.length; i++) {
		var row = board[i];
		for (var j = 0; j < row.length; j++) {
			var cell = { type: FLOOR, gameElement: null }
			if (i === 0 || i === board.length - 1 ||
				j === 0 || j === row.length - 1) {
				cell.type = WALL;
			}
			board[i][j] = cell
		}
	}

	// Place the passages
	var moddleI = Math.floor((board.length - 1) / 2)
	var moddleJ = Math.floor((board[0].length - 1) / 2)

	board[0][moddleJ].type = FLOOR;
	board[board.length - 1][moddleJ].type = FLOOR;
	board[moddleI][0].type = FLOOR;
	board[moddleI][board[0].length - 1].type = FLOOR

	// Place the gamer and two balls
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	board[3][5].gameElement = BALL;
	board[6][7].gameElement = BALL;
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {
	var strHTML = '';

	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall'
			// if (currCell.type === FLOOR) cellClass += ' floor';
			// else if (currCell.type === WALL) cellClass += ' wall';

			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			switch (currCell.gameElement) {
				case GAMER:
					strHTML += GAMER_IMG;
					break;
				case BALL:
					strHTML += BALL_IMG;
					break;
			}
			// if (currCell.gameElement === GAMER) {
			// 	strHTML += GAMER_IMG;
			// } else if (currCell.gameElement === BALL) {
			// 	strHTML += BALL_IMG;
			// }

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if (gIsGlued) return;

	// Option 1 for handling passages:
	// if (i < 0) i = gBoard.length - 1;
	// if (i > gBoard.length - 1) i = 0;
	// if (j < 0) j = gBoard[0].length - 1;
	// if (j > gBoard[0].length - 1) j = 0;

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0) ||
		(iAbsDiff === 9) || (jAbsDiff === 11)) {

		if (targetCell.gameElement === BALL) {
			console.log('Collecting!');
			updateBallsCount();
			checkVictory();
			playAudio();
		} else if (targetCell.gameElement === GLUE) {
			gIsGlued = true;
			setTimeout(stopGlued, 3000)
		}

		// Move the gamer
		// Update the Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Update the Dom:
		renderCell(gGamerPos, '');

		// Update the Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// Update the Dom:
		renderCell(gGamerPos, GAMER_IMG);

	} else console.log('TOO FAR', iAbsDiff, jAbsDiff);
}

function updateBallsCount() {
	gCountBalls--
	gCollectedBalls++
	var elCounter = document.querySelector('.counter')
	elCounter.innerText = gCollectedBalls;
}

function checkVictory() {
	if (gCountBalls === 0) {
		clearInterval(gBallIntervalId)
		clearInterval(gGlueIntervalId);
		var elModal = document.querySelector('.victory-modal')
		elModal.style.display = 'block';
	}
}

function stopGlued() {
	gIsGlued = false
}

function addBall() {
	addElement(BALL, BALL_IMG)
	gCountBalls++
}

function addGlue() {
	var randPos = addElement(GLUE, GLUE_IMG)
	setTimeout(removeGlue, 3000, randPos);
}

function removeGlue(pos) {
	if (gBoard[pos.i][pos.j].gameElement === GAMER) return
	gBoard[pos.i][pos.j].gameElement = null;
	renderCell(pos, '');
}

function addElement(element, elementImg) {
	var randPos = getRandomEmptyPos2()
	var randCell = gBoard[randPos.i][randPos.j];
	randCell.gameElement = element;
	renderCell(randPos, elementImg);
	return randPos
}

// Option 1 for getRandomEmptyPos:
function getRandomEmptyPos1() {
	var randomI = getRandomInt(0, gBoard.length);
	var randomJ = getRandomInt(0, gBoard[0].length);
	var randPos = { i: randomI, j: randomJ };
	if (isCellEmpty(randPos)) {
		return randPos
	} else {
		return getRandomEmptyPos1();
	}
}

// Option 2 for getRandomEmptyPos:
function getRandomEmptyPos2() {
	var emptyPositions = []
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var pos = { i: i, j: j }
			if (isCellEmpty(pos)) {
				emptyPositions.push(pos)
			}
		}
	}
	var randIdx = getRandomInt(0, emptyPositions.length);
	var randPos = emptyPositions[randIdx];
	return randPos
}

function isCellEmpty(pos) {
	var cell = gBoard[pos.i][pos.j];
	return (cell.gameElement === null && cell.type === FLOOR);
}

function playAudio() {
	var audio = new Audio('sound/victory.mp3')
	audio.play();
}

function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location) // '.cell-2-5'
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

function handleKey(event) {
	var i = gGamerPos.i;
	var j = gGamerPos.j;

	// Option 2 for handling passages:
	switch (event.key) {
		case 'ArrowLeft':
			if (j === 0) moveTo(i, gBoard[0].length - 1)
			else moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			if (j === gBoard[0].length - 1) moveTo(i, 0)
			else moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			if (i === 0) moveTo(gBoard.length - 1, j)
			else moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			if (i === gBoard.length - 1) moveTo(0, j)
			else moveTo(i + 1, j);
			break;
	}
}

function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}
