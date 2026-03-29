/**
 * Connect Four - AIPlayer
 * Minimax algorithm with alpha-beta pruning, refactored as a class.
 * @author Nikhil Raj B
 * @version 2.0.0
 */

class AIPlayer {
    /** @type {Object.<string, {depth: number, randomFactor: number}>} */
    static DIFFICULTY = {
        easy:   { depth: 2, randomFactor: 0.4 },
        medium: { depth: 4, randomFactor: 0.2 },
        hard:   { depth: 6, randomFactor: 0   }
    };

    /** @param {string} difficulty - 'easy' | 'medium' | 'hard' */
    constructor(difficulty = 'medium') {
        this.setDifficulty(difficulty);
    }

    /**
     * Update the AI difficulty setting.
     * @param {string} difficulty
     */
    setDifficulty(difficulty) {
        this.settings = AIPlayer.DIFFICULTY[difficulty] || AIPlayer.DIFFICULTY.medium;
    }

    /**
     * Choose the best column to play in using minimax with alpha-beta pruning.
     * @param {GameBoard} board - current game board
     * @returns {number} column index
     */
    findBestMove(board) {
        // Inject randomness for lower difficulty levels
        if (Math.random() < this.settings.randomFactor) {
            const cols = board.getValidColumns();
            return cols[Math.floor(Math.random() * cols.length)];
        }

        let bestScore = -Infinity;
        let bestCol = Math.floor(GameBoard.COLS / 2); // default: centre

        for (const col of board.getValidColumns()) {
            const row = board.findAvailableRow(col);
            board.place(row, col, GameBoard.AI);
            const score = this._minimax(board, this.settings.depth - 1, -Infinity, Infinity, false);
            board.remove(row, col);

            if (score > bestScore) {
                bestScore = score;
                bestCol = col;
            }
        }

        return bestCol;
    }

    /**
     * Minimax with alpha-beta pruning.
     * @param {GameBoard} board
     * @param {number} depth
     * @param {number} alpha
     * @param {number} beta
     * @param {boolean} isMaximizing
     * @returns {number} heuristic score
     */
    _minimax(board, depth, alpha, beta, isMaximizing) {
        // Terminal states – reward faster wins with higher depth bonus
        if (board.checkWinForPlayer(GameBoard.AI))     return 1000 + depth;
        if (board.checkWinForPlayer(GameBoard.PLAYER)) return -1000 - depth;
        if (board.isFull() || depth === 0) return this._evaluate(board);

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const col of board.getValidColumns()) {
                const row = board.findAvailableRow(col);
                board.place(row, col, GameBoard.AI);
                const score = this._minimax(board, depth - 1, alpha, beta, false);
                board.remove(row, col);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const col of board.getValidColumns()) {
                const row = board.findAvailableRow(col);
                board.place(row, col, GameBoard.PLAYER);
                const score = this._minimax(board, depth - 1, alpha, beta, true);
                board.remove(row, col);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }

    /**
     * Heuristic board evaluation.
     * @param {GameBoard} board
     * @returns {number}
     */
    _evaluate(board) {
        let score = 0;

        // Bonus for pieces in the centre column
        const center = Math.floor(GameBoard.COLS / 2);
        for (let row = 0; row < GameBoard.ROWS; row++) {
            if (board.grid[row][center] === GameBoard.AI) score += 3;
        }

        // Horizontal windows
        for (let row = 0; row < GameBoard.ROWS; row++) {
            for (let col = 0; col <= GameBoard.COLS - 4; col++) {
                score += this._scoreWindow([
                    board.grid[row][col],
                    board.grid[row][col + 1],
                    board.grid[row][col + 2],
                    board.grid[row][col + 3]
                ]);
            }
        }

        // Vertical windows
        for (let col = 0; col < GameBoard.COLS; col++) {
            for (let row = 0; row <= GameBoard.ROWS - 4; row++) {
                score += this._scoreWindow([
                    board.grid[row][col],
                    board.grid[row + 1][col],
                    board.grid[row + 2][col],
                    board.grid[row + 3][col]
                ]);
            }
        }

        // Diagonal (\) windows
        for (let row = 0; row <= GameBoard.ROWS - 4; row++) {
            for (let col = 0; col <= GameBoard.COLS - 4; col++) {
                score += this._scoreWindow([
                    board.grid[row][col],
                    board.grid[row + 1][col + 1],
                    board.grid[row + 2][col + 2],
                    board.grid[row + 3][col + 3]
                ]);
            }
        }

        // Diagonal (/) windows
        for (let row = 3; row < GameBoard.ROWS; row++) {
            for (let col = 0; col <= GameBoard.COLS - 4; col++) {
                score += this._scoreWindow([
                    board.grid[row][col],
                    board.grid[row - 1][col + 1],
                    board.grid[row - 2][col + 2],
                    board.grid[row - 3][col + 3]
                ]);
            }
        }

        return score;
    }

    /**
     * Score a window of 4 cells.
     * @param {number[]} window
     * @returns {number}
     */
    _scoreWindow(window) {
        const ai     = window.filter(c => c === GameBoard.AI).length;
        const player = window.filter(c => c === GameBoard.PLAYER).length;
        const empty  = window.filter(c => c === GameBoard.EMPTY).length;

        if (ai > 0 && player > 0) return 0; // mixed window – no value

        if (ai === 4)                    return 100;
        if (ai === 3 && empty === 1)     return 5;
        if (ai === 2 && empty === 2)     return 2;
        if (player === 3 && empty === 1) return -10;

        return 0;
    }
}
