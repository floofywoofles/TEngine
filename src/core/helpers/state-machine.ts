/**
 * State Machine System
 * Provides a flexible state machine implementation for game states, entity states, and AI behavior
 */

/**
 * State transition callback
 * @param fromState - The state being transitioned from
 * @param toState - The state being transitioned to
 * @param data - Optional data passed during transition
 */
type StateTransitionCallback = (fromState: string, toState: string, data?: any) => void;

/**
 * State update callback
 * @param deltaTime - Time elapsed since last update
 * @param data - Optional state data
 */
type StateUpdateCallback = (deltaTime: number, data?: any) => void;

/**
 * State entry callback
 * @param fromState - The previous state
 * @param data - Optional data passed during transition
 */
type StateEntryCallback = (fromState: string | null, data?: any) => void;

/**
 * State exit callback
 * @param toState - The next state
 * @param data - Optional data passed during transition
 */
type StateExitCallback = (toState: string, data?: any) => void;

/**
 * Configuration for a state
 */
type StateConfig = {
  /** Called when entering this state */
  onEnter?: StateEntryCallback;
  /** Called each frame while in this state */
  onUpdate?: StateUpdateCallback;
  /** Called when exiting this state */
  onExit?: StateExitCallback;
  /** Optional data associated with this state */
  data?: any;
};

/**
 * StateMachine class for managing state transitions
 */
export class StateMachine {
  private states: Map<string, StateConfig> = new Map();
  private currentState: string | null = null;
  private previousState: string | null = null;
  private transitions: Map<string, Set<string>> = new Map();
  private onTransitionCallback: StateTransitionCallback | null = null;
  private stateData: Map<string, any> = new Map();
  private isInitialized: boolean = false;

  /**
   * Creates a new StateMachine
   * @param initialState - Optional initial state name
   */
  constructor(initialState?: string) {
    if (initialState) {
      this.currentState = initialState;
      this.isInitialized = true;
    }
  }

  /**
   * Adds a state to the state machine
   * @param name - The name of the state
   * @param config - State configuration
   */
  public addState(name: string, config: StateConfig = {}): void {
    this.states.set(name, config);
    
    // Initialize state data if provided
    if (config.data !== undefined) {
      this.stateData.set(name, config.data);
    }

    // If this is the first state and no initial state was set, make it the initial state
    if (!this.isInitialized && this.states.size === 1) {
      this.currentState = name;
      this.isInitialized = true;
    }
  }

  /**
   * Removes a state from the state machine
   * @param name - The name of the state to remove
   */
  public removeState(name: string): void {
    this.states.delete(name);
    this.stateData.delete(name);
    this.transitions.delete(name);

    // Remove transitions to this state
    for (const [fromState, toStates] of this.transitions.entries()) {
      toStates.delete(name);
    }

    // If removing current state, reset
    if (this.currentState === name) {
      this.currentState = null;
      this.isInitialized = false;
    }
  }

  /**
   * Adds a transition from one state to another
   * @param fromState - The source state
   * @param toState - The destination state
   */
  public addTransition(fromState: string, toState: string): void {
    if (!this.transitions.has(fromState)) {
      this.transitions.set(fromState, new Set());
    }
    this.transitions.get(fromState)!.add(toState);
  }

  /**
   * Adds bidirectional transition between two states
   * @param state1 - First state
   * @param state2 - Second state
   */
  public addBidirectionalTransition(state1: string, state2: string): void {
    this.addTransition(state1, state2);
    this.addTransition(state2, state1);
  }

  /**
   * Removes a transition
   * @param fromState - The source state
   * @param toState - The destination state
   */
  public removeTransition(fromState: string, toState: string): void {
    const toStates = this.transitions.get(fromState);
    if (toStates) {
      toStates.delete(toState);
    }
  }

  /**
   * Checks if a transition is allowed
   * @param fromState - The source state
   * @param toState - The destination state
   * @returns True if transition is allowed
   */
  public canTransition(fromState: string, toState: string): boolean {
    const toStates = this.transitions.get(fromState);
    return toStates ? toStates.has(toState) : false;
  }

