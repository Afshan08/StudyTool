# NSTC / NPTC Physics — 7-Day Battle Plan (Updated Pattern)
## Target: Top 50 | July 4 → July 11 | Zero Calculus Starting Point
## NEW PATTERN: Part I = Physics Logical/Reasoning MCQs (20 marks)

---

## PART A: The Pattern Change (READ THIS FIRST)

### What Changed?

| Old Pattern (2022–2024) | New Pattern (2025) |
|------------------------|-------------------|
| Part I: 5 Bio/Comp + 5 Chem + 5 Math + 5 Physics = 20 MCQs | Part I: **20 Physics logical/reasoning MCQs** |
| Cross-subject general knowledge | Subject-specific reasoning, logic, dimensional analysis, graph interpretation, limiting cases, reference frames |
| Part II: 50 Physics MCQs | Part II: 50 Physics MCQs (unchanged) |
| Part III: 2–3 Descriptive | Part III: 2–3 Descriptive (unchanged) |

### What This Means for You

**Good news:** No more Bio/Chem/Math cramming. You only need Physics.

**Bad news:** The reasoning questions are harder than rote subject MCQs. They test:
- Dimensional analysis (which formula is dimensionally correct?)
- Limiting cases (what happens when m→0 or t→∞?)
- Graph interpretation (slope, area, intercepts)
- Reference frame logic (Galilean relativity, pseudo-forces)
- Symmetry arguments (conservation laws without calculation)
- Order-of-magnitude estimation

### Part I Strategy

| Question Type | How to Solve |
|--------------|--------------|
| Dimensional analysis | Write dimensions of each term. Only one option will be dimensionally consistent. |
| Limiting cases | Plug in extreme values (m=0, θ=0, v→c, etc.) and see which option survives. |
| Graph interpretation | Slope = derivative, area = integral, intercept = initial value. |
| Reference frame | Transform velocities using v_rel = v_obj - v_frame. |
| Symmetry/Conservation | If no external force → momentum conserved. If no friction → energy conserved. |
| Order of magnitude | Round to 1 sig fig, use powers of 10. |

---

## PART B: The Calculus Reality (2 Hours, Not 20)

### You Do NOT Need Calculus Properly

2024 used calculus superficially. You need **3 tricks only**:

**Trick 1 — Power Rule:** `d/dt(t^n) = n·t^(n-1)`, `d/dt(constant) = 0`  
**Trick 2 — Expand and Match:** Given `r(t)`, expand algebraically, match to `s = ut + ½at²`, read off `a`.  
**Trick 3 — Area Under Graph:** Work from F-x graph = area under curve (triangle/rectangle geometry).

### Video Reference (Watch These on Day 1, ~1 hour total)

| Topic | Video | Duration |
|-------|-------|----------|
| Power Rule | Khan Academy: "Power rule" — search YouTube: "Khan Academy power rule introduction" | ~8 min |
| Position → Velocity → Acceleration | Khan Academy: "Derivatives and motion" — search YouTube: "Khan Academy derivative as velocity" | ~10 min |
| Area under curve = Work | Search YouTube: "Work done by variable force graph physics" | ~12 min |
| **Quick link:** https://www.youtube.com/watch?v=IZZM__HL3zE (Khan Academy: Power Rule) | | |

**Note:** You do NOT need integration by parts, chain rule, substitution, or anything beyond the 3 tricks above. Do not spend more than 2 hours on calculus.

### 10 Calculus Drill Problems (NOT Too Easy)

**Instructions:** Solve using ONLY the 3 tricks. No formal integration needed. Time limit: 45 minutes.

**Q1.** A particle moves along the x-axis with position `x(t) = 2t³ − 9t² + 12t + 5` (meters, seconds). Find the time(s) when the particle is instantaneously at rest.  
*Hint: Set dx/dt = 0 using power rule.*

**Q2.** The velocity of a rocket is given by `v(t) = 5t² − 2t + 8` (m/s). Find the acceleration at t = 3 s.  
*Hint: a = dv/dt. Use power rule.*

**Q3.** A charge on a capacitor varies as `Q(t) = 4t² − 2t + 1` (microcoulombs). Find the current at t = 2 s.  
*Hint: I = dQ/dt.*

**Q4.** The position vector of a particle is `r⃗(t) = (3t² − 2t)i⃗ + (t³ + 4t)j⃗`. Find the magnitude of acceleration at t = 1 s.  
*Hint: Differentiate each component twice using power rule.*

**Q5.** A variable force acts on a body as shown in the F-x graph: F increases linearly from 0 to 20 N as x goes from 0 to 4 m, then stays constant at 20 N from x = 4 m to x = 10 m. Find the total work done.  
*Hint: Area under graph = area of triangle + area of rectangle.*

**Q6.** A spring exerts a force `F(x) = 300x + 20x²` (N, x in meters). Find the work done in compressing the spring from x = 0 to x = 0.20 m.  
*Hint: Approximate by evaluating at midpoint and using rectangle, OR use area under curve = (300/2)(0.2)² + (20/3)(0.2)³. But for NSTC, just expand and use average force × distance if linear term dominates.*

**Q7.** Given `r(t) = (1 − βt)² · t` where β is a positive constant, find the acceleration at t = 0.  
*Hint: Expand to r = t − 2βt² + β²t³. Then match to s = ut + ½at² + ... The cubic term means acceleration is not constant; use power rule: a = d²r/dt².*

**Q8.** The magnetic flux through a loop is `Φ(t) = 5t² + 2t + 1` (Wb). Find the magnitude of induced EMF at t = 2 s.  
*Hint: ε = −dΦ/dt. Power rule.*

