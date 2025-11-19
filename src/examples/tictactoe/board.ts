import { Camera, Scene } from "../../core";

export class Board extends Scene {
    constructor() {
        // Center the camera on the 3x3 scene
        // Camera position: (y=1, x=1) which is the center of a 3x3 grid
        // Viewport: 3x3 to show the entire scene
        super(3, 3, "board", new Camera(1, 3, 1, 3));
    }
}