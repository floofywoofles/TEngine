/**
 * Keyboard input system for TEngine
 * Provides a singleton Input object to manage keyboard event listeners from stdin
 */

/**
 * Payload object passed to key event callbacks
 */
type KeyEventPayload = {
  /** The normalized key string (lowercase, trimmed) */
  key: string;
  /** True if key is pressed down, false if released */
  isDown: boolean;
  /** The original raw input data */
  originalEvent: Buffer | string;
};

/**
 * Callback function type for key event listeners
 */
type KeyCallback = (payload: KeyEventPayload) => void;

/**
 * Normalizes a key string to a consistent format for reliable matching
 * @param key - The raw key string to normalize
 * @returns The normalized key string (lowercase, trimmed, with special mappings)
 */
const normalizeKey = (key: string): string => {
  // Trim whitespace and convert to lowercase
  const normalized = key.trim().toLowerCase();
  
  // Map special keys to canonical names
  if (normalized === " " || normalized === "spacebar") {
    return "space";
  }
  
  return normalized;
};

/**
 * Parses raw stdin data into a key string
 * @param data - The raw buffer or string from stdin
 * @returns The parsed key string
 */
const parseStdinKey = (data: Buffer | string): string => {
  // Convert buffer to string if needed
  const str = data.toString();
  
  // Map special escape sequences to key names
  // Arrow keys and other special keys send ANSI escape sequences
  if (str === '\x1b[A') return 'ArrowUp';
  if (str === '\x1b[B') return 'ArrowDown';
  if (str === '\x1b[C') return 'ArrowRight';
  if (str === '\x1b[D') return 'ArrowLeft';
  if (str === '\r' || str === '\n') return 'Enter';
  if (str === '\x7f' || str === '\x08') return 'Backspace';
  if (str === '\t') return 'Tab';
  if (str === '\x1b') return 'Escape';
  
  // For regular characters, return as-is
  return str;
};

/**
 * Input singleton class for managing keyboard events from stdin
 */
class InputManager {
  /** Flag indicating whether the input system is currently active */
  private isStarted: boolean = false;
  
  /** Map of normalized keys to their registered callback arrays */
  private keyListeners: Map<string, KeyCallback[]> = new Map();
  
  /** Set of currently pressed keys (normalized) */
  private pressedKeys: Set<string> = new Set();
  
  /** Reference to the stdin data handler for cleanup */
  private dataHandler: ((data: Buffer) => void) | null = null;
  
  /** Original stdin settings to restore on stop */
  private originalStdinMode: boolean = false;

  /**
   * Handles stdin data events (key presses)
   * @param data - The raw data from stdin
   */
  private handleStdinData(data: Buffer): void {
    // Parse the raw stdin data into a key string
    const keyString = parseStdinKey(data);
    
    // Normalize the key
    const normalizedKey = normalizeKey(keyString);
    
    // For stdin, we only get keypress events, not separate down/up events
    // We'll simulate a keydown followed by keyup
    // First, fire the keydown event
    this.fireKeyEvent(normalizedKey, true, data);
    
    // Then immediately fire the keyup event
    // In a real terminal, keys are pressed and released quickly
    this.fireKeyEvent(normalizedKey, false, data);
  }

  /**
   * Fires a key event to all registered listeners
   * @param normalizedKey - The normalized key string
   * @param isDown - True for keydown, false for keyup
   * @param originalData - The original stdin data
   */
  private fireKeyEvent(normalizedKey: string, isDown: boolean, originalData: Buffer | string): void {
    // Update the pressed keys set
    if (isDown) {
      this.pressedKeys.add(normalizedKey);
    } else {
      this.pressedKeys.delete(normalizedKey);
    }
    
    // Get the callbacks registered for this key
    const callbacks = this.keyListeners.get(normalizedKey);
    
    // If no callbacks are registered for this key, return early
    if (!callbacks || callbacks.length === 0) {
      return;
    }
    
    // Construct the payload object
    const payload: KeyEventPayload = {
      key: normalizedKey,
      isDown,
      originalEvent: originalData,
    };
    
    // Call each registered callback with the payload
    for (const callback of callbacks) {
      callback(payload);
    }
  }

