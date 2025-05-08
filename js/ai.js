/**
 * Connect Four AI
 * Minimax algorithm with alpha-beta pruning
 * @author Nikhil Raj B
 * @version 1.0.0
 */

// AI difficulty settings
const AI_DIFFICULTY = {
    easy: { depth: 2, randomFactor: 0.4 },
    medium: { depth: 4, randomFactor: 0.2 },
    hard: { depth: 6, randomFactor: 0 }
};

// Current difficulty setting
let currentDifficulty = AI_DIFFICULTY.medium;

/**
 * Set AI difficulty
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 */
function setAIDifficulty(difficulty) {
    currentDifficulty = AI_DIFFICULTY[difficulty];
    console.log(`AI difficulty set to ${difficulty}`);
}

/**
 * Make AI move using minimax algorithm
 */
function makeAIMove() {
    // Get best move using minimax
    const bestMove = findBestMove();
    
    // Make the move
    const row = findAvailableRow(bestMove);
    if (row !== -1) {
        board[row][bestMove] = AI;
        moveHistory.push({ row, col: bestMove, player: AI });
        renderBoard();
    }
}

/**
 * Find best move using minimax algorithm with alpha-beta pruning
 * @returns {number} - Column index for best move
 */
function findBestMove() {
    // Add randomness based on difficulty
    if (Math.random() < currentDifficulty.randomFactor) {
        // Make a random valid move
        const validColumns = [];
        for (let col = 0; col < COLS; col++) {
            if (findAvailableRow(col) !== -1) {
                validColumns.push(col);
            }
        }
        return validColumns[Math.floor(Math.random() * validColumns.length)];
    }
    
    let bestScore = -Infinity;
    let bestCol = 3; // Default to middle column
    
    // Try each column
    for (let col = 0; col < COLS; col++) {
        // Skip full columns
        const row = findAvailableRow(col);
        if (row === -1) continue;
        
        // Make temporary move
        board[row][col] = AI;
        
        // Calculate score using minimax
        const score = minimax(board, currentDifficulty.depth, -Infinity, Infinity, false);
        
        // Undo move
        board[row][col] = EMPTY;
        
        // Update best move
        if (score > bestScore) {
            bestScore = score;
            bestCol = col;
        }
    }
    
    return bestCol;
}

/**
 * Minimax algorithm with alpha-beta pruning
 * @param {Array} board - Game board
 * @param {number} depth - Search depth
 * @param {number} alpha - Alpha value for pruning
 * @param {number} beta - Beta value for pruning
 * @param {boolean} isMaximizing - Whether current player is maximizing
 * @returns {number} - Score for this board position
 */
function minimax(board, depth, alpha, beta, isMaximizing) {
    // Check for terminal states
    if (depth === 0) {
        return evaluateBoard(board);
    }
    
    // Check for win/draw
    const gameState = checkGameState(board);
    if (gameState !== null) {
        return gameState;
    }
    
    if (isMaximizing) {
        // AI's turn (maximizing)
        let maxScore = -Infinity;
        
        // Try each column
        for (let col = 0; col < COLS; col++) {
            const row = findAvailableRowInBoard(board, col);
            if (row === -1) continue;
            
            // Make temporary move
            board[row][col] = AI;
            
            // Recursive minimax call
            const score = minimax(board, depth - 1, alpha, beta, false);
            
            // Undo move
            board[row][col] = EMPTY;
            
            // Update best score
            maxScore = Math.max(maxScore, score);
            
            // Alpha-beta pruning
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        
        return maxScore;
    } else {
        // Player's turn (minimizing)
        let minScore = Infinity;
        
        // Try each column
        for (let col = 0; col < COLS; col++) {
            const row = findAvailableRowInBoard(board, col);
            if (row === -1) continue;
            
            // Make temporary move
            board[row][col] = PLAYER;
            
            // Recursive minimax call
            const score = minimax(board, depth - 1, alpha, beta, true);
            
            // Undo move
            board[row][col] = EMPTY;
            
            // Update best score
            minScore = Math.min(minScore, score);
            
            // Alpha-beta pruning
            beta = Math.min(beta, score);
            if (beta <= alpha) break;
        }
        
        return minScore;
    }
}

/**
 * Find available row in a given board state
 * @param {Array} board - Game board
 * @param {number} col - Column index
 * @returns {number} - Row index or -1 if column is full
 */
function findAvailableRowInBoard(board, col) {
    for (let row = 0; row < ROWS; row++) {
        if (board[row][col] === EMPTY) {
            return row;
        }
    }
    return -1;
}

/**
 * Check game state (win/draw/continue)
 * @param {Array} board - Game board
 * @returns {number|null} - Score if terminal state, null otherwise
 */
function checkGameState(board) {
    // Check for AI win
    if (checkWinInBoard(board, AI)) {
        return 1000;
    }
    
    // Check for player win
    if (checkWinInBoard(board, PLAYER)) {
        return -1000;
    }
    
    // Check for draw
    if (isBoardFull(board)) {
        return 0;
    }
    
    return null;
}

/**
 * Check if a player has won in the given board state
 * @param {Array} board - Game board
 * @param {number} player - Player to check (PLAYER or AI)
 * @returns {boolean} - True if win, false otherwise
 */
function checkWinInBoard(board, player) {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            if (
                board[row][col] === player &&
                board[row][col + 1] === player &&
                board[row][col + 2] === player &&
                board[row][col + 3] === player
            ) {
                return true;
            }
        }
    }
    
    // Check vertical
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 0; col < COLS; col++) {
            if (
                board[row][col] === player &&
                board[row + 1][col] === player &&
                board[row + 2][col] === player &&
                board[row + 3][col] === player
            ) {
                return true;
            }
        }
    }
    
    // Check diagonal (/)
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            if (
                board[row][col + 3] === player &&
                board[row + 1][col + 2] === player &&
                board[row + 2][col + 1] === player &&
                board[row + 3][col] === player
            ) {
                return true;
            }
        }
    }
    
    // Check diagonal (\)
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            if (
                board[row][col] === player &&
                board[row + 1][col + 1] === player &&
                board[row + 2][col + 2] === player &&
                board[row + 3][col + 3] === player
            ) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Check if board is full
 * @param {Array} board - Game board
 * @returns {boolean} - True if full, false otherwise
 */
