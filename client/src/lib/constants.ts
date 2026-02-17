// ========================================
// Application Constants
// ========================================

export const APP_NAME = 'EDO-Cloud';
export const APP_FULL_NAME = 'EDO-Cloud Scheduler';
export const APP_DESCRIPTION =
  'Multi-objective cloud task scheduling powered by the Enterprise Development Optimizer';

// Algorithms available for scheduling
export const ALGORITHMS = [
  { id: 'EDO', name: 'Enterprise Development Optimizer', color: '#66FCF1' },
  { id: 'PSO', name: 'Particle Swarm Optimization', color: '#FF2A6D' },
  { id: 'ACO', name: 'Ant Colony Optimization', color: '#FFC857' },
  { id: 'WOA', name: 'Whale Optimization Algorithm', color: '#6C3CE1' },
  { id: 'Baseline', name: 'Round-Robin / First-Fit', color: '#A0A0B0' },
] as const;

export type AlgorithmId = (typeof ALGORITHMS)[number]['id'];

// Experiment statuses
export const EXPERIMENT_STATUSES = {
  draft: { label: 'Draft', color: '#66FCF1' },
  queued: { label: 'Queued', color: '#FFC857' },
  running: { label: 'Running', color: '#FF2A6D' },
  completed: { label: 'Completed', color: '#4ADE80' },
  failed: { label: 'Failed', color: '#F87171' },
} as const;

export type ExperimentStatus = keyof typeof EXPERIMENT_STATUSES;

// Default hyperparameters
export const DEFAULT_HYPERPARAMETERS = {
  populationSize: 50,
  maxIterations: 100,
  seed: 42,
  weights: {
    makespan: 0.4,
    energy: 0.3,
    reliability: 0.3,
  },
} as const;

// Navigation links
export const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Solutions', href: '/#solutions' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Resources', href: '/#resources' },
  { label: 'Enterprise', href: '/#enterprise' },
] as const;

export const DASHBOARD_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Experiments', href: '/dashboard/experiments', icon: 'FlaskConical' },
  { label: 'Compare', href: '/dashboard/compare', icon: 'GitCompare' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
] as const;
