/**
 * Game class
 * Orchestrates game flow: connects GameBoard, AIPlayer, and UI.
 *
 * Bug fixes vs v1:
 *  - Win detection delegates to GameBoard.checkWin (exactly 4-in-a-row)
 *  - Undo always removes the last AI move then the last human move (consistent)
 *  - Changing difficulty resets the game
 *  - Board indexing is handled by GameBoard (row 0 = bottom convention)
 *
 * @author Nikhil Raj B
 * @version 2.0.0
 */
class Game {
    /**
     * @param {GameBoard} board
     * @param {AIPlayer}  ai
     * @param {UI}        ui
     */
    constructor(board, ai, ui) {
        this._board = board;
        this._ai    = ai;
        this._ui    = ui;

        this.PLAYER = 1;
        this.AI     = 2;

        this._currentPlayer = this.PLAYER;
        this._gameOver      = false;
        this._aiThinking    = false;
        this._moveHistory   = [];
        this._scores        = { player: 0, ai: 0, draw: 0 };

        this._wireUICallbacks();
        this.init();
    }

    // ─── Public API ────────────────────────────────────────────────────────────

    /** Start / restart the game. */
    init() {
        this._board.reset();
        this._currentPlayer = this.PLAYER;
        this._gameOver      = false;
        this._aiThinking    = false;
        this._moveHistory   = [];

        this._ui.renderBoard(this._board);
        this._ui.setStatus('Your turn! 🎯', 'player');
        this._ui.updateScores(this._scores);
        this._ui.setInteractive(true);
    }

    /**
     * Handle a column click from the human player.
     * @param {number} col
     */
    handleColumnClick(col) {
        if (this._gameOver || this._currentPlayer !== this.PLAYER || this._aiThinking) return;
        this._placeAndCheck(col, this.PLAYER);
    }

    /**
     * Show a hover preview for the given column.
     * @param {number} col
     */
    handleColumnHover(col) {
        if (this._gameOver || this._currentPlayer !== this.PLAYER || this._aiThinking) return;
        const logRow = this._board.findAvailableRow(col);
        if (logRow === -1) return;
        const visualRow = this._board.ROWS - 1 - logRow;
        this._ui.showPreview(col, visualRow);
    }

    /** Clear the hover preview. */
    handleColumnLeave() {
        this._ui.clearPreview();
    }

    /**
     * Undo the last human move (and the AI move that followed it, if any).
     * Always restores it to the human player's turn.
     */
    undoMove() {
        if (this._gameOver || this._aiThinking || this._moveHistory.length === 0) return;

        // Remove the AI's reply first (if present)
        if (this._moveHistory[this._moveHistory.length - 1].player === this.AI) {
            const m = this._moveHistory.pop();
            this._board.undoAt(m.row, m.col);
        }

        // Then remove the human's move
        if (this._moveHistory.length > 0 &&
            this._moveHistory[this._moveHistory.length - 1].player === this.PLAYER) {
            const m = this._moveHistory.pop();
            this._board.undoAt(m.row, m.col);
        }

        this._currentPlayer = this.PLAYER;
        this._ui.renderBoard(this._board);
        this._ui.setStatus('Your turn! 🎯', 'player');
        this._ui.setInteractive(true);
    }

    /**
     * Change the AI difficulty and restart the game.
     * @param {string} level - 'easy' | 'medium' | 'hard'
     */
    changeDifficulty(level) {
        this._ai.setDifficulty(level);
        this.init();
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    _wireUICallbacks() {
        this._ui.onColumnClick      = (col)   => this.handleColumnClick(col);
        this._ui.onColumnHover      = (col)   => this.handleColumnHover(col);
        this._ui.onColumnLeave      = ()      => this.handleColumnLeave();
        this._ui.onNewGame          = ()      => this.init();
        this._ui.onUndo             = ()      => this.undoMove();
        this._ui.onDifficultyChange = (level) => this.changeDifficulty(level);
    }

    _placeAndCheck(col, player) {
        const logRow = this._board.dropPiece(col, player);
        if (logRow === -1) return; // column full

        this._moveHistory.push({ row: logRow, col, player });

        // Visual row: board row 0 is the visual bottom (index ROWS-1 in the column)
        const visualRow = this._board.ROWS - 1 - logRow;

        this._ui.animateDrop(col, visualRow, player, () => {
            if (this._board.checkWin(logRow, col)) {
                this._handleWin(logRow, col, player);
            } else if (this._board.isBoardFull()) {
                this._handleDraw();
            } else if (player === this.PLAYER) {
                this._currentPlayer = this.AI;
                this._scheduleAIMove();
            } else {
                this._currentPlayer = this.PLAYER;
                this._ui.setStatus('Your turn! 🎯', 'player');
                this._ui.setInteractive(true);
            }
        });
    }

    _scheduleAIMove() {
        this._aiThinking = true;
        this._ui.setStatus('AI is thinking… 🤖', 'ai');
        this._ui.setInteractive(false);

        setTimeout(() => {
            const col = this._ai.getBestMove(
                this._board.clone(),
                this._board.ROWS,
                this._board.COLS
            );
            this._aiThinking = false;
            this._placeAndCheck(col, this.AI);
        }, 600);
    }

    _handleWin(logRow, col, winner) {
        this._gameOver = true;
        const winCells = this._board.getWinningCells(logRow, col);

        if (winner === this.PLAYER) {
            this._scores.player++;
            this._ui.setStatus('You win! 🎉', 'player-win');
        } else {
            this._scores.ai++;
            this._ui.setStatus('AI wins! 🤖', 'ai-win');
        }

        this._ui.showWinAnimation(winCells, this._board.ROWS);
        this._ui.updateScores(this._scores);
        this._ui.setInteractive(false);
    }

    _handleDraw() {
        this._gameOver = true;
        this._scores.draw++;
        this._ui.setStatus("It's a draw! 🤝", 'draw');
        this._ui.updateScores(this._scores);
        this._ui.setInteractive(false);
    }
}

