import Queue from './Queue.js';

class MultilevelQueue {
    constructor() {
        this.critical = new Queue();
        this.urgent = new Queue();
        this.scheduled = new Queue();
    }

    enqueue(req) {
        if (req.priority === 'CRITICAL') {
            this.critical.enqueue(req);
        } else if (req.priority === 'URGENT') {
            this.urgent.enqueue(req);
        } else {
            this.scheduled.enqueue(req);
        }
        return req;
    }

    dequeue() {
        if (!this.critical.isEmpty()) return { request: this.critical.dequeue(), triage: { tier: 1, tierId: 'CRITICAL' } };
        if (!this.urgent.isEmpty()) return { request: this.urgent.dequeue(), triage: { tier: 2, tierId: 'URGENT' } };
        if (!this.scheduled.isEmpty()) return { request: this.scheduled.dequeue(), triage: { tier: 3, tierId: 'SCHEDULED' } };
        return null;
    }

    add_queue(req) {
        return this.enqueue(req);
    }

    isEmpty() {
        return this.critical.isEmpty() && this.urgent.isEmpty() && this.scheduled.isEmpty();
    }

    getStatus() {
        return {
            critical: this.critical.size(),
            urgent: this.urgent.size(),
            scheduled: this.scheduled.size(),
            totalPending: this.critical.size() + this.urgent.size() + this.scheduled.size()
        };
    }
}

export const TRIAGE_TIERS = {
    1: 'CRITICAL',
    2: 'URGENT',
    3: 'SCHEDULED'
};

export const triageMLQ = new MultilevelQueue();
export { MultilevelQueue };
export default MultilevelQueue;
