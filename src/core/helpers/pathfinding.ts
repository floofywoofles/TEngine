/**
 * A* Pathfinding Algorithm Helper
 * Provides pathfinding utilities for grid-based movement in TEngine
 */

import type { Point } from "../../types/point";
import type { Scene } from "../scene";
import type { Entity } from "../entity/entity";

/**
 * Represents a node in the pathfinding grid
 */
class PathNode {
  public position: Point;
  public g: number = 0; // Cost from start to this node
  public h: number = 0; // Heuristic cost from this node to goal
  public f: number = 0; // Total cost (g + h)
  public parent: PathNode | null = null;

  constructor(position: Point) {
    this.position = position;
  }
}

/**
 * Heuristic function types for A* algorithm
 */
export enum Heuristic {
  /** Manhattan distance (4-directional movement) */
  Manhattan = "manhattan",
  /** Euclidean distance (diagonal movement allowed) */
  Euclidean = "euclidean",
  /** Chebyshev distance (8-directional movement) */
  Chebyshev = "chebyshev",
  /** Octile distance (diagonal movement with different cost) */
  Octile = "octile",
}

/**
 * Pathfinding options
 */
export type PathfindingOptions = {
  /** Allow diagonal movement (default: false) */
  allowDiagonal?: boolean;
  /** Heuristic function to use (default: Manhattan) */
  heuristic?: Heuristic;
  /** Maximum search iterations before giving up (default: 1000) */
  maxIterations?: number;
  /** Cost of diagonal movement (default: 1.414) */
  diagonalCost?: number;
  /** Custom walkability check function */
  isWalkable?: (y: number, x: number) => boolean;
};

/**
 * PathfindingHelper class with A* algorithm implementation
 */
export class PathfindingHelper {
  /**
   * Finds a path from start to goal using A* algorithm
   * @param start - Starting position
   * @param goal - Goal position
   * @param width - Grid width
   * @param height - Grid height
   * @param options - Pathfinding options
   * @returns Array of points representing the path, or null if no path found
   */
  public static findPath(
    start: Point,
    goal: Point,
    width: number,
    height: number,
    options: PathfindingOptions = {}
  ): Point[] | null {
    // Set default options
    const allowDiagonal = options.allowDiagonal ?? false;
    const heuristic = options.heuristic ?? Heuristic.Manhattan;
    const maxIterations = options.maxIterations ?? 1000;
    const diagonalCost = options.diagonalCost ?? 1.414;
    const isWalkable = options.isWalkable ?? (() => true);

    // Validate start and goal
    if (!this.isInBounds(start, width, height) || !this.isInBounds(goal, width, height)) {
      return null;
    }

    if (!isWalkable(start.y, start.x) || !isWalkable(goal.y, goal.x)) {
      return null;
    }

    // If start equals goal, return empty path
    if (start.y === goal.y && start.x === goal.x) {
      return [start];
    }

    // Initialize open and closed sets
    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();
    const startNode = new PathNode(start);
    startNode.h = this.calculateHeuristic(start, goal, heuristic);
    startNode.f = startNode.h;
    openSet.push(startNode);

    let iterations = 0;

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;

      // Get node with lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;

      // Check if we reached the goal
      if (current.position.y === goal.y && current.position.x === goal.x) {
        return this.reconstructPath(current);
      }

      // Add to closed set
      const currentKey = this.getNodeKey(current.position);
      closedSet.add(currentKey);

      // Get neighbors
      const neighbors = this.getNeighbors(
        current.position,
        width,
        height,
        allowDiagonal,
        isWalkable
      );

      for (const neighborPos of neighbors) {
        const neighborKey = this.getNodeKey(neighborPos);

        // Skip if in closed set
        if (closedSet.has(neighborKey)) {
          continue;
        }

        // Calculate movement cost
        const isDiagonal =
          neighborPos.y !== current.position.y && neighborPos.x !== current.position.x;
        const movementCost = isDiagonal ? diagonalCost : 1;
        const tentativeG = current.g + movementCost;

        // Find neighbor in open set
        let neighbor = openSet.find(
          (n) => n.position.y === neighborPos.y && n.position.x === neighborPos.x
        );

        if (!neighbor) {
          // New node
          neighbor = new PathNode(neighborPos);
          neighbor.g = tentativeG;
          neighbor.h = this.calculateHeuristic(neighborPos, goal, heuristic);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          openSet.push(neighbor);
        } else if (tentativeG < neighbor.g) {
          // Better path found
          neighbor.g = tentativeG;
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
        }
      }
    }

    // No path found
    return null;
  }

  /**
   * Finds a path in a scene, considering entities as obstacles
   * @param start - Starting position
   * @param goal - Goal position
   * @param scene - The scene to pathfind in
   * @param options - Pathfinding options
   * @returns Array of points representing the path, or null if no path found
   */
  public static findPathInScene(
    start: Point,
    goal: Point,
    scene: Scene,
    options: PathfindingOptions = {}
  ): Point[] | null {
    const resolution = scene.getResolution();

    // Create walkability function that checks for entities
    const isWalkable = (y: number, x: number): boolean => {
      // Check custom walkability function if provided
      if (options.isWalkable && !options.isWalkable(y, x)) {
        return false;
      }

      // Check if any entities block this position
      const entities = scene.getEntitiesAtPosition(y, x);
      return entities.length === 0;
    };

    return this.findPath(start, goal, resolution.width, resolution.height, {
      ...options,
      isWalkable,
    });
  }

  /**
   * Finds a path avoiding specific entities
   * @param start - Starting position
   * @param goal - Goal position
   * @param scene - The scene to pathfind in
   * @param obstacles - Array of entities to treat as obstacles
   * @param options - Pathfinding options
   * @returns Array of points representing the path, or null if no path found
   */
  public static findPathAvoidingEntities(
    start: Point,
    goal: Point,
    scene: Scene,
    obstacles: Entity[],
    options: PathfindingOptions = {}
  ): Point[] | null {
    const resolution = scene.getResolution();
    const obstacleSet = new Set(obstacles.map((e) => this.getNodeKey(e.getPosition())));

    const isWalkable = (y: number, x: number): boolean => {
      // Check custom walkability function if provided
      if (options.isWalkable && !options.isWalkable(y, x)) {
        return false;
      }

      // Check if this position is an obstacle
      return !obstacleSet.has(this.getNodeKey({ y, x }));
    };

    return this.findPath(start, goal, resolution.width, resolution.height, {
      ...options,
      isWalkable,
    });
  }

  /**
   * Calculates the heuristic distance between two points
   */
  private static calculateHeuristic(a: Point, b: Point, heuristic: Heuristic): number {
    const dx = Math.abs(b.x - a.x);
    const dy = Math.abs(b.y - a.y);

    switch (heuristic) {
      case Heuristic.Manhattan:
        return dx + dy;

      case Heuristic.Euclidean:
        return Math.sqrt(dx * dx + dy * dy);

      case Heuristic.Chebyshev:
        return Math.max(dx, dy);

      case Heuristic.Octile:
        // Assumes diagonal movement costs sqrt(2) ≈ 1.414
        return dx + dy + (1.414 - 2) * Math.min(dx, dy);

      default:
        return dx + dy;
    }
  }

  /**
   * Gets valid neighbors for a position
   */
  private static getNeighbors(
    position: Point,
    width: number,
    height: number,
    allowDiagonal: boolean,
    isWalkable: (y: number, x: number) => boolean
  ): Point[] {
    const neighbors: Point[] = [];
    const { y, x } = position;

    // Cardinal directions (up, right, down, left)
    const cardinalDirections = [
      { y: y - 1, x: x }, // Up
      { y: y, x: x + 1 }, // Right
      { y: y + 1, x: x }, // Down
      { y: y, x: x - 1 }, // Left
    ];

    for (const dir of cardinalDirections) {
      if (this.isInBounds(dir, width, height) && isWalkable(dir.y, dir.x)) {
        neighbors.push(dir);
      }
    }

    // Diagonal directions
    if (allowDiagonal) {
      const diagonalDirections = [
        { y: y - 1, x: x + 1 }, // Up-Right
        { y: y + 1, x: x + 1 }, // Down-Right
        { y: y + 1, x: x - 1 }, // Down-Left
        { y: y - 1, x: x - 1 }, // Up-Left
      ];

      for (const dir of diagonalDirections) {
        if (this.isInBounds(dir, width, height) && isWalkable(dir.y, dir.x)) {
          // Optional: Check if diagonal movement is blocked by adjacent walls
          const verticalClear = isWalkable(dir.y, x);
          const horizontalClear = isWalkable(y, dir.x);

          if (verticalClear || horizontalClear) {
            neighbors.push(dir);
          }
        }
      }
    }

    return neighbors;
  }

  /**
   * Reconstructs the path from goal to start
   */
  private static reconstructPath(node: PathNode): Point[] {
    const path: Point[] = [];
    let current: PathNode | null = node;

    while (current !== null) {
      path.unshift(current.position);
      current = current.parent;
    }

    return path;
  }

  /**
   * Checks if a position is within bounds
   */
  private static isInBounds(position: Point, width: number, height: number): boolean {
    return position.y >= 0 && position.y < height && position.x >= 0 && position.x < width;
  }

  /**
   * Gets a unique key for a position
   */
  private static getNodeKey(position: Point): string {
    return `${position.y},${position.x}`;
  }

  /**
   * Smooths a path by removing unnecessary waypoints
   * @param path - The path to smooth
   * @param isWalkable - Function to check if a position is walkable
   * @returns Smoothed path
   */
  public static smoothPath(
    path: Point[],
    isWalkable: (y: number, x: number) => boolean
  ): Point[] {
    if (path.length <= 2) {
      return path;
    }

    const smoothed: Point[] = [path[0]!];
    let currentIndex = 0;

    while (currentIndex < path.length - 1) {
      let farthestIndex = currentIndex + 1;

      // Try to find the farthest point we can reach directly
      for (let i = currentIndex + 2; i < path.length; i++) {
        if (this.hasLineOfSight(path[currentIndex]!, path[i]!, isWalkable)) {
          farthestIndex = i;
        } else {
          break;
        }
      }

      smoothed.push(path[farthestIndex]!);
      currentIndex = farthestIndex;
    }

    return smoothed;
  }

  /**
   * Checks if there's a clear line of sight between two points
   */
  private static hasLineOfSight(
    start: Point,
    end: Point,
    isWalkable: (y: number, x: number) => boolean
  ): boolean {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    if (steps === 0) return true;

    const stepX = dx / steps;
    const stepY = dy / steps;

    for (let i = 0; i <= steps; i++) {
      const x = Math.round(start.x + stepX * i);
      const y = Math.round(start.y + stepY * i);

      if (!isWalkable(y, x)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the next step in a path
   * @param path - The full path
   * @param currentPosition - Current position
   * @returns The next position to move to, or null if at goal
   */
  public static getNextStep(path: Point[], currentPosition: Point): Point | null {
    if (path.length === 0) {
      return null;
    }

    // Find current position in path
    const currentIndex = path.findIndex(
      (p) => p.y === currentPosition.y && p.x === currentPosition.x
    );

    if (currentIndex === -1) {
      // Not on path, return first step
      return path[0]!;
    }

    if (currentIndex >= path.length - 1) {
      // At goal
      return null;
    }

    // Return next step
    return path[currentIndex + 1]!;
  }
}

