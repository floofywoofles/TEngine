/**
 * Camera class - Represents the viewport into the game world
 * The camera determines what portion of the scene is visible
 */
import { Entity } from "./entity";
import type { Point } from "./types/point";
import { Global } from "./global";

/**
 * Camera class extending Entity
 * Manages the viewport and renders the visible portion of the scene
 */
export class Camera extends Entity {
    /** Height of the viewport in grid units */
    private viewPortY: number;
    /** Width of the viewport in grid units */
    private viewPortX: number;

    /**
     * Create a new camera
     * @param y - Y coordinate position of the camera
     * @param x - X coordinate position of the camera
     * @param viewPortY - Height of the viewport
     * @param viewPortX - Width of the viewport
     */
    constructor(y: number, x: number, viewPortY: number, viewPortX: number) {
        super(y, x, ""); // Doesn't have a sprite
        this.viewPortY = viewPortY;
        this.viewPortX = viewPortX;
    }

    /**
     * Get the viewport dimensions
     * @returns Point object with viewport height (y) and width (x)
     */
    public get viewPort(): Point {
        return {
            y: this.viewPortY,
            x: this.viewPortX
        }
    }

    /**
     * Set the viewport dimensions
     * @param newViewPort - New viewport dimensions with height (y) and width (x)
     */
    public set viewPort(newViewPort: Point) {
        this.viewPortY = newViewPort.y;
        this.viewPortX = newViewPort.x;
    }

    /**
     * Draw the scene through this camera's viewport
     * Renders the visible portion of the current scene
     */
    public override draw() {
        const currentScene = Global.getScenes.getCurrentScene;
        // Pass camera position and viewport dimensions separately
        currentScene.draw(this.position, this.viewPort);
    }

}
