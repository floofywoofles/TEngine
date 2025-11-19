import { Entity } from "../../core";

export class Player extends Entity {
    constructor(y: number, x: number, sprite: string = "X") {
        super(y, x, sprite);
    }
}