/**
 * Connect Four - Game
 * Core game logic and state management.
 * @author Nikhil Raj B
 * @version 2.0.0
 */

class Game {
    constructor() {
        this.board = new GameBoard();
        this.ai = new AIPlayer('medium');

        /** @type {{player: number, ai: number, draws: number}} */
        this.scores = { player: 0, ai: 0, draws: 0 };

        /** @type {Array<{row: number, col: number, player: number}>} */
        this.moveHistory = [];

        this.currentPlayer = GameBoard.PLAYER;
        this.gameOver = false;

        /** @type {UI|null} */
        this.ui = null;
    }

    /**
     * Attach a UI instance that will be notified of state changes.
     * @param {UI} ui
     */
    setUI(ui) {
        this.ui = ui;
    }

    /**
     * Change difficulty and reset the game so the new setting takes effect immediately.
     * @param {string} difficulty - 'easy' | 'medium' | 'hard'
     */
    setDifficulty(difficulty) {
        this.ai.setDifficulty(difficulty);
        this.reset();
    }

    /** Reset board and game state for a fresh game. */
    reset() {
        this.board.reset();
        this.moveHistory = [];
        this.currentPlayer = GameBoard.PLAYER;
        this.gameOver = false;

        this.ui?.render(this);
        this.ui?.setStatus('Your turn! 🎮', 'player');
        this.ui?.enableBoard();
        this.ui?.updateScores(this.scores);
    }

    /**
     * Human player attempts to drop a piece in the given column.
     * Ignored if it is not the player's turn or the game is over.
     * @param {number} col - Column index (0-6)
     */
    makeMove(col) {
        if (this.gameOver || this.currentPlayer !== GameBoard.PLAYER) return;

        const row = this.board.findAvailableRow(col);
        if (row === -1) return; // Column full

        this.board.place(row, col, GameBoard.PLAYER);
        this.moveHistory.push({ row, col, player: GameBoard.PLAYER });

        this.ui?.render(this);

        if (this.board.checkWin(row, col)) {
            this._handleWin(GameBoard.PLAYER);
        } else if (this.board.isFull()) {
            this._handleDraw();
        } else {
            this.currentPlayer = GameBoard.AI;
            this.ui?.setStatus('AI is thinking… 🤔', 'thinking');
            this.ui?.disableBoard();
            setTimeout(() => this._makeAIMove(), 600);
        }
    }

    /** Internal: execute the AI turn. */
    _makeAIMove() {
        const col = this.ai.findBestMove(this.board);
        const row = this.board.findAvailableRow(col);

        this.board.place(row, col, GameBoard.AI);
        this.moveHistory.push({ row, col, player: GameBoard.AI });

        this.ui?.render(this);

        if (this.board.checkWin(row, col)) {
            this._handleWin(GameBoard.AI);
        } else if (this.board.isFull()) {
            this._handleDraw();
        } else {
            this.currentPlayer = GameBoard.PLAYER;
            this.ui?.setStatus('Your turn! 🎮', 'player');
            this.ui?.enableBoard();
        }
    }

    /**
     * Undo the last player + AI move pair so the human can try again.
     * If called while the AI is thinking (currentPlayer === AI and only one move
     * was recorded) we undo just that one move to keep state consistent.
     */
    undoMove() {
        if (this.gameOver || this.moveHistory.length === 0) return;

        // Always undo until we get back to a state where it is the player's turn.
        // That means removing the last player move AND the preceding AI move (if any).
        const movesToUndo = this.currentPlayer === GameBoard.PLAYER ? 2 : 1;
        for (let i = 0; i < movesToUndo && this.moveHistory.length > 0; i++) {
            const { row, col } = this.moveHistory.pop();
            this.board.remove(row, col);
        }

        this.currentPlayer = GameBoard.PLAYER;
        this.gameOver = false;

        this.ui?.render(this);
        this.ui?.setStatus('Your turn! 🎮', 'player');
        this.ui?.enableBoard();
    }

    /** @private */
    _handleWin(player) {
        this.gameOver = true;
        this.ui?.disableBoard();

        if (player === GameBoard.PLAYER) {
            this.scores.player++;
            this.ui?.setStatus('You win! 🎉', 'win');
            this.ui?.celebrate('player');
        } else {
            this.scores.ai++;
            this.ui?.setStatus('AI wins! 🤖', 'lose');
            this.ui?.celebrate('ai');
        }

        this.ui?.updateScores(this.scores);
    }

    /** @private */
    _handleDraw() {
        this.gameOver = true;
        this.scores.draws++;
        this.ui?.setStatus("It's a draw! 🤝", 'draw');
        this.ui?.updateScores(this.scores);
        this.ui?.disableBoard();
    }
}
