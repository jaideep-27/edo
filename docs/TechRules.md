# EDOCloud — Tech Rules & Stack Definition

**Version:** 1.0  
**Date:** February 17, 2026  
**Project:** EDO-Cloud Scheduler  

---

## 1. Core Philosophy

The system is built to be:

- **Modular** — Each layer (frontend, backend, optimization, simulation) is independently replaceable
- **Scalable** — Architecture supports growing workloads and user base
- **Research-friendly** — Easy to add new algorithms and experiment configurations
- **Easy to iterate** — Hot reload, clear separation of concerns, rapid experimentation
- **Cloud-deployable later** — Designed for eventual containerized deployment

### Architecture Style
**Decoupled frontend + backend + simulation engine**

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

---

## 2. Technology Stack Overview

| Layer | Technology | Version | Justification |
|---|---|---|---|
| Frontend | Next.js (React) | 14.x+ | SSR, App Router, SEO |
| Styling | Tailwind CSS | 3.x | Utility-first, dark mode |
| Component Library | Shadcn/UI | Latest | Accessible, customizable |
| State Management | Zustand | 4.x | Lightweight, minimal boilerplate |
| Charts | Recharts | 2.x | React-native charting |
| Backend API | Node.js + Express | 20.x LTS / 4.x | Lightweight, flexible |
| Database | MongoDB | 7.x | Document store, flexible schema |
| ODM | Mongoose | 8.x | Schema validation, middleware |
| Authentication | JWT + bcrypt | - | Stateless, secure |
| Optimization Engine | Python | 3.10+ | NumPy, Pandas, scientific stack |
| Simulation Engine | Java + CloudSim | 17+ / 4.x | Industry standard simulation |
| Deployment (future) | Vercel + Render | - | Frontend + Backend hosting |

---

## 3. Frontend Rules (Next.js)

### 3.1 Framework Configuration

- **Framework:** Next.js with **App Router** (preferred over Pages Router)
- **Language:** TypeScript (strict mode enabled)
- **SSR:** Used for landing/marketing pages (SEO benefits)
- **CSR:** Used for dashboard pages (client-side interactivity)

```
Reason: SSR for performance + SEO on public pages,
        CSR for interactive dashboard experience
```

### 3.2 UI Stack

- **Tailwind CSS** for all styling
- **Glassmorphism utilities** via custom Tailwind classes
- **Dark-mode by default** — no light mode initially
- **Shadcn/UI** for form components, dialogs, dropdowns
- **Lucide Icons** for consistent iconography

#### Custom Tailwind Configuration
```js
// tailwind.config.ts
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#0B0C10',
        panel: '#1F2833',
        'panel-elevated': '#2A3040',
        'neon-cyan': '#66FCF1',
        'neon-magenta': '#FF2A6D',
        'neon-amber': '#FFC857',
        'brand-purple': '#6C3CE1',
      },
      fontFamily: {
        display: ['Syncopate', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
};
```

### 3.3 Component Guidelines

- **Atomic Design Pattern:** atoms → molecules → organisms → templates → pages
- **Separate UI and logic:** Presentation components vs. container components
- **File naming:** PascalCase for components, camelCase for utilities
- **One component per file**

#### Directory Structure
```
/src
  /app                    # Next.js App Router pages
    /page.tsx             # Landing page
    /dashboard/
      /page.tsx           # Dashboard home
      /experiments/
        /page.tsx         # Experiment list
        /[id]/page.tsx    # Experiment detail
        /new/page.tsx     # New experiment
      /compare/
        /page.tsx         # Algorithm comparison
      /results/
        /[id]/page.tsx    # Results view
  /components
    /ui                   # Shadcn/UI base components
      /button.tsx
      /input.tsx
      /card.tsx
      /dialog.tsx
      /slider.tsx
    /layout
      /navbar.tsx
      /sidebar.tsx
      /footer.tsx
    /dashboard
      /metric-card.tsx
      /experiment-form.tsx
      /algorithm-selector.tsx
    /charts
      /makespan-chart.tsx
      /energy-chart.tsx
      /pareto-chart.tsx
      /gantt-chart.tsx
      /convergence-chart.tsx
    /landing
      /hero.tsx
      /features.tsx
      /pricing.tsx
  /lib
    /api.ts               # API client (Axios instance)
    /utils.ts             # Utility functions
    /constants.ts         # App constants
  /hooks
    /useExperiment.ts
    /useResults.ts
    /useAuth.ts
  /stores
    /experimentStore.ts   # Zustand store
    /authStore.ts
  /types
    /experiment.ts        # TypeScript interfaces
    /result.ts
    /user.ts
```

### 3.4 API Communication

- **HTTP Client:** Axios (centralized instance)
- **Base URL:** Environment variable `NEXT_PUBLIC_API_URL`
- **Error handling:** Global interceptor for auth errors (401 → redirect to login)
- **Loading states:** Managed via Zustand or React Query

```typescript
// /src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### 3.5 Font Loading

```typescript
// /src/app/layout.tsx — Google Fonts via next/font
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
```

---

## 4. Backend Rules (Node.js)

### 4.1 Framework

- **Framework:** Express.js
- **Language:** JavaScript (ES Modules) — TypeScript optional for future
- **Runtime:** Node.js 20.x LTS

```
Reason: Lightweight, flexible, easy integration
        with Python/Java child processes
```

### 4.2 Architecture

- **Pattern:** MVC + Service Layer
- **Middleware:** Auth, validation, error handling, rate limiting
- **Process management:** PM2 for production

#### Directory Structure
```
/server
  /src
    /config
      /db.js              # MongoDB connection
      /env.js             # Environment variable loader
    /controllers
      /authController.js
      /experimentController.js
      /resultController.js
    /services
      /authService.js
      /experimentService.js
      /optimizationService.js  # Spawns Python process
      /simulationService.js    # Spawns Java process
      /resultService.js
    /models
      /User.js
      /Experiment.js
      /Result.js
    /routes
      /authRoutes.js
      /experimentRoutes.js
      /resultRoutes.js
    /middleware
      /auth.js             # JWT verification
      /validate.js         # Request validation
      /errorHandler.js     # Global error handler
      /rateLimiter.js
    /utils
      /logger.js
      /helpers.js
    /app.js                # Express app setup
    /server.js             # Entry point
  /tests
    /auth.test.js
    /experiment.test.js
```

### 4.3 Backend Responsibilities

The backend handles:
1. **Experiment management** — CRUD operations on experiments
2. **Workload uploads** — File parsing and validation
3. **Triggering EDO runs** — Spawning Python optimization process
4. **Triggering CloudSim** — Spawning Java simulation process
5. **Storing results** — Persisting metrics to MongoDB
6. **Authentication** — JWT-based user management
7. **Data export** — CSV/JSON result generation

### 4.4 Process Communication

#### Python (Optimization Engine)
```javascript
// services/optimizationService.js
const { spawn } = require('child_process');

function runOptimization(config) {
  return new Promise((resolve, reject) => {
    const python = spawn(process.env.PYTHON_PATH || 'python3', [
      'optimizer/main.py',
      '--config', JSON.stringify(config)
    ]);

    let output = '';
    python.stdout.on('data', (data) => { output += data; });
    python.stderr.on('data', (data) => { console.error(`EDO Error: ${data}`); });
    python.on('close', (code) => {
      if (code === 0) resolve(JSON.parse(output));
      else reject(new Error(`EDO exited with code ${code}`));
    });
  });
}
```

#### Java (Simulation Engine)
```javascript
// services/simulationService.js
const { spawn } = require('child_process');

