# EDOCloud: Multi-Objective Cloud Task Scheduler
## UI/UX Design Document

**Version:** 1.0  
**Date:** February 17, 2026  
**Project:** EDO-Cloud Scheduler  

---

## 1. Design Goals

### Primary Goals
- Make complex cloud scheduling feel **simple and approachable**
- Visualize AI optimization intelligence **clearly and intuitively**
- Reduce **cognitive load** when configuring experiments and reading results
- Encourage **trust** in EDO's AI-driven scheduling suggestions
- Support **data-dense** dashboard layouts without visual clutter

### Experience Goals
- **Futuristic** but professional aesthetic
- **Calm, focused** workspace environment
- **High readability** for dense numerical data and charts
- **Smooth, modern** interactions and transitions

---

## 2. Design Inspiration

Design inspiration is derived from:
- Futuristic SaaS dashboards (Linear, Vercel, Raycast)
- **Glassmorphism** UI trends — frosted glass panels, blur effects
- Dark-mode productivity tools
- AI-driven scheduling platforms
- The attached UI reference image (EDO-Cloud Scheduler hero concept)

### Visual Direction
Combines **high-tech minimalism** with **retro-futuristic neon accents**.

Key References from UI Mockup:
- Purple-to-dark gradient hero backgrounds
- Floating 3D glass folder/card elements
- Frosted glass navigation bar
- Bold typographic hierarchy
- Neon CTA buttons on dark surfaces
- Multi-section landing page with feature grids

---

## 3. Visual Identity

### 3.1 Theme

**Atmospheric dark mode** simulating cloud depth and digital space.

**Mood Keywords:**
- Intelligent
- Calm
- Precise
- Premium tech
- Engineered

### 3.2 Color System

#### Base Colors
| Purpose | Color | Hex |
|---|---|---|
| Canvas / Background | Deep navy-black | `#0B0C10` |
| Panels / Cards | Dark blue-gray | `#1F2833` |
| Surface Elevated | Slightly lighter | `#2A3040` |
| Overlay Fog | Semi-transparent white | `rgba(255, 255, 255, 0.05)` |
| Text Primary | Off-white | `#E8E8E8` |
| Text Secondary | Muted gray | `#A0A0B0` |
| Text Tertiary | Dim | `#6B6B80` |
| Borders | Subtle dividers | `rgba(255, 255, 255, 0.08)` |

#### Accent Colors
| Purpose | Color | Hex | Usage |
|---|---|---|---|
| Primary Neon | Cyan / Teal | `#66FCF1` | CTAs, active states, primary actions |
| Highlight Magenta | Hot pink | `#FF2A6D` | Alerts, warnings, secondary highlights |
| Focus Amber | Golden yellow | `#FFC857` | Focus time, attention items, amber states |
| EDO Brand Purple | Deep purple | `#6C3CE1` | Brand identity, hero gradients |
| Success Green | Bright green | `#4ADE80` | Success states, completed experiments |
| Error Red | Coral red | `#F87171` | Error states, failed runs |

#### Gradient Definitions
```css
/* Hero background gradient */
--gradient-hero: linear-gradient(180deg, #1a0533 0%, #0B0C10 60%, #0B0C10 100%);

/* Card glassmorphism */
--gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);

/* Primary button */
--gradient-cta: linear-gradient(135deg, #66FCF1 0%, #45E0D5 100%);

/* Purple accent */
--gradient-purple: linear-gradient(135deg, #6C3CE1 0%, #9B59F0 100%);
```

### 3.3 Typography

#### Headers — Space Grotesk / Syncopate
- **Font:** Space Grotesk (primary), Syncopate (display hero)
- **Weight:** Bold (700), Extra Bold (800)
- **Style:** Geometric, slight letter spacing (+0.02em)
- **Purpose:** Convey engineered precision and authority

| Element | Font | Size | Weight | Tracking |
|---|---|---|---|---|
| Hero Title | Syncopate | 56px / 3.5rem | 800 | +0.05em |
| Section Title | Space Grotesk | 40px / 2.5rem | 700 | +0.02em |
| Card Title | Space Grotesk | 20px / 1.25rem | 600 | +0.01em |
| Nav Items | Space Grotesk | 14px / 0.875rem | 500 | +0.02em |

#### Body & Data — JetBrains Mono / Roboto Mono
- **Font:** JetBrains Mono (code/data), Inter (body text)
- **Weight:** Regular (400), Medium (500)
- **Purpose:** Improve scanability for schedules, metrics, and numerical data

