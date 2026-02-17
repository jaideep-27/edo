import { Button } from '@/components/ui';
import {
  Cloud,
  Zap,
  BarChart3,
  Cpu,
  GitCompareArrows,
  FlaskConical,
  Repeat,
  ArrowRight,
  ChevronRight,
  Activity,
  Timer,
  BatteryCharging,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  {
    title: 'Multi-Objective Optimization',
    description:
      'Balance makespan, energy, and reliability simultaneously with Pareto-optimal solutions using our novel EDO algorithm.',
    icon: Zap,
    color: 'text-neon-cyan',
  },
  {
    title: 'Algorithm Comparison',
    description:
      'Compare EDO against PSO, ACO, GA, WOA, and baseline schedulers on standardized cloud benchmarks.',
    icon: GitCompareArrows,
    color: 'text-neon-magenta',
  },
  {
    title: 'CloudSim Integration',
    description:
      'Run realistic cloud simulations with configurable VMs, workloads, and heterogeneous resource environments.',
    icon: Cloud,
    color: 'text-neon-amber',
  },
  {
    title: 'Interactive Dashboards',
    description:
      'Visualize results with Pareto fronts, convergence curves, Gantt charts, and multi-metric comparison views.',
    icon: BarChart3,
    color: 'text-neon-cyan',
  },
  {
    title: 'Experiment Management',
    description:
      'Create, save, reload, and compare experiments. Export results in JSON/CSV for further academic analysis.',
    icon: FlaskConical,
    color: 'text-neon-magenta',
  },
  {
    title: 'Reproducible Research',
    description:
      'Seed-controlled execution ensures identical inputs produce identical outputs — perfect for rigorous evaluation.',
    icon: Repeat,
    color: 'text-neon-amber',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Configure Workload',
    description:
      'Define your cloud tasks — count, processing lengths, file sizes, and resource requirements.',
  },
  {
    step: '02',
    title: 'Set Up VMs',
    description:
      'Configure virtual machines with MIPS, RAM, bandwidth, and pricing to model your cloud environment.',
  },
  {
    step: '03',
    title: 'Select Algorithm',
    description:
      'Choose from EDO, PSO, ACO, GA, WOA, or baseline schedulers. Tune hyperparameters or use smart defaults.',
  },
  {
    step: '04',
    title: 'Analyze Results',
    description:
      'View convergence curves, Pareto fronts, Gantt schedules, and compare metrics across experiments.',
  },
];

const ALGORITHMS = [
  { name: 'EDO', label: 'Enterprise Dev Optimizer', type: 'Novel', color: 'bg-neon-cyan' },
  { name: 'PSO', label: 'Particle Swarm', type: 'Swarm', color: 'bg-neon-magenta' },
  { name: 'ACO', label: 'Ant Colony', type: 'Swarm', color: 'bg-neon-amber' },
  { name: 'GA', label: 'Genetic Algorithm', type: 'Evolutionary', color: 'bg-brand-purple' },
  { name: 'WOA', label: 'Whale Optimization', type: 'Swarm', color: 'bg-neon-cyan' },
];