function isBoardFull(board) {
    return board[ROWS - 1].every(cell => cell !== EMPTY);
}

/**
 * Evaluate the current board state for AI decision making
 * @param {Array} board - Game board
 * @returns {number} - Score for this board position
 */
function evaluateBoard(board) {
    let score = 0;
    
    // Score center column (strategic advantage)
    const centerCol = Math.floor(COLS / 2);
    const centerCount = countPiecesInColumn(board, centerCol, AI);
    score += centerCount * 3;
    
    // Score horizontal windows
    score += evaluateWindows(board, 'horizontal');
    
    // Score vertical windows
    score += evaluateWindows(board, 'vertical');
    
    // Score diagonal windows
    score += evaluateWindows(board, 'diagonal');
    
    return score;
}

/**
 * Count pieces in a column
 * @param {Array} board - Game board
 * @param {number} col - Column index
 * @param {number} player - Player to count
 * @returns {number} - Count of pieces
 */
function countPiecesInColumn(board, col, player) {
    let count = 0;
    for (let row = 0; row < ROWS; row++) {
        if (board[row][col] === player) {
            count++;
        }
    }
    return count;
}

/**
 * Evaluate windows of 4 positions in the specified direction
 * @param {Array} board - Game board
 * @param {string} direction - Direction to evaluate (horizontal, vertical, diagonal)
 * @returns {number} - Score for this direction
 */
function evaluateWindows(board, direction) {
    let score = 0;
    
    // Evaluate horizontal windows
    if (direction === 'horizontal' || direction === 'all') {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col <= COLS - 4; col++) {
                const window = [
                    board[row][col],
                    board[row][col + 1],
                    board[row][col + 2],
                    board[row][col + 3]
                ];
                score += evaluateWindow(window);
            }
        }
    }
    
    // Evaluate vertical windows
    if (direction === 'vertical' || direction === 'all') {
        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row <= ROWS - 4; row++) {
                const window = [
                    board[row][col],
                    board[row + 1][col],
                    board[row + 2][col],
                    board[row + 3][col]
                ];
                score += evaluateWindow(window);
            }
        }
    }
    
    // Evaluate diagonal windows (/)
    if (direction === 'diagonal' || direction === 'all') {
        for (let row = 0; row <= ROWS - 4; row++) {
            for (let col = 0; col <= COLS - 4; col++) {
                const window1 = [
                    board[row][col],
                    board[row + 1][col + 1],
                    board[row + 2][col + 2],
                    board[row + 3][col + 3]
                ];
                score += evaluateWindow(window1);
            }
        }
        
        // Evaluate diagonal windows (\)
        for (let row = 0; row <= ROWS - 4; row++) {
            for (let col = 3; col < COLS; col++) {
                const window2 = [
                    board[row][col],
                    board[row + 1][col - 1],
                    board[row + 2][col - 2],
                    board[row + 3][col - 3]
                ];
                score += evaluateWindow(window2);
            }
        }
    }
    
    return score;
}

/**
 * Evaluate a window of 4 positions
 * @param {Array} window - Array of 4 positions
 * @returns {number} - Score for this window
 */
function evaluateWindow(window) {
    const aiCount = window.filter(cell => cell === AI).length;
    const playerCount = window.filter(cell => cell === PLAYER).length;
    const emptyCount = window.filter(cell => cell === EMPTY).length;
    
    // If window has both AI and player pieces, it's not useful
    if (aiCount > 0 && playerCount > 0) {
        return 0;
    }
    
    // Score based on number of AI pieces
    if (aiCount === 4) return 100; // AI win
    if (aiCount === 3 && emptyCount === 1) return 5; // AI can win next move
    if (aiCount === 2 && emptyCount === 2) return 2; // AI has some potential
    
    // Negative score for player threats
    if (playerCount === 3 && emptyCount === 1) return -10; // Block player win
    
    return 0;
} 
