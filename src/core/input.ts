/**
 * Input system for handling keyboard input
 * Singleton pattern similar to Global
 */
class _Input {
    private handlers: Map<string, Array<() => void>>;
    private isStarted: boolean;

    constructor() {
        this.handlers = new Map();
        this.isStarted = false;
    }

    /**
     * Register a handler for a specific key
     * @param key - The key to listen for
     * @param handler - Callback function to execute when key is pressed
     */
    public onKey(key: string, handler: () => void): void {
        if (!this.handlers.has(key)) {
            this.handlers.set(key, []);
        }
        this.handlers.get(key)?.push(handler);
    }

    /**
     * Start listening for input
     * Sets up stdin in raw mode and begins processing key presses
     */
    public start(): void {
        if (this.isStarted) {
            return;
        }

        process.stdin.setRawMode(true);
        process.stdin.setEncoding('utf8');
        process.stdin.resume();

        process.stdin.on('data', (key: string) => {
            const handlersForKey = this.handlers.get(key);
            if (handlersForKey) {
                handlersForKey.forEach((handler) => {
                    handler();
                });
            }
        });

        this.isStarted = true;
    }
}

export const Input = new _Input();

