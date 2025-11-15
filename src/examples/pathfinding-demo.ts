/**
 * A* Pathfinding Demo
 * Demonstrates the PathfindingHelper with interactive visualization
 * 
 * Controls:
 * - Click/Arrow keys: Move player
 * - W: Add wall at cursor
 * - E: Remove wall at cursor
 * - Space: Find path to cursor
 * - C: Clear path
 * - R: Reset walls
 * - Q: Quit
 */

import { Scene } from "../core/scene";
import { Entity } from "../core/entity/entity";
import { Camera } from "../core/camera";
import { Input } from "../core/input";
import { GameLoop } from "../core/game-loop";
import { TextEntity } from "../core/helpers/text-entity";
import { Color, ColorHelper } from "../core/helpers/color";
import { PathfindingHelper, Heuristic } from "../core/helpers/pathfinding";
import type { Point } from "../types/point";

// Game constants
const GRID_WIDTH = 30;
const GRID_HEIGHT = 20;
const PLAYER_SPRITE = "@";
const CURSOR_SPRITE = "▼";
const WALL_SPRITE = "█";
const PATH_SPRITE = "·";
const GOAL_SPRITE = "X";

/**
 * Pathfinding Demo Game
 */
class PathfindingDemo {
  private scene: Scene;
  private camera: Camera;
  private player: Entity;
  private cursor: Entity;
  private walls: Set<string> = new Set();
  private currentPath: Point[] = [];
  private pathEntities: Entity[] = [];
  private cursorPos: Point = { y: 10, x: 15 };
  private titleText: TextEntity;
  private statusText: TextEntity;
  private controlsText: TextEntity;
  private gameLoop: GameLoop;
  private heuristicIndex: number = 0;
  private heuristics = [
    Heuristic.Manhattan,
    Heuristic.Euclidean,
    Heuristic.Chebyshev,
    Heuristic.Octile,
  ];
  private allowDiagonal: boolean = false;

  constructor() {
    // Create scene
    const sceneWidth = GRID_WIDTH + 2;
    const sceneHeight = GRID_HEIGHT + 6;

    this.camera = new Camera(
      Math.floor(sceneHeight / 2),
      sceneHeight,
      Math.floor(sceneWidth / 2),
      sceneWidth
    );

    this.scene = new Scene(sceneHeight, sceneWidth, "Pathfinding Demo", this.camera);

    // Create player
    const playerSprite = ColorHelper.colorize(PLAYER_SPRITE, Color.Green);
    this.player = new Entity(5, 5, playerSprite);
    this.player.setLayer(3);
    this.scene.addEntity(this.player);

    // Create cursor
    const cursorSprite = ColorHelper.colorize(CURSOR_SPRITE, Color.Yellow);
    this.cursor = new Entity(this.cursorPos.y, this.cursorPos.x, cursorSprite);
    this.cursor.setLayer(4);
    this.scene.addEntity(this.cursor);

    // Create UI text
    this.titleText = new TextEntity(0, 5, "A* PATHFINDING DEMO", 5);
    this.statusText = new TextEntity(GRID_HEIGHT + 2, 0, "", 5);
    this.controlsText = new TextEntity(
      GRID_HEIGHT + 4,
      0,
      "←→↑↓:Move W:Wall E:Erase Space:Path C:Clear D:Diagonal H:Heuristic Q:Quit",
      5
    );

    this.titleText.addToScene(this.scene);
    this.controlsText.addToScene(this.scene);

    // Create some initial walls
    this.createInitialWalls();

    // Setup input
    this.setupInput();

    // Create game loop
    this.gameLoop = new GameLoop(
      () => this.update(),
      () => this.render(),
      30
    );

    // Initial render
    this.updateStatus();
    this.renderWalls();
    this.scene.draw();

    // Start game loop
    this.gameLoop.start();
  }

  /**
   * Creates initial wall pattern
   */
  private createInitialWalls(): void {
    // Create a maze-like pattern
    for (let y = 5; y < 15; y++) {
      this.addWall(y, 10);
    }
    for (let x = 10; x < 20; x++) {
      this.addWall(10, x);
    }
    for (let y = 10; y < 15; y++) {
      this.addWall(y, 20);
    }
  }

  /**
   * Sets up input handlers
   */
  private setupInput(): void {
    // Arrow keys - move cursor
    Input.onKey("ArrowUp", ({ isDown }) => {
      if (isDown && this.cursorPos.y > 0) {
        this.cursorPos.y--;
        this.cursor.setPosition(this.cursorPos.y, this.cursorPos.x);
      }
    });

    Input.onKey("ArrowDown", ({ isDown }) => {
      if (isDown && this.cursorPos.y < GRID_HEIGHT - 1) {
        this.cursorPos.y++;
        this.cursor.setPosition(this.cursorPos.y, this.cursorPos.x);
      }
    });

    Input.onKey("ArrowLeft", ({ isDown }) => {
      if (isDown && this.cursorPos.x > 0) {
        this.cursorPos.x--;
        this.cursor.setPosition(this.cursorPos.y, this.cursorPos.x);
      }
    });

    Input.onKey("ArrowRight", ({ isDown }) => {
      if (isDown && this.cursorPos.x < GRID_WIDTH - 1) {
        this.cursorPos.x++;
        this.cursor.setPosition(this.cursorPos.y, this.cursorPos.x);
      }
    });

    // W - add wall
    Input.onKey("w", ({ isDown }) => {
      if (isDown) {
        this.addWall(this.cursorPos.y, this.cursorPos.x);
        this.renderWalls();
      }
    });

    // E - remove wall
    Input.onKey("e", ({ isDown }) => {
      if (isDown) {
        this.removeWall(this.cursorPos.y, this.cursorPos.x);
        this.renderWalls();
      }
    });

    // Space - find path
    Input.onKey(" ", ({ isDown }) => {
      if (isDown) {
        this.findPath();
      }
    });

    // C - clear path
    Input.onKey("c", ({ isDown }) => {
      if (isDown) {
        this.clearPath();
      }
    });

    // R - reset walls
    Input.onKey("r", ({ isDown }) => {
      if (isDown) {
        this.walls.clear();
        this.createInitialWalls();
        this.renderWalls();
        this.clearPath();
      }
    });

    // D - toggle diagonal movement
    Input.onKey("d", ({ isDown }) => {
      if (isDown) {
        this.allowDiagonal = !this.allowDiagonal;
        this.updateStatus();
        if (this.currentPath.length > 0) {
          this.findPath(); // Recalculate with new setting
        }
      }
    });

    // H - cycle heuristic
    Input.onKey("h", ({ isDown }) => {
      if (isDown) {
        this.heuristicIndex = (this.heuristicIndex + 1) % this.heuristics.length;
        this.updateStatus();
        if (this.currentPath.length > 0) {
          this.findPath(); // Recalculate with new heuristic
        }
      }
    });

    // Q - quit
    Input.onKey("q", ({ isDown }) => {
      if (isDown) {
        this.quit();
      }
    });

    // Start input
    Input.start();
  }

