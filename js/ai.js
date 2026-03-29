/**
 * AIPlayer class
 * Connect Four AI using minimax with alpha-beta pruning.
 *
 * @author Nikhil Raj B
 * @version 2.0.0
 */
class AIPlayer {
    constructor() {
        this.PLAYER = 1;
        this.AI     = 2;
        this.EMPTY  = 0;

        this._difficulties = {
            easy:   { depth: 2, randomFactor: 0.4 },
            medium: { depth: 4, randomFactor: 0.2 },
            hard:   { depth: 6, randomFactor: 0   },
        };

        this._difficulty = this._difficulties.medium;
    }

    // ─── Public API ────────────────────────────────────────────────────────────

    /**
     * Set the AI difficulty level.
     * @param {string} level - 'easy' | 'medium' | 'hard'
     */
    setDifficulty(level) {
        this._difficulty = this._difficulties[level] || this._difficulties.medium;
    }

    /**
     * Return the best column for the AI to play in.
     * @param {number[][]} gridSnapshot - Deep copy of the current board grid.
     * @param {number}     rows
     * @param {number}     cols
     * @returns {number} Column index.
     */
    getBestMove(gridSnapshot, rows, cols) {
        // Inject randomness for lower difficulty levels
        if (Math.random() < this._difficulty.randomFactor) {
            const valid = this._validCols(gridSnapshot, rows, cols);
            return valid[Math.floor(Math.random() * valid.length)];
        }

        let bestScore = -Infinity;
        let bestCol   = Math.floor(cols / 2);

        for (const col of this._validCols(gridSnapshot, rows, cols)) {
            const row = this._findRow(gridSnapshot, col, rows);
            gridSnapshot[row][col] = this.AI;

            const score = this._minimax(
                gridSnapshot,
                this._difficulty.depth - 1,
                -Infinity, Infinity,
                false, rows, cols
            );

            gridSnapshot[row][col] = this.EMPTY;

            if (score > bestScore) {
                bestScore = score;
                bestCol   = col;
            }
        }

        return bestCol;
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    _validCols(grid, rows, cols) {
        const result = [];
        for (let c = 0; c < cols; c++) {
            if (this._findRow(grid, c, rows) !== -1) result.push(c);
        }
        return result;
    }

    _findRow(grid, col, rows) {
        for (let row = 0; row < rows; row++) {
            if (grid[row][col] === this.EMPTY) return row;
        }
        return -1;
    }

    /** Full-board scan: does `player` have 4 in a row? */
    _checkWin(grid, player, rows, cols) {
        // Horizontal
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (grid[r][c] === player && grid[r][c+1] === player &&
                    grid[r][c+2] === player && grid[r][c+3] === player) return true;
            }
        }
        // Vertical
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r <= rows - 4; r++) {
                if (grid[r][c] === player && grid[r+1][c] === player &&
                    grid[r+2][c] === player && grid[r+3][c] === player) return true;
            }
        }
        // Diagonal (\)
        for (let r = 0; r <= rows - 4; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (grid[r][c] === player && grid[r+1][c+1] === player &&
                    grid[r+2][c+2] === player && grid[r+3][c+3] === player) return true;
            }
        }
        // Diagonal (/)
        for (let r = 3; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (grid[r][c] === player && grid[r-1][c+1] === player &&
                    grid[r-2][c+2] === player && grid[r-3][c+3] === player) return true;
            }
        }
        return false;
    }

    _isFull(grid, rows) {
        return grid[rows - 1].every(cell => cell !== this.EMPTY);
    }

    _minimax(grid, depth, alpha, beta, isMaximizing, rows, cols) {
        // Terminal checks (depth bonus keeps shallower wins preferred)
        if (this._checkWin(grid, this.AI,     rows, cols)) return  1000 + depth;
        if (this._checkWin(grid, this.PLAYER, rows, cols)) return -1000 - depth;
        if (this._isFull(grid, rows) || depth === 0) return this._evaluate(grid, rows, cols);

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const col of this._validCols(grid, rows, cols)) {
                const row = this._findRow(grid, col, rows);
                grid[row][col] = this.AI;
                const score = this._minimax(grid, depth - 1, alpha, beta, false, rows, cols);
                grid[row][col] = this.EMPTY;
                maxScore = Math.max(maxScore, score);
                alpha    = Math.max(alpha,    score);
                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const col of this._validCols(grid, rows, cols)) {
                const row = this._findRow(grid, col, rows);
                grid[row][col] = this.PLAYER;
                const score = this._minimax(grid, depth - 1, alpha, beta, true, rows, cols);
                grid[row][col] = this.EMPTY;
                minScore = Math.min(minScore, score);
                beta     = Math.min(beta,     score);
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }

    _evaluate(grid, rows, cols) {
        let score = 0;

        // Prefer center column
        const center = Math.floor(cols / 2);
        for (let r = 0; r < rows; r++) {
            if (grid[r][center] === this.AI) score += 3;
        }

        // Score every window of 4
        // Horizontal
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                score += this._scoreWindow(
                    [grid[r][c], grid[r][c+1], grid[r][c+2], grid[r][c+3]]
                );
            }
        }
        // Vertical
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r <= rows - 4; r++) {
                score += this._scoreWindow(
                    [grid[r][c], grid[r+1][c], grid[r+2][c], grid[r+3][c]]
                );
            }
        }
        // Diagonal (\)
        for (let r = 0; r <= rows - 4; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                score += this._scoreWindow(
                    [grid[r][c], grid[r+1][c+1], grid[r+2][c+2], grid[r+3][c+3]]
                );
            }
        }
        // Diagonal (/)
        for (let r = 3; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                score += this._scoreWindow(
                    [grid[r][c], grid[r-1][c+1], grid[r-2][c+2], grid[r-3][c+3]]
                );
            }
        }

        return score;
    }

    _scoreWindow(win) {
        const ai     = win.filter(c => c === this.AI).length;
        const player = win.filter(c => c === this.PLAYER).length;
        const empty  = win.filter(c => c === this.EMPTY).length;

        if (ai > 0 && player > 0) return 0; // blocked window
        if (ai === 4) return 100;
        if (ai === 3 && empty === 1) return 5;
        if (ai === 2 && empty === 2) return 2;
        if (player === 3 && empty === 1) return -10;
        return 0;
    }
}

