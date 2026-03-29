/**
 * GameBoard class
 * Manages Connect Four board state, piece placement, and win detection.
 *
 * Convention: board[0] = bottom row, board[ROWS-1] = top row.
 * Pieces fall from the top and stack from the bottom (row 0 first).
 *
 * @author Nikhil Raj B
 * @version 2.0.0
 */
class GameBoard {
    /**
     * @param {number} [rows=6]
     * @param {number} [cols=7]
     */
    constructor(rows = 6, cols = 7) {
        this.ROWS  = rows;
        this.COLS  = cols;
        this.EMPTY = 0;
        this.grid  = this._createEmptyGrid();
    }

    // ─── Public API ────────────────────────────────────────────────────────────

    /** Reset the board to its initial empty state. */
    reset() {
        this.grid = this._createEmptyGrid();
    }

    /**
     * Return a deep copy of the grid (used by AI simulations).
     * @returns {number[][]}
     */
    clone() {
        return this.grid.map(row => row.slice());
    }

    /**
     * Find the lowest empty row in a column (gravity simulation).
     * @param {number} col
     * @returns {number} Row index (0 = bottom), or -1 if column is full.
     */
    findAvailableRow(col) {
        for (let row = 0; row < this.ROWS; row++) {
            if (this.grid[row][col] === this.EMPTY) return row;
        }
        return -1;
    }

    /**
     * Drop a piece into the given column.
     * @param {number} col
     * @param {number} player - 1 (human) or 2 (AI)
     * @returns {number} The row where the piece landed, or -1 if the column is full.
     */
    dropPiece(col, player) {
        const row = this.findAvailableRow(col);
        if (row === -1) return -1;
        this.grid[row][col] = player;
        return row;
    }

    /**
     * Clear the piece at the given position (undo support).
     * @param {number} row
     * @param {number} col
     */
    undoAt(row, col) {
        this.grid[row][col] = this.EMPTY;
    }

    /**
     * Check whether the piece at (row, col) completes a winning line of 4.
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    checkWin(row, col) {
        const player = this.grid[row][col];
        if (player === this.EMPTY) return false;

        // Check all four axes: horizontal, vertical, diagonal (\), diagonal (/)
        const axes = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (const [dr, dc] of axes) {
            let count = 1;

            // Walk in both directions along this axis
            for (const sign of [1, -1]) {
                let r = row + sign * dr;
                let c = col + sign * dc;
                while (
                    r >= 0 && r < this.ROWS &&
                    c >= 0 && c < this.COLS &&
                    this.grid[r][c] === player
                ) {
                    count++;
                    r += sign * dr;
                    c += sign * dc;
                }
            }

            if (count >= 4) return true;
        }

        return false;
    }

    /**
     * Return the cells that form the winning line from (row, col),
     * or null if there is no win at that position.
     * @param {number} row
     * @param {number} col
     * @returns {Array<[number, number]>|null}
     */
    getWinningCells(row, col) {
        const player = this.grid[row][col];
        if (player === this.EMPTY) return null;

        const axes = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (const [dr, dc] of axes) {
            const cells = [[row, col]];

            for (const sign of [1, -1]) {
                let r = row + sign * dr;
                let c = col + sign * dc;
                while (
                    r >= 0 && r < this.ROWS &&
                    c >= 0 && c < this.COLS &&
                    this.grid[r][c] === player
                ) {
                    cells.push([r, c]);
                    r += sign * dr;
                    c += sign * dc;
                }
            }

            if (cells.length >= 4) return cells;
        }

        return null;
    }

    /**
     * Return true when every column is full (the board is completely filled).
     * Since pieces stack from the bottom, the top row (ROWS-1) is the last
     * to fill in any column — if all top-row cells are occupied the board is full.
     * @returns {boolean}
     */
    isBoardFull() {
        return this.grid[this.ROWS - 1].every(cell => cell !== this.EMPTY);
    }

    /**
     * Return true when the column still has at least one free cell.
     * @param {number} col
     * @returns {boolean}
     */
    isColumnPlayable(col) {
        return this.grid[this.ROWS - 1][col] === this.EMPTY;
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    _createEmptyGrid() {
        return Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(this.EMPTY));
    }
}
