# EDO-Cloud Scheduler — Project Todo

> **Generated:** February 17, 2026  
> **Source:** PRD.md, Design.md, TechRules.md  
> **Approach:** Feature-by-feature, one task at a time  
> **Legend:** ⬜ Not Started | 🔄 In Progress | ✅ Completed | 🚫 Blocked

---

## Phase 0: Project Foundation & Setup

### 0.1 Repository & Tooling
- ⬜ Initialize Git repository with `.gitignore` (Node, Python, Java, macOS)
- ⬜ Create `.env.example` with all required environment variables
- ⬜ Set up ESLint config for the project
- ⬜ Set up Prettier config (`.prettierrc`)
- ⬜ Create root `README.md` with project overview and setup instructions
- ⬜ Create `package.json` at root (monorepo scripts)

### 0.2 Frontend Setup (Next.js)
- ⬜ Initialize Next.js 14+ project with TypeScript in `/client`
- ⬜ Install and configure Tailwind CSS with custom theme (colors, fonts, dark mode)
- ⬜ Install Shadcn/UI and initialize component library
- ⬜ Set up Google Fonts: Space Grotesk, Inter, JetBrains Mono (via `next/font`)
- ⬜ Configure path aliases (`@/components`, `@/lib`, `@/hooks`, etc.)
- ⬜ Set up Zustand store boilerplate
- ⬜ Set up Axios API client with base URL and auth interceptor (`/lib/api.ts`)
- ⬜ Create base layout with dark mode canvas (`#0B0C10` background)

### 0.3 Backend Setup (Node.js + Express)
- ⬜ Initialize Node.js project in `/server` with Express
- ⬜ Set up project structure: controllers, services, routes, models, middleware
- ⬜ Configure `dotenv` for environment variables
- ⬜ Set up MongoDB connection with Mongoose (`/config/db.js`)
- ⬜ Create global error handler middleware
- ⬜ Set up CORS, Helmet, and rate limiter middleware
- ⬜ Create server entry point (`server.js`) with graceful startup
- ⬜ Verify server runs and connects to MongoDB

### 0.4 Optimization Engine Setup (Python)
- ⬜ Create `/optimizer` directory structure
- ⬜ Create `requirements.txt` (numpy, pandas, scipy)
- ⬜ Create `main.py` entry point with argument parsing
- ⬜ Create `BaseOptimizer` abstract class interface
- ⬜ Verify Python process can be spawned from Node.js and return JSON

### 0.5 Simulation Engine Setup (Java/CloudSim)
- ⬜ Create `/simulator` directory structure
- ⬜ Set up Maven/Gradle project with CloudSim 4.x dependency
- ⬜ Create `CloudSimRunner.java` entry point
- ⬜ Create input/output JSON parsers
- ⬜ Build JAR file and verify execution via command line
- ⬜ Verify Java process can be spawned from Node.js and return JSON

---

## Phase 1: Authentication System

### 1.1 Backend — Auth API
- ⬜ Create `User` Mongoose model with schema validation
- ⬜ Implement password hashing with bcrypt (12 salt rounds)
- ⬜ Create `POST /api/auth/register` endpoint
- ⬜ Create `POST /api/auth/login` endpoint with JWT generation
- ⬜ Create `GET /api/auth/me` endpoint (get current user)
- ⬜ Create JWT auth middleware for protected routes
- ⬜ Add input validation for auth endpoints (email format, password strength)
- ⬜ Write unit tests for auth service

### 1.2 Frontend — Auth Pages
- ⬜ Create Sign In page (`/signin`) with glassmorphic form card
- ⬜ Create Sign Up page (`/signup`) with glassmorphic form card
- ⬜ Build auth form components (email input, password input, submit button)
- ⬜ Implement Zustand auth store (token, user, login/logout actions)
- ⬜ Add protected route wrapper (redirect to signin if not authenticated)
- ⬜ Add auth state persistence (localStorage token)
- ⬜ Wire up API calls for register/login/me

---

## Phase 2: Landing Page (Marketing Site)

### 2.1 Navigation Bar
- ⬜ Build fixed navbar with glassmorphism (`backdrop-filter: blur(20px)`)
- ⬜ Add EDOCloud logo (cloud icon + wordmark) on the left
- ⬜ Add center navigation links: Features, Solutions, Pricing, Resources, Enterprise
- ⬜ Add dropdown menus for Features, Solutions, Resources
- ⬜ Add "Sign In" text link and "Get Started" neon pill button on the right
- ⬜ Implement mobile hamburger menu
- ⬜ Add scroll-based navbar background opacity change