| Element | Font | Size | Weight |
|---|---|---|---|
| Body Text | Inter | 16px / 1rem | 400 |
| Data Labels | JetBrains Mono | 14px / 0.875rem | 400 |
| Metric Values | JetBrains Mono | 24px / 1.5rem | 600 |
| Code/Logs | JetBrains Mono | 13px / 0.8125rem | 400 |
| Captions | Inter | 12px / 0.75rem | 400 |

---

## 4. Layout Structure

### 4.1 Navigation Bar

**Style:**
- Frosted glass (glassmorphism)
- `backdrop-filter: blur(20px)`
- `background: rgba(31, 40, 51, 0.7)`
- Fixed position, top of viewport
- Height: 64px
- Border bottom: `1px solid rgba(255, 255, 255, 0.08)`

**Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│  🌀 EDOCloud    Features ▾  Solutions ▾  Pricing  Resources ▾   │
│                 Enterprise                    Sign In  [Get Started] │
└──────────────────────────────────────────────────────────────────┘
```

- **Left:** EDOCloud logo (cloud icon + wordmark)
- **Center:** Navigation links with dropdown indicators
  - Features, Solutions, Pricing, Resources, Enterprise
- **Right:**
  - Sign In (text link)
  - Get Started (neon pill button, `#66FCF1` background, dark text)

### 4.2 Hero Section

**Content:**
```
┌──────────────────────────────────────────────────┐
│                                                  │
│    [Floating 3D glass folders - parallax]        │
│                                                  │
│         🌀 EDO-CLOUD SCHEDULER                   │
│                                                  │
│         SCHEDULING THAT                          │
│         THINKS FOR YOU                           │
│                                                  │
│    Powered by AI to automatically organize       │
│    meetings, optimize calendars, and surface     │
│    the best times for everyone.                  │
│                                                  │
│    [Start Free Trial]  [Learn More]              │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Visuals:**
- Floating glass folders with semi-transparent calendar cards
- Purple-to-dark gradient background (`--gradient-hero`)
- Subtle parallax effect: mouse movement shifts layers creating 3D illusion
- Misty depth particles in background
- CTA buttons:
  - **Start Free Trial:** Solid neon cyan (`#66FCF1`), dark text
  - **Learn More:** Ghost/outline button, white border

### 4.3 Features Section

**Layout:** 3-column grid with icon + title + description

```
┌─────────────────┬─────────────────┬─────────────────┐
│  🎯              │  📅              │  🤖              │
│  Smart Conflict  │  Seamless        │  Artificial      │
│  Resolution      │  Calendar        │  Probability     │
│                  │  Suggestion      │  Theme           │
│  Use AI to       │  Syncs with      │  Uses smart      │
│  resolve your    │  Google, Apple   │  probability to  │
│  calendar        │  & Outlook to    │  predict best    │
│  conflicts...    │  keep your       │  meeting times   │
│                  │  schedule...     │  in advance...   │
└─────────────────┴─────────────────┴─────────────────┘
```

### 4.4 Pricing Section
- Tier cards with glassmorphism treatment
- Feature comparison table
- Highlighted recommended plan

### 4.5 Footer
- Multi-column footer with links
- Social media icons
- Copyright and legal

---

## 5. Core Application Interface (Dashboard)

### 5.1 Overall Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Navbar (fixed)                                                     │
├──────────┬───────────────────────────────────────┬──────────────────┤
│          │                                       │                  │
│  Left    │          Main Stage                   │  Right           │
│  Sidebar │          (Primary workspace)          │  Insights        │
│          │                                       │  Panel           │
│  • Mini  │  • Experiment configuration           │                  │
│    nav   │  • Scheduling grid                    │  • AI suggest    │
│  • Quick │  • Results dashboard                  │  • Quick stats   │
│    access│  • Algorithm comparison               │  • Recent runs   │
│          │                                       │                  │
├──────────┴───────────────────────────────────────┴──────────────────┤
│  Status Bar                                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Left Sidebar

**Contents:**
- Navigation icons (Dashboard, Experiments, Compare, Settings)
- Quick access to recent experiments
- Algorithm selector
- Experiment filters
- Collapsible for focus mode (icon-only when collapsed)

**Style:**
- Width: 260px (expanded), 64px (collapsed)
- Background: `#1F2833`
- Border right: `rgba(255, 255, 255, 0.08)`

### 5.3 Main Stage

**Primary workspace area containing:**
- Experiment configuration forms
- Scheduling visualization grid
- Results charts and tables
- Algorithm comparison panels

