/**
 * Scene class - Represents a game scene/level containing entities
 * A scene is a container for entities and manages their rendering and updates
 */
import type { Entity } from "./entity";
import type { Point } from "./types/point";

/**
 * Scene class representing a game level or screen
 * Contains entities and handles their rendering through a camera viewport
 */
export class Scene {
    /** Array of all entities in this scene */
    private entities: Entity[] = [];
    /** Width of the scene in grid units */
    private width: number = 100;
    /** Height of the scene in grid units */
    private height: number = 100;
    /** Name identifier for this scene */
    private name: string;

    /**
     * Create a new scene
     * @param name - Name identifier for this scene
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * Get the name of this scene
     * @returns Scene name string
     */
    public get getName(): string {
        return this.name;
    }

    /**
     * Get all entities in this scene
     * @returns Array of entities
     */
    public get getEntities(): Entity[] {
        return this.entities;
    }

    /**
     * Get the width of this scene
     * @returns Scene width in grid units
     */
    public get getWidth(): number {
        return this.width;
    }

    /**
     * Get the height of this scene
     * @returns Scene height in grid units
     */
    public get getHeight(): number {
        return this.height;
    }

    /**
     * Add an entity to this scene
     * @param entity - Entity to add
     */
    public addEntity(entity: Entity) {
        this.entities.push(entity);
    }

    /**
     * Remove an entity from this scene
     * @param entity - Entity to remove
     */
    public removeEntity(entity: Entity) {
        this.entities = this.entities.filter(e => e.getId !== entity.getId);
    }

    /**
     * Render all entities in this scene
     * Calls the render method on each entity
     */
    public render() {
        this.entities.forEach(e => this.entities.push(e));
    }

    /**
     * Update all entities in this scene
     * Calls the update method on each entity with the delta time
     * @param deltaTime - Time elapsed since last update (in milliseconds)
     */
    public update(deltaTime: number) {
        this.entities.forEach(e => e.update(deltaTime));
    }

    /**
     * Draws the scene visible through the camera viewport
     * Renders only the portion of the scene visible through the camera
     * @param cameraPosition - The camera's position in the scene (y, x)
     * @param viewPortDimensions - The dimensions of the viewport (height, width)
     */
    public draw(cameraPosition: Point, viewPortDimensions: Point) {
        let out: string = "";
        // Only iterate through the visible viewport area
        const startY = cameraPosition.y;
        const endY = cameraPosition.y + viewPortDimensions.y;
        const startX = cameraPosition.x;
        const endX = cameraPosition.x + viewPortDimensions.x;
        const visibleEntities = new Map<string, Entity>();
        for (const entity of this.entities) {
            const { y, x } = entity.position;
            if (
                entity.getSprite.length === 0 ||
                y < startY ||
                y >= endY ||
                x < startX ||
                x >= endX
            ) {
                continue;
            }
            const key = `${y}:${x}`;
            if (!visibleEntities.has(key)) {
                visibleEntities.set(key, entity);
            }
        }

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                // Check if coordinates are within scene bounds
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    const entity = visibleEntities.get(`${y}:${x}`);
                    if (entity) {
                        out += entity.getSprite;
                    } else {
                        out += "-";
                    }
                } else {
                    // Render empty space for out-of-bounds areas
                    out += "-";
                }
            }
            // Only add newline between rows, not after the last row
            if (y < endY - 1) {
                out += "\n";
            }
        }
        console.log(out);
    }

    /**
     * Update a specific entity in this scene
     * @param entity - Entity to update
     * @param deltaTime - Time elapsed since last update (in milliseconds)
     */
    public updateEntity(entity: Entity, deltaTime: number) {
        entity.update(deltaTime);
    }

    public remove(entity: Entity){
        // Remove entity from the entities array based on its id
        this.entities = this.entities.filter(e => e.getId !== entity.getId);
    }
}
