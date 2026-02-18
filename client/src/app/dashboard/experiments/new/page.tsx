'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  Server,
  Zap,
  Settings2,
  Play,
  CheckCircle2,
  Upload,
  Sparkles,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { Button, Input, Card, CardContent, Badge } from '@/components/ui';
import { useExperimentStore } from '@/stores/experimentStore';
import { ALGORITHMS, DEFAULT_HYPERPARAMETERS } from '@/lib/constants';
import type { AlgorithmId } from '@/lib/constants';
import api from '@/lib/api';

const STEPS = [
  { id: 0, title: 'Basics', icon: Settings2 },
  { id: 1, title: 'Workload', icon: Cpu },
  { id: 2, title: 'VMs', icon: Server },
  { id: 3, title: 'Algorithm', icon: Zap },
  { id: 4, title: 'Review', icon: CheckCircle2 },
];

interface TaskDef { size: number; cpu: number; memory: number }
interface VMDef { mips: number; ram: number; bw: number; storage: number }
interface PresetMeta { id: string; name: string; description: string; taskCount?: number; vmCount?: number }
interface Suggestion {
  algorithm: string;
  populationSize: number;
  maxIterations: number;
  weights: { makespan: number; energy: number; reliability: number };
  reasoning: string[];
}

export default function NewExperimentPage() {
  const router = useRouter();
  const { createExperiment, runExperiment, isLoading } = useExperimentStore();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [taskCount, setTaskCount] = useState<number>(20);
  const [vmCount, setVmCount] = useState<number>(5);
  const [tasks, setTasks] = useState<TaskDef[]>([]);
  const [vms, setVms] = useState<VMDef[]>([]);
  const [algorithm, setAlgorithm] = useState<AlgorithmId>('EDO');
  const [populationSize, setPopulationSize] = useState<number>(DEFAULT_HYPERPARAMETERS.populationSize);
  const [maxIterations, setMaxIterations] = useState<number>(DEFAULT_HYPERPARAMETERS.maxIterations);
  const [wMakespan, setWMakespan] = useState<number>(DEFAULT_HYPERPARAMETERS.weights.makespan);
  const [wEnergy, setWEnergy] = useState<number>(DEFAULT_HYPERPARAMETERS.weights.energy);
  const [wReliability, setWReliability] = useState<number>(DEFAULT_HYPERPARAMETERS.weights.reliability);
  const [autoRun, setAutoRun] = useState(true);

  // Preset / upload state
  const [presets, setPresets] = useState<{ workloads: PresetMeta[]; vms: PresetMeta[] } | null>(null);
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const isMetaheuristic = !['ROUND_ROBIN', 'MIN_MIN', 'MAX_MIN'].includes(algorithm);

  const loadPresets = useCallback(async () => {
    if (presets) return;
    setPresetsLoading(true);
    try {
      const { data: res } = await api.get('/presets');
      setPresets(res.data);
    } catch { /* ignore */ } finally { setPresetsLoading(false); }
  }, [presets]);

  const applyWorkloadPreset = async (id: string) => {
    try {
      const { data: res } = await api.get(`/presets/workload/${id}`);
      setTaskCount(res.data.taskCount);
      setTasks(res.data.tasks);
      setUploadMsg(`Loaded preset: ${res.data.name} (${res.data.taskCount} tasks)`);
    } catch { setUploadMsg('Failed to load preset'); }
  };

  const applyVmPreset = async (id: string) => {
    try {
      const { data: res } = await api.get(`/presets/vm/${id}`);
      setVmCount(res.data.vmCount);
      setVms(res.data.vms);
      setUploadMsg(`Loaded preset: ${res.data.name} (${res.data.vmCount} VMs)`);
    } catch { setUploadMsg('Failed to load preset'); }
  };

  const handleFileUpload = async (type: 'workload' | 'vms', file: File) => {
    const form = new FormData();
    form.append('file', file);
    try {
      const { data: res } = await api.post(`/upload/${type}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (type === 'workload') {
        setTaskCount(res.data.taskCount);
        setTasks(res.data.tasks);
        setUploadMsg(`Uploaded ${res.data.taskCount} tasks from ${file.name}`);
      } else {
        setVmCount(res.data.vmCount);
        setVms(res.data.vms);
        setUploadMsg(`Uploaded ${res.data.vmCount} VMs from ${file.name}`);
      }
    } catch { setUploadMsg('Upload failed — check file format'); }
  };

  const handleSuggest = async () => {
    setSuggestLoading(true);
    setSuggestion(null);
    try {
      const { data: res } = await api.post('/suggest', {
        workloadConfig: { taskCount, tasks },
        vmConfig: { vmCount, vms },
      });
      setSuggestion(res.data.suggestion);
    } catch { setError('AI suggestion failed'); }
    finally { setSuggestLoading(false); }
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    setAlgorithm(suggestion.algorithm as AlgorithmId);
    if (suggestion.populationSize) setPopulationSize(suggestion.populationSize);
    if (suggestion.maxIterations) setMaxIterations(suggestion.maxIterations);
    setWMakespan(suggestion.weights.makespan);
    setWEnergy(suggestion.weights.energy);
    setWReliability(suggestion.weights.reliability);
    setSuggestion(null);
  };

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return taskCount >= 1 && taskCount <= 10000;
    if (step === 2) return vmCount >= 1 && vmCount <= 1000;
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const payload = {
        name: name.trim(),
        workloadConfig: { taskCount, tasks },
        vmConfig: { vmCount, vms },
        algorithm,
        hyperparameters: {
          populationSize, maxIterations,
          seed: DEFAULT_HYPERPARAMETERS.seed,
          weights: { makespan: wMakespan, energy: wEnergy, reliability: wReliability },
        },
      };
      const experiment = await createExperiment(payload);
      if (autoRun && experiment?._id) {
        await runExperiment(experiment._id);
        // Navigate to detail page so user sees live execution visualization
        router.push(`/dashboard/experiments/${experiment._id}`);
      } else {
        router.push('/dashboard/experiments');
      }
    } catch { setError('Failed to create experiment. Please try again.'); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/experiments">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">New Experiment</h1>
          <p className="text-text-secondary text-sm mt-0.5">Step {step + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <button onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full ${
                i === step ? 'glass-strong text-neon-cyan'
                : i < step ? 'glass text-text-secondary cursor-pointer hover:text-text-primary'
                : 'text-text-tertiary'
              }`}>
              <s.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{s.title}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-4 shrink-0 mx-1 ${i < step ? 'bg-neon-cyan/30' : 'bg-border-glass'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-sm text-error mb-6">{error}</div>
      )}
      {uploadMsg && (
        <div className="bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg px-4 py-3 text-sm text-neon-cyan mb-6 flex items-center justify-between">
          <span>{uploadMsg}</span>
          <button onClick={() => setUploadMsg('')} className="text-neon-cyan/60 hover:text-neon-cyan ml-4">✕</button>
        </div>
      )}

      <Card className="glass-strong mb-6">
        <CardContent className="p-6">
          {/* Step 0 — Basics */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-lg font-semibold mb-1">Experiment Details</h2>
                <p className="text-sm text-text-secondary">Give your experiment a descriptive name.</p>
              </div>
              <Input label="Experiment Name" placeholder="e.g. EDO vs PSO — 50 tasks, 10 VMs"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          {/* Step 1 — Workload */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-lg font-semibold mb-1">Workload Configuration</h2>
                <p className="text-sm text-text-secondary">Set task count, load a preset, or upload a CSV/JSON file.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={loadPresets}
                  className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-neon-cyan transition-colors">
                  <Layers className="h-3.5 w-3.5" />{presetsLoading ? 'Loading…' : 'Presets'}
                </button>
                <label className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-neon-cyan transition-colors cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />Upload CSV/JSON
                  <input type="file" accept=".csv,.json" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload('workload', f); e.target.value = ''; }} />
                </label>
              </div>
              {presets && (
                <div className="grid grid-cols-2 gap-2">
                  {presets.workloads.map((p) => (
                    <button key={p.id} onClick={() => applyWorkloadPreset(p.id)}
                      className="glass rounded-xl p-3 text-left hover:border-neon-cyan/20 transition-all">
                      <span className="block text-xs font-medium text-text-primary">{p.name}</span>
                      <span className="block text-[10px] text-text-tertiary mt-0.5">{p.description}</span>
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Number of Tasks: <span className="text-neon-cyan font-mono">{taskCount}</span>
                  {tasks.length > 0 && <span className="text-text-tertiary ml-2">({tasks.length} custom tasks loaded)</span>}
                </label>
                <input type="range" min={1} max={500} value={Math.min(taskCount, 500)}
                  onChange={(e) => { setTaskCount(Number(e.target.value)); setTasks([]); }}
                  className="w-full accent-neon-cyan" />
                <div className="flex justify-between text-xs text-text-tertiary mt-1"><span>1</span><span>500</span></div>
              </div>
              <Input label="Exact Task Count" type="number" min={1} max={10000} value={taskCount}
                onChange={(e) => { setTaskCount(Number(e.target.value)); setTasks([]); }} />
              {tasks.length > 0 && (
                <div>
                  <p className="text-xs text-text-tertiary mb-2">Showing first {Math.min(tasks.length, 5)} of {tasks.length} tasks</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="text-text-tertiary border-b border-border-glass">
                        <th className="py-1 px-2 text-left">#</th><th className="py-1 px-2 text-right">Size</th>
                        <th className="py-1 px-2 text-right">CPU</th><th className="py-1 px-2 text-right">Memory</th>
                      </tr></thead>
                      <tbody>{tasks.slice(0, 5).map((t, i) => (
                        <tr key={i} className="border-b border-border-glass/50">
                          <td className="py-1 px-2 text-text-tertiary">{i}</td>
                          <td className="py-1 px-2 text-right font-mono text-text-secondary">{t.size}</td>
                          <td className="py-1 px-2 text-right font-mono text-text-secondary">{t.cpu}</td>
                          <td className="py-1 px-2 text-right font-mono text-text-secondary">{t.memory}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — VMs */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-lg font-semibold mb-1">VM Configuration</h2>
                <p className="text-sm text-text-secondary">Set VM count, load a preset, or upload a CSV/JSON file.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={loadPresets}
                  className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-neon-cyan transition-colors">
                  <Layers className="h-3.5 w-3.5" />{presetsLoading ? 'Loading…' : 'Presets'}
                </button>
                <label className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-neon-cyan transition-colors cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />Upload CSV/JSON
                  <input type="file" accept=".csv,.json" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload('vms', f); e.target.value = ''; }} />
                </label>
              </div>
              {presets && (
                <div className="grid grid-cols-2 gap-2">
                  {presets.vms.map((p) => (
                    <button key={p.id} onClick={() => applyVmPreset(p.id)}
                      className="glass rounded-xl p-3 text-left hover:border-neon-cyan/20 transition-all">
                      <span className="block text-xs font-medium text-text-primary">{p.name}</span>
                      <span className="block text-[10px] text-text-tertiary mt-0.5">{p.description}</span>
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Number of VMs: <span className="text-neon-cyan font-mono">{vmCount}</span>
                  {vms.length > 0 && <span className="text-text-tertiary ml-2">({vms.length} custom VMs loaded)</span>}
                </label>
                <input type="range" min={1} max={50} value={Math.min(vmCount, 50)}
                  onChange={(e) => { setVmCount(Number(e.target.value)); setVms([]); }}
                  className="w-full accent-neon-cyan" />
                <div className="flex justify-between text-xs text-text-tertiary mt-1"><span>1</span><span>50</span></div>
              </div>
              <Input label="Exact VM Count" type="number" min={1} max={1000} value={vmCount}
                onChange={(e) => { setVmCount(Number(e.target.value)); setVms([]); }} />
              {vms.length > 0 && (
                <div>
                  <p className="text-xs text-text-tertiary mb-2">Showing first {Math.min(vms.length, 5)} of {vms.length} VMs</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="text-text-tertiary border-b border-border-glass">
                        <th className="py-1 px-2 text-left">#</th><th className="py-1 px-2 text-right">MIPS</th>
                        <th className="py-1 px-2 text-right">RAM</th><th className="py-1 px-2 text-right">BW</th>
                        <th className="py-1 px-2 text-right">Storage</th>
                      </tr></thead>
                      <tbody>{vms.slice(0, 5).map((v, i) => (
                        <tr key={i} className="border-b border-border-glass/50">
                          <td className="py-1 px-2 text-text-tertiary">{i}</td>
                          <td className="py-1 px-2 text-right font-mono text-text-secondary">{v.mips}</td>
                          <td className="py-1 px-2 text-right font-mono text-text-secondary">{v.ram}</td>
                          <td className="py-1 px-2 text-right font-mono text-text-secondary">{v.bw}</td>
                          <td className="py-1 px-2 text-right font-mono text-text-secondary">{v.storage}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Algorithm */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-lg font-semibold mb-1">Algorithm &amp; Hyperparameters</h2>
                  <p className="text-sm text-text-secondary">Choose an algorithm or let AI suggest the best fit.</p>
                </div>
                <button onClick={handleSuggest} disabled={suggestLoading}
                  className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neon-amber hover:text-neon-cyan transition-colors shrink-0">
                  <Sparkles className="h-3.5 w-3.5" />{suggestLoading ? 'Analysing…' : 'AI Suggest'}
                </button>
              </div>

              {suggestion && (
                <div className="glass-strong rounded-xl p-4 border border-neon-amber/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-neon-amber" />
                      <span className="text-sm font-medium text-neon-amber">AI Recommendation</span>
                    </div>
                    <Button size="sm" onClick={applySuggestion}>Apply</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="glass-subtle rounded-lg p-2 text-center">
                      <span className="block text-text-tertiary">Algorithm</span>
                      <span className="block font-mono font-bold text-neon-cyan mt-0.5">{suggestion.algorithm}</span>
                    </div>
                    <div className="glass-subtle rounded-lg p-2 text-center">
                      <span className="block text-text-tertiary">Population</span>
                      <span className="block font-mono font-bold text-text-primary mt-0.5">{suggestion.populationSize || '—'}</span>
                    </div>
                    <div className="glass-subtle rounded-lg p-2 text-center">
                      <span className="block text-text-tertiary">Iterations</span>
                      <span className="block font-mono font-bold text-text-primary mt-0.5">{suggestion.maxIterations || '—'}</span>
                    </div>
                  </div>
                  <ul className="text-xs text-text-secondary space-y-1">
                    {suggestion.reasoning.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5"><span className="text-neon-amber shrink-0">•</span>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">Algorithm</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALGORITHMS.map((algo) => (
                    <button key={algo.id} onClick={() => setAlgorithm(algo.id)}
                      className={`rounded-xl p-3 text-center transition-all duration-200 ${
                        algorithm === algo.id ? 'glass-strong border-neon-cyan/40 ring-1 ring-neon-cyan/20' : 'glass hover:border-neon-cyan/10'
                      }`}>
                      <span className={`block font-mono font-bold text-sm ${algorithm === algo.id ? 'text-neon-cyan' : 'text-text-primary'}`}>
                        {algo.id}
                      </span>
                      <span className="block text-[10px] text-text-tertiary mt-0.5">{algo.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {isMetaheuristic && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Population Size" type="number" min={5} max={200} value={populationSize}
                      onChange={(e) => setPopulationSize(Number(e.target.value))} />
                    <Input label="Max Iterations" type="number" min={10} max={1000} value={maxIterations}
                      onChange={(e) => setMaxIterations(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">Objective Weights</label>
                    <div className="space-y-3">
                      <WeightSlider label="Makespan" value={wMakespan} onChange={setWMakespan} color="cyan" />
                      <WeightSlider label="Energy" value={wEnergy} onChange={setWEnergy} color="pink" />
                      <WeightSlider label="Reliability" value={wReliability} onChange={setWReliability} color="amber" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-lg font-semibold mb-1">Review &amp; Run</h2>
                <p className="text-sm text-text-secondary">Confirm your configuration before launching.</p>
              </div>
              <div className="space-y-3">
                <ReviewRow label="Name" value={name} />
                <ReviewRow label="Tasks" value={`${taskCount}${tasks.length ? ` (${tasks.length} custom)` : ''}`} mono />
                <ReviewRow label="VMs" value={`${vmCount}${vms.length ? ` (${vms.length} custom)` : ''}`} mono />
                <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Algorithm</span>
                  <Badge color="cyan">{algorithm}</Badge>
                </div>
                {isMetaheuristic && (
                  <>
                    <ReviewRow label="Population × Iterations" value={`${populationSize} × ${maxIterations}`} mono />
                    <ReviewRow label="Weights (M / E / R)" value={`${wMakespan.toFixed(2)} / ${wEnergy.toFixed(2)} / ${wReliability.toFixed(2)}`} mono />
                  </>
                )}
              </div>
              <label className="flex items-center gap-3 glass-subtle rounded-xl p-4 cursor-pointer">
                <input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)}
                  className="w-4 h-4 rounded accent-neon-cyan" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Run immediately</p>
                  <p className="text-xs text-text-tertiary">Start optimization right after creating the experiment</p>
                </div>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
            Next<ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={isLoading}>
            <Play className="h-4 w-4 mr-2" />{autoRun ? 'Create & Run' : 'Create Experiment'}
          </Button>
        )}
      </div>
    </div>
  );
}

function WeightSlider({ label, value, onChange, color }: {
  label: string; value: number; onChange: (v: number) => void; color: 'cyan' | 'pink' | 'amber';
}) {
  const textClass = color === 'cyan' ? 'text-neon-cyan' : color === 'pink' ? 'text-neon-magenta' : 'text-neon-amber';
  const accentClass = color === 'cyan' ? 'accent-neon-cyan' : color === 'pink' ? 'accent-pink-500' : 'accent-amber-400';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className={`${textClass} font-mono`}>{value.toFixed(2)}</span>
      </div>
      <input type="range" min={0} max={100} value={value * 100}
        onChange={(e) => onChange(Number(e.target.value) / 100)} className={`w-full ${accentClass}`} />
    </div>
  );
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-sm ${mono ? 'font-mono text-neon-cyan' : 'font-medium text-text-primary'}`}>{value}</span>
    </div>
  );
}
