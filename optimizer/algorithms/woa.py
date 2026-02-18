"""
Whale Optimization Algorithm (WOA)
===================================
Nature-inspired metaheuristic based on humpback whale hunting behavior.
"""

import numpy as np
from .base import BaseOptimizer


class WOAOptimizer(BaseOptimizer):

    def run(self) -> dict:
        pop_size = self.population_size
        max_iter = self.max_iterations
        n_tasks = self.task_count
        n_vms = self.vm_count

        # Initialize
        population = [
            self.rng.integers(0, n_vms, size=n_tasks).tolist()
            for _ in range(pop_size)
        ]
        fitness_vals = [self.fitness(ind) for ind in population]

        best_idx = int(np.argmin(fitness_vals))
        leader = list(population[best_idx])
        leader_fit = fitness_vals[best_idx]

        convergence = []

        for iteration in range(max_iter):
            a = 2.0 - 2.0 * (iteration / max_iter)  # Linearly decreases from 2 to 0

            for i in range(pop_size):
                r = self.rng.random()
                A = 2 * a * r - a
                C = 2 * self.rng.random()
                p = self.rng.random()
                b = 1.0
                l = self.rng.uniform(-1, 1)

                new_ind = list(population[i])

                for t in range(n_tasks):
                    if p < 0.5:
                        if abs(A) < 1:
                            # Encircling prey
                            D = abs(C * leader[t] - population[i][t])
                            new_val = leader[t] - A * D
                        else:
                            # Search for prey (exploration)
                            rand_idx = int(self.rng.integers(0, pop_size))
                            rand_whale = population[rand_idx]
                            D = abs(C * rand_whale[t] - population[i][t])
                            new_val = rand_whale[t] - A * D
                    else:
                        # Spiral update
                        D = abs(leader[t] - population[i][t])
                        new_val = (
                            D * np.exp(b * l) * np.cos(2 * np.pi * l)
                            + leader[t]
                        )

                    new_ind[t] = int(round(new_val)) % n_vms

                new_fit = self.fitness(new_ind)

                if new_fit < fitness_vals[i]:
                    population[i] = new_ind
                    fitness_vals[i] = new_fit

                    if new_fit < leader_fit:
                        leader = list(new_ind)
                        leader_fit = new_fit

            convergence.append({
                "iteration": iteration,
                "bestFitness": round(leader_fit, 6),
                "makespan": round(self.compute_makespan(leader), 4),
                "energy": round(self.compute_energy(leader), 4),
            })

            # Stream progress to Node.js via stderr
            self.report_progress(
                iteration=iteration,
                max_iterations=max_iter,
                best_fitness=leader_fit,
                makespan=self.compute_makespan(leader),
                energy=self.compute_energy(leader),
                reliability=self.compute_reliability(leader),
                utilization=self.compute_resource_utilization(leader),
            )

        return self.build_result(leader, convergence)
