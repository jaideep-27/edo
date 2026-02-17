import { create } from 'zustand';
import api from '@/lib/api';
import type { Experiment, CreateExperimentPayload, ExperimentResult } from '@/types';

interface ExperimentState {
  experiments: Experiment[];
  currentExperiment: Experiment | null;
  currentResults: ExperimentResult | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchExperiments: () => Promise<void>;
  fetchExperiment: (id: string) => Promise<void>;
  createExperiment: (payload: CreateExperimentPayload) => Promise<Experiment>;
  deleteExperiment: (id: string) => Promise<void>;
  runExperiment: (id: string) => Promise<void>;
  fetchResults: (experimentId: string) => Promise<void>;
  clearCurrent: () => void;
  setError: (error: string | null) => void;
}

export const useExperimentStore = create<ExperimentState>((set, get) => ({
  experiments: [],
  currentExperiment: null,
  currentResults: null,
  isLoading: false,
  error: null,

  fetchExperiments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: res } = await api.get('/experiments');
      set({ experiments: res.data, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch experiments';
      set({ error: message, isLoading: false });
    }
  },

  fetchExperiment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data: res } = await api.get(`/experiments/${id}`);
      set({ currentExperiment: res.data, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch experiment';
      set({ error: message, isLoading: false });
    }
  },

  createExperiment: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data: res } = await api.post('/experiments', payload);
      const newExperiment = res.data;
      set((state) => ({
        experiments: [newExperiment, ...state.experiments],
        isLoading: false,
      }));
      return newExperiment;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create experiment';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteExperiment: async (id) => {
    try {
      await api.delete(`/experiments/${id}`);
      set((state) => ({
        experiments: state.experiments.filter((e) => e._id !== id),
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete experiment';
      set({ error: message });
    }
  },

  runExperiment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/experiments/${id}/run`);
      // Refresh experiment to get updated status
      await get().fetchExperiment(id);
      set({ isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to run experiment';
      set({ error: message, isLoading: false });
    }
  },

  fetchResults: async (experimentId) => {
    set({ isLoading: true, error: null });
    try {
      const { data: res } = await api.get(`/results/${experimentId}`);
      set({ currentResults: res.data, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch results';
      set({ error: message, isLoading: false });
    }
  },

  clearCurrent: () => set({ currentExperiment: null, currentResults: null }),

  setError: (error) => set({ error }),
}));
