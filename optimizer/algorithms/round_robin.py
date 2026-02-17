"""
Round Robin Scheduler
======================
Simple cyclic assignment of tasks to VMs.
"""

from .base import BaseOptimizer


class RoundRobinScheduler(BaseOptimizer):

    def run(self) -> dict:
        schedule = []
        for i in range(self.task_count):
            schedule.append(i % self.vm_count)

        convergence = [{
            "iteration": 0,
            "bestFitness": round(self.fitness(schedule), 6),
            "makespan": round(self.compute_makespan(schedule), 4),
            "energy": round(self.compute_energy(schedule), 4),
        }]

        return self.build_result(schedule, convergence)
