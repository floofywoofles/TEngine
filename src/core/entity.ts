/**
 * Entity class - Base class for all game objects
 * Everything in the game is an entity that can be positioned, rendered, and updated
 */
import type { Point } from "./types/point";
import type { Flags } from "./types/flags";

/**
 * Base Entity class representing any object in the game world
 * Entities have a position, sprite, and can have flags for various properties
 */
export class Entity {
    /** Unique identifier for this entity */
    private id: string = Bun.randomUUIDv7();
    /** Visual representation character/sprite */
    private sprite: string;
    /** Y coordinate position */
    private y: number;
    /** X coordinate position */
    private x: number;
    /** Custom flags/properties for this entity */
    private flags: Flags = {}

    /**
     * Create a new entity
     * @param y - Y coordinate position
     * @param x - X coordinate position
     * @param sprite - Visual representation character (e.g., "O", "X", "-")
     */
    constructor(y: number, x: number, sprite: string) {
        this.y = y;
        this.x = x;
        this.sprite = sprite;
    }

    /**
     * Get the current position of this entity
     * @returns Point object with y and x coordinates
     */
    public get position(): Point {
        return {
            y: this.y,
            x: this.x
        }
    }

    /**
     * Get the unique identifier for this entity
     * @returns Unique ID string
     */
    public get getId(): string {
        return this.id;
    }

    /**
     * Get the sprite/visual representation of this entity
     * @returns Sprite string
     */
    public get getSprite(): string {
        return this.sprite;
    }

    /**
     * Set the position of this entity
     * @param newPos - New position with y and x coordinates
     */
    public set position(newPos: Point) {
        this.y = newPos.y;
        this.x = newPos.x;
    }

    /**
     * Add this entity to the current scene
     * This makes the entity visible and part of the game world
     */

    /**
     * Update this entity (called every frame)
     * Override this method in subclasses to add custom update logic
     * @param _deltaTime - Time elapsed since last update (in milliseconds)
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public update(_deltaTime?: number) {
        // Do nothing by default
    }

    /**
     * Draw this entity (called during rendering)
     * Override this method in subclasses to add custom drawing logic
     * @param _entity - Optional entity parameter (unused in base implementation)
     */
    public draw(_entity?: Entity) {
        // Do nothing by default
    }

    /**
     * Set a flag/property on this entity
     * Flags can be used to mark entities with special properties (e.g., "solid", "collectible")
     * @param name - Name of the flag
     * @param property - Value of the flag (boolean)
     */
    public setFlag(name: string, property: boolean) {
        this.flags[name] = property
    }

    /**
     * Get a flag/property value from this entity
     * @param name - Name of the flag to check
     * @returns True if the flag is set to true, false otherwise
     */
    public getFlag(name: string): boolean {
        return this.flags[name] === true;
    }

    public setSprite(sprite: string): void {
        this.sprite = sprite;
    }
}
