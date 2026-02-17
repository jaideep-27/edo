<div align="center">

# 🌌 EDO-Cloud Scheduler

**Multi-Objective Cloud Task Scheduling Powered by the Enterprise Development Optimizer**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5-000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://python.org/)
[![CloudSim](https://img.shields.io/badge/CloudSim_Plus-8.0-blue)](https://cloudsimplus.org/)

</div>

---

## 📋 Overview

EDO-Cloud Scheduler is a full-stack platform for **multi-objective cloud task scheduling**. It lets users configure workloads and virtual machines, run scheduling experiments using 8 different algorithms, simulate execution via CloudSim Plus, and visualise results with interactive charts.

**Academic Project** — Batch A01, CMR Technical Campus  
**Team:** A. Jaideep, G. Sai Teja, B. Bhanu Prasad  
**Guide:** Dr. K. Rameshwaraiah

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧪 **8 Algorithms** | EDO, PSO, ACO, GA, WOA, Round Robin, Min-Min, Max-Min |
| 📊 **Rich Visualisation** | Convergence curves, Gantt charts, Pareto fronts, radar plots |
| 🤖 **AI Smart Suggest** | Rule-based expert system recommends algorithm & hyperparameters |
| 📁 **File Upload** | CSV/JSON workload and VM configuration import |
| 🎛️ **Presets** | Quick-start workload & VM templates (Small / Medium / Large / Heterogeneous) |
| 🔬 **Compare Mode** | Side-by-side comparison of multiple experiments |
| 📋 **Clone & Export** | Clone experiments, export results as JSON or CSV |
| ☁️ **CloudSim Plus** | Java-based cloud simulation for realistic metrics |
| 🔐 **JWT Auth** | Secure authentication with bcrypt hashing |

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Next.js 16  │────▶│  Express 5   │────▶│  MongoDB    │
│  (React 19)  │     │  REST API    │     │  Atlas      │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
     ┌─────────────┐          ┌─────────────┐
     │ Python       │          │  Java        │
     │ Optimizer    │          │  CloudSim    │
     │ (8 algos)   │          │  Plus 8.0    │
     └─────────────┘          └─────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **Python** ≥ 3.10 + numpy
- **Java** ≥ 21 + Maven ≥ 3.9
- **MongoDB** (Atlas URI or local)

### 1. Clone & Setup Environment

```bash
git clone https://github.com/your-org/edo-cloud.git
cd edo-cloud
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

### 2. Install Dependencies

```bash
# Frontend
cd client && npm install && cd ..

# Backend
cd server && npm install && cd ..

# Python optimizer
cd optimizer && pip install -r requirements.txt && cd ..

# Java simulator
cd simulator && mvn clean package -q && cd ..
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open **http://localhost:3000** in your browser.

### 4. Docker (Alternative)

```bash
docker-compose up --build
```

---

## 📁 Project Structure

```
edo/
├── client/                 # Next.js 16 frontend
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # UI components
│   │   ├── lib/            # API client, constants
│   │   ├── stores/         # Zustand state management
│   │   └── types/          # TypeScript types
│   └── Dockerfile
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Environment, DB connection
│   │   ├── controllers/    # Route handlers
│   │   ├── data/           # Preset configurations
│   │   ├── middleware/     # Auth, upload, validation
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic
│   ├── tests/              # API tests
│   └── Dockerfile
├── optimizer/              # Python optimization engine
│   ├── algorithms/         # 8 algorithm implementations
│   ├── tests/              # Unit tests
│   └── Dockerfile
├── simulator/              # Java CloudSim Plus
│   ├── src/                # CloudSimRunner
│   └── Dockerfile
├── docs/                   # PRD, Design, TechRules
├── docker-compose.yml
└── .env.example
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Experiments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experiments` | List all experiments |
| POST | `/api/experiments` | Create experiment |
| GET | `/api/experiments/:id` | Get experiment |
| PUT | `/api/experiments/:id` | Update experiment |
| DELETE | `/api/experiments/:id` | Delete experiment |
| POST | `/api/experiments/:id/run` | Run experiment |
| POST | `/api/experiments/:id/clone` | Clone experiment |

### Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experiments/:id/result` | Get result |
| GET | `/api/experiments/:id/result/export?format=json\|csv` | Export result |
| POST | `/api/results/compare` | Compare experiments |

### Upload & Presets

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/workload` | Upload workload CSV/JSON |
| POST | `/api/upload/vms` | Upload VM CSV/JSON |
| GET | `/api/presets` | List all presets |
| GET | `/api/presets/workload/:id` | Get workload preset |
| GET | `/api/presets/vm/:id` | Get VM preset |

### AI Suggest

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/suggest` | Get algorithm suggestion |

---

## 🧪 Testing

```bash
# Python optimizer tests
cd optimizer && python -m pytest tests/ -v

# Backend API tests (server must be running)
node server/tests/api.test.js
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Canvas | `#0B0C10` |
| Panel | `#1F2833` |
| Neon Cyan | `#66FCF1` |
| Neon Magenta | `#FF2A6D` |
| Neon Amber | `#FFC857` |
| Brand Purple | `#6C3CE1` |

**Fonts:** Syncopate (display), Space Grotesk (heading), Inter (body), JetBrains Mono (code)

---

## 📄 License

ISC © EDO-Cloud Team
