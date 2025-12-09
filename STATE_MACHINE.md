# State Machine Guide

## Overview

TEngine includes a powerful State Machine system for managing game states, entity states, AI behavior, and more. The `StateMachine` class provides a clean, type-safe way to handle state transitions with callbacks for entry, update, and exit.

## Quick Start

```typescript
import { StateMachine } from "./src/core/index";

// Create a state machine
const stateMachine = new StateMachine("idle");

// Add states
stateMachine.addState("idle", {
  onEnter: () => console.log("Entered idle"),
  onUpdate: (deltaTime) => {
    // Update logic
  },
  onExit: () => console.log("Exited idle")
});

stateMachine.addState("walking", {
  onEnter: () => console.log("Entered walking"),
  onUpdate: (deltaTime) => {
    // Walking logic
  }
});

// Define transitions
stateMachine.addTransition("idle", "walking");
stateMachine.addTransition("walking", "idle");

// Transition between states
stateMachine.transitionTo("walking");

// Update in game loop
stateMachine.update(deltaTime);
```

## Core Concepts

### States

A state represents a distinct mode or condition. Each state can have:
- **onEnter**: Called when entering the state
- **onUpdate**: Called each frame while in the state
- **onExit**: Called when exiting the state
- **data**: Optional data associated with the state

### Transitions

Transitions define which state changes are allowed. You can:
- Add one-way transitions
- Add bidirectional transitions
- Check if a transition is allowed
- Force transitions (bypass checks)

## API Reference

### Creating a State Machine

```typescript
// With initial state
const stateMachine = new StateMachine("menu");

// Without initial state (first added state becomes initial)
const stateMachine = new StateMachine();
```

### Adding States

```typescript
stateMachine.addState("stateName", {
  onEnter: (fromState, data) => {
    // Called when entering this state
  },
  onUpdate: (deltaTime, data) => {
    // Called each frame
  },
  onExit: (toState, data) => {
    // Called when exiting this state
  },
  data: { /* optional state data */ }
});
```

### Defining Transitions

```typescript
// One-way transition
stateMachine.addTransition("idle", "walking");

// Bidirectional transition
stateMachine.addBidirectionalTransition("idle", "walking");

// Remove a transition
stateMachine.removeTransition("idle", "walking");
```

### Transitioning Between States

```typescript
// Normal transition (checks if allowed)
const success = stateMachine.transitionTo("walking", optionalData);

// Force transition (bypasses checks)
stateMachine.forceTransitionTo("walking", optionalData);
```

### Querying State

```typescript
// Get current state
const current = stateMachine.getCurrentState();

// Get previous state
const previous = stateMachine.getPreviousState();

// Check if in specific state
if (stateMachine.isInState("walking")) {
  // Do something
}

// Get all states
const allStates = stateMachine.getStateNames();

// Get allowed transitions from a state
const transitions = stateMachine.getTransitionsFrom("idle");
```

### State Data

```typescript
// Set data for a state
stateMachine.setStateData("walking", { speed: 5 });

// Get data for a state
const data = stateMachine.getStateData("walking");
```

### Global Transition Callback

```typescript
// Called on every state transition
stateMachine.onTransition((fromState, toState, data) => {
  console.log(`${fromState} -> ${toState}`);
});
```

### Updating

```typescript
// Call in your game loop
stateMachine.update(deltaTime);
```

### Utility Methods

```typescript
// Reset to initial state
stateMachine.reset();

// Clear all states and transitions
stateMachine.clear();

// Check if transition is allowed
if (stateMachine.canTransition("idle", "walking")) {
  // Transition is allowed
}
```

## Common Patterns

### Pattern 1: Game State Management

```typescript
enum GameState {
  Menu = "menu",
  Playing = "playing",
  Paused = "paused",
  GameOver = "gameover"
}

const gameStateMachine = new StateMachine(GameState.Menu);

// Menu state
gameStateMachine.addState(GameState.Menu, {
  onEnter: () => {
    showMenu();
  },
  onUpdate: (deltaTime) => {
    updateMenu(deltaTime);
  },
  onExit: () => {
    hideMenu();
  }
});

// Playing state
gameStateMachine.addState(GameState.Playing, {
  onEnter: () => {
    startGame();
  },
  onUpdate: (deltaTime) => {
    updateGame(deltaTime);
  },
  onExit: () => {
    stopGame();
  }
});

// Define transitions
gameStateMachine.addTransition(GameState.Menu, GameState.Playing);
gameStateMachine.addTransition(GameState.Playing, GameState.Paused);
gameStateMachine.addTransition(GameState.Paused, GameState.Playing);
gameStateMachine.addTransition(GameState.Playing, GameState.GameOver);
gameStateMachine.addTransition(GameState.GameOver, GameState.Menu);

// In game loop
gameStateMachine.update(deltaTime);
```

