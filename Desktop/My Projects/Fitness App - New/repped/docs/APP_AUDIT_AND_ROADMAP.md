# Livvia — Full App Audit, Competitor Gap Analysis & Trust Roadmap

**Date:** March 25, 2026
**Scope:** Complete codebase audit + competitor research (Hevy, Strong, Fitbod, JEFIT) + certification/trust research

---

## PART 1: CRITICAL LOOPHOLES (What's Broken or Missing)

### A. Accuracy Problems — Users Won't Trust Us Until Fixed

| Issue | What's Wrong | Why It Matters | Fix Priority |
|-------|-------------|----------------|--------------|
| **Weight suggestions are static** | Uses fixed body-weight ratios (e.g., beginner chest = 0.35× BW). Never adapts as user gets stronger | Fitbod's #1 complaint is bad weight suggestions. If ours are worse, users leave after workout 1 | **P0** |
| **Progression is invisible** | Algorithm exists (`progression.ts`) but is NEVER shown to the user. No "try +2.5kg next time" | Hevy and Strong show previous session inline — that alone drives progressive overload. We compute it but hide it | **P0** |
| **1RM formula inaccurate for high reps** | Uses Epley formula only, which breaks above 10 reps. Research shows Wathan formula is more accurate overall | A user doing 15-rep sets gets wildly wrong 1RM estimates, eroding trust in our "intelligence" | **P1** |
| **Volume data is FAKE on home screen** | Home screen shows hardcoded mock data (3.2k, 4.1k, etc.) instead of real Supabase data | Users will notice their numbers don't change after workouts. Instant trust killer | **P0** |
| **Readiness check is collected but ignored** | User logs sleep/energy/soreness daily, but it never modifies the workout | This is worse than not having it — we ask for data and visibly do nothing with it | **P1** |
| **Streak logic is misleading** | Counts weekly streaks, not daily. You can skip a full week and not break streak | Hevy does daily streaks. Ours gives false sense of consistency | **P1** |
| **Rest periods follow outdated science** | Many exercises default to 60-90s rest. Research (Schoenfeld 2016) shows 2-3 min better even for hypertrophy | Users following our rest times may get suboptimal results | **P1** |
| **RPE logged but never used** | We collect RPE per set but never analyze it for autoregulation or fatigue detection | Wasted data collection. Either use it or remove it | **P2** |

### B. Missing Features That Competitors Have

| Feature | Hevy | Strong | Fitbod | Livvia | Gap Severity |
|---------|------|--------|--------|--------|-------------|
| Previous session shown during logging | ✅ | ✅ | ✅ | ⚠️ Exists but not prominent | High |
| Progressive overload guidance | ❌ | ❌ | ✅ (AI) | ❌ Algorithm exists, not shown | **Critical** |
| Apple Health / HealthKit sync | ✅ | ✅ | ✅ | ❌ | **Critical** for trust |
| Offline workout logging | ✅ | ✅ | ✅ | ❌ | **Critical** for gyms |
| 1RM progression chart over time | ✅ | ✅ | ✅ | ❌ | High |
| Custom exercises | ✅ | ✅ | ✅ | ❌ | High |
| Workout templates/programs | ✅ | ✅ | ✅ (AI) | ✅ (AI only) | Medium |
| Superset/dropset/warmup set logging | ✅ | ✅ | ✅ | ❌ | High |
| Exercise video demos (in-app) | ❌ | ❌ | ✅ | ❌ (YouTube search) | Medium |
| Muscle recovery heatmap | ❌ | ❌ | ✅ | ❌ | Medium |
| Social feed / sharing | ✅ | ❌ | ❌ | ❌ | Medium |
| Export data (CSV) | ✅ | ✅ | ✅ | ❌ | Medium |
| Plate math calculator | ❌ | ❌ | ❌ | ❌ | Low (opportunity) |
| AI workout generation | ❌ | ❌ | ✅ | ✅ | **Our advantage** |
| Nutrition + grocery planning | ❌ | ❌ | ❌ | ✅ | **Our advantage** |
| Missed workout rescheduling | ❌ | ❌ | ❌ | ✅ | **Our advantage** |
| Injury-aware workout modification | ❌ | ❌ | Partial | ✅ | **Our advantage** |

### C. UX Dead Ends & Missing States

1. **No error handling on network failure** — A failed Supabase call during workout logging can lose an entire set. No retry, no offline queue
2. **No empty states** — Achievements, weekly summary, wellness history show blank when no data exists
3. **No confirmation on destructive actions** — Skipping warmup, leaving mid-workout, regenerating meals all happen instantly with no "are you sure?"
4. **Grocery list screen is stubbed** — Exists but doesn't reliably load data
5. **Body measurements collected in onboarding, never shown again** — No trend tracking
6. **No way to add workout notes** — Users can't annotate "felt off today" or "used different bench"