**Background:**
- Dark gradient canvas (`#0B0C10`)
- Ultra-thin grid lines at low opacity (`rgba(255, 255, 255, 0.05)`)

### 5.4 Right Insights Panel

**Contents:**
- AI optimization suggestions
- Quick metric summaries
- Experiment progress indicator
- Recent activity log

**Width:** 320px, collapsible

---

## 6. Key UI Components

### 6.1 Experiment Configuration Card

**Style:** Glassmorphic panel
```css
background: rgba(31, 40, 51, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
padding: 24px;
```

**Contains:**
- Workload upload dropzone
- VM configuration sliders/inputs
- Algorithm selector (radio/chips)
- Hyperparameter controls
- "Run Experiment" CTA button

### 6.2 Result Metric Cards

**Style:** Compact glassmorphic cards in a 4-column grid

```
┌──────────┬──────────┬──────────┬──────────┐
│ Makespan │ Energy   │ Reliab.  │ Util.    │
│  1,245ms │  42.3 kW │  98.7%   │  87.2%   │
│  ▼ 12%   │  ▼ 8.5%  │  ▲ 3.2%  │  ▲ 5.1%  │
└──────────┴──────────┴──────────┴──────────┘
```

**Typography:**
- Metric value: JetBrains Mono, 24px, bold
- Label: Inter, 12px, muted
- Delta: Color-coded (green for improvement, red for regression)

### 6.3 Algorithm Comparison Table

| Feature | Glassmorphic table |
|---|---|
| Header | Sticky, semi-transparent |
| Rows | Hover highlight with glow |
| Best values | Highlighted in neon cyan |
| Sorting | Click column headers |

### 6.4 Chart Components (Recharts)

**Styling:**
- Dark background, no chart frame
- Neon-colored data lines/bars
- Tooltip: glassmorphic popup
- Grid lines: `rgba(255, 255, 255, 0.05)`
- Legend: below chart, horizontal

**Chart Types:**
- **Makespan Bar Chart:** Grouped bars per algorithm
- **Energy Line Chart:** Convergence over iterations
- **Pareto Front Scatter:** 2D/3D scatter with dominated/non-dominated points
- **Resource Utilization Heatmap:** VM × Time grid
- **Scheduling Gantt Chart:** Task assignments on timeline

### 6.5 Event / Task Cards (Scheduling Grid)

**Style:**
- Glassmorphic panels with rounded corners (12px)
- Blurred background fill
- Left border accent for category color

**Color Coding:**
| Type | Color | Hex |
|---|---|---|
| EDO Tasks | Cyan | `#66FCF1` |
| PSO Tasks | Magenta | `#FF2A6D` |
| Baseline Tasks | Amber | `#FFC857` |

**Typography:**
- Title: Bold sans-serif (Space Grotesk)
- Details: Monospace (JetBrains Mono)

---

## 7. AI Smart Suggest System

### Visual Indicators
- **Optimal slots:** Dashed glowing borders (`#66FCF1`, 50% opacity)
- **Suggested actions:** Subtle pulsing animation (2s cycle)
- **AI confidence:** Small percentage badge on suggestions

### Floating Action Button (FAB)
- **Icon:** Magic wand / sparkle ✨
- **Position:** Bottom-right corner, fixed
- **Size:** 56px circle
- **Background:** Gradient `#66FCF1` → `#45E0D5`
- **Shadow:** `0 4px 20px rgba(102, 252, 241, 0.3)`
- **Function:** Auto-optimize current schedule, shift flexible events

### AI Suggestion Panel
```
┌─────────────────────────────────┐
│  ✨ AI Optimization Suggestions │
│                                 │
│  💡 Moving Task 7 to VM-3       │
│     reduces makespan by 12%     │
│     [Apply] [Dismiss]           │
│                                 │
│  💡 Redistributing load across  │
│     VMs 1-5 saves 8.5% energy   │
│     [Apply] [Dismiss]           │
│                                 │
└─────────────────────────────────┘
```

---

## 8. Interaction Design

### Hover States
- Glow intensity increases (`box-shadow` expansion)
- Card scale: `transform: scale(1.02)`
- Soft shadow expansion: `0 8px 32px rgba(0,0,0,0.3)`
- Transition: `all 0.2s ease-out`

### Drag & Drop
- Faint motion trail on dragged elements
- Drop zone highlight with dashed border
- Drop confirmation: brief flash animation
- Used for: reordering tasks, assigning VMs manually

### View Transitions
- Slide and fade between views (`transform + opacity`)
- No hard reloads — maintain spatial continuity
- Page transition duration: 300ms ease-in-out