function runSimulation(schedule) {
  return new Promise((resolve, reject) => {
    const java = spawn('java', [
      '-jar', process.env.CLOUDSIM_JAR_PATH || 'simulator/cloudsim.jar',
      '--schedule', JSON.stringify(schedule)
    ]);

    let output = '';
    java.stdout.on('data', (data) => { output += data; });
    java.on('close', (code) => {
      if (code === 0) resolve(JSON.parse(output));
      else reject(new Error(`CloudSim exited with code ${code}`));
    });
  });
}
```

---

## 5. Database Rules (MongoDB)

### 5.1 Connection

- **Provider:** MongoDB Atlas (production) / Local MongoDB (development)
- **URI:** Stored in `.env` file, never committed

```bash
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/edocloud
```

### 5.2 Collections & Schemas

#### Users
```javascript
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'researcher'], default: 'researcher' },
  createdAt: { type: Date, default: Date.now },
});
```

#### Experiments
```javascript
const experimentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  workloadConfig: {
    taskCount: Number,
    tasks: [{ size: Number, cpu: Number, memory: Number }],
    datasetFile: String,
  },
  vmConfig: {
    vmCount: Number,
    vms: [{ mips: Number, ram: Number, bw: Number, storage: Number }],
  },
  algorithm: {
    type: String,
    enum: ['EDO', 'PSO', 'ACO', 'WOA', 'Baseline'],
    required: true,
  },
  hyperparameters: {
    populationSize: { type: Number, default: 50 },
    maxIterations: { type: Number, default: 100 },
    seed: Number,
    weights: {
      makespan: { type: Number, default: 0.4 },
      energy: { type: Number, default: 0.3 },
      reliability: { type: Number, default: 0.3 },
    },
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending',
  },
  tags: [String],
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

#### Results
```javascript
const resultSchema = new Schema({
  experimentId: { type: Schema.Types.ObjectId, ref: 'Experiment', required: true },
  makespan: Number,
  energy: Number,
  reliability: Number,
  resourceUtilization: Number,
  convergenceData: [{ iteration: Number, fitness: Number }],
  paretoPoints: [{ makespan: Number, energy: Number, reliability: Number }],
  schedule: [{ taskId: Number, vmId: Number, startTime: Number, endTime: Number }],
  rawLogs: String,
  executionTime: Number,
  createdAt: { type: Date, default: Date.now },
});
```

### 5.3 ODM Rules

- Use **Mongoose** for all database operations
- Define schemas with validation
- Use middleware for `updatedAt` timestamps
- Index frequently queried fields (`userId`, `experimentId`, `status`)

### 5.4 Database Indexes
```javascript
experimentSchema.index({ userId: 1, createdAt: -1 });
experimentSchema.index({ status: 1 });
resultSchema.index({ experimentId: 1 });
```

---

## 6. Optimization Engine Rules (Python)

### 6.1 Stack

- **Python:** 3.10+
- **Libraries:** NumPy, Pandas, SciPy
- **Communication:** JSON over stdin/stdout via `child_process.spawn()`

### 6.2 Directory Structure
```
/optimizer
  /main.py                    # Entry point
  /algorithms
    /edo.py                   # Enterprise Development Optimizer
    /pso.py                   # Particle Swarm Optimization
    /aco.py                   # Ant Colony Optimization
    /woa.py                   # Whale Optimization Algorithm
    /baseline.py              # Round-robin / First-fit
  /objectives
    /makespan.py              # Makespan calculation
    /energy.py                # Energy consumption model
    /reliability.py           # Reliability/fault tolerance
  /utils
    /config_parser.py         # Parse JSON input
    /result_formatter.py      # Format output JSON
  /tests
    /test_edo.py
    /test_objectives.py
  /requirements.txt
```

### 6.3 Input/Output Contract

