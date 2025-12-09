/**
 * State Machine Demo
 * Demonstrates the StateMachine system with a simple game state example
 * 
 * Controls:
 * - Space: Transition to next state
 * - R: Reset state machine
 * - Q: Quit
 */

import { Scene } from "../core/scene";
import { Entity } from "../core/entity/entity";
import { Camera } from "../core/camera";
import { Input } from "../core/input";
import { GameLoop } from "../core/game-loop";
import { TextEntity } from "../core/helpers/text-entity";
import { Color, ColorHelper } from "../core/helpers/color";
import { StateMachine } from "../core/helpers/state-machine";

// Game state names
enum GameState {
  Menu = "menu",
  Playing = "playing",
  Paused = "paused",
  GameOver = "gameover",
}

/**
 * State Machine Demo Game
 */
class StateMachineDemo {
  private scene: Scene;
  private camera: Camera;
  private stateMachine: StateMachine;
  private titleText: TextEntity;
  private statusText: TextEntity;
  private controlsText: TextEntity;
  private gameLoop: GameLoop;
  private player: Entity;
  private score: number = 0;
  private timeInState: number = 0;

  constructor() {
    // Create scene
    const sceneWidth = 50;
    const sceneHeight = 20;

    this.camera = new Camera(
      Math.floor(sceneHeight / 2),
      sceneHeight,
      Math.floor(sceneWidth / 2),
      sceneWidth
    );

    this.scene = new Scene(sceneHeight, sceneWidth, "State Machine Demo", this.camera);

    // Create player
    const playerSprite = ColorHelper.colorize("@", Color.Green);
    this.player = new Entity(10, 25, playerSprite);
    this.player.setLayer(2);
    this.scene.addEntity(this.player);

    // Create UI text
    this.titleText = new TextEntity(1, 10, "STATE MACHINE DEMO", 3);
    this.statusText = new TextEntity(15, 5, "", 3);
    this.controlsText = new TextEntity(17, 2, "Space:Next State  R:Reset  Q:Quit", 3);

    this.titleText.addToScene(this.scene);
    this.controlsText.addToScene(this.scene);

    // Setup state machine
    this.setupStateMachine();

    // Setup input
    this.setupInput();

    // Create game loop
    this.gameLoop = new GameLoop(
      (deltaTime) => this.update(deltaTime),
      () => this.render(),
      30
    );

    // Initial render
    this.updateStatus();
    this.scene.draw();

    // Start game loop
    this.gameLoop.start();
  }

  /**
   * Sets up the state machine with all states and transitions
   */
  private setupStateMachine(): void {
    this.stateMachine = new StateMachine(GameState.Menu);

    // Menu state
    this.stateMachine.addState(GameState.Menu, {
      onEnter: (fromState) => {
        console.log(`Entered ${GameState.Menu} from ${fromState || "initial"}`);
        this.timeInState = 0;
      },
      onUpdate: (deltaTime) => {
        this.timeInState += deltaTime;
        // Animate title or menu items here
      },
      onExit: (toState) => {
        console.log(`Exiting ${GameState.Menu} to ${toState}`);
      },
    });

    // Playing state
    this.stateMachine.addState(GameState.Playing, {
      onEnter: (fromState) => {
        console.log(`Entered ${GameState.Playing} from ${fromState || "initial"}`);
        this.timeInState = 0;
        this.score = 0;
      },
      onUpdate: (deltaTime) => {
        this.timeInState += deltaTime;
        this.score += Math.floor(deltaTime * 10); // Increment score
      },
      onExit: (toState) => {
        console.log(`Exiting ${GameState.Playing} to ${toState}`);
      },
    });

    // Paused state
    this.stateMachine.addState(GameState.Paused, {
      onEnter: (fromState) => {
        console.log(`Entered ${GameState.Paused} from ${fromState || "initial"}`);
        this.timeInState = 0;
      },
      onUpdate: (deltaTime) => {
        this.timeInState += deltaTime;
        // Pause screen animation
      },
      onExit: (toState) => {
        console.log(`Exiting ${GameState.Paused} to ${toState}`);
      },
    });

    // Game Over state
    this.stateMachine.addState(GameState.GameOver, {
      onEnter: (fromState) => {
        console.log(`Entered ${GameState.GameOver} from ${fromState || "initial"}`);
        this.timeInState = 0;
      },
      onUpdate: (deltaTime) => {
        this.timeInState += deltaTime;
      },
      onExit: (toState) => {
        console.log(`Exiting ${GameState.GameOver} to ${toState}`);
      },
    });

    // Define allowed transitions
    this.stateMachine.addTransition(GameState.Menu, GameState.Playing);
    this.stateMachine.addTransition(GameState.Playing, GameState.Paused);
    this.stateMachine.addTransition(GameState.Paused, GameState.Playing);
    this.stateMachine.addTransition(GameState.Playing, GameState.GameOver);
    this.stateMachine.addTransition(GameState.GameOver, GameState.Menu);

    // Global transition callback
    this.stateMachine.onTransition((fromState, toState) => {
      console.log(`State transition: ${fromState} -> ${toState}`);
    });
  }

