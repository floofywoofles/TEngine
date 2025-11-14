/** 
 * Coin collector example game setup
 * Uses the core engine to create a simple game where the player collects coins
 */
import { Global } from "../core/global";
import { Scene } from "../core/scene";
import { Entity } from "../core/entity";
import { Camera } from "../core/camera";
import { Input } from "../core/input";
import { State } from "../core/state";

// GameEntities defines a structure holding references to the player and all coins in the game
type GameEntities = {
  readonly player: Entity;
  readonly coins: readonly Entity[];
};

// GameConfig defines the static game configuration such as entity sprites, viewport size, and map size
type GameConfig = {
  readonly playerSprite: string;
  readonly coinSprite: string;
  readonly viewportHeight: number;
  readonly viewportWidth: number;
  readonly sceneWidth: number;
  readonly sceneHeight: number;
  readonly coinsCount: number;
};

// Position represents a coordinate in the scene (y: row, x: column)
type Position = {
  readonly y: number;
  readonly x: number;
};

// Game constants
const COIN_COLLECTOR_SCENE_NAME: string = "coin-collector-scene";
// Initial player position
const PLAYER_INITIAL_Y: number = 0;
const PLAYER_INITIAL_X: number = 0;

// Movement deltas for 'up', 'down', 'left', 'right'
const MOVE_UP_DELTA_Y: number = -1;
const MOVE_UP_DELTA_X: number = 0;
const MOVE_DOWN_DELTA_Y: number = 1;
const MOVE_DOWN_DELTA_X: number = 0;
const MOVE_LEFT_DELTA_Y: number = 0;
const MOVE_LEFT_DELTA_X: number = -1;
const MOVE_RIGHT_DELTA_Y: number = 0;
const MOVE_RIGHT_DELTA_X: number = 1;

// Keyboard controls for movement and quitting
const QUIT_KEY: string = "q";
const UP_KEY: string = "w";
const DOWN_KEY: string = "s";
const LEFT_KEY: string = "a";
const RIGHT_KEY: string = "d";

// State key for storing the player score
const SCORE_STATE_KEY: string = "score";
// How frequently the main game loop runs (in ms)
const FRAME_INTERVAL_MS: number = 100;

/** 
 * Polyfill process.stdin.setRawMode for environments where it is not available (makes keypresses work instantly in CLI)
 */
const polyfillSetRawMode = (): void => {
  const stdin: unknown = process.stdin;
  const typedStdin: { setRawMode?: (mode: boolean) => void } = stdin as { setRawMode?: (mode: boolean) => void };
  // If setRawMode exists, nothing to do
  if (typeof typedStdin.setRawMode === "function") {
    return;
  }
  // Otherwise, stub out setRawMode with a no-op
  const extendedStdin: { setRawMode: (mode: boolean) => void } = stdin as { setRawMode: (mode: boolean) => void };
  extendedStdin.setRawMode = (): void => {};
};

/** 
 * Creates and returns the fixed configuration for the coin collector game
 */
const createGameConfig = (): GameConfig => {
  return {
    playerSprite: "@",      // Sprite for the player
    coinSprite: "$",        // Sprite for a coin
    viewportHeight: 10,     // Height of camera/viewport in cells
    viewportWidth: 10,      // Width of camera/viewport in cells
    sceneWidth: 100,        // Scene (map) width in cells
    sceneHeight: 100,       // Scene (map) height in cells
    coinsCount: 10          // Number of coins to scatter in the level
  } as const;
};

/** 
 * Sets the initial score in state to zero
 * @param state - State object that holds key/value pairs of game state
 */
const initializeScore = (state: State): void => {
  state.setState<number>(SCORE_STATE_KEY, 0);
};

/** 
 * Retrieves the current score from the state, defaulting to 0 if not present
 * @param input.state - The state object holding game data
 * @returns The current score as { score }
 */
const getCurrentScore = (input: { readonly state: State }): { readonly score: number } => {
  const currentScore: number | undefined = input.state.getState<number>(SCORE_STATE_KEY);
  if (currentScore === undefined) {
    return {
      score: 0
    };
  }
  return {
    score: currentScore
  };
};

/** 
 * Sets the current score in the game state
 * @param input.state - State object
 * @param input.score - Score to set
 */
