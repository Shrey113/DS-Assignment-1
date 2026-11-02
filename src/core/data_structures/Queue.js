class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
        return item;
    }

    dequeue() {
        return this.items.shift() || null;
    }

    add_queue(item) {
        return this.enqueue(item);
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    peek() {
        return this.items[0] || null;
    }

    getStatus() {
        return {
            totalPending: this.items.length
        };
    }
}

export const requestQueue = new Queue();
export const triageMLQ = requestQueue;
export { Queue };
export default Queue;
