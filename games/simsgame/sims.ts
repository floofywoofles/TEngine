import {
    Scene,
    Entity,
    Camera,
    Input,
    GameLoop
} from "../../src/core/index";

// Create player entity (y, x, sprite)
const player = new Entity(0, 0, "@");

// Create camera (y, viewportHeight, x, viewportWidth)
const { y, x } = player.getPosition();
const camera = new Camera(y, 2, x, 2);

// Create scene (height, width, name, camera)
const scene = new Scene(10, 10, "My Game", camera);

// Add player to scene
scene.addEntity(player);

// Setup input
Input.start();

Input.onKey("ArrowUp", ({ isDown }) => {
    if (isDown) {
        if(player.getPosition().y - 1 < 0 === false){
            player.move(-1, 0);
        }
    }
});

Input.onKey("ArrowDown", ({ isDown }) => {
    if(isDown){ 
        if((player.getPosition().y + 1) < (scene.getResolution().height)){
            player.move(1, 0);
        }
    }
});

Input.onKey("ArrowLeft", ({ isDown }) => {
    if (isDown) {
        if(player.getPosition().x - 1 < 0 === false){
            player.move(0, -1);
        }
    }
});

Input.onKey("ArrowRight", ({ isDown }) => {
    if (isDown) {
        if(player.getPosition().x + 1 < scene.getResolution().width){
            player.move(0, 1);
        }
    }
});

Input.onKey("q", ({ isDown }) => {
    if (isDown) {
        Input.stop();
        process.exit(0);
    }
});

// Create game loop
const gameLoop = new GameLoop(
    () => {
        // Update game state
        scene.update();
        camera.centerOn(player.getPosition().y, player.getPosition().x);
    },
    () => {
        // Render
        scene.draw();
    },
    60 // 60 FPS
);

// Start the game
gameLoop.start();