/**
 * Board rendering utilities for Tic-Tac-Toe
 */
import type { CursorPosition } from "./types";
import { Entity } from "../../core/entity";
import { Scene } from "../../core/scene";

// Visual grid dimension (including grid lines)
const GRID_VIEWPORT_SIZE: number = 5;

// Board cell spacing in visual coordinates
const CELL_SPACING: number = 2;

// Grid line positions (rows and columns where grid lines appear)
const GRID_LINE_POSITIONS: number[] = [1, 3];

// Visual coordinate mappings for each board cell (0, 1, 2)
const VISUAL_COORDS: number[] = [0, 2, 4];

// Grid characters
const HORIZONTAL_LINE: string = "-";
const VERTICAL_LINE: string = "|";
const INTERSECTION: string = "+";
const EMPTY_SPACE: string = " ";

/**
 * Convert board indices (0-2, 0-2) to visual coordinates
 */
export const boardIndicesToCoords = (row: number, col: number): CursorPosition => {
  return {
    row: VISUAL_COORDS[row] ?? 0,
    col: VISUAL_COORDS[col] ?? 0,
  };
};

/**
 * Check if a position is a horizontal grid line
 */
const isHorizontalLine = (row: number): boolean => GRID_LINE_POSITIONS.includes(row);

/**
 * Check if a position is a vertical grid line
 */
const isVerticalLine = (col: number): boolean => GRID_LINE_POSITIONS.includes(col);

/**
 * Get the sprite character for a grid position
 */
const getGridSprite = (row: number, col: number): string => {
  const isHorizontal = isHorizontalLine(row);
  const isVertical = isVerticalLine(col);
  if (isHorizontal && isVertical) return INTERSECTION;
  if (isHorizontal) return HORIZONTAL_LINE;
  if (isVertical) return VERTICAL_LINE;
  return EMPTY_SPACE;
};

/**
 * Draw the tic-tac-toe board grid
 */
export const drawBoard = (scene: Scene): Entity[] => {
  const gridEntities: Entity[] = [];
  for (let row = 0; row < GRID_VIEWPORT_SIZE; row++) {
    for (let col = 0; col < GRID_VIEWPORT_SIZE; col++) {
      const sprite = getGridSprite(row, col);
      if (sprite !== EMPTY_SPACE) {
        const gridEntity = new Entity(row, col, sprite);
        scene.addEntity(gridEntity);
        gridEntities.push(gridEntity);
      }
    }
  }
  return gridEntities;
};

