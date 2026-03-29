/**
 * Connect Four - Main Entry Point
 * Instantiates and wires together all components.
 * @author Nikhil Raj B
 * @version 2.0.0
 */

document.addEventListener('DOMContentLoaded', () => {
    // ── Instantiate components ──────────────────────────────────
    const board = new GameBoard();
    const ai    = new AIPlayer('medium');
    const game  = new Game();
    const ui    = new UI();

    // Wire them together
    game.setUI(ui);
    ui.setGame(game);

    // Start the first game
    game.reset();

    // ── Button event listeners ──────────────────────────────────
    document.getElementById('new-game-btn').addEventListener('click', () => game.reset());
    document.getElementById('undo-btn').addEventListener('click',    () => game.undoMove());

    document.getElementById('difficulty').addEventListener('change', (e) => {
        game.setDifficulty(e.target.value);
    });

    // ── Keyboard support ────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        // Ignore if focus is inside a form control
        if (['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                ui.moveKeyboardSelection(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                ui.moveKeyboardSelection(1);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                ui.playKeyboardSelection();
                break;
            case 'n':
            case 'N':
                game.reset();
                break;
            case 'z':
            case 'Z':
                game.undoMove();
                break;
        }
    });
});
