# BloodLink: Data Structure Based Blood Requisition and Donor Management System

Data Structures Innovative Assignment 1  
Course Code: 6CS102CC26  
Institute of Technology, Nirma University  
Student: Shrey Patel (Roll No: 26MCA042)  
Supervisor: Prof. Nirav Patel  

---

## Overview

BloodLink is an emergency blood requisition and voluntary donor allocation system. The project uses custom in-memory data structures to handle donor indexing, priority matching, emergency triage buffering, and client-side city search without relying on slow database table scans.

---

## Core Data Structures Used

The system is built on four core data structures:

### 1. 3D Array Matrix (Multi-Dimensional Indexing)
* **File:** `src/core/data_structures/3D_Array_Donor.js`
* **Structure:** `donors[City][BloodGroup] = new MaxHeap()`
* **Purpose:** Organizes active voluntary donors by city and blood group directly in memory.
* **Why used:** Provides direct access to any donor group in O(1) time without running full database queries during emergencies.
* **Key Operation:** `update_city_blood_group_heap(city, bloodGroup)` updates only the specific city-blood group cell without rebuilding the rest of the matrix.
* **Time Complexity:** O(1) direct cell access.

### 2. Binary Max-Heap (Priority Queue)
* **File:** `src/core/data_structures/MaxHeap.js`
* **Structure:** Array-based complete binary tree.
  * Parent index: `floor((i - 1) / 2)`
  * Left child: `2 * i + 1`
  * Right child: `2 * i + 2`
* **Purpose:** Ranks voluntary standby donors for a given city and blood group.
* **Scoring Rules:**
  * Exact blood group match: +100 points
  * Compatible blood group match: +60 points
  * First-time donor bonus: +20 points
  * Proximity to ideal age (25 years): up to +20 points
* **Why used:** Ensures the highest-priority matching donor is always at index 0 (root). Top 3 backup donors are extracted in O(k log N) time using non-destructive extraction.
* **Time Complexity:**
  * Peek root: O(1)
  * Insert: O(log N)
  * Extract Max: O(log N)

### 3. Linear FIFO Queue (Triage Request Buffer)
* **File:** `src/core/data_structures/Queue.js` and `src/core/data_structures/queue.socket.js`
* **Structure:** First-In, First-Out linear queue.
* **Purpose:** Buffers incoming hospital ICU emergency requisitions over WebSockets (Socket.io).
* **Why used:** 
  * Assigns unique audit tokens (e.g., `TOKEN-1603-512`).
  * Serializes emergency requests to prevent race conditions and over-allocation of depot blood units during high-volume incidents.
* **Time Complexity:**
  * Enqueue: O(1)
  * Dequeue: O(1)

### 4. Separate Chaining Hash Table (Polynomial Rolling Hash)
* **File:** `client/src/utils/citySearchHash.js`
* **Structure:** 128-bucket hash table with linked array chains for collision resolution.
* **Hash Function:** Polynomial rolling hash with prime base 31:
  `hash = (hash * 31 + charCode) % 128`
* **Purpose:** Indexes all 316+ Gujarat cities by multi-length prefixes (2, 3, 4 characters and full name) directly in browser memory.
* **Why used:** Gives instant city autocomplete search as the user types without sending HTTP requests to the backend.
* **Time Complexity:** O(1) average lookup time.

---

## Data Structure Summary Table

| Data Structure | Source File | Purpose | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **3D Array Matrix** | `src/core/data_structures/3D_Array_Donor.js` | Index donors by City and Blood Group | O(1) cell access | O(C * G) |
| **Binary Max-Heap** | `src/core/data_structures/MaxHeap.js` | Priority donor ranking and top-3 extraction | O(1) peek, O(log N) insert/extract | O(N) |
| **Linear FIFO Queue** | `src/core/data_structures/Queue.js` | WebSocket emergency triage buffer | O(1) enqueue / dequeue | O(R) |
| **Separate Chaining Hash Table** | `client/src/utils/citySearchHash.js` | Instant client-side city autocomplete search | O(1) average search | O(B + E) |

---

## How It Works

1. A hospital dispatcher types a city name. The **Separate Chaining Hash Table** suggests matching cities in O(1) time.
2. The dispatcher submits an emergency request with patient details, blood type, and GPS coordinates.
3. The request enters the **FIFO Queue** via Socket.io. The server generates a unique Token ID and serializes execution.
4. The server finds the nearest blood bank using distance and inventory matching.
5. The server jumps directly into the **3D Array Matrix** `donors[city][bloodGroup]` in O(1) time.
6. The cell's **Binary Max-Heap** extracts the top 3 verified voluntary standby donors in O(log N) time.
7. The server sends the dispatch result directly to the requesting client, showing depot details, contact numbers, and a direct point-to-point map.

---

## Project Structure

```
Assignment 1/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── tables.js
│   ├── controllers/
│   │   └── bloodbank.controller.js
│   ├── core/
│   │   ├── data_structures/
│   │   │   ├── 3D_Array_Donor.js
│   │   │   ├── MaxHeap.js
│   │   │   ├── Queue.js
│   │   │   └── queue.socket.js
│   │   └── districts.js
│   ├── routes/
│   │   ├── all_ds_rout.js
│   │   └── bloodbank.routes.js
│   ├── app.js
│   └── server.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── RequesterPage.jsx
│   │   │   ├── DonorPage.jsx
│   │   │   └── LandingPage.jsx
│   │   └── utils/
│   │       ├── citySearchHash.js
│   │       ├── validation.js
│   │       └── fakeData.js
│   └── package.json
├── tests/
│   ├── test_3d_max_heap.js
│   ├── test_max_heap.js
│   ├── test_mlq.js
│   └── test_ui_hash_search.js
├── flow.md
└── README.md
```

---

## Running the Project

### Prerequisites
* Node.js (v18+)
* MySQL Database

### Backend Setup
```bash
npm install
npm start
```
The server starts on port `5100`.

### Frontend Setup
```bash
cd client
npm install
npm run dev
```
The React frontend starts on Vite (`http://localhost:5173`).

### Running the Test Suites
Run the automated test suites to verify all four data structures:
```bash
node tests/test_3d_max_heap.js
node tests/test_max_heap.js
node tests/test_mlq.js
node tests/test_ui_hash_search.js
```
All tests should pass with 100% verification.