**Q9.** A particle's position is `x(t) = t⁴ − 4t³ + 6t²`. Find the velocity at the instant when acceleration is zero.  
*Hint: Find a = d²x/dt² = 0, solve for t, then find v = dx/dt at that t.*

**Q10.** The kinetic energy of a particle is `K(t) = 3t³ − 6t² + 4t` (J). Find the power delivered to the particle at t = 2 s.  
*Hint: P = dK/dt. Power rule.*

**Solutions:**
1. v = dx/dt = 6t² − 18t + 12 = 0 → t² − 3t + 2 = 0 → t = 1 s, 2 s.
2. a = dv/dt = 10t − 2 → at t=3: a = 28 m/s².
3. I = dQ/dt = 8t − 2 → at t=2: I = 14 μA.
4. a_x = 6, a_y = 6t → at t=1: a⃗ = 6i⃗ + 6j⃗ → |a| = 6√2 ≈ 8.49 m/s².
5. W = ½(4)(20) + (6)(20) = 40 + 120 = 160 J.
6. W = ∫F dx ≈ ½(300)(0.2)² + (20/3)(0.2)³ = 6 + 0.053 ≈ 6.05 J. (For NSTC, 6 J is sufficient.)
7. r = t − 2βt² + β²t³. v = dr/dt = 1 − 4βt + 3β²t². a = dv/dt = −4β + 6β²t. At t=0: a = −4β.
8. ε = −dΦ/dt = −(10t + 2) → at t=2: |ε| = 22 V.
9. a = 12t² − 24t + 12 = 0 → t² − 2t + 1 = 0 → t = 1 s. v = 4t³ − 12t² + 12t → at t=1: v = 4 m/s.
10. P = dK/dt = 9t² − 12t + 4 → at t=2: P = 36 − 24 + 4 = 16 W.

---

## PART C: 7-Day Hour-by-Hour Schedule

### Day 1 — July 4 (Friday): Diagnostic + Formula Wall + Calculus Crash

| Time | Task | Details |
|------|------|---------|
| 0–3 hrs | **Mock Test** | Take **Mock Test 1** (diagnostic) under exam conditions. |
| 3–4 hrs | **Self-Grade** | Use answer key. Identify top 3 weak chapters. |
| 4–5 hrs | **Build Formula Wall** | Hand-write the formula sheet from Part K. |
| 5–6 hrs | **Calculus Crash** | Watch the 3 videos above. Solve the 10 drill problems. |
| 6–8 hrs | **Giancoli Ch 2 Solved Examples** | Pages 21–48: Examples 2-1 through 2-10. Cover solutions, try yourself first. |

**Evening:** Sleep 7+ hours. No night cramming.

---

### Day 2 — July 5 (Saturday): Mechanics I — Kinematics, Newton's Laws, Work-Energy

| Time | Task | Specific Problems / Pages |
|------|------|--------------------------|
| 0–1.5 hrs | **Giancoli Ch 2–3 Solved Examples** | Pages 21–68: All solved examples. Focus: projectile motion, relative velocity. |
| 1.5–3 hrs | **Giancoli Ch 4–6 Solved Examples** | Pages 69–169: Newton's laws, friction, circular motion, work-energy-power. |
| 3–4 hrs | **Giancoli MisConceptual Questions** | Ch 2 (page 63), Ch 3 (page 88), Ch 4 (page 120), Ch 6 (page 184) — ALL. |
| 4–5 hrs | **Giancoli Problem Blitz** | Ch 2: 30, 35, 41, 42, 50, 55, 60, 65, 70, 71. Ch 3: 10, 15, 25, 35, 44, 50, 55, 59, 61, 64. Ch 4: 12, 25, 29, 35, 50, 55, 60, 64, 75, 80. Ch 6: 26, 30, 35, 39, 45, 50, 55, 60, 65, 72. |
| 5–6 hrs | **HRK Problem Blitz** | Ch 2 (pages 60–63): Problems 34, 35, 50, 55, 60, 65, 70. Ch 3: Review questions 1–10 (page 81). Ch 4: Review questions 1–10 (page 107). |
| 6–8 hrs | **Mock Test 2** | Take Mock Test 2 (Mechanics I focus) under timed conditions. |

---

### Day 3 — July 6 (Sunday): Mechanics II — Momentum, Collisions, Rotation, SHM, Gravitation

| Time | Task | Specific Problems / Pages |
|------|------|--------------------------|
| 0–2 hrs | **Giancoli Ch 5, 7–8, 11 Solved Examples** | Ch 5 (pages 97–124), Ch 7 (pages 170–193), Ch 8 (pages 200–223), Ch 11 (pages 292–310). |
| 2–3 hrs | **Giancoli MisConceptual Questions** | Ch 5 (page 153), Ch 7 (page 212), Ch 8 (page 242), Ch 11 (page 342). |
| 3–4 hrs | **Giancoli Problem Blitz** | Ch 5: 17, 18, 19, 20, 55, 60, 62, 63, 65, 68. Ch 7: 1, 5, 10, 15, 20, 23, 30, 40, 50, 55. Ch 8: 4, 5, 15, 20, 23, 30, 40, 47, 55, 63. Ch 11: 10, 13, 20, 25, 30, 40, 50, 53, 54, 60. |
| 4–5 hrs | **HRK Problem Blitz** | Ch 7 (page 233): Problems 55, 60, 65. Ch 8 (Review page 271): Questions 1–10. Ch 9 (Review page 311): Questions 1–10. Ch 10 (page 352): Problems 55, 60, 65, 70. Ch 15 (page 466): Problems 64, 65, 70, 75, 77, 78. |
| 5–6 hrs | **Collision & Rotation Formula Drills** | Write collision formulas 5 times. Memorize I for disk, sphere, hoop. |
| 6–8 hrs | **Mock Test 3** | Take Mock Test 3 (Mechanics II focus) under timed conditions. |

