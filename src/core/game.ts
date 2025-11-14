import { Global } from './global';
import { Camera } from './camera';

export class Game {
    private mainCamera: Camera;
    private intervalId?: Timer;
    private lastTime: number = 0;

    constructor(viewPortY: number, viewPortX: number) {
        this.mainCamera = new Camera(0, 0, viewPortY, viewPortX);
    }

    public start(): void {
        this.lastTime = Date.now();
        this.intervalId = setInterval(() => {
            const currentTime = Date.now();
            const deltaTime = currentTime - this.lastTime;

            this.update(deltaTime);
            this.draw();

            this.lastTime = currentTime;
        }, 100); // Or your desired frame rate
    }

    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    private update(deltaTime: number): void {
        const currentScene = Global.getScenes.getCurrentScene;
        currentScene.update(deltaTime);
    }

    private draw(): void {
        this.mainCamera.draw();
    }
}