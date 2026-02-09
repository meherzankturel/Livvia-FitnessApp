# Architecture Research

**Domain:** Cross‑platform fitness service
**Researched:** 2026-02-09
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Presentation Layer                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ Mobile  │  │ Wearable App │  │ Web Dashboard │       │
│  │  (RN)   │  │   (watchOS) │  │   (React)    │       │
│  └────┬────┘  └───────┬───────┘  └───────┬───────┘       │
│       │                │                │               │
├───────┴────────────────┴────────────────┴───────────────┤
│                     Application / Service Layer               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Auth Service   │  Sync Service   │  API Gateway   │   │
│  └───────┬─────────┴───────┬─────────┴───────┬───────┘   │
│          │                 │                 │           │
├──────────┴─────────────────┴─────────────────┴───────────┤
│                     Data \u0026 AI Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐ │
│  │   MongoDB     │  │  Firestore   │  │  TF‑Lite AI   │ │
│  │   (Analytics)│  │ (User data)  │  │ (On‑device)  │ │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘ │
│          │                 │                 │           │
└──────────┴─────────────────┴─────────────────┴───────────┘
```

### Component Responsibilities

| Component          | Responsibility                                            | Typical Implementation                               |
|-------------------|-----------------------------------------------------------|------------------------------------------------------|
| Mobile App (RN)   | Capture activity, display workouts, UI, offline cache   | React Native + Redux Toolkit, Expo, Firebase SDK    |
| Wearable App      | Sensor reading, BLE communication, immediate feedback    | watchOS Swift, HealthKit, CoreBluetooth            |
| Web Dashboard     | Analytics, admin UI, reporting                          | React + Vite, GraphQL/REST client                 |
| Auth Service      | User sign‑up, token issuance, social login               | Firebase Auth, Node.js Cloud Functions              |
| Sync Service      | Real‑time state sync across devices                      | Firebase Realtime DB / Firestore listeners           |
| API Gateway       | Business‑logic endpoints, validation, rate limiting      | Express.js on Node.js, OpenAPI spec                  |
| Data Store (Mongo)| Long‑term analytics, aggregation, cohort analysis        | MongoDB Atlas, Mongoose ODM                         |
| User Store (FS)   | Per‑user profile, preferences, workout history           | Firestore collections, security rules             |
| AI Service (TF‑Lite) | On‑device inference for realtime coaching            | TensorFlow Lite models bundled with app, Edge‑TPU if needed |
| AI Service (Cloud)   | Batch recommendation generation, model training       | Cloud Functions or Vertex AI, model versioning      |
| Notification Service | Push messages, reminders, achievement alerts           | Firebase Cloud Messaging (FCM)                       |

## Recommended Project Structure

```
src/
├── mobile/               # React Native app
│   ├── src/
│   │   ├── components/
│   │   ├── redux/
│   │   └── services/
│   └── ios/ & android/
├── wearable/              # watchOS app
│   └── WatchApp/
├── web/                  # React web dashboard
│   └── src/
├── backend/              # Node.js services
│   ├── auth/
│   ├── api/
│   ├── sync/
│   └── ai/
├── shared/               # Type definitions, validation schemas
│   └── models/
└── scripts/             # Build, CI, deployment helpers
```

### Structure Rationale

- **mobile/** isolates the RN codebase, allowing independent CI pipelines.
- **wearable/** keeps watchOS source separate but can share TypeScript types via `shared/`.
- **web/** hosts the admin dashboard; it consumes the same OpenAPI contracts as mobile.
- **backend/** groups all server‑side services; each sub‑folder is a deployable Cloud Function.
- **shared/** prevents duplication of data models and validation rules across front‑ends and back‑ends.
- **scripts/** centralizes build order scripts and deployment automation.

## Architectural Patterns

### Pattern 1: Backend‑for‑Frontend (BFF)

**What:** A thin façade layer exposing APIs tailored to each client (mobile, wearable, web).
**When to use:** When client needs differ in payload shape or authentication flow.
**Trade‑offs:** Improves client performance but adds an extra service to maintain.
**Example:**
```typescript
// BFF endpoint – aggregates user profile + latest workout + AI suggestion
app.get('/bff/user/:id/summary', async (req, res) => {
  const [profile, workout, suggestion] = await Promise.all([
    getUserProfile(req.params.id),
    getLatestWorkout(req.params.id),
    getRealtimeSuggestion(req.params.id),
  ]);
  res.json({ profile, workout, suggestion });
});
```

### Pattern 2: Event‑Driven Real‑Time Sync

**What:** Devices publish events to a message hub; subscribers (other devices, services) react.
**When to use:** Need low‑latency updates across multiple clients (e.g., live step count).
**Trade‑offs:** Guarantees eventual consistency but introduces complexity in ordering.
**Example:**
```typescript
// Cloud Function listening to Firestore writes and broadcasting via FCM
exports.propagateStepUpdate = functions.firestore
  .document('users/{uid}/steps/{docId}')
  .onWrite((change, context) => {
    const payload = { data: change.after.data() };
    return admin.messaging().sendToTopic(`steps-${context.params.uid}`, payload);
  });
