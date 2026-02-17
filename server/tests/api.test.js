/**
 * Basic API tests for EDO-Cloud server.
 * Run with: node server/tests/api.test.js
 *
 * Requires the server to be running on port 5001.
 */

const BASE = 'http://localhost:5001/api';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

let token = '';
let userId = '';
let experimentId = '';

async function run() {
  const results = [];
  const assert = (name, condition) => {
    results.push({ name, pass: !!condition });
    if (!condition) console.error(`  ✗ FAIL: ${name}`);
    else console.log(`  ✓ ${name}`);
  };

  console.log('\n── Health ──────────────────────────────');
  {
    const { status, data } = await request('GET', '/health');
    assert('Health check returns 200', status === 200);
    assert('Health status ok', data.data?.status === 'ok');
  }

  console.log('\n── Auth ────────────────────────────────');
  const email = `test-${Date.now()}@edo.test`;
  {
    const { status, data } = await request('POST', '/auth/register', {
      name: 'Test User',
      email,
      password: 'Password123!',
    });
    assert('Register returns 201', status === 201);
    assert('Register returns token', !!data.data?.token);
    token = data.data?.token;
    userId = data.data?.user?._id || data.data?.user?.id;
  }
  {
    const { status, data } = await request('POST', '/auth/login', {
      email,
      password: 'Password123!',
    });
    assert('Login returns 200', status === 200);
    assert('Login returns token', !!data.data?.token);
    token = data.data?.token;
  }
  {
    const { status, data } = await request('GET', '/auth/me', null, token);
    assert('Get current user returns 200', status === 200);
    assert('Returns user object', !!data.data?.user);
  }

  console.log('\n── Experiments ─────────────────────────');
  {
    const { status, data } = await request(
      'POST',
      '/experiments',
      {
        name: 'API Test Experiment',
        algorithm: 'EDO',
        workloadConfig: { taskCount: 5, tasks: [] },
        vmConfig: { vmCount: 2, vms: [] },
        hyperparameters: {
          populationSize: 10,
          maxIterations: 20,
          weights: { makespan: 0.4, energy: 0.3, reliability: 0.3 },
        },
      },
      token
    );
    assert('Create experiment returns 201', status === 201);
    assert('Returns experiment object', !!data.data?.experiment);
    experimentId = data.data?.experiment?._id;
  }
  {
    const { status, data } = await request('GET', '/experiments', null, token);
    assert('List experiments returns 200', status === 200);
    assert('Returns array', Array.isArray(data.data?.experiments));
  }
  {
    const { status, data } = await request('GET', `/experiments/${experimentId}`, null, token);
    assert('Get experiment by ID returns 200', status === 200);
    assert('Returns correct experiment', data.data?.experiment?._id === experimentId);
  }

  console.log('\n── Clone ───────────────────────────────');
  {
    const { status, data } = await request('POST', `/experiments/${experimentId}/clone`, null, token);
    assert('Clone returns 201', status === 201);
    assert('Clone has (copy) in name', data.data?.experiment?.name?.includes('(copy)'));
  }

  console.log('\n── Presets ─────────────────────────────');
  {
    const { status, data } = await request('GET', '/presets', null, token);
    assert('Presets returns 200', status === 200);
    assert('Has workload presets', data.data?.workloads?.length > 0);
    assert('Has VM presets', data.data?.vms?.length > 0);
  }

  console.log('\n── Suggest ─────────────────────────────');
  {
    const { status, data } = await request(
      'POST',
      '/suggest',
      {
        workloadConfig: { taskCount: 50, tasks: [] },
        vmConfig: { vmCount: 5, vms: [] },
      },
      token
    );
    assert('Suggest returns 200', status === 200);
    assert('Returns algorithm suggestion', !!data.data?.suggestion?.algorithm);
    assert('Returns reasoning', data.data?.suggestion?.reasoning?.length > 0);
  }

  console.log('\n── Cleanup ─────────────────────────────');
  {
    const { status } = await request('DELETE', `/experiments/${experimentId}`, null, token);
    assert('Delete experiment returns 200', status === 200);
  }

  // Summary
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n════════════════════════════════════════`);
  console.log(`  ${passed} passed, ${failed} failed out of ${results.length} tests`);
  console.log(`════════════════════════════════════════\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test suite failed:', err.message);
  process.exit(1);
});