  /**
   * Transitions to a new state
   * @param newState - The state to transition to
   * @param data - Optional data to pass during transition
   * @returns True if transition was successful
   */
  public transitionTo(newState: string, data?: any): boolean {
    // Check if state exists
    if (!this.states.has(newState)) {
      console.warn(`StateMachine: State '${newState}' does not exist`);
      return false;
    }

    // If no current state, just set it (first state)
    if (this.currentState === null) {
      this.currentState = newState;
      const stateConfig = this.states.get(newState);
      if (stateConfig?.onEnter) {
        stateConfig.onEnter(null, data);
      }
      return true;
    }

    // Check if transition is allowed
    if (this.transitions.has(this.currentState)) {
      const allowedTransitions = this.transitions.get(this.currentState)!;
      if (!allowedTransitions.has(newState)) {
        console.warn(
          `StateMachine: Transition from '${this.currentState}' to '${newState}' is not allowed`
        );
        return false;
      }
    }

    // Exit current state
    const currentStateConfig = this.states.get(this.currentState);
    if (currentStateConfig?.onExit) {
      currentStateConfig.onExit(newState, data);
    }

    // Update states
    this.previousState = this.currentState;
    this.currentState = newState;

    // Call transition callback
    if (this.onTransitionCallback) {
      this.onTransitionCallback(this.previousState, newState, data);
    }

    // Enter new state
    const newStateConfig = this.states.get(newState);
    if (newStateConfig?.onEnter) {
      newStateConfig.onEnter(this.previousState, data);
    }

    return true;
  }

  /**
   * Forces a transition without checking if it's allowed
   * @param newState - The state to transition to
   * @param data - Optional data to pass during transition
   */
  public forceTransitionTo(newState: string, data?: any): void {
    if (!this.states.has(newState)) {
      console.warn(`StateMachine: State '${newState}' does not exist`);
      return;
    }

    // Exit current state
    if (this.currentState) {
      const currentStateConfig = this.states.get(this.currentState);
      if (currentStateConfig?.onExit) {
        currentStateConfig.onExit(newState, data);
      }
    }

    // Update states
    this.previousState = this.currentState;
    this.currentState = newState;

    // Call transition callback
    if (this.onTransitionCallback) {
      this.onTransitionCallback(this.previousState || "", newState, data);
    }

    // Enter new state
    const newStateConfig = this.states.get(newState);
    if (newStateConfig?.onEnter) {
      newStateConfig.onEnter(this.previousState, data);
    }
  }

  /**
   * Updates the current state
   * @param deltaTime - Time elapsed since last update
   */
  public update(deltaTime: number): void {
    if (this.currentState === null) {
      return;
    }

    const stateConfig = this.states.get(this.currentState);
    if (stateConfig?.onUpdate) {
      const stateData = this.stateData.get(this.currentState);
      stateConfig.onUpdate(deltaTime, stateData);
    }
  }

  /**
   * Gets the current state name
   * @returns The current state name, or null if no state
   */
  public getCurrentState(): string | null {
    return this.currentState;
  }

  /**
   * Gets the previous state name
   * @returns The previous state name, or null if no previous state
   */
  public getPreviousState(): string | null {
    return this.previousState;
  }

  /**
   * Checks if the machine is in a specific state
   * @param stateName - The state name to check
   * @returns True if currently in that state
   */
  public isInState(stateName: string): boolean {
    return this.currentState === stateName;
  }

  /**
   * Sets a callback to be called on every state transition
   * @param callback - The callback function
   */
  public onTransition(callback: StateTransitionCallback): void {
    this.onTransitionCallback = callback;
  }

  /**
   * Gets data associated with a state
   * @param stateName - The state name
   * @returns The state data, or undefined if not set
   */
  public getStateData(stateName: string): any {
    return this.stateData.get(stateName);
  }

  /**
   * Sets data for a state
   * @param stateName - The state name
   * @param data - The data to set
   */
  public setStateData(stateName: string, data: any): void {
    this.stateData.set(stateName, data);
  }

  /**
   * Gets all state names
   * @returns Array of all state names
   */
  public getStateNames(): string[] {
    return Array.from(this.states.keys());
  }

  /**
   * Gets all allowed transitions from a state
   * @param stateName - The state name
   * @returns Array of state names that can be transitioned to
   */
  public getTransitionsFrom(stateName: string): string[] {
    const transitions = this.transitions.get(stateName);
    return transitions ? Array.from(transitions) : [];
  }

  /**
   * Resets the state machine to its initial state
   */
  public reset(): void {
    if (this.currentState) {
      const currentStateConfig = this.states.get(this.currentState);
      if (currentStateConfig?.onExit) {
        currentStateConfig.onExit("", undefined);
      }
    }

    this.previousState = null;
    this.currentState = this.getStateNames()[0] || null;

    if (this.currentState) {
      const stateConfig = this.states.get(this.currentState);
      if (stateConfig?.onEnter) {
        stateConfig.onEnter(null, undefined);
      }
    }
  }

  /**
   * Clears all states and transitions
   */
  public clear(): void {
    this.states.clear();
    this.transitions.clear();
    this.stateData.clear();
    this.currentState = null;
    this.previousState = null;
    this.onTransitionCallback = null;
    this.isInitialized = false;
  }
}

