# TEngine Quick Start Guide

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd TEngine

# Install dependencies (if any)
bun install
```

## Your First Game

Create a new file `my-game.ts`:

```typescript
import {
  Scene,
  Entity,
  Camera,
  Input,
  GameLoop
} from "./src/core/index";

// Create scene (height, width, name)
const scene = new Scene(30, 50, "My Game");

// Create camera (y, viewportHeight, x, viewportWidth)
const camera = new Camera(15, 20, 25, 40);

// Create player entity (y, x, sprite)
const player = new Entity(15, 25, "@");
scene.addEntity(player);

// Setup input
Input.start();

let speed = 5;

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

Input.onKey("q", ({ isDown }) => {
  if (isDown) {
    Input.stop();
    process.exit(0);
  }
});

// Create game loop
const gameLoop = new GameLoop(
  (deltaTime) => {
    // Update game state
    scene.update();
  },
  () => {
    // Render
    scene.draw();
  },
  30 // 30 FPS
);

// Start the game
gameLoop.start();
```

Run it:
```bash
bun my-game.ts
```

## Common Patterns

### Adding Text

```typescript
import { TextEntity } from "./src/core/index";

const title = new TextEntity(1, 10, "MY GAME", 2);
title.addToScene(scene);
```

### Adding Colors

```typescript
import { Color, ColorHelper } from "./src/core/index";

const entity = new Entity(5, 5, ColorHelper.colorize("@", Color.Red));
```

### Collision Detection

```typescript
import { CollisionHelper } from "./src/core/index";

if (CollisionHelper.checkCollision(player, enemy)) {
  console.log("Hit!");
}
```

### Multiple Scenes

```typescript
import { SceneManager } from "./src/core/index";

const manager = new SceneManager();
manager.addScene("menu", menuScene);
manager.addScene("game", gameScene);
manager.switchTo("menu");

// In game loop
manager.update();
manager.draw();
```

### Events

```typescript
import { EventBus } from "./src/core/index";

const events = new EventBus();

events.on("score-changed", (score) => {
  console.log(`Score: ${score}`);
});

events.emit("score-changed", 100);
```

## Tips

1. **Use layers** - Background (0), Game (1), UI (2+)
2. **Use TextEntity** - Much easier than individual characters
3. **Use EventBus** - Keeps code decoupled
4. **Check Input.isKeyDown()** - For continuous movement
5. **Use CollisionHelper** - More efficient than manual checks

## Examples

Check out the examples directory:
- `src/examples/connectfour.ts` - Full game
- `src/examples/feature-showcase.ts` - All features demo

## Documentation

- **FEATURES.md** - Complete feature guide
- **CHANGELOG.md** - What's new
- **README.md** - Project overview

## Controls

Common control patterns:

```typescript
// Arrow keys for movement
Input.onKey("ArrowUp", handler);
Input.onKey("ArrowDown", handler);
Input.onKey("ArrowLeft", handler);
Input.onKey("ArrowRight", handler);

// WASD for movement
Input.onKey("w", handler);
Input.onKey("a", handler);
Input.onKey("s", handler);
Input.onKey("d", handler);

// Space for action
Input.onKey(" ", handler);

// Enter for confirm
Input.onKey("Enter", handler);

// Q for quit
Input.onKey("q", ({ isDown }) => {
  if (isDown) {
    Input.stop();
    process.exit(0);
  }
});
```

## Debugging

Enable debug info:

```typescript
// Show entity count
console.log(`Entities: ${scene.getEntityCount()}`);

// Show pressed keys
console.log(`Keys: ${Input.getKeysDown()}`);

// Show FPS
console.log(`FPS: ${gameLoop.getFPS()}`);
```

## Need Help?

1. Check FEATURES.md for detailed API docs
2. Look at examples in `src/examples/`
3. Read JSDoc comments in source files
4. Check CHANGELOG.md for recent changes

Happy game development! 🎮

