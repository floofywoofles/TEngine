import {
    Input,
    GameLoop,
    type Point,
    Entity
} from "../../core";

import { Board } from "./board";
import { Player } from "./player";

const board: Board = new Board();
const playerOne: Player = new Player(0, 0, "X");
const playerTwo: Player = new Player(0, 0, "O");
let currentEntity: Player = playerOne;

// Initialize player turn to 0 (Player One)
let playerTurn: number = 0; // 0 is playerOne, 1 is playerTwo

board.addEntity(currentEntity);

Input.onKey("w", ({ isDown }) => {
    const playerPosition: Point = currentEntity.getPosition();
    if (isDown && board.isInBounds(playerPosition.y - 1, playerPosition.x)) {
        currentEntity.move(-1, 0)
    }
})

Input.onKey("a", ({ isDown }) => {
    const playerPosition: Point = currentEntity.getPosition();
    if (isDown && board.isInBounds(playerPosition.y, playerPosition.x - 1)) {
        currentEntity.move(0, -1)
    }
})

Input.onKey("s", ({ isDown }) => {
    const playerPosition: Point = currentEntity.getPosition();
    if (isDown && board.isInBounds(playerPosition.y + 1, playerPosition.x)) {
        currentEntity.move(1, 0)
    }
})

Input.onKey("d", ({ isDown }) => {
    const playerPosition: Point = currentEntity.getPosition();
    if (isDown && board.isInBounds(playerPosition.y, playerPosition.x + 1)) {
        currentEntity.move(0, 1)
    }
})

Input.onKey("q", ({ isDown }) => {
    if (isDown) {
        process.exit(0);
    }
})

Input.onKey(" ", ({ isDown }) => {
    if (isDown) {
        const playerPiece: Entity = new Entity(currentEntity.getPosition().y, currentEntity.getPosition().x, currentEntity.getSprite());
        board.removeEntity(currentEntity);
        board.addEntity(playerPiece);

        playerTurn = playerTurn === 0 ? 1 : 0;
        currentEntity = playerTurn === 0 ? playerOne : playerTwo;
        board.addEntity(currentEntity);
    }
})

Input.start();

// Create game loop
const gameLoop = new GameLoop(
    () => {
        // Update game state
        board.update();
    },
    () => {
        // RenderHfBs31D9
        board.draw();
    },
    60 // 30 FPS
);

// Start the game
gameLoop.start();