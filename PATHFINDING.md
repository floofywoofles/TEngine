# A* Pathfinding Guide

## Overview

TEngine includes a powerful A* pathfinding algorithm implementation that makes it easy to add intelligent movement to your games. The `PathfindingHelper` provides multiple heuristics, diagonal movement support, and seamless integration with TEngine's Scene system.

## Quick Start

```typescript
import { PathfindingHelper, Heuristic } from "./src/core/index";

// Find a path from (0,0) to (10,10) on a 20x20 grid
const path = PathfindingHelper.findPath(
  { y: 0, x: 0 },    // start
  { y: 10, x: 10 },  // goal
  20,                 // width
  20,                 // height
  {
    allowDiagonal: true,
    heuristic: Heuristic.Euclidean
  }
);

if (path) {
  console.log(`Found path with ${path.length} steps`);
  // Move entity along path
  for (const point of path) {
    entity.setPosition(point.y, point.x);
  }
}
```

## Core Features

### 1. **Multiple Heuristics**

Choose the best heuristic for your game:

```typescript
// Manhattan - Best for 4-directional movement (up, down, left, right)
Heuristic.Manhattan

// Euclidean - Best for free movement in any direction
Heuristic.Euclidean

// Chebyshev - Best for 8-directional movement (including diagonals)
Heuristic.Chebyshev

// Octile - Optimized for diagonal movement with different costs
Heuristic.Octile
```

**When to use each:**
- **Manhattan**: Grid-based games, roguelikes, turn-based strategy
- **Euclidean**: Real-time games, smooth movement
- **Chebyshev**: Chess-like movement, 8-directional games
- **Octile**: Diagonal movement where diagonals cost more

### 2. **Diagonal Movement**

```typescript
// Allow diagonal movement
const path = PathfindingHelper.findPath(start, goal, width, height, {
  allowDiagonal: true,
  diagonalCost: 1.414  // sqrt(2), default value
});

// 4-directional only
const path = PathfindingHelper.findPath(start, goal, width, height, {
  allowDiagonal: false
});
```

### 3. **Custom Walkability**

Define which tiles are walkable:

```typescript
const path = PathfindingHelper.findPath(start, goal, width, height, {
  isWalkable: (y, x) => {
    // Check if tile is not a wall
    return !walls.has(`${y},${x}`);
  }
});
```

### 4. **Scene Integration**

Automatically consider entities as obstacles:

```typescript
// Find path avoiding all entities in scene
const path = PathfindingHelper.findPathInScene(
  start,
  goal,
  scene,
  { allowDiagonal: true }
);

// Find path avoiding specific entities
const path = PathfindingHelper.findPathAvoidingEntities(
  start,
  goal,
  scene,
  [enemy1, enemy2, wall1],
  { allowDiagonal: true }
);
```

### 5. **Path Smoothing**

Remove unnecessary waypoints for more natural movement:

```typescript
const path = PathfindingHelper.findPath(start, goal, width, height, options);

if (path) {
  // Smooth the path
  const smoothPath = PathfindingHelper.smoothPath(path, (y, x) => {
    return !walls.has(`${y},${x}`);
  });
  
  console.log(`Original: ${path.length} steps, Smoothed: ${smoothPath.length} steps`);
}
```

### 6. **Path Following**

Get the next step in a path:

```typescript
const path = PathfindingHelper.findPath(start, goal, width, height, options);
const currentPos = entity.getPosition();

const nextStep = PathfindingHelper.getNextStep(path, currentPos);
if (nextStep) {
  entity.setPosition(nextStep.y, nextStep.x);
}
```

## Complete Examples

### Example 1: Simple Grid Pathfinding

```typescript
import { PathfindingHelper } from "./src/core/index";

// Create a simple maze
const walls = new Set<string>();
for (let y = 5; y < 15; y++) {
  walls.add(`${y},10`);
}

// Find path around the wall
const path = PathfindingHelper.findPath(
  { y: 10, x: 5 },
  { y: 10, x: 15 },
  20,
  20,
  {
    isWalkable: (y, x) => !walls.has(`${y},${x}`)
  }
);

if (path) {
  console.log("Path found!");
  path.forEach((p, i) => console.log(`Step ${i}: (${p.y}, ${p.x})`));
} else {
  console.log("No path found!");
}
```

### Example 2: Enemy AI with Pathfinding

