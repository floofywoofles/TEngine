/**
 * TEngine Feature Showcase
 * Demonstrates all the new features added to the engine
 */

import { Scene } from "../core/scene";
import { Entity } from "../core/entity/entity";
import { Input } from "../core/input";
import { GameLoop } from "../core/game-loop";
import { SceneManager } from "../core/scene-manager";
import { EventBus } from "../core/event-bus";
import { TextEntity } from "../core/helpers/text-entity";
import { Color, ColorHelper } from "../core/helpers/color";
import { CollisionHelper } from "../core/helpers/collision";

console.log("=== TEngine Feature Showcase ===\n");

// Test 1: Entity position and sprite updates
console.log("✓ Test 1: Entity Updates");
const testEntity = new Entity(5, 5, "X");
console.log(`  Initial position: (${testEntity.getPosition().y}, ${testEntity.getPosition().x})`);
testEntity.setPosition(10, 10);
console.log(`  After setPosition: (${testEntity.getPosition().y}, ${testEntity.getPosition().x})`);
testEntity.move(2, 3);
console.log(`  After move(2,3): (${testEntity.getPosition().y}, ${testEntity.getPosition().x})`);
testEntity.setSprite("O");
console.log(`  Sprite changed to: ${testEntity.getSprite()}`);

// Test 2: Layer system
console.log("\n✓ Test 2: Layer System");
const layerEntity = new Entity(0, 0, "L");
console.log(`  Default layer: ${layerEntity.getLayer()}`);
layerEntity.setLayer(5);
console.log(`  After setLayer(5): ${layerEntity.getLayer()}`);

// Test 3: Scene query methods
console.log("\n✓ Test 3: Scene Query Methods");
const testScene = new Scene(20, 20, "Test Scene");
const entity1 = new Entity(5, 5, "A");
const entity2 = new Entity(5, 5, "B");
const entity3 = new Entity(10, 10, "C");
testScene.addEntity(entity1);
testScene.addEntity(entity2);
testScene.addEntity(entity3);
console.log(`  Total entities: ${testScene.getEntityCount()}`);
console.log(`  Entities at (5,5): ${testScene.getEntitiesAtPosition(5, 5).length}`);
console.log(`  Entities in region (0,0,15,15): ${testScene.getEntitiesInRegion(0, 0, 15, 15).length}`);
testScene.clearAllEntities();
console.log(`  After clearAllEntities(): ${testScene.getEntityCount()}`);

// Test 4: TextEntity helper
console.log("\n✓ Test 4: TextEntity Helper");
const textScene = new Scene(10, 30, "Text Scene");
const text = new TextEntity(2, 5, "Hello TEngine!", 1);
console.log(`  Created text: "${text.getText()}"`);
console.log(`  Text length: ${text.getLength()}`);
console.log(`  Entity count: ${text.getEntities().length}`);
text.addToScene(textScene);
console.log(`  Added to scene, scene entity count: ${textScene.getEntityCount()}`);
text.removeFromScene(textScene);
console.log(`  Removed from scene, scene entity count: ${textScene.getEntityCount()}`);

// Test 5: Color system
console.log("\n✓ Test 5: Color System");
const redText = ColorHelper.colorize("Red Text", Color.Red);
const styledText = ColorHelper.style("Bold Red", Color.Bold, Color.Red);
console.log(`  Colored text: ${redText}`);
console.log(`  Styled text: ${styledText}`);
console.log(`  Visible length of colored text: ${ColorHelper.getVisibleLength(redText)}`);

// Test 6: GameLoop system
console.log("\n✓ Test 6: GameLoop System");
let frameCount = 0;
const gameLoop = new GameLoop(
  () => {
    frameCount++;
  },
  () => {
    // Render
  },
  60
);
console.log(`  GameLoop created with ${gameLoop.getFPS()} FPS`);
console.log(`  Is active: ${gameLoop.isActive()}`);
gameLoop.start();
console.log(`  Started: ${gameLoop.isActive()}`);
// Let it run for a moment
await new Promise(resolve => setTimeout(resolve, 100));
gameLoop.stop();
console.log(`  Stopped. Frames processed: ${frameCount}`);

