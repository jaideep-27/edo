const mongoose = require('mongoose');

const convergencePointSchema = new mongoose.Schema(
  {
    iteration: { type: Number, required: true },
    fitness: { type: Number, required: true },
    makespan: { type: Number },
    energy: { type: Number },
  },
  { _id: false }
);

const paretoPointSchema = new mongoose.Schema(
  {
    makespan: { type: Number, required: true },
    energy: { type: Number, required: true },
    reliability: { type: Number, required: true },
  },
  { _id: false }
);

const scheduleEntrySchema = new mongoose.Schema(
  {
    taskId: { type: Number, required: true },
    vmId: { type: Number, required: true },
    startTime: { type: Number },
    endTime: { type: Number },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    experimentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Experiment',
      required: true,
      index: true,
    },
    makespan: { type: Number, required: true },
    energy: { type: Number, required: true },
    reliability: { type: Number, required: true },
    resourceUtilization: { type: Number },
    convergenceData: [convergencePointSchema],
    paretoPoints: [paretoPointSchema],
    schedule: [scheduleEntrySchema],
    rawLogs: { type: String },
    executionTime: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Result', resultSchema);
