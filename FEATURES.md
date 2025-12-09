# TEngine Features Guide

## Overview

TEngine is a terminal-based game engine built with TypeScript and Bun. This guide covers all the features and improvements that make game development easier and more powerful.

## Core Components

### Entity System

**Basic Entity Operations:**
```typescript
import { Entity } from "./src/core/entity/entity";

// Create an entity
const player = new Entity(5, 5, "@");

// Get position
const pos = player.getPosition(); // { y: 5, x: 5 }

// Update position
player.setPosition(10, 10);
player.move(2, 3); // Move by delta

// Update sprite
player.setSprite("P");

// Layer management (for rendering order)
player.setLayer(1); // Higher layers render on top
const layer = player.getLayer();
```

### Scene Management

**Scene Operations:**
```typescript
import { Scene } from "./src/core/scene";

const scene = new Scene(100, 100, "My Scene");

// Entity management
scene.addEntity(entity);
scene.removeEntity(entity);
scene.clearAllEntities();

// Query methods
const entity = scene.getEntityAtPosition(5, 5);
const entities = scene.getEntitiesAtPosition(5, 5); // All entities at position
const nearby = scene.getEntitiesInRegion(0, 0, 10, 10);
const sprites = scene.getEntitiesBySprite("@");
const all = scene.getAllEntities();
const count = scene.getEntityCount();

// Update and render
scene.update();
scene.draw();
```

### Camera System

```typescript
import { Camera } from "./src/core/camera";

// Create a camera (y, viewportHeight, x, viewportWidth)
const camera = new Camera(50, 20, 50, 40);

// Move the camera
camera.setPosition(60, 60);
camera.move(5, 5); // Move by delta

// Change viewport size
camera.setViewportSize(30, 50);

// Center camera on a position
camera.centerOn(player.getPosition().y, player.getPosition().x);

// Use with scene
const scene = new Scene(100, 100, "Game", camera);
```

### Input System

**Keyboard Input:**
```typescript
import { Input } from "./src/core/input";

// Start listening
Input.start();

// Register key listeners
Input.onKey("w", ({ key, isDown, originalEvent }) => {
  if (isDown) {
    console.log("W pressed!");
  }
});

// Query input state
if (Input.isKeyDown("space")) {
  // Space is pressed
}

const keysDown = Input.getKeysDown(); // ["w", "space"]
const hasKeys = Input.hasAnyKeyDown();
const count = Input.getPressedKeyCount();

// Stop listening
Input.stop();
```

## Helper Systems

### TextEntity

Simplifies text rendering by managing character entities:

```typescript
import { TextEntity } from "./src/core/helpers/text-entity";

// Create text
const title = new TextEntity(2, 5, "GAME TITLE", 1);

// Add to scene
title.addToScene(scene);

// Update text
title.setText("NEW TITLE", scene);

// Move text
title.setPosition(5, 10);

// Change layer
title.setLayer(2);

// Remove from scene
title.removeFromScene(scene);
```

### Color System

ANSI color support for terminal rendering:

```typescript
import { Color, ColorHelper } from "./src/core/helpers/color";

// Colorize text
const red = ColorHelper.colorize("Error!", Color.Red);
const green = ColorHelper.colorize("Success!", Color.Green);

// Multiple styles
const styled = ColorHelper.style("Important", Color.Bold, Color.Yellow);

// Foreground and background
const highlighted = ColorHelper.colorizeWithBg("Text", Color.White, Color.Blue);

// Utility functions
const length = ColorHelper.getVisibleLength(red); // Excludes color codes
const plain = ColorHelper.stripColors(red);

// Available colors
Color.Red, Color.Green, Color.Blue, Color.Yellow, Color.Cyan, Color.Magenta
Color.BrightRed, Color.BrightGreen, etc.
Color.BgRed, Color.BgGreen, etc.
Color.Bold, Color.Italic, Color.Underline
```

### CollisionHelper

Collision detection utilities:

