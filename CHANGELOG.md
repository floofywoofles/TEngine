# TEngine Changelog

## Version 2.0.0 - Major Feature Update

### New Features

#### 1. Enhanced Entity System
- **Position Updates**: Added `setPosition(y, x)` and `move(deltaY, deltaX)` methods
- **Sprite Updates**: Added `setSprite(sprite)` method for dynamic sprite changes
- **Layer System**: Added `getLayer()` and `setLayer(layer)` for z-index rendering control

#### 2. Enhanced Scene System
- **Multiple Entity Queries**: `getEntitiesAtPosition()` returns all entities at a position
- **Region Queries**: `getEntitiesInRegion()` finds entities in rectangular areas
- **Sprite Queries**: `getEntitiesBySprite()` finds all entities with specific sprite
- **Utility Methods**: `getAllEntities()`, `getEntityCount()`, `clearAllEntities()`
- **Layer-Based Rendering**: Automatic rendering of higher layers on top of lower layers

#### 3. TextEntity Helper (`src/core/helpers/text-entity.ts`)
- Simplifies text rendering by managing character entities
- Methods: `addToScene()`, `removeFromScene()`, `setText()`, `setPosition()`, `setLayer()`
- Eliminates need to manually create entities for each character

#### 4. Color System (`src/core/helpers/color.ts`)
- ANSI color code support for terminal rendering
- 16 foreground colors (standard + bright variants)
- 16 background colors (standard + bright variants)
- Text styles: Bold, Italic, Underline, Dim, Blink, Reverse, Hidden
- Helper methods: `colorize()`, `style()`, `colorizeWithBg()`, `stripColors()`, `getVisibleLength()`

#### 5. GameLoop System (`src/core/game-loop.ts`)
- Standard game loop with delta time support
- Configurable FPS (default: 60)
- Separate update and render callbacks
- Methods: `start()`, `stop()`, `setFPS()`, `getFPS()`, `isActive()`

#### 6. Enhanced Input System
- **State Queries**: `isKeyDown(key)`, `getKeysDown()`, `hasAnyKeyDown()`, `getPressedKeyCount()`
- Allows checking input state without relying solely on callbacks
- Useful for continuous movement and polling-based input

#### 7. SceneManager (`src/core/scene-manager.ts`)
- Manage multiple scenes and transitions
- Methods: `addScene()`, `removeScene()`, `switchTo()`, `getCurrentScene()`
- Query methods: `hasScene()`, `getScene()`, `getSceneNames()`, `getSceneCount()`
- Automatic update/draw of current scene

#### 8. CollisionHelper (`src/core/helpers/collision.ts`)
- Comprehensive collision detection utilities
- Position-based collision: `checkCollision()`, `getEntitiesAt()`
- Distance calculations: `getDistance()`, `getManhattanDistance()`, `isWithinDistance()`
- Spatial queries: `getEntitiesWithinDistance()`, `isEntityInBounds()`, `wouldCollideAt()`
- Direction helpers: `getDirectionTo()`

#### 9. EventBus System (`src/core/event-bus.ts`)
- Pub/sub pattern for decoupled communication
- Methods: `on()`, `once()`, `emit()`, `off()`, `clear()`
- Query methods: `hasListeners()`, `getListenerCount()`, `getEventNames()`
- Global event bus instance available: `globalEventBus`

#### 10. Unified Exports (`src/core/index.ts`)
- Single import point for all TEngine features
- Clean API surface
- Easy to use: `import { Entity, Scene, ... } from "./src/core/index"`

### Examples

#### New Examples Added
- **feature-showcase.ts**: Demonstrates all new features with tests
- **connectfour.ts**: Complete Connect Four game using TEngine

### Documentation

#### New Documentation Files
- **FEATURES.md**: Comprehensive guide to all TEngine features
- **CHANGELOG.md**: This file - tracks all changes

### Breaking Changes
None - All changes are backwards compatible. Existing code will continue to work.

### Bug Fixes
- Scene rendering now properly handles multiple entities at same position
- Layer-based rendering ensures correct visual ordering

### Performance Improvements
- Scene query methods provide efficient entity lookup
- Layer-based rendering optimized for common use cases

### Testing
- All features tested and verified working
- No regressions in existing functionality
- Connect Four example confirms backwards compatibility

### File Structure
```
src/
├── core/
│   ├── entity/
│   │   ├── entity.ts (enhanced)
│   │   └── entityPositions.ts
│   ├── helpers/
│   │   ├── text-entity.ts (new)
│   │   ├── color.ts (new)
│   │   └── collision.ts (new)
│   ├── camera.ts
│   ├── scene.ts (enhanced)
│   ├── input.ts (enhanced)
│   ├── global.ts
│   ├── game-loop.ts (new)
│   ├── scene-manager.ts (new)
│   ├── event-bus.ts (new)
│   └── index.ts (new)
├── examples/
│   ├── connectfour.ts
│   └── feature-showcase.ts (new)
└── types/
    ├── point.ts
    └── resolution.ts
```

### Migration Guide

No migration needed! All changes are additive. To use new features:

```typescript
// Old way still works
import { Entity } from "./src/core/entity/entity";

// New way - cleaner
import { Entity } from "./src/core/index";

// Use new features
const entity = new Entity(5, 5, "@");
entity.setPosition(10, 10); // New method
entity.setLayer(1); // New method
```

### Contributors
- Enhanced based on user feedback and game development best practices
- All features fully documented with JSDoc comments
- Comprehensive testing ensures quality

### Next Steps
Consider these potential future enhancements:
- Animation system
- Sound effects (terminal beep/bell)
- Save/load system
- Particle effects
- Tilemap support
- Component-based entity system