### 2.2 Hero Section
- ⬜ Build hero section with purple-to-dark gradient background
- ⬜ Add "EDO-CLOUD SCHEDULER" headline in Syncopate font
- ⬜ Add "SCHEDULING THAT THINKS FOR YOU" subheadline
- ⬜ Add descriptive paragraph text
- ⬜ Create "Start Free Trial" primary CTA button (neon cyan)
- ⬜ Create "Learn More" ghost/outline button
- ⬜ Add floating 3D glass folder/card visual elements (CSS/SVG)
- ⬜ Implement parallax effect on mouse movement (layer shifting)
- ⬜ Add misty depth background particles/gradient effect

### 2.3 Product Overview Section
- ⬜ Build "Scheduling That Thinks For You" section with logo badge
- ⬜ Add product description text
- ⬜ Add feature highlight cards with icons

### 2.4 Features Section
- ⬜ Build "Built to Optimize Your Time" section header
- ⬜ Create 3-column feature grid layout
- ⬜ Build feature cards: Smart Conflict Resolution, Seamless Calendar Suggestion, Artificial Probability Theme
- ⬜ Add icons for each feature card
- ⬜ Add CTA button: "Get your metrics now, maybe"

### 2.5 Showcase / Gallery Section
- ⬜ Build image showcase grid with varied card sizes
- ⬜ Add glassmorphic image cards with hover effects
- ⬜ Implement responsive gallery layout

### 2.6 File Storage / Integration Section
- ⬜ Build "File Storage That Thinks For You" section (per reference image)
- ⬜ Add unified storage interface mockup cards
- ⬜ Add Dropbox/cloud integration visual elements
- ⬜ Build feature description with bullet points

### 2.7 Testimonials Section
- ⬜ Build testimonials section with quote cards
- ⬜ Add glassmorphic quote cards with avatar and attribution
- ⬜ Implement carousel or grid layout for testimonials

### 2.8 Pricing Section
- ⬜ Build pricing tier cards (e.g., Free, Pro, Enterprise)
- ⬜ Add glassmorphic card treatment with feature comparison
- ⬜ Highlight recommended plan
- ⬜ Add CTA buttons per tier

### 2.9 Footer
- ⬜ Build multi-column footer with link sections
- ⬜ Add social media icons
- ⬜ Add copyright text
- ⬜ Add newsletter signup input

### 2.10 Landing Page Polish
- ⬜ Add smooth scroll navigation
- ⬜ Add fade-in animations on scroll (intersection observer)
- ⬜ Ensure full responsive design (desktop → tablet → mobile)
- ⬜ Performance optimization (lazy loading images, optimized fonts)

---

## Phase 3: Dashboard Layout & Shell

### 3.1 Dashboard Layout
- ⬜ Create dashboard layout with three-panel structure (sidebar + main + insights)
- ⬜ Build left sidebar with navigation icons (Dashboard, Experiments, Compare, Settings)
- ⬜ Implement sidebar collapse/expand (260px ↔ 64px)
- ⬜ Build right insights panel (320px, collapsible)
- ⬜ Build main content area with router outlet
- ⬜ Add user avatar and logout to dashboard navbar
- ⬜ Style sidebar with `#1F2833` background and icon highlights

### 3.2 Dashboard Home
- ⬜ Build dashboard home page with welcome message
- ⬜ Add quick stats overview cards (total experiments, recent runs, etc.)
- ⬜ Add recent experiments list
- ⬜ Add "New Experiment" quick action button
- ⬜ Add activity feed in right insights panel

---

## Phase 4: Workload Configuration (FR1)

### 4.1 Backend — Workload API
- ⬜ Create file upload endpoint for workload datasets (CSV/JSON)
- ⬜ Implement CSV parser for workload data
- ⬜ Implement JSON parser for workload data
- ⬜ Validate task data (size, CPU, memory — positive numbers)
- ⬜ Create preset workload configurations (`GET /api/presets/workloads`)
- ⬜ Store parsed workload data in experiment config

### 4.2 Frontend — Workload Configuration UI
- ⬜ Build workload upload dropzone component (drag-and-drop)
- ⬜ Build manual task entry form (task count, size, CPU, memory inputs)
- ⬜ Build task list preview table (editable)
- ⬜ Add preset workload selector dropdown
- ⬜ Add validation feedback (inline errors, success indicators)
- ⬜ Add file type/size validation (CSV/JSON, max 10MB)

---

## Phase 5: VM / Data Center Configuration (FR2)

### 5.1 Backend — VM Config API
- ⬜ Create VM configuration schema and validation
- ⬜ Create preset VM configurations (`GET /api/presets/vms`)
- ⬜ Support heterogeneous VM types (different MIPS, RAM, BW)

