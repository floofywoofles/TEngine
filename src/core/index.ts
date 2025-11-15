/**
 * TEngine Core Module Exports
 * Main entry point for importing TEngine components
 */

// Core classes
export { Entity } from "./entity/entity";
export { Scene } from "./scene";
export { Camera } from "./camera";
export { Input } from "./input";

// Systems
export { GameLoop } from "./game-loop";
export { SceneManager } from "./scene-manager";
export { EventBus, globalEventBus } from "./event-bus";

// Helpers
export { TextEntity } from "./helpers/text-entity";
export { Color, ColorHelper } from "./helpers/color";
export { CollisionHelper } from "./helpers/collision";

// Global utilities
export { setConfigMap, getConfigKey } from "./global";

// Types
export type { Point } from "../types/point";
export type { Resolution } from "../types/resolution";

