---
wave: 1
depends_on: []
files_modified:
  - .planning/REQUIREMENTS.md
  - .planning/PROJECT.md
  - .planning/ROADMAP.md
autonomous: true
---

# Phase 1 – Core Onboarding & Basic Logging

## Goal
Users can successfully complete onboarding and record basic workouts using the mobile app and iWatch.

## Tasks (XML format for execution)
```xml
<task id="onboarding-ui" wave="1" description="Implement onboarding UI (gender, weight, body comp, device access)" files="src/onboarding/*" autonomous="true" />
<task id="physique-path-selection" wave="1" description="Add pictorial Physique Path selector" files="src/onboarding/PhysiquePath.tsx" autonomous="true" />
<task id="ai-success-probability" wave="1" description="Calculate success probability based on energy availability and timeline" files="src/onboarding/SuccessCalc.ts" autonomous="true" />
<task id="workout-options" wave="1" description="Generate three workout options (Express, Standard, Limit Break)" files="src/mobile/WorkoutOptions.ts" autonomous="true" />
<task id="hud-ui" wave="1" description="Display high‑contrast HUD for workout selection" files="src/mobile/HUD.tsx" autonomous="true" />
<task id="voice-logging" wave="1" description="Add voice‑activated logging (e.g., ‘Hey Bio, log 10 reps at 100 lbs’)" files="src/mobile/VoiceLogging.ts" autonomous="true" />
<task id="failure-rep-counter" wave="1" description="Add failure‑rep counter button/voice command" files="src/mobile/FailureCounter.tsx" autonomous="true" />
<task id="watch-pace-tut" wave="1" description="Track pace and Time‑Under‑Tension on iWatch" files="watch/src/Tracking.ts" autonomous="true" />
<task id="watch-haptic-cue" wave="1" description="Emit haptic cue before each set" files="watch/src/Haptic.ts" autonomous="true" />
<task id="watch-ghost-runner" wave="1" description="Implement Ghost Runner cardio mode" files="watch/src/GhostRunner.ts" autonomous="true" />
```

## Success Criteria
1. User completes onboarding (gender, weight, body comp, device access) and sees a calculated success probability.
2. User selects a Physique Path and it is reflected in the UI.
3. User can start a workout (Express, Standard, Limit Break) and sees the high‑contrast HUD.
4. Voice logging works during workouts.
5. Failure‑rep counter records failures.
6. iWatch records pace and TUT, and emits a haptic cue before each set.
7. Ghost Runner mode displays previous best and lets user race it.
```
