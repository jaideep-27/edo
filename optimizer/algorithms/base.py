"""
Base optimizer class.
All scheduling algorithms must extend this and implement `run()`.
"""

import sys
import json
import numpy as np
from abc import ABC, abstractmethod


class BaseOptimizer(ABC):
    """
    Abstract base for all optimization / scheduling algorithms.

    Parameters
    ----------
    config : dict
        Experiment configuration received from the Node.js backend.
        Expected keys:
            - algorithm        : str
            - workloadConfig   : { taskCount, tasks[] }
            - vmConfig         : { vmCount, vms[] }
            - hyperparameters  : { populationSize, maxIterations, weights, ... }
            - seed             : int
    """

    def __init__(self, config: dict):
        self.config = config
        self.seed = config.get("seed", 42)
        self.rng = np.random.default_rng(self.seed)

        wl = config.get("workloadConfig", {})
        vm = config.get("vmConfig", {})
        hp = config.get("hyperparameters", {})

        self.task_count = wl.get("taskCount", 10)
        self.tasks = wl.get("tasks", [])
        self.vm_count = vm.get("vmCount", 3)
        self.vms = vm.get("vms", [])

        self.population_size = hp.get("populationSize", 30)
        self.max_iterations = hp.get("maxIterations", 100)

        weights = hp.get("weights", {})
        self.w_makespan = weights.get("makespan", 0.4)
        self.w_energy = weights.get("energy", 0.3)
        self.w_reliability = weights.get("reliability", 0.3)

        # Generate default tasks / VMs if not provided
        if not self.tasks:
            self.tasks = self._generate_default_tasks()
        if not self.vms:
            self.vms = self._generate_default_vms()

    # ── Progress reporting ─────────────────────────────────

    def report_progress(self, iteration, max_iterations, best_fitness,
                        makespan, energy, reliability=None, utilization=None):
        """
        Write a JSON progress line to stderr so the Node.js process
        can stream it to the frontend via SSE.
        """
        progress = {
            "type": "progress",
            "iteration": iteration,
            "maxIterations": max_iterations,
            "fitness": round(best_fitness, 6),
            "makespan": round(makespan, 4),
            "energy": round(energy, 4),
        }
        if reliability is not None:
            progress["reliability"] = round(reliability, 4)
        if utilization is not None:
            progress["utilization"] = round(utilization, 4)
        sys.stderr.write("PROGRESS:" + json.dumps(progress) + "\n")
        sys.stderr.flush()

    # ── Helpers ────────────────────────────────────────────

    def _generate_default_tasks(self):
        """Generate random tasks with length and fileSize."""
        tasks = []
        for i in range(self.task_count):
            tasks.append({
                "id": i,
                "length": int(self.rng.integers(1000, 50000)),
                "fileSize": int(self.rng.integers(100, 5000)),
            })
        return tasks

    def _generate_default_vms(self):
        """Generate random VMs with mips, ram, bandwidth."""
        vms = []
        for i in range(self.vm_count):
            vms.append({
                "id": i,
                "mips": int(self.rng.choice([500, 1000, 1500, 2000, 2500])),
                "ram": int(self.rng.choice([512, 1024, 2048, 4096])),
                "bandwidth": int(self.rng.choice([500, 1000, 2000])),
            })
        return vms

    # ── Fitness evaluation ─────────────────────────────────

    def compute_makespan(self, schedule):
        """
        Compute makespan given a schedule (task→VM mapping).
        schedule : list[int]  — schedule[i] = VM index for task i
        """
        vm_times = [0.0] * self.vm_count
        for task_idx, vm_idx in enumerate(schedule):
            task = self.tasks[task_idx]
            vm = self.vms[vm_idx]
            exec_time = task["length"] / vm["mips"]
            vm_times[vm_idx] += exec_time
        return max(vm_times)

    def compute_energy(self, schedule):
        """Estimate energy consumption (simplified model)."""
        energy = 0.0
        for task_idx, vm_idx in enumerate(schedule):
            task = self.tasks[task_idx]
            vm = self.vms[vm_idx]
            exec_time = task["length"] / vm["mips"]
            power = vm["mips"] * 0.001  # Simplified power model
            energy += power * exec_time
        return energy

    def compute_reliability(self, schedule):
        """
        Estimate reliability as 1 - max_load_imbalance.
        Balanced loads → higher reliability.
        """
        vm_loads = [0.0] * self.vm_count
        for task_idx, vm_idx in enumerate(schedule):
            task = self.tasks[task_idx]
            vm = self.vms[vm_idx]
            vm_loads[vm_idx] += task["length"] / vm["mips"]

        total = sum(vm_loads) if sum(vm_loads) > 0 else 1
        avg = total / self.vm_count
        imbalance = max(abs(l - avg) for l in vm_loads) / avg if avg > 0 else 0
        return max(0.0, 1.0 - imbalance)

    def compute_resource_utilization(self, schedule):
        """Average VM utilization as a fraction."""
        vm_times = [0.0] * self.vm_count
        for task_idx, vm_idx in enumerate(schedule):
            task = self.tasks[task_idx]
            vm = self.vms[vm_idx]
            vm_times[vm_idx] += task["length"] / vm["mips"]

        makespan = max(vm_times) if max(vm_times) > 0 else 1
        utilizations = [t / makespan for t in vm_times]
        return sum(utilizations) / self.vm_count

    def fitness(self, schedule):
        """
        Multi-objective weighted fitness (lower is better).
        """
        ms = self.compute_makespan(schedule)
        en = self.compute_energy(schedule)
        rel = self.compute_reliability(schedule)

        # Normalize: we minimize makespan & energy, maximize reliability
        return (
            self.w_makespan * ms
            + self.w_energy * en
            - self.w_reliability * rel * 100  # Scale reliability contribution
        )

    def build_result(self, best_schedule, convergence_data):
        """
        Build the standard result dict returned to the Node backend.
        """
        schedule_entries = []
        for task_idx, vm_idx in enumerate(best_schedule):
            schedule_entries.append({
                "taskId": task_idx,
                "vmId": vm_idx,
                "startTime": 0,  # Simplified; real times computed in simulation
                "endTime": 0,
            })

        pareto_points = self._compute_pareto_front(convergence_data)

        return {
            "makespan": round(self.compute_makespan(best_schedule), 4),
            "energy": round(self.compute_energy(best_schedule), 4),
            "reliability": round(self.compute_reliability(best_schedule), 4),
            "resourceUtilization": round(
                self.compute_resource_utilization(best_schedule), 4
            ),
            "convergenceData": convergence_data,
            "paretoPoints": pareto_points,
            "schedule": schedule_entries,
            "logs": "",
        }

    def _compute_pareto_front(self, convergence_data):
        """
        Derive Pareto-optimal (makespan, energy) points from the
        convergence history.  A point dominates another when it is
        better (lower) on *both* objectives.

        Returns a list of dicts sorted by makespan ascending.
        """
        if not convergence_data:
            return []

        # Collect unique (makespan, energy) pairs that have both fields
        candidates = [
            {"makespan": d["makespan"], "energy": d["energy"],
             "reliability": d.get("bestFitness", 0)}
            for d in convergence_data
            if d.get("makespan") is not None and d.get("energy") is not None
        ]

        if not candidates:
            return []

        # Remove dominated points: point A is dominated if there exists B
        # such that B.makespan <= A.makespan AND B.energy <= A.energy
        # (with at least one strict inequality).
        pareto = []
        for a in candidates:
            dominated = False
            for b in candidates:
                if b is a:
                    continue
                if (b["makespan"] <= a["makespan"] and
                        b["energy"] <= a["energy"] and
                        (b["makespan"] < a["makespan"] or
                         b["energy"] < a["energy"])):
                    dominated = True
                    break
            if not dominated:
                pareto.append(a)

        # Deduplicate and sort by makespan
        seen = set()
        unique = []
        for p in pareto:
            key = (round(p["makespan"], 2), round(p["energy"], 2))
            if key not in seen:
                seen.add(key)
                unique.append({
                    "makespan": round(p["makespan"], 4),
                    "energy": round(p["energy"], 4),
                    "reliability": round(p.get("reliability", 0), 4),
                })

        unique.sort(key=lambda p: p["makespan"])
        return unique

    # ── Abstract method ────────────────────────────────────

    @abstractmethod
    def run(self) -> dict:
        """
        Execute the algorithm and return a result dict with keys:
            makespan, energy, reliability, resourceUtilization,
            convergenceData, paretoPoints, schedule, logs
        """
        ...
