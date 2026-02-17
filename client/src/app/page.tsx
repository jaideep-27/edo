import { Button } from '@/components/ui';
import { Cloud } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong h-16 flex items-center justify-between px-6">
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
          <a href="#solutions" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Solutions
          </a>
          <a href="#pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Pricing
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

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen pt-16 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/20 via-canvas to-canvas" />

        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[120px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
            <Cloud className="h-4 w-4 text-neon-cyan" />
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              EDO-Cloud Scheduler
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-extrabold uppercase tracking-wider leading-tight mb-6">
            Scheduling That{' '}
            <span className="text-neon-cyan">Thinks</span> For You
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Powered by AI to automatically optimize cloud task scheduling, minimize makespan,
            reduce energy consumption, and surface the best configurations — exactly when you need them.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="min-w-[180px]">
                Start Free Trial
              </Button>
            </Link>
            <a href="#features">
              <Button variant="ghost" size="lg" className="min-w-[180px]">
                Learn More
              </Button>
            </a>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Built to Optimize Your Time
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Your EDO-powered platform is more than a simple scheduler. With intelligent
              optimization and AI-driven analysis, it ensures your cloud resources are
              used at peak efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Multi-Objective Optimization',
                description:
                  'Balance makespan, energy, and reliability simultaneously with Pareto-optimal solutions using EDO.',
                icon: '🎯',
              },
              {
                title: 'Algorithm Comparison',
                description:
                  'Compare EDO against PSO, ACO, WOA, and baseline schedulers on standardized benchmarks.',
                icon: '📊',
              },
              {
                title: 'CloudSim Integration',
                description:
                  'Run realistic cloud simulations with configurable VMs, workloads, and failure scenarios.',
                icon: '☁️',
              },
              {
                title: 'Interactive Dashboards',
                description:
                  'Visualize results with Pareto fronts, convergence curves, Gantt charts, and metric comparisons.',
                icon: '📈',
              },
              {
                title: 'Experiment Management',
                description:
                  'Save, reload, and compare experiments. Export results in CSV/JSON for further analysis.',
                icon: '🧪',
              },
              {
                title: 'Reproducible Research',
                description:
                  'Seed control ensures identical inputs produce identical outputs. Perfect for academic evaluation.',
                icon: '🔬',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-6 hover:scale-[1.02] hover:glow-cyan transition-all duration-200"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-text-primary">
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

      {/* Footer */}
      <footer className="border-t border-border-glass py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-neon-cyan" />
            <span className="font-heading font-bold text-text-primary">EDO-Cloud</span>
          </div>
          <p className="text-sm text-text-tertiary">
            © 2026 EDO-Cloud Scheduler. Academic research project.
          </p>
        </div>
      </footer>
    </div>
  );
}