### 5.2 Frontend — VM Configuration UI
- ⬜ Build VM configuration form (VM count, MIPS, RAM, BW sliders/inputs)
- ⬜ Build VM list preview with specs table
- ⬜ Add preset VM configuration selector
- ⬜ Add "add VM type" button for heterogeneous environments
- ⬜ Add visual VM capacity representation

---

## Phase 6: Experiment Management (FR6)

### 6.1 Backend — Experiment CRUD
- ⬜ Create `Experiment` Mongoose model with full schema
- ⬜ Implement `POST /api/experiments` — create experiment
- ⬜ Implement `GET /api/experiments` — list user's experiments (paginated)
- ⬜ Implement `GET /api/experiments/:id` — get experiment details
- ⬜ Implement `PUT /api/experiments/:id` — update experiment
- ⬜ Implement `DELETE /api/experiments/:id` — delete experiment
- ⬜ Add ownership validation (users can only access their own experiments)
- ⬜ Add database indexes for performance
- ⬜ Write API tests for experiment endpoints

### 6.2 Frontend — Experiment Management UI
- ⬜ Build experiment list page with cards/table view
- ⬜ Build "New Experiment" wizard (stepper: Workload → VMs → Algorithm → Parameters)
- ⬜ Build experiment detail page
- ⬜ Add experiment status badges (pending, running, completed, failed)
- ⬜ Add delete experiment with confirmation dialog
- ⬜ Add experiment search and filter (by algorithm, status, date)
- ⬜ Add experiment tags and notes editing

---

## Phase 7: Optimization Engine (FR3)

### 7.1 EDO Algorithm Implementation
- ⬜ Implement Enterprise Development Optimizer (EDO) in Python
- ⬜ Implement population initialization
- ⬜ Implement enterprise growth strategy (exploration phase)
- ⬜ Implement exploitation phase
- ⬜ Implement multi-objective fitness function (weighted sum)
- ⬜ Add convergence tracking (fitness per iteration)
- ⬜ Add Pareto front extraction
- ⬜ Add seed control for reproducibility
- ⬜ Write unit tests for EDO

### 7.2 Comparative Algorithms
- ⬜ Implement PSO (Particle Swarm Optimization) in Python
- ⬜ Implement ACO (Ant Colony Optimization) in Python
- ⬜ Implement WOA (Whale Optimization Algorithm) in Python
- ⬜ Implement Baseline schedulers (Round-robin, First-fit) in Python
- ⬜ Ensure all algorithms implement `BaseOptimizer` interface
- ⬜ Write unit tests for each algorithm

### 7.3 Objective Functions
- ⬜ Implement makespan calculation module
- ⬜ Implement energy consumption model
- ⬜ Implement reliability/fault-tolerance metric
- ⬜ Implement resource utilization calculation
- ⬜ Implement combined weighted objective function
- ⬜ Write unit tests for objective functions

### 7.4 Backend Integration
- ⬜ Create `optimizationService.js` — spawn Python process
- ⬜ Implement JSON input/output piping between Node.js and Python
- ⬜ Handle Python process errors and timeouts
- ⬜ Implement `POST /api/experiments/:id/run` endpoint
- ⬜ Store optimization results in database
- ⬜ Add experiment status updates (pending → running → completed/failed)

### 7.5 Frontend — Algorithm Selection & Parameters
- ⬜ Build algorithm selector component (radio buttons or chips)
- ⬜ Build hyperparameter tuning form (population size, iterations, seed)
- ⬜ Build objective weight sliders (makespan, energy, reliability — must sum to 1.0)
- ⬜ Add "Run Experiment" button with loading state
- ⬜ Show real-time experiment progress indicator
- ⬜ Handle run errors with user-friendly messages

---

## Phase 8: Simulation Engine (FR4)

### 8.1 CloudSim Integration
- ⬜ Implement CloudSim datacenter creation from VM config
- ⬜ Implement host and VM provisioning
- ⬜ Implement cloudlet (task) creation from workload config
- ⬜ Implement schedule application (task-to-VM mapping)
- ⬜ Implement simulation execution and result collection
- ⬜ Implement failure injection (VM failures, resource faults)
- ⬜ Implement metrics extraction (makespan, energy, reliability)
- ⬜ Build JAR with all dependencies

### 8.2 Backend Integration
- ⬜ Create `simulationService.js` — spawn Java process
- ⬜ Implement JSON input/output piping between Node.js and Java
- ⬜ Handle Java process errors and timeouts
- ⬜ Chain optimization → simulation in experiment run pipeline
- ⬜ Store simulation results in Results collection

