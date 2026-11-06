
### Quick Summary of All Data Structures

| # | Data Structure | Implementation File | Primary Purpose | Time Complexity |
|---|---|---|---|---|
| **1** | **3D Array Matrix** | [`src/core/data_structures/3D_Array_Donor.js`](file:///a:/Nirma/DS/Assignment%201/src/core/data_structures/3D_Array_Donor.js#L24-L60) | Multi-dimensional indexing of donors by `[City][BloodGroup]` | **$O(1)$** direct cell access |
| **2** | **Binary Max-Heap** | [`src/core/data_structures/MaxHeap.js`](file:///a:/Nirma/DS/Assignment%201/src/core/data_structures/MaxHeap.js#L54-L155) | Priority Queue for emergency voluntary donor matching | **$O(1)$** peek, **$O(\log N)$** insert & extract |
| **3** | **FIFO Queue** | [`src/core/data_structures/Queue.js`](file:///a:/Nirma/DS/Assignment%201/src/core/data_structures/Queue.js#L1-L41) & [`queue.socket.js`](file:///a:/Nirma/DS/Assignment%201/src/core/data_structures/queue.socket.js#L52-L100) | Real-time WebSocket Hospital Triage & Token dispatch broker | **$O(1)$** enqueue / dequeue |
| **4** | **Separate Chaining Hash Table** | [`client/src/utils/citySearchHash.js`](file:///a:/Nirma/DS/Assignment%201/client/src/utils/citySearchHash.js#L10-L75) | Client-side polynomial rolling hash for 316+ Gujarat cities | **$O(1)$** average autocomplete search |
| **5** | **Roadway Graph (Bidirectional Dijkstra)** | [`client/src/components/RequesterTransitRouteMap.jsx`](file:///a:/Nirma/DS/Assignment%201/client/src/components/RequesterTransitRouteMap.jsx#L73-L115) | Road network shortest path transit corridor calculation | **$O((V + E) \log V)$** routing |

---
