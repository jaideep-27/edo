const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    size: { type: Number, required: true },
    cpu: { type: Number, required: true },
    memory: { type: Number, required: true },
  },
  { _id: false }
);

const vmSchema = new mongoose.Schema(
  {
    mips: { type: Number, required: true },
    ram: { type: Number, required: true },
    bw: { type: Number, required: true },
    storage: { type: Number, default: 10000 },
  },
  { _id: false }
);

const experimentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Experiment name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    workloadConfig: {
      taskCount: { type: Number, required: true, min: 1 },
      tasks: [taskSchema],
      datasetFile: { type: String },
    },
    vmConfig: {
      vmCount: { type: Number, required: true, min: 1 },
      vms: [vmSchema],
    },
    algorithm: {
      type: String,
      enum: ['EDO', 'PSO', 'ACO', 'GA', 'WOA', 'ROUND_ROBIN', 'MIN_MIN', 'MAX_MIN'],
      required: [true, 'Algorithm is required'],
    },
    hyperparameters: {
      populationSize: { type: Number, default: 50, min: 5 },
      maxIterations: { type: Number, default: 100, min: 10 },
      seed: { type: Number },
      weights: {
        makespan: { type: Number, default: 0.4, min: 0, max: 1 },
        energy: { type: Number, default: 0.3, min: 0, max: 1 },
        reliability: { type: Number, default: 0.3, min: 0, max: 1 },
      },
    },
    status: {
      type: String,
      enum: ['draft', 'queued', 'running', 'completed', 'failed'],
      default: 'draft',
      index: true,
    },
    startedAt: { type: Date, default: null },
    tags: [{ type: String, trim: true }],
    notes: { type: String, maxlength: 2000 },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
experimentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Experiment', experimentSchema);
