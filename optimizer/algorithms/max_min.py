"""
Max-Min Scheduler
==================
Assigns the task with the maximum completion time to the VM
that yields its minimum completion time.
"""

from .base import BaseOptimizer


class MaxMinScheduler(BaseOptimizer):

    def run(self) -> dict:
        n_tasks = self.task_count
        n_vms = self.vm_count

        schedule = [0] * n_tasks
        assigned = [False] * n_tasks
        vm_ready = [0.0] * n_vms

        for _ in range(n_tasks):
            best_task = -1
            best_vm = -1
            max_min_ct = -1.0

            for t in range(n_tasks):
                if assigned[t]:
                    continue

                # Find the VM that gives minimum completion time for this task
                local_best_vm = 0
                local_best_ct = float("inf")
                for v in range(n_vms):
                    exec_time = self.tasks[t]["length"] / self.vms[v]["mips"]
                    ct = vm_ready[v] + exec_time
                    if ct < local_best_ct:
                        local_best_ct = ct
                        local_best_vm = v

                # Pick the task whose minimum CT is the maximum
                if local_best_ct > max_min_ct:
                    max_min_ct = local_best_ct
                    best_task = t
                    best_vm = local_best_vm

            schedule[best_task] = best_vm
            assigned[best_task] = True
            vm_ready[best_vm] = max_min_ct

        convergence = [{
            "iteration": 0,
            "bestFitness": round(self.fitness(schedule), 6),
            "makespan": round(self.compute_makespan(schedule), 4),
            "energy": round(self.compute_energy(schedule), 4),
        }]

        return self.build_result(schedule, convergence)