  /**
   * Starts the input system and begins listening for keyboard events from stdin
   * Safe to call multiple times - will only attach listeners once
   */
  public start(): void {
    // If already started, return early
    if (this.isStarted) {
      return;
    }
    
    // Check if stdin is available
    if (!process.stdin) {
      console.warn("Input.start() called but process.stdin is not available.");
      return;
    }
    
    // Mark as started
    this.isStarted = true;
    
    // Save the original stdin mode
    this.originalStdinMode = process.stdin.isRaw || false;
    
    // Set stdin to raw mode to capture individual keypresses
    // Raw mode means input is not buffered and special keys are captured
    process.stdin.setRawMode(true);
    
    // Resume stdin (it starts paused)
    process.stdin.resume();
    
    // Set encoding to handle the data as a buffer
    process.stdin.setEncoding('utf8');
    
    // Create and store the data handler
    this.dataHandler = (data: Buffer) => {
      this.handleStdinData(data);
    };
    
    // Attach the data listener to stdin
    process.stdin.on('data', this.dataHandler);
  }

  /**
   * Stops the input system and removes all stdin event listeners
   * Safe to call multiple times - will only detach listeners if started
   */
  public stop(): void {
    // If not started, return early
    if (!this.isStarted) {
      return;
    }
    
    // Check if stdin is available
    if (!process.stdin) {
      return;
    }
    
    // Remove the data listener from stdin
    if (this.dataHandler) {
      process.stdin.off('data', this.dataHandler);
      this.dataHandler = null;
    }
    
    // Restore the original stdin mode
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(this.originalStdinMode);
    }
    
    // Pause stdin to stop receiving data
    process.stdin.pause();
    
    // Clear the pressed keys set
    this.pressedKeys.clear();
    
    // Mark as stopped
    this.isStarted = false;
  }

  /**
   * Registers a callback to be called when a specific key is pressed or released
   * @param key - The key to listen for (case-insensitive, will be normalized)
   * @param callback - Function to call when the key event occurs
   * @returns An unsubscribe function to remove this specific listener
   */
  public onKey(key: string, callback: KeyCallback): () => void {
    // Normalize the provided key
    const normalizedKey = normalizeKey(key);
    
    // Get or create the callback array for this key
    let callbacks = this.keyListeners.get(normalizedKey);
    if (!callbacks) {
      callbacks = [];
      this.keyListeners.set(normalizedKey, callbacks);
    }
    
    // Add the callback to the array
    callbacks.push(callback);
    
    // Return an unsubscribe function
    return () => {
      // Get the current callback array
      const currentCallbacks = this.keyListeners.get(normalizedKey);
      if (!currentCallbacks) {
        return;
      }
      
      // Find and remove this specific callback
      const index = currentCallbacks.indexOf(callback);
      if (index !== -1) {
        currentCallbacks.splice(index, 1);
      }
      
      // If the array is now empty, remove the key from the map
      if (currentCallbacks.length === 0) {
        this.keyListeners.delete(normalizedKey);
      }
    };
  }

  /**
   * Checks if a specific key is currently pressed
   * @param key - The key to check (case-insensitive, will be normalized)
   * @returns True if the key is currently pressed, false otherwise
   */
  public isKeyDown(key: string): boolean {
    const normalizedKey = normalizeKey(key);
    return this.pressedKeys.has(normalizedKey);
  }

  /**
   * Gets an array of all currently pressed keys
   * @returns Array of normalized key strings that are currently pressed
   */
  public getKeysDown(): string[] {
    return Array.from(this.pressedKeys);
  }

  /**
   * Checks if any keys are currently pressed
   * @returns True if at least one key is pressed, false otherwise
   */
  public hasAnyKeyDown(): boolean {
    return this.pressedKeys.size > 0;
  }

  /**
   * Gets the count of currently pressed keys
   * @returns The number of keys currently pressed
   */
  public getPressedKeyCount(): number {
    return this.pressedKeys.size;
  }
}

/**
 * Singleton instance of the Input system
 * Use this to manage keyboard input from stdin in your application
 * 
 * @example
 * // Start listening for keyboard events from stdin
 * Input.start();
 * 
 * // Register a listener for the 'w' key
 * const unsubscribe = Input.onKey('w', ({ key, isDown, originalEvent }) => {
 *   if (isDown) {
 *     console.log('W key pressed!');
 *   } else {
 *     console.log('W key released!');
 *   }
 * });
 * 
 * // Later, remove the listener
 * unsubscribe();
 * 
 * // Stop listening for keyboard events and restore stdin
 * Input.stop();
 */
export const Input = new InputManager();

