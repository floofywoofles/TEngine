/**
 * Connect Four Game Implementation using TEngine
 * 
 * Game Rules:
 * - 7 columns x 6 rows board
 * - Two players: Red (R) and Yellow (Y)
 * - Players take turns dropping pieces into columns
 * - First player to connect 4 pieces horizontally, vertically, or diagonally wins
 * 
 * Controls:
 * - Left/Right Arrow keys: Move cursor
 * - Space/Enter: Drop piece
 * - Q: Quit game
 * - R: Restart game
 */

import { Scene } from "../core/scene";
import { Entity } from "../core/entity/entity";
import { Camera } from "../core/camera";
import { Input } from "../core/input";
import { TextEntity } from "../core/helpers/text-entity";
import { Color, ColorHelper } from "../core/helpers/color";
import { EventBus } from "../core/event-bus";

// Game constants
const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 6;
const EMPTY_CELL = "·";
const PLAYER_ONE_PIECE = "R";
const PLAYER_TWO_PIECE = "Y";
const CURSOR_SPRITE = "▼";

/**
 * Represents the game board state
 */
type BoardState = string[][];

/**
 * Represents the current game state
 */
type GameState = {
  board: BoardState;
  currentPlayer: 1 | 2;
  cursorColumn: number;
  gameOver: boolean;
  winner: 1 | 2 | null;
  isDraw: boolean;
};

/**
 * Connect Four Game Class
 * Manages the game logic, rendering, and input handling
 * Now using enhanced TEngine features!
 */
class ConnectFourGame {
  private scene: Scene;
  private camera: Camera;
  private gameState: GameState;
  private boardEntities: Entity[] = [];
  private cursorEntity: Entity | null = null;
  private titleText: TextEntity;
  private statusText: TextEntity;
  private controlsText: TextEntity;
  private events: EventBus;

  constructor() {
    // Initialize event bus for game events
    this.events = new EventBus();
    this.setupEventListeners();

    // Initialize the game state
    this.gameState = this.createInitialGameState();

    // Create the scene with enough space for the board and UI
    // Board: 7 wide x 6 tall, plus borders and status text
    const sceneWidth = BOARD_WIDTH * 2 + 4;
    const sceneHeight = BOARD_HEIGHT + 6;

    // Create camera to view the entire game area
    this.camera = new Camera(
      Math.floor(sceneHeight / 2),
      sceneHeight,
      Math.floor(sceneWidth / 2),
      sceneWidth
    );

    // Create the scene
    this.scene = new Scene(sceneHeight, sceneWidth, "Connect Four", this.camera);

    // Create text entities for UI
    const titleStartX = Math.floor((BOARD_WIDTH * 2 + 4 - "CONNECT FOUR".length) / 2);
    this.titleText = new TextEntity(0, titleStartX, "CONNECT FOUR", 2);
    
    const statusY = BOARD_HEIGHT + 4;
    this.statusText = new TextEntity(statusY, 0, "", 2);
    
    const controlsY = BOARD_HEIGHT + 5;
    this.controlsText = new TextEntity(controlsY, 0, "←→:Move Space:Drop Q:Quit", 2);

    // Initialize the game
    this.initializeGame();
  }

  /**
   * Sets up event listeners for game events
   */
  private setupEventListeners(): void {
    // Listen for piece dropped event
    this.events.on("piece-dropped", (data: { player: number; row: number; col: number }) => {
      console.log(`Player ${data.player} dropped piece at (${data.row}, ${data.col})`);
    });

    // Listen for game over event
    this.events.on("game-over", (data: { winner: number | null; isDraw: boolean }) => {
      if (data.isDraw) {
        console.log("Game ended in a draw!");
      } else {
        console.log(`Player ${data.winner} wins!`);
      }
    });
  }

  /**
   * Creates the initial game state
   */
  private createInitialGameState(): GameState {
    // Create empty board
    const board: BoardState = [];
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      const newRow: string[] = [];
      board[row] = newRow;
      for (let col = 0; col < BOARD_WIDTH; col++) {
        newRow[col] = EMPTY_CELL;
      }
    }

