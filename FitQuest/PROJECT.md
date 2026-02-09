# FitQuest

## What This Is

FitQuest is an immersive fitness platform that visualizes a user’s progress as a 3D Digital Twin (the Bio‑Avatar) on a web dashboard. The AI acts as a Lead Scientist, adapting workout and diet plans in real‑time based on biometric data from an iWatch or manual field reports via a phone app.

## Core Value

Provide a real‑time, data‑driven, adaptive fitness experience that turns the body into a “Biological Experiment,” keeping users engaged and optimizing results.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(Nothing yet – MVP upcoming.)

### Active

- **Onboarding (Intake Lab)**: Interactive intake of gender, weight, body composition, device access; goal mapping with pictorial “Physique Paths”; AI calculates success probability based on energy availability.
- **Mobile App (Field Scanner)**: Generates three workout options (Express, Standard, Limit Break); high‑contrast HUD for phone‑proximal use; voice‑activated logging; failure rep counter; AR Form Mirror using on‑device skeletal tracking.
- **iWatch (Bio‑Sensor)**: Tracks pace, Time Under Tension; haptic cues for set start; “Ghost Runner” cardio mode; adaptive nudges based on sleep and heart rate.
- **Website (Command Center)**: 3D Digital Twin visualized with Three.js; Consistency Constellation star map; Shared Grid for partner power‑level sync and Energy Boost notifications.

### Out of Scope

- Full AR integration beyond on‑device skeletal tracking (deferred to V3).
- Real‑time multi‑user gamified competitions (future phases).

## Context

- **Technical Architecture**: React Native for cross‑platform mobile & watch; React + Three.js web frontend; MongoDB for granular rep data and AI plans; Node.js/Firebase backend for auth, real‑time sync, push notifications; TensorFlow Lite on‑device AI for pose estimation and progress prediction.
- **Constraints**: Privacy‑first processing for pose data on device; real‑time sync latency must stay under 200 ms; initial MVP must support both iWatch and phone logging.

## Constraints

- **Privacy**: All biometric and pose data processed on‑device; only aggregated logs stored in MongoDB.
- **Performance**: Mobile HUD must render at 60 fps; web 3D Twin must load within 2 s.
- **Platform**: Support iOS watchOS and Android Wear OS; React Native codebase shared.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use TensorFlow Lite for on‑device AI | Keeps biometric processing private and low‑latency | ⚙️ Implemented in V1 |
| React Native for cross‑platform mobile | Reduces duplicated effort across iOS/Android | ⚙️ Implemented in V1 |
| Three.js for 3D Twin | Leverages web GL, no native 3D engine needed | ⚙️ Planned for V2 |

---
*Last updated: 2026-02-09 after initial project definition*
