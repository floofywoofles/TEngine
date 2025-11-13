/**
 * Scenes manager - Manages multiple scenes and the current active scene
 * Handles scene switching and scene collection management
 */
import { Scene } from "./scene";

/**
 * Scenes class managing multiple game scenes
 * Maintains a collection of scenes and tracks the currently active scene
 */
export class Scenes {
    /** Array of all available scenes */
    private scenes: Scene[] = [];
    /** Currently active scene being rendered */
    private currentScene: Scene;

    /**
     * Create a new scenes manager
     * Initializes with a default scene
     */
    constructor() {
        this.scenes = [];
        this.currentScene = new Scene("default");
    }

    /**
     * Get all scenes in the collection
     * @returns Array of all scenes
     */
    public get getScenes(): Scene[] {
        return this.scenes;
    }

    /**
     * Get the currently active scene
     * @returns Current scene being rendered
     */
    public get getCurrentScene(): Scene {
        return this.currentScene;
    }

    /**
     * Set the currently active scene
     * @param scene - Scene to make active
     */
    public setCurrentScene(scene: Scene) {
        this.currentScene = scene;
    }

    /**
     * Add a scene to the collection
     * @param scene - Scene to add
     */
    public addScene(scene: Scene) {
        this.scenes.push(scene);
    }

    /**
     * Remove a scene from the collection
     * @param scene - Scene to remove
     */
    public removeScene(scene: Scene) {
        this.scenes = this.scenes.filter(s => s.getName !== scene.getName);
    }
}
