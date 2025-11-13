/**
 * Game logic for Tic-Tac-Toe (win detection, draw detection)
 */
import type { BoardState } from "./types";

/**
 * Check if a player has won at the given position
 */
export const checkWin = (board: BoardState, row: number, col: number): boolean => {
    const rowData = board[row];
    if (!rowData) {
        return false;
    }
    const player = rowData[col];
    if (!player) {
        return false;
    }

    // Check row
    const currentRow = board[row];
    if (currentRow &&
        currentRow[0] === player &&
        currentRow[1] === player &&
        currentRow[2] === player) {
        return true;
    }

    // Check column
    const col0 = board[0];
    const col1 = board[1];
    const col2 = board[2];
    if (col0 && col1 && col2 &&
        col0[col] === player &&
        col1[col] === player &&
        col2[col] === player) {
        return true;
    }

    // Check diagonal (top-left to bottom-right)
    if (row === col &&
        col0 && col1 && col2 &&
        col0[0] === player &&
        col1[1] === player &&
        col2[2] === player) {
        return true;
    }

    // Check diagonal (top-right to bottom-left)
    if (row + col === 2 &&
        col0 && col1 && col2 &&
        col0[2] === player &&
        col1[1] === player &&
        col2[0] === player) {
        return true;
    }

    return false;
};

/**
 * Check if the board is full (draw)
 */
export const checkDraw = (board: BoardState): boolean => {
    for (let row = 0; row < 3; row++) {
        const rowData = board[row];
        if (!rowData) {
            return false;
        }
        for (let col = 0; col < 3; col++) {
            if (rowData[col] === null) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Create an empty board
 */
export const createEmptyBoard = (): BoardState => {
    return [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
};