---

## Phase 9: Results Dashboard (FR5, FR8)

### 9.1 Backend — Results API
- ⬜ Create `Result` Mongoose model
- ⬜ Implement `GET /api/results/:experimentId` — get experiment results
- ⬜ Implement `GET /api/results/:id/export` — export as CSV/JSON
- ⬜ Add result aggregation for comparison queries

### 9.2 Frontend — Metric Cards
- ⬜ Build metric summary cards (Makespan, Energy, Reliability, Utilization)
- ⬜ Add delta indicators (% change from baseline, color-coded)
- ⬜ Style with JetBrains Mono for numeric values
- ⬜ Add glassmorphic card treatment

### 9.3 Frontend — Charts (Recharts)
- ⬜ Build Makespan bar chart (grouped by algorithm)
- ⬜ Build Energy consumption line chart (convergence over iterations)
- ⬜ Build Pareto front scatter chart (2D: makespan vs energy)
- ⬜ Build Convergence curve chart (fitness over iterations)
- ⬜ Build Resource utilization heatmap (VM × time)
- ⬜ Build Scheduling Gantt chart (task timeline per VM)
- ⬜ Style all charts with dark theme (neon colors, transparent grid)
- ⬜ Add glassmorphic tooltips on data points
- ⬜ Add chart legend and axis labels

### 9.4 Frontend — Results Page
- ⬜ Build results page layout (metrics + charts + raw data)
- ⬜ Add chart type switcher (bar, line, scatter)
- ⬜ Add export buttons (CSV, JSON download)
- ⬜ Add raw logs viewer with monospace text
- ⬜ Add scheduling table (Task ID, VM ID, Start Time, End Time)

---

## Phase 10: Algorithm Comparison (FR7)

### 10.1 Backend — Comparison API
- ⬜ Implement endpoint to fetch results for multiple experiments
- ⬜ Add comparison aggregation (same workload, different algorithms)
- ⬜ Support batch experiment creation (run all algorithms on same config)

