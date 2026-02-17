# Product Requirements Document (PRD)

## Project Title: EDO-Cloud Scheduler

**Version:** 1.0  
**Date:** February 17, 2026  
**Team:** Batch A01  
- A. Jaideep – 227Z1A0508  
- G. Sai Teja – 227Z1A0559  
- B. Bhanu Prasad – 227Z1A0514  
**Guide:** Dr. K. Rameshwaraiah, Professor & Head, Dept. of CSE  

---

## 1. Purpose

The purpose of this product is to design and implement a **Multi-Objective Cloud Task Scheduling** system that optimizes:

- **Makespan** – Total time required to complete all scheduled tasks
- **Energy Consumption** – Power usage across virtual machines
- **Reliability** – Fault tolerance and system robustness
- **Resource Utilization** – Efficient allocation of CPU, memory, and bandwidth

The system uses the **Enterprise Development Optimizer (EDO)** — a metaheuristic algorithm inspired by enterprise growth strategies that balances exploration and exploitation — as the core optimization algorithm. Performance is evaluated using a cloud simulation environment built on CloudSim.

This platform enables researchers and students to test, compare, and analyze scheduling strategies in a controlled simulated cloud environment.

---

## 2. Product Overview

EDO-Cloud Scheduler is a **simulation-driven decision support tool** for cloud scheduling research.

It allows users to:

- Define workloads and VM configurations
- Run scheduling experiments with multiple algorithms
- Compare optimization algorithm performance (EDO vs. PSO, ACO, WOA)
- Visualize performance metrics via interactive dashboards
- Store and analyze experiment results
- Export findings for academic evaluation

> **Important:** The system does **not** execute real cloud workloads. It simulates them using CloudSim for experimentation and evaluation purposes.

### Architecture Overview

The system integrates:
- **Python-based optimization modules** (EDO engine) for multi-objective scheduling
- **Node.js backend services** for orchestration and experiment management
- **Dual-database layer** using MongoDB for dynamic workloads
- **React-based frontend** with interactive dashboards for visualization

---

## 3. Target Users

### Primary Users
| User Type | Needs |
|---|---|
| Computer Science students | Run experiments, learn scheduling concepts |
| Cloud computing researchers | Test and validate optimization algorithms |
| AI/optimization researchers | Analyze EDO performance, Pareto fronts |
| Academic project teams | Reproduce and compare scheduling results |

### Secondary Users
| User Type | Needs |
|---|---|
| Educators teaching cloud computing | Demonstrate scheduling concepts |
| Developers exploring scheduling strategies | Prototype and iterate on approaches |

---

## 4. Goals & Objectives

### Goals
- Provide a **reproducible** simulation platform with seed control
- Demonstrate **EDO effectiveness** against established metaheuristics
- Enable **multi-objective optimization analysis** with Pareto fronts
- Support **algorithm comparisons** across standardized benchmarks
- Create an **intuitive interface** for configuring and running experiments

### Success Metrics
| Metric | Target |
|---|---|
| Makespan reduction vs baseline | Measurable improvement in ≥2 objectives |
| Energy consumption reduction | Lower than PSO/ACO/WOA baselines |
| Reliability scores | Higher fault tolerance than conventional |
| Optimization convergence | Faster convergence within reasonable iterations |
| Simulation accuracy | Same inputs produce same outputs (reproducibility) |
| Simulation execution time | Complete within 2–3 minutes for moderate task sets |

---

## 5. Features

### 5.1 Workload Configuration (FR1)

Users can:
- Upload workload datasets (CSV/JSON format)
- Define task parameters: size, CPU needs, memory requirements
- Set total number of tasks for simulation
- Configure task dependencies and priorities

### 5.2 VM / Data Center Configuration (FR2)

Users can:
- Configure number of Virtual Machines
- Define VM specifications: MIPS, RAM, Bandwidth, Storage
- Simulate heterogeneous environments with varied VM types
- Set data center properties and network topology

### 5.3 Optimization Engine (FR3)