---

### Day 4 — July 7 (Monday): Electricity, Magnetism & Circuits

| Time | Task | Specific Problems / Pages |
|------|------|--------------------------|
| 0–2.5 hrs | **Giancoli Ch 16–20 Solved Examples** | Ch 16 (pages 443–472), Ch 17 (pages 473–498), Ch 18–19 (pages 499–558), Ch 20 (pages 559–589). |
| 2.5–3.5 hrs | **Giancoli MisConceptual Questions** | Ch 16 (page 489), Ch 17 (page 516), Ch 18 (page 542), Ch 19 (page 572), Ch 20 (page 604). |
| 3.5–4.5 hrs | **Giancoli Problem Blitz** | Ch 16: 1, 5, 10, 15, 20, 25, 30, 35, 40, 44. Ch 17: 1, 5, 10, 15, 20, 25, 28, 29, 52, 53. Ch 19: 1, 5, 10, 15, 20, 23, 28, 36, 37, 50. Ch 20: 7, 10, 15, 20, 25, 30, 35, 40, 43, 50. |
| 4.5–5.5 hrs | **HRK Problem Blitz** | Ch 21 (page 649): Questions 1–10. Ch 22 (page 677): Questions 1–10; Problems 50, 55, 60 (page 683). Ch 24 (page 735): Questions 1–10; Problems 50, 55, 60 (page 741). Ch 25 (page 764): Problems 1, 5, 10, 15, 20, 25, 30, 35, 40, 45. |
| 5.5–6.5 hrs | **Circuit Shortcut Drills** | Two parallel: R_eq = (R1·R2)/(R1+R2). N identical parallel: R_eq = R/N. Power: P = V²/R. |
| 6.5–8 hrs | **Mock Test 4** | Take Mock Test 4 (E&M focus) under timed conditions. |

---

### Day 5 — July 8 (Tuesday): Waves, Optics, Modern Physics + Descriptive Practice

| Time | Task | Specific Problems / Pages |
|------|------|--------------------------|
| 0–2 hrs | **Giancoli Ch 11, 12, 23, 26, 27, 30 Solved Examples** | Ch 11 (SHM, pages 292–310), Ch 12 (Sound, pages 328–350), Ch 23 (Optics, pages 649–680), Ch 26 (Relativity, pages 744–770), Ch 27 (Quantum, pages 771–802), Ch 30 (Nuclear, pages 865–884). |
| 2–3 hrs | **Giancoli MisConceptual Questions** | Ch 11 (page 342), Ch 12 (page 374), Ch 23 (page 693), Ch 26 (page 787), Ch 27 (page 819), Ch 30 (page 901). |
| 3–4 hrs | **Giancoli Problem Blitz** | Ch 11: 10, 13, 20, 25, 30, 40, 50, 53, 54, 60. Ch 12: 1, 5, 10, 15, 20, 25, 30, 35, 40, 50. Ch 23: 1, 5, 10, 15, 20, 25, 34, 35, 50, 60. Ch 27: 1, 5, 10, 15, 20, 25, 30, 35, 40, 50. Ch 30: 13, 14, 15, 20, 25, 30, 40, 50, 60, 61. |
| 4–5 hrs | **HRK Problem Blitz** | Ch 16 (page 498): Problems 1, 5, 10, 15, 20, 25, 30, 35, 40, 45. Ch 27 (page 881): Questions 1–10. Ch 28 (page 927): Problems 1, 5, 10, 15, 20, 25, 30, 35, 40, 45. Ch 30 (Review page 1025): Questions 1–10. |
| 5–6 hrs | **Descriptive Questions Practice** | Solve Part III from 2022, 2023, 2024 papers. Write full solutions with units and diagrams. |
| 6–8 hrs | **Mock Test 5** | Take Mock Test 5 (Waves/Optics/Modern focus) under timed conditions. |

---

### Day 6 — July 9 (Wednesday): Weak Area Blitz + Descriptive Mastery

| Time | Task | Details |
|------|------|---------|
| 0–2 hrs | **Weak Area Blitz: Solved Examples** | Re-read Giancoli solved examples from your 3 weakest chapters. |
| 2–4 hrs | **Weak Area Blitz: Problems** | Do 10 problems per weak chapter from the lists above. |
| 4–5 hrs | **Descriptive Mastery** | Solve 3 new descriptive problems (not from past papers). Use conservation laws + energy methods. |
| 5–6 hrs | **Formula Recitation** | Close all books. Write every formula from memory. |
| 6–7 hrs | **Part I Reasoning Drill** | Solve 20 reasoning-style questions (dimensional analysis, limiting cases, graphs). |
| 7–8 hrs | **Mock Test 6** | Take Mock Test 6 (full syllabus, hard) under timed conditions. |

---

### Day 7 — July 10 (Thursday): Full Mock + Strategy Lock-In

| Time | Task | Details |
|------|------|---------|
| 0–3 hrs | **Mock Test 7** | Take Mock Test 7 (final exam simulation) under exact exam conditions. |
| 3–4 hrs | **Strict Self-Grade** | Mark every question. Calculate expected score. |
| 4–5 hrs | **Error Analysis** | Write WHY for every wrong answer. |
| 5–6 hrs | **Final Formula Review** | Read your wall sheet one last time. |
| 6–7 hrs | **Exam Strategy Review** | Re-read Part L of this document. |
| Rest | **Sleep Early** | Brain consolidation happens in sleep. |