### 10.2 Frontend — Comparison Dashboard
- ⬜ Build comparison page with algorithm selector (multi-select)
- ⬜ Build side-by-side metric cards per algorithm
- ⬜ Build overlaid charts (all algorithms on same axes)
- ⬜ Build comparison table with best-value highlighting (neon cyan)
- ⬜ Build Pareto front overlay (all algorithms' Pareto points)
- ⬜ Add "Run All Algorithms" batch button
- ⬜ Add sorting by metric (best makespan, best energy, etc.)

---

## Phase 11: AI Smart Suggest System

### 11.1 Suggestion Engine
- ⬜ Build suggestion logic (analyze schedule for improvement opportunities)
- ⬜ Generate rebalancing suggestions based on VM load
- ⬜ Generate alternative VM assignment suggestions
- ⬜ Calculate estimated improvement percentages

### 11.2 Frontend — AI Suggest UI
- ⬜ Build floating action button (FAB) with sparkle icon, bottom-right
- ⬜ Build AI suggestion panel (slide-in from right)
- ⬜ Build suggestion cards with Apply/Dismiss buttons
- ⬜ Add dashed glowing borders on optimal scheduling slots
- ⬜ Add subtle pulsing animation on AI elements (2s cycle)
- ⬜ Show confidence scores on suggestions

---

## Phase 12: Data Export & Persistence

### 12.1 Export Functionality
- ⬜ Implement CSV export for results (makespan, energy, reliability per run)
- ⬜ Implement JSON export for full experiment data
- ⬜ Implement Pareto front data export
- ⬜ Add download trigger from results page

### 12.2 Experiment Reload
- ⬜ Implement experiment configuration reload (populate form from saved config)
- ⬜ Implement "Clone Experiment" (duplicate with modifications)
- ⬜ Implement experiment versioning (track config changes)

---

## Phase 13: Responsive Design & Polish

### 13.1 Responsive Breakpoints
- ⬜ Ensure desktop layout works at ≥1280px
- ⬜ Implement tablet layout (768–1279px): collapsible sidebar, compact cards
- ⬜ Implement mobile layout (<768px): bottom nav, agenda view, stacked cards
- ⬜ Test all pages at all breakpoints

### 13.2 Microinteractions
- ⬜ Add button hover glow effects
- ⬜ Add card hover scale (1.02x) + shadow expansion
- ⬜ Add view transitions (slide + fade, 300ms)
- ⬜ Add staggered fade-in for result cards
- ⬜ Add experiment run progress animation (pulsing)
- ⬜ Add toast notifications for actions (success, error)
- ⬜ Respect `prefers-reduced-motion` for all animations

### 13.3 Accessibility
- ⬜ Audit color contrast (WCAG AA compliance)
- ⬜ Add ARIA labels to all interactive elements
- ⬜ Ensure full keyboard navigation
- ⬜ Add focus indicators (neon cyan outlines)
- ⬜ Pair all color coding with icons/labels
- ⬜ Add alt text to all images

---

## Phase 14: Testing

### 14.1 Frontend Tests
- ⬜ Write unit tests for utility functions
- ⬜ Write component tests for key UI components (metric cards, forms)
- ⬜ Write integration tests for auth flow
- ⬜ Write integration tests for experiment creation flow

### 14.2 Backend Tests
- ⬜ Write unit tests for auth service
- ⬜ Write unit tests for experiment service
- ⬜ Write API integration tests for all endpoints
- ⬜ Write tests for optimization service (Python spawn)
- ⬜ Write tests for simulation service (Java spawn)

### 14.3 Optimization Engine Tests
- ⬜ Write unit tests for EDO algorithm
- ⬜ Write unit tests for PSO, ACO, WOA algorithms
- ⬜ Write tests for objective functions (makespan, energy, reliability)
- ⬜ Write reproducibility tests (same seed → same output)
- ⬜ Write performance benchmarks

### 14.4 System Tests
- ⬜ Test full experiment pipeline (create → configure → run → results)
- ⬜ Test error handling (invalid input, process failures, timeouts)
- ⬜ Test concurrent experiment runs
- ⬜ Performance test: simulation completion within 2–3 minutes

---

## Phase 15: Documentation & Deployment Prep

### 15.1 Documentation
- ⬜ Write comprehensive `README.md` with setup instructions
- ⬜ Document API endpoints (request/response examples)
- ⬜ Document EDO algorithm parameters and tuning guide
- ⬜ Document CloudSim configuration options
- ⬜ Add JSDoc/docstrings to all public functions
- ⬜ Create user guide for running experiments

### 15.2 Deployment Preparation
- ⬜ Create `Dockerfile` for backend
- ⬜ Create `Dockerfile` for optimizer
- ⬜ Create `Dockerfile` for simulator
- ⬜ Create `docker-compose.yml` for full stack
- ⬜ Configure Vercel deployment for frontend
- ⬜ Configure Render deployment for backend
- ⬜ Set up GitHub Actions CI/CD pipeline
- ⬜ Create production environment variables template

---

## Summary

| Phase | Description | Tasks | Priority |
|---|---|---|---|
| 0 | Project Foundation & Setup | 30 | 🔴 Critical |
| 1 | Authentication System | 15 | 🔴 Critical |
| 2 | Landing Page | 28 | 🟡 High |
| 3 | Dashboard Layout | 9 | 🔴 Critical |
| 4 | Workload Configuration | 10 | 🔴 Critical |
| 5 | VM Configuration | 5 | 🔴 Critical |
| 6 | Experiment Management | 17 | 🔴 Critical |
| 7 | Optimization Engine | 25 | 🔴 Critical |
| 8 | Simulation Engine | 10 | 🔴 Critical |
| 9 | Results Dashboard | 19 | 🟡 High |
| 10 | Algorithm Comparison | 9 | 🟡 High |
| 11 | AI Smart Suggest | 8 | 🟢 Medium |
| 12 | Data Export & Persistence | 5 | 🟡 High |
| 13 | Responsive & Polish | 18 | 🟢 Medium |
| 14 | Testing | 16 | 🟡 High |
| 15 | Documentation & Deployment | 15 | 🟢 Medium |
| **Total** | | **~239 tasks** | |

---

## Recommended Build Order

```
Phase 0 → Phase 1 → Phase 3 → Phase 6 → Phase 4 → Phase 5
  → Phase 7 → Phase 8 → Phase 9 → Phase 10 → Phase 2
  → Phase 11 → Phase 12 → Phase 13 → Phase 14 → Phase 15
```

**Rationale:**
1. Set up infrastructure first (Phase 0)
2. Auth gates everything (Phase 1)
3. Dashboard shell gives a workspace (Phase 3)
4. Experiment CRUD is the core loop (Phase 6)
5. Workload + VM config feeds into experiments (Phase 4, 5)
6. Optimization + Simulation are the engine (Phase 7, 8)
7. Results make the engine useful (Phase 9)
8. Comparison is the differentiator (Phase 10)
9. Landing page can be built in parallel or later (Phase 2)
10. Polish, AI features, testing, and docs come last (Phase 11–15)
