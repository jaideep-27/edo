"""
Ant Colony Optimization (ACO)
==============================
Pheromone-based discrete optimization for task scheduling.
"""

import numpy as np
from .base import BaseOptimizer


class ACOOptimizer(BaseOptimizer):

    def run(self) -> dict:
        max_iter = self.max_iterations
        n_ants = self.population_size
        n_tasks = self.task_count
        n_vms = self.vm_count

        alpha = 1.0   # Pheromone importance
        beta = 2.0    # Heuristic importance
        rho = 0.1     # Evaporation rate

        # Pheromone matrix: task × VM
        pheromone = np.ones((n_tasks, n_vms))

        # Heuristic: inverse of execution time (higher mips → better)
        heuristic = np.zeros((n_tasks, n_vms))
        for t in range(n_tasks):
            for v in range(n_vms):
                exec_time = self.tasks[t]["length"] / self.vms[v]["mips"]
                heuristic[t][v] = 1.0 / exec_time if exec_time > 0 else 1.0

        g_best = None
        g_best_fit = float("inf")
        convergence = []

        for iteration in range(max_iter):
            all_schedules = []

            for _ in range(n_ants):
                schedule = []
                for t in range(n_tasks):
                    probs = (
                        pheromone[t] ** alpha * heuristic[t] ** beta
                    )
                    probs /= probs.sum()
                    vm_idx = int(self.rng.choice(n_vms, p=probs))
                    schedule.append(vm_idx)

                all_schedules.append(schedule)

            # Evaluate & update best
            for schedule in all_schedules:
                fit = self.fitness(schedule)
                if fit < g_best_fit:
                    g_best = list(schedule)
                    g_best_fit = fit

            # Evaporate
            pheromone *= (1 - rho)

            # Deposit pheromone on best solution
            if g_best is not None:
                deposit = 1.0 / (g_best_fit + 1e-10)
                for t in range(n_tasks):
                    pheromone[t][g_best[t]] += deposit

            convergence.append({
                "iteration": iteration,
                "bestFitness": round(g_best_fit, 6),
                "makespan": round(self.compute_makespan(g_best), 4),
                "energy": round(self.compute_energy(g_best), 4),
            })

        return self.build_result(g_best, convergence)
