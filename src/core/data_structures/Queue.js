class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        return this.items.shift() || null;
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

export { Queue };
export default Queue;
