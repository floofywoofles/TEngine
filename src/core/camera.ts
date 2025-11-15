import type { Point } from "../types/point";

/**
 * Camera class for controlling the viewport in a scene
 * The camera determines what portion of the scene is visible
 */
export class Camera {
    private y: number;
    private x: number;
    private viewportY: number;
    private viewportX: number;

    /**
     * Creates a new Camera
     * @param y - The y coordinate of the camera center
     * @param viewportY - The height of the viewport
     * @param x - The x coordinate of the camera center
     * @param viewportX - The width of the viewport
     */
    constructor(y: number, viewportY: number, x: number, viewportX: number){
        this.y = y;
        this.x = x;
        this.viewportX = viewportX;
        this.viewportY = viewportY;
    }

    /**
     * Gets the current position of the camera
     * @returns Point object with y and x coordinates
     */
    public getPosition(): Point {
        return {
            y: this.y,
            x: this.x,
        }
    }

    /**
     * Sets the position of the camera
     * @param y - The new y coordinate
     * @param x - The new x coordinate
     */
    public setPosition(y: number, x: number): void {
        this.y = y;
        this.x = x;
    }

    /**
     * Moves the camera by a delta amount
     * @param deltaY - Amount to move in y direction
     * @param deltaX - Amount to move in x direction
     */
    public move(deltaY: number, deltaX: number): void {
        this.y += deltaY;
        this.x += deltaX;
    }

    /**
     * Gets the viewport height
     * @returns The height of the viewport
     */
    public getViewportHeight(): number {
        return this.viewportY;
    }

    /**
     * Gets the viewport width
     * @returns The width of the viewport
     */
    public getViewportWidth(): number {
        return this.viewportX;
    }

    /**
     * Sets the viewport size
     * @param height - The new viewport height
     * @param width - The new viewport width
     */
    public setViewportSize(height: number, width: number): void {
        this.viewportY = height;
        this.viewportX = width;
    }

    /**
     * Centers the camera on a specific position
     * @param y - The y coordinate to center on
     * @param x - The x coordinate to center on
     */
    public centerOn(y: number, x: number): void {
        this.y = y;
        this.x = x;
    }
}
