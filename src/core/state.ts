export class State<TState> {
    private state: TState = {} as TState;
    private subscribers: ((state: TState) => void)[] = []; // subscribers to the state

    public subscribe(callback: (state: TState) => void): () => void {
        this.subscribers.push(callback);
        return () => this.unsubscribe(callback);
    }   // return a function to unsubscribe from the state by passing the callback to the unsubscribe function itself so that the callback can be removed from the subscribers array

    private unsubscribe(callback: (state: TState) => void) {
        this.subscribers = this.subscribers.filter(subscriber => subscriber !== callback); // unsubscribe from the state
    }   // unsubscribe from the state by removing the callback from the subscribers array

    public getState(): TState {
        return this.state;
    }   // get the current state (readonly) since we don't want to mutate the state directly outside of the state class itself

    public setState(key: keyof TState, value: TState[keyof TState]) {
        this.state[key as keyof TState] = value;
        this.subscribers.forEach(subscriber => subscriber(this.state)); // notify all subscribers of the state changes by passing the new state to themself
    }
}