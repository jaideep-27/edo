'use client';

import { useEffect, useState } from 'react';
import { useExperimentStore } from '@/stores/experimentStore';
import { ALGORITHMS } from '@/lib/constants';
import api from '@/lib/api';
import {
  GitCompare,
  Plus,
  X,
  Loader2,
  BarChart3,
  Clock,
  Zap,
  ShieldCheck,
  Cpu,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import type { Experiment } from '@/types';
import { useChartTheme } from '@/hooks/useChartTheme';

interface CompareResult {
  _id: string;
  experimentId: string;
  makespan: number;
  energy: number;
  reliability: number;
  resourceUtilization: number;
  executionTime: number;
  convergenceData: { iteration: number; fitness: number }[];
}

const COLORS = ['#66FCF1', '#FF2A6D', '#FFC857', '#6C3CE1', '#4ADE80', '#F472B6', '#38BDF8', '#A78BFA'];

export default function ComparePage() {
  const { experiments, fetchExperiments, isLoading } = useExperimentStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [results, setResults] = useState<CompareResult[]>([]);
  const [comparing, setComparing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const ct = useChartTheme();

  useEffect(() => {
    if (!hasFetched) {
      fetchExperiments().finally(() => setHasFetched(true));
    }
  }, [fetchExperiments, hasFetched]);

  const completedExperiments = experiments.filter((e) => e.status === 'completed');

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 8 ? [...prev, id] : prev
    );
  };

  const runCompare = async () => {
    if (selectedIds.length < 2) return;
    setComparing(true);
    try {
      const { data: res } = await api.post('/results/compare', { experimentIds: selectedIds });
      setResults(res.data?.results ?? res.data ?? []);
    } catch {
      alert('Failed to compare experiments');
    } finally {
      setComparing(false);
    }
  };

  const getExperiment = (id: string): Experiment | undefined =>
    experiments.find((e) => e._id === id);

  const getAlgoColor = (exp: Experiment | undefined) =>
    ALGORITHMS.find((a) => a.id === exp?.algorithm)?.color ?? '#66FCF1';

  // Prepare chart data
  const barData =
    results.length > 0
      ? [
          {
            metric: 'Makespan',
            ...Object.fromEntries(results.map((r) => [r.experimentId, r.makespan])),
          },
          {
            metric: 'Energy',
            ...Object.fromEntries(results.map((r) => [r.experimentId, r.energy])),
          },
          {
            metric: 'Reliability',
            ...Object.fromEntries(results.map((r) => [r.experimentId, r.reliability * 100])),
          },
          {
            metric: 'Utilization',
            ...Object.fromEntries(results.map((r) => [r.experimentId, r.resourceUtilization])),
          },
        ]
      : [];

  const radarData =
    results.length > 0
      ? [
          {
            metric: 'Makespan',
            fullMark: 100,
            ...Object.fromEntries(
              results.map((r) => [
                r.experimentId,
                Math.min(100, (1 / (r.makespan / 100)) * 100),
              ])
            ),
          },
          {
            metric: 'Energy Eff.',
            fullMark: 100,
            ...Object.fromEntries(
              results.map((r) => [
                r.experimentId,
                Math.min(100, (1 / (r.energy / 500)) * 100),
              ])
            ),
          },
          {
            metric: 'Reliability',
            fullMark: 100,
            ...Object.fromEntries(results.map((r) => [r.experimentId, r.reliability * 100])),
          },
          {
            metric: 'Utilization',
            fullMark: 100,
            ...Object.fromEntries(results.map((r) => [r.experimentId, r.resourceUtilization])),
          },
        ]
      : [];

  // Find best values for highlighting
  const bestMakespan = results.length > 0 ? Math.min(...results.map((r) => r.makespan)) : 0;
  const bestEnergy = results.length > 0 ? Math.min(...results.map((r) => r.energy)) : 0;
  const bestReliability = results.length > 0 ? Math.max(...results.map((r) => r.reliability)) : 0;
  const bestUtilization = results.length > 0 ? Math.max(...results.map((r) => r.resourceUtilization)) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary flex items-center gap-3">
          <GitCompare className="w-8 h-8 text-neon-cyan" />
          Compare Algorithms
        </h1>
        <p className="text-text-secondary mt-1">
          Select 2–8 completed experiments for side-by-side performance comparison.
        </p>
      </div>

      {/* Selection area */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-secondary">
            Selected Experiments ({selectedIds.length}/8)
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass hover:bg-panel-elevated transition-colors text-text-secondary"
            >
              <Plus className="w-3.5 h-3.5" />
              {showPicker ? 'Hide List' : 'Add Experiments'}
            </button>
            {selectedIds.length >= 2 && (
              <button
                onClick={runCompare}
                disabled={comparing}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-neon-cyan text-canvas hover:bg-neon-cyan/90 transition-colors disabled:opacity-50"
              >
                {comparing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <BarChart3 className="w-3.5 h-3.5" />
                )}
                Compare
              </button>
            )}
          </div>
        </div>

        {/* Selected chips */}
        {selectedIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id, i) => {
              const exp = getExperiment(id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
                  style={{
                    borderColor: `${COLORS[i % COLORS.length]}44`,
                    backgroundColor: `${COLORS[i % COLORS.length]}15`,
                    color: COLORS[i % COLORS.length],
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {exp?.name ?? id.slice(-6)}
                  <span className="text-[10px] opacity-70">{exp?.algorithm}</span>
                  <button onClick={() => toggleSelect(id)} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-text-tertiary">
            No experiments selected. Click &ldquo;Add Experiments&rdquo; to get started.
          </p>
        )}

        {/* Picker dropdown */}
        {showPicker && (
          <div className="mt-4 pt-4 border-t border-border-glass max-h-60 overflow-y-auto space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
              </div>
            ) : completedExperiments.length === 0 ? (
              <p className="text-xs text-text-tertiary text-center py-4">
                No completed experiments found. Run experiments first.
              </p>
            ) : (
              completedExperiments.map((exp) => {
                const selected = selectedIds.includes(exp._id);
                return (
                  <button
                    key={exp._id}
                    onClick={() => toggleSelect(exp._id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      selected
                        ? 'bg-neon-cyan/10 text-neon-cyan'
                        : 'text-text-secondary hover:bg-panel-elevated hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center ${
                          selected ? 'border-neon-cyan bg-neon-cyan' : 'border-border-glass'
                        }`}
                      >
                        {selected && <span className="text-[8px] text-canvas">✓</span>}
                      </div>
                      <span className="font-medium">{exp.name}</span>
                    </div>
                    <span
                      className="font-mono px-1.5 py-0.5 rounded"
                      style={{
                        color: ALGORITHMS.find((a) => a.id === exp.algorithm)?.color ?? '#66FCF1',
                        backgroundColor: `${ALGORITHMS.find((a) => a.id === exp.algorithm)?.color ?? '#66FCF1'}15`,
                      }}
                    >
                      {exp.algorithm}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Comparison Table */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border-glass">
              <h2 className="text-sm font-semibold text-text-secondary">Metrics Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-glass">
                    <th className="text-left px-4 py-3 text-xs text-text-tertiary font-medium uppercase tracking-wider">
                      Experiment
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-text-tertiary font-medium uppercase tracking-wider">
                      <span className="flex items-center justify-end gap-1"><Clock className="w-3 h-3" /> Makespan</span>
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-text-tertiary font-medium uppercase tracking-wider">
                      <span className="flex items-center justify-end gap-1"><Zap className="w-3 h-3" /> Energy</span>
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-text-tertiary font-medium uppercase tracking-wider">
                      <span className="flex items-center justify-end gap-1"><ShieldCheck className="w-3 h-3" /> Reliability</span>
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-text-tertiary font-medium uppercase tracking-wider">
                      <span className="flex items-center justify-end gap-1"><Cpu className="w-3 h-3" /> Utilization</span>
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-text-tertiary font-medium uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const exp = getExperiment(r.experimentId);
                    return (
                      <tr key={r._id} className="border-b border-border-glass/50 hover:bg-panel-elevated/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-text-primary font-medium truncate max-w-[200px]">{exp?.name ?? '—'}</span>
                            <span
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                              style={{ color: getAlgoColor(exp), backgroundColor: `${getAlgoColor(exp)}15` }}
                            >
                              {exp?.algorithm}
                            </span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${r.makespan === bestMakespan ? 'text-success font-bold' : 'text-text-primary'}`}>
                          {r.makespan.toFixed(2)}
                          {r.makespan === bestMakespan && <TrendingDown className="w-3 h-3 inline ml-1 text-success" />}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${r.energy === bestEnergy ? 'text-success font-bold' : 'text-text-primary'}`}>
                          {r.energy.toFixed(2)}
                          {r.energy === bestEnergy && <TrendingDown className="w-3 h-3 inline ml-1 text-success" />}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${r.reliability === bestReliability ? 'text-success font-bold' : 'text-text-primary'}`}>
                          {(r.reliability * 100).toFixed(2)}%
                          {r.reliability === bestReliability && <TrendingUp className="w-3 h-3 inline ml-1 text-success" />}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${r.resourceUtilization === bestUtilization ? 'text-success font-bold' : 'text-text-primary'}`}>
                          {r.resourceUtilization.toFixed(1)}%
                          {r.resourceUtilization === bestUtilization && <TrendingUp className="w-3 h-3 inline ml-1 text-success" />}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-text-secondary text-xs">
                          {(r.executionTime / 1000).toFixed(2)}s
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-secondary mb-4">Performance Radar</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={ct.polarGrid} />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: ct.tick, fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: ct.tick, fontSize: 9 }} />
                    {results.map((r, i) => {
                      const exp = getExperiment(r.experimentId);
                      return (
                        <Radar
                          key={r.experimentId}
                          name={exp?.name ?? r.experimentId.slice(-6)}
                          dataKey={r.experimentId}
                          stroke={COLORS[i % COLORS.length]}
                          fill={COLORS[i % COLORS.length]}
                          fillOpacity={0.1}
                        />
                      );
                    })}
                    <Legend wrapperStyle={{ fontSize: 11, color: ct.legendColor }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar chart */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-secondary mb-4">Metric Comparison</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
                    <XAxis dataKey="metric" tick={{ fill: ct.tick, fontSize: 11 }} />
                    <YAxis tick={{ fill: ct.tick, fontSize: 10 }} />
                    <Tooltip
                      contentStyle={ct.tooltipStyle}
                      labelStyle={{ color: ct.tick }}
                      itemStyle={{ color: ct.tick }}
                    />
                    {results.map((r, i) => {
                      const exp = getExperiment(r.experimentId);
                      return (
                        <Bar
                          key={r.experimentId}
                          dataKey={r.experimentId}
                          name={exp?.name ?? r.experimentId.slice(-6)}
                          fill={COLORS[i % COLORS.length]}
                          radius={[4, 4, 0, 0]}
                        />
                      );
                    })}
                    <Legend wrapperStyle={{ fontSize: 11, color: ct.legendColor }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Convergence comparison */}
          {results.some((r) => r.convergenceData?.length > 0) && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-secondary mb-4">Convergence Comparison</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
                    <XAxis
                      dataKey="iteration"
                      type="number"
                      tick={{ fill: ct.tick, fontSize: 11 }}
                      label={{ value: 'Iteration', position: 'insideBottom', offset: -5, fill: ct.tick, fontSize: 12 }}
                      allowDuplicatedCategory={false}
                    />
                    <YAxis
                      tick={{ fill: ct.tick, fontSize: 11 }}
                      label={{ value: 'Fitness', angle: -90, position: 'insideLeft', fill: ct.tick, fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={ct.tooltipStyle}
                      labelStyle={{ color: ct.tick }}
                      itemStyle={{ color: ct.tick }}
                    />
                    {results.map((r, i) => {
                      if (!r.convergenceData?.length) return null;
                      const exp = getExperiment(r.experimentId);
                      return (
                        <Line
                          key={r.experimentId}
                          data={r.convergenceData}
                          type="monotone"
                          dataKey="fitness"
                          name={exp?.name ?? r.experimentId.slice(-6)}
                          stroke={COLORS[i % COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      );
                    })}
                    <Legend wrapperStyle={{ fontSize: 11, color: ct.legendColor }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {results.length === 0 && selectedIds.length < 2 && (
        <div className="glass rounded-xl p-16 text-center">
          <GitCompare className="w-16 h-16 mx-auto text-text-tertiary mb-4 opacity-40" />
          <p className="text-text-secondary text-lg font-medium mb-2">Select experiments to compare</p>
          <p className="text-text-tertiary text-sm max-w-md mx-auto">
            Choose 2 or more completed experiments to see side-by-side performance metrics, radar charts, and convergence curves.
          </p>
        </div>
      )}
    </div>
  );
}
