'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { Button, Input, Card, CardContent, Badge } from '@/components/ui';
import { useExperimentStore } from '@/stores/experimentStore';
import { ALGORITHMS, DEFAULT_HYPERPARAMETERS } from '@/lib/constants';
import type { AlgorithmId } from '@/lib/constants';

const STEPS = [
  { id: 0, title: 'Basics', icon: Settings2 },
  { id: 1, title: 'Workload', icon: Cpu },
  { id: 2, title: 'VMs', icon: Server },
  { id: 3, title: 'Algorithm', icon: Zap },
  { id: 4, title: 'Review', icon: CheckCircle2 },
];

export default function NewExperimentPage() {
  const router = useRouter();
  const { createExperiment, runExperiment, isLoading } = useExperimentStore();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [taskCount, setTaskCount] = useState<number>(20);
  const [vmCount, setVmCount] = useState<number>(5);
  const [algorithm, setAlgorithm] = useState<AlgorithmId>('EDO');
  const [populationSize, setPopulationSize] = useState<number>(
    DEFAULT_HYPERPARAMETERS.populationSize
  );
  const [maxIterations, setMaxIterations] = useState<number>(
    DEFAULT_HYPERPARAMETERS.maxIterations
  );
  const [wMakespan, setWMakespan] = useState<number>(
    DEFAULT_HYPERPARAMETERS.weights.makespan
  );
  const [wEnergy, setWEnergy] = useState<number>(DEFAULT_HYPERPARAMETERS.weights.energy);
  const [wReliability, setWReliability] = useState<number>(
    DEFAULT_HYPERPARAMETERS.weights.reliability
  );
  const [autoRun, setAutoRun] = useState(true);

  const isMetaheuristic = !['ROUND_ROBIN', 'MIN_MIN', 'MAX_MIN'].includes(algorithm);

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
        workloadConfig: { taskCount, tasks: [] },
        vmConfig: { vmCount, vms: [] },
        algorithm,
        hyperparameters: {
          populationSize,
          maxIterations,
          seed: DEFAULT_HYPERPARAMETERS.seed,
          weights: {
            makespan: wMakespan,
            energy: wEnergy,
            reliability: wReliability,
          },
        },
      };

      const experiment = await createExperiment(payload);

      if (autoRun && experiment?._id) {
        await runExperiment(experiment._id);
      }

      router.push('/dashboard/experiments');
    } catch {
      setError('Failed to create experiment. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/experiments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            New Experiment
          </h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full ${
                i === step
                  ? 'glass-strong text-neon-cyan'
                  : i < step
                  ? 'glass text-text-secondary cursor-pointer hover:text-text-primary'
                  : 'text-text-tertiary'
              }`}
            >
              <s.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{s.title}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-4 shrink-0 mx-1 ${
                  i < step ? 'bg-neon-cyan/30' : 'bg-border-glass'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-sm text-error mb-6">
          {error}
        </div>
      )}

      {/* Step content */}
      <Card className="glass-strong mb-6">
        <CardContent className="p-6">
          {/* Step 0 — Basics */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-lg font-semibold mb-1">Experiment Details</h2>
                <p className="text-sm text-text-secondary">Give your experiment a descriptive name.</p>
              </div>
              <Input
                label="Experiment Name"
                placeholder="e.g. EDO vs PSO — 50 tasks, 10 VMs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Step 1 — Workload */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-lg font-semibold mb-1">Workload Configuration</h2>
                <p className="text-sm text-text-secondary">
                  Define the number of cloud tasks. Individual task properties will be randomly
                  generated with configurable ranges.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Number of Tasks: <span className="text-neon-cyan font-mono">{taskCount}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={500}
                  value={taskCount}
                  onChange={(e) => setTaskCount(Number(e.target.value))}
                  className="w-full accent-neon-cyan"
                />
                <div className="flex justify-between text-xs text-text-tertiary mt-1">
                  <span>1</span>
                  <span>500</span>
                </div>
              </div>
              <Input
                label="Exact Task Count"
                type="number"
                min={1}
                max={10000}
                value={taskCount}
                onChange={(e) => setTaskCount(Number(e.target.value))}
              />
            </div>
          )}

          {/* Step 2 — VMs */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-lg font-semibold mb-1">VM Configuration</h2>
                <p className="text-sm text-text-secondary">
                  Define the number of virtual machines. VM specifications (MIPS, RAM, bandwidth)
                  will be auto-generated with realistic heterogeneous values.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Number of VMs: <span className="text-neon-cyan font-mono">{vmCount}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={vmCount}
                  onChange={(e) => setVmCount(Number(e.target.value))}
                  className="w-full accent-neon-cyan"
                />
                <div className="flex justify-between text-xs text-text-tertiary mt-1">
                  <span>1</span>
                  <span>50</span>
                </div>
              </div>
              <Input
                label="Exact VM Count"
                type="number"
                min={1}
                max={1000}
                value={vmCount}
                onChange={(e) => setVmCount(Number(e.target.value))}
              />
            </div>
          )}

          {/* Step 3 — Algorithm */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-lg font-semibold mb-1">
                  Algorithm & Hyperparameters
                </h2>
                <p className="text-sm text-text-secondary">
                  Choose a scheduling algorithm and tune its parameters.
                </p>
              </div>

              {/* Algorithm grid */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Algorithm
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALGORITHMS.map((algo) => (
                    <button
                      key={algo.id}
                      onClick={() => setAlgorithm(algo.id)}
                      className={`rounded-xl p-3 text-center transition-all duration-200 ${
                        algorithm === algo.id
                          ? 'glass-strong border-neon-cyan/40 ring-1 ring-neon-cyan/20'
                          : 'glass hover:border-neon-cyan/10'
                      }`}
                    >
                      <span
                        className={`block font-mono font-bold text-sm ${
                          algorithm === algo.id ? 'text-neon-cyan' : 'text-text-primary'
                        }`}
                      >
                        {algo.id}
                      </span>
                      <span className="block text-[10px] text-text-tertiary mt-0.5">
                        {algo.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hyperparameters (only for metaheuristics) */}
              {isMetaheuristic && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Population Size"
                      type="number"
                      min={5}
                      max={200}
                      value={populationSize}
                      onChange={(e) => setPopulationSize(Number(e.target.value))}
                    />
                    <Input
                      label="Max Iterations"
                      type="number"
                      min={10}
                      max={1000}
                      value={maxIterations}
                      onChange={(e) => setMaxIterations(Number(e.target.value))}
                    />
                  </div>

                  {/* Weights */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                      Objective Weights
                    </label>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-secondary">Makespan</span>
                          <span className="text-neon-cyan font-mono">{wMakespan.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={wMakespan * 100}
                          onChange={(e) => setWMakespan(Number(e.target.value) / 100)}
                          className="w-full accent-neon-cyan"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-secondary">Energy</span>
                          <span className="text-neon-magenta font-mono">{wEnergy.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={wEnergy * 100}
                          onChange={(e) => setWEnergy(Number(e.target.value) / 100)}
                          className="w-full accent-pink-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-secondary">Reliability</span>
                          <span className="text-neon-amber font-mono">
                            {wReliability.toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={wReliability * 100}
                          onChange={(e) => setWReliability(Number(e.target.value) / 100)}
                          className="w-full accent-amber-400"
                        />
                      </div>
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
                <h2 className="font-heading text-lg font-semibold mb-1">Review & Run</h2>
                <p className="text-sm text-text-secondary">
                  Confirm your experiment configuration before launching.
                </p>
              </div>

              <div className="space-y-3">
                <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Name</span>
                  <span className="text-sm font-medium text-text-primary">{name}</span>
                </div>
                <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Tasks</span>
                  <span className="text-sm font-mono text-neon-cyan">{taskCount}</span>
                </div>
                <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                  <span className="text-sm text-text-secondary">VMs</span>
                  <span className="text-sm font-mono text-neon-cyan">{vmCount}</span>
                </div>
                <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Algorithm</span>
                  <Badge color="cyan">{algorithm}</Badge>
                </div>
                {isMetaheuristic && (
                  <>
                    <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Population × Iterations</span>
                      <span className="text-sm font-mono text-text-primary">
                        {populationSize} × {maxIterations}
                      </span>
                    </div>
                    <div className="glass-subtle rounded-xl p-4 flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Weights (M / E / R)</span>
                      <span className="text-sm font-mono text-text-primary">
                        {wMakespan.toFixed(2)} / {wEnergy.toFixed(2)} / {wReliability.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Auto-run toggle */}
              <label className="flex items-center gap-3 glass-subtle rounded-xl p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRun}
                  onChange={(e) => setAutoRun(e.target.checked)}
                  className="w-4 h-4 rounded accent-neon-cyan"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">Run immediately</p>
                  <p className="text-xs text-text-tertiary">
                    Start optimization right after creating the experiment
                  </p>
                </div>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={isLoading}>
            <Play className="h-4 w-4 mr-2" />
            {autoRun ? 'Create & Run' : 'Create Experiment'}
          </Button>
        )}
      </div>
    </div>
  );
}