---

## PART D: Exact Book References — Giancoli 7th Edition

### Solved Examples (Read These First, Cover Solution, Try Yourself)

| Chapter | Topic | Pages | Examples to Study |
|---------|-------|-------|-----------------|
| Ch 2 | 1D Kinematics | 21–48 | Ex 2-1, 2-2, 2-3, 2-4, 2-5, 2-6, 2-7, 2-8, 2-9, 2-10 |
| Ch 3 | 2D Kinematics | 49–68 | Ex 3-1, 3-2, 3-3, 3-4, 3-5, 3-6, 3-7 |
| Ch 4 | Newton's Laws | 69–96 | Ex 4-1, 4-2, 4-3, 4-4, 4-5, 4-6, 4-7, 4-8, 4-9, 4-10, 4-11, 4-12, 4-13, 4-14 |
| Ch 5 | Gravitation | 97–124 | Ex 5-1, 5-2, 5-3, 5-4, 5-5, 5-6, 5-7, 5-8, 5-9, 5-10 |
| Ch 6 | Work, Energy, Power | 138–169 | Ex 6-1, 6-2, 6-3, 6-4, 6-5, 6-6, 6-7, 6-8, 6-9, 6-10, 6-11, 6-12, 6-13, 6-14 |
| Ch 7 | Momentum | 170–193 | Ex 7-1, 7-2, 7-3, 7-4, 7-5, 7-6, 7-7, 7-8, 7-9, 7-10, 7-11, 7-12, 7-13 |
| Ch 8 | Rotational Motion | 200–223 | Ex 8-1, 8-2, 8-3, 8-4, 8-5, 8-6, 8-7, 8-8, 8-9, 8-10, 8-11, 8-12, 8-13, 8-14 |
| Ch 11 | SHM, Waves | 292–310 | Ex 11-1, 11-2, 11-3, 11-4, 11-5, 11-6, 11-7, 11-8, 11-9, 11-10 |
| Ch 16 | Electric Charge | 443–472 | Ex 16-1, 16-2, 16-3, 16-4, 16-5, 16-6, 16-7, 16-8, 16-9, 16-10 |
| Ch 17 | Electric Potential | 473–498 | Ex 17-1, 17-2, 17-3, 17-4, 17-5, 17-6, 17-7, 17-8, 17-9, 17-10 |
| Ch 19 | DC Circuits | 499–558 | Ex 19-1, 19-2, 19-3, 19-4, 19-5, 19-6, 19-7, 19-8, 19-9, 19-10, 19-11, 19-12 |
| Ch 20 | Magnetism | 559–589 | Ex 20-1, 20-2, 20-3, 20-4, 20-5, 20-6, 20-7, 20-8, 20-9, 20-10 |
| Ch 23 | Geometric Optics | 649–680 | Ex 23-1, 23-2, 23-3, 23-4, 23-5, 23-6, 23-7, 23-8, 23-9, 23-10 |
| Ch 27 | Quantum Physics | 771–802 | Ex 27-1, 27-2, 27-3, 27-4, 27-5, 27-6, 27-7, 27-8, 27-9, 27-10 |
| Ch 30 | Nuclear Physics | 865–884 | Ex 30-1, 30-2, 30-3, 30-4, 30-5, 30-6, 30-7, 30-8, 30-9, 30-10 |

### MisConceptual Questions (End of Chapter — Do ALL)

| Chapter | Page | Count |
|---------|------|-------|
| Ch 2 | 63 | ~15 |
| Ch 3 | 88 | ~15 |
| Ch 4 | 120 | ~15 |
| Ch 5 | 153 | ~15 |
| Ch 6 | 184 | ~15 |
| Ch 7 | 212 | ~15 |
| Ch 8 | 242 | ~15 |
| Ch 11 | 342 | ~15 |
| Ch 12 | 374 | ~15 |
| Ch 16 | 489 | ~15 |
| Ch 17 | 516 | ~15 |
| Ch 18 | 542 | ~15 |
| Ch 19 | 572 | ~15 |
| Ch 20 | 604 | ~15 |
| Ch 23 | 693 | ~15 |
| Ch 26 | 787 | ~15 |
| Ch 27 | 819 | ~15 |
| Ch 30 | 901 | ~15 |

### General Problems (Selected — Do These)

| Chapter | Problems | Page | Difficulty |
|---------|----------|------|------------|
| Ch 2 | 30, 35, 41, 42, 50, 55, 60, 65, 70, 71, 80, 85, 90, 95, 99 | 43–48 | I–III |
| Ch 3 | 10, 15, 25, 35, 44, 50, 55, 59, 61, 64 | 65–68 | I–III |
| Ch 4 | 12, 25, 29, 35, 50, 55, 60, 64, 75, 80 | 93–96 | I–III |
| Ch 5 | 17, 18, 19, 20, 55, 60, 62, 63, 65, 68 | 133–136 | II–III |
| Ch 6 | 26, 30, 35, 39, 45, 50, 55, 60, 65, 72 | 165–169 | I–III |
| Ch 7 | 1, 5, 10, 15, 20, 23, 30, 40, 50, 55 | 190–193 | I–III |
| Ch 8 | 4, 5, 15, 20, 23, 30, 40, 47, 55, 63 | 220–223 | I–III |
| Ch 11 | 10, 13, 20, 25, 30, 40, 50, 53, 54, 60 | 322–327 | II–III |
| Ch 16 | 1, 5, 10, 15, 20, 25, 30, 35, 40, 44 | 469–472 | I–III |
| Ch 17 | 1, 5, 10, 15, 20, 25, 28, 29, 52, 53 | 496–498 | I–III |
| Ch 19 | 1, 5, 10, 15, 20, 23, 28, 36, 37, 50 | 553–558 | I–III |
| Ch 20 | 7, 10, 15, 20, 25, 30, 35, 40, 43, 50 | 583–589 | II–III |
| Ch 23 | 1, 5, 10, 15, 20, 25, 34, 35, 50, 60 | 675–680 | I–III |
| Ch 27 | 1, 5, 10, 15, 20, 25, 30, 35, 40, 50 | 798–802 | I–III |
| Ch 30 | 13, 14, 15, 20, 25, 30, 40, 50, 60, 61 | 911–914 | I–III |