const setCurrentScore = (input: { readonly state: State; readonly score: number }): void => {
  input.state.setState<number>(SCORE_STATE_KEY, input.score);
};

/** 
 * Creates and registers the main scene for the game
 * @returns The Scene object instance
 */
const createScene = (): Scene => {
  const scene: Scene = new Scene(COIN_COLLECTOR_SCENE_NAME);
  Global.getScenes.addScene(scene);        // Add scene to global scenes registry
  Global.getScenes.setCurrentScene(scene); // Set active scene
  return scene;
};

/** 
 * Returns a random integer between min and max, inclusive
 * @param input.min - Minimum value
 * @param input.max - Maximum value
 * @returns Object { value } containing the random integer
 */
const generateRandomInteger = (input: { readonly min: number; readonly max: number }): { readonly value: number } => {
  const range: number = input.max - input.min + 1;
  const randomValue: number = Math.floor(Math.random() * range) + input.min;
  return {
    value: randomValue
  };
};

/** 
 * Creates and returns the player entity at the initial position, marks as player
 * @param input.config - The game configuration
 * @returns Entity representing player
 */
const createPlayer = (input: { readonly config: GameConfig }): Entity => {
  const player: Entity = new Entity(PLAYER_INITIAL_Y, PLAYER_INITIAL_X, input.config.playerSprite);
  player.setFlag("player", true); // Add metadata for type "player"
  return player;
};

/** 
 * Generates a random position in the scene (ensures valid location for coin or entity)
 * @param input.config - GameConfig providing scene size
 * @returns Position {y, x}
 */
const generateRandomPosition = (input: { readonly config: GameConfig }): Position => {
  const yValue: { readonly value: number } = generateRandomInteger({
    min: 0,
    max: input.config.sceneHeight - 1
  });
  const xValue: { readonly value: number } = generateRandomInteger({
    min: 0,
    max: input.config.sceneWidth - 1
  });
  return {
    y: yValue.value,
    x: xValue.value
  };
};

/** 
 * Checks if two positions (y/x) are equal
 * @param input.first - First position
 * @param input.second - Second position
 * @returns { equal: boolean }
 */
const arePositionsEqual = (input: { readonly first: Position; readonly second: Position }): { readonly equal: boolean } => {
  if (input.first.y !== input.second.y) {
    return {
      equal: false
    };
  }
  if (input.first.x !== input.second.x) {
    return {
      equal: false
    };
  }
  return {
    equal: true
  };
};

/** 
 * Determines if a given position contains a coin in a list of coins
 * @param input.coins - List of Entity (coins)
 * @param input.position - Position to check
 * @returns { hasCoin: boolean }
 */
const hasCoinAtPosition = (input: { readonly coins: readonly Entity[]; readonly position: Position }): { readonly hasCoin: boolean } => {
  const matchingCoin: Entity | undefined = input.coins.find((coin: Entity): boolean => {
    const coinPosition: Position = {
      y: coin.position.y,
      x: coin.position.x
    };
    const equalityResult: { readonly equal: boolean } = arePositionsEqual({
      first: coinPosition,
      second: input.position
    });
    return equalityResult.equal;
  });
  if (matchingCoin === undefined) {
    return {
      hasCoin: false
    };
  }
  return {
    hasCoin: true
  };
};

/** 
 * Places the specified number of coins randomly in the level, not colliding with the player or each other
 * @param input.config - Game configuration
 * @param input.player - Player entity
 * @param input.scene - Scene to add coin entities into
 * @returns Array of coin entities
 */
const createCoins = (input: { readonly config: GameConfig; readonly player: Entity; readonly scene: Scene }): readonly Entity[] => {
  const coins: Entity[] = [];
  const playerPosition: Position = {
    y: input.player.position.y,
    x: input.player.position.x
  };
  // Attempt to create each required coin, avoiding duplicate or initial-player overlaps
  for (let index: number = 0; index < input.config.coinsCount; index += 1) {
    let position: Position = generateRandomPosition({
      config: input.config
    });
    let collisionResult: { readonly equal: boolean } = arePositionsEqual({
      first: position,
      second: playerPosition
    });
    let coinCollisionResult: { readonly hasCoin: boolean } = hasCoinAtPosition({
      coins,
      position
    });
    // Retry until the position is not occupied by player nor another coin
    while (collisionResult.equal || coinCollisionResult.hasCoin) {
      position = generateRandomPosition({
        config: input.config
      });
      collisionResult = arePositionsEqual({
        first: position,
        second: playerPosition
      });
      coinCollisionResult = hasCoinAtPosition({
        coins,
        position
      });
    }
    // Create coin entity and add to scene
    const coin: Entity = new Entity(position.y, position.x, input.config.coinSprite);
    coin.setFlag("collectible", true);
    coins.push(coin);
    input.scene.addEntity(coin);
  }
  return coins;
};

