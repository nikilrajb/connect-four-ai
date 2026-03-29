/**
 * Connect Four - GameBoard
 * Manages the board state and win/draw detection.
 * @author Nikhil Raj B
 * @version 2.0.0
 */

class GameBoard {
    static ROWS = 6;
    static COLS = 7;
    static EMPTY = 0;
    static PLAYER = 1;
    static AI = 2;

    constructor() {
        this.grid = this._createEmpty();
    }

    /** @returns {Array<Array<number>>} a fresh empty grid */
    _createEmpty() {
        return Array(GameBoard.ROWS).fill(null).map(() => Array(GameBoard.COLS).fill(GameBoard.EMPTY));
    }

    /** Reset board to empty state */
    reset() {
        this.grid = this._createEmpty();
    }

    /**
     * Find the lowest available row in a column (row 0 = bottom).
     * @param {number} col
     * @returns {number} row index, or -1 if column is full
     */
    findAvailableRow(col) {
        for (let row = 0; row < GameBoard.ROWS; row++) {
            if (this.grid[row][col] === GameBoard.EMPTY) return row;
        }
        return -1;
    }

    /**
     * Place a piece on the board.
     * @param {number} row
     * @param {number} col
     * @param {number} player - GameBoard.PLAYER or GameBoard.AI
     */
    place(row, col, player) {
        this.grid[row][col] = player;
    }

    /**
     * Remove a piece from the board.
     * @param {number} row
     * @param {number} col
     */
    remove(row, col) {
        this.grid[row][col] = GameBoard.EMPTY;
    }

    /**
     * Check if placing at (row, col) creates 4 in a row for that player.
     * Counts consecutive same-colour pieces in both directions along each axis,
     * then adds 1 (the piece itself). A win requires a total of >= 4.
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    checkWin(row, col) {
        const player = this.grid[row][col];
        if (player === GameBoard.EMPTY) return false;

        const countDir = (dr, dc) => {
            let count = 0;
            let r = row + dr;
            let c = col + dc;
            while (
                r >= 0 && r < GameBoard.ROWS &&
                c >= 0 && c < GameBoard.COLS &&
                this.grid[r][c] === player
            ) {
                count++;
                r += dr;
                c += dc;
            }
            return count;
        };

        // For each axis, combine pieces in both directions + the piece itself.
        // Win when total >= 4, i.e. combined count in both directions >= 3.
        return (
            countDir(0, 1)  + countDir(0, -1)  >= 3 ||   // horizontal
            countDir(1, 0)  + countDir(-1, 0)  >= 3 ||   // vertical
            countDir(1, 1)  + countDir(-1, -1) >= 3 ||   // diagonal (\)
            countDir(1, -1) + countDir(-1, 1)  >= 3      // diagonal (/)
        );
    }

    /**
     * Check if a given player has any winning 4-in-a-row on the board.
     * Used by the AI's minimax terminal-state check.
     * @param {number} player
     * @returns {boolean}
     */
    checkWinForPlayer(player) {
        for (let row = 0; row < GameBoard.ROWS; row++) {
            for (let col = 0; col < GameBoard.COLS; col++) {
                if (this.grid[row][col] === player && this.checkWin(row, col)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Return true when every column has at least one piece in the top row.
     * @returns {boolean}
     */
    isFull() {
        return this.grid[GameBoard.ROWS - 1].every(cell => cell !== GameBoard.EMPTY);
    }

    /**
     * Return the list of columns that still have at least one empty cell.
     * @returns {number[]}
     */
    getValidColumns() {
        const cols = [];
        for (let col = 0; col < GameBoard.COLS; col++) {
            if (this.findAvailableRow(col) !== -1) cols.push(col);
        }
        return cols;
    }
}
