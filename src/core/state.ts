/**
 * Generic state management class for storing and retrieving typed values
 */
export class State {
  // Store any type of value with string keys
  private state: {
    [key: string]: unknown;
  };

  constructor() {
    this.state = {};
  }

  /**
   * Set a state value with any type
   */
  public setState<T>(name: string, property: T): void {
    this.state[name] = property;
  }

  /**
   * Get a state value with type safety
   */
  public getState<T>(name: string): T | undefined {
    return this.state[name] as T | undefined;
  }

  /**
   * Check if a state value equals "true" (legacy boolean check)
   */
  public getStateAsBoolean(name: string): boolean {
    return this.state[name] === "true";
  }

  /**
   * Check if a state key exists
   */
  public hasState(name: string): boolean {
    return name in this.state;
  }

  /**
   * Clear all state values
   */
  public clearState(): void {
    this.state = {};
  }

  /**
   * Clear a specific state value
   */
  public removeState(name: string): void {
    delete this.state[name];
  }
}