/**
 * Input handlers for Tic-Tac-Toe game
 */
import { Input } from "../../core/input";
import type { TicTacToeGame } from "./tictactoe";

// Key mappings for movement
const MOVEMENT_KEYS: Record<string, [number, number]> = {
  w: [-1, 0], // Move up
  s: [1, 0],  // Move down
  a: [0, -1], // Move left
  d: [0, 1],  // Move right
};

// Keys that trigger marker placement
const PLACE_MARKER_KEYS: string[] = [' ', '\r', '\n'];

/**
 * Create a handler for cursor movement
 */
const createMoveHandler = (game: TicTacToeGame, render: () => void, deltaRow: number, deltaCol: number) => {
  return () => {
    game.moveCursor(deltaRow, deltaCol);
    render();
  };
};

/**
 * Create a handler for game action (place marker or reset)
 */
const createActionHandler = (game: TicTacToeGame, render: () => void, action: () => void) => {
  return () => {
    action();
    render();
  };
};

/**
 * Register all input handlers for the game
 */
export const registerInputHandlers = (game: TicTacToeGame, render: () => void): void => {
  // Register movement handlers (WASD)
  Object.entries(MOVEMENT_KEYS).forEach(([key, [deltaRow, deltaCol]]) => {
    Input.onKey(key, createMoveHandler(game, render, deltaRow, deltaCol));
  });

  // Register place marker handlers
  PLACE_MARKER_KEYS.forEach(key => {
    Input.onKey(key, createActionHandler(game, render, () => game.placeMarkerAtCursor()));
  });

  // Register reset handler
  Input.onKey('r', createActionHandler(game, render, () => game.reset()));

  // Register quit handler
  Input.onKey('q', () => {
    process.exit(0);
  });
};

