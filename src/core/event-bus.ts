/**
 * Event Bus System
 * Provides pub/sub pattern for decoupled communication between game components
 */

/**
 * Type for event listener callbacks
 */
type EventListener = (data?: any) => void;

/**
 * EventBus class for publish/subscribe event system
 */
export class EventBus {
  private listeners: Map<string, EventListener[]> = new Map();

  /**
   * Subscribes to an event
   * @param event - The event name to listen for
   * @param callback - Function to call when event is emitted
   * @returns An unsubscribe function to remove this listener
   */
  public on(event: string, callback: EventListener): () => void {
    // Get or create the callback array for this event
    let callbacks = this.listeners.get(event);
    if (!callbacks) {
      callbacks = [];
      this.listeners.set(event, callbacks);
    }

    // Add the callback to the array
    callbacks.push(callback);

    // Return an unsubscribe function
    return () => {
      const currentCallbacks = this.listeners.get(event);
      if (!currentCallbacks) {
        return;
      }

      const index = currentCallbacks.indexOf(callback);
      if (index !== -1) {
        currentCallbacks.splice(index, 1);
      }

      // If the array is now empty, remove the event from the map
      if (currentCallbacks.length === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Subscribes to an event for a single emission (auto-unsubscribes after first call)
   * @param event - The event name to listen for
   * @param callback - Function to call when event is emitted
   * @returns An unsubscribe function to remove this listener
   */
  public once(event: string, callback: EventListener): () => void {
    const wrappedCallback: EventListener = (data?: any) => {
      callback(data);
      unsubscribe();
    };

    const unsubscribe = this.on(event, wrappedCallback);
    return unsubscribe;
  }

  /**
   * Emits an event to all subscribed listeners
   * @param event - The event name to emit
   * @param data - Optional data to pass to listeners
   */
  public emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) {
      return;
    }

    // Call each listener with the data
    for (const callback of callbacks) {
      callback(data);
    }
  }

  /**
   * Removes all listeners for a specific event
   * @param event - The event name to clear
   * @returns True if listeners were removed, false if event had no listeners
   */
  public off(event: string): boolean {
    return this.listeners.delete(event);
  }

  /**
   * Removes all listeners for all events
   */
  public clear(): void {
    this.listeners.clear();
  }

  /**
   * Gets the count of listeners for a specific event
   * @param event - The event name to check
   * @returns The number of listeners for this event
   */
  public getListenerCount(event: string): number {
    const callbacks = this.listeners.get(event);
    return callbacks ? callbacks.length : 0;
  }

  /**
   * Gets all event names that have listeners
   * @returns Array of event names
   */
  public getEventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Checks if an event has any listeners
   * @param event - The event name to check
   * @returns True if the event has listeners, false otherwise
   */
  public hasListeners(event: string): boolean {
    const callbacks = this.listeners.get(event);
    return callbacks !== undefined && callbacks.length > 0;
  }
}

/**
 * Global event bus instance for application-wide events
 */
export const globalEventBus = new EventBus();

