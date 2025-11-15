import { Entity } from "./entity/entity";

export class Camera extends Entity {
    private viewportY: number;
    private viewportX: number;

    constructor(y: number, viewportY: number, x: number, viewportX: number, sprite: string){
        super(y,x,sprite);
        this.viewportX = viewportX;
        this.viewportY = viewportY;
    }

    public getViewportHeight(): number {
        return this.viewportY;
    }

    public getViewportWidth(): number {
        return this.viewportX;
    }
}
