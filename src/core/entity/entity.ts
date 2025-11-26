import type { Point } from "../../types/point";

/**
 * Base Entity class representing any object in the game world
 * Entities have a position, sprite, and optional layer for rendering order
 */
export class Entity {
    private id: string = Bun.randomUUIDv7();
    private sprite: string;
    private y: number;
    private x: number;
    private layer: number = 0;

    constructor(y: number, x: number, sprite: string) {
        this.y = y;
        this.x = x;
        this.sprite = sprite;
    }

    /**
     * Gets the current position of the entity
     * @returns Point object with y and x coordinates
     */
    public getPosition(): Point {
        return {
            y: this.y,
            x: this.x,
        }
    }

    /**
     * Sets the position of the entity
     * @param y - The new y coordinate
     * @param x - The new x coordinate
     */
    public setPosition(y: number, x: number): void {
        this.y = y;
        this.x = x;
    }

    /**
     * Moves the entity by a delta amount
     * @param deltaY - Amount to move in y direction
     * @param deltaX - Amount to move in x direction
     */
    public move(deltaY: number, deltaX: number): void {
        this.y += deltaY;
        this.x += deltaX;
    }

    /**
     * Gets the current sprite character
     * @returns The sprite string
     */
    public getSprite(): string {
        return this.sprite || "";
    }

    /**
     * Sets the sprite character
     * @param sprite - The new sprite string
     */
    public setSprite(sprite: string): void {
        this.sprite = sprite;
    }

    /**
     * Gets the unique identifier for this entity
     * @returns The entity ID
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Gets the rendering layer (z-index) of this entity
     * Higher layers render on top of lower layers
     * @returns The layer number
     */
    public getLayer(): number {
        return this.layer;
    }

    /**
     * Sets the rendering layer (z-index) of this entity
     * @param layer - The new layer number
     */
    public setLayer(layer: number): void {
        this.layer = layer;
    }

    /**
     * Update method called each frame
     * Override in subclasses to add custom behavior
     */
    public update(): void {
        // Do nothing by default
    }

    /**
     * Draw method called each frame
     * Override in subclasses to add custom rendering
     */
    public draw(): void {
        // Do nothing by default
    }
}