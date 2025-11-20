/**
 * Connect Four Clone
 * Uses core State and EventBus for management.
 */

import { Scene } from "../core/scene";
import { Entity } from "../core/entity/entity";
import { Camera } from "../core/camera";
import { Input } from "../core/input";
import { Color, ColorHelper } from "../core/helpers/color";
import { EventBus } from "../core/event-bus";
import { State } from "../core/state";
import { TextEntity } from "../core/helpers/text-entity";

// --- Constants ---
const COLS = 7;
const ROWS = 6;
const P1 = "R"; // Player 1 Sprite
const P2 = "Y"; // Player 2 Sprite
const EMPTY = "·";

// --- Types ---
type Player = "R" | "Y";
type BoardGrid = string[][];

interface GameState {
    board: BoardGrid;
    turn: Player;
    cursor: number; // Column index 0-6
    winner: Player | "DRAW" | null;
}

/**
 * Main Game Class
 */
class ConnectFour {
    private state: State<GameState>;
    private events: EventBus;
    private scene: Scene;

    constructor() {
        // 1. Setup Core Systems
        this.events = new EventBus();
        this.state = new State<GameState>();

        // Setup Scene (Height, Width) - ample space for UI
        this.scene = new Scene(ROWS + 6, COLS * 2 + 4, "Connect 4", new Camera(ROWS / 2 + 3, ROWS + 6, COLS + 2, COLS * 2 + 4));

        // 2. Initialize State
        this.resetState();

        // 3. Subscribe to State Changes for Rendering
        this.state.subscribe(() => this.render());

        // 4. Setup Event Listeners (Input -> Logic)
        this.setupInput();
        this.setupGameEvents();

        // 5. Start Game Loop components
        Input.start();
        this.render(); // Initial render

        // Keep process alive (mimicking game loop start if needed, though Input usually handles it)
        console.log("Connect Four Started! Use Arrows to move, Space to drop, Q to quit.");
        this.scene.draw();
    }

    /**
     * Resets the game state to initial values.
     */
    private resetState() {
        const emptyBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
        // We must set keys individually due to State implementation
        this.state.setState("board", emptyBoard);
        this.state.setState("turn", P1);
        this.state.setState("cursor", Math.floor(COLS / 2));
        this.state.setState("winner", null);
    }

    /**
     * Configures input handling using EventBus to decouple input from logic.
     */
    private setupInput() {
        // Map keys to events
        Input.onKey("ArrowLeft", ({ isDown }) => isDown && this.events.emit("move", -1));
        Input.onKey("ArrowRight", ({ isDown }) => isDown && this.events.emit("move", 1));
        Input.onKey(" ", ({ isDown }) => isDown && this.events.emit("drop"));
        Input.onKey("Enter", ({ isDown }) => isDown && this.events.emit("drop"));
        Input.onKey("r", ({ isDown }) => isDown && this.events.emit("restart"));
        Input.onKey("q", ({ isDown }) => isDown && process.exit(0));
    }

    /**
     * Handles game logic events.
     */
    private setupGameEvents() {
        // Handle Cursor Movement
        this.events.on("move", (dir) => {
            const s = this.state.getState();
            if (s.winner) return; // Game over

            const newCursor = Math.max(0, Math.min(COLS - 1, s.cursor + (dir as number)));
            if (newCursor !== s.cursor) {
                this.state.setState("cursor", newCursor);
            }
        });

        // Handle Piece Drop
        this.events.on("drop", () => {
            const s = this.state.getState();
            if (s.winner) return;

            // Find lowest empty row in current column
            const col = s.cursor;
            let row = -1;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (s.board[r]?.[col] === EMPTY) {
                    row = r;
                    break;
                }
            }

            if (row !== -1) {
                // Clone board to mutate (immutability practice)
                const newBoard = s.board.map(r => [...r]);
                if (newBoard[row]) {
                    newBoard[row]![col] = s.turn;
                    this.state.setState("board", newBoard);

                    // Check Win
                    if (this.checkWin(newBoard, row, col, s.turn)) {
                        this.state.setState("winner", s.turn);
                    } else if (this.checkDraw(newBoard)) {
                        this.state.setState("winner", "DRAW");
                    } else {
                        // Switch Turn
                        this.state.setState("turn", s.turn === P1 ? P2 : P1);
                    }
                }
            }
        });

        // Handle Restart
        this.events.on("restart", () => this.resetState());
    }

    /**
     * Renders the game state to the scene.
     */
    private render() {
        this.scene.clearAllEntities();
        const s = this.state.getState();

        // 1. Draw Title
        new TextEntity(0, 1, "CONNECT FOUR", 2).addToScene(this.scene);

        // 2. Draw Status
        let statusText = `Turn: ${s.turn === P1 ? "RED" : "YELLOW"}`;
        let color = s.turn === P1 ? Color.Red : Color.Yellow;

        if (s.winner) {
            statusText = s.winner === "DRAW" ? "GAME DRAW!" : `${s.winner === P1 ? "RED" : "YELLOW"} WINS!`;
            color = Color.Green;
        }

        const msg = statusText + " (R: Reset, Q: Quit)";
        // Draw colored text manually since TextEntity doesn't support colored sprites per char easily with colorize() helper on full string
        for (let i = 0; i < msg.length; i++) {
            this.scene.addEntity(new Entity(ROWS + 3, 1 + i, ColorHelper.colorize(msg[i]!, color)));
        }

        // 3. Draw Cursor
        if (!s.winner) {
            const cursorChar = "v";
            const cursorColor = s.turn === P1 ? Color.Red : Color.Yellow;
            const cursor = new Entity(1, 2 + s.cursor * 2, ColorHelper.colorize(cursorChar, cursorColor));
            this.scene.addEntity(cursor);
        }

        // 4. Draw Board
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = s.board[r]?.[c];
                if (!cell) continue;

                const x = 2 + c * 2; // Spacing
                const y = 2 + r;

                let sprite = cell;
                if (cell === P1) sprite = ColorHelper.colorize("O", Color.Red);
                if (cell === P2) sprite = ColorHelper.colorize("O", Color.Yellow);
                if (cell === EMPTY) sprite = ColorHelper.colorize(".", Color.Black); // Dim dot

                this.scene.addEntity(new Entity(y, x, sprite));
            }
        }

        this.scene.draw();
    }

    /**
     * Checks for a win condition from the last placed piece.
     */
    private checkWin(board: BoardGrid, row: number, col: number, player: Player): boolean {
        const directions: [number, number][] = [
            [0, 1],  // Horizontal
            [1, 0],  // Vertical
            [1, 1],  // Diagonal \
            [1, -1]  // Diagonal /
        ];

        for (const [dr, dc] of directions) {
            let count = 1;
            // Check positive direction
            for (let i = 1; i < 4; i++) {
                const r = row + (dr * i);
                const c = col + (dc * i);
                if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r]?.[c] !== player) break;
                count++;
            }
            // Check negative direction
            for (let i = 1; i < 4; i++) {
                const r = row - (dr * i);
                const c = col - (dc * i);
                if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r]?.[c] !== player) break;
                count++;
            }
            if (count >= 4) return true;
        }
        return false;
    }

    private checkDraw(board: BoardGrid): boolean {
        return board[0] !== undefined && board[0].every(cell => cell !== EMPTY);
    }
}

// Run Game
new ConnectFour();