const STATS = [
  { value: '8', label: 'Scheduling Algorithms', icon: Cpu },
  { value: '4', label: 'Optimization Objectives', icon: Activity },
  { value: '<2s', label: 'Avg Optimization Time', icon: Timer },
  { value: '35%', label: 'Avg Energy Reduction', icon: BatteryCharging },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong h-16 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <Cloud className="h-6 w-6 text-neon-cyan" />
          <span className="font-heading font-bold text-lg text-text-primary">
            EDO-Cloud
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            How It Works
          </a>
          <a href="#algorithms" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Algorithms
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen pt-16 px-6 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/20 via-canvas to-canvas" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-purple/10 rounded-full blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[120px]" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(102,252,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(102,252,241,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 animate-slide-up">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Multi-Objective Cloud Task Scheduling
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-wider leading-[1.1] mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Scheduling That{' '}
            <span className="text-neon-cyan relative">
              Thinks
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M1 5.5C40 2 80 2 100 4C120 6 160 6 199 3" stroke="#66FCF1" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>{' '}
            For You
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Powered by the Enterprise Development Optimizer to minimize makespan,
            reduce energy, maximize reliability — and visualize every optimization step in real-time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/signup">
              <Button size="lg" className="min-w-[200px] group">
                Start Optimizing
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost" size="lg" className="min-w-[200px]">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Metrics preview pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {[
              { label: 'Makespan', icon: Timer, color: 'text-neon-cyan' },
              { label: 'Energy', icon: BatteryCharging, color: 'text-neon-magenta' },
              { label: 'Reliability', icon: Shield, color: 'text-neon-amber' },
              { label: 'Utilization', icon: Activity, color: 'text-brand-purple' },
            ].map((m) => (
              <div key={m.label} className="glass rounded-full px-4 py-2 flex items-center gap-2">
                <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                <span className="text-xs text-text-secondary">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent" />
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-neon-cyan uppercase tracking-widest">
              Capabilities
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-4">
              Everything You Need to Optimize
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              From experiment creation to result visualization — a complete platform
              for cloud task scheduling research.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-6 hover:scale-[1.02] hover:border-neon-cyan/20 transition-all duration-300 group"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl glass-subtle mb-4`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-text-primary group-hover:text-neon-cyan transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-purple/5 to-transparent" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-neon-magenta uppercase tracking-widest">
              Process
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-4">
              Four Steps to Optimal Scheduling
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Configure, run, analyze. Our streamlined workflow gets you from workload
              definition to optimized results in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.step} className="relative">
                <div className="glass rounded-2xl p-6 h-full">
                  <div className="text-4xl font-display font-extrabold text-neon-cyan/20 mb-3">
                    {step.step}
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2 text-text-primary">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {/* Arrow connector */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ChevronRight className="h-5 w-5 text-neon-cyan/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Algorithm Showcase ──────────────────────────── */}
      <section id="algorithms" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-neon-amber uppercase tracking-widest">
              Algorithms
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-4">
              Battle-Tested Optimization Algorithms
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              5 metaheuristic algorithms plus 3 baseline schedulers — run them head-to-head
              on identical workloads to prove EDO&apos;s superiority.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ALGORITHMS.map((algo) => (
              <div
                key={algo.name}
                className="glass rounded-2xl p-5 text-center hover:scale-105 hover:border-neon-cyan/20 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${algo.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-canvas font-mono font-bold text-sm">{algo.name}</span>
                </div>
                <h3 className="font-heading font-semibold text-sm text-text-primary mb-1">
                  {algo.label}
                </h3>
                <span className="text-xs text-text-tertiary">{algo.type}</span>
              </div>
            ))}
          </div>

          {/* Baseline row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {['Round Robin', 'Min-Min', 'Max-Min'].map((name) => (
              <div key={name} className="glass rounded-full px-4 py-2">
                <span className="text-xs text-text-secondary font-medium">{name}</span>
                <span className="text-xs text-text-tertiary ml-2">Baseline</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────── */}
      <section className="py-16 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 via-neon-cyan/5 to-brand-purple/10" />
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-6 w-6 text-neon-cyan mx-auto mb-3" />
                <div className="font-display text-3xl md:text-4xl font-extrabold text-text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-strong rounded-3xl p-12 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-neon-cyan/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Ready to Optimize?
              </h2>
              <p className="text-text-secondary max-w-lg mx-auto mb-8">
                Create your first experiment in under a minute. Compare algorithms,
                visualize results, and discover the optimal schedule for your cloud workloads.
              </p>
              <Link href="/signup">
                <Button size="lg" className="min-w-[220px] group">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border-glass py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="h-5 w-5 text-neon-cyan" />
                <span className="font-heading font-bold text-text-primary">EDO-Cloud</span>
              </div>
              <p className="text-sm text-text-tertiary leading-relaxed">
                Multi-objective cloud task scheduling platform powered by the
                Enterprise Development Optimizer.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-heading font-semibold text-sm text-text-primary mb-3">Platform</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-sm text-text-tertiary hover:text-text-secondary transition-colors">Features</a>
                <a href="#how-it-works" className="block text-sm text-text-tertiary hover:text-text-secondary transition-colors">How It Works</a>
                <a href="#algorithms" className="block text-sm text-text-tertiary hover:text-text-secondary transition-colors">Algorithms</a>
              </div>
            </div>

            {/* Team */}
            <div>
              <h4 className="font-heading font-semibold text-sm text-text-primary mb-3">Team A01</h4>
              <div className="space-y-1 text-sm text-text-tertiary">
                <p>A. Jaideep (227Z1A0508)</p>
                <p>G. Sai Teja (227Z1A0559)</p>
                <p>B. Bhanu Prasad (227Z1A0514)</p>
                <p className="mt-2 text-text-secondary">Guide: Dr. K. Rameshwaraiah</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border-glass pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-text-tertiary">
              © 2026 EDO-Cloud Scheduler. Academic research project — CMR Technical Campus.
            </p>
            <p className="text-xs text-text-tertiary">
              Built with Next.js, Express.js, CloudSim Plus & Python
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
