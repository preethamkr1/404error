const mongoose = require('mongoose');

const hardwarePrintJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  tokenHash: { type: String, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // GridFS reference
  originalName: String,
  status: { type: String, enum: ['pending', 'printing', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Auto delete after 1 hour if left pending
});

module.exports = mongoose.model('HardwarePrintJob', hardwarePrintJobSchema);
