"""
Particle Swarm Optimization (PSO)
==================================
Standard discrete PSO adapted for task scheduling.
"""

import numpy as np
from .base import BaseOptimizer


class PSOOptimizer(BaseOptimizer):

    def run(self) -> dict:
        pop_size = self.population_size
        max_iter = self.max_iterations
        n_tasks = self.task_count
        n_vms = self.vm_count

        # Initialize particles
        positions = [
            self.rng.integers(0, n_vms, size=n_tasks).tolist()
            for _ in range(pop_size)
        ]
        velocities = [
            self.rng.uniform(-n_vms, n_vms, size=n_tasks).tolist()
            for _ in range(pop_size)
        ]

        fitness_vals = [self.fitness(p) for p in positions]
        p_best = [list(p) for p in positions]
        p_best_fit = list(fitness_vals)

        g_best_idx = int(np.argmin(fitness_vals))
        g_best = list(positions[g_best_idx])
        g_best_fit = fitness_vals[g_best_idx]

        convergence = []
        w = 0.9  # Inertia weight

        for iteration in range(max_iter):
            w = 0.9 - 0.5 * (iteration / max_iter)  # Linear decay
            c1, c2 = 2.0, 2.0

            for i in range(pop_size):
                for t in range(n_tasks):
                    r1 = self.rng.random()
                    r2 = self.rng.random()

                    velocities[i][t] = (
                        w * velocities[i][t]
                        + c1 * r1 * (p_best[i][t] - positions[i][t])
                        + c2 * r2 * (g_best[t] - positions[i][t])
                    )

                    # Update position (discrete)
                    new_pos = int(round(positions[i][t] + velocities[i][t]))
                    positions[i][t] = new_pos % n_vms

                new_fit = self.fitness(positions[i])

                if new_fit < p_best_fit[i]:
                    p_best[i] = list(positions[i])
                    p_best_fit[i] = new_fit

                    if new_fit < g_best_fit:
                        g_best = list(positions[i])
                        g_best_fit = new_fit

            convergence.append({
                "iteration": iteration,
                "bestFitness": round(g_best_fit, 6),
                "makespan": round(self.compute_makespan(g_best), 4),
                "energy": round(self.compute_energy(g_best), 4),
            })

            # Stream progress to Node.js via stderr
            self.report_progress(
                iteration=iteration,
                max_iterations=max_iter,
                best_fitness=g_best_fit,
                makespan=self.compute_makespan(g_best),
                energy=self.compute_energy(g_best),
                reliability=self.compute_reliability(g_best),
                utilization=self.compute_resource_utilization(g_best),
            )

        return self.build_result(g_best, convergence)
