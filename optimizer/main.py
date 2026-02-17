"""
EDO-Cloud Scheduler — Optimizer Engine
=======================================
Entry point for all optimization algorithms.

Reads experiment config from stdin (JSON), runs the selected algorithm,
and writes results to stdout (JSON).

Usage:
    echo '{"algorithm":"EDO",...}' | python main.py
"""

import sys
import json
import time
import traceback

from algorithms.edo import EDOOptimizer
from algorithms.pso import PSOOptimizer
from algorithms.aco import ACOOptimizer
from algorithms.ga import GAOptimizer
from algorithms.woa import WOAOptimizer
from algorithms.round_robin import RoundRobinScheduler
from algorithms.min_min import MinMinScheduler
from algorithms.max_min import MaxMinScheduler


ALGORITHM_MAP = {
    "EDO": EDOOptimizer,
    "PSO": PSOOptimizer,
    "ACO": ACOOptimizer,
    "GA": GAOptimizer,
    "WOA": WOAOptimizer,
    "ROUND_ROBIN": RoundRobinScheduler,
    "MIN_MIN": MinMinScheduler,
    "MAX_MIN": MaxMinScheduler,
}


def main():
    try:
        raw = sys.stdin.read()
        config = json.loads(raw)

        algorithm_name = config.get("algorithm", "EDO")
        if algorithm_name not in ALGORITHM_MAP:
            raise ValueError(f"Unknown algorithm: {algorithm_name}")

        optimizer_cls = ALGORITHM_MAP[algorithm_name]
        optimizer = optimizer_cls(config)

        start = time.time()
        result = optimizer.run()
        elapsed = time.time() - start

        result["executionTime"] = int(elapsed * 1000)  # ms

        # Write result JSON to stdout
        json.dump(result, sys.stdout)
        sys.stdout.flush()

    except Exception as e:
        error_output = {
            "error": str(e),
            "traceback": traceback.format_exc(),
        }
        json.dump(error_output, sys.stderr)
        sys.stderr.flush()
        sys.exit(1)


if __name__ == "__main__":
    main()
