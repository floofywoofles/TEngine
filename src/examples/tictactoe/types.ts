/**
 * Type definitions for Tic-Tac-Toe game
 */

// Player type: X, O, or empty cell
export type Player = "X" | "O" | null;

// 3x3 board state with player markers
export type BoardState = Player[][];

// Cursor position on the board
export interface CursorPosition {
  row: number;
  col: number;
}

// Complete game state snapshot
export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  gameOver: boolean;
  winner: Player;
}

