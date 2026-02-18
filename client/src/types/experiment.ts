import type { AlgorithmId, ExperimentStatus } from '@/lib/constants';

export interface TaskConfig {
  size: number;
  cpu: number;
  memory: number;
}

export interface VMConfig {
  mips: number;
  ram: number;
  bw: number;
  storage?: number;
}

export interface WorkloadConfig {
  taskCount: number;
  tasks: TaskConfig[];
  datasetFile?: string;
}

export interface VMSetConfig {
  vmCount: number;
  vms: VMConfig[];
}

export interface HyperparameterWeights {
  makespan: number;
  energy: number;
  reliability: number;
}

export interface Hyperparameters {
  populationSize: number;
  maxIterations: number;
  seed?: number;
  weights: HyperparameterWeights;
}

export interface Experiment {
  _id: string;
  userId: string;
  name: string;
  workloadConfig: WorkloadConfig;
  vmConfig: VMSetConfig;
  algorithm: AlgorithmId;
  hyperparameters: Hyperparameters;
  status: ExperimentStatus;
  startedAt?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperimentPayload {
  name: string;
  workloadConfig: WorkloadConfig;
  vmConfig: VMSetConfig;
  algorithm: AlgorithmId;
  hyperparameters: Hyperparameters;
  tags?: string[];
  notes?: string;
}