---

## PART 2: WHERE REPPED CAN WIN

No competitor combines **AI workout generation + nutrition planning + grocery lists** in one app. This is our moat. But the moat is only valuable if the core workout tracking is trustworthy first.

### Our Unique Advantages
1. **AI-generated plans** — Fitbod charges $12.99/mo for this. We have it.
2. **Nutrition + meals + grocery** — Nobody else does this. Hevy/Strong/Fitbod are workout-only.
3. **Missed workout intelligence** — Our reschedule/merge/skip options are genuinely novel.
4. **Injury-aware modifications** — We collect injury data and filter exercises. Fitbod does this partially, others don't.
5. **Mind-muscle focus cues** — Per-exercise coaching tips during the workout. Nobody else has this.

### The Retention Problem We Must Solve
- Fitness apps average **8.48% retention at day 30**
- Apps that beat this use either **social accountability** (Hevy) or **zero-decision AI** (Fitbod)
- Fitbod loses users after ~7 workouts when they realize weight suggestions are wrong
- **Our strategy:** Nail weight accuracy first, then social features create stickiness

---

## PART 3: CERTIFICATION & TRUST ROADMAP

### Do We Need FDA/CE Certification?
**No.** Livvia is a general wellness app. As long as we:
- Don't claim to "diagnose, treat, cure, or prevent" any disease
- Don't market as a medical device
- Avoid language like "treats back pain" or "prevents heart disease"

We fall under the **FDA General Wellness Exemption** and **EU MDR exemption**.

### What Actually Builds Trust (Ranked by Impact)

#### Tier 1 — Do Immediately (Free/Low Cost)

| Action | Why | How |
|--------|-----|-----|
| **State algorithms follow ACSM & NSCA guidelines** | Industry gold standard for exercise prescription | Ensure our sets/reps/rest match ACSM tables (see below). Add "Based on ACSM guidelines" in-app |
| **Fix algorithm accuracy** | Nothing kills trust faster than bad weight suggestions | Implement Wathan formula, cap 1RM estimates at 10 reps, use 2-for-2 progression rule |
| **Add "Our Science" page** | Users want to see the methodology. Fitbod has blog posts, RP Hypertrophy cites specific studies | Page in app/website explaining weight suggestion logic, progression rules, with citations |
| **Show the reasoning** | Transparency = trust. "72.5 kg — based on your last session (70×10) + progressive overload" | Already have `weightReasoning` field — surface it prominently |
| **Integrate Apple HealthKit** | 70% of fitness app users expect this. It's a baseline trust signal. Apple reviews your health data handling | Write workouts to Health, read body weight from smart scales, sync sleep data |
| **App Store privacy nutrition labels** | Mandatory, and users check them. Bad labels = no download | Accurately fill out Apple/Google data collection disclosures |

#### Tier 2 — Do Within 3 Months (Moderate Investment)

| Action | Why | How |
|--------|-----|-----|
| **Form an advisory board** | "Programs designed by CSCS-certified coaches" is a massive trust signal | Recruit 2-3 credentialed professionals (CSCS, ACSM-CPT). Feature them on website |
| **Publish a methodology white paper** | Positions Livvia as evidence-based, not just "another AI app" | Document our algorithms, cite sources, publish on website |
| **GDPR compliance** | Required for EU users, trust signal for everyone | Consent management, data portability, right to deletion |
| **Add disclaimers properly** | Legal protection + trust signal | "Consult a physician before starting any exercise program" + injury disclaimers |

#### Tier 3 — Do Within 6-12 Months (High Investment, Highest Credibility)

| Action | Why | How |
|--------|-----|-----|
| **SOC 2 Type II certification** | Industry standard for data security. Shows you take health data seriously | Audit by independent CPA firm. $20K-$100K. |
| **Conduct a pilot study** | Measurable outcomes data. "Users gained 27% more strength" like Fitbod claims | Track 100 users for 12 weeks, measure 1RM improvements |
| **Publish in a peer-reviewed journal** | Gold standard. Noom did this and it's their #1 differentiator | Partner with university kinesiology department. Target JMIR or JSCR |
| **University partnership** | "Validated by [University] Exercise Science Department" | Approach local kinesiology/sports science programs |

---

## PART 4: ALGORITHM ACCURACY STANDARDS

### Our Algorithms Must Match These Evidence-Based Standards

#### Exercise Prescription (ACSM Guidelines, 11th Ed)