/** 
 * Creates all major entities (player & coins), adds them to the current scene, returns them as a group
 * @param input.config - Game configuration
 * @param input.scene - Scene to which entities should be added
 * @returns GameEntities (player & coins)
 */
const createGameEntities = (input: { readonly config: GameConfig; readonly scene: Scene }): GameEntities => {
  const player: Entity = createPlayer({
    config: input.config
  });
  input.scene.addEntity(player);
  const coins: readonly Entity[] = createCoins({
    config: input.config,
    player,
    scene: input.scene
  });
  return {
    player,
    coins
  };
};

/** 
 * Creates a new camera/viewport for rendering a section of the scene
 * @param input.config - Game configuration (for viewport dimensions)
 * @returns Camera object instance
 */
const createCamera = (input: { readonly config: GameConfig }): Camera => {
  const camera: Camera = new Camera(
    0,
    0,
    input.config.viewportHeight,
    input.config.viewportWidth
  );
  return camera;
};

/** 
 * Computes the next position for a moving entity, ensuring it remains within scene bounds
 * @param input.current - Current Position {y, x}
 * @param input.delta - Requested movement delta {y, x}
 * @param input.config - Game configuration (scene size)
 * @returns Object with .next (the candidate Position)
 */
const calculateNextPosition = (input: { readonly current: Position; readonly delta: Position; readonly config: GameConfig }): { readonly next: Position } => {
  let nextY: number = input.current.y + input.delta.y;
  let nextX: number = input.current.x + input.delta.x;
  // Clamp Y to minimum/maximum bounds
  if (nextY < 0) {
    nextY = 0;
  }
  if (nextY >= input.config.sceneHeight) {
    nextY = input.config.sceneHeight - 1;
  }
  // Clamp X to minimum/maximum bounds
  if (nextX < 0) {
    nextX = 0;
  }
  if (nextX >= input.config.sceneWidth) {
    nextX = input.config.sceneWidth - 1;
  }
  return {
    next: {
      y: nextY,
      x: nextX
    }
  };
};

/** 
 * Calculates a camera position that follows the player, ensuring camera stays within scene bounds
 * @param input.playerPosition - The player's current Position
 * @param input.config - GameConfig (for scene & viewport size)
 * @returns Object with .cameraPosition to apply to the Camera
 */
const calculateCameraPositionForPlayer = (input: { readonly playerPosition: Position; readonly config: GameConfig }): { readonly cameraPosition: Position } => {
  // Center camera over player
  let cameraY: number = input.playerPosition.y - Math.floor(input.config.viewportHeight / 2);
  let cameraX: number = input.playerPosition.x - Math.floor(input.config.viewportWidth / 2);
  // Ensure camera doesn't go past the top/left edges
  if (cameraY < 0) {
    cameraY = 0;
  }
  if (cameraX < 0) {
    cameraX = 0;
  }
  // Calculate the max camera Y/X so camera doesn't view beyond the scene's lower/right bounds
  const maxCameraY: number = input.config.sceneHeight - input.config.viewportHeight;
  const maxCameraX: number = input.config.sceneWidth - input.config.viewportWidth;
  if (cameraY > maxCameraY) {
    cameraY = maxCameraY;
  }
  if (cameraX > maxCameraX) {
    cameraX = maxCameraX;
  }
  return {
    cameraPosition: {
      y: cameraY,
      x: cameraX
    }
  };
};

/** 
 * Applies camera position such that it follows the player
 * @param input.camera - Camera object
 * @param input.player - Player Entity
 * @param input.config - GameConfig (viewport/scene info)
 */
const updateCameraToFollowPlayer = (input: { readonly camera: Camera; readonly player: Entity; readonly config: GameConfig }): void => {
  const playerPosition: Position = {
    y: input.player.position.y,
    x: input.player.position.x
  };
  const cameraResult: { readonly cameraPosition: Position } = calculateCameraPositionForPlayer({
    playerPosition,
    config: input.config
  });
  input.camera.position = {
    y: cameraResult.cameraPosition.y,
    x: cameraResult.cameraPosition.x
  };
};