```typescript
import { Entity } from "./src/core/entity/entity";
import { PathfindingHelper } from "./src/core/helpers/pathfinding";

class Enemy extends Entity {
  private path: Point[] = [];
  private pathUpdateInterval = 1000; // Update path every second
  private lastPathUpdate = 0;

  public update(): void {
    const now = Date.now();
    
    // Update path periodically
    if (now - this.lastPathUpdate > this.pathUpdateInterval) {
      this.updatePath();
      this.lastPathUpdate = now;
    }

    // Follow current path
    this.followPath();
  }

  private updatePath(): void {
    const playerPos = player.getPosition();
    const myPos = this.getPosition();

    this.path = PathfindingHelper.findPath(
      myPos,
      playerPos,
      scene.getResolution().width,
      scene.getResolution().height,
      {
        allowDiagonal: true,
        heuristic: Heuristic.Euclidean,
        isWalkable: (y, x) => {
          // Check for walls
          return !walls.has(`${y},${x}`);
        }
      }
    ) || [];
  }

  private followPath(): void {
    if (this.path.length === 0) return;

    const nextStep = PathfindingHelper.getNextStep(this.path, this.getPosition());
    if (nextStep) {
      this.setPosition(nextStep.y, nextStep.x);
    }
  }
}
```

### Example 3: Click-to-Move

```typescript
import { Input } from "./src/core/input";
import { PathfindingHelper } from "./src/core/helpers/pathfinding";

let targetPosition: Point | null = null;
let currentPath: Point[] = [];

// Set target on space bar (or implement mouse input)
Input.onKey(" ", ({ isDown }) => {
  if (isDown) {
    targetPosition = cursorPosition;
    
    // Find path to target
    currentPath = PathfindingHelper.findPath(
      player.getPosition(),
      targetPosition,
      scene.getResolution().width,
      scene.getResolution().height,
      { allowDiagonal: true }
    ) || [];
  }
});

// In game loop update
function update() {
  if (currentPath.length > 0) {
    const nextStep = PathfindingHelper.getNextStep(currentPath, player.getPosition());
    if (nextStep) {
      player.setPosition(nextStep.y, nextStep.x);
    } else {
      // Reached destination
      currentPath = [];
    }
  }
}
```

### Example 4: Dynamic Obstacles

```typescript
import { PathfindingHelper } from "./src/core/helpers/pathfinding";
import { EventBus } from "./src/core/event-bus";

const events = new EventBus();
let currentPath: Point[] = [];

// Recalculate path when obstacles change
events.on("obstacle-added", () => {
  if (currentPath.length > 0) {
    recalculatePath();
  }
});

events.on("obstacle-removed", () => {
  if (currentPath.length === 0) {
    // Try to find path again
    recalculatePath();
  }
});

function recalculatePath() {
  currentPath = PathfindingHelper.findPath(
    player.getPosition(),
    targetPosition,
    width,
    height,
    {
      isWalkable: (y, x) => !obstacles.has(`${y},${x}`)
    }
  ) || [];
}
```

## API Reference

### `PathfindingHelper.findPath()`

```typescript
PathfindingHelper.findPath(
  start: Point,
  goal: Point,
  width: number,
  height: number,
  options?: PathfindingOptions
): Point[] | null
```

**Parameters:**
- `start` - Starting position
- `goal` - Goal position
- `width` - Grid width
- `height` - Grid height
- `options` - Optional pathfinding options

**Returns:** Array of points representing the path, or `null` if no path found

### `PathfindingOptions`

```typescript
type PathfindingOptions = {
  allowDiagonal?: boolean;        // Default: false
  heuristic?: Heuristic;          // Default: Manhattan
  maxIterations?: number;         // Default: 1000
  diagonalCost?: number;          // Default: 1.414
  isWalkable?: (y, x) => boolean; // Default: always true
};
```

### `PathfindingHelper.findPathInScene()`

```typescript
PathfindingHelper.findPathInScene(
  start: Point,
  goal: Point,
  scene: Scene,
  options?: PathfindingOptions
): Point[] | null
```

Finds a path in a scene, treating all entities as obstacles.

### `PathfindingHelper.findPathAvoidingEntities()`

```typescript
PathfindingHelper.findPathAvoidingEntities(
  start: Point,
  goal: Point,
  scene: Scene,
  obstacles: Entity[],
  options?: PathfindingOptions
): Point[] | null
```

Finds a path avoiding specific entities.

### `PathfindingHelper.smoothPath()`

```typescript
PathfindingHelper.smoothPath(
  path: Point[],
  isWalkable: (y, x) => boolean
): Point[]
```

