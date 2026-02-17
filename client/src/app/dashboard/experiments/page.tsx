'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Loader2,
  FlaskConical,
  Zap,
  Trash2,
  Play,
  BarChart3,
} from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { useExperimentStore } from '@/stores/experimentStore';
import type { Experiment } from '@/types';

const STATUS_BADGE: Record<string, 'cyan' | 'amber' | 'magenta' | 'success' | 'error'> = {
  draft: 'cyan',
  queued: 'amber',
  running: 'magenta',
  completed: 'success',
  failed: 'error',
};

export default function ExperimentsPage() {
  const {
    experiments,
    fetchExperiments,
    deleteExperiment,
    runExperiment,
    isLoading,
  } = useExperimentStore();
  const [hasFetched, setHasFetched] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!hasFetched) {
      fetchExperiments().finally(() => setHasFetched(true));
    }
  }, [fetchExperiments, hasFetched]);

  const filtered = experiments.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.algorithm.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Delete this experiment? This cannot be undone.')) {
      await deleteExperiment(id);
    }
  };

  const handleRun = async (id: string) => {
    await runExperiment(id);
    fetchExperiments();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Experiments
          </h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {experiments.length} experiment{experiments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/dashboard/experiments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Experiment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search experiments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'running', 'completed', 'failed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'glass-strong text-neon-cyan'
                  : 'glass text-text-secondary hover:text-text-primary'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading && !hasFetched ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-neon-cyan animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <FlaskConical className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-2">
            {search || filterStatus !== 'all'
              ? 'No matching experiments'
              : 'No experiments yet'}
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            {search || filterStatus !== 'all'
              ? 'Try adjusting your filters.'
              : 'Create your first experiment to get started.'}
          </p>
          {!search && filterStatus === 'all' && (
            <Link href="/dashboard/experiments/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exp: Experiment) => (
            <div
              key={exp._id}
              className="glass rounded-xl p-5 hover:border-neon-cyan/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-xl glass-subtle flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="h-5 w-5 text-neon-cyan" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading font-semibold text-text-primary truncate">
                      {exp.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary">
                      <span className="font-mono">{exp.algorithm}</span>
                      <span>·</span>
                      <span>{exp.workloadConfig?.taskCount || '?'} tasks</span>
                      <span>·</span>
                      <span>{exp.vmConfig?.vmCount || '?'} VMs</span>
                      <span>·</span>
                      <span>
                        {new Date(exp.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge color={STATUS_BADGE[exp.status] || 'cyan'}>
                    {exp.status}
                  </Badge>

                  {exp.status === 'draft' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRun(exp._id)}
                    >
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  {exp.status === 'completed' && (
                    <Link href={`/dashboard/experiments`}>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(exp._id)}
                    className="text-text-tertiary hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
