/**
 * Board rendering utilities for Tic-Tac-Toe
 */
import { Entity } from "../../core/entity";
import { Scene } from "../../core/scene";

/**
 * Convert board indices (0-2, 0-2) to visual coordinates
 */
export const boardIndicesToCoords = (row: number, col: number): { row: number; col: number } => {
    const visualRows = [0, 2, 4];
    const visualCols = [0, 2, 4];
    return {
        row: visualRows[row] || 0,
        col: visualCols[col] || 0
    };
};

/**
 * Draw the tic-tac-toe board grid
 */
export const drawBoard = (scene: Scene): Entity[] => {
    const gridEntities: Entity[] = [];
    
    // Draw grid with proper intersections
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            let sprite = " ";

            // Check if this is a grid line position
            const isHorizontalLine = (row === 1 || row === 3);
            const isVerticalLine = (col === 1 || col === 3);

            if (isHorizontalLine && isVerticalLine) {
                // Intersection - use +
                sprite = "+";
            } else if (isHorizontalLine) {
                // Horizontal line
                sprite = "-";
            } else if (isVerticalLine) {
                // Vertical line
                sprite = "|";
            }

            // Only create entity if it's part of the grid
            if (sprite !== " ") {
                const gridEntity = new Entity(row, col, sprite);
                scene.addEntity(gridEntity);
                gridEntities.push(gridEntity);
            }
        }
    }
    
    return gridEntities;
};