System will:
- Run EDO optimization on defined workloads
- Generate task-to-VM scheduling mappings
- Support hyperparameter tuning (population size, iterations, weights)
- Calculate combined objective function with adjustable weights
- Produce Pareto-optimal solutions balancing makespan, energy, and reliability

### 5.4 Simulation Execution (FR4)

System will:
- Execute schedules in CloudSim simulation environment
- Simulate task execution including processing delays
- Model VM failures and fault scenarios
- Capture detailed performance metrics per run
- Support batch execution for statistical analysis

### 5.5 Algorithm Comparison (FR7)

Users can compare results across:
- **EDO** – Enterprise Development Optimizer
- **PSO** – Particle Swarm Optimization
- **ACO** – Ant Colony Optimization
- **WOA** – Whale Optimization Algorithm
- **Baseline** – Round-robin / First-fit scheduling

### 5.6 Results Dashboard (FR5, FR8)

Visualizations include:
- Makespan comparison charts (bar/line)
- Energy consumption graphs
- Reliability metric displays
- Pareto front visualization (2D/3D)
- Convergence curves per algorithm
- Resource utilization heatmaps
- Scheduling timeline (Gantt chart)

### 5.7 Experiment Management (FR6)

Users can:
- Save experiment configurations and results
- Reload previous configurations for re-execution
- Export results in CSV/JSON format
- View experiment history and comparison logs
- Tag and annotate experiments

---

## 6. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR1 | User can upload workload data (CSV/JSON) | High |
| FR2 | User can configure VM settings (MIPS, RAM, BW) | High |
| FR3 | System runs EDO optimization on workload data | High |
| FR4 | System evaluates schedule via CloudSim simulation | High |
| FR5 | System displays results with visual charts and graphs | High |
| FR6 | System stores experiment data in MongoDB | High |
| FR7 | User can compare multiple algorithms side-by-side | Medium |
| FR8 | User can tune optimization hyperparameters | Medium |
| FR9 | System generates Pareto-optimal solutions | High |
| FR10 | System supports adjustable objective weights | Medium |
| FR11 | User can export simulation results | Medium |
| FR12 | System provides authentication for user accounts | Low |

---

## 7. Non-Functional Requirements

### Performance
- Simulation runs complete within 2–3 minutes for moderate task sets
- Optimization algorithm converges within a reasonable number of iterations
- Dashboard loads results within 2 seconds
- API response time < 500ms for standard operations

### Reliability
- Stable, reproducible simulation results across runs
- No data loss in saved experiments
- Graceful error handling for simulation failures
- Backup copies of configurations maintained automatically

### Usability
- Simple, intuitive UI for workload and VM configuration
- Clear, interactive result visualizations
- Minimal learning curve for target users
- Contextual help and documentation

### Scalability
- Support increasing number of tasks (100–10,000+)
- Support increasing number of VMs (10–500+)
- Handle concurrent experiment runs

### Reproducibility
- Seed control ensures identical inputs produce identical outputs
- Experiment configurations fully serializable
- Version tracking for algorithm implementations

### Security
- Simulation data and results securely stored
- Input validation to prevent data corruption
- JWT-based authentication for user sessions
- Access control for experiment ownership

---

## 8. System Architecture

### Components

| Layer | Technology | Role |
|---|---|---|
| Frontend | Next.js (React) + Tailwind CSS | Interactive dashboard & configuration UI |
| Backend API | Node.js + Express.js | Experiment management, orchestration |
| Optimization Engine | Python 3.10+ (NumPy, Pandas) | EDO algorithm & multi-objective optimization |
| Simulation Engine | Java + CloudSim 4.x | Cloud environment simulation & metrics |
| Database | MongoDB (Mongoose) | Experiment data, results, user accounts |
| Authentication | JWT + bcrypt | User session management |
| Visualization | Recharts | Charts, graphs, Pareto fronts |

### Data Flow
```
User → Frontend (Next.js)
  → Backend API (Express)
    → Optimization Engine (Python/EDO)
      → Candidate Schedules (JSON)
    → Simulation Engine (CloudSim/Java)
      → Performance Metrics (JSON)
    → Database (MongoDB)
      → Stored Results
  → Dashboard (Recharts)
    → Visualized Results
```

