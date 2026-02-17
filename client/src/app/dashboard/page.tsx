import { FlaskConical, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-1">
          Welcome to EDO-Cloud Scheduler. Start by creating an experiment.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Experiments', value: '—', color: 'text-neon-cyan' },
          { label: 'Completed', value: '—', color: 'text-success' },
          { label: 'Running', value: '—', color: 'text-neon-amber' },
          { label: 'Best Makespan', value: '—', color: 'text-neon-magenta' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-5">
            <p className="text-xs text-text-tertiary uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-mono font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <div className="glass rounded-2xl p-8 flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-neon-cyan-dim flex items-center justify-center mb-4">
          <FlaskConical className="h-8 w-8 text-neon-cyan" />
        </div>
        <h2 className="font-heading text-xl font-semibold mb-2">Create Your First Experiment</h2>
        <p className="text-text-secondary max-w-md mb-6">
          Configure workloads, select an optimization algorithm, and run your first cloud
          scheduling experiment.
        </p>
        <Link href="/dashboard/experiments/new">
          <Button size="lg">
            New Experiment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
