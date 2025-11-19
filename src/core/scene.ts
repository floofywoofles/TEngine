
import type { Resolution } from "../types/resolution";
import type { Entity } from "./entity/entity";
import type { Camera } from "./camera";

export class Scene {
    private height: number;
    private width: number;
    private name: string;
    private entities: Entity[] = [];
    private camera: Camera | undefined;

    constructor(height: number, width: number, name: string, camera?: Camera){
        this.height = height;
        this.width = width;
        this.name = name;
        this.camera = camera;
    }

    public getResolution(): Resolution {
        return {
            height: this.height,
            width: this.width,
        }
    }

    /**
     * Checks if a position is within the scene bounds
     * @param y - The y coordinate to check
     * @param x - The x coordinate to check
     * @returns True if the position is within bounds, false otherwise
     */
    public isInBounds(y: number, x: number): boolean {
        return y >= 0 && y < this.height && x >= 0 && x < this.width;
    }

    /**
     * Checks if a position is out of bounds
     * @param y - The y coordinate to check
     * @param x - The x coordinate to check
     * @returns True if the position is out of bounds, false otherwise
     */
    public isOutOfBounds(y: number, x: number): boolean {
        return !this.isInBounds(y, x);
    }

    public getName(): string {
        return this.name;
    }

    public addEntity(entity: Entity): boolean {
        if(this.entities.find((e: Entity)=> e.getId() === entity.getId())){
            return false;
        }

        this.entities.push(entity);

        return true;
    }

    public removeEntity(entity: Entity) {
        this.entities = this.entities.filter((e: Entity) => e.getId() !== entity.getId());
    }

    /**
     * Gets the first entity at a specific position
     * @param y - The y coordinate
     * @param x - The x coordinate
     * @returns The entity at that position, or undefined if none exists
     */
    public getEntityAtPosition(y: number, x: number): Entity|undefined {
        return this.entities.find((e)=>{
            return e.getPosition().y === y && e.getPosition().x === x;
        })
    }

    /**
     * Gets all entities at a specific position (supports multiple entities at same position)
     * @param y - The y coordinate
     * @param x - The x coordinate
     * @returns Array of entities at that position
     */
    public getEntitiesAtPosition(y: number, x: number): Entity[] {
        return this.entities.filter((e)=>{
            return e.getPosition().y === y && e.getPosition().x === x;
        })
    }

    /**
     * Gets all entities within a rectangular region
     * @param startY - The starting y coordinate
     * @param startX - The starting x coordinate
     * @param height - The height of the region
     * @param width - The width of the region
     * @returns Array of entities within the region
     */
    public getEntitiesInRegion(startY: number, startX: number, height: number, width: number): Entity[] {
        return this.entities.filter((e) => {
            const pos = e.getPosition();
            return pos.y >= startY && pos.y < startY + height &&
                   pos.x >= startX && pos.x < startX + width;
        });
    }

    /**
     * Gets all entities with a specific sprite
     * @param sprite - The sprite to search for
     * @returns Array of entities with that sprite
     */
    public getEntitiesBySprite(sprite: string): Entity[] {
        return this.entities.filter((e) => e.getSprite() === sprite);
    }

    /**
     * Gets all entities in the scene
     * @returns Array of all entities
     */
    public getAllEntities(): Entity[] {
        return [...this.entities];
    }

    /**
     * Gets the count of entities in the scene
     * @returns The number of entities
     */
    public getEntityCount(): number {
        return this.entities.length;
    }

    /**
     * Clears all entities from the scene
     */
    public clearAllEntities(): void {
        this.entities = [];
    }

    /**
     * Updates all entities in the scene
     */
    public update(): void {
        this.entities.map((e: Entity) => e.update());
    }

    /**
     * Renders the scene to the console
     * Supports layer-based rendering (higher layers render on top)
     */
    public draw() {
        console.clear();

        let out: string = "";

        if(this.camera){
            const { y: cameraY, x: cameraX } = this.camera.getPosition();
            const viewportHeight = this.camera.getViewportHeight();
            const viewportWidth = this.camera.getViewportWidth();
            const startY = cameraY - Math.floor(viewportHeight / 2);
            const startX = cameraX - Math.floor(viewportWidth / 2);

            for(let y = 0; y < viewportHeight; ++y){
                const worldY = startY + y;
                const rowInBounds = worldY >= 0 && worldY < this.height;

                for(let x = 0; x < viewportWidth; ++x){
                    const worldX = startX + x;

                    if(!rowInBounds || worldX < 0 || worldX >= this.width){
                        out += "-";
                        continue;
                    }

                    // Get all entities at this position and render the one with highest layer
                    const entitiesHere = this.getEntitiesAtPosition(worldY, worldX);
                    if(entitiesHere.length > 0){
                        // Sort by layer and get the topmost entity
                        const topEntity = entitiesHere.reduce((top, current) => 
                            current.getLayer() > top.getLayer() ? current : top
                        );
                        out += topEntity.getSprite();
                    } else {
                        out += "-";
                    }
                }

                out += "\n";
            }
            console.log(out);
            return;
        }

        for(let y = 0; y < this.height; ++y){
            for(let x = 0; x < this.width; ++x){
                // Get all entities at this position and render the one with highest layer
                const entitiesHere = this.getEntitiesAtPosition(y, x);
                if(entitiesHere.length > 0){
                    // Sort by layer and get the topmost entity
                    const topEntity = entitiesHere.reduce((top, current) => 
                        current.getLayer() > top.getLayer() ? current : top
                    );
                    out += topEntity.getSprite();
                } else {
                    out += "-";
                }
            }

            out += "\n";
        }

        console.log(out);
    }
}
