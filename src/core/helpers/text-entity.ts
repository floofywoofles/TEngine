/**
 * TextEntity Helper
 * Simplifies rendering text strings by managing multiple character entities
 */

import { Entity } from "../entity/entity";
import type { Scene } from "../scene";

/**
 * TextEntity class for easy text rendering
 * Creates and manages a collection of entities representing text characters
 */
export class TextEntity {
  private entities: Entity[] = [];
  private y: number;
  private x: number;
  private text: string;
  private layer: number;

  /**
   * Creates a new TextEntity
   * @param y - The y coordinate for the text
   * @param x - The starting x coordinate for the text
   * @param text - The text string to render
   * @param layer - Optional layer for rendering order (default: 0)
   */
  constructor(y: number, x: number, text: string, layer: number = 0) {
    this.y = y;
    this.x = x;
    this.text = text;
    this.layer = layer;
    this.createEntities();
  }

  /**
   * Creates individual entity objects for each character
   */
  private createEntities(): void {
    this.entities = [];
    for (let i = 0; i < this.text.length; i++) {
      const char = this.text[i];
      if (char) {
        const entity = new Entity(this.y, this.x + i, char);
        entity.setLayer(this.layer);
        this.entities.push(entity);
      }
    }
  }

  /**
   * Adds all text entities to a scene
   * @param scene - The scene to add entities to
   */
  public addToScene(scene: Scene): void {
    for (const entity of this.entities) {
      scene.addEntity(entity);
    }
  }

  /**
   * Removes all text entities from a scene
   * @param scene - The scene to remove entities from
   */
  public removeFromScene(scene: Scene): void {
    for (const entity of this.entities) {
      scene.removeEntity(entity);
    }
  }

  /**
   * Updates the text content and recreates entities
   * @param newText - The new text string
   * @param scene - Optional scene to update entities in
   */
  public setText(newText: string, scene?: Scene): void {
    // Remove old entities from scene if provided
    if (scene) {
      this.removeFromScene(scene);
    }

    // Update text and recreate entities
    this.text = newText;
    this.createEntities();

    // Add new entities to scene if provided
    if (scene) {
      this.addToScene(scene);
    }
  }

  /**
   * Updates the position of all text entities
   * @param y - The new y coordinate
   * @param x - The new starting x coordinate
   */
  public setPosition(y: number, x: number): void {
    this.y = y;
    this.x = x;
    for (let i = 0; i < this.entities.length; i++) {
      const entity = this.entities[i];
      if (entity) {
        entity.setPosition(y, x + i);
      }
    }
  }

  /**
   * Updates the layer of all text entities
   * @param layer - The new layer value
   */
  public setLayer(layer: number): void {
    this.layer = layer;
    for (const entity of this.entities) {
      entity.setLayer(layer);
    }
  }

  /**
   * Gets the current text string
   * @returns The text string
   */
  public getText(): string {
    return this.text;
  }

  /**
   * Gets all entity objects
   * @returns Array of entities
   */
  public getEntities(): Entity[] {
    return [...this.entities];
  }

  /**
   * Gets the length of the text
   * @returns The number of characters
   */
  public getLength(): number {
    return this.text.length;
  }
}

