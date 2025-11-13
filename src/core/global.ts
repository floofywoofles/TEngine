/**
 * Global singleton - Provides global access to game systems
 * Singleton pattern for accessing scenes and other global game state
 */
import { Scenes } from "./scenes";

/**
 * Internal Global class implementing singleton pattern
 * Provides access to global game systems like scenes
 */
class _Global {
    /** Scenes manager instance */
    private scenes: Scenes;

    /**
     * Create a new Global instance
     * Initializes the scenes manager
     */
    constructor() {
        this.scenes = new Scenes();
    }

    /**
     * Get the scenes manager
     * @returns Scenes manager instance
     */
    public get getScenes(): Scenes {
        return this.scenes;
    }

    /**
     * Set the scenes manager
     * @param scenes - Scenes manager instance to use
     */
    public set setScenes(scenes: Scenes) {
        this.scenes = scenes;
    }
}

/**
 * Global singleton instance
 * Use this to access global game systems throughout the application
 */
export const Global = new _Global();