```typescript
import { CollisionHelper } from "./src/core/helpers/collision";

// Check collision between entities
if (CollisionHelper.checkCollision(player, enemy)) {
  // Entities at same position
}

// Get entities at position
const entities = CollisionHelper.getEntitiesAt(scene, 5, 5);

// Distance calculations
const distance = CollisionHelper.getDistance(entity1, entity2);
const manhattan = CollisionHelper.getManhattanDistance(entity1, entity2);

// Check if within distance
if (CollisionHelper.isWithinDistance(player, enemy, 5)) {
  // Enemy is within 5 units
}

// Get all entities within distance
const nearby = CollisionHelper.getEntitiesWithinDistance(scene, 10, 10, 5);

// Check bounds
if (CollisionHelper.isEntityInBounds(player, 0, 0, 100, 100)) {
  // Player is within bounds
}

// Check future collision
if (CollisionHelper.wouldCollideAt(scene, player, newY, newX)) {
  // Would collide if moved to new position
}

// Get direction to target
const dir = CollisionHelper.getDirectionTo(player, enemy);
player.move(dir.dy, dir.dx); // Move toward enemy
```

### PathfindingHelper

A* pathfinding algorithm for intelligent movement:

```typescript
import { PathfindingHelper, Heuristic } from "./src/core/helpers/pathfinding";

// Find a path from start to goal
const path = PathfindingHelper.findPath(
  { y: 0, x: 0 },    // start
  { y: 10, x: 10 },  // goal
  20,                 // width
  20,                 // height
  {
    allowDiagonal: true,
    heuristic: Heuristic.Euclidean,
    isWalkable: (y, x) => !walls.has(`${y},${x}`)
  }
);

if (path) {
  console.log(`Found path with ${path.length} steps`);
}

// Find path in scene (avoiding entities)
const scenePath = PathfindingHelper.findPathInScene(
  start,
  goal,
  scene,
  { allowDiagonal: true }
);

// Find path avoiding specific entities
const avoidPath = PathfindingHelper.findPathAvoidingEntities(
  start,
  goal,
  scene,
  [enemy1, enemy2],
  { allowDiagonal: true }
);

// Smooth a path (remove unnecessary waypoints)
const smoothPath = PathfindingHelper.smoothPath(path, (y, x) => {
  return !walls.has(`${y},${x}`);
});

// Get next step in path
const nextStep = PathfindingHelper.getNextStep(path, currentPosition);
if (nextStep) {
  entity.setPosition(nextStep.y, nextStep.x);
}

// Available heuristics
Heuristic.Manhattan   // Best for 4-directional movement
Heuristic.Euclidean   // Best for smooth movement
Heuristic.Chebyshev   // Best for 8-directional movement
Heuristic.Octile      // Optimized for diagonal movement
```

### StateMachine

State machine system for managing game states, entity states, and AI behavior:

```typescript
import { StateMachine } from "./src/core/helpers/state-machine";

// Create state machine
const stateMachine = new StateMachine("idle");

// Add states with callbacks
stateMachine.addState("idle", {
  onEnter: (fromState) => console.log("Entered idle"),
  onUpdate: (deltaTime) => {
    // Update logic
  },
  onExit: (toState) => console.log("Exited idle")
});

stateMachine.addState("walking", {
  onEnter: () => this.setSprite(">"),
  onUpdate: (deltaTime) => {
    this.move(0, 1 * deltaTime);
  }
});

// Define transitions
stateMachine.addTransition("idle", "walking");
stateMachine.addTransition("walking", "idle");

// Transition between states
stateMachine.transitionTo("walking");

// Check state
if (stateMachine.isInState("walking")) {
  // Do something
}

// Update in game loop
stateMachine.update(deltaTime);

// Global transition callback
stateMachine.onTransition((fromState, toState) => {
  console.log(`${fromState} -> ${toState}`);
});

// Bidirectional transitions
stateMachine.addBidirectionalTransition("idle", "walking");

// Force transition (bypass checks)
stateMachine.forceTransitionTo("walking");

// State data
stateMachine.setStateData("walking", { speed: 5 });
const data = stateMachine.getStateData("walking");

// Query states
const current = stateMachine.getCurrentState();
const previous = stateMachine.getPreviousState();
const transitions = stateMachine.getTransitionsFrom("idle");
const allStates = stateMachine.getStateNames();

// Reset to initial state
stateMachine.reset();
```

## Advanced Systems

### GameLoop

Standard game loop with delta time:

```typescript
import { GameLoop } from "./src/core/game-loop";

// Create game loop
const gameLoop = new GameLoop(
  (deltaTime) => {
    // Update game state
    player.move(speed * deltaTime, 0);
    scene.update();
  },
  () => {
    // Render
    scene.draw();
  },
  60 // Target FPS
);

// Control loop
gameLoop.start();
gameLoop.stop();

// Configuration
gameLoop.setFPS(30);
const fps = gameLoop.getFPS();
const active = gameLoop.isActive();
```

### SceneManager

Manage multiple scenes and transitions:

```typescript
import { SceneManager } from "./src/core/scene-manager";

const sceneManager = new SceneManager();

// Add scenes
sceneManager.addScene("menu", menuScene);
sceneManager.addScene("game", gameScene);
sceneManager.addScene("gameover", gameOverScene);

// Switch scenes
sceneManager.switchTo("menu");

// Get current scene
const current = sceneManager.getCurrentScene();
const name = sceneManager.getCurrentSceneName();

// Query scenes
const scene = sceneManager.getScene("game");
const exists = sceneManager.hasScene("menu");
const names = sceneManager.getSceneNames();
const count = sceneManager.getSceneCount();

// Update and render current scene
sceneManager.update();
sceneManager.draw();

// Cleanup
sceneManager.removeScene("menu");
sceneManager.clearAllScenes();
```

### EventBus

Pub/sub pattern for decoupled communication:

```typescript
import { EventBus, globalEventBus } from "./src/core/event-bus";

// Create event bus (or use global)
const events = new EventBus();

// Subscribe to events
const unsubscribe = events.on("player-died", (data) => {
  console.log(`Player died at level ${data.level}`);
});

// One-time listener
events.once("game-start", () => {
  console.log("Game started!");
});

// Emit events
events.emit("player-died", { level: 5 });

// Unsubscribe
unsubscribe();

// Query
const hasListeners = events.hasListeners("player-died");
const count = events.getListenerCount("player-died");
const eventNames = events.getEventNames();

// Cleanup
events.off("player-died"); // Remove all listeners for event
events.clear(); // Remove all listeners
```

## Complete Example

```typescript
import {
  Scene,
  Entity,
  Camera,
  Input,
  GameLoop,
  TextEntity,
  Color,
  ColorHelper,
  CollisionHelper,
  EventBus
} from "./src/core/index";

// Create scene
const scene = new Scene(50, 50, "Game");
const camera = new Camera(25, 20, 25, 40, "");

// Create player
const player = new Entity(25, 25, "@");
player.setLayer(1);
scene.addEntity(player);

// Create title
const title = new TextEntity(1, 10, "MY GAME", 2);
title.addToScene(scene);

// Setup input
Input.start();
Input.onKey("ArrowUp", ({ isDown }) => {
  if (isDown) player.move(-1, 0);
});
Input.onKey("ArrowDown", ({ isDown }) => {
  if (isDown) player.move(1, 0);
});
Input.onKey("ArrowLeft", ({ isDown }) => {
  if (isDown) player.move(0, -1);
});
Input.onKey("ArrowRight", ({ isDown }) => {
  if (isDown) player.move(0, 1);
});

// Setup game loop
const gameLoop = new GameLoop(
  (deltaTime) => {
    scene.update();
  },
  () => {
    scene.draw();
  },
  30
);

gameLoop.start();
```

## Best Practices

1. **Use TextEntity for text** - Much easier than managing individual character entities
2. **Use layers for rendering order** - Background (0), Game objects (1), UI (2+)
3. **Use EventBus for game events** - Keeps code decoupled and maintainable
4. **Use SceneManager for multiple screens** - Menu, game, pause, game over, etc.
5. **Use CollisionHelper for spatial queries** - More efficient than manual loops
6. **Use GameLoop for smooth updates** - Provides consistent timing with delta time
7. **Use Color for visual feedback** - Makes terminal games more engaging

## Examples

See the `src/examples/` directory for complete examples:
- `connectfour.ts` - Full Connect Four game implementation
- `feature-showcase.ts` - Demonstrates all engine features

## Running Examples

```bash
# Run Connect Four
bun src/examples/connectfour.ts

# Run feature showcase
bun src/examples/feature-showcase.ts
```

## API Reference

For detailed API documentation, see the JSDoc comments in each source file or import from the main index:

```typescript
import * as TEngine from "./src/core/index";
```