---

## PART E: Exact Book References — HRK (Halliday, Resnick, Walker 10th Ed)

### Solved Examples (Called "Sample Problems" or "Checkpoint Questions")

| Chapter | Topic | Pages | What to Study |
|---------|-------|-------|-------------|
| Ch 2 | Motion Along Straight Line | 13–40 | Sample Problems 2-1 through 2-8. Checkpoints 1–5. |
| Ch 3 | Vectors | 41–60 | Sample Problems 3-1 through 3-6. Checkpoints 1–3. |
| Ch 4 | Motion in 2D & 3D | 61–88 | Sample Problems 4-1 through 4-8. Checkpoints 1–5. |
| Ch 5 | Force and Motion I | 89–116 | Sample Problems 5-1 through 5-6. Checkpoints 1–4. |
| Ch 6 | Force and Motion II | 124–148 | Sample Problems 6-1 through 6-5. Checkpoints 1–4. |
| Ch 7 | Kinetic Energy and Work | 149–172 | Sample Problems 7-1 through 7-5. Checkpoints 1–4. |
| Ch 8 | Potential Energy, Conservation | 173–196 | Sample Problems 8-1 through 8-5. Checkpoints 1–4. |
| Ch 9 | Center of Mass, Momentum | 197–228 | Sample Problems 9-1 through 9-7. Checkpoints 1–5. |
| Ch 10 | Rotation | 257–294 | Sample Problems 10-1 through 10-7. Checkpoints 1–5. |
| Ch 13 | Gravitation | 353–380 | Sample Problems 13-1 through 13-5. Checkpoints 1–3. |
| Ch 15 | Oscillations | 413–442 | Sample Problems 15-1 through 15-5. Checkpoints 1–4. |
| Ch 21 | Coulomb's Law | 561–584 | Sample Problems 21-1 through 21-4. Checkpoints 1–3. |
| Ch 22 | Electric Fields | 585–608 | Sample Problems 22-1 through 22-5. Checkpoints 1–4. |
| Ch 24 | Electric Potential | 633–656 | Sample Problems 24-1 through 24-5. Checkpoints 1–4. |
| Ch 25 | Capacitance | 657–680 | Sample Problems 25-1 through 25-4. Checkpoints 1–3. |
| Ch 27 | Circuits | 705–738 | Sample Problems 27-1 through 27-5. Checkpoints 1–4. |
| Ch 28 | Magnetic Fields | 739–768 | Sample Problems 28-1 through 28-5. Checkpoints 1–4. |
| Ch 38 | Photons, Matter Waves | 1059–1082 | Sample Problems 38-1 through 38-5. Checkpoints 1–4. |
| Ch 42 | Nuclear Physics | 1165–1194 | Sample Problems 42-1 through 42-5. Checkpoints 1–3. |

### Questions & Problems (Selected)

| Chapter | Pages | Problems to Solve |
|---------|-------|-------------------|
| Ch 2 | 60–63 | 34, 35, 50, 55, 60, 65, 70 |
| Ch 3 | 81 | Review Questions 1–10 |
| Ch 4 | 107 | Review Questions 1–10 |
| Ch 5 | 140 | Questions 1–10 |
| Ch 6 | 165 | Questions 1–10 |
| Ch 7 | 225, 233 | Review Questions 1–10; Problems 55, 60, 65 |
| Ch 8 | 271 | Review Questions 1–10 |
| Ch 9 | 311 | Review Questions 1–10 |
| Ch 10 | 352 | Additional Problems 55, 60, 65, 70 |
| Ch 15 | 466 | Problems 64, 65, 70, 75, 77, 78 |
| Ch 16 | 498 | Problems 1, 5, 10, 15, 20, 25, 30, 35, 40, 45 |
| Ch 21 | 649, 653 | Questions 1–10; Additional Problems 38, 40, 45, 50 |
| Ch 22 | 677, 683 | Questions 1–10; Problems 50, 55, 60 |
| Ch 24 | 735, 741 | Questions 1–10; Problems 50, 55, 60, 65, 68 |
| Ch 25 | 764 | Problems 1, 5, 10, 15, 20, 25, 30, 35, 40, 45 |
| Ch 27 | 881 | Questions 1–10 |
| Ch 28 | 927 | Problems 1, 5, 10, 15, 20, 25, 30, 35, 40, 45 |
| Ch 30 | 1025 | Review Questions 1–10 |
| Ch 38 | 1271 | Review Questions 1–10 |
| Ch 42 | 1298 | Problems 1, 5, 10, 15, 20, 25, 30, 35, 40, 45 |

**Note:** HRK uses dots (•) for difficulty: • = easy, •• = medium, ••• = hard. For NSTC prep, aim for •• and ••• problems. Odd-numbered problems usually have answers in the back.

---

## PART F: How to Read the Books (Efficiently)

