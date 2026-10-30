import Queue from './Queue.js';

class MultilevelQueue {
    constructor() {
        this.critical = new Queue();   // Tier 1: Immediate (< 1h)
        this.urgent = new Queue();     // Tier 2: Within 4h
        this.scheduled = new Queue();  // Tier 3: Within 24h
    }

    enqueue(req) {
        const tier = req.isImmediate || req.urgency === 'CRITICAL' ? 1 
                   : req.urgency === 'URGENT' ? 2 : 3;

        const tierId = tier === 1 ? 'CRITICAL' : tier === 2 ? 'URGENT' : 'SCHEDULED';
        const item = { ...req, tier, tierId };

        if (tier === 1) this.critical.enqueue(item);
        else if (tier === 2) this.urgent.enqueue(item);
        else this.scheduled.enqueue(item);

        return item;
    }

    dequeue() {
        if (!this.critical.isEmpty()) {
            return { request: this.critical.dequeue(), triage: { tier: 1, tierId: 'CRITICAL' } };
        }
        if (!this.urgent.isEmpty()) {
            return { request: this.urgent.dequeue(), triage: { tier: 2, tierId: 'URGENT' } };
        }
        if (!this.scheduled.isEmpty()) {
            return { request: this.scheduled.dequeue(), triage: { tier: 3, tierId: 'SCHEDULED' } };
        }
        return null;
    }
}

export const triageMLQ = new MultilevelQueue();
export { MultilevelQueue };
export default MultilevelQueue;
