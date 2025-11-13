import { Global } from "../../core/global";
import { Camera } from "../../core/camera";
import { Entity } from "../../core/entity";
import { Input } from "../../core/input";
import { Scene } from "../../core/scene";
import { State } from "../../core/state";
import type { Player, BoardState, CursorPosition } from "./types";
import { checkWin, checkDraw, createEmptyBoard } from "./game-logic";
import { boardIndicesToCoords, drawBoard } from "./board-renderer";
import { registerInputHandlers } from "./input-handlers";

// Game constants
const DEFAULT_PLAYER: Player = "X";
const DEFAULT_CURSOR_ROW: number = 1;
const DEFAULT_CURSOR_COL: number = 1;
const CAMERA_SIZE: number = 5;
const CURSOR_HIDDEN_POS: number = -1;
const MIN_BOARD_INDEX: number = 0;
const MAX_BOARD_INDEX: number = 2;

// State key constants
const STATE_KEY_CURRENT_PLAYER: string = "currentPlayer";
const STATE_KEY_GAME_OVER: string = "gameOver";
const STATE_KEY_WINNER: string = "winner";

/**
 * TicTacToeGame manages the game state, logic, and rendering
 */
export class TicTacToeGame {
  // Game state (managed by State class)
  private state: State;
  private board: BoardState;

  // Scene and rendering
  private scene: Scene;
  private camera: Camera;
  private gridEntities: Entity[];
  private markerEntities: Map<string, Entity>;

  // Cursor state
  private cursorEntity: Entity;
  private cursorRow: number;
  private cursorCol: number;

  constructor() {
    // Initialize state management
    this.state = new State();
    this.state.setState<Player>(STATE_KEY_CURRENT_PLAYER, DEFAULT_PLAYER);
    this.state.setState<boolean>(STATE_KEY_GAME_OVER, false);
    this.state.setState<Player>(STATE_KEY_WINNER, null);

    // Initialize game board
    this.board = createEmptyBoard();
    this.gridEntities = [];
    this.markerEntities = new Map();
    this.cursorRow = DEFAULT_CURSOR_ROW;
    this.cursorCol = DEFAULT_CURSOR_COL;

    // Create scene and camera
    this.scene = new Scene("tictactoe");
    Global.getScenes.setCurrentScene(this.scene);
    this.camera = new Camera(0, 0, CAMERA_SIZE, CAMERA_SIZE);
    this.scene.addEntity(this.camera);

    // Draw board grid
    this.gridEntities = drawBoard(this.scene);

    // Create and initialize cursor entity
    const cursorCoords = boardIndicesToCoords(this.cursorRow, this.cursorCol);
    const currentPlayer = this.state.getState<Player>(STATE_KEY_CURRENT_PLAYER) ?? " ";
    this.cursorEntity = new Entity(cursorCoords.row, cursorCoords.col, currentPlayer);
    this.scene.addEntity(this.cursorEntity);
  }

  /**
   * Check if a cell is empty (contains null)
   */
  private isCellEmpty(row: number, col: number): boolean {
    const cell = this.board[row];
    return cell ? cell[col] === null : false;
  }

  /**
   * Clamp cursor position to board bounds (0-2)
   */
  private clampCursorPosition(row: number, col: number): CursorPosition {
    return {
      row: Math.max(MIN_BOARD_INDEX, Math.min(MAX_BOARD_INDEX, row)),
      col: Math.max(MIN_BOARD_INDEX, Math.min(MAX_BOARD_INDEX, col)),
    };
  }

  /**
   * Update cursor position and visibility based on cell state
   */
  private updateCursorDisplay(): void {
    const isEmpty = this.isCellEmpty(this.cursorRow, this.cursorCol);
    const coords = boardIndicesToCoords(this.cursorRow, this.cursorCol);
    const currentPlayer = this.state.getState<Player>(STATE_KEY_CURRENT_PLAYER) ?? " ";

    if (isEmpty) {
      // Show cursor with current player's marker on empty cell
      this.cursorEntity.position = { y: coords.row, x: coords.col };
      this.cursorEntity.setSprite(currentPlayer);
    } else {
      // Hide cursor on occupied cell
      this.cursorEntity.position = { y: CURSOR_HIDDEN_POS, x: CURSOR_HIDDEN_POS };
      this.cursorEntity.setSprite(" ");
    }
  }

