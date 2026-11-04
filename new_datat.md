Analyzed server.js:L1-39
Analyzed 3D_Array_Donor.js:L80-120
Canceled search get_best_3_option occurrences
Checked task Search get_best_3_option occurrences
Killed task Search get_best_3_option occurrences
Analyzed package.json:L1-25
Created MaxHeap.js
Analyzed 3D_Array_Donor.js:L10-60
Analyzed 3D_Array_Donor.js:L60-85
Edited 3D_Array_Donor.js
Analyzed 3D_Array_Donor.js:L12-58
Analyzed 3D_Array_Donor.js:L60-88
Edited 3D_Array_Donor.js
Edited 3D_Array_Donor.js
Analyzed 3D_Array_Donor.js:L90-130
Edited 3D_Array_Donor.js
Analyzed all_ds_rout.js:L1-20
Analyzed app.js:L1-29
Edited all_ds_rout.js
Created test_max_heap.js
Ran run Max-Heap unit tests
Ran run MLQ unit tests
Ran check git status
Ran check git diff of flow.md

The Max-Heap donor prioritization system has been implemented with clean, simple, and textbook-style code, mirroring the structure of [`Queue.js`](file:///a:/Nirma/DS/Assignment%201/src/core/data_structures/Queue.js).

---

### 📁 1. New File Created: [`src/core/data_structures/MaxHeap.js`](file:///a:/Nirma/DS/Assignment%201/src/core/data_structures/MaxHeap.js)

Contains the standard, clean Binary Max-Heap with your priority rules:
* **Rule 1 (Exact Match):** **+100 points**
* **Rule 2 (Compatible Alternative, e.g., $O^+$ for $A^+$):** **+60 points**
* **Rule 3 (First-Time Donor Bonus):** **+20 points**
* **Tree Operations:** Standard $O(\log N)$ `insert()` and `extractMax()` with `bubbleUp()` and `bubbleDown()`.

```javascript
// Simple, clean MaxHeap API
const heap = new MaxHeap();
heap.insert(donor);
const bestDonor = heap.extractMax(); // O(log N)
```

---

### 🔄 2. Updated: [`src/core/data_structures/3D_Array_Donor.js`](file:///a:/Nirma/DS/Assignment%201/src/core/data_structures/3D_Array_Donor.js)

Updated `get_best_3_option(city, blood_group)` to use the Max-Heap:
1. Gathers both exact and compatible donors for the city from the 3D Array.
2. Calculates each donor's priority score.
3. Inserts candidates into the `MaxHeap`.
4. Calls `extractMax()` up to 3 times to return the top 3 prioritized donors.

---

### 🌐 3. New API Endpoint Added: [`src/routes/all_ds_rout.js`](file:///a:/Nirma/DS/Assignment%201/src/routes/all_ds_rout.js)

You can test and demonstrate this directly via HTTP:
```http
GET /api/ds/best-donors?city=Ahmedabad&bloodGroup=A+
```
Returns the top 3 donors ranked by the Max-Heap, showing their rank, priority score, and match type (`EXACT` vs `COMPATIBLE`).

---

### ✅ 4. Verification & Test Suite: [`tests/test_max_heap.js`](file:///a:/Nirma/DS/Assignment%201/tests/test_max_heap.js)

Ran `node tests/test_max_heap.js`:

```text
================================================================
TEST SUITE: Max-Heap Priority Queue & Donor Matching Verification
================================================================

--- 1. Testing Core Max-Heap Operations ---
✓ Core Max-Heap binary tree properties verified 100%!

--- 2. Testing Blood Group Compatibility & Priority Scoring ---
Pooja (Exact + First-time):     120 points (Expected: 120)
Rahul (Exact regular):          100 points (Expected: 100)
Kavita (Compatible O+ + First):  80 points (Expected: 80)
Anil (Compatible O+ regular):    60 points (Expected: 60)
Vikram (Incompatible B+):       -1 points (Expected: -1)
✓ Priority scoring rules verified 100%!

--- 3. Testing Top-3 Donor Dispatch via Max-Heap ---
Top 3 Extracted Donors:
  Rank 1: Pooja (A+) - Score: 120 [EXACT]
  Rank 2: Rahul (A+) - Score: 100 [EXACT]
  Rank 3: Kavita (O+) (O+) - Score: 80 [COMPATIBLE]

================================================================
ALL TESTS PASSED! Max-Heap Donor Priority System is 100% Verified!
================================================================
```