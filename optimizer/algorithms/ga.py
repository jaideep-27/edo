"""
Genetic Algorithm (GA)
=======================
Standard GA with tournament selection, crossover, and mutation.
"""

import numpy as np
from .base import BaseOptimizer


class GAOptimizer(BaseOptimizer):

    def run(self) -> dict:
        pop_size = self.population_size
        max_iter = self.max_iterations
        n_tasks = self.task_count
        n_vms = self.vm_count

        crossover_rate = 0.8
        mutation_rate = 0.1
        tournament_k = 3

        # Initialize population
        population = [
            self.rng.integers(0, n_vms, size=n_tasks).tolist()
            for _ in range(pop_size)
        ]
        fitness_vals = [self.fitness(ind) for ind in population]

        best_idx = int(np.argmin(fitness_vals))
        g_best = list(population[best_idx])
        g_best_fit = fitness_vals[best_idx]

        convergence = []

        for iteration in range(max_iter):
            new_population = []

            while len(new_population) < pop_size:
                # Tournament selection
                p1 = self._tournament(population, fitness_vals, tournament_k)
                p2 = self._tournament(population, fitness_vals, tournament_k)

                # Crossover
                if self.rng.random() < crossover_rate:
                    c1, c2 = self._crossover(p1, p2)
                else:
                    c1, c2 = list(p1), list(p2)

                # Mutation
                c1 = self._mutate(c1, mutation_rate, n_vms)
                c2 = self._mutate(c2, mutation_rate, n_vms)

                new_population.append(c1)
                if len(new_population) < pop_size:
                    new_population.append(c2)

            population = new_population[:pop_size]
            fitness_vals = [self.fitness(ind) for ind in population]

            best_idx = int(np.argmin(fitness_vals))
            if fitness_vals[best_idx] < g_best_fit:
                g_best = list(population[best_idx])
                g_best_fit = fitness_vals[best_idx]

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

    def _tournament(self, population, fitness_vals, k):
        indices = self.rng.choice(len(population), size=k, replace=False)
        best = indices[0]
        for idx in indices[1:]:
            if fitness_vals[idx] < fitness_vals[best]:
                best = idx
        return list(population[best])

    def _crossover(self, p1, p2):
        point = int(self.rng.integers(1, len(p1)))
        c1 = p1[:point] + p2[point:]
        c2 = p2[:point] + p1[point:]
        return c1, c2

    def _mutate(self, individual, rate, n_vms):
        for i in range(len(individual)):
            if self.rng.random() < rate:
                individual[i] = int(self.rng.integers(0, n_vms))
        return individual
