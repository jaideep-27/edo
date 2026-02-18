"""
Enterprise Development Optimizer (EDO)
======================================
Novel metaheuristic inspired by organizational hierarchy dynamics:
  - Exploration via diverse "department" search directions
  - Exploitation via "management" feedback convergence
  - Adaptive balance through iteration-based decay
"""

import numpy as np
from .base import BaseOptimizer


class EDOOptimizer(BaseOptimizer):
    """EDO algorithm for multi-objective cloud task scheduling."""

    def run(self) -> dict:
        pop_size = self.population_size
        max_iter = self.max_iterations
        n_tasks = self.task_count
        n_vms = self.vm_count

        # Initialize population: each individual is a schedule (task→VM)
        population = [
            self.rng.integers(0, n_vms, size=n_tasks).tolist()
            for _ in range(pop_size)
        ]

        fitness_vals = [self.fitness(ind) for ind in population]
        best_idx = int(np.argmin(fitness_vals))
        global_best = list(population[best_idx])
        global_best_fit = fitness_vals[best_idx]

        convergence = []

        for iteration in range(max_iter):
            # Adaptive parameters
            exploration_rate = 1.0 - (iteration / max_iter)
            exploitation_rate = iteration / max_iter

            for i in range(pop_size):
                new_ind = list(population[i])

                for t in range(n_tasks):
                    r = self.rng.random()

                    if r < exploration_rate * 0.5:
                        # Department exploration: random VM assignment
                        new_ind[t] = int(self.rng.integers(0, n_vms))

                    elif r < exploration_rate:
                        # Cross-department learning: adopt from a random peer
                        peer = int(self.rng.integers(0, pop_size))
                        new_ind[t] = population[peer][t]

                    elif r < exploration_rate + exploitation_rate * 0.5:
                        # Management feedback: move toward global best
                        new_ind[t] = global_best[t]

                    else:
                        # Local refinement: small perturbation
                        if self.rng.random() < 0.3:
                            new_ind[t] = int(
                                (new_ind[t] + int(self.rng.integers(-1, 2)))
                                % n_vms
                            )

                new_fit = self.fitness(new_ind)

                if new_fit < fitness_vals[i]:
                    population[i] = new_ind
                    fitness_vals[i] = new_fit

                    if new_fit < global_best_fit:
                        global_best = list(new_ind)
                        global_best_fit = new_fit

            convergence.append({
                "iteration": iteration,
                "bestFitness": round(global_best_fit, 6),
                "makespan": round(self.compute_makespan(global_best), 4),
                "energy": round(self.compute_energy(global_best), 4),
            })

            # Stream progress to Node.js via stderr
            self.report_progress(
                iteration=iteration,
                max_iterations=max_iter,
                best_fitness=global_best_fit,
                makespan=self.compute_makespan(global_best),
                energy=self.compute_energy(global_best),
                reliability=self.compute_reliability(global_best),
                utilization=self.compute_resource_utilization(global_best),
            )

        return self.build_result(global_best, convergence)
