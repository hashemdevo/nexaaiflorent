# Networking Architecture

## 1. Overview

The platform operates as a **client-server application** with Firebase as the server infrastructure. Networking is primarily handled through the Firebase SDK, which manages WebSocket connections for real-time data, HTTPS for API calls, and local persistence for offline support. The architecture is designed for resilience in varying network conditions, with graceful degradation when connectivity is limited.

---

## 2. Communication Patterns

### 2.1 Real-Time Data (WebSocket)

```
┌───────────┐                          ┌──────────────────┐
│  Client   │ ◄──WebSocket────────────►│  Firestore       │
│  (React)  │   (persistent connection)│  Realtime API    │
└───────────┘                          └──────────────────┘

Flow:
1. Component mounts → subscribes to Firestore query
2. Firestore SDK establishes WebSocket connection
3. Initial snapshot delivered (current data)
4. Subsequent changes pushed in real-time
5. Component unmounts → unsubscribes
6. Connection managed by Firebase SDK (auto-reconnect)
```

**Real-time subscriptions are used for:**
- Dashboard widgets (live KPIs, transaction feeds)
- Notification center (new notifications)
- POS system (order updates, kitchen display)
- Support chat (real-time messaging)
- Bank reconciliation (live transaction matching)
- Audit log viewer (real-time event stream)

### 2.2 Request-Response (HTTPS)

```
┌───────────┐                          ┌──────────────────┐
│  Client   │ ◄──HTTPS (REST)────────►│  Cloud Functions  │
│  (React)  │   (request-response)    │  (Serverless)     │
└───────────┘                          └──────────────────┘

Used for:
- Gemini AI queries
- Data export/import
- Payroll processing
- Report generation
- Bulk operations
```

### 2.3 File Transfer (HTTPS + Cloud Storage)

```
┌───────────┐                          ┌──────────────────┐
│  Client   │ ◄──Signed URLs─────────►│  Cloud Storage   │
│  (React)  │   (direct upload/download)│                  │
└───────────┘                          └──────────────────┘

Flow:
1. Client requests signed URL from Cloud Function
2. Cloud Function generates time-limited signed URL
3. Client uploads/downloads directly to/from Cloud Storage
4. No data passes through Cloud Functions (cost + latency optimization)
```

---

## 3. Firebase SDK Connection Management

### 3.1 Connection Lifecycle

```
App Start
    │
    ├── Firebase SDK Initialization
    │   └── firebase-applet-config.json
    │
    ├── Auth State Listener
    │   └── onAuthStateChanged()
    │
    ├── Firestore Connection
    │   ├── Auto-connect on first query
    │   ├── WebSocket maintained for active listeners
    │   └── Auto-disconnect when no active listeners
    │
    └── Offline Support
        ├── Local persistence enabled (IndexedDB)
        ├── Write queue for offline mutations
        └── Sync on reconnection
```

### 3.2 Connection State Management

```typescript
// Connection state is tracked for UI feedback
interface ConnectionStatus {
  firestore: 'connected' | 'disconnected' | 'reconnecting';
  auth: 'authenticated' | 'unauthenticated' | 'expired';
  storage: 'available' | 'unavailable';
  ai: 'available' | 'rate_limited' | 'unavailable';
}
```

---

## 4. Offline Architecture

### 4.1 Offline Data Persistence

The Firebase SDK provides built-in offline support:

| Feature | Implementation | Scope |
|---------|---------------|-------|
| **Firestore Cache** | IndexedDB-based local cache | All queried documents |
| **Offline Writes** | Queued in local cache | Sent on reconnection |
| **Conflict Resolution** | Last-write-wins (Firestore default) | Automatic |
| **Auth Persistence** | Token cached locally | Auto-refresh on reconnect |

### 4.2 Offline-First Component Pattern

```typescript
// Components handle offline gracefully
const DataComponent: React.FC = () => {
  const { data, isFromCache } = useFirestoreQuery('collection');

  if (isFromCache) {
    // Show indicator that data may be stale
    return <OfflineBanner>Data shown from local cache</OfflineBanner>;
  }

  return <DataView data={data} />;
};
```

### 4.3 Offline Capabilities by Module

| Module | Offline Support | Limitations |
|--------|----------------|-------------|
| **Dashboard** | View cached KPIs | No real-time updates |
| **Transactions** | Create entries (queued) | Cannot post/approve offline |
| **POS** | Process sales (queued) | No bank payment verification |
| **Inventory** | View catalog | No stock sync |
| **CRM** | View contacts | No AI lead scoring |
| **Chat** | View history | No real-time messages |
| **Reports** | View cached reports | No fresh generation |
| **AI Features** | Unavailable | Requires API connectivity |

