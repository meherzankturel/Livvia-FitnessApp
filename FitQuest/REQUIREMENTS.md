# Requirements: FitQuest

**Defined:** 2026-02-09
**Core Value:** Provide a real‑time, data‑driven, adaptive fitness experience that turns the body into a “Biological Experiment.”

## v1 Requirements

### Onboarding (Intake Lab)
- [ ] **REQ-ON-01**: Collect gender, weight, body composition, and device access.
- [ ] **REQ-ON-02**: Allow user to select a “Physique Path” (e.g., Titan, Sprinter) via pictorial UI.
- [ ] **REQ-ON-03**: AI calculates a success probability based on user’s energy availability and timeline.

### Mobile App (Field Scanner)
- [ ] **REQ-MOB-01**: Generate three workout options (Express 30m, Standard 60m, Limit Break 90m).
- [ ] **REQ-MOB-02**: High‑contrast HUD suitable for phone‑proximal use.
- [ ] **REQ-MOB-03**: Voice‑activated logging (e.g., “Hey Bio, log 10 reps at 100 lbs”).
- [ ] **REQ-MOB-04**: Failure rep counter button/voice command.
- [ ] **REQ-MOB-05**: AR Form Mirror using on‑device skeletal tracking for form guidance.

### iWatch (Bio‑Sensor)
- [ ] **REQ-WATCH-01**: Track pace and Time Under Tension (TUT) for lifts.
- [ ] **REQ-WATCH-02**: Haptic cue before each set (heartbeat pulse).
- [ ] **REQ-WATCH-03**: “Ghost Runner” cardio mode that races previous best.
- [ ] **REQ-WATCH-04**: Adaptive nudges: if Sleep < 6 h AND HR high → suggest active recovery.

### Website (Command Center)
- [ ] **REQ-WEB-01**: 3D Digital Twin visualized with Three.js that evolves based on MongoDB logs.
- [ ] **REQ-WEB-02**: Consistency Constellation star map where each workout creates a star; skips create “Black Holes.”
- [ ] **REQ-WEB-03**: Shared Grid for partner view of power level and Energy Boost notifications.

## v2 Requirements

### Social & Collaboration
- [ ] **REQ-SOC-01**: Private partner portal for shared progress and goal sync.
- [ ] **REQ-SOC-02**: Ability to send “Energy Boost” notifications to partner.

### Advanced AI
- [ ] **REQ-AI-01**: Daily routine recalculation based on sleep, HR, and performance trends.
- [ ] **REQ-AI-02**: Failure analysis: if failure reps > 20% of volume, suggest weight reduction.

## Out of Scope

- Full AR integration beyond on‑device skeletal tracking (deferred to V3).
- Real‑time multi‑user gamified competitions (future phases).
- OAuth login providers (Google, GitHub) – initial version uses email/password only.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REQ-ON-01 | Phase 1 | Pending |
| REQ-ON-02 | Phase 1 | Pending |
| REQ-ON-03 | Phase 1 | Pending |
| REQ-MOB-01 | Phase 1 | Pending |
| REQ-MOB-02 | Phase 1 | Pending |
| REQ-MOB-03 | Phase 1 | Pending |
| REQ-MOB-04 | Phase 1 | Pending |
| REQ-MOB-05 | Phase 2 | Pending |
| REQ-WATCH-01 | Phase 1 | Pending |
| REQ-WATCH-02 | Phase 1 | Pending |
| REQ-WATCH-03 | Phase 1 | Pending |
| REQ-WATCH-04 | Phase 2 | Pending |
| REQ-WEB-01 | Phase 2 | Pending |
| REQ-WEB-02 | Phase 2 | Pending |
| REQ-WEB-03 | Phase 2 | Pending |
| REQ-SOC-01 | Phase 3 | Pending |
| REQ-SOC-02 | Phase 3 | Pending |
| REQ-AI-01 | Phase 3 | Pending |
| REQ-AI-02 | Phase 3 | Pending |