### Pattern 2: Entity State (Player/Enemy)

```typescript
class Player extends Entity {
  private stateMachine: StateMachine;

  constructor() {
    super(0, 0, "@");
    this.stateMachine = new StateMachine("idle");
    this.setupStates();
  }

  private setupStates(): void {
    // Idle state
    this.stateMachine.addState("idle", {
      onEnter: () => {
        this.setSprite("@");
      },
      onUpdate: (deltaTime) => {
        // Idle animation
      }
    });

    // Walking state
    this.stateMachine.addState("walking", {
      onEnter: () => {
        this.setSprite(">");
      },
      onUpdate: (deltaTime) => {
        this.move(0, 1 * deltaTime);
      }
    });

    // Jumping state
    this.stateMachine.addState("jumping", {
      onEnter: () => {
        this.setSprite("^");
      },
      onUpdate: (deltaTime) => {
        // Jump physics
      }
    });

    // Define transitions
    this.stateMachine.addTransition("idle", "walking");
    this.stateMachine.addTransition("walking", "idle");
    this.stateMachine.addTransition("idle", "jumping");
    this.stateMachine.addTransition("jumping", "idle");
  }

  public update(deltaTime: number): void {
    this.stateMachine.update(deltaTime);
  }

  public startWalking(): void {
    this.stateMachine.transitionTo("walking");
  }

  public jump(): void {
    if (this.stateMachine.canTransition(this.stateMachine.getCurrentState()!, "jumping")) {
      this.stateMachine.transitionTo("jumping");
    }
  }
}
```

### Pattern 3: AI Behavior

```typescript
class Enemy extends Entity {
  private stateMachine: StateMachine;
  private player: Entity;

  constructor(player: Entity) {
    super(10, 10, "E");
    this.player = player;
    this.stateMachine = new StateMachine("patrol");
    this.setupAIStates();
  }

  private setupAIStates(): void {
    // Patrol state
    this.stateMachine.addState("patrol", {
      onEnter: () => {
        console.log("Enemy: Starting patrol");
      },
      onUpdate: (deltaTime) => {
        // Patrol logic
        if (this.isPlayerNearby()) {
          this.stateMachine.transitionTo("chase");
        }
      }
    });

    // Chase state
    this.stateMachine.addState("chase", {
      onEnter: () => {
        console.log("Enemy: Chasing player");
      },
      onUpdate: (deltaTime) => {
        // Chase logic
        this.moveTowardPlayer(deltaTime);
        
        if (!this.isPlayerNearby()) {
          this.stateMachine.transitionTo("patrol");
        }
        
        if (this.isPlayerInRange()) {
          this.stateMachine.transitionTo("attack");
        }
      }
    });

    // Attack state
    this.stateMachine.addState("attack", {
      onEnter: () => {
        console.log("Enemy: Attacking!");
        this.attack();
      },
      onUpdate: (deltaTime) => {
        if (!this.isPlayerInRange()) {
          this.stateMachine.transitionTo("chase");
        }
      }
    });

    // Define transitions
    this.stateMachine.addTransition("patrol", "chase");
    this.stateMachine.addTransition("chase", "patrol");
    this.stateMachine.addTransition("chase", "attack");
    this.stateMachine.addTransition("attack", "chase");
  }

  public update(deltaTime: number): void {
    this.stateMachine.update(deltaTime);
  }

  private isPlayerNearby(): boolean {
    // Check distance to player
    return false; // Implement logic
  }

  private isPlayerInRange(): boolean {
    // Check attack range
    return false; // Implement logic
  }

  private moveTowardPlayer(deltaTime: number): void {
    // Move toward player
  }

  private attack(): void {
    // Attack logic
  }
}
```

### Pattern 4: Animation States

```typescript
class AnimatedEntity extends Entity {
  private stateMachine: StateMachine;
  private animationFrame: number = 0;

  constructor() {
    super(0, 0, ".");
    this.stateMachine = new StateMachine("idle");
    this.setupAnimationStates();
  }

  private setupAnimationStates(): void {
    const idleFrames = [".", "·", ".", "·"];
    const walkFrames = [">", "→", ">", "→"];

    this.stateMachine.addState("idle", {
      onEnter: () => {
        this.animationFrame = 0;
      },
      onUpdate: (deltaTime) => {
        this.animationFrame = (this.animationFrame + 1) % idleFrames.length;
        this.setSprite(idleFrames[this.animationFrame]!);
      }
    });

    this.stateMachine.addState("walking", {
      onEnter: () => {
        this.animationFrame = 0;
      },
      onUpdate: (deltaTime) => {
        this.animationFrame = (this.animationFrame + 1) % walkFrames.length;
        this.setSprite(walkFrames[this.animationFrame]!);
      }
    });

    this.stateMachine.addBidirectionalTransition("idle", "walking");
  }

  public update(deltaTime: number): void {
    this.stateMachine.update(deltaTime);
  }
}
```