---

## 5. Data Sync Architecture

### 5.1 Sync Strategies

```
┌───────────────────────────────────────────────────────┐
│                  SYNC STRATEGIES                       │
│                                                       │
│  Real-time (Always-on):                               │
│  ├── Dashboard KPIs                                   │
│  ├── Notifications                                    │
│  ├── POS orders → Kitchen Display                     │
│  └── Support chat messages                            │
│                                                       │
│  On-Demand (Pull-based):                              │
│  ├── Report generation                                │
│  ├── Search queries                                   │
│  ├── AI analysis requests                             │
│  └── Data export                                      │
│                                                       │
│  Periodic (Scheduled):                                │
│  ├── Bank feed sync (every 4 hours)                   │
│  ├── Subscription status check (daily)                │
│  ├── Cache warmup (every 6 hours)                     │
│  └── Notification digest (configurable)               │
└───────────────────────────────────────────────────────┘
```

### 5.2 Conflict Resolution

When the same document is modified by multiple clients simultaneously:

| Scenario | Resolution | User Impact |
|----------|-----------|-------------|
| **Non-overlapping fields** | Merge (both changes preserved) | Transparent |
| **Overlapping fields** | Last-write-wins (Firestore default) | Earlier write may be lost |
| **Financial data** | Optimistic locking via version field | User prompted to resolve |
| **Journal entries** | Immutable once posted (no edits) | No conflict possible |

### 5.3 Data Freshness Indicators

UI components indicate data freshness to users:

| Indicator | Meaning |
|-----------|---------|
| Green dot | Live (real-time connected) |
| Yellow dot | Cached (may be up to 5 minutes old) |
| Red dot | Stale (offline or sync failure) |
| "Last updated: X mins ago" | Timestamp-based freshness |

---

## 6. Network Optimization

### 6.1 Request Batching

The service layer batches Firestore operations where possible:

- **Batch writes:** Up to 500 operations per batch
- **Query bundling:** Related queries combined into single listener
- **Cache-first reads:** Avoid network when cache is fresh

### 6.2 Data Transfer Optimization

| Technique | Implementation | Savings |
|-----------|---------------|---------|
| **Field selection** | Only fetch needed fields via Firestore `select()` | 30-60% |
| **Pagination** | Cursor-based, 20-50 items per page | 80-95% vs full load |
| **Compression** | Gzip on HTTPS responses | 60-80% |
| **Image optimization** | WebP format, responsive sizes | 40-70% |
| **Lazy loading** | Industry modules loaded on demand | Initial bundle -50% |

### 6.3 Connection Pooling

Firebase SDK manages connection pooling internally:
- Single WebSocket connection for all Firestore listeners
- HTTP/2 multiplexing for Cloud Function calls
- Connection reuse across API calls

---

## 7. Error Handling & Resilience

### 7.1 Network Error Categories

| Error | Handling | User Feedback |
|-------|----------|---------------|
| **Timeout** | Retry with exponential backoff (3 attempts) | "Taking longer than expected..." |
| **Rate Limited** | Queue request, retry after cooldown | "Please wait a moment..." |
| **Auth Expired** | Auto-refresh token, retry request | Transparent |
| **Server Error** | Cache fallback if available | "Using cached data" |
| **Network Offline** | Queue writes, sync on reconnect | Offline indicator |
| **Data Conflict** | Merge or prompt user | "This was modified elsewhere" |

### 7.2 Retry Strategy

```typescript
// Standard retry configuration
const retryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,     // 1 second
  maxDelay: 10000,     // 10 seconds
  backoffMultiplier: 2, // Exponential
  jitter: true,        // Randomize to prevent thundering herd
  retryableErrors: [
    'UNAVAILABLE',
    'DEADLINE_EXCEEDED',
    'RESOURCE_EXHAUSTED',
    'INTERNAL'
  ]
};
```

### 7.3 Circuit Breaker

For external API calls (Gemini, banking), a circuit breaker pattern prevents cascading failures:

```
CLOSED (normal) ──→ Error threshold exceeded ──→ OPEN (failing fast)
                                                    │
                                            After timeout period
                                                    │
                                            HALF-OPEN (testing)
                                                    │
                                    ├── Success ──→ CLOSED
                                    └── Failure ──→ OPEN
```
