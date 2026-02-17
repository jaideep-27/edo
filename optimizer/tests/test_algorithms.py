"""
Unit tests for the EDO-Cloud optimizer algorithms.
Run with: python -m pytest tests/ -v
"""
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from algorithms.edo import EDOOptimizer
from algorithms.pso import PSOOptimizer
from algorithms.aco import ACOOptimizer
from algorithms.ga import GAOptimizer
from algorithms.woa import WOAOptimizer
from algorithms.round_robin import RoundRobinScheduler
from algorithms.min_min import MinMinScheduler
from algorithms.max_min import MaxMinScheduler


def make_config(task_count=10, vm_count=3, algorithm='EDO', pop=10, iters=20):
    """Create a minimal experiment config for testing."""
    return {
        'experimentId': 'test-123',
        'algorithm': algorithm,
        'workloadConfig': {
            'taskCount': task_count,
            'tasks': [
                {'id': i, 'length': 1000 + i * 100, 'fileSize': 256 + i * 25}
                for i in range(task_count)
            ],
        },
        'vmConfig': {
            'vmCount': vm_count,
            'vms': [
                {'id': j, 'mips': 1000 + j * 500, 'ram': 2048 + j * 1024, 'bandwidth': 1000}
                for j in range(vm_count)
            ],
        },
        'hyperparameters': {
            'populationSize': pop,
            'maxIterations': iters,
            'weights': {'makespan': 0.4, 'energy': 0.3, 'reliability': 0.3},
        },
        'seed': 42,
    }


def validate_result(result, task_count, vm_count):
    """Validate common result structure."""
    assert 'makespan' in result, 'Missing makespan'
    assert 'energy' in result, 'Missing energy'
    assert 'reliability' in result, 'Missing reliability'
    assert 'schedule' in result, 'Missing schedule'
    assert result['makespan'] >= 0, 'Negative makespan'
    assert result['energy'] >= 0, 'Negative energy'
    assert 0 <= result['reliability'] <= 1, 'Reliability out of range'

    schedule = result['schedule']
    assert len(schedule) == task_count, f'Expected {task_count} schedule entries, got {len(schedule)}'

    for entry in schedule:
        assert 0 <= entry['vmId'] < vm_count, f"VM id {entry['vmId']} out of range"


# ── Metaheuristic tests ────────────────────────────────
class TestEDO:
    def test_basic_run(self):
        config = make_config(algorithm='EDO')
        opt = EDOOptimizer(config)
        result = opt.run()
        validate_result(result, 10, 3)

    def test_convergence_data(self):
        config = make_config(algorithm='EDO')
        opt = EDOOptimizer(config)
        result = opt.run()
        assert 'convergenceData' in result
        assert len(result['convergenceData']) > 0

    def test_deterministic_with_seed(self):
        config = make_config(algorithm='EDO')
        r1 = EDOOptimizer(config).run()
        r2 = EDOOptimizer(config).run()
        assert r1['makespan'] == r2['makespan']


class TestPSO:
    def test_basic_run(self):
        config = make_config(algorithm='PSO')
        result = PSOOptimizer(config).run()
        validate_result(result, 10, 3)


class TestACO:
    def test_basic_run(self):
        config = make_config(algorithm='ACO')
        result = ACOOptimizer(config).run()
        validate_result(result, 10, 3)


class TestGA:
    def test_basic_run(self):
        config = make_config(algorithm='GA')
        result = GAOptimizer(config).run()
        validate_result(result, 10, 3)


class TestWOA:
    def test_basic_run(self):
        config = make_config(algorithm='WOA')
        result = WOAOptimizer(config).run()
        validate_result(result, 10, 3)


# ── Heuristic tests ───────────────────────────────────
class TestRoundRobin:
    def test_basic_run(self):
        config = make_config(algorithm='ROUND_ROBIN')
        result = RoundRobinScheduler(config).run()
        validate_result(result, 10, 3)

    def test_even_distribution(self):
        config = make_config(task_count=9, vm_count=3, algorithm='ROUND_ROBIN')
        result = RoundRobinScheduler(config).run()
        vm_counts = {}
        for entry in result['schedule']:
            vm_counts[entry['vmId']] = vm_counts.get(entry['vmId'], 0) + 1
        # Round-robin should distribute evenly: 3 tasks per VM
        assert all(c == 3 for c in vm_counts.values())


class TestMinMin:
    def test_basic_run(self):
        config = make_config(algorithm='MIN_MIN')
        result = MinMinScheduler(config).run()
        validate_result(result, 10, 3)


class TestMaxMin:
    def test_basic_run(self):
        config = make_config(algorithm='MAX_MIN')
        result = MaxMinScheduler(config).run()
        validate_result(result, 10, 3)


# ── Edge cases ─────────────────────────────────────────
class TestEdgeCases:
    def test_single_task_single_vm(self):
        config = make_config(task_count=1, vm_count=1, algorithm='EDO')
        result = EDOOptimizer(config).run()
        validate_result(result, 1, 1)
        assert result['schedule'][0]['vmId'] == 0

    def test_many_tasks_few_vms(self):
        config = make_config(task_count=50, vm_count=2, algorithm='PSO')
        result = PSOOptimizer(config).run()
        validate_result(result, 50, 2)

    def test_few_tasks_many_vms(self):
        config = make_config(task_count=2, vm_count=10, algorithm='GA')
        result = GAOptimizer(config).run()
        validate_result(result, 2, 10)


if __name__ == '__main__':
    import pytest
    pytest.main([__file__, '-v'])
