/**
 * UI class
 * Handles all DOM manipulation, board rendering, animations, and event wiring.
 *
 * Board visual convention:
 *   visual row 0     = top of the displayed board = logical row ROWS-1
 *   visual row ROWS-1 = bottom of the displayed board = logical row 0
 *
 * @author Nikhil Raj B
 * @version 2.0.0
 */
class UI {
    constructor() {
        // DOM references
        this._boardEl      = document.getElementById('game-board');
        this._statusEl     = document.getElementById('game-status');
        this._statusIcon   = document.getElementById('status-icon');
        this._statusText   = document.getElementById('status-text');
        this._playerScore  = document.getElementById('player-score');
        this._aiScore      = document.getElementById('ai-score');
        this._drawScore    = document.getElementById('draw-score');
        this._newGameBtn   = document.getElementById('new-game-btn');
        this._undoBtn      = document.getElementById('undo-btn');
        this._diffBtns     = document.querySelectorAll('.diff-btn');

        // Event callbacks — assigned by Game
        this.onColumnClick      = null;
        this.onColumnHover      = null;
        this.onColumnLeave      = null;
        this.onNewGame          = null;
        this.onUndo             = null;
        this.onDifficultyChange = null;

        this._kbCol = 3; // current keyboard-selected column
        this._rows  = 6; // updated on first renderBoard call

        this._bindStaticEvents();
    }

    // ─── Board rendering ───────────────────────────────────────────────────────

    /**
     * Fully re-render the board from a GameBoard instance.
     * @param {GameBoard} board
     */
    renderBoard(board) {
        this._rows = board.ROWS;
        this._boardEl.innerHTML = '';
        this._boardEl.style.setProperty('--cols', board.COLS);

        for (let col = 0; col < board.COLS; col++) {
            const colEl = this._makeColumnEl(col, board);
            this._boardEl.appendChild(colEl);
        }
    }

    // ─── Animations ────────────────────────────────────────────────────────────

    /**
     * Animate a disc dropping into the target cell, then fire the callback.
     * @param {number}   col       - Column index
     * @param {number}   visualRow - Visual row (0 = top of board)
     * @param {number}   player    - 1 (human) | 2 (AI)
     * @param {Function} callback  - Called once the animation finishes
     */
    animateDrop(col, visualRow, player, callback) {
        const colEl  = this._boardEl.children[col];
        if (!colEl) { callback(); return; }

        const cellEl = colEl.children[visualRow];
        if (!cellEl) { callback(); return; }

        this.clearPreview();

        const cls = player === 1 ? 'player' : 'ai';
        cellEl.classList.remove('player', 'ai', 'preview');
        cellEl.classList.add(cls, 'dropping');

        const onEnd = () => {
            cellEl.removeEventListener('animationend', onEnd);
            cellEl.classList.remove('dropping');
            callback();
        };
        cellEl.addEventListener('animationend', onEnd);
    }

    /**
     * Show a ghost "preview" disc at visualRow in the given column.
     * @param {number} col
     * @param {number} visualRow
     */
    showPreview(col, visualRow) {
        this.clearPreview();
        const colEl  = this._boardEl.children[col];
        if (!colEl) return;
        const cellEl = colEl.children[visualRow];
        if (!cellEl || cellEl.classList.contains('player') || cellEl.classList.contains('ai')) return;
        cellEl.classList.add('preview');
    }

    /** Remove all preview discs from the board. */
    clearPreview() {
        this._boardEl.querySelectorAll('.cell.preview')
            .forEach(c => c.classList.remove('preview'));
    }

    /**
     * Pulse-highlight the winning cells.
     * @param {Array<[number, number]>} cells - [logicalRow, col] pairs
     * @param {number} totalRows
     */
    showWinAnimation(cells, totalRows) {
        if (!cells) return;
        cells.forEach(([logRow, col]) => {
            const visualRow = totalRows - 1 - logRow;
            const colEl     = this._boardEl.children[col];
            if (!colEl) return;
            const cellEl = colEl.children[visualRow];
            if (cellEl) cellEl.classList.add('winning');
        });
        this._statusEl.classList.add('win-flash');
    }