```

### Pattern 3: On‑Device AI (Edge Inference)

**What:** Deploy lightweight TensorFlow Lite models bundled with the app for instant feedback.
**When to use:** Scenarios requiring sub‑second latency (e.g., form correction, rep counting).
**Trade‑offs:** Model size limits accuracy; requires periodic updates from server.
**Example:**
```typescript
import * as tflite from '@tensorflow/tflite-react-native';
const model = await tflite.loadModel('model.tflite');
const result = await model.predict(sensorDataTensor);
```

## Data Flow

### Request Flow
```
[User Action] – e.g., start workout on wearable
    ↓
[Wearable App] → BLE → [Mobile App] – raw sensor stream
    ↓
[Sync Service] – writes to Firestore (real‑time)
    ↓
[Backend API] – validates, enriches, stores in MongoDB
    ↓
[AI Service (Cloud)] – generates personalized plan
    ↓
[Push Notification / Sync] – sends recommendation back
    ↓
[Mobile / Web Dashboard] – displays updated UI
```

### State Management
```
[State Store] – Redux Toolkit (mobile) / Redux (web)
    ↓ (subscribe)
[Components] ←→ [Actions] → [Reducers] → [State Store]
```

### Key Data Flows
1. **Live Activity Stream:** Wearable → Mobile (BLE) → Sync Service → Real‑time listeners on other devices.
2. **User Profile Update:** Mobile → API → Firestore → Auth Service updates token scopes.
3. **AI Recommendation Cycle:** Backend batch job → MongoDB analytics → Model retraining → New TF‑Lite model deployed → Mobile app pulls update.

## Scaling Considerations

| Scale          | Architecture Adjustments                                                     |
|----------------|------------------------------------------------------------------------------|
| 0‑1k users    | Monolithic Cloud Functions, single Firestore instance, no sharding needed.   |
| 1k‑100k users | Split BFF per client, enable Firestore regional replication, add caching layer (Redis) for frequent reads. |
| 100k+ users   | Move heavy analytics to dedicated data warehouse (BigQuery), introduce message queue (Pub/Sub) for event processing, consider micro‑service decomposition of AI service. |

### Scaling Priorities
1. **First bottleneck:** Firestore write latency under high concurrent device updates – mitigate with batched writes \u0026 offline queues.
2. **Second bottleneck:** AI model size impacting app bundle – use dynamic model loading from CDN and progressive rollout.

## Anti‑Patterns

### Anti‑Pattern 1: Tight Coupling of Mobile and Backend Logic
**What people do:** Embed business rules directly in the React Native codebase.
**Why it's wrong:** Leads to divergent behavior across platforms and hard‑to‑maintain code.
**Do this instead:** Centralize core logic in the BFF layer; expose deterministic APIs.

### Anti‑Pattern 2: Storing Large Binary Sensor Data Directly in Firestore
**What people do:** Push raw accelerometer streams as documents.
**Why it's wrong:** Increases storage costs and query latency.
**Do this instead:** Aggregate on‑device, send summarized metrics, or store raw streams in Cloud Storage with metadata in Firestore.

## Integration Points

### External Services
| Service          | Integration Pattern | Notes                                 |
|------------------|---------------------|---------------------------------------|
| Stripe           | Payment webhook + server SDK | For premium subscriptions, PCI compliance |
| Apple HealthKit  | Data read/write bridge | Sync user health data with consent |
| Google Fit       | REST sync via Cloud Functions| Mirror activity data across platforms |

### Internal Boundaries
| Boundary                     | Communication        | Notes                                 |
|-----------------------------|----------------------|---------------------------------------|
| Mobile ↔ Sync Service       | Firestore realtime   | Offline support via local cache       |
| Wearable ↔ Mobile          | BLE (CoreBluetooth) | Low‑latency, encrypted channel        |
| BFF ↔ AI Service (Cloud)    | HTTP (gRPC)          | Auth‑protected, model versioning       |
| API ↔ MongoDB (Analytics)  | Mongoose ODM          | Indexes on userId, timestamp          |

## Sources

- Firebase Realtime Database \u0026 Firestore best practices (2025) – https://firebase.google.com/docs/best-practices
- TensorFlow Lite on‑device inference guide (2025) – https://www.tensorflow.org/lite/guide
- “Designing Scalable Real‑Time Mobile Backends” – ThoughtWorks Tech Radar 2025
- Apple watchOS developer documentation – https://developer.apple.com/watchos/
- React Native Architecture Whitepaper – https://reactnative.dev/docs/architecture
- MongoDB Atlas performance patterns – https://www.mongodb.com/cloud/atlas/performance

---
*Architecture research for: Cross‑platform fitness service*
*Researched: 2026-02-09*
