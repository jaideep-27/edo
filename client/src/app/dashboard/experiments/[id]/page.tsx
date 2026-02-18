'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExperimentStore } from '@/stores/experimentStore';
import { useExperimentSSE } from '@/hooks/useExperimentSSE';
import type { SSEProgress } from '@/hooks/useExperimentSSE';
import { EXPERIMENT_STATUSES, ALGORITHMS } from '@/lib/constants';
import {
  ArrowLeft,
  Play,
  Trash2,
  Clock,
  Cpu,
  Zap,
  ShieldCheck,
  BarChart3,
  Activity,
  Download,
  RefreshCw,
  Loader2,
  Server,
  TrendingDown,
  Gauge,
  CheckCircle2,
  Circle,
  Timer,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import api from '@/lib/api';

/* ─── Types ──────────────────────────────────────────── */
interface ConvergencePoint {
  iteration: number;
  fitness: number;
  makespan?: number;
  energy?: number;
}
interface ParetoPoint {
  makespan: number;
  energy: number;
  reliability: number;
}
interface ScheduleEntry {
  taskId: number;
  vmId: number;
  startTime?: number;
  endTime?: number;
}
interface ResultData {
  _id: string;
  experimentId: string;
  makespan: number;
  energy: number;
  reliability: number;
  resourceUtilization: number;
  convergenceData: ConvergencePoint[];
  paretoPoints: ParetoPoint[];
  schedule: ScheduleEntry[];
  rawLogs?: string;
  executionTime: number;
  createdAt: string;
}

/* ─── Metric card component ──────────────────────────── */
function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit: string;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-5 flex items-start gap-4">
      <div className="rounded-lg p-2.5" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-text-tertiary uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-heading font-bold text-text-primary mt-1">
          {typeof value === 'number' ? value.toFixed(2) : value}
          <span className="text-sm text-text-secondary ml-1 font-normal">{unit}</span>
        </p>
      </div>
    </div>
  );
}

