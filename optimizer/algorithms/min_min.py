"""
Min-Min Scheduler
==================
Assigns the task with the minimum completion time to the VM
that yields the minimum completion time.
"""

from .base import BaseOptimizer


class MinMinScheduler(BaseOptimizer):

    def run(self) -> dict:
        n_tasks = self.task_count
        n_vms = self.vm_count

        schedule = [0] * n_tasks
        assigned = [False] * n_tasks
        vm_ready = [0.0] * n_vms

        for _ in range(n_tasks):
            best_task = -1
            best_vm = -1
            best_ct = float("inf")

            for t in range(n_tasks):
                if assigned[t]:
                    continue
                for v in range(n_vms):
                    exec_time = self.tasks[t]["length"] / self.vms[v]["mips"]
                    ct = vm_ready[v] + exec_time
                    if ct < best_ct:
                        best_ct = ct
                        best_task = t
                        best_vm = v

            schedule[best_task] = best_vm
            assigned[best_task] = True
            vm_ready[best_vm] = best_ct

        convergence = [{
            "iteration": 0,
            "bestFitness": round(self.fitness(schedule), 6),
            "makespan": round(self.compute_makespan(schedule), 4),
            "energy": round(self.compute_energy(schedule), 4),
        }]

        self.report_progress(
            iteration=0,
            max_iterations=1,
            best_fitness=self.fitness(schedule),
            makespan=self.compute_makespan(schedule),
            energy=self.compute_energy(schedule),
            reliability=self.compute_reliability(schedule),
            utilization=self.compute_resource_utilization(schedule),
        )

        return self.build_result(schedule, convergence)
