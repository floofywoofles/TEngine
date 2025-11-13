/**
 * Flags type - Represents custom properties/flags for entities
 * Allows entities to have dynamic properties like "solid", "collectible", etc.
 */

/**
 * Flags type for entity custom properties
 * Maps string keys to values (number, boolean, or string)
 * Used to mark entities with special properties (e.g., "solid": true)
 */
export type Flags = {
    [key: string]: number | boolean | string
}