**Input (JSON via stdin or command-line arg):**
```json
{
  "algorithm": "EDO",
  "tasks": [
    { "id": 1, "size": 1000, "cpu": 2, "memory": 512 }
  ],
  "vms": [
    { "id": 1, "mips": 1000, "ram": 2048, "bw": 1000 }
  ],
  "hyperparameters": {
    "populationSize": 50,
    "maxIterations": 100,
    "seed": 42,
    "weights": { "makespan": 0.4, "energy": 0.3, "reliability": 0.3 }
  }
}
```

**Output (JSON via stdout):**
```json
{
  "schedule": [
    { "taskId": 1, "vmId": 2 }
  ],
  "convergenceData": [
    { "iteration": 1, "fitness": 0.85 }
  ],
  "paretoPoints": [
    { "makespan": 1200, "energy": 45.2, "reliability": 0.97 }
  ],
  "bestFitness": 0.42,
  "executionTime": 2.34
}
```

### 6.4 Algorithm Guidelines

- All algorithms must implement a common interface:
  ```python
  class BaseOptimizer:
      def __init__(self, config):
          self.config = config
      
      def optimize(self) -> dict:
          """Returns schedule and metrics"""
          raise NotImplementedError
  ```
- Use seed control for reproducibility
- Log convergence data at each iteration
- Support early termination if convergence detected

---

## 7. Simulation Engine Rules (CloudSim)

### 7.1 Stack

- **Java:** 17+
- **Framework:** CloudSim 4.x
- **Build:** Maven or Gradle

### 7.2 Directory Structure
```
/simulator
  /src/main/java/com/edocloud
    /CloudSimRunner.java      # Main entry point
    /models
      /TaskConfig.java
      /VMConfig.java
    /evaluator
      /MakespanEvaluator.java
      /EnergyEvaluator.java
      /ReliabilityEvaluator.java
    /utils
      /JsonParser.java
      /ResultFormatter.java
  /pom.xml                    # Maven config
  /cloudsim.jar               # Built JAR
```

### 7.3 Execution

Run as JAR via Node.js:
```bash
java -jar simulator/cloudsim.jar --schedule '{"schedule": [...]}'
```

### 7.4 Responsibilities

- Accept schedule from optimization engine
- Create CloudSim datacenter, hosts, VMs, cloudlets
- Execute simulated task scheduling
- Model VM failures and resource contention
- Return performance metrics (makespan, energy, reliability)
- Support configurable failure rates

---

## 8. Environment Rules

### 8.1 Environment Variables

```bash
# .env (NEVER commit this file)

# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/edocloud

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Paths
PYTHON_PATH=/usr/bin/python3
CLOUDSIM_JAR_PATH=./simulator/cloudsim.jar

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Seed (default)
DEFAULT_SEED=42
```

### 8.2 Environment Files

```
.env              # Local development (gitignored)
.env.example      # Template with placeholder values (committed)
```

### 8.3 Rules

- **NEVER** commit `.env` to version control
- All secrets in environment variables, not hardcoded
- Use `dotenv` package for loading in development
- Validate all required env vars on server startup

---

## 9. Security Rules

| Rule | Implementation |
|---|---|
| Authentication | JWT tokens (access + refresh) |
| Password hashing | bcrypt with 12 salt rounds |
| Input validation | Joi or express-validator on all endpoints |
| Rate limiting | express-rate-limit (100 req/15min per IP) |
| CORS | Whitelist frontend origin only |
| Helmet | Security headers via `helmet` middleware |
| File uploads | Validate file type, size limits (10MB max) |
| SQL/NoSQL injection | Mongoose sanitization, parameterized queries |
| XSS | Sanitize user inputs, CSP headers |

---

## 10. Code Quality Rules

### Linting & Formatting

| Tool | Config | Scope |
|---|---|---|
| ESLint | `eslint.config.js` | Frontend + Backend JS/TS |
| Prettier | `.prettierrc` | All code files |
| TypeScript | `tsconfig.json` (strict) | Frontend |
| Python | `ruff` or `flake8` | Optimizer |
| Java | Checkstyle | Simulator |

### Prettier Config
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Naming Conventions

