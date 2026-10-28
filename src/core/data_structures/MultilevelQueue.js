/**
 * ============================================================================
 * BloodLink Data Structures - Multilevel Priority Queue (MLQ) Triage Engine
 * ============================================================================
 * 
 * Academic Concept: Multilevel Queue (MLQ) Priority Dispatching for 24-Hour Triage.
 * Modeled after the Emergency Severity Index (ESI) Triage Protocol used in
 * real-world hospital emergency departments.
 * 
 * 24-Hour Emergency Priority Triage Design:
 * - Operates strictly within a 24-hour critical response window:
 *     Level 1: CRITICAL  - Critical Emergency: Immediate (< 1 hour response)
 *                          Life-threatening trauma or emergency surgery
 *     Level 2: URGENT    - Urgent Requirement: Within 4 Hours
 *                          Active inpatient deficit, ICU resuscitation or oncology
 *     Level 3: SCHEDULED - Scheduled / Elective: Within 24 Hours
 *                          Planned surgical procedure or replenishment reserve
 * 
 * Dispatching Rules:
 * - Strict Priority Precedence: Level 1 (Critical) is drained before Level 2 (Urgent),
 *   which is drained before Level 3 (Scheduled/Elective).
 * - Intra-Tier FIFO Fairness: Within each urgency level, requests are served in strict
 *   FIFO order of arrival, guaranteeing zero starvation.
 * 
 * Time Complexities:
 * - Enqueue: O(1) Constant Time (Direct routing to queue tier)
 * - Dequeue: O(1) Constant Time (Top priority queue head extraction)
 * - Peek:    O(1) Constant Time
 */

import { Queue } from './Queue.js';

export const TRIAGE_TIERS = {
  CRITICAL: {
    level: 1,
    id: 'CRITICAL',
    title: 'Tier 1: Critical Emergency',
    window: 'Immediate (< 1h)',
    desc: 'Life-threatening trauma or emergency surgery'
  },
  URGENT: {
    level: 2,
    id: 'URGENT',
    title: 'Tier 2: Urgent Requirement',
    window: 'Within 4 Hours',
    desc: 'Active inpatient deficit, ICU resuscitation or oncology'
  },
  SCHEDULED: {
    level: 3,
    id: 'SCHEDULED',
    title: 'Tier 3: Scheduled / Elective',
    window: 'Within 24 Hours',
    desc: 'Planned surgical procedure or replenishment reserve'
  }
};

export class MultilevelQueue {
  constructor() {
    // 3 distinct FIFO Queues for the 24-Hour Emergency Triage
    this.criticalQueue = new Queue();   // Tier 1: Immediate (< 1h)
    this.urgentQueue = new Queue();     // Tier 2: Within 4h
    this.scheduledQueue = new Queue();  // Tier 3: Within 24h

    this.totalEnqueuedCount = 0;
    this.totalDispatchedCount = 0;
  }

  /**
   * Classifies a requisition into one of the 3 24-Hour emergency tiers.
   * @param {Object} req - Blood request data
   * @returns {Object} Tier definition
   */
  classifyTier(req) {
    if (req.isImmediate === true || req.urgency === 'CRITICAL') {
      return TRIAGE_TIERS.CRITICAL;
    }

    if (req.urgency === 'URGENT') {
      return TRIAGE_TIERS.URGENT;
    }

    if (req.urgency === 'SCHEDULED') {
      return TRIAGE_TIERS.SCHEDULED;
    }

    return TRIAGE_TIERS.CRITICAL;
  }

  /**
   * Enqueues a requisition into its designated urgency tier.
   * O(1) Constant Time.
   */
  enqueue(requestData) {
    const tier = this.classifyTier(requestData);

    const requisitionItem = {
      ...requestData,
      id: requestData.id || `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      triageLevel: tier.level,
      triageId: tier.id,
      enqueuedAt: new Date().toISOString()
    };

    switch (tier.id) {
      case 'CRITICAL':
        this.criticalQueue.enqueue(requisitionItem);
        break;
      case 'URGENT':
        this.urgentQueue.enqueue(requisitionItem);
        break;
      case 'SCHEDULED':
      default:
        this.scheduledQueue.enqueue(requisitionItem);
        break;
    }

    this.totalEnqueuedCount++;

    return {
      success: true,
      requestId: requisitionItem.id,
      tier: tier,
      queuePosition: this.getQueueSizeForTier(tier.id),
      enqueuedAt: requisitionItem.enqueuedAt
    };
  }

  /**
   * Dequeues the highest-priority waiting requisition.
   * Drains Critical Queue first, then Urgent, then Scheduled (24h).
   * O(1) Constant Time.
   */
  dequeue() {
    let dequeuedItem = null;
    let servedTier = null;

    if (!this.criticalQueue.isEmpty()) {
      dequeuedItem = this.criticalQueue.dequeue();
      servedTier = TRIAGE_TIERS.CRITICAL;
    } else if (!this.urgentQueue.isEmpty()) {
      dequeuedItem = this.urgentQueue.dequeue();
      servedTier = TRIAGE_TIERS.URGENT;
    } else if (!this.scheduledQueue.isEmpty()) {
      dequeuedItem = this.scheduledQueue.dequeue();
      servedTier = TRIAGE_TIERS.SCHEDULED;
    }

    if (!dequeuedItem) {
      return null;
    }

    this.totalDispatchedCount++;

    return {
      request: dequeuedItem,
      triage: {
        tier: servedTier.level,
        tierId: servedTier.id,
        tierTitle: servedTier.title,
        window: servedTier.window,
        dispatchedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Peeks at the next requisition in line without dequeueing.
   */
  peek() {
    if (!this.criticalQueue.isEmpty()) return this.criticalQueue.peek();
    if (!this.urgentQueue.isEmpty()) return this.urgentQueue.peek();
    if (!this.scheduledQueue.isEmpty()) return this.scheduledQueue.peek();
    return null;
  }

  /**
   * Checks if all 3 priority queues are empty.
   */
  isEmpty() {
    return (
      this.criticalQueue.isEmpty() &&
      this.urgentQueue.isEmpty() &&
      this.scheduledQueue.isEmpty()
    );
  }

  getQueueSizeForTier(tierId) {
    switch (tierId) {
      case 'CRITICAL': return this.criticalQueue.size();
      case 'URGENT': return this.urgentQueue.size();
      case 'SCHEDULED': return this.scheduledQueue.size();
      default: return 0;
    }
  }

  getStatus() {
    return {
      critical: this.criticalQueue.size(),
      urgent: this.urgentQueue.size(),
      scheduled: this.scheduledQueue.size(),
      totalPending:
        this.criticalQueue.size() +
        this.urgentQueue.size() +
        this.scheduledQueue.size(),
      totalEnqueuedLifetime: this.totalEnqueuedCount,
      totalDispatchedLifetime: this.totalDispatchedCount
    };
  }

  getSnapshot() {
    return {
      critical: this.criticalQueue.toArray(),
      urgent: this.urgentQueue.toArray(),
      scheduled: this.scheduledQueue.toArray(),
      stats: this.getStatus()
    };
  }

  clear() {
    this.criticalQueue.clear();
    this.urgentQueue.clear();
    this.scheduledQueue.clear();
  }
}

// Global Singleton Instance for In-Memory Triage Dispatch
export const triageMLQ = new MultilevelQueue();

export default MultilevelQueue;