---

## 9. User Flow

```
1. User registers / signs in
2. User uploads workload data (or selects preset)
3. User configures VM specifications
4. User selects algorithm(s) to run (EDO, PSO, ACO, WOA, Baseline)
5. User tunes hyperparameters (optional)
6. User initiates experiment run
7. System runs optimization → generates candidate schedules
8. System executes simulation → captures performance metrics
9. Results displayed on dashboard (charts, Pareto fronts, metrics)
10. User saves, exports, or compares experiment data
```

---

## 10. Constraints

- **Simulation-only:** CloudSim does not execute real cloud workloads
- **Local hardware:** Performance limited by host machine capabilities
- **Multi-objective complexity:** Tuning weights across objectives requires domain knowledge
- **CloudSim dependency:** Restricted to CloudSim 4.x API surface
- **Algorithm tuning:** EDO requires careful parameter adjustment for convergence
- **Energy model accuracy:** Limited by available simulation data models

---

## 11. Assumptions

- Users understand basic cloud computing and scheduling concepts
- Workloads are synthetic or research-oriented benchmark datasets
- Focus is academic evaluation and algorithm comparison
- CloudSim is used as the base simulation environment
- Comparative algorithms (PSO, ACO, WOA) are correctly implemented
- Users have access to Java runtime and Python 3.10+
- Consistent virtual machine availability within simulation

---

## 12. Database Schema

### Users Collection
```json
{
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "role": "string (admin | researcher)",
  "createdAt": "Date"
}
```

### Experiments Collection
```json
{
  "userId": "ObjectId (ref: Users)",
  "name": "string",
  "workloadConfig": {
    "taskCount": "number",
    "tasks": [{ "size": "number", "cpu": "number", "memory": "number" }]
  },
  "vmConfig": {
    "vmCount": "number",
    "vms": [{ "mips": "number", "ram": "number", "bw": "number" }]
  },
  "algorithm": "string (EDO | PSO | ACO | WOA | Baseline)",
  "hyperparameters": {
    "populationSize": "number",
    "maxIterations": "number",
    "weights": { "makespan": "number", "energy": "number", "reliability": "number" }
  },
  "status": "string (pending | running | completed | failed)",
  "createdAt": "Date"
}
```

### Results Collection
```json
{
  "experimentId": "ObjectId (ref: Experiments)",
  "makespan": "number",
  "energy": "number",
  "reliability": "number",
  "resourceUtilization": "number",
  "convergenceData": [{ "iteration": "number", "fitness": "number" }],
  "paretoPoints": [{ "makespan": "number", "energy": "number", "reliability": "number" }],
  "schedule": [{ "taskId": "number", "vmId": "number" }],
  "rawLogs": "string",
  "executionTime": "number",
  "createdAt": "Date"
}
```

---

## 13. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/experiments` | List user experiments |
| POST | `/api/experiments` | Create new experiment |
| GET | `/api/experiments/:id` | Get experiment details |
| POST | `/api/experiments/:id/run` | Execute experiment |
| DELETE | `/api/experiments/:id` | Delete experiment |
| GET | `/api/results/:id` | Get experiment results |
| GET | `/api/results/:id/export` | Export results (CSV/JSON) |
| GET | `/api/algorithms` | List available algorithms |
| GET | `/api/presets/workloads` | Get preset workload configs |
| GET | `/api/presets/vms` | Get preset VM configs |

---

## 14. Future Scope

- **Real cloud integration** with AWS/Azure/GCP APIs
- **ML-based predictive scheduling** using deep learning for workload forecasting
- **Auto-tuning of parameters** via reinforcement learning
- **Distributed simulation** support across multiple nodes
- **Web deployment** for remote access (Vercel + Render)
- **Containerized deployment** using Docker and Kubernetes
- **Hybrid optimization** combining EDO with swarm-based algorithms
- **Voice scheduling** and AI assistant chat panel
- **Heatmaps** for productivity and resource analysis