/* ─── Gantt chart component ──────────────────────────── */
function GanttChart({ schedule, totalTime }: { schedule: ScheduleEntry[]; totalTime: number }) {
  const vmIds = [...new Set(schedule.map((s) => s.vmId))].sort((a, b) => a - b);
  const colors = ['#66FCF1', '#FF2A6D', '#FFC857', '#6C3CE1', '#4ADE80', '#F472B6', '#38BDF8', '#A78BFA'];

  return (
    <div className="space-y-2 overflow-x-auto">
      {vmIds.map((vmId) => {
        const tasks = schedule.filter((s) => s.vmId === vmId);
        return (
          <div key={vmId} className="flex items-center gap-3">
            <span className="text-xs text-text-tertiary w-14 shrink-0 font-mono">VM {vmId}</span>
            <div className="relative h-7 flex-1 bg-canvas/50 rounded overflow-hidden">
              {tasks.map((task) => {
                const start = task.startTime ?? 0;
                const end = task.endTime ?? start + 1;
                const left = totalTime > 0 ? (start / totalTime) * 100 : 0;
                const width = totalTime > 0 ? ((end - start) / totalTime) * 100 : 2;
                return (
                  <div
                    key={task.taskId}
                    className="absolute top-0.5 bottom-0.5 rounded-sm flex items-center justify-center text-[9px] font-mono text-canvas truncate"
                    style={{
                      left: `${left}%`,
                      width: `${Math.max(width, 0.5)}%`,
                      backgroundColor: colors[task.vmId % colors.length],
                    }}
                    title={`Task ${task.taskId}: ${start.toFixed(1)}–${end.toFixed(1)}`}
                  >
                    {width > 4 ? `T${task.taskId}` : ''}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-3">
        <span className="w-14 shrink-0" />
        <div className="flex-1 flex justify-between text-[10px] text-text-tertiary font-mono">
          <span>0</span>
          <span>{(totalTime / 4).toFixed(0)}</span>
          <span>{(totalTime / 2).toFixed(0)}</span>
          <span>{((totalTime * 3) / 4).toFixed(0)}</span>
          <span>{totalTime.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Custom tooltip ─────────────────────────────────── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string | number }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs border border-border-glass">
      <p className="text-text-secondary mb-1">Iteration {label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-text-primary font-mono">{p.name}: {p.value.toFixed(4)}</p>
      ))}
    </div>
  );
}

/* ─── Running-state visualization panel (SSE-powered) ── */
function RunningStatePanel({
  status,
  algorithm,
  algoInfo,
  taskCount,
  vmCount,
  maxIterations,
  startedAt,
  progress,
}: {
  status: string;
  algorithm: string;
  algoInfo?: { id: string; name: string; color: string };
  taskCount: number;
  vmCount: number;
  maxIterations: number;
  startedAt?: string;
  progress: SSEProgress;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const startMs = startedAt ? new Date(startedAt).getTime() : now;
  const elapsed = Math.max(0, Math.floor((now - startMs) / 1000));
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const algoColor = algoInfo?.color ?? '#66FCF1';
  const phaseName = progress.phase;
  const percent = progress.percent;

  // Pipeline phases with real statuses from SSE
  const phases = [
    { id: 'initializing', label: 'Initializing', icon: '⚙️' },
    { id: 'optimizing', label: 'Optimizing', icon: '🧬' },
    { id: 'simulating', label: 'Simulating', icon: '☁️' },
    { id: 'saving', label: 'Saving', icon: '💾' },
  ];

  const phaseOrder = ['initializing', 'optimizing', 'simulating', 'saving', 'completed'];
  const currentPhaseIdx = phaseOrder.indexOf(phaseName);

  const algoLabel =
    algorithm === 'EDO' ? 'Enterprise Swarm Evolving' :
    algorithm === 'PSO' ? 'Particle Swarm Converging' :
    algorithm === 'ACO' ? 'Ant Colony Exploring' :
    algorithm === 'GA' ? 'Genetic Crossover & Mutation' :
    algorithm === 'WOA' ? 'Whale Spiral Hunting' :
    algorithm === 'ROUND_ROBIN' ? 'Round Robin Scheduling' :
    algorithm === 'MIN_MIN' ? 'Min-Min Mapping' :
    'Max-Min Mapping';

  const hasLiveData = progress.convergenceHistory.length > 0;
  const latestFitness = progress.fitness;
  const latestMakespan = progress.makespan;
  const latestEnergy = progress.energy;

  // Improvement tracking (compare first vs latest convergence point)
  const firstPoint = progress.convergenceHistory[0];
  const fitnessImprovement = firstPoint && latestFitness > 0
    ? ((firstPoint.fitness - latestFitness) / firstPoint.fitness * 100)
    : 0;

  return (
    <div className="glass rounded-xl border border-neon-cyan/20 overflow-hidden">
      {/* ── Header with pulsing gradient ── */}
      <div
        className="relative px-6 py-4 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${algoColor}15 0%, transparent 60%)` }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(90deg, transparent, ${algoColor}20, transparent)`,
            animation: 'shimmer 2s infinite',
          }}
        />
        <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: `${algoColor}20`, color: algoColor }}
              >
                {status === 'queued' ? '⏳' : '🚀'}
              </div>
              <div
                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: algoColor }}
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {status === 'queued' ? 'Queued' : algoLabel}
              </h3>
              <p className="text-xs text-text-tertiary mt-0.5">
                {taskCount} tasks → {vmCount} VMs · {maxIterations} iterations
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-6">
            {/* Iteration counter */}
            <div>
              <p className="font-mono text-xl font-bold text-text-primary">
                {progress.iteration + (hasLiveData ? 1 : 0)}
                <span className="text-text-tertiary text-sm font-normal">/{maxIterations}</span>
              </p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Iteration</p>
            </div>
            {/* Elapsed timer */}
            <div>
              <p className="font-mono text-xl font-bold" style={{ color: algoColor }}>
                {timeStr}
              </p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Elapsed</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="px-6 py-3 border-t border-border-glass/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider">
            Progress
          </span>
          <span className="text-xs font-mono font-bold" style={{ color: algoColor }}>
            {percent}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-panel-elevated overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${percent}%`,
              background: `linear-gradient(90deg, ${algoColor}, ${algoColor}CC)`,
              boxShadow: `0 0 12px ${algoColor}40`,
            }}
          />
        </div>
      </div>

      {/* ── Pipeline phases ── */}
      <div className="px-6 py-3 border-t border-border-glass/40">
        <div className="flex items-center gap-2">
          {phases.map((phase, i) => {
            const isActive = phaseOrder[i] === phaseName;
            const isComplete = i < currentPhaseIdx;
            return (
              <React.Fragment key={phase.id}>
                <div className="flex items-center gap-1.5 flex-1">
                  <div className="flex items-center gap-1.5">
                    {isComplete ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    ) : isActive ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: algoColor }} />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-text-tertiary/40" />
                    )}
                    <span className={`text-[11px] font-medium ${
                      isActive ? 'text-text-primary' : isComplete ? 'text-green-400' : 'text-text-tertiary/60'
                    }`}>
                      {phase.label}
                    </span>
                  </div>
                </div>
                {i < phases.length - 1 && (
                  <div className={`w-6 h-px ${isComplete ? 'bg-green-400/50' : 'bg-border-glass'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Live Metrics Dashboard ── */}
      {hasLiveData && (
        <div className="px-6 py-4 border-t border-border-glass/40">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Fitness */}
            <div className="rounded-lg p-3" style={{ backgroundColor: `${algoColor}08`, border: `1px solid ${algoColor}15` }}>
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3.5 h-3.5" style={{ color: algoColor }} />
                <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Fitness</span>
              </div>
              <p className="font-mono text-lg font-bold text-text-primary">{latestFitness.toFixed(2)}</p>
              {fitnessImprovement > 0 && (
                <p className="text-[10px] text-green-400 font-mono mt-0.5">
                  ↓ {fitnessImprovement.toFixed(1)}% improved
                </p>
              )}
            </div>
            {/* Makespan */}
            <div className="rounded-lg p-3 bg-[#FF2A6D08] border border-[#FF2A6D15]">
              <div className="flex items-center gap-1.5 mb-1">
                <Timer className="w-3.5 h-3.5 text-[#FF2A6D]" />
                <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Makespan</span>
              </div>
              <p className="font-mono text-lg font-bold text-text-primary">{latestMakespan.toFixed(1)}</p>
              <p className="text-[10px] text-text-tertiary font-mono mt-0.5">ms</p>
            </div>
            {/* Energy */}
            <div className="rounded-lg p-3 bg-[#FFC85708] border border-[#FFC85715]">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-[#FFC857]" />
                <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Energy</span>
              </div>
              <p className="font-mono text-lg font-bold text-text-primary">{latestEnergy.toFixed(1)}</p>
              <p className="text-[10px] text-text-tertiary font-mono mt-0.5">J</p>
            </div>
            {/* Utilization */}
            <div className="rounded-lg p-3 bg-[#6C3CE108] border border-[#6C3CE115]">
              <div className="flex items-center gap-1.5 mb-1">
                <Gauge className="w-3.5 h-3.5 text-[#6C3CE1]" />
                <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Utilization</span>
              </div>
              <p className="font-mono text-lg font-bold text-text-primary">
                {(progress.utilization * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-text-tertiary font-mono mt-0.5">avg</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Live Convergence Chart ── */}
      {progress.convergenceHistory.length > 1 && (
        <div className="px-6 pb-5 pt-2 border-t border-border-glass/40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Live Convergence
            </h4>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-text-tertiary">Streaming</span>
            </div>
          </div>
          <div className="h-48 rounded-lg overflow-hidden" style={{ backgroundColor: `${algoColor}04` }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progress.convergenceHistory} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="liveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={algoColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={algoColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F283340" />
                <XAxis
                  dataKey="iteration"
                  tick={{ fill: '#A0A0B0', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#1F283360' }}
                />
                <YAxis
                  tick={{ fill: '#A0A0B0', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#1F283360' }}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2833',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(value: number | undefined) => [value != null ? value.toFixed(4) : '—', 'Fitness']}
                  labelFormatter={(label) => `Iteration ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="fitness"
                  stroke={algoColor}
                  strokeWidth={2}
                  fill="url(#liveGradient)"
                  dot={false}
                  activeDot={{ r: 3, fill: algoColor }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Secondary live chart: Makespan & Energy */}
          {progress.convergenceHistory.length > 2 && (
            <div className="mt-3 h-32 rounded-lg overflow-hidden" style={{ backgroundColor: `#FF2A6D04` }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress.convergenceHistory} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F283340" />
                  <XAxis dataKey="iteration" tick={{ fill: '#A0A0B0', fontSize: 9 }} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: '#A0A0B0', fontSize: 9 }} tickLine={false} width={45} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#A0A0B0', fontSize: 9 }} tickLine={false} width={45} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2833',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 10,
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="makespan"
                    name="Makespan (ms)"
                    stroke="#FF2A6D"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="energy"
                    name="Energy (J)"
                    stroke="#FFC857"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Waiting state (no data yet) ── */}
      {!hasLiveData && (
        <div className="px-6 pb-5 pt-2 border-t border-border-glass/40">
          <div
            className="relative h-24 rounded-lg overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: `${algoColor}08`, border: `1px solid ${algoColor}15` }}
          >
            {/* Animated particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 3 + (i % 3) * 2,
                  height: 3 + (i % 3) * 2,
                  backgroundColor: algoColor,
                  opacity: 0.2 + (i % 4) * 0.1,
                  left: `${10 + (i * 10) % 80}%`,
                  top: `${25 + Math.sin(i * 1.5) * 25}%`,
                  animation: `p-float-${i % 3} ${2 + (i % 2)}s ease-in-out infinite`,
                  animationDelay: `${(i * 0.2) % 1.5}s`,
                }}
              />
            ))}
            <style>{`
              @keyframes p-float-0 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10px,-6px); } }
              @keyframes p-float-1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-6px,8px); } }
              @keyframes p-float-2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(8px,4px); } }
            `}</style>
            <div className="text-center z-10">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1.5" style={{ color: algoColor }} />
              <p className="text-xs font-medium" style={{ color: algoColor }}>
                {status === 'queued' ? 'Waiting in queue…' : 'Connecting to optimizer…'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Status footer ── */}
      <div className="px-6 py-3 border-t border-border-glass/40">
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: progress.connected ? '#4ADE80' : '#FFC857' }}
            />
            <span className="text-text-tertiary">
              {progress.connected ? 'Live' : 'Connecting'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-text-tertiary" />
            <span className="font-mono font-medium" style={{ color: algoColor }}>{algoInfo?.name ?? algorithm}</span>
          </div>
          {hasLiveData && (
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-text-tertiary" />
              <span className="text-text-secondary font-mono text-[10px]">
                {progress.convergenceHistory.length} data points
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────── */
export default function ExperimentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    currentExperiment: experiment,
    fetchExperiment,
    pollExperiment,
    runExperiment,
    deleteExperiment,
    clearCurrent,
  } = useExperimentStore();

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'convergence' | 'schedule' | 'pareto'>('overview');

  // SSE real-time progress — must be called unconditionally before any returns
  const sseProgress = useExperimentSSE(experiment?._id, experiment?.status);

  const polling = experiment ? ['running', 'queued'].includes(experiment.status) : false;

  const loadResult = useCallback(async () => {
    try {
      const { data: res } = await api.get(`/experiments/${id}/result`);
      setResult(res.data?.result ?? res.data);
    } catch {
      // No result yet
      setResult(null);
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchExperiment(id);
      await loadResult();
      setLoading(false);
    };
    load();
    return () => clearCurrent();
  }, [id, fetchExperiment, loadResult, clearCurrent]);

  // Poll while running — uses silent pollExperiment (no isLoading flicker)
  const pollingRef = React.useRef(false);
  const experimentStatus = experiment?.status;
  useEffect(() => {
    // Derive polling inside effect to avoid stale closure
    const shouldPoll = experimentStatus === 'running' || experimentStatus === 'queued';
    pollingRef.current = shouldPoll;
    if (!shouldPoll) return;

    const interval = setInterval(async () => {
      if (!pollingRef.current) return;
      const updated = await pollExperiment(id);
      if (updated && (updated.status === 'completed' || updated.status === 'failed')) {
        pollingRef.current = false;
        if (updated.status === 'completed') {
          await loadResult();
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [experimentStatus, id, pollExperiment, loadResult]);

  // Load result when status becomes completed (also catches first render)
  useEffect(() => {
    if (experiment?.status === 'completed' && !result) {
      const t = setTimeout(() => loadResult(), 0);
      return () => clearTimeout(t);
    }
  }, [experiment?.status, result, loadResult]);

  const handleRun = async () => {
    await runExperiment(id);
  };
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this experiment?')) {
      await deleteExperiment(id);
      router.push('/dashboard/experiments');
    }
  };
  const handleExport = async () => {
    try {
      const { data } = await api.get(`/experiments/${id}/result/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `result-${id}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Experiment not found.</p>
        <button onClick={() => router.push('/dashboard/experiments')} className="text-neon-cyan mt-4 underline text-sm">
          Back to experiments
        </button>
      </div>
    );
  }

  const statusInfo = EXPERIMENT_STATUSES[experiment.status as keyof typeof EXPERIMENT_STATUSES];
  const algoInfo = ALGORITHMS.find((a) => a.id === experiment.algorithm);
  const isRunning = ['running', 'queued'].includes(experiment.status);
  const canRun = experiment.status === 'draft' || experiment.status === 'failed';

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'convergence' as const, label: 'Convergence', icon: Activity },
    { id: 'schedule' as const, label: 'Schedule', icon: Server },
    { id: 'pareto' as const, label: 'Pareto Front', icon: Cpu },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push('/dashboard/experiments')}
            className="mt-1 p-2 rounded-lg hover:bg-panel-elevated transition-colors text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">{experiment.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border"
                style={{
                  color: statusInfo?.color ?? '#A0A0B0',
                  borderColor: `${statusInfo?.color ?? '#A0A0B0'}33`,
                  backgroundColor: `${statusInfo?.color ?? '#A0A0B0'}15`,
                }}
              >
                {isRunning && <RefreshCw className="w-3 h-3 animate-spin" />}
                {statusInfo?.label ?? experiment.status}
              </span>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{ color: algoInfo?.color ?? '#66FCF1', backgroundColor: `${algoInfo?.color ?? '#66FCF1'}15` }}
              >
                {experiment.algorithm}
              </span>
              <span className="text-xs text-text-tertiary">
                {new Date(experiment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canRun && (
            <button
              onClick={handleRun}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan text-canvas text-sm font-medium hover:bg-neon-cyan/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Run
            </button>
          )}
          {result && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-text-secondary text-sm hover:text-text-primary transition-colors"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-error/60 hover:text-error hover:bg-error/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Config summary */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Configuration</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-text-tertiary text-xs">Tasks</p>
            <p className="text-text-primary font-mono">{experiment.workloadConfig?.taskCount ?? '—'}</p>
          </div>
          <div>
            <p className="text-text-tertiary text-xs">VMs</p>
            <p className="text-text-primary font-mono">{experiment.vmConfig?.vmCount ?? '—'}</p>
          </div>
          <div>
            <p className="text-text-tertiary text-xs">Population</p>
            <p className="text-text-primary font-mono">{experiment.hyperparameters?.populationSize ?? '—'}</p>
          </div>
          <div>
            <p className="text-text-tertiary text-xs">Iterations</p>
            <p className="text-text-primary font-mono">{experiment.hyperparameters?.maxIterations ?? '—'}</p>
          </div>
        </div>
        {experiment.hyperparameters?.weights && (
          <div className="mt-3 pt-3 border-t border-border-glass">
            <p className="text-text-tertiary text-xs mb-2">Objective Weights</p>
            <div className="flex gap-4 text-xs">
              <span className="text-text-primary font-mono">
                Makespan: <span className="text-neon-cyan">{experiment.hyperparameters.weights.makespan}</span>
              </span>
              <span className="text-text-primary font-mono">
                Energy: <span className="text-neon-magenta">{experiment.hyperparameters.weights.energy}</span>
              </span>
              <span className="text-text-primary font-mono">
                Reliability: <span className="text-neon-amber">{experiment.hyperparameters.weights.reliability}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Running-state Visualization ── */}
      {polling && (
        <RunningStatePanel
          status={experiment.status}
          algorithm={experiment.algorithm}
          algoInfo={algoInfo}
          taskCount={experiment.workloadConfig?.taskCount ?? 0}
          vmCount={experiment.vmConfig?.vmCount ?? 0}
          maxIterations={experiment.hyperparameters?.maxIterations ?? 100}
          startedAt={experiment.startedAt}
          progress={sseProgress}
        />
      )}

      {/* No results yet */}
      {!result && !isRunning && experiment.status !== 'failed' && (
        <div className="glass rounded-xl p-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-text-tertiary mb-4" />
          <p className="text-text-secondary">No results yet. Run the experiment to see results.</p>
        </div>
      )}

      {/* Failed */}
      {experiment.status === 'failed' && !result && (
        <div className="glass rounded-xl p-8 text-center border border-error/20">
          <p className="text-error font-medium mb-2">Experiment Failed</p>
          <p className="text-text-tertiary text-sm">Check the optimizer logs or re-run with different parameters.</p>
        </div>
      )}

      {/* Results section */}
      {result && (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={Clock} label="Makespan" value={result.makespan} unit="ms" color="#66FCF1" />
            <MetricCard icon={Zap} label="Energy" value={result.energy} unit="J" color="#FF2A6D" />
            <MetricCard icon={ShieldCheck} label="Reliability" value={result.reliability} unit="" color="#FFC857" />
            <MetricCard icon={Cpu} label="Utilization" value={result.resourceUtilization} unit="%" color="#6C3CE1" />
          </div>

          {/* Execution info */}
          <div className="flex items-center gap-6 text-xs text-text-tertiary">
            <span>Execution time: <span className="text-text-secondary font-mono">{(result.executionTime / 1000).toFixed(2)}s</span></span>
            <span>Result ID: <span className="text-text-secondary font-mono">{result._id.slice(-8)}</span></span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 glass rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neon-cyan/10 text-neon-cyan'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="glass rounded-xl p-6">
            {/* Overview — Radar chart */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-4">Performance Radar</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={[
                        { metric: 'Makespan', value: Math.min(100, (1 / (result.makespan / 100)) * 100), fullMark: 100 },
                        { metric: 'Energy Eff.', value: Math.min(100, (1 / (result.energy / 500)) * 100), fullMark: 100 },
                        { metric: 'Reliability', value: result.reliability * 100, fullMark: 100 },
                        { metric: 'Utilization', value: result.resourceUtilization, fullMark: 100 },
                      ]}
                    >
                      <PolarGrid stroke="#1F2833" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#A0A0B0', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#555', fontSize: 10 }} />
                      <Radar name="Score" dataKey="value" stroke="#66FCF1" fill="#66FCF1" fillOpacity={0.2} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#A0A0B0' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Convergence curve */}
            {activeTab === 'convergence' && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-4">Convergence Curves</h3>
                {result.convergenceData?.length > 0 ? (
                  <div className="space-y-6">
                    {/* Fitness convergence */}
                    <div>
                      <p className="text-xs text-text-tertiary mb-2 uppercase tracking-wider">Fitness (Weighted Objective)</p>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={result.convergenceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2833" />
                            <XAxis dataKey="iteration" tick={{ fill: '#A0A0B0', fontSize: 11 }} label={{ value: 'Iteration', position: 'insideBottom', offset: -5, fill: '#A0A0B0', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#A0A0B0', fontSize: 11 }} label={{ value: 'Fitness', angle: -90, position: 'insideLeft', fill: '#A0A0B0', fontSize: 12 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Line type="monotone" dataKey="fitness" stroke="#66FCF1" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#66FCF1' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    {/* Makespan & Energy convergence */}
                    {result.convergenceData[0]?.makespan != null && (
                      <div>
                        <p className="text-xs text-text-tertiary mb-2 uppercase tracking-wider">Makespan &amp; Energy per Iteration</p>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.convergenceData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1F2833" />
                              <XAxis dataKey="iteration" tick={{ fill: '#A0A0B0', fontSize: 11 }} />
                              <YAxis yAxisId="left" tick={{ fill: '#A0A0B0', fontSize: 11 }} label={{ value: 'Makespan (ms)', angle: -90, position: 'insideLeft', fill: '#FF2A6D', fontSize: 11 }} />
                              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#A0A0B0', fontSize: 11 }} label={{ value: 'Energy (J)', angle: 90, position: 'insideRight', fill: '#FFC857', fontSize: 11 }} />
                              <Tooltip content={<ChartTooltip />} />
                              <Legend wrapperStyle={{ fontSize: 12, color: '#A0A0B0' }} />
                              <Line yAxisId="left" type="monotone" dataKey="makespan" name="Makespan" stroke="#FF2A6D" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FF2A6D' }} />
                              <Line yAxisId="right" type="monotone" dataKey="energy" name="Energy" stroke="#FFC857" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FFC857' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-text-tertiary text-sm text-center py-12">No convergence data available.</p>
                )}
              </div>
            )}

            {/* Schedule / Gantt */}
            {activeTab === 'schedule' && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-4">Task Schedule (Gantt)</h3>
                {result.schedule?.length > 0 ? (
                  <>
                    <GanttChart schedule={result.schedule} totalTime={result.makespan} />
                    {/* Task distribution bar chart */}
                    <div className="mt-8">
                      <h4 className="text-xs font-semibold text-text-tertiary mb-3 uppercase tracking-wider">
                        Tasks per VM
                      </h4>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={(() => {
                              const vmMap: Record<number, number> = {};
                              result.schedule.forEach((s) => {
                                vmMap[s.vmId] = (vmMap[s.vmId] || 0) + 1;
                              });
                              return Object.entries(vmMap)
                                .sort(([a], [b]) => Number(a) - Number(b))
                                .map(([vm, count]) => ({ vm: `VM ${vm}`, count }));
                            })()}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#1F2833" />
                            <XAxis dataKey="vm" tick={{ fill: '#A0A0B0', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#A0A0B0', fontSize: 10 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1F2833',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                fontSize: 12,
                              }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {(() => {
                                const colors = ['#66FCF1', '#FF2A6D', '#FFC857', '#6C3CE1', '#4ADE80', '#F472B6', '#38BDF8', '#A78BFA'];
                                const vmMap: Record<number, number> = {};
                                result.schedule.forEach((s) => {
                                  vmMap[s.vmId] = (vmMap[s.vmId] || 0) + 1;
                                });
                                return Object.keys(vmMap)
                                  .sort((a, b) => Number(a) - Number(b))
                                  .map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />);
                              })()}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-text-tertiary text-sm text-center py-12">No schedule data available.</p>
                )}
              </div>
            )}

            {/* Pareto front */}
            {activeTab === 'pareto' && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-4">Pareto Front (Makespan vs Energy)</h3>
                {result.paretoPoints?.length > 0 ? (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2833" />
                        <XAxis
                          type="number"
                          dataKey="makespan"
                          name="Makespan"
                          tick={{ fill: '#A0A0B0', fontSize: 11 }}
                          label={{ value: 'Makespan (ms)', position: 'insideBottom', offset: -5, fill: '#A0A0B0', fontSize: 12 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="energy"
                          name="Energy"
                          tick={{ fill: '#A0A0B0', fontSize: 11 }}
                          label={{ value: 'Energy (J)', angle: -90, position: 'insideLeft', fill: '#A0A0B0', fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          contentStyle={{
                            backgroundColor: '#1F2833',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          formatter={(value: number | undefined) => value != null ? value.toFixed(3) : '—'}
                        />
                        <Scatter name="Pareto Points" data={result.paretoPoints} fill="#FF2A6D">
                          {result.paretoPoints.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? '#66FCF1' : '#FF2A6D'} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-text-tertiary text-sm text-center py-12">No Pareto data available.</p>
                )}
              </div>
            )}
          </div>

          {/* Raw logs */}
          {result.rawLogs && (
            <details className="glass rounded-xl">
              <summary className="cursor-pointer p-4 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
                Raw Logs
              </summary>
              <pre className="p-4 pt-0 text-xs font-mono text-text-tertiary whitespace-pre-wrap max-h-64 overflow-y-auto">
                {result.rawLogs}
              </pre>
            </details>
          )}
        </>
      )}
    </div>
  );
}