/** 
 * Finds the coin entity (if any) at a given position, or undefined if not found
 * @param input.coins - Array of coin Entities
 * @param input.position - Position to search
 * @returns Object with .coin (Entity or undefined)
 */
const findCoinAtPosition = (input: { readonly coins: readonly Entity[]; readonly position: Position }): { readonly coin: Entity | undefined } => {
  const coin: Entity | undefined = input.coins.find((candidate: Entity): boolean => {
    const candidatePosition: Position = {
      y: candidate.position.y,
      x: candidate.position.x
    };
    const equalityResult: { readonly equal: boolean } = arePositionsEqual({
      first: candidatePosition,
      second: input.position
    });
    return equalityResult.equal;
  });
  return {
    coin
  };
};

/** 
 * Removes a coin at the given position if present, increases score, and checks for win condition
 * @param input.scene - Scene to remove coin from
 * @param input.state - State object to update score
 * @param input.config - Game configuration
 * @param input.coins - The current list of coins
 * @param input.position - Position to check for coin
 * @returns Array of remaining coins (after removal)
 */
const collectCoinIfPresent = (input: { readonly scene: Scene; readonly state: State; readonly config: GameConfig; readonly coins: readonly Entity[]; readonly position: Position }): { readonly remainingCoins: readonly Entity[] } => {
  // Try to find coin at specified position
  const coinSearchResult: { readonly coin: Entity | undefined } = findCoinAtPosition({
    coins: input.coins,
    position: input.position
  });
  // If no coin, coins list unchanged
  if (coinSearchResult.coin === undefined) {
    return {
      remainingCoins: input.coins
    };
  }
  // Remove the coin entity from the scene
  input.scene.removeEntity(coinSearchResult.coin);
  // Remove from coins list by Id
  const remainingCoins: Entity[] = input.coins.filter((coin: Entity): boolean => {
    return coin.getId !== coinSearchResult.coin?.getId;
  });
  // Increment score
  const scoreResult: { readonly score: number } = getCurrentScore({
    state: input.state
  });
  const nextScore: number = scoreResult.score + 1;
  setCurrentScore({
    state: input.state,
    score: nextScore
  });
  // Log coin collection to the console
  // eslint-disable-next-line no-console
  console.log(`Collected coin! Score: ${nextScore}/${input.config.coinsCount}`);
  // If all coins collected, announce victory and exit
  if (nextScore >= input.config.coinsCount) {
    // eslint-disable-next-line no-console
    console.log("You collected all coins!");
    process.exit(0);
  }
  return {
    remainingCoins
  };
};

/** 
 * Sets up keyboard movement event handlers to allow the player to move and update game state
 * @param input.config - GameConfig
 * @param input.scene - Current game Scene
 * @param input.entities - Current game entities (player, coins)
 * @param input.state - State object for score
 * @param input.camera - Camera object to follow player
 */
