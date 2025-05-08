/**
 * Connect Four Game
 * Main game logic and UI interactions
 * @author Nikhil Raj B
 * @version 1.0.0
 */

// Game constants
const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER = 1;
const AI = 2;

// Game state
let board = [];
let currentPlayer = PLAYER;
let gameOver = false;
let playerScore = 0;
let aiScore = 0;
let moveHistory = [];

// DOM elements
const gameBoard = document.getElementById('game-board');
const gameStatus = document.getElementById('game-status');
const newGameBtn = document.getElementById('new-game-btn');
const undoBtn = document.getElementById('undo-btn');
const playerScoreElement = document.getElementById('player-score');
const aiScoreElement = document.getElementById('ai-score');
const difficultySelect = document.getElementById('difficulty');

/**
 * Initialize the game
 */
function initGame() {
    // Create empty board
    board = Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY));
    currentPlayer = PLAYER;
    gameOver = false;
    moveHistory = [];
    
    // Update UI
    renderBoard();
    updateGameStatus('Your turn!');
    enableBoardClicks();
}

/**
 * Render the game board
 */
function renderBoard() {
    // Clear the board
    gameBoard.innerHTML = '';
    
    // Create column containers for each column (for click handling)
    for (let col = 0; col < COLS; col++) {
        const columnContainer = document.createElement('div');
        columnContainer.className = 'column';
        columnContainer.dataset.col = col;
        
        // Add click event to the column
        columnContainer.addEventListener('click', () => {
            if (!gameOver) {
                makeMove(col);
            }
        });
        
        // Add cells for this column (in reverse order for proper display)
        for (let row = ROWS - 1; row >= 0; row--) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            // Add player or AI class if the cell is occupied
            if (board[row][col] === PLAYER) {
                cell.classList.add('player');
            } else if (board[row][col] === AI) {
                cell.classList.add('ai');
            }
            
            columnContainer.appendChild(cell);
        }
        
        gameBoard.appendChild(columnContainer);
    }
}

/**
 * Make a move in the specified column
 * @param {number} col - Column index (0-6)
 */
function makeMove(col) {
    // Find the lowest empty row in the selected column
    const row = findAvailableRow(col);
    
    // If column is full, do nothing
    if (row === -1) return;
    
    // Update board and save move to history
    board[row][col] = currentPlayer;
    moveHistory.push({ row, col, player: currentPlayer });
    
    // Update UI
    renderBoard();
    
    // Check for win or draw
    if (checkWin(row, col)) {
        handleWin();
    } else if (checkDraw()) {
        handleDraw();
    } else {
        // Switch player
        currentPlayer = currentPlayer === PLAYER ? AI : PLAYER;
        
        // If AI's turn, make AI move
        if (currentPlayer === AI && !gameOver) {
            updateGameStatus('AI is thinking...');
            disableBoardClicks();
            
            // Short delay for AI move to make it feel more natural
            setTimeout(() => {
                makeAIMove();
                
                // Check for AI win
                const lastMove = moveHistory[moveHistory.length - 1];
                if (checkWin(lastMove.row, lastMove.col)) {
                    handleWin();
                } else if (checkDraw()) {
                    handleDraw();
                } else {
                    currentPlayer = PLAYER;
                    updateGameStatus('Your turn!');
                    enableBoardClicks();
                }
            }, 800);
        }
    }
}

/**
 * Find the lowest empty row in a column
 * @param {number} col - Column index
 * @returns {number} - Row index or -1 if column is full
 */
function findAvailableRow(col) {
    for (let row = 0; row < ROWS; row++) {
        if (board[row][col] === EMPTY) {
            return row;
        }
    }
    return -1; // Column is full
}

/**
 * Check if the last move resulted in a win
 * @param {number} row - Row of last move
 * @param {number} col - Column of last move
 * @returns {boolean} - True if win, false otherwise
 */
function checkWin(row, col) {
    const player = board[row][col];
    
    // Helper function to count consecutive pieces
    const countConsecutive = (rowDir, colDir) => {
        let count = 0;
        let r = row + rowDir;
        let c = col + colDir;
        
        while (
            r >= 0 && r < ROWS && 
            c >= 0 && c < COLS && 
            board[r][c] === player
        ) {
            count++;
            r += rowDir;
            c += colDir;
        }
        
        return count;
    };
    
    // Check horizontal, vertical, and both diagonals
    // Horizontal
    if (countConsecutive(0, 1) + countConsecutive(0, -1) >= 3) return true;
    // Vertical
    if (countConsecutive(1, 0) + countConsecutive(-1, 0) >= 3) return true;
    // Diagonal (/)
    if (countConsecutive(-1, 1) + countConsecutive(1, -1) >= 3) return true;
    // Diagonal (\)
    if (countConsecutive(1, 1) + countConsecutive(-1, -1) >= 3) return true;
    
    return false;
}

/**
 * Check if the board is full (draw)
 * @returns {boolean} - True if draw, false otherwise
 */
function checkDraw() {
    return board[ROWS - 1].every(cell => cell !== EMPTY);
}

/**
 * Handle win condition
 */
function handleWin() {
    gameOver = true;
    disableBoardClicks();
    
    if (currentPlayer === PLAYER) {
        updateGameStatus('You win! 🎉');
        playerScore++;
        playerScoreElement.textContent = playerScore;
    } else {
        updateGameStatus('AI wins! 🤖');
        aiScore++;
        aiScoreElement.textContent = aiScore;
    }
}

/**
 * Handle draw condition
 */
function handleDraw() {
    gameOver = true;
    disableBoardClicks();
    updateGameStatus('Draw! 🤝');
}

/**
 * Update game status message
 * @param {string} message - Status message
 */
function updateGameStatus(message) {
    gameStatus.textContent = message;
}

/**
 * Enable board click events
 */
function enableBoardClicks() {
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.style.pointerEvents = 'auto';
    });
    undoBtn.disabled = false;
}

/**
 * Disable board click events
 */
function disableBoardClicks() {
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.style.pointerEvents = 'none';
    });
    undoBtn.disabled = true;
}

/**
 * Undo the last move(s)
 */
function undoMove() {
    // If game is over or no moves have been made, do nothing
    if (gameOver || moveHistory.length === 0) return;
    
    // Remove last player move and AI move
    if (currentPlayer === PLAYER) {
        // Undo AI and player moves
        for (let i = 0; i < 2; i++) {
            if (moveHistory.length > 0) {
                const lastMove = moveHistory.pop();
                board[lastMove.row][lastMove.col] = EMPTY;
            }
        }
    } else {
        // Undo just the player move
        const lastMove = moveHistory.pop();
        board[lastMove.row][lastMove.col] = EMPTY;
        currentPlayer = PLAYER;
    }
    
    // Update UI
    renderBoard();
    updateGameStatus('Your turn!');
}

// Event listeners
newGameBtn.addEventListener('click', initGame);
undoBtn.addEventListener('click', undoMove);
difficultySelect.addEventListener('change', () => {
    // Update AI difficulty setting
    const difficulty = difficultySelect.value;
    setAIDifficulty(difficulty);
});

// Initialize game on load
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setAIDifficulty(difficultySelect.value);
}); 
