/**
 * AI Smart-Suggest Service
 * Recommends algorithm, hyperparameters, and optimisation weights
 * based on workload + VM profile analysis.
 *
 * This is a rule-based expert system (no external LLM dependency).
 */

/**
 * Analyse a workload and VM configuration and return a suggestion.
 *
 * @param {{ taskCount: number, tasks: Array }} workloadConfig
 * @param {{ vmCount: number, vms: Array }}      vmConfig
 * @returns {{ algorithm, populationSize, maxIterations, weights, reasoning }}
 */
const suggest = (workloadConfig, vmConfig) => {
  const { taskCount, tasks = [] } = workloadConfig;
  const { vmCount, vms = [] } = vmConfig;

  const ratio = taskCount / Math.max(vmCount, 1);
  const reasoning = [];

  // ── Analyse workload heterogeneity ──────────────────
  let taskVar = 0;
  if (tasks.length >= 2) {
    const sizes = tasks.map((t) => t.cpu || t.size || 0);
    const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    taskVar = sizes.reduce((a, b) => a + (b - mean) ** 2, 0) / sizes.length;
  }
  const isHeterogeneous = taskVar > 500000; // high variance

  // ── Analyse VM heterogeneity ────────────────────────
  let vmVar = 0;
  if (vms.length >= 2) {
    const mips = vms.map((v) => v.mips || 0);
    const mean = mips.reduce((a, b) => a + b, 0) / mips.length;
    vmVar = mips.reduce((a, b) => a + (b - mean) ** 2, 0) / mips.length;
  }
  const heterogeneousVMs = vmVar > 500000;

  // ── Pick algorithm ──────────────────────────────────
  let algorithm;
  let populationSize;
  let maxIterations;

  if (taskCount <= 10 && vmCount <= 3) {
    algorithm = 'MIN_MIN';
    populationSize = 0;
    maxIterations = 0;
    reasoning.push(
      'Small problem size (≤ 10 tasks, ≤ 3 VMs) — heuristic MIN_MIN is optimal and fastest.'
    );
  } else if (taskCount <= 30) {
    algorithm = isHeterogeneous ? 'GA' : 'PSO';
    populationSize = 30;
    maxIterations = 80;
    reasoning.push(
      isHeterogeneous
        ? 'Heterogeneous small workload — GA crossover handles diversity well.'
        : 'Uniform small workload — PSO converges quickly on smooth landscapes.'
    );
  } else if (taskCount <= 100) {
    algorithm = 'EDO';
    populationSize = 50;
    maxIterations = 150;
    reasoning.push(
      'Medium workload (30-100 tasks) — EDO balances exploration & exploitation effectively.'
    );
  } else if (taskCount <= 500) {
    algorithm = isHeterogeneous ? 'EDO' : 'ACO';
    populationSize = isHeterogeneous ? 80 : 60;
    maxIterations = 200;
    reasoning.push(
      isHeterogeneous
        ? 'Large heterogeneous workload — EDO multi-objective handles diverse task sizes.'
        : 'Large uniform workload — ACO pheromone trails scale well for routing-like problems.'
    );
  } else {
    algorithm = 'EDO';
    populationSize = 100;
    maxIterations = 300;
    reasoning.push(
      'Very large workload (> 500 tasks) — EDO with larger population for thorough search.'
    );
  }

  // ── Pick weights ────────────────────────────────────
  let weights;
  if (ratio > 20) {
    weights = { makespan: 0.5, energy: 0.2, reliability: 0.3 };
    reasoning.push(
      'High task-to-VM ratio — prioritise makespan to avoid bottlenecks.'
    );
  } else if (heterogeneousVMs) {
    weights = { makespan: 0.35, energy: 0.35, reliability: 0.3 };
    reasoning.push(
      'Heterogeneous VMs — balanced weights to leverage resource diversity.'
    );
  } else {
    weights = { makespan: 0.4, energy: 0.3, reliability: 0.3 };
    reasoning.push('Balanced workload — standard weight distribution.');
  }

  return {
    algorithm,
    populationSize,
    maxIterations,
    weights,
    reasoning,
  };
};

module.exports = { suggest };