### Giancoli Method (Recommended for You)
1. Open the chapter. Go straight to the **solved examples** (blue/shaded boxes).
2. Read the problem statement. **Cover the solution.**
3. Try to solve it yourself on paper.
4. Check. If wrong, understand why.
5. Move to the next example. Skip all theory paragraphs.
6. After all examples, do **MisConceptual Questions** (these are MCQs — NSTC style).
7. Then do the **selected General Problems** from the list above.

### HRK Method (Supplement)
1. Read **Sample Problems** only. Skip derivations.
2. Do **Checkpoint questions** (short concept checks).
3. Do selected **Questions** (conceptual) and **Problems** (numerical).
4. Check answers for odd-numbered problems in the back.

### Time per Chapter
- **Easy chapter** (you know the topic): 1.5 hours (examples + MisConceptual + 5 problems)
- **Medium chapter** (some familiarity): 2.5 hours
- **Hard chapter** (completely new): 3.5 hours (examples + MisConceptual + 10 problems)

---

## PART G: Problem-Solving Shortcuts for Non-Calculus Solvers

### Kinematics — The "Expand and Match" Trick
If given `x(t)` and asked for acceleration:
1. Expand the expression algebraically.
2. Match to `x = x₀ + ut + ½at²`.
3. Read off `u` and `a`.

**Example (2024 Q22):** `r = (1-βt)t·r₀ = tr₀ - βt²r₀`  
Match to `s = ut + ½at²`: `u = r₀`, `½a = -βr₀`, so `a = -2βr₀`.  
Done. No calculus needed.

**But if cubic:** `x(t) = t - 2βt² + β²t³` → acceleration is not constant. Use power rule: `a = d²x/dt² = -4β + 6β²t`. This is what Q7 tests.

### Work with Variable Force — The "Area" Trick
If given an F-x graph, work = area under curve.  
Triangle area = ½×base×height. Rectangle area = base×height.  
This replaces integration completely.

### SHM — The "Formula Recall" Trick
Never derive `T = 2π√(L/g)` or `T = 2π√(m/k)`. Memorize them.  
NSTC always tests application, not derivation.

### Rolling Without Slipping — The "Energy" Trick
For any rolling object: `mgh = ½mv² + ½Iω²` + work against friction.  
Use `I = c·mR²` where `c = ½` for solid cylinder, `c = ⅖` for solid sphere, `c = ⅔` for hollow sphere, `c = 1` for hoop.  
Use `v = Rω`. Solve for `v`. No torque equations needed.

### Collisions — The "Memorize 1D Elastic" Trick
For elastic collision in 1D with target at rest:  
`v₁' = (m₁-m₂)/(m₁+m₂) · v₁`  
`v₂' = (2m₁)/(m₁+m₂) · v₁`  
Memorize these. Saves 5 minutes per question.

### Circuits — The "Quick Parallel" Trick
For two resistors in parallel: `R_eq = (R1×R2)/(R1+R2)`.  
For N identical resistors R in parallel: `R_eq = R/N`.  
For a short circuit (wire across resistor): that resistor is dead, current goes through wire only.

---

## PART H: Descriptive Question Strategy (Part III = Tie-Breaker)

### Why Part III Matters
Two candidates with 75/100 in MCQs — the one with 25/30 in Part III ranks higher.  
**Part III is the difference between rank #50 and rank #150.**

### How to Approach Descriptive Questions

**Step 1 — Read all parts first.** Sometimes part (b) gives a hint for part (a).

**Step 2 — Write down given data with units.**
```
Given: m = 2.00 × 10³ kg, h = 36.0 km, t = 60 s, a = constant
Find: (a) a, (b) max height, (c) total time, (d) work done
```

**Step 3 — State the physical principle.**
```
Using Newton's Second Law: F_net = ma
Using Conservation of Energy: KE_i + PE_i = KE_f + PE_f
Using Kinematic Equation: v = u + at
```

**Step 4 — Show every step.** Partial marks are generous.

**Step 5 — If stuck on part (a), assume a symbolic answer.**
```
Let the acceleration be a.
Then for part (b): h_max = h + v²/(2g) where v = at from part (a).
```
Examiners often give **follow-through marks** even if part (a) is wrong.

**Step 6 — Draw clear, labeled diagrams.** A good diagram can earn 20–30% of marks even if calculations are slightly off.

**Step 7 — Leave 2–3 lines between parts** for examiner readability.

**Step 8 — For "estimate" questions, show your approximation logic.**
```
Estimate g ≈ 10 m/s², π ≈ 3, √2 ≈ 1.4
```

### Common Descriptive Topics (from Past Papers)