Removes unnecessary waypoints from a path.

### `PathfindingHelper.getNextStep()`

```typescript
PathfindingHelper.getNextStep(
  path: Point[],
  currentPosition: Point
): Point | null
```

Gets the next position to move to in a path.

## Performance Tips

1. **Limit Search Area**: Use `maxIterations` to prevent long searches
   ```typescript
   { maxIterations: 500 }  // Stop after 500 iterations
   ```

2. **Cache Paths**: Don't recalculate every frame
   ```typescript
   // Recalculate only when needed
   if (!path || obstaclesChanged) {
     path = PathfindingHelper.findPath(...);
   }
   ```

3. **Use Appropriate Heuristic**: Match heuristic to movement type
   - Manhattan for grid movement
   - Euclidean for smooth movement

4. **Smooth Paths**: Reduce waypoints for better performance
   ```typescript
   path = PathfindingHelper.smoothPath(path, isWalkable);
   ```

5. **Update Periodically**: For moving targets, update path every N frames
   ```typescript
   if (frameCount % 30 === 0) {  // Every 30 frames
     path = PathfindingHelper.findPath(...);
   }
   ```

## Demo

Run the interactive pathfinding demo:

```bash
bun src/examples/pathfinding-demo.ts
```

**Demo Controls:**
- **Arrow Keys**: Move cursor
- **W**: Add wall
- **E**: Remove wall
- **Space**: Find path to cursor
- **C**: Clear path
- **D**: Toggle diagonal movement
- **H**: Cycle through heuristics
- **R**: Reset walls
- **Q**: Quit

## Common Patterns

### Pattern 1: Patrol Behavior

```typescript
const patrolPoints = [
  { y: 5, x: 5 },
  { y: 5, x: 15 },
  { y: 15, x: 15 },
  { y: 15, x: 5 }
];
let currentTarget = 0;

function patrol() {
  const path = PathfindingHelper.findPath(
    enemy.getPosition(),
    patrolPoints[currentTarget]!,
    width,
    height,
    options
  );
  
  if (path && path.length <= 1) {
    // Reached waypoint
    currentTarget = (currentTarget + 1) % patrolPoints.length;
  }
}
```

### Pattern 2: Flee Behavior

```typescript
// Find position away from threat
function flee(entity: Entity, threat: Entity) {
  const entityPos = entity.getPosition();
  const threatPos = threat.getPosition();
  
  // Calculate opposite direction
  const dx = entityPos.x - threatPos.x;
  const dy = entityPos.y - threatPos.y;
  
  const fleeTarget = {
    y: entityPos.y + Math.sign(dy) * 10,
    x: entityPos.x + Math.sign(dx) * 10
  };
  
  return PathfindingHelper.findPath(entityPos, fleeTarget, width, height, options);
}
```

### Pattern 3: Group Movement

```typescript
// Move multiple entities to same goal
function moveGroup(entities: Entity[], goal: Point) {
  for (const entity of entities) {
    const path = PathfindingHelper.findPath(
      entity.getPosition(),
      goal,
      width,
      height,
      {
        isWalkable: (y, x) => {
          // Allow entities to pass through each other
          return !walls.has(`${y},${x}`);
        }
      }
    );
    
    if (path) {
      const nextStep = PathfindingHelper.getNextStep(path, entity.getPosition());
      if (nextStep) {
        entity.setPosition(nextStep.y, nextStep.x);
      }
    }
  }
}
```

## Troubleshooting

**No path found:**
- Check if start and goal are walkable
- Check if path is actually blocked
- Increase `maxIterations`
- Verify grid bounds

**Path goes through walls:**
- Ensure `isWalkable` function is correct
- Check wall coordinates

**Slow performance:**
- Reduce `maxIterations`
- Cache paths
- Use Manhattan heuristic
- Smooth paths

**Diagonal movement issues:**
- Set `allowDiagonal: true`
- Use Euclidean or Chebyshev heuristic
- Adjust `diagonalCost`

## Best Practices

1. ✅ **Always check if path is null** before using it
2. ✅ **Cache paths** when possible
3. ✅ **Use appropriate heuristic** for your movement type
4. ✅ **Smooth paths** for more natural movement
5. ✅ **Update paths periodically** for moving targets
6. ✅ **Set reasonable maxIterations** to prevent lag
7. ✅ **Test with different grid sizes** and obstacle patterns

Happy pathfinding! 🎮🗺️