| Context | Convention | Example |
|---|---|---|
| React components | PascalCase | `MetricCard.tsx` |
| Functions/variables | camelCase | `calculateMakespan()` |
| Constants | UPPER_SNAKE_CASE | `MAX_ITERATIONS` |
| CSS classes | kebab-case (Tailwind) | `bg-panel text-neon-cyan` |
| API routes | kebab-case | `/api/experiments/:id/run` |
| Database fields | camelCase | `userId`, `createdAt` |
| Python | snake_case | `run_optimization()` |
| Java | camelCase (methods), PascalCase (classes) | `CloudSimRunner` |

### Documentation

- JSDoc comments on all public functions
- README.md in each major directory
- Inline comments for complex logic only
- API documentation via Swagger/OpenAPI (future)

---

## 11. API Rules

### RESTful Design

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/experiments` | List experiments | Yes |
| POST | `/api/experiments` | Create experiment | Yes |
| GET | `/api/experiments/:id` | Get experiment | Yes |
| PUT | `/api/experiments/:id` | Update experiment | Yes |
| DELETE | `/api/experiments/:id` | Delete experiment | Yes |
| POST | `/api/experiments/:id/run` | Run experiment | Yes |
| GET | `/api/results/:experimentId` | Get results | Yes |
| GET | `/api/results/:id/export` | Export results | Yes |
| GET | `/api/algorithms` | List algorithms | No |
| GET | `/api/presets/workloads` | Preset workloads | No |
| GET | `/api/presets/vms` | Preset VM configs | No |

### Response Format
```json
{
  "success": true,
  "data": { },
  "message": "Operation successful",
  "meta": {
    "page": 1,
    "total": 42
  }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Task count must be a positive integer",
    "details": []
  }
}
```

### HTTP Status Codes

| Code | Usage |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

## 12. Testing Rules

| Layer | Framework | Type |
|---|---|---|
| Frontend | Jest + React Testing Library | Unit + Integration |
| Backend | Jest + Supertest | Unit + API |
| Python | pytest | Unit |
| Java | JUnit | Unit |
| E2E | Playwright (future) | End-to-end |

### Test File Naming
- `*.test.ts` / `*.test.js` — unit tests
- `*.spec.ts` — integration tests
- Place tests alongside source or in `/tests` directory

---

## 13. Scalability Rules

Future-ready architecture for:

- **Microservices split** — Optimization and Simulation as separate services
- **Queue-based simulation** — Bull/BullMQ for job queuing
- **Docker deployment** — Containerized services with Docker Compose
- **Horizontal scaling** — Stateless backend behind load balancer
- **Caching** — Redis for frequently accessed experiment data

---

## 14. Deployment Plan (Future)

| Component | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Next.js optimized hosting |
| Backend | Render / AWS EC2 | Express API server |
| Database | MongoDB Atlas | Managed cloud database |
| Simulation | Docker container | CloudSim as containerized service |
| Optimization | Docker container | Python optimizer as service |
| CI/CD | GitHub Actions | Automated testing and deployment |

---

## 15. Version Control Rules

### Git Workflow
- **Main branch:** `main` — production-ready code
- **Development branch:** `dev` — integration branch
- **Feature branches:** `feature/<feature-name>`
- **Bug fix branches:** `fix/<bug-description>`
- **Hotfix branches:** `hotfix/<issue>`

### Commit Message Standards
```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Scope: frontend, backend, optimizer, simulator, docs

Examples:
feat(frontend): add experiment configuration form
fix(backend): handle CloudSim timeout errors
docs(optimizer): add EDO algorithm documentation
```

### PR Guidelines
- Descriptive title and body
- Link related issues
- Require at least 1 review
- All CI checks must pass
- Squash merge to main

### .gitignore Essentials
```
node_modules/
.env
.next/
dist/
build/
__pycache__/
*.pyc
*.class
target/
.DS_Store
*.jar
```
