'use client';

import { useEffect, useState } from 'react';
import {
  FlaskConical,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Loader2,
  Zap,
  Clock,
  BarChart3,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { Button, Badge } from '@/components/ui';
import { useExperimentStore } from '@/stores/experimentStore';
import { useAuthStore } from '@/stores/authStore';
import type { Experiment } from '@/types';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-5 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-tertiary uppercase tracking-wider font-medium">
          {label}
        </p>
        <div className={`h-8 w-8 rounded-lg glass-subtle flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <p className={`text-2xl font-mono font-bold ${color}`}>{value}</p>
    </div>
  );
}

const STATUS_MAP: Record<string, { color: 'cyan' | 'amber' | 'success' | 'error' | 'magenta'; label: string }> = {
  draft: { color: 'cyan', label: 'Draft' },
  queued: { color: 'amber', label: 'Queued' },
  running: { color: 'magenta', label: 'Running' },
  completed: { color: 'success', label: 'Completed' },
  failed: { color: 'error', label: 'Failed' },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { experiments, fetchExperiments, isLoading } = useExperimentStore();
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      fetchExperiments().finally(() => setHasFetched(true));
    }
  }, [fetchExperiments, hasFetched]);

  const total = experiments.length;
  const completed = experiments.filter((e) => e.status === 'completed').length;
  const running = experiments.filter(
    (e) => e.status === 'running' || e.status === 'queued'
  ).length;
  const recent = experiments.slice(0, 5);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Welcome back, {firstName}
          </h1>
          <p className="text-text-secondary mt-1">
            Here&apos;s an overview of your scheduling experiments.
          </p>
        </div>
        <Link href="/dashboard/experiments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Experiment
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Experiments"
          value={total}
          icon={FlaskConical}
          color="text-neon-cyan"
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          color="text-success"
        />
        <StatCard
          label="Running"
          value={running}
          icon={Loader2}
          color="text-neon-amber"
        />
        <StatCard
          label="Success Rate"
          value={total > 0 ? `${Math.round((completed / total) * 100)}%` : '—'}
          icon={TrendingUp}
          color="text-neon-magenta"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Experiments */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-lg text-text-primary">
              Recent Experiments
            </h2>
            {total > 0 && (
              <Link
                href="/dashboard/experiments"
                className="text-xs text-neon-cyan hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {isLoading && !hasFetched ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-neon-cyan animate-spin" />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12">
              <FlaskConical className="h-10 w-10 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary text-sm mb-4">
                No experiments yet. Create your first one!
              </p>
              <Link href="/dashboard/experiments/new">
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  New Experiment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((exp: Experiment) => {
                const status = STATUS_MAP[exp.status] || STATUS_MAP.draft;
                return (
                  <Link
                    key={exp._id}
                    href={`/dashboard/experiments/${exp._id}`}
                    className="flex items-center justify-between glass-subtle rounded-xl p-4 hover:border-neon-cyan/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg glass flex items-center justify-center shrink-0">
                        <Zap className="h-4 w-4 text-neon-cyan" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate group-hover:text-neon-cyan transition-colors">
                          {exp.name}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {exp.algorithm} · {exp.workloadConfig?.taskCount || '?'} tasks
                        </p>
                      </div>
                    </div>
                    <Badge color={status.color}>{status.label}</Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-lg text-text-primary mb-5">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link href="/dashboard/experiments/new" className="block">
              <div className="glass-subtle rounded-xl p-4 hover:border-neon-cyan/20 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-neon-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary group-hover:text-neon-cyan transition-colors">
                      New Experiment
                    </p>
                    <p className="text-xs text-text-tertiary">Configure &amp; run</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/compare" className="block">
              <div className="glass-subtle rounded-xl p-4 hover:border-neon-cyan/20 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-neon-magenta/10 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-neon-magenta" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary group-hover:text-neon-cyan transition-colors">
                      Compare Algorithms
                    </p>
                    <p className="text-xs text-text-tertiary">Side-by-side analysis</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/experiments" className="block">
              <div className="glass-subtle rounded-xl p-4 hover:border-neon-cyan/20 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-neon-amber/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-neon-amber" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary group-hover:text-neon-cyan transition-colors">
                      View History
                    </p>
                    <p className="text-xs text-text-tertiary">All experiments</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