  /**
   * Sets up input handlers
   */
  private setupInput(): void {
    Input.start();

    // Space - transition to next state
    Input.onKey(" ", ({ isDown }) => {
      if (isDown) {
        this.transitionToNextState();
      }
    });

    // R - reset state machine
    Input.onKey("r", ({ isDown }) => {
      if (isDown) {
        this.stateMachine.reset();
        this.updateStatus();
      }
    });

    // Q - quit
    Input.onKey("q", ({ isDown }) => {
      if (isDown) {
        this.quit();
      }
    });
  }

  /**
   * Transitions to the next allowed state
   */
  private transitionToNextState(): void {
    const currentState = this.stateMachine.getCurrentState();
    if (!currentState) return;

    const transitions = this.stateMachine.getTransitionsFrom(currentState);
    if (transitions.length > 0) {
      // Transition to first available state
      this.stateMachine.transitionTo(transitions[0]!);
      this.updateStatus();
    } else {
      console.log(`No transitions available from ${currentState}`);
    }
  }

  /**
   * Updates the status display
   */
  private updateStatus(): void {
    const currentState = this.stateMachine.getCurrentState();
    const time = this.timeInState.toFixed(1);

    let status = "";
    let color = Color.White;

    switch (currentState) {
      case GameState.Menu:
        status = `State: MENU | Time: ${time}s`;
        color = Color.Cyan;
        break;
      case GameState.Playing:
        status = `State: PLAYING | Score: ${this.score} | Time: ${time}s`;
        color = Color.Green;
        break;
      case GameState.Paused:
        status = `State: PAUSED | Score: ${this.score} | Time: ${time}s`;
        color = Color.Yellow;
        break;
      case GameState.GameOver:
        status = `State: GAME OVER | Final Score: ${this.score} | Time: ${time}s`;
        color = Color.Red;
        break;
    }

    const coloredStatus = ColorHelper.style(status, Color.Bold, color);
    this.statusText.setText(coloredStatus);
    this.statusText.setPosition(15, 5);
  }

  /**
   * Updates game state
   */
  private update(deltaTime: number): void {
    // Update state machine
    this.stateMachine.update(deltaTime);

    // Update status display periodically
    if (Math.floor(this.timeInState * 10) % 5 === 0) {
      this.updateStatus();
    }
  }

  /**
   * Renders the game
   */
  private render(): void {
    this.statusText.removeFromScene(this.scene);
    this.statusText.addToScene(this.scene);
    this.scene.draw();
  }

  /**
   * Quits the game
   */
  private quit(): void {
    this.gameLoop.stop();
    Input.stop();
    console.clear();
    console.log("\nThanks for trying the State Machine Demo!");
    console.log("Goodbye!\n");
    process.exit(0);
  }
}

// Start the demo
new StateMachineDemo();