| Goal | Load (% 1RM) | Reps | Sets/Exercise | Rest Between Sets | Frequency/Muscle |
|------|-------------|------|---------------|-------------------|-----------------|
| Strength | ≥80% | 1-6 | 3-6 | **2-5 min** | 2-3×/week |
| Hypertrophy | 67-85% | 6-12 | 3-6 | **1-2 min** (newer research: 2-3 min may be better) | 2-3×/week |
| Endurance | ≤67% | 12-25+ | 2-4 | 30s-1 min | 2-3×/week |
| Power | 30-60% (speed) | 1-6 | 3-6 | **2-5 min** | 2-3×/week |

**Action:** Audit our `workout_plan_exercises` generation — ensure rest_seconds, target_sets, target_reps match these ranges for the user's goal.

#### Progressive Overload (NSCA 2-for-2 Rule)
- When user performs **2+ extra reps** above target in the **last set** for **2 consecutive sessions** → increase weight
- Upper body: +2.5 kg (5 lbs)
- Lower body: +5 kg (10 lbs)

**Action:** Our `progression.ts` already checks "if all target reps hit → increase." Update to use the stricter 2-for-2 rule for more conservative, trustworthy progression.

#### 1RM Estimation
- **Primary:** Epley formula `1RM = w × (1 + r/30)` — most recognized
- **More accurate:** Wathan formula `1RM = 100w / (48.8 + 53.8 × e^(-0.075r))`
- **Critical rule:** Cap at 10 reps. Above 10, tell user: "For accurate 1RM, test with heavier weight for fewer reps"

**Action:** Add Wathan as secondary formula. Average both for display. Show accuracy warning above 10 reps.

#### RPE/RIR Scale (Modified Tuchscherer Scale)
| RPE | RIR | Meaning |
|-----|-----|---------|
| 10 | 0 | Max effort, no more reps possible |
| 9 | 1 | Could do 1 more rep |
| 8 | 2 | Could do 2 more reps |
| 7 | 3 | Could do 3 more reps |

**Target zones:**
- Hypertrophy: RPE 7-9 (1-3 RIR)
- Strength: RPE 8-10 (0-2 RIR)
- Deload: RPE 5-6 (4+ RIR)

**Action:** If user logs RPE 10 for 3+ sets → suggest deload next week. If RPE consistently below 7 → suggest weight increase. This alone would make our RPE collection meaningful.

#### Weekly Volume Targets (Sets Per Muscle Group)
- Beginners: 10-12 sets/week
- Intermediate: 12-18 sets/week
- Advanced: 18-24+ sets/week

**Action:** Track and display actual weekly sets per muscle group. Warn if under minimum or over maximum.

---

## PART 5: PRIORITIZED ACTION PLAN

### Phase 1: Trust Foundation (Weeks 1-4)
1. ~~Fix fake volume data on home screen~~ → Query real `set_logs` data
2. Surface progression suggestions post-workout → "Next time: try 72.5 kg"
3. Fix 1RM formula → Add Wathan, cap at 10 reps
4. Add error handling → Network failures, missing data, retry buttons
5. Add "Our Science" section → In settings/about, citing ACSM/NSCA
6. Update rest period defaults → 2-3 min for hypertrophy, 3-5 min for strength

### Phase 2: Feature Parity (Weeks 5-8)
7. Apple HealthKit integration → Write workouts, read weight/sleep
8. Offline workout logging → Queue failed requests, sync when online
9. 1RM progression charts → Show strength over time per exercise
10. Connect readiness data to workout → Modify intensity based on sleep/energy
11. Add superset/dropset/warmup set types
12. Add workout notes

### Phase 3: Competitive Edge (Weeks 9-16)
13. Muscle recovery tracking → Show which muscles are recovered (like Fitbod)
14. RPE-based autoregulation → Auto-suggest deload weeks
15. Custom exercise creation
16. Data export (CSV)
17. Form advisory board with credentialed professionals
18. Publish methodology white paper

### Phase 4: Market Differentiation (Ongoing)
19. Pilot study with university partnership
20. Social features (workout sharing, friend feed)
21. SOC 2 Type II certification
22. Plate math calculator
23. Peer-reviewed publication

---

## APPENDIX: Key Sources

- ACSM's Guidelines for Exercise Testing and Prescription, 11th Edition
- NSCA's Essentials of Strength Training and Conditioning, 4th Edition
- Schoenfeld et al. (2016) — Longer rest periods enhance muscle strength and hypertrophy
- Schoenfeld et al. (2017) — Dose-response relationship of weekly resistance training volume
- LeSuer et al. (1997) — Accuracy of 1RM prediction equations
- Reynolds et al. (2006) — 1RM formula accuracy above 10 reps
- FDA General Wellness Guidance (2019)
- Fitbod Algorithm Blog: fitbod.me/blog/fitbod-algorithm
- Hevy 2025 Features Guide: help.hevyapp.com
