/**
 * Collision Helper
 * Provides utility functions for collision detection
 */

import type { Entity } from "../entity/entity";
import type { Scene } from "../scene";
import type { Point } from "../../types/point";

/**
 * CollisionHelper class with static methods for collision detection
 */
export class CollisionHelper {
  /**
   * Checks if two entities are at the same position
   * @param entity1 - First entity
   * @param entity2 - Second entity
   * @returns True if entities are at the same position
   */
  public static checkCollision(entity1: Entity, entity2: Entity): boolean {
    const pos1 = entity1.getPosition();
    const pos2 = entity2.getPosition();
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }

  /**
   * Gets all entities at a specific position in a scene
   * @param scene - The scene to search
   * @param y - The y coordinate
   * @param x - The x coordinate
   * @returns Array of entities at that position
   */
  public static getEntitiesAt(scene: Scene, y: number, x: number): Entity[] {
    return scene.getEntitiesAtPosition(y, x);
  }

  /**
   * Checks if a point is within bounds
   * @param point - The point to check
   * @param minY - Minimum y coordinate
   * @param minX - Minimum x coordinate
   * @param maxY - Maximum y coordinate
   * @param maxX - Maximum x coordinate
   * @returns True if point is within bounds
   */
  public static isPointInBounds(
    point: Point,
    minY: number,
    minX: number,
    maxY: number,
    maxX: number
  ): boolean {
    return point.y >= minY && point.y <= maxY && point.x >= minX && point.x <= maxX;
  }

  /**
   * Checks if an entity is within bounds
   * @param entity - The entity to check
   * @param minY - Minimum y coordinate
   * @param minX - Minimum x coordinate
   * @param maxY - Maximum y coordinate
   * @param maxX - Maximum x coordinate
   * @returns True if entity is within bounds
   */
  public static isEntityInBounds(
    entity: Entity,
    minY: number,
    minX: number,
    maxY: number,
    maxX: number
  ): boolean {
    const pos = entity.getPosition();
    return this.isPointInBounds(pos, minY, minX, maxY, maxX);
  }

  /**
   * Gets the distance between two entities
   * @param entity1 - First entity
   * @param entity2 - Second entity
   * @returns The Euclidean distance between entities
   */
  public static getDistance(entity1: Entity, entity2: Entity): number {
    const pos1 = entity1.getPosition();
    const pos2 = entity2.getPosition();
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Gets the Manhattan distance between two entities
   * @param entity1 - First entity
   * @param entity2 - Second entity
   * @returns The Manhattan distance between entities
   */
  public static getManhattanDistance(entity1: Entity, entity2: Entity): number {
    const pos1 = entity1.getPosition();
    const pos2 = entity2.getPosition();
    return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y);
  }

  /**
   * Checks if two entities are within a certain distance
   * @param entity1 - First entity
   * @param entity2 - Second entity
   * @param distance - Maximum distance
   * @returns True if entities are within distance
   */
  public static isWithinDistance(entity1: Entity, entity2: Entity, distance: number): boolean {
    return this.getDistance(entity1, entity2) <= distance;
  }

  /**
   * Finds all entities within a certain distance of a point
   * @param scene - The scene to search
   * @param y - The y coordinate
   * @param x - The x coordinate
   * @param distance - Maximum distance
   * @returns Array of entities within distance
   */
  public static getEntitiesWithinDistance(
    scene: Scene,
    y: number,
    x: number,
    distance: number
  ): Entity[] {
    const allEntities = scene.getAllEntities();
    return allEntities.filter((entity) => {
      const pos = entity.getPosition();
      const dx = pos.x - x;
      const dy = pos.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= distance;
    });
  }

  /**
   * Checks if an entity would collide with any other entity at a new position
   * @param scene - The scene to check
   * @param entity - The entity to move
   * @param newY - The new y coordinate
   * @param newX - The new x coordinate
   * @returns True if there would be a collision
   */
  public static wouldCollideAt(scene: Scene, entity: Entity, newY: number, newX: number): boolean {
    const entitiesAtPosition = scene.getEntitiesAtPosition(newY, newX);
    // Check if any entity at that position is not the entity we're moving
    return entitiesAtPosition.some((e) => e.getId() !== entity.getId());
  }

  /**
   * Gets the direction vector from one entity to another
   * @param from - The source entity
   * @param to - The target entity
   * @returns Object with dx and dy direction components
   */
  public static getDirectionTo(from: Entity, to: Entity): { dx: number; dy: number } {
    const fromPos = from.getPosition();
    const toPos = to.getPosition();
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      return { dx: 0, dy: 0 };
    }

    return {
      dx: dx / length,
      dy: dy / length,
    };
  }
}

