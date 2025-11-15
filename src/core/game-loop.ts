/**
 * Game Loop System
 * Provides a standard game loop with delta time for smooth animations and updates
 */

/**
 * GameLoop class manages the main game update/render cycle
 */
export class GameLoop {
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private fps: number = 60;
  private frameTime: number = 1000 / this.fps;
  private updateCallback: (deltaTime: number) => void;
  private renderCallback: () => void;
  private timeoutId: Timer | null = null;

  /**
   * Creates a new GameLoop
   * @param updateCallback - Function called each frame with delta time
   * @param renderCallback - Function called each frame to render
   * @param fps - Target frames per second (default: 60)
   */
  constructor(
    updateCallback: (deltaTime: number) => void,
    renderCallback: () => void,
    fps: number = 60
  ) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
    this.fps = fps;
    this.frameTime = 1000 / fps;
  }

  /**
   * Starts the game loop
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastTime = Date.now();
    this.loop();
  }

  /**
   * Stops the game loop
   */
  public stop(): void {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Main loop function
   */
  private loop(): void {
    if (!this.isRunning) {
      return;
    }

    // Calculate delta time in seconds
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Call update and render callbacks
    this.updateCallback(deltaTime);
    this.renderCallback();

    // Schedule next frame
    this.timeoutId = setTimeout(() => this.loop(), this.frameTime);
  }

  /**
   * Sets the target FPS
   * @param fps - The new target FPS
   */
  public setFPS(fps: number): void {
    this.fps = fps;
    this.frameTime = 1000 / fps;
  }

  /**
   * Gets the target FPS
   * @returns The current target FPS
   */
  public getFPS(): number {
    return this.fps;
  }

  /**
   * Checks if the loop is currently running
   * @returns True if running, false otherwise
   */
  public isActive(): boolean {
    return this.isRunning;
  }
}