    return {
      board,
      currentPlayer: 1,
      cursorColumn: 3, // Start in the middle
      gameOver: false,
      winner: null,
      isDraw: false,
    };
  }

  /**
   * Initializes the game by setting up entities and input handlers
   */
  private initializeGame(): void {
    // Render the initial game state
    this.renderGame();

    // Setup input handlers
    this.setupInputHandlers();

    // Start the input system
    Input.start();

    // Draw the initial scene
    this.scene.draw();
  }

  /**
   * Sets up all input handlers for the game
   */
  private setupInputHandlers(): void {
    // Left arrow - move cursor left
    Input.onKey("ArrowLeft", ({ isDown }) => {
      if (isDown && !this.gameState.gameOver) {
        this.moveCursor(-1);
      }
    });

    // Right arrow - move cursor right
    Input.onKey("ArrowRight", ({ isDown }) => {
      if (isDown && !this.gameState.gameOver) {
        this.moveCursor(1);
      }
    });

    // Space or Enter - drop piece
    Input.onKey(" ", ({ isDown }) => {
      if (isDown && !this.gameState.gameOver) {
        this.dropPiece();
      }
    });

    Input.onKey("Enter", ({ isDown }) => {
      if (isDown && !this.gameState.gameOver) {
        this.dropPiece();
      }
    });

    // R - restart game
    Input.onKey("r", ({ isDown }) => {
      if (isDown) {
        this.restartGame();
      }
    });

    // Q - quit game
    Input.onKey("q", ({ isDown }) => {
      if (isDown) {
        this.quitGame();
      }
    });
  }

  /**
   * Moves the cursor left or right
   */
  private moveCursor(direction: number): void {
    const newColumn = this.gameState.cursorColumn + direction;

    // Check bounds
    if (newColumn >= 0 && newColumn < BOARD_WIDTH) {
      this.gameState.cursorColumn = newColumn;
      this.renderGame();
      this.scene.draw();
    }
  }

  /**
   * Drops a piece in the current column
   */
  private dropPiece(): void {
    const column = this.gameState.cursorColumn;

    // Find the lowest empty row in this column
    let targetRow = -1;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (this.gameState.board[row]?.[column] === EMPTY_CELL) {
        targetRow = row;
        break;
      }
    }

    // If column is full, do nothing
    if (targetRow === -1) {
      return;
    }

    // Place the piece
    const piece = this.gameState.currentPlayer === 1 ? PLAYER_ONE_PIECE : PLAYER_TWO_PIECE;
    this.gameState.board[targetRow]![column] = piece;

    // Emit piece dropped event
    this.events.emit("piece-dropped", {
      player: this.gameState.currentPlayer,
      row: targetRow,
      col: column
    });

    // Check for win
    if (this.checkWin(targetRow, column)) {
      this.gameState.gameOver = true;
      this.gameState.winner = this.gameState.currentPlayer;
      
      // Emit game over event
      this.events.emit("game-over", {
        winner: this.gameState.winner,
        isDraw: false
      });
    } else if (this.checkDraw()) {
      // Check for draw
      this.gameState.gameOver = true;
      this.gameState.isDraw = true;
      
      // Emit game over event
      this.events.emit("game-over", {
        winner: null,
        isDraw: true
      });
    } else {
      // Switch players
      this.gameState.currentPlayer = this.gameState.currentPlayer === 1 ? 2 : 1;
    }

    // Re-render the game
    this.renderGame();
    this.scene.draw();
  }

  /**
   * Checks if the last move resulted in a win
   */
  private checkWin(row: number, col: number): boolean {
    const piece = this.gameState.board[row]?.[col];
    if (!piece || piece === EMPTY_CELL) return false;

    // Check horizontal
    if (this.checkDirection(row, col, 0, 1, piece)) return true;

    // Check vertical
    if (this.checkDirection(row, col, 1, 0, piece)) return true;

    // Check diagonal (top-left to bottom-right)
    if (this.checkDirection(row, col, 1, 1, piece)) return true;

    // Check diagonal (top-right to bottom-left)
    if (this.checkDirection(row, col, 1, -1, piece)) return true;

    return false;
  }

  /**
   * Checks for 4 in a row in a specific direction
   */
  private checkDirection(row: number, col: number, rowDir: number, colDir: number, piece: string): boolean {
    let count = 1; // Count the piece we just placed

    // Check in positive direction
    for (let i = 1; i < 4; i++) {
      const newRow = row + rowDir * i;
      const newCol = col + colDir * i;
      if (this.gameState.board[newRow]?.[newCol] === piece) {
        count++;
      } else {
        break;
      }
    }

    // Check in negative direction
    for (let i = 1; i < 4; i++) {
      const newRow = row - rowDir * i;
      const newCol = col - colDir * i;
      if (this.gameState.board[newRow]?.[newCol] === piece) {
        count++;
      } else {
        break;
      }
    }

    return count >= 4;
  }

  /**
   * Checks if the game is a draw (board is full)
   */
  private checkDraw(): boolean {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      if (this.gameState.board[0]?.[col] === EMPTY_CELL) {
        return false;
      }
    }
    return true;
  }

  /**
   * Renders the entire game state to the scene
   */
  private renderGame(): void {
    // Use new clearAllEntities method from Scene
    this.scene.clearAllEntities();
    this.boardEntities = [];

    // Add title text (using TextEntity)
    this.titleText.addToScene(this.scene);

    // Render the cursor
    this.renderCursor();

    // Render the board
    this.renderBoard();

    // Render the status message (using TextEntity)
    this.renderStatus();

    // Add controls text (using TextEntity)
    this.controlsText.addToScene(this.scene);
  }

  /**
   * Renders the cursor above the board
   */
  private renderCursor(): void {
    const cursorX = 2 + this.gameState.cursorColumn * 2;
    const cursorY = 1;

    // Create cursor with color based on current player
    const color = this.gameState.currentPlayer === 1 ? Color.Red : Color.Yellow;
    const coloredCursor = ColorHelper.colorize(CURSOR_SPRITE, color);
    
    this.cursorEntity = new Entity(cursorY, cursorX, coloredCursor);
    this.cursorEntity.setLayer(3); // Cursor on top layer
    this.scene.addEntity(this.cursorEntity);
  }

  /**
   * Renders the game board with colored pieces
   */
  private renderBoard(): void {
    const boardStartY = 2;
    const boardStartX = 2;

    // Render the board cells with colors
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const piece = this.gameState.board[row]?.[col] || EMPTY_CELL;
        const x = boardStartX + col * 2;
        const y = boardStartY + row;

        // Apply colors to pieces
        let displayPiece = piece;
        if (piece === PLAYER_ONE_PIECE) {
          displayPiece = ColorHelper.colorize(piece, Color.Red);
        } else if (piece === PLAYER_TWO_PIECE) {
          displayPiece = ColorHelper.colorize(piece, Color.Yellow);
        }

        const entity = new Entity(y, x, displayPiece);
        entity.setLayer(1); // Board pieces on layer 1
        this.scene.addEntity(entity);
        this.boardEntities.push(entity);
      }
    }

    // Render column numbers below the board
    for (let col = 0; col < BOARD_WIDTH; col++) {
      const x = boardStartX + col * 2;
      const y = boardStartY + BOARD_HEIGHT;
      const colNumber = ColorHelper.colorize(String(col + 1), Color.Cyan);
      const entity = new Entity(y, x, colNumber);
      entity.setLayer(1);
      this.scene.addEntity(entity);
      this.boardEntities.push(entity);
    }
  }

  /**
   * Renders the status message using TextEntity and colors
   */
  private renderStatus(): void {
    let message = "";
    let color = Color.White;

    if (this.gameState.gameOver) {
      if (this.gameState.isDraw) {
        message = "DRAW! Press R to restart";
        color = Color.Yellow;
      } else {
        const winner = this.gameState.winner === 1 ? "RED" : "YELLOW";
        message = `${winner} WINS! Press R to restart`;
        color = this.gameState.winner === 1 ? Color.Red : Color.Yellow;
      }
    } else {
      const player = this.gameState.currentPlayer === 1 ? "RED" : "YELLOW";
      message = `${player}'s turn`;
      color = this.gameState.currentPlayer === 1 ? Color.Red : Color.Yellow;
    }

    // Apply color to message
    const coloredMessage = ColorHelper.style(message, Color.Bold, color);
    
    // Center the message
    const startX = Math.floor((BOARD_WIDTH * 2 + 4 - message.length) / 2);
    
    // Update status text position and content
    this.statusText.setText(coloredMessage);
    this.statusText.setPosition(BOARD_HEIGHT + 4, startX);
    this.statusText.addToScene(this.scene);
  }

  /**
   * Restarts the game with a fresh state
   */
  private restartGame(): void {
    this.gameState = this.createInitialGameState();
    this.renderGame();
    this.scene.draw();
  }

  /**
   * Quits the game and exits the program
   */
  private quitGame(): void {
    console.clear();
    console.log("\nThanks for playing Connect Four!");
    console.log("Goodbye!\n");
    Input.stop();
    process.exit(0);
  }
}

// Start the game
// Create game instance - the constructor handles initialization
new ConnectFourGame();

