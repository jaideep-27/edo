'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { DEFAULT_HYPERPARAMETERS, ALGORITHMS } from '@/lib/constants';
import {
  Settings,
  User,
  Sliders,
  Save,
  RotateCcw,
  Shield,
  Beaker,
  Info,
} from 'lucide-react';

/* ── Section component (declared outside render) ───── */
function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border-glass flex items-center gap-3">
        <div className="rounded-lg p-2 bg-neon-cyan/10">
          <Icon className="w-5 h-5 text-neon-cyan" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <p className="text-xs text-text-tertiary">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── SliderRow component (declared outside render) ─── */
function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-neon-cyan"
      />
    </div>
  );
}

/* ── Defaults type ───────────────────────────────────── */
interface DefaultsState {
  populationSize: number;
  maxIterations: number;
  seed: number;
  wMakespan: number;
  wEnergy: number;
  wReliability: number;
  preferredAlgorithm: string;
}

const INITIAL_DEFAULTS: DefaultsState = {
  populationSize: Number(DEFAULT_HYPERPARAMETERS.populationSize),
  maxIterations: Number(DEFAULT_HYPERPARAMETERS.maxIterations),
  seed: Number(DEFAULT_HYPERPARAMETERS.seed),
  wMakespan: Number(DEFAULT_HYPERPARAMETERS.weights.makespan),
  wEnergy: Number(DEFAULT_HYPERPARAMETERS.weights.energy),
  wReliability: Number(DEFAULT_HYPERPARAMETERS.weights.reliability),
  preferredAlgorithm: 'EDO',
};

export default function SettingsPage() {
  const { user } = useAuthStore();

  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileEmail] = useState(user?.email ?? '');
  const [defaults, setDefaults] = useState<DefaultsState>({ ...INITIAL_DEFAULTS });

  const resetDefaults = () => setDefaults({ ...INITIAL_DEFAULTS });

  const handleSaveProfile = () => {
    alert('Profile saved (frontend-only for now).');
  };

  const handleSaveDefaults = () => {
    localStorage.setItem('edo_defaults', JSON.stringify(defaults));
    alert('Default hyperparameters saved locally.');
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary flex items-center gap-3">
          <Settings className="w-8 h-8 text-neon-cyan" />
          Settings
        </h1>
        <p className="text-text-secondary mt-1">Manage your profile and experiment defaults.</p>
      </div>

      {/* Profile */}
      <Section icon={User} title="Profile" description="Your account information.">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-border-glass text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">Email</label>
            <input
              type="email"
              value={profileEmail}
              disabled
              className="w-full px-3 py-2 rounded-lg bg-canvas border border-border-glass text-text-tertiary text-sm cursor-not-allowed"
            />
            <p className="text-[10px] text-text-tertiary mt-1">Email cannot be changed.</p>
          </div>
          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan text-canvas text-sm font-medium hover:bg-neon-cyan/90 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </Section>

      {/* Default hyperparameters */}
      <Section
        icon={Sliders}
        title="Default Hyperparameters"
        description="These values pre-fill when you create a new experiment."
      >
        <div className="space-y-5">
          <SliderRow
            label="Population Size"
            value={defaults.populationSize}
            min={10}
            max={200}
            step={10}
            onChange={(v) => setDefaults((d) => ({ ...d, populationSize: v }))}
          />
          <SliderRow
            label="Max Iterations"
            value={defaults.maxIterations}
            min={10}
            max={500}
            step={10}
            onChange={(v) => setDefaults((d) => ({ ...d, maxIterations: v }))}
          />
          <SliderRow
            label="Seed"
            value={defaults.seed}
            min={1}
            max={9999}
            step={1}
            onChange={(v) => setDefaults((d) => ({ ...d, seed: v }))}
          />

          <div className="pt-3 border-t border-border-glass">
            <p className="text-xs text-text-secondary font-medium mb-3">Objective Weights</p>
            <div className="space-y-4">
              <SliderRow
                label="Makespan Weight"
                value={defaults.wMakespan}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => setDefaults((d) => ({ ...d, wMakespan: v }))}
              />
              <SliderRow
                label="Energy Weight"
                value={defaults.wEnergy}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => setDefaults((d) => ({ ...d, wEnergy: v }))}
              />
              <SliderRow
                label="Reliability Weight"
                value={defaults.wReliability}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => setDefaults((d) => ({ ...d, wReliability: v }))}
              />
              {Math.abs(defaults.wMakespan + defaults.wEnergy + defaults.wReliability - 1) > 0.01 && (
                <p className="text-[10px] text-neon-amber flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Weights sum to {(defaults.wMakespan + defaults.wEnergy + defaults.wReliability).toFixed(2)} — should equal 1.0
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-border-glass">
            <p className="text-xs text-text-secondary font-medium mb-2">Preferred Algorithm</p>
            <div className="flex flex-wrap gap-2">
              {ALGORITHMS.map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => setDefaults((d) => ({ ...d, preferredAlgorithm: algo.id }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    defaults.preferredAlgorithm === algo.id
                      ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan'
                      : 'border-border-glass text-text-tertiary hover:text-text-secondary hover:bg-panel-elevated'
                  }`}
                >
                  {algo.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSaveDefaults}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan text-canvas text-sm font-medium hover:bg-neon-cyan/90 transition-colors"
            >
              <Save className="w-4 h-4" /> Save Defaults
            </button>
            <button
              onClick={resetDefaults}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-text-secondary text-sm hover:text-text-primary transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </Section>

      {/* About */}
      <Section icon={Shield} title="About" description="Application and team information.">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-tertiary">Application</span>
            <span className="text-text-primary font-medium">EDO-Cloud Scheduler v1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Team</span>
            <span className="text-text-secondary">Batch A01 – CMR Technical Campus</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Guide</span>
            <span className="text-text-secondary">Dr. K. Rameshwaraiah</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Members</span>
            <span className="text-text-secondary text-right">
              A. Jaideep · G. Sai Teja · B. Bhanu Prasad
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Algorithms</span>
            <span className="text-text-secondary">
              EDO, PSO, ACO, GA, WOA + 3 baselines
            </span>
          </div>
          <div className="pt-3 border-t border-border-glass flex items-start gap-2">
            <Beaker className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
            <p className="text-xs text-text-tertiary">
              Enterprise Development Optimizer (EDO) is a novel metaheuristic inspired by corporate
              organizational structures, featuring department exploration, cross-department learning,
              management feedback, and local refinement phases.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