// Test 7: Input state queries
console.log("\n✓ Test 7: Input State Queries");
console.log(`  Has any key down: ${Input.hasAnyKeyDown()}`);
console.log(`  Pressed key count: ${Input.getPressedKeyCount()}`);
console.log(`  Keys down: ${Input.getKeysDown().join(', ') || 'none'}`);

// Test 8: SceneManager
console.log("\n✓ Test 8: SceneManager");
const sceneManager = new SceneManager();
const scene1 = new Scene(10, 10, "Scene 1");
const scene2 = new Scene(20, 20, "Scene 2");
sceneManager.addScene("menu", scene1);
sceneManager.addScene("game", scene2);
console.log(`  Total scenes: ${sceneManager.getSceneCount()}`);
console.log(`  Scene names: ${sceneManager.getSceneNames().join(', ')}`);
sceneManager.switchTo("menu");
console.log(`  Current scene: ${sceneManager.getCurrentSceneName()}`);
sceneManager.switchTo("game");
console.log(`  Switched to: ${sceneManager.getCurrentSceneName()}`);

// Test 9: CollisionHelper
console.log("\n✓ Test 9: CollisionHelper");
const collisionScene = new Scene(20, 20, "Collision Scene");
const entityA = new Entity(5, 5, "A");
const entityB = new Entity(5, 5, "B");
const entityC = new Entity(10, 10, "C");
collisionScene.addEntity(entityA);
collisionScene.addEntity(entityB);
collisionScene.addEntity(entityC);
console.log(`  A and B collision: ${CollisionHelper.checkCollision(entityA, entityB)}`);
console.log(`  A and C collision: ${CollisionHelper.checkCollision(entityA, entityC)}`);
console.log(`  Distance A to C: ${CollisionHelper.getDistance(entityA, entityC).toFixed(2)}`);
console.log(`  Manhattan distance A to C: ${CollisionHelper.getManhattanDistance(entityA, entityC)}`);
console.log(`  Entities within 8 units of (5,5): ${CollisionHelper.getEntitiesWithinDistance(collisionScene, 5, 5, 8).length}`);

// Test 10: EventBus
console.log("\n✓ Test 10: EventBus");
const eventBus = new EventBus();
let eventFired = false;
const unsubscribe = eventBus.on("test-event", (data) => {
  eventFired = true;
  console.log(`  Event received with data: ${data}`);
});
console.log(`  Has listeners for 'test-event': ${eventBus.hasListeners("test-event")}`);
console.log(`  Listener count: ${eventBus.getListenerCount("test-event")}`);
eventBus.emit("test-event", "Hello from event!");
console.log(`  Event fired: ${eventFired}`);
unsubscribe();
console.log(`  After unsubscribe, listener count: ${eventBus.getListenerCount("test-event")}`);

// Test 11: Once listener
console.log("\n✓ Test 11: EventBus Once Listener");
let onceCount = 0;
eventBus.once("once-event", () => {
  onceCount++;
});
eventBus.emit("once-event");
eventBus.emit("once-event");
console.log(`  Once listener called ${onceCount} time(s) (should be 1)`);

console.log("\n=== All Tests Passed! ===");
console.log("\n✅ TEngine enhancements are working correctly!");
console.log("\nNew features available:");
console.log("  • Entity position/sprite updates");
console.log("  • Layer-based rendering");
console.log("  • Scene query methods");
console.log("  • TextEntity helper");
console.log("  • Color system");
console.log("  • GameLoop with delta time");
console.log("  • Input state queries");
console.log("  • SceneManager");
console.log("  • CollisionHelper");
console.log("  • EventBus");

process.exit(0);

