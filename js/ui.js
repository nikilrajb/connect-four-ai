/**
 * Connect Four - UI
 * Handles all DOM rendering, animations, and visual feedback.
 * @author Nikhil Raj B
 * @version 2.0.0
 */

class UI {
    constructor() {
        this.boardEl       = document.getElementById('game-board');
        this.statusEl      = document.getElementById('game-status');
        this.playerScoreEl = document.getElementById('player-score');
        this.aiScoreEl     = document.getElementById('ai-score');
        this.drawScoreEl   = document.getElementById('draw-score');

        /** @type {Game|null} */
        this.game = null;

        // Track the column currently highlighted by keyboard selection
        this._keyboardCol = Math.floor(GameBoard.COLS / 2);
    }

    /**
     * Attach the Game instance so the UI can forward user actions.
     * @param {Game} game
     */
    setGame(game) {
        this.game = game;
    }

    // ─────────────────────────────────────────────────────────────
    //  Board rendering
    // ─────────────────────────────────────────────────────────────

    /**
     * Fully re-render the board from the current game state.
     * @param {Game} game
     */
    render(game) {
        this.boardEl.innerHTML = '';

        for (let col = 0; col < GameBoard.COLS; col++) {
            const colEl = document.createElement('div');
            colEl.className = 'column';
            colEl.dataset.col = col;

            colEl.addEventListener('click',       () => this.game?.makeMove(col));
            colEl.addEventListener('mouseenter',  () => this._showPreview(col));
            colEl.addEventListener('mouseleave',  () => this._clearPreview());

            // Cells rendered top-to-bottom visually (highest logical row first)
            for (let row = GameBoard.ROWS - 1; row >= 0; row--) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const value = game.board.grid[row][col];
                if (value === GameBoard.PLAYER) {
                    cell.classList.add('player');
                } else if (value === GameBoard.AI) {
                    cell.classList.add('ai');
                }

                colEl.appendChild(cell);
            }

            this.boardEl.appendChild(colEl);
        }

        // Restore keyboard highlight
        this._highlightKeyboardCol(this._keyboardCol);
    }

    // ─────────────────────────────────────────────────────────────
    //  Drop animation
    // ─────────────────────────────────────────────────────────────

    /**
     * Trigger the drop animation on a specific cell.
     * @param {number} row - Logical row (0 = bottom)
     * @param {number} col
     */
    animateDrop(row, col) {
        const cell = this.boardEl.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;
        cell.classList.add('dropping');
        cell.addEventListener('animationend', () => cell.classList.remove('dropping'), { once: true });
    }

    // ─────────────────────────────────────────────────────────────
    //  Hover / keyboard preview
    // ─────────────────────────────────────────────────────────────

    /**
     * Show a ghost piece preview in the column that will receive the next drop.
     * @param {number} col
     */
    _showPreview(col) {
        this._clearPreview();
        if (!this.game || this.game.gameOver || this.game.currentPlayer !== GameBoard.PLAYER) return;

        const row = this.game.board.findAvailableRow(col);
        if (row === -1) return;

        const colEl = this.boardEl.querySelector(`.column[data-col="${col}"]`);
        if (colEl) colEl.classList.add('hovered');

        const targetCell = this.boardEl.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (targetCell) targetCell.classList.add('preview');
    }

    /** Remove all hover/preview highlights. */
    _clearPreview() {
        this.boardEl.querySelectorAll('.column.hovered').forEach(el => el.classList.remove('hovered'));
        this.boardEl.querySelectorAll('.cell.preview').forEach(el => el.classList.remove('preview'));
    }

    /**
     * Highlight the column selected via keyboard.
     * @param {number} col
     */
    _highlightKeyboardCol(col) {
        this.boardEl.querySelectorAll('.column.keyboard-selected').forEach(el => el.classList.remove('keyboard-selected'));
        const colEl = this.boardEl.querySelector(`.column[data-col="${col}"]`);
        if (colEl) colEl.classList.add('keyboard-selected');
        this._showPreview(col);
    }

    /**
     * Move the keyboard-selected column left or right.
     * @param {number} delta - -1 (left) or +1 (right)
     */
    moveKeyboardSelection(delta) {
        this._keyboardCol = Math.max(0, Math.min(GameBoard.COLS - 1, this._keyboardCol + delta));
        this._highlightKeyboardCol(this._keyboardCol);
    }

    /** Play the move in the currently keyboard-selected column. */
    playKeyboardSelection() {
        this.game?.makeMove(this._keyboardCol);
    }

    // ─────────────────────────────────────────────────────────────
    //  Status bar
    // ─────────────────────────────────────────────────────────────

    /**
     * Update the status message with an optional type for styling.
     * @param {string} message
     * @param {string} [type] - 'player' | 'thinking' | 'win' | 'lose' | 'draw'
     */
    setStatus(message, type = '') {
        this.statusEl.textContent = message;
        this.statusEl.className = 'game-status';
        if (type) this.statusEl.classList.add(`status-${type}`);
    }

    // ─────────────────────────────────────────────────────────────
    //  Board enable / disable
    // ─────────────────────────────────────────────────────────────

    /** Allow clicks on the board. */
    enableBoard() {
        this.boardEl.classList.remove('board-disabled');
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.disabled = false;
    }

    /** Block clicks on the board (e.g. while AI is thinking). */
    disableBoard() {
        this.boardEl.classList.add('board-disabled');
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.disabled = true;
    }

    // ─────────────────────────────────────────────────────────────
    //  Score display
    // ─────────────────────────────────────────────────────────────

    /**
     * Refresh the score counters.
     * @param {{player: number, ai: number, draws: number}} scores
     */
    updateScores(scores) {
        if (this.playerScoreEl) this.playerScoreEl.textContent = scores.player;
        if (this.aiScoreEl)     this.aiScoreEl.textContent     = scores.ai;
        if (this.drawScoreEl)   this.drawScoreEl.textContent   = scores.draws;
    }

    // ─────────────────────────────────────────────────────────────
    //  Celebration effect
    // ─────────────────────────────────────────────────────────────

    /**
     * Briefly add a CSS class to the board for a win celebration animation.
     * @param {'player'|'ai'} winner
     */
    celebrate(winner) {
        this.boardEl.classList.add(`celebrate-${winner}`);
        setTimeout(() => this.boardEl.classList.remove(`celebrate-${winner}`), 1800);
    }
}
