/**
 * main.js
 * Entry point — creates and wires all game components.
 *
 * @author Nikhil Raj B
 * @version 2.0.0
 */
document.addEventListener('DOMContentLoaded', () => {
    const board = new GameBoard();
    const ai    = new AIPlayer();
    const ui    = new UI();
    new Game(board, ai, ui);
});