### Pattern 5: State with Data

```typescript
// Create state with data
stateMachine.addState("shooting", {
  onEnter: (fromState, data) => {
    const ammo = data?.ammo || 10;
    stateMachine.setStateData("shooting", { ammo });
  },
  onUpdate: (deltaTime, data) => {
    if (data && data.ammo > 0) {
      // Shoot
      data.ammo--;
    } else {
      // Out of ammo, transition to reload
      stateMachine.transitionTo("reloading");
    }
  }
});

// Transition with data
stateMachine.transitionTo("shooting", { ammo: 30 });
```

## Best Practices

### 1. Use Enums for State Names

```typescript
enum PlayerState {
  Idle = "idle",
  Walking = "walking",
  Running = "running"
}

// Prevents typos and provides autocomplete
stateMachine.addState(PlayerState.Idle, { ... });
```

### 2. Define All Transitions Upfront

```typescript
// Good: Clear transition graph
stateMachine.addTransition("idle", "walking");
stateMachine.addTransition("walking", "idle");
stateMachine.addTransition("walking", "running");

// Bad: Adding transitions on the fly makes it hard to understand
```

### 3. Use onEnter for Initialization

```typescript
stateMachine.addState("attack", {
  onEnter: () => {
    // Initialize attack
    this.attackTimer = 0;
    this.attackCooldown = 1.0;
  },
  onUpdate: (deltaTime) => {
    // Update attack
    this.attackTimer += deltaTime;
  }
});
```

### 4. Use onExit for Cleanup

```typescript
stateMachine.addState("menu", {
  onExit: () => {
    // Cleanup menu resources
    this.menuEntities.forEach(e => scene.removeEntity(e));
  }
});
```

### 5. Update in Game Loop

```typescript
const gameLoop = new GameLoop(
  (deltaTime) => {
    // Update all state machines
    playerStateMachine.update(deltaTime);
    enemyStateMachine.update(deltaTime);
    gameStateMachine.update(deltaTime);
    
    scene.update();
  },
  () => {
    scene.draw();
  }
);
```

### 6. Check Transitions Before Attempting

```typescript
if (stateMachine.canTransition("idle", "walking")) {
  stateMachine.transitionTo("walking");
} else {
  console.log("Cannot transition from idle to walking");
}
```

## Debugging

### Log All Transitions

```typescript
stateMachine.onTransition((fromState, toState, data) => {
  console.log(`[StateMachine] ${fromState} -> ${toState}`, data);
});
```

### Check Current State

```typescript
console.log(`Current state: ${stateMachine.getCurrentState()}`);
console.log(`Previous state: ${stateMachine.getPreviousState()}`);
console.log(`Available transitions:`, 
  stateMachine.getTransitionsFrom(stateMachine.getCurrentState()!));
```

### Visualize State Graph

```typescript
function visualizeStateMachine(stateMachine: StateMachine) {
  const states = stateMachine.getStateNames();
  console.log("State Machine Graph:");
  
  for (const state of states) {
    const transitions = stateMachine.getTransitionsFrom(state);
    console.log(`  ${state}:`);
    for (const toState of transitions) {
      console.log(`    -> ${toState}`);
    }
  }
}
```

## Performance Tips

1. **Update Only Active State**: The state machine only calls `onUpdate` for the current state
2. **Cache State Data**: Use `setStateData` to avoid recalculating values
3. **Minimize Transitions**: Don't transition every frame
4. **Use Simple Callbacks**: Keep callbacks lightweight

## Demo

Run the interactive state machine demo:

```bash
bun src/examples/state-machine-demo.ts
```

**Demo Features:**
- Game state management (Menu, Playing, Paused, GameOver)
- Visual state display with colors
- Transition animations
- Score tracking per state

## Common Use Cases

1. **Game States**: Menu, Playing, Paused, Game Over
2. **Entity States**: Idle, Walking, Running, Jumping, Attacking
3. **AI Behavior**: Patrol, Chase, Attack, Flee, Dead
4. **Animation States**: Idle, Walk, Run, Attack, Hit
5. **UI States**: Hidden, Visible, Fading In, Fading Out
6. **Loading States**: Loading, Ready, Error

## Troubleshooting

**State not transitioning:**
- Check if transition is defined: `canTransition(from, to)`
- Verify state exists: `getStateNames()`
- Check console for warnings

**onUpdate not called:**
- Make sure you're calling `stateMachine.update(deltaTime)` in your game loop
- Verify you're in the expected state: `getCurrentState()`

**State data not persisting:**
- Use `setStateData()` to store data
- Retrieve with `getStateData()`
- Data is per-state, not global

Happy state managing! 🎮🔄