  /**
   * Adds a wall at position
   */
  private addWall(y: number, x: number): void {
    const playerPos = this.player.getPosition();
    if (y === playerPos.y && x === playerPos.x) {
      return; // Can't place wall on player
    }
    if (y === this.cursorPos.y && x === this.cursorPos.x) {
      return; // Can't place wall on cursor
    }
    this.walls.add(`${y},${x}`);
  }

  /**
   * Removes a wall at position
   */
  private removeWall(y: number, x: number): void {
    this.walls.delete(`${y},${x}`);
  }

  /**
   * Checks if position is walkable
   */
  private isWalkable(y: number, x: number): boolean {
    return !this.walls.has(`${y},${x}`);
  }

  /**
   * Finds path from player to cursor
   */
  private findPath(): void {
    const start = this.player.getPosition();
    const goal = this.cursorPos;

    const path = PathfindingHelper.findPath(start, goal, GRID_WIDTH, GRID_HEIGHT, {
      allowDiagonal: this.allowDiagonal,
      heuristic: this.heuristics[this.heuristicIndex],
      isWalkable: (y, x) => this.isWalkable(y, x),
    });

    if (path) {
      this.currentPath = path;
      this.renderPath();
      this.updateStatus();
    } else {
      this.currentPath = [];
      this.clearPath();
      this.updateStatus();
    }
  }

  /**
   * Clears the current path
   */
  private clearPath(): void {
    for (const entity of this.pathEntities) {
      this.scene.removeEntity(entity);
    }
    this.pathEntities = [];
    this.currentPath = [];
    this.updateStatus();
  }

  /**
   * Renders the path
   */
  private renderPath(): void {
    // Clear old path
    for (const entity of this.pathEntities) {
      this.scene.removeEntity(entity);
    }
    this.pathEntities = [];

    // Render new path
    for (let i = 1; i < this.currentPath.length - 1; i++) {
      const point = this.currentPath[i]!;
      const pathSprite = ColorHelper.colorize(PATH_SPRITE, Color.Cyan);
      const entity = new Entity(point.y, point.x, pathSprite);
      entity.setLayer(1);
      this.scene.addEntity(entity);
      this.pathEntities.push(entity);
    }

    // Render goal marker
    if (this.currentPath.length > 1) {
      const goal = this.currentPath[this.currentPath.length - 1]!;
      const goalSprite = ColorHelper.colorize(GOAL_SPRITE, Color.Red);
      const entity = new Entity(goal.y, goal.x, goalSprite);
      entity.setLayer(2);
      this.scene.addEntity(entity);
      this.pathEntities.push(entity);
    }
  }

  /**
   * Renders all walls
   */
  private renderWalls(): void {
    // Remove old wall entities
    const wallEntities = this.scene.getEntitiesBySprite(
      ColorHelper.colorize(WALL_SPRITE, Color.BrightBlack)
    );
    for (const entity of wallEntities) {
      this.scene.removeEntity(entity);
    }

    // Add new wall entities
    for (const wallKey of this.walls) {
      const [y, x] = wallKey.split(",").map(Number);
      const wallSprite = ColorHelper.colorize(WALL_SPRITE, Color.BrightBlack);
      const entity = new Entity(y!, x!, wallSprite);
      entity.setLayer(1);
      this.scene.addEntity(entity);
    }
  }

  /**
   * Updates status text
   */
  private updateStatus(): void {
    const heuristicName = this.heuristics[this.heuristicIndex];
    const diagonalText = this.allowDiagonal ? "ON" : "OFF";
    const pathLength = this.currentPath.length;
    const pathStatus =
      pathLength > 0 ? `Path: ${pathLength} steps` : "No path (press Space)";

    const status = `${pathStatus} | Heuristic: ${heuristicName} | Diagonal: ${diagonalText}`;
    this.statusText.setText(status);
    this.statusText.setPosition(GRID_HEIGHT + 2, 1);
  }

  /**
   * Update game state
   */
  private update(): void {
    // Could add automatic path following here
  }

  /**
   * Render the game
   */
  private render(): void {
    this.statusText.removeFromScene(this.scene);
    this.statusText.addToScene(this.scene);
    this.scene.draw();
  }

  /**
   * Quit the game
   */
  private quit(): void {
    this.gameLoop.stop();
    Input.stop();
    console.clear();
    console.log("\nThanks for trying the Pathfinding Demo!");
    console.log("Goodbye!\n");
    process.exit(0);
  }
}

// Start the demo
new PathfindingDemo();

