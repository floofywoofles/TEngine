/**
 * Game logic for Tic-Tac-Toe (win detection, draw detection)
 */
import type { BoardState, Player } from "./types";

// Board dimension constant
const BOARD_SIZE: number = 3;

// Winning diagonal sum for top-right to bottom-left
const DIAGONAL_SUM: number = 2;

/**
 * Check if a cell contains a player marker
 */
const getCellPlayer = (board: BoardState, row: number, col: number): Player => {
  const rowData = board[row];
  return rowData ? (rowData[col] ?? null) : null;
};

/**
 * Check if all cells in an array match the given player
 */
const allCellsMatch = (cells: (Player)[], player: Player): boolean => {
  return cells.length > 0 && cells.every(cell => cell === player);
};

/**
 * Check if a player has won by checking row
 */
const checkRowWin = (board: BoardState, row: number, player: Player): boolean => {
  const rowCells = board[row];
  return rowCells ? allCellsMatch(rowCells, player) : false;
};

/**
 * Check if a player has won by checking column
 */
const checkColumnWin = (board: BoardState, col: number, player: Player): boolean => {
  const columnCells = [
    getCellPlayer(board, 0, col),
    getCellPlayer(board, 1, col),
    getCellPlayer(board, 2, col),
  ];
  return allCellsMatch(columnCells, player);
};

/**
 * Check if a player has won by checking diagonal (top-left to bottom-right)
 */
const checkMainDiagonalWin = (board: BoardState, row: number, col: number, player: Player): boolean => {
  if (row !== col) return false;
  const diagonalCells = [
    getCellPlayer(board, 0, 0),
    getCellPlayer(board, 1, 1),
    getCellPlayer(board, 2, 2),
  ];
  return allCellsMatch(diagonalCells, player);
};

/**
 * Check if a player has won by checking anti-diagonal (top-right to bottom-left)
 */
const checkAntiDiagonalWin = (board: BoardState, row: number, col: number, player: Player): boolean => {
  if (row + col !== DIAGONAL_SUM) return false;
  const diagonalCells = [
    getCellPlayer(board, 0, 2),
    getCellPlayer(board, 1, 1),
    getCellPlayer(board, 2, 0),
  ];
  return allCellsMatch(diagonalCells, player);
};

/**
 * Check if a player has won at the given position
 */
export const checkWin = (board: BoardState, row: number, col: number): boolean => {
  const player = getCellPlayer(board, row, col);
  if (!player) return false;
  return checkRowWin(board, row, player) ||
    checkColumnWin(board, col, player) ||
    checkMainDiagonalWin(board, row, col, player) ||
    checkAntiDiagonalWin(board, row, col, player);
};

/**
 * Check if the board is full (draw)
 */
export const checkDraw = (board: BoardState): boolean => {
  for (let row = 0; row < BOARD_SIZE; row++) {
    const rowData = board[row];
    if (!rowData) return false;
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (rowData[col] === null) return false;
    }
  }
  return true;
};

/**
 * Create an empty board with all cells set to null
 */
export const createEmptyBoard = (): BoardState => {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
};