| Year | Topics |
|------|--------|
| 2022 | Rocket kinematics, elastic collision (neutron moderation), radioactive decay |
| 2023 | Spring-mass energy, gravitational motion (Kepler's laws), planetary data analysis |
| 2024 | Capacitor energy, fluid dynamics (Torricelli), electromagnetic induction |

**Prediction for 2025:** Mechanics (energy + momentum) + Electromagnetism (circuits/capacitors) + One modern physics topic.

### Descriptive Practice Problems (Do These on Day 5)

**D1.** A 5.0 kg block is attached to a spring with k = 200 N/m on a frictionless horizontal surface. The block is displaced 0.30 m from equilibrium and released.
(a) Find the maximum speed of the block.
(b) Find the period of oscillation.
(c) If the block encounters a rough patch (μ_k = 0.20) of length 0.50 m when passing through equilibrium, how far beyond the rough patch does it travel before stopping?

**D2.** A satellite of mass m orbits Earth at radius R = 2R_Earth.
(a) Find the orbital speed in terms of g and R_Earth.
(b) Find the period of orbit.
(c) If the satellite fires thrusters to move to R = 4R_Earth, what is the new period?

**D3.** In a nuclear reactor, a neutron (mass m) collides elastically with a stationary carbon nucleus (mass 12m).
(a) What fraction of the neutron's kinetic energy is transferred to the carbon nucleus?
(b) How many such collisions are needed to reduce the neutron's energy to 1/10⁶ of its original value?

**D4.** A parallel-plate capacitor has plate area A = 10⁻² m² and separation d = 2 mm. A dielectric of thickness 1 mm and κ = 5 is inserted.
(a) Find the capacitance.
(b) If connected to 100 V, find the energy stored.
(c) The dielectric is slowly removed. Find the work done by the external agent.

**D5.** A square loop of side 10 cm and resistance 2 Ω is placed perpendicular to a magnetic field B = 0.5 T. The field decreases uniformly to zero in 0.4 s.
(a) Find the induced current.
(b) Find the total charge that flows through the loop.
(c) Find the heat dissipated in the loop.

---

## PART I: Topic Priority Map (Where Marks Come From)

Based on analysis of 2022, 2023, and 2024 papers:

| Topic | Part II Weight | Priority | Learn Without Calculus? |
|-------|---------------|----------|------------------------|
| **Mechanics (Kinematics, Forces, Energy, Momentum)** | ~35% | 🔴 CRITICAL | ✅ Yes |
| **Rotation, SHM, Gravitation** | ~15% | 🔴 CRITICAL | ✅ Yes |
| **Electricity & DC Circuits** | ~15% | 🟡 HIGH | ✅ Yes |
| **Magnetism & Induction** | ~8% | 🟡 HIGH | ✅ Yes |
| **Waves, Sound, Optics** | ~12% | 🟢 MEDIUM | ✅ Yes |
| **Modern Physics (Photoelectric, Radioactivity)** | ~10% | 🟢 MEDIUM | ✅ Yes |
| **Thermodynamics, Fluids** | ~5% | 🟢 MEDIUM | ✅ Yes |

---

## PART J: Master Formula Sheet (Write This on Your Wall)

### MECHANICS (60% of exam)

**Kinematics**
```
v = u + at
s = ut + ½at²
v² = u² + 2as
s = ½(u+v)t
Average velocity = total displacement / total time
```

**Forces & Newton's Laws**
```
F_net = ma
Weight = mg
Friction: f_s ≤ μ_s·N,  f_k = μ_k·N
Inclined plane: a = g(sinθ - μcosθ)
```

**Work, Energy, Power**
```
Work = F·d·cosθ
KE = ½mv²
PE_grav = mgh
PE_spring = ½kx²
Power = Work/time = F·v
Work-Energy Theorem: W_net = ΔKE
Conservation: KE_i + PE_i = KE_f + PE_f + W_friction
```

**Momentum & Collisions**
```
p = mv
Conservation: m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'
Impulse = F·Δt = Δp
Elastic collision (target at rest):
  v₁' = (m₁-m₂)/(m₁+m₂) · v₁
  v₂' = (2m₁)/(m₁+m₂) · v₁
Inelastic: v' = (m₁v₁ + m₂v₂)/(m₁+m₂)
```

**Circular Motion & Gravitation**
```
a_c = v²/r = ω²r
F_c = mv²/r
v_orbital = √(GM/r)
T² = (4π²/GM)·R³   (Kepler's 3rd)
g_surface = GM/R²
Escape velocity = √(2GM/R)
```

**Rotational Motion**
```
τ = I·α
L = Iω
KE_rot = ½Iω²
I_disk = ½MR², I_sphere = ⅖MR², I_hoop = MR²
Rolling: v = Rω,  Total KE = ½mv² + ½Iω²
Conservation of angular momentum: I₁ω₁ = I₂ω₂
```

**SHM & Waves**
```
T_spring = 2π√(m/k)
T_pendulum = 2π√(L/g)
E_total = ½kA²
v_max = Aω = A√(k/m)
v = fλ
ω = 2πf = 2π/T
```

### ELECTRICITY & MAGNETISM (25% of exam)

**Electrostatics**
```
F = k·q₁q₂/r²   (k = 8.99×10⁹ N·m²/C²)
E = kQ/r²
V = kQ/r
E = V/d  (uniform field)
PE_electric = qV
```

**Capacitors**
```
C = Q/V
C_parallel = C₁ + C₂ + ...
1/C_series = 1/C₁ + 1/C₂ + ...
U = ½CV² = ½QV = Q²/2C
C = ε₀A/d
```

**Circuits**
```
V = IR
P = VI = I²R = V²/R
R_series = R₁ + R₂ + ...
1/R_parallel = 1/R₁ + 1/R₂ + ...
EMF = IR + Ir (internal resistance r)
```

**Magnetism**
```
F = qvBsinθ
F = ILBsinθ
r = mv/(qB)  (circular motion in B-field)
Transformer: V₂/V₁ = N₂/N₁ = I₁/I₂
```

**Induction**
```
ε = -N·ΔΦ/Δt
Φ = BAcosθ
```

### WAVES & OPTICS (10% of exam)

**Optics**
```
1/f = 1/do + 1/di
m = -di/do = hi/ho
f = R/2
n = c/v
n₁sinθ₁ = n₂sinθ₂  (Snell's law)
critical angle: sinθ_c = n₂/n₁ (n₁ > n₂)
```

**Physical Optics**
```
λ = h/p  (de Broglie)
E = hf = hc/λ
hc = 1240 eV·nm
```

### MODERN PHYSICS & THERMODYNAMICS (5% of exam)

**Modern Physics**
```
KE_max = hf - φ  (photoelectric)
E_n = -13.6/n² eV  (hydrogen)
N = N₀·e^(-λt)
t½ = ln2/λ ≈ 0.693/λ
After n half-lives: fraction remaining = (1/2)ⁿ
```

**Thermodynamics**
```
PV = nRT
KE_avg = (3/2)kT
First Law: ΔU = Q - W
Carnot efficiency = 1 - T_cold/T_hot
Speed of sound in ideal gas: v = √(γRT/M)
```

---

## PART K: Calculus Tricks (Just 3)

```
1) d/dt(tⁿ) = n·tⁿ⁻¹          d/dt(constant) = 0
2) Given r(t) → expand → match to s=ut+½at² → read a
3) Work from F-x graph = AREA under curve
```

---

## PART L: Exam-Day Strategy (Top 50 Tactics)

### Before the Exam
- Sleep 7+ hours. Memory consolidation happens during deep sleep.
- Eat a light, protein-rich breakfast. Avoid heavy carbs that cause drowsiness.
- Arrive 30 min early. Use the time to mentally recite formulas.
- Bring: pens, pencils, eraser, non-programmable calculator, watch, water.

### During the Exam — Time Allocation

| Section | Time Budget | Questions | Marks |
|---------|-------------|-----------|-------|
| Part I | 25–30 min | 20 MCQs | 20 |
| Part II | 70–75 min | 50 MCQs | 50 |
| Part III | 50–60 min | 2–3 Descriptive | 30 |
| Review | 15–20 min | — | — |

### The Negative Marking Rule

| Confidence | Action |
|------------|--------|
| 100% sure | Mark it. |
| Can eliminate 2 options | Guess between remaining 2. Expected value is positive. |
| Can eliminate only 1 or none | **LEAVE BLANK.** -⅓ is painful. |

### Part I Tactics (Physics Reasoning)
- Scan all 20 first. Do the "instant" ones (dimensional analysis, graph slope) first.
- Limiting case questions: Plug in extreme values quickly.
- Reference frame questions: Use relative velocity formula.
- Any question taking >1.5 min → mark for review, move on.

### Part II Tactics (Physics MCQs)
- Do formula plug-in questions first.
- Graph-based: check axes, slopes, intercepts before calculating.
- "Which graph best represents..." → eliminate impossible options first.
- Dimensional analysis: check units of answer choices.
- Conservation law questions: if system is isolated, state conservation explicitly.

### Part III Tactics (Descriptive)
- Read ALL parts before starting.
- Write down given data with units.
- State the physical principle you're using.
- Show every step. Partial marks are generous.
- If stuck on (a), assume symbolic answer and use in (b).
- Draw clear, labeled diagrams.
- Leave 2–3 lines between parts.

### Emergency Tactics
- If running out of time in Part II: mark ALL remaining questions with your best guess. Unanswered = 0. Guessed = expected +0.25. **Never leave blank** in the last 5 minutes.
- If a Part III question is completely unfamiliar: write down relevant formulas, draw a diagram, explain in words what would happen. This can earn 20–30% of marks.

---

## PART M: Final Checklist — Print and Tick Each Day

### Day 1
- [ ] Mock Test 1 completed under timed conditions
- [ ] Self-graded honestly
- [ ] Top 3 weak chapters identified
- [ ] Formula wall created
- [ ] 3 calculus videos watched
- [ ] 10 calculus drill problems solved
- [ ] Giancoli Ch 2 solved examples read

### Day 2
- [ ] Giancoli Ch 2–3–4–6 solved examples read
- [ ] All MisConceptual Questions from Ch 2,3,4,6 done
- [ ] Giancoli problems from Ch 2,3,4,6 done (35+ problems)
- [ ] HRK problems from Ch 2,3,4 done
- [ ] Mock Test 2 completed

### Day 3
- [ ] Giancoli Ch 5,7,8,11 solved examples read
- [ ] All MisConceptual Questions from Ch 5,7,8,11 done
- [ ] Giancoli problems from Ch 5,7,8,11 done (35+ problems)
- [ ] HRK problems from Ch 7,8,9,10,15 done
- [ ] Collision formulas memorized
- [ ] Mock Test 3 completed

### Day 4
- [ ] Giancoli Ch 16–20 solved examples read
- [ ] All MisConceptual Questions from Ch 16,17,18,19,20 done
- [ ] Giancoli problems from Ch 16,17,19,20 done (35+ problems)
- [ ] HRK problems from Ch 21,22,24,25 done
- [ ] Circuit shortcuts memorized
- [ ] Mock Test 4 completed

### Day 5
- [ ] Giancoli Ch 11,12,23,26,27,30 solved examples read
- [ ] All MisConceptual Questions from Ch 11,12,23,26,27,30 done
- [ ] Giancoli problems from Ch 11,12,23,27,30 done (35+ problems)
- [ ] HRK problems from Ch 16,27,28,30 done
- [ ] Part III from 2022, 2023, 2024 solved fully
- [ ] Mock Test 5 completed

### Day 6
- [ ] Weak area blitz completed (10 problems per weak chapter)
- [ ] 3 new descriptive problems solved
- [ ] Formula recitation from memory done
- [ ] 20 reasoning-style questions solved
- [ ] Mock Test 6 completed

### Day 7
- [ ] Mock Test 7 completed under exam conditions
- [ ] Strict self-grade completed
- [ ] Error analysis written
- [ ] Final formula review done
- [ ] Exam strategy reviewed
- [ ] Early sleep

### Exam Day
- [ ] Light breakfast
- [ ] Arrived early
- [ ] Calculator and supplies ready
- [ ] Formulas mentally recited
- [ ] Stayed calm

---

**Good luck. Thousands will attempt this. Only 50 will make it. Be one of them.**