### Button States
```
Default   → Hover (glow + scale)
          → Active (press down + darken)
          → Disabled (50% opacity, no cursor)
          → Loading (spinner + text change)
```

### Form Interactions
- Input focus: neon cyan border glow
- Validation: inline error messages, red border
- Sliders: custom styled with neon thumb
- Dropdowns: glassmorphic dropdown panels

---

## 9. Page Structure

### Landing Page (Marketing)
```
Navbar (fixed, glassmorphism)
  ↓
Hero Section (gradient bg, 3D elements, parallax)
  ↓
Product Overview ("Scheduling That Thinks For You")
  ↓
Features Grid (3-column, icon cards)
  ↓
"Built to Optimize" Section (feature deep-dive)
  ↓
Testimonials / Social Proof
  ↓
Pricing Cards
  ↓
CTA Section (final conversion)
  ↓
Footer (multi-column, links, social)
```

### Application Dashboard
```
Navbar (fixed, with user avatar)
  ↓
┌──────────┬──────────────────────────┬──────────┐
│ Sidebar  │  Main Content Area       │ Insights │
│          │                          │ Panel    │
│ • Dash   │  [Active View]           │          │
│ • Exper  │  - New Experiment        │ • Stats  │
│ • Compare│  - Results               │ • AI     │
│ • History│  - Comparison            │ • Recent │
│ • Settings│ - Pareto Analysis       │          │
└──────────┴──────────────────────────┴──────────┘
```

---

## 10. Accessibility

- **Contrast:** High-contrast neon accents on dark backgrounds (WCAG AA minimum)
- **Typography:** Large, readable font sizes; minimum 14px for body text
- **Color independence:** Color coding always paired with icons/labels
- **Keyboard navigation:** Full keyboard navigable scheduling grid
- **Focus indicators:** Visible focus rings (`#66FCF1` outline)
- **Screen readers:** Proper ARIA labels on all interactive elements
- **Reduced motion:** Respect `prefers-reduced-motion` media query
- **Alt text:** All images and icons have descriptive alt text

---

## 11. Responsive Design

### Desktop First (Primary Platform)
- **Breakpoint:** ≥ 1280px
- Full three-panel layout (sidebar + main + insights)
- Complete feature set visible

### Tablet (768px – 1279px)
- Collapsible sidebar (icon-only by default)
- Insights panel hidden behind toggle
- Compact metric cards (2-column grid)
- Charts resize to fit viewport

### Mobile (< 768px)
- Bottom navigation bar replaces sidebar
- Agenda/list view instead of full scheduling grid
- Simplified AI suggestions (inline banners)
- Stacked metric cards (1-column)
- Touch-optimized controls (minimum 44px tap targets)

---

## 12. Microinteractions

| Interaction | Animation | Duration | Purpose |
|---|---|---|---|
| Button hover | Glow expansion | 200ms | Indicate interactivity |
| Card hover | Scale 1.02x + shadow | 200ms | Depth feedback |
| AI suggestion appear | Slide in + fade | 400ms | Draw attention gently |
| Experiment start | Progress pulse | Continuous | Show active processing |
| Result load | Staggered fade-in | 300ms × n | Sequential reveal |
| Success state | Check icon + green flash | 500ms | Confirm completion |
| Error state | Shake + red border | 300ms | Alert user |
| Chart data update | Smooth interpolation | 600ms | Data transition |
| Sidebar collapse | Width transition | 300ms | Smooth resize |
| Toast notification | Slide up + auto-dismiss | 3000ms | Non-blocking feedback |

### AI Element Animations
- Subtle pulse on AI suggestion cards (1px border glow cycle, 2s)
- Sparkle particles near FAB button (randomized, subtle)
- Purpose: Make AI feel **alive but not annoying**

---

## 13. Iconography

- **Style:** Outlined, 1.5px stroke, rounded corners
- **Size:** 20px default, 24px for navigation
- **Library:** Lucide Icons (consistent with Shadcn/UI)
- **Custom icons:** EDOCloud logo, algorithm icons

---

## 14. Future UI Enhancements

- **Voice scheduling:** Natural language experiment configuration
- **Heatmaps:** VM productivity and utilization visualization
- **AI assistant chat panel:** Conversational experiment guidance
- **Gesture-based interactions:** Pinch-to-zoom on Pareto fronts
- **3D Pareto visualization:** Three.js interactive 3D scatter
- **Real-time collaboration:** Shared experiment editing
- **Dark/Light mode toggle:** System-preference aware theming
