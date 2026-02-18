'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface ProgressEvent {
  type: 'progress';
  iteration: number;
  maxIterations: number;
  fitness: number;
  makespan: number;
  energy: number;
  reliability?: number;
  utilization?: number;
  timestamp: number;
}

export interface PhaseEvent {
  type: 'phase';
  phase: 'initializing' | 'optimizing' | 'simulating' | 'saving' | 'completed' | 'failed';
  algorithm?: string;
  maxIterations?: number;
  taskCount?: number;
  vmCount?: number;
  timestamp: number;
}

export interface CompleteEvent {
  type: 'complete';
  makespan?: number;
  energy?: number;
  reliability?: number;
  resourceUtilization?: number;
  executionTime?: number;
  timestamp: number;
}

export interface SSEErrorEvent {
  type: 'error';
  message: string;
  timestamp: number;
}

export interface LiveConvergencePoint {
  iteration: number;
  fitness: number;
  makespan: number;
  energy: number;
}

export interface SSEProgress {
  phase: PhaseEvent['phase'] | 'connected' | 'queued';
  iteration: number;
  maxIterations: number;
  percent: number;
  fitness: number;
  makespan: number;
  energy: number;
  reliability: number;
  utilization: number;
  convergenceHistory: LiveConvergencePoint[];
  completed: boolean;
  errored: boolean;
  errorMessage: string;
  algorithm: string;
  taskCount: number;
  vmCount: number;
  finalMetrics: CompleteEvent | null;
  connected: boolean;
}

const INITIAL_STATE: SSEProgress = {
  phase: 'queued',
  iteration: 0,
  maxIterations: 100,
  percent: 0,
  fitness: 0,
  makespan: 0,
  energy: 0,
  reliability: 0,
  utilization: 0,
  convergenceHistory: [],
  completed: false,
  errored: false,
  errorMessage: '',
  algorithm: '',
  taskCount: 0,
  vmCount: 0,
  finalMetrics: null,
  connected: false,
};

/**
 * SSE hook for real-time experiment progress.
 * Connects when experimentId is provided and status is 'running' or 'queued'.
 */
export function useExperimentSSE(
  experimentId: string | undefined,
  status: string | undefined
): SSEProgress {
  const [state, setState] = useState<SSEProgress>(INITIAL_STATE);
  const esRef = useRef<EventSource | null>(null);
  const historyRef = useRef<LiveConvergencePoint[]>([]);

  const cleanup = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  useEffect(() => {
    const shouldConnect = experimentId && (status === 'running' || status === 'queued');

    if (!shouldConnect) {
      cleanup();
      return;
    }

    // Don't reconnect if already connected
    if (esRef.current) return;

    // Reset
    historyRef.current = [];

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('edo_token')
      : null;

    if (!token) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const url = `${baseUrl}/experiments/${experimentId}/progress?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Record<string, unknown>;
        const dataType = data.type as string;

        if (dataType === 'connected') {
          setState((prev) => ({ ...prev, connected: true }));
          return;
        }

        if (dataType === 'phase') {
          const d = data as unknown as PhaseEvent;
          setState((prev) => ({
            ...prev,
            phase: d.phase,
            algorithm: d.algorithm || prev.algorithm,
            maxIterations: d.maxIterations || prev.maxIterations,
            taskCount: d.taskCount || prev.taskCount,
            vmCount: d.vmCount || prev.vmCount,
          }));
          return;
        }

        if (dataType === 'progress') {
          const d = data as unknown as ProgressEvent;
          const point: LiveConvergencePoint = {
            iteration: d.iteration,
            fitness: d.fitness,
            makespan: d.makespan,
            energy: d.energy,
          };
          historyRef.current = [...historyRef.current, point];

          const percent = d.maxIterations > 0
            ? Math.round(((d.iteration + 1) / d.maxIterations) * 100)
            : 0;

          setState((prev) => ({
            ...prev,
            iteration: d.iteration,
            maxIterations: d.maxIterations,
            percent,
            fitness: d.fitness,
            makespan: d.makespan,
            energy: d.energy,
            reliability: d.reliability ?? prev.reliability,
            utilization: d.utilization ?? prev.utilization,
            convergenceHistory: [...historyRef.current],
            phase: 'optimizing',
          }));
          return;
        }

        if (dataType === 'complete') {
          const d = data as unknown as CompleteEvent;
          setState((prev) => ({
            ...prev,
            phase: 'completed',
            percent: 100,
            completed: true,
            finalMetrics: d,
          }));
          cleanup();
          return;
        }

        if (dataType === 'error') {
          const d = data as unknown as SSEErrorEvent;
          setState((prev) => ({
            ...prev,
            phase: 'failed',
            errored: true,
            errorMessage: d.message,
          }));
          cleanup();
          return;
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      setState((prev) => ({ ...prev, connected: false }));
    };

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId, status]);

  return state;
}