  /**
   * Switch player from X to O or O to X
   */
  private switchCurrentPlayer(): void {
    const currentPlayer = this.state.getState<Player>(STATE_KEY_CURRENT_PLAYER);
    const nextPlayer: Player = currentPlayer === "X" ? "O" : "X";
    this.state.setState<Player>(STATE_KEY_CURRENT_PLAYER, nextPlayer);
  }

  /**
   * Check for win or draw and update game state
   */
  private updateGameEndState(row: number, col: number): void {
    if (checkWin(this.board, row, col)) {
      const currentPlayer = this.state.getState<Player>(STATE_KEY_CURRENT_PLAYER) ?? "X";
      this.state.setState<boolean>(STATE_KEY_GAME_OVER, true);
      this.state.setState<Player>(STATE_KEY_WINNER, currentPlayer);
      return;
    }
    if (checkDraw(this.board)) {
      this.state.setState<boolean>(STATE_KEY_GAME_OVER, true);
    }
  }

  /**
   * Place player marker at cursor position and update game state
   */
  public placeMarkerAtCursor(): boolean {
    // Prevent moves if game is over
    const gameOver = this.state.getState<boolean>(STATE_KEY_GAME_OVER);
    if (gameOver) return false;

    const row = this.cursorRow;
    const col = this.cursorCol;

    // Prevent moves on occupied cells
    if (!this.isCellEmpty(row, col)) return false;

    // Get current player
    const currentPlayer = this.state.getState<Player>(STATE_KEY_CURRENT_PLAYER) ?? "X";

    // Place marker on board
    const cell = this.board[row];
    if (cell) {
      cell[col] = currentPlayer;
    }

    // Create visual marker entity
    const coords = boardIndicesToCoords(row, col);
    if (currentPlayer) {
      const marker = new Entity(coords.row, coords.col, currentPlayer);
      this.scene.addEntity(marker);
      this.markerEntities.set(`${row}-${col}`, marker);
    }

    // Check for win or draw
    this.updateGameEndState(row, col);
    const isGameOver = this.state.getState<boolean>(STATE_KEY_GAME_OVER);
    if (isGameOver) return true;

    // Switch player and update cursor display
    this.switchCurrentPlayer();
    this.updateCursorDisplay();

    return true;
  }

  /**
   * Move cursor with delta values and bounds checking
   */
  public moveCursor(deltaRow: number, deltaCol: number): void {
    const newPos = this.clampCursorPosition(
      this.cursorRow + deltaRow,
      this.cursorCol + deltaCol,
    );

    // Only update if position changed
    if (newPos.row === this.cursorRow && newPos.col === this.cursorCol) return;

    this.cursorRow = newPos.row;
    this.cursorCol = newPos.col;
    this.updateCursorDisplay();
  }

  /**
   * Reset the game to initial state
   */
  public reset(): void {
    // Reset game state
    this.board = createEmptyBoard();
    this.state.setState<Player>(STATE_KEY_CURRENT_PLAYER, DEFAULT_PLAYER);
    this.state.setState<boolean>(STATE_KEY_GAME_OVER, false);
    this.state.setState<Player>(STATE_KEY_WINNER, null);
    this.cursorRow = DEFAULT_CURSOR_ROW;
    this.cursorCol = DEFAULT_CURSOR_COL;

    // Reset cursor entity
    const cursorCoords = boardIndicesToCoords(this.cursorRow, this.cursorCol);
    const currentPlayer = this.state.getState<Player>(STATE_KEY_CURRENT_PLAYER) ?? " ";
    this.cursorEntity.position = { y: cursorCoords.row, x: cursorCoords.col };
    this.cursorEntity.setSprite(currentPlayer);

    // Remove all marker entities from scene
    this.markerEntities.forEach(marker => {
      marker.remove();
    });
    this.markerEntities.clear();
  }

  /**
   * Get current game status message for display
   */
  public getStatusMessage(): string {
    const gameOver = this.state.getState<boolean>(STATE_KEY_GAME_OVER);
    if (gameOver) {
      const winner = this.state.getState<Player>(STATE_KEY_WINNER);
      if (winner) {
        return `Player ${winner} wins! Press 'r' to restart.`;
      }
      return "It's a draw! Press 'r' to restart.";
    }
    const currentPlayer = this.state.getState<Player>(STATE_KEY_CURRENT_PLAYER);
    return `Player ${currentPlayer}'s turn. Use WASD to move cursor, SPACE to place marker.`;
  }

  /**
   * Render the game to console
   */
  public render(): void {
    // Clear console and display status
    console.clear();
    console.log(this.getStatusMessage());
    console.log("\n");

    // Draw scene with camera viewport
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

