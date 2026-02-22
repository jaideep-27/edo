'use client';

import { useState, useEffect, useRef, useCallback, startTransition } from 'react';

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

/** Maximum number of times the hook will try to reconnect on error. */
const MAX_RETRIES = 3;
/** Base delay (ms) for exponential back-off between retries. */
const RETRY_BASE_MS = 2000;

/**
 * SSE hook for real-time experiment progress.
 * Connects when experimentId is provided and status is 'running' or 'queued'.
 *
 * Handles two failure modes automatically:
 *  - 401 (expired/invalid token): stops retrying immediately and marks errored.
 *  - Transient network errors: retries up to MAX_RETRIES times with
 *    exponential back-off before giving up.
 */
export function useExperimentSSE(
  experimentId: string | undefined,
  status: string | undefined
): SSEProgress {
  const [state, setState] = useState<SSEProgress>(INITIAL_STATE);
  const esRef = useRef<EventSource | null>(null);
  const historyRef = useRef<LiveConvergencePoint[]>([]);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref to hold scheduleRetry so connect() can call it without a circular dep.
  const scheduleRetryRef = useRef<() => void>(() => {});

  const cleanup = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  // Extracted so it can be called both on mount and on retry.
  const connect = useCallback(() => {
    if (esRef.current) return; // already open

    // Always read the token fresh — avoids stale/expired token on reconnect.
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('edo_token')
      : null;

    if (!token) {
      setState((prev) => ({
        ...prev,
        errored: true,
        errorMessage: 'Not authenticated. Please log in again.',
      }));
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const url = `${baseUrl}/experiments/${experimentId}/progress?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Record<string, unknown>;
        const dataType = data.type as string;

        if (dataType === 'connected') {
          // Successful connection — reset retry counter.
          retryCountRef.current = 0;
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
      // Close the broken connection so the next attempt opens a fresh one.
      es.close();
      esRef.current = null;
      setState((prev) => ({ ...prev, connected: false }));

      // Check if the server returned a 401 by probing the endpoint with fetch.
      // EventSource doesn't expose HTTP status codes directly, so we do a quick
      // HEAD-like fetch to distinguish auth failures from transient errors.
      const probeUrl = url;
      fetch(probeUrl, { method: 'GET', headers: { Accept: 'text/event-stream' } })
        .then((res) => {
          if (res.status === 401) {
            // Token is expired or invalid — stop retrying, surface the error.
            setState((prev) => ({
              ...prev,
              errored: true,
              errorMessage: 'Session expired. Please refresh the page and log in again.',
            }));
            return;
          }
          // Any other error — attempt retry with back-off.
          scheduleRetryRef.current();
        })
        .catch(() => {
          // Network unreachable — still worth retrying.
          scheduleRetryRef.current();
        });
    };
  // connect is recreated when experimentId changes, so it closes over the
  // current experimentId safely.
  }, [experimentId, cleanup]);

  const scheduleRetry = useCallback(() => {
    if (retryCountRef.current >= MAX_RETRIES) {
      setState((prev) => ({
        ...prev,
        errored: true,
        errorMessage: 'Lost connection to the server. Please refresh the page.',
      }));
      return;
    }
    const delay = RETRY_BASE_MS * Math.pow(2, retryCountRef.current);
    retryCountRef.current += 1;
    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = null;
      connect();
    }, delay);
  }, [connect]);

  // Keep the ref in sync so connect()'s onerror closure always calls the
  // latest version of scheduleRetry without creating a circular dependency.
  useEffect(() => {
    scheduleRetryRef.current = scheduleRetry;
  }, [scheduleRetry]);

  useEffect(() => {
    const shouldConnect = experimentId && (status === 'running' || status === 'queued');

    if (!shouldConnect) {
      cleanup();
      return;
    }

    // Reset state and counters for a fresh connection attempt.
    historyRef.current = [];
    retryCountRef.current = 0;
    startTransition(() => { connect(); });

    return () => {
      cleanup();
    };
  }, [experimentId, status, connect, cleanup]);

  return state;
}
