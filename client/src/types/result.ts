export interface ConvergencePoint {
  iteration: number;
  fitness: number;
  makespan?: number;
  energy?: number;
}

export interface ParetoPoint {
  makespan: number;
  energy: number;
  reliability: number;
}

export interface ScheduleEntry {
  taskId: number;
  vmId: number;
  startTime?: number;
  endTime?: number;
}

export interface ExperimentResult {
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

export interface MetricSummary {
  label: string;
  value: number;
  unit: string;
  delta?: number; // percentage change from baseline
  deltaDirection?: 'up' | 'down'; // whether up is good or bad
}
