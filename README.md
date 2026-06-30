# StayIn

**A mobile platform for finding compatible flatmates and shared housing, built around a hybrid recommendation engine that scores mutual lifestyle compatibility — not just listings.**

![React Native](https://img.shields.io/badge/React_Native-Frontend-000020?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-Frontend-000020?logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Recommender-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169E1?logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)

> Final Degree Project (TFG) — Computer Engineering, ETSIIT, Universidad de Granada.

---

## What it does

Finding a flat to share is rarely a problem of *availability* — it's a problem of *compatibility*. Most housing apps stop at filtering by price and location and leave the hardest part (will I actually get along with these people?) to luck.

StayIn models that compatibility explicitly. Users answer a short lifestyle questionnaire (schedules, cleanliness, social habits, noise tolerance, etc.), and the platform recommends both **listings** and **potential flatmates** ranked by a compatibility score that works in *both directions* — your fit with them and theirs with you.

---

## Why this is interesting (technically)

The recommendation engine is the core of the project. It's built in four layers, each solving a concrete problem:

**1. Lifestyle affinity in Likert space.**
Questionnaire answers live on Likert scales, so two profiles can be compared as points in a normalized vector space. Affinity is computed as a **normalized Euclidean distance** mapped to a `[0, 1]` score, which keeps comparisons stable regardless of how many dimensions a given profile has filled in.

**2. Bidirectional matching via harmonic mean.**
A one-directional score (how much *you* like a candidate) is misleading for shared living — both sides have to want the match. StayIn combines the two directional scores using a **harmonic mean**, giving less weight to outlier scores and more to smaller values, so that those cases where one score is really low, show a much more real compatibility score.

**3. Three-layer cold-start strategy.**
New users have no interaction history, which breaks naive collaborative filtering. The engine degrades gracefully: it falls back from interaction-based signals to content-based affinity to popularity/locality priors, so a brand-new user still gets sensible recommendations from their first session.

**4. Layered pruning for performance.**
Scoring every candidate against every other is `O(n²)` and doesn't scale. Cheap filters (geography, hard constraints) run first to shrink the candidate set before the expensive compatibility scoring runs, keeping response times usable as the user base grows.

> The full mathematical justification (distance normalization, the choice of harmonic over arithmetic mean, and the cold-start decision tree) is documented in the project report.

---

## Architecture

```
┌─────────────────────┐
│  Mobile app          │   React Native + Expo
│  (iOS / Android)     │
└──────────┬───────────┘
           │ REST
┌──────────▼───────────┐
│  API / business layer│   Node.js
│  auth, listings, CRUD│◄──────────────┐
└──────────┬───────────┘               |
           │                           |
┌──────────▼───────────┐     ┌─────────|───────────┐
│  Recommender service │◄────│  PostgreSQL          │
│  Python / FastAPI    │     │  + pgvector          │
│  compatibility engine│     │  (profile vectors)   │
└──────────────────────┘     └──────────────────────┘
```

- **App layer** (React Native + Expo) — cross-platform client, treated as a transversal non-functional requirement rather than two separate builds.
- **API layer** (Node.js) — authentication, listing management, and orchestration.
- **Recommender service** (Python + FastAPI) — isolated so the scoring logic can evolve independently of the product API.
- **Data layer** (PostgreSQL + Docker) — relational data plus containerized via Docker.

---

## Tech stack

| Layer | Technology |
|---|---|
| Mobile client | React Native, Expo |
| Backend API | Node.js |
| Recommender | Python, FastAPI |
| Database | PostgreSQL, pgvector |
| Cache | Redis |
| Testing | pytest |

---

## Testing

The recommendation engine is covered by a **pytest suite of 38 tests** validating the scoring logic, the bidirectional combination, and the cold-start fallbacks. One edge case is documented as a known limitation rather than silently passed — the suite is meant to be honest about boundaries, not just green.

```bash
pytest
```

---

## Engineering decisions worth calling out

A few choices were deliberate trade-offs rather than omissions:

- **Scoped the rating/review features out** as a conscious product decision, to keep the MVP focused on the matching problem rather than a secondary feedback system.
- **Treated multiplatform support as a transversal non-functional requirement**, not a separate feature, which kept the requirement model clean.
- **Deferred infrastructure load-testing** to a future iteration, documented explicitly so the limitation is visible.

---

## Status

Completed as a Final Degree Project at ETSIIT (Universidad de Granada). The full report covers the requirements analysis, the recommendation engine's mathematical foundations, and the validation strategy.

## Roadmap / next steps

- [ ] Public demo deployment
- [ ] Infrastructure load-testing
- [ ] CI pipeline for the recommender test suite
- [ ] Reintroduce reputation/rating system
- [ ] Training of a ML model to improve recommendations

---

## Links

- 🔗 **Portfolio:** coming soon
- 📄 **Project report (TFG):** 
- 📱 **Demo / screenshots:** 

---

## Author

**Carlos** — Full-Stack / AI Engineer
Computer Engineering, Universidad de Granada

- LinkedIn — _add link_
- GitHub — _add link_
