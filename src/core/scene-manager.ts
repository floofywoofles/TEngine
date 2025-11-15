/**
 * Scene Manager
 * Manages multiple scenes and transitions between them
 */

import type { Scene } from "./scene";

/**
 * SceneManager class for managing and transitioning between multiple scenes
 */
export class SceneManager {
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;
  private currentSceneName: string | null = null;

  /**
   * Adds a scene to the manager
   * @param name - The unique name for this scene
   * @param scene - The scene object
   * @returns True if added successfully, false if name already exists
   */
  public addScene(name: string, scene: Scene): boolean {
    if (this.scenes.has(name)) {
      return false;
    }

    this.scenes.set(name, scene);
    return true;
  }

  /**
   * Removes a scene from the manager
   * @param name - The name of the scene to remove
   * @returns True if removed successfully, false if scene doesn't exist
   */
  public removeScene(name: string): boolean {
    if (!this.scenes.has(name)) {
      return false;
    }

    // If removing the current scene, clear it
    if (this.currentSceneName === name) {
      this.currentScene = null;
      this.currentSceneName = null;
    }

    this.scenes.delete(name);
    return true;
  }

  /**
   * Switches to a different scene
   * @param name - The name of the scene to switch to
   * @returns True if switched successfully, false if scene doesn't exist
   */
  public switchTo(name: string): boolean {
    const scene = this.scenes.get(name);
    if (!scene) {
      return false;
    }

    this.currentScene = scene;
    this.currentSceneName = name;
    return true;
  }

  /**
   * Gets the currently active scene
   * @returns The current scene, or null if none is active
   */
  public getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  /**
   * Gets the name of the currently active scene
   * @returns The current scene name, or null if none is active
   */
  public getCurrentSceneName(): string | null {
    return this.currentSceneName;
  }

  /**
   * Gets a scene by name
   * @param name - The name of the scene to get
   * @returns The scene, or undefined if not found
   */
  public getScene(name: string): Scene | undefined {
    return this.scenes.get(name);
  }

  /**
   * Checks if a scene exists
   * @param name - The name of the scene to check
   * @returns True if the scene exists, false otherwise
   */
  public hasScene(name: string): boolean {
    return this.scenes.has(name);
  }

  /**
   * Gets all scene names
   * @returns Array of all scene names
   */
  public getSceneNames(): string[] {
    return Array.from(this.scenes.keys());
  }

  /**
   * Gets the count of scenes
   * @returns The number of scenes in the manager
   */
  public getSceneCount(): number {
    return this.scenes.size;
  }

  /**
   * Clears all scenes from the manager
   */
  public clearAllScenes(): void {
    this.scenes.clear();
    this.currentScene = null;
    this.currentSceneName = null;
  }

  /**
   * Updates the current scene
   */
  public update(): void {
    if (this.currentScene) {
      this.currentScene.update();
    }
  }

  /**
   * Draws the current scene
   */
  public draw(): void {
    if (this.currentScene) {
      this.currentScene.draw();
    }
  }
}

