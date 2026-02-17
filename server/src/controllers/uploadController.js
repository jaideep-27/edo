const csv = require('csv-parser');
const { Readable } = require('stream');
const experimentService = require('../services/experimentService');
const { WORKLOAD_PRESETS, VM_PRESETS } = require('../data/presets');

/**
 * POST /api/upload/workload
 * Accepts CSV or JSON file with task definitions.
 * CSV columns: size, cpu, memory
 */
const uploadWorkload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
    }

    const ext = req.file.originalname.toLowerCase();
    let tasks = [];

    if (ext.endsWith('.json')) {
      const raw = JSON.parse(req.file.buffer.toString());
      tasks = Array.isArray(raw) ? raw : raw.tasks || [];
    } else {
      // CSV
      tasks = await new Promise((resolve, reject) => {
        const rows = [];
        const stream = Readable.from(req.file.buffer.toString());
        stream
          .pipe(csv())
          .on('data', (row) => {
            rows.push({
              size: Number(row.size || row.length || 1000),
              cpu: Number(row.cpu || row.mips || 500),
              memory: Number(row.memory || row.ram || 256),
            });
          })
          .on('end', () => resolve(rows))
          .on('error', reject);
      });
    }

    if (tasks.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'File contains no tasks' } });
    }

    // Validate
    tasks = tasks.map((t) => ({
      size: Math.max(1, Number(t.size) || 1000),
      cpu: Math.max(1, Number(t.cpu) || 500),
      memory: Math.max(1, Number(t.memory) || 256),
    }));

    res.json({
      success: true,
      data: {
        taskCount: tasks.length,
        tasks,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/upload/vms
 * Accepts CSV or JSON file with VM definitions.
 * CSV columns: mips, ram, bw, storage
 */
const uploadVMs = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
    }

    const ext = req.file.originalname.toLowerCase();
    let vms = [];

    if (ext.endsWith('.json')) {
      const raw = JSON.parse(req.file.buffer.toString());
      vms = Array.isArray(raw) ? raw : raw.vms || [];
    } else {
      vms = await new Promise((resolve, reject) => {
        const rows = [];
        const stream = Readable.from(req.file.buffer.toString());
        stream
          .pipe(csv())
          .on('data', (row) => {
            rows.push({
              mips: Number(row.mips || 1000),
              ram: Number(row.ram || row.memory || 2048),
              bw: Number(row.bw || row.bandwidth || 1000),
              storage: Number(row.storage || 10000),
            });
          })
          .on('end', () => resolve(rows))
          .on('error', reject);
      });
    }

    if (vms.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'File contains no VMs' } });
    }

    vms = vms.map((v) => ({
      mips: Math.max(1, Number(v.mips) || 1000),
      ram: Math.max(1, Number(v.ram) || 2048),
      bw: Math.max(1, Number(v.bw) || 1000),
      storage: Math.max(1, Number(v.storage) || 10000),
    }));

    res.json({
      success: true,
      data: {
        vmCount: vms.length,
        vms,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/presets
 */
const getPresets = async (_req, res) => {
  res.json({
    success: true,
    data: {
      workloads: Object.values(WORKLOAD_PRESETS).map(({ tasks, ...rest }) => rest),
      vms: Object.values(VM_PRESETS).map(({ vms, ...rest }) => rest),
    },
  });
};

/**
 * GET /api/presets/workload/:presetId
 */
const getWorkloadPreset = async (req, res, next) => {
  try {
    const preset = WORKLOAD_PRESETS[req.params.presetId];
    if (!preset) {
      return res.status(404).json({ success: false, error: { message: 'Preset not found' } });
    }
    res.json({ success: true, data: preset });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/presets/vm/:presetId
 */
const getVMPreset = async (req, res, next) => {
  try {
    const preset = VM_PRESETS[req.params.presetId];
    if (!preset) {
      return res.status(404).json({ success: false, error: { message: 'Preset not found' } });
    }
    res.json({ success: true, data: preset });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/experiments/:id/clone
 */
const cloneExperiment = async (req, res, next) => {
  try {
    const original = await experimentService.getById(req.user._id, req.params.id);

    const cloned = await experimentService.create(req.user._id, {
      name: `${original.name} (copy)`,
      workloadConfig: original.workloadConfig,
      vmConfig: original.vmConfig,
      algorithm: original.algorithm,
      hyperparameters: original.hyperparameters,
      tags: [...(original.tags || []), 'cloned'],
      notes: original.notes || '',
    });

    res.status(201).json({
      success: true,
      data: { experiment: cloned },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadWorkload,
  uploadVMs,
  getPresets,
  getWorkloadPreset,
  getVMPreset,
  cloneExperiment,
};
