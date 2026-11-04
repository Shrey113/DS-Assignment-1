Analyzed 3D_Array_Donor.js:L1-100
Analyzed Queue.js:L1-41
Analyzed all_ds_rout.js:L1-20
Ran list test files
Analyzed test_mlq.js:L1-55
Analyzed queue.socket.js:L1-100
Analyzed README.md:L1-83

Here is a detailed breakdown of why your professor noted that Data Structures usage is currently low, followed by **how to upgrade existing functions** and **new high-scoring Data Structure functions** to add to your project.

---

### 🔍 1. Why Your Professor Said DS Usage is Low

Currently, the project relies mainly on standard database queries and built-in JavaScript array methods:
* **`Queue.js`**: Uses `Array.push()` and `Array.shift()`. In JavaScript, `shift()` re-indexes the entire array ($O(N)$), so it is not a true textbook $O(1)$ Queue.
* **`3D_Array_Donor.js`**: Uses MySQL JSON grouping to build nested JavaScript objects (`donors[city][bloodGroup]`). It is a nested dictionary rather than an actual mathematical multi-dimensional array.
* **Depot Selection (`find_nearest_blood_bank`)**: Uses standard JavaScript `sort()` ($O(N \log N)$) on SQL results instead of an algorithmic spatial search or priority queue.
* **Lack of Core Academic DS**: Key structures expected in university DS courses (Heaps, Graphs, Trees, Custom Hash Tables with collision handling, Circular Buffers) are missing.

---

### 🔄 2. Upgrading Existing Functions with Real DS

| Existing Function | Current Approach | Upgraded Data Structure | Algorithmic Benefit & Academic Value |
| :--- | :--- | :--- | :--- |
| **`requestQueue`** (`Queue.js`) | JavaScript `Array.shift()` ($O(N)$) | **Circular Queue (Fixed Array buffer with `front` & `rear` pointers)** or **Doubly Linked List Queue** | Provides true textbook $O(1)$ enqueue and dequeue operations without memory re-indexing. |
| **Request Dispatching** (`queue.socket.js`) | Simple FIFO (First-Come, First-Served) | **Binary Max-Heap (Priority Queue)** | Real-world emergencies cannot be pure FIFO. Trauma/ICU patients need immediate dispatch over routine requests. Priority score calculated as: $\text{Score} = (\text{Urgency Weight}) + (\text{Minutes Waiting})$. Extract-max runs in $O(\log N)$. |
| **`find_nearest_blood_bank`** (`queue.socket.js`) | Linear array distance scan + `Array.sort()` | **Weighted Graph (Adjacency List) + Dijkstra's Algorithm** | Models Gujarat districts and hospitals as nodes and road distances/travel times as edges. Finds the true shortest delivery path in $O((V + E) \log V)$. |
| **`donorManager`** (`3D_Array_Donor.js`) | Nested JavaScript Object from SQL query | **Flattened 1D-Mapped 3D Array Matrix** or **Custom Hash Table with Separate Chaining** | 1. If 3D Array: implement continuous memory mapping formula: $\text{Index} = (i \cdot S_y + j) \cdot S_z + k$ (City $\times$ Blood Group $\times$ Donor Slot).<br>2. If Hash Table: implement a custom hash function with linked-list buckets to demonstrate collision handling. |

---

### 🚀 3. Brand New DS Functions to Add

#### 1. Instant Prefix Search / Autocomplete (Donors & Hospitals)
* **Data Structure:** **Trie (Prefix Tree)**
* **New Functions:**
  * `insert(name, recordId)`
  * `searchPrefix(prefix)` $\to$ returns matching names instantly
* **Use Case:** In the UI search bar, typing `"Ahm"` or `"Sha"` instantly returns matching donor names or hospitals in $O(L)$ time (where $L$ is query length), completely bypassing slow SQL `LIKE '%abc%'` queries.

---

#### 2. Universal Blood Compatibility Engine
* **Data Structure:** **8×8 2D Bitmask Matrix / Directed Bipartite Graph**
* **New Functions:**
  * `canDonate(donorGroup, recipientGroup)` $\to$ returns Boolean in $O(1)$
  * `getCompatibleDonors(recipientGroup)` $\to$ returns list of acceptable blood groups in $O(1)$
* **Use Case:** Replaces hardcoded `if/else` checks with a bitwise compatibility lookup matrix representing standard medical compatibility (e.g., $O^-$ universal donor, $AB^+$ universal recipient).

---

#### 3. Blood Unit Expiration Tracker (FEFO — First Expired, First Out)
* **Data Structure:** **Binary Min-Heap (Priority Queue by Expiry Date)**
* **New Functions:**
  * `addStockUnit(unitId, bloodGroup, expiryDate)`
  * `dispatchEarliestExpiring(bloodGroup)` $\to$ extracts unit closest to expiry in $O(\log N)$
  * `purgeExpiredUnits(currentDate)` $\to$ removes expired units
* **Use Case:** Blood products have strict shelf lives (platelets $\approx$ 5 days, red cells $\approx$ 35–42 days). A Min-Heap ensures blood banks never dispatch new units while older viable units expire on the shelf.

---

#### 4. Undo / Rollback Dispatch Action History
* **Data Structure:** **Stack (LIFO — Last-In, First-Out)**
* **New Functions:**
  * `pushAction(actionPayload)`
  * `undoLastDispatch()` $\to$ pops the latest action and restores blood bank unit counts in $O(1)$
* **Use Case:** If an operator mistakenly marks an emergency requisition as dispatched or cancelled, they can hit "Undo" to restore the previous state.

---

#### 5. Donor Eligibility & Recency Range Search
* **Data Structure:** **Binary Search Tree (BST) or AVL Tree (Self-Balancing BST)**
* **New Functions:**
  * `insertDonorByDays(donorId, daysSinceLastDonation)`
  * `findEligibleDonorsInRange(minDays = 90, maxDays = 365)`
* **Use Case:** Male donors can donate every 90 days, female donors every 120 days. An in-order traversal of the BST retrieves eligible donors within a date range in $O(\log N + K)$ time.

---

### 📊 4. Summary Matrix for Your Presentation & Viva

| Data Structure | Operations | Time Complexity | Real-World Application in BloodLink |
| :--- | :--- | :--- | :--- |
| **Max-Heap** | `insert()`, `extractMax()` | $O(\log N)$ | Emergency Triage Requisition Ranking |
| **Min-Heap** | `insert()`, `extractMin()` | $O(\log N)$ | FEFO Blood Unit Expiration Dispatch |
| **Circular Queue** | `enqueue()`, `dequeue()` | $O(1)$ | Non-emergency routine blood requests |
| **Trie** | `insert()`, `searchPrefix()` | $O(L)$ | Real-time donor and hospital name search |
| **Graph + Dijkstra** | `shortestPath(src, dest)` | $O((V + E) \log V)$ | Inter-district emergency transit routing |
| **Bitmask Matrix** | `checkCompatibility()` | $O(1)$ | Instant antigen compatibility check |
| **Stack** | `push()`, `pop()` | $O(1)$ | Admin dispatch undo/audit rollback |
| **Separate Chaining Hash Table** | `put()`, `get()` | $O(1)$ average | In-memory token & donor lookup |

---

### Recommended Next Step
Choose which of these you want to start with (e.g., upgrading the **Priority Queue for Emergency Triage**, adding the **Trie for Search**, or setting up the **Graph / Shortest Route**), and let me know which one you would like to proceed with.