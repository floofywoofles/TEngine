import { Global } from "../../core/global";
import { Camera } from "../../core/camera";
import { Entity } from "../../core/entity";
import { Input } from "../../core/input";
import { Scene } from "../../core/scene";
import type { Player, BoardState } from "./types";
import { checkWin, checkDraw, createEmptyBoard } from "./game-logic";
import { boardIndicesToCoords, drawBoard } from "./board-renderer";
import { registerInputHandlers } from "./input-handlers";

export class TicTacToeGame {
    private board: BoardState;
    private currentPlayer: Player;
    private gameOver: boolean;
    private winner: Player;
    private scene: Scene;
    private camera: Camera;
    private gridEntities: Entity[];
    private markerEntities: Map<string, Entity>;
    private cursorEntity: Entity;
    private cursorRow: number;
    private cursorCol: number;

    constructor() {
        // Initialize 3x3 board
        this.board = createEmptyBoard();
        this.currentPlayer = "X";
        this.gameOver = false;
        this.winner = null;
        this.gridEntities = [];
        this.markerEntities = new Map();
        this.cursorRow = 1;
        this.cursorCol = 1;

        // Create scene
        this.scene = new Scene("tictactoe");
        Global.getScenes.setCurrentScene(this.scene);

        // Create camera with viewport to show the board
        this.camera = new Camera(0, 0, 5, 5);
        this.scene.addEntity(this.camera);

        // Draw the board grid
        this.gridEntities = drawBoard(this.scene);

        // Create cursor entity (will show current player's marker)
        const cursorCoords = boardIndicesToCoords(this.cursorRow, this.cursorCol);
        this.cursorEntity = new Entity(cursorCoords.row, cursorCoords.col, this.currentPlayer || " ");
        this.scene.addEntity(this.cursorEntity);
    }


    /**
     * Update cursor sprite to show current player's marker
     */
    private updateCursorSprite(): void {
        // Only show cursor if cell is empty
        const cell = this.board[this.cursorRow];
        if (cell && cell[this.cursorCol] === null) {
            // Update sprite to show current player's marker
            const cursorCoords = boardIndicesToCoords(this.cursorRow, this.cursorCol);
            this.cursorEntity.position = { y: cursorCoords.row, x: cursorCoords.col };
            this.cursorEntity.setSprite(this.currentPlayer || " ");
        } else {
            // Hide cursor if cell is occupied
            this.cursorEntity.position = { y: -1, x: -1 };
            this.cursorEntity.setSprite(" ");
        }
    }

    /**
     * Move cursor with bounds checking
     */
    public moveCursor(deltaRow: number, deltaCol: number): void {
        const newRow = Math.max(0, Math.min(2, this.cursorRow + deltaRow));
        const newCol = Math.max(0, Math.min(2, this.cursorCol + deltaCol));

        if (newRow !== this.cursorRow || newCol !== this.cursorCol) {
            this.cursorRow = newRow;
            this.cursorCol = newCol;
            const coords = boardIndicesToCoords(this.cursorRow, this.cursorCol);

            // Check if cell is empty - only show cursor marker if empty
            const cell = this.board[this.cursorRow];
            const isEmpty = cell && cell[this.cursorCol] === null;

            if (isEmpty) {
                // Show current player's marker as cursor
                this.cursorEntity.position = { y: coords.row, x: coords.col };
                this.cursorEntity.setSprite(this.currentPlayer || " ");
            } else {
                // Hide cursor on occupied cells
                this.cursorEntity.position = { y: -1, x: -1 };
                this.cursorEntity.setSprite(" ");
            }
        }
    }

    /**
     * Place a marker at the current cursor position
     */
    public placeMarkerAtCursor(): boolean {
        if (this.gameOver) {
            return false;
        }

        const row = this.cursorRow;
        const col = this.cursorCol;

        // Check if position is already taken
        const cell = this.board[row];
        if (!cell || cell[col] !== null) {
            return false;
        }

        // Place marker on board
        cell[col] = this.currentPlayer;

        // Create visual marker entity
        const coords = boardIndicesToCoords(row, col);
        if (this.currentPlayer) {
            const marker = new Entity(coords.row, coords.col, this.currentPlayer);
            this.scene.addEntity(marker);
            this.markerEntities.set(`${row}-${col}`, marker);

            // Update cursor at current position (will be updated after player switch)
            this.updateCursorSprite();
        }

        // Check for win
        if (checkWin(this.board, row, col)) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            return true;
        }

        // Check for draw
        if (checkDraw(this.board)) {
            this.gameOver = true;
            return true;
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";

        // Update cursor to show new player's marker
        this.updateCursorSprite();
        return true;
    }


    /**
     * Reset the game
     */
    public reset(): void {
        // Clear board
        this.board = createEmptyBoard();
        this.currentPlayer = "X";
        this.gameOver = false;
        this.winner = null;
        this.cursorRow = 1;
        this.cursorCol = 1;

        // Reset cursor position and sprite
        const cursorCoords = boardIndicesToCoords(this.cursorRow, this.cursorCol);
        this.cursorEntity.position = { y: cursorCoords.row, x: cursorCoords.col };
        this.cursorEntity.setSprite(this.currentPlayer || " ");

        // Remove marker entities
        this.markerEntities.forEach(marker => {
            marker.remove();
        });
        this.markerEntities.clear();
    }

    /**
     * Get current game status message
     */
    public getStatusMessage(): string {
        if (this.gameOver) {
            if (this.winner) {
                return `Player ${this.winner} wins! Press 'r' to restart.`;
            } else {
                return "It's a draw! Press 'r' to restart.";
            }
        } else {
            return `Player ${this.currentPlayer}'s turn. Use WASD to move cursor, SPACE to place marker.`;
        }
    }

    /**
     * Render the game
     */
    public render(): void {
        // Clear console and show status
        console.clear();
        console.log(this.getStatusMessage());
        console.log("\n");

        // Draw the scene
        this.scene.draw(this.camera.position, this.camera.viewPort);
    }
}

// Initialize game
const game = new TicTacToeGame();

// Register all input handlers
registerInputHandlers(game, () => game.render());

// Start input listening
Input.start();

// Initial render
game.render();

// Game loop
async function main() {
    while (true) {
        // Game updates happen on input, so we just wait
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

main();

