# EDO-Cloud Scheduler

> **Multi-Objective Cloud Task Scheduling** powered by the Enterprise Development Optimizer (EDO)

A simulation-driven decision support tool for cloud scheduling research. Configure workloads, run optimization experiments with EDO/PSO/ACO/WOA, simulate via CloudSim, and visualize results through interactive dashboards.

---

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │◄──►│   Backend    │◄──►│  Optimization│
│  (Next.js)   │    │  (Express)   │    │  (Python)    │
└──────────────┘    └──────┬───────┘    └──────────────┘
                          │
                    ┌─────┴──────┐
                    │  Database  │    ┌──────────────┐
                    │  (MongoDB) │    │  Simulation  │
                    └────────────┘    │  (CloudSim)  │
                                      └──────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (React, TypeScript, Tailwind CSS, Shadcn/UI) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Optimization | Python 3.10+ (NumPy, Pandas) |
| Simulation | Java 17+ (CloudSim 4.x) |
| Charts | Recharts |
| Auth | JWT + bcrypt |

## Project Structure

```
edo/
├── client/          # Next.js frontend
├── server/          # Express.js backend API
├── optimizer/       # Python optimization engine (EDO, PSO, ACO, WOA)
├── simulator/       # Java CloudSim simulation engine
├── docs/            # PRD, Design, Tech Rules
├── todo.md          # Project task breakdown
└── .env.example     # Environment variables template
```

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.10+
- Java 17+
- MongoDB (local or Atlas)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd edo

# 2. Set up environment
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# 3. Install frontend
cd client && npm install

# 4. Install backend
cd ../server && npm install

# 5. Install optimizer
cd ../optimizer && pip install -r requirements.txt

# 6. Start development
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

### Access

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

## Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [UI/UX Design](docs/Design.md)
- [Tech Rules & Stack](docs/TechRules.md)
- [Task Breakdown](todo.md)

## Team

- A. Jaideep — 227Z1A0508
- G. Sai Teja — 227Z1A0559
- B. Bhanu Prasad — 227Z1A0514

**Guide:** Dr. K. Rameshwaraiah, Professor & Head, Dept. of CSE

## License

This project is for academic research and evaluation purposes.
