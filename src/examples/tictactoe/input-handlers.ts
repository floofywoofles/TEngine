/**
 * Input handlers for Tic-Tac-Toe game
 */
import { Input } from "../../core/input";
import type { TicTacToeGame } from "./tictactoe";

/**
 * Register all input handlers for the game
 */
export const registerInputHandlers = (game: TicTacToeGame, render: () => void): void => {
    // Register WASD handlers for cursor movement
    Input.onKey('w', () => {
        game.moveCursor(-1, 0);
        render();
    });

    Input.onKey('s', () => {
        game.moveCursor(1, 0);
        render();
    });

    Input.onKey('a', () => {
        game.moveCursor(0, -1);
        render();
    });

    Input.onKey('d', () => {
        game.moveCursor(0, 1);
        render();
    });

    // Place marker handler (spacebar or Enter)
    Input.onKey(' ', () => {
        game.placeMarkerAtCursor();
        render();
    });

    Input.onKey('\r', () => {
        game.placeMarkerAtCursor();
        render();
    });

    Input.onKey('\n', () => {
        game.placeMarkerAtCursor();
        render();
    });

    // Reset game handler
    Input.onKey('r', () => {
        game.reset();
        render();
    });

    // Quit handler
    Input.onKey('q', () => {
        process.exit(0);
    });
};