const registerMovementHandlers = (input: { readonly config: GameConfig; readonly scene: Scene; readonly entities: GameEntities; readonly state: State; readonly camera: Camera }): void => {
  // Track the current coins list
  let currentCoins: readonly Entity[] = input.entities.coins;
  /**
   * Moves the player in the direction specified by delta, and handles coin collection & camera
   * @param movementInput.delta - {y, x} offset of movement
   */
  const movePlayer = (movementInput: { readonly delta: Position }): void => {
    // Current position of the player
    const currentPosition: Position = {
      y: input.entities.player.position.y,
      x: input.entities.player.position.x
    };
    // Calculate next candidate position (clamped)
    const nextResult: { readonly next: Position } = calculateNextPosition({
      current: currentPosition,
      delta: movementInput.delta,
      config: input.config
    });
    // Move player to the new position
    input.entities.player.position = {
      y: nextResult.next.y,
      x: nextResult.next.x
    };
    // Attempt coin collection (modifies coins list if coin found)
    const remainingCoinsResult: { readonly remainingCoins: readonly Entity[] } = collectCoinIfPresent({
      scene: input.scene,
      state: input.state,
      config: input.config,
      coins: currentCoins,
      position: nextResult.next
    });
    // Update current coins array based on collection
    currentCoins = remainingCoinsResult.remainingCoins;
    // Move camera to follow the player
    updateCameraToFollowPlayer({
      camera: input.camera,
      player: input.entities.player,
      config: input.config
    });
  };
  // Register handlers for movement keys and quit key. These call movePlayer with appropriate deltas.
  Input.onKey(UP_KEY, (): void => {
    movePlayer({
      delta: {
        y: MOVE_UP_DELTA_Y,
        x: MOVE_UP_DELTA_X
      }
    });
  });
  Input.onKey(`${UP_KEY}\n`, (): void => {
    movePlayer({
      delta: {
        y: MOVE_UP_DELTA_Y,
        x: MOVE_UP_DELTA_X
      }
    });
  });
  Input.onKey(DOWN_KEY, (): void => {
    movePlayer({
      delta: {
        y: MOVE_DOWN_DELTA_Y,
        x: MOVE_DOWN_DELTA_X
      }
    });
  });
  Input.onKey(`${DOWN_KEY}\n`, (): void => {
    movePlayer({
      delta: {
        y: MOVE_DOWN_DELTA_Y,
        x: MOVE_DOWN_DELTA_X
      }
    });
  });
  Input.onKey(LEFT_KEY, (): void => {
    movePlayer({
      delta: {
        y: MOVE_LEFT_DELTA_Y,
        x: MOVE_LEFT_DELTA_X
      }
    });
  });
  Input.onKey(`${LEFT_KEY}\n`, (): void => {
    movePlayer({
      delta: {
        y: MOVE_LEFT_DELTA_Y,
        x: MOVE_LEFT_DELTA_X
      }
    });
  });
  Input.onKey(RIGHT_KEY, (): void => {
    movePlayer({
      delta: {
        y: MOVE_RIGHT_DELTA_Y,
        x: MOVE_RIGHT_DELTA_X
      }
    });
  });
  Input.onKey(`${RIGHT_KEY}\n`, (): void => {
    movePlayer({
      delta: {
        y: MOVE_RIGHT_DELTA_Y,
        x: MOVE_RIGHT_DELTA_X
      }
    });
  });
  // Register quit handlers (with and without \n for buffer compatibility)
  Input.onKey(QUIT_KEY, (): void => {
    process.exit(0);
  });
  Input.onKey(`${QUIT_KEY}\n`, (): void => {
    process.exit(0);
  });
};

/** 
 * Entrypoint to launch the game: initializes config, state, scene, entities, handlers, and runs main game loop
 */
export const startCoinCollectorGame = (): void => {
  // Create game configuration object
  const config: GameConfig = createGameConfig();
  // Create State to hold dynamic values like score
  const state: State = new State();
  // Set initial score
  initializeScore(state);
  // Create and register game scene
  const scene: Scene = createScene();
  // Create player and coin entities, add them to scene, and get references to use later
  const entities: GameEntities = createGameEntities({
    config,
    scene
  });
  // Set up movement/quit key event handlers (passing a camera for event handler, but main loop will use its own camera for drawing)
  registerMovementHandlers({
    config,
    scene,
    entities,
    state,
    camera: createCamera({
      config
    })
  });
  // Patch keyboard for raw input (for environments like Windows, etc.)
  polyfillSetRawMode();
  // Start input event loop
  Input.start();
  // Track last frame's time for delta calculation
  let lastTime: number = Date.now();
  // Main game/render loop, runs every FRAME_INTERVAL_MS, updates and draws the scene and camera
  setInterval((): void => {
    const currentTime: number = Date.now();
    const deltaTime: number = currentTime - lastTime;
    scene.update(deltaTime);
    // Prepare camera position for draw (fresh camera so movement handler's camera does not affect main loop camera)
    const cameraPositionUpdateInput: { readonly camera: Camera; readonly player: Entity; readonly config: GameConfig } = {
      camera: createCamera({
        config
      }),
      player: entities.player,
      config
    };
    // Camera follows player
    updateCameraToFollowPlayer(cameraPositionUpdateInput);
    const cameraForDraw: Camera = cameraPositionUpdateInput.camera;
    // Draw current scene portion visible in the camera
    cameraForDraw.draw();
    lastTime = currentTime;
  }, FRAME_INTERVAL_MS);
};