    // ─── Status & scores ──────────────────────────────────────────────────────

    /**
     * Update the status bar message and visual theme.
     * @param {string} message
     * @param {string} type - 'player' | 'ai' | 'player-win' | 'ai-win' | 'draw'
     */
    setStatus(message, type) {
        const icons = {
            'player':     '🎯',
            'ai':         '🤖',
            'player-win': '🎉',
            'ai-win':     '🤖',
            'draw':       '🤝',
        };
        this._statusEl.className = 'status-bar';
        if (type) this._statusEl.classList.add(`status-${type}`);
        this._statusIcon.textContent = icons[type] || '⚙️';
        this._statusText.textContent = message;
    }

    /**
     * Refresh the scoreboard.
     * @param {{ player: number, ai: number, draw: number }} scores
     */
    updateScores(scores) {
        this._animateScore(this._playerScore, scores.player);
        this._animateScore(this._aiScore,     scores.ai);
        this._animateScore(this._drawScore,   scores.draw);
    }

    /**
     * Allow (true) or block (false) player interaction with the board.
     * @param {boolean} enabled
     */
    setInteractive(enabled) {
        this._boardEl.querySelectorAll('.column').forEach(col => {
            col.style.cursor        = enabled ? 'pointer'      : 'not-allowed';
            col.style.pointerEvents = enabled ? 'auto'         : 'none';
        });
        this._undoBtn.disabled = !enabled;
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    _makeColumnEl(col, board) {
        const colEl = document.createElement('div');
        colEl.className    = 'column';
        colEl.dataset.col  = col;

        // Cells rendered top-to-bottom visually (visual row 0 = logical ROWS-1)
        for (let vRow = 0; vRow < board.ROWS; vRow++) {
            const logRow = board.ROWS - 1 - vRow;
            const cell   = document.createElement('div');
            cell.className = 'cell';

            const v = board.grid[logRow][col];
            if (v === 1) cell.classList.add('player');
            else if (v === 2) cell.classList.add('ai');

            colEl.appendChild(cell);
        }

        colEl.addEventListener('click',      () => this.onColumnClick  && this.onColumnClick(col));
        colEl.addEventListener('mouseenter', () => this.onColumnHover  && this.onColumnHover(col));
        colEl.addEventListener('mouseleave', () => this.onColumnLeave  && this.onColumnLeave());

        return colEl;
    }

    _animateScore(el, newValue) {
        const current = parseInt(el.textContent, 10) || 0;
        if (current === newValue) return;
        el.classList.add('score-bump');
        el.textContent = newValue;
        el.addEventListener('animationend', () => el.classList.remove('score-bump'), { once: true });
    }

    _bindStaticEvents() {
        this._newGameBtn.addEventListener('click', () => this.onNewGame && this.onNewGame());
        this._undoBtn.addEventListener(   'click', () => this.onUndo    && this.onUndo());

        this._diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this._diffBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.onDifficultyChange && this.onDifficultyChange(btn.dataset.level);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const cols = this._boardEl.children.length;
            if (!cols) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this._kbCol = Math.max(0, this._kbCol - 1);
                this._applyKeyboardFocus();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this._kbCol = Math.min(cols - 1, this._kbCol + 1);
                this._applyKeyboardFocus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.onColumnClick && this.onColumnClick(this._kbCol);
            }
        });
    }

    _applyKeyboardFocus() {
        Array.from(this._boardEl.children).forEach((colEl, i) => {
            colEl.classList.toggle('keyboard-focus', i === this._kbCol);
        });
        this.onColumnHover && this.onColumnHover(this._kbCol);
    }
}
