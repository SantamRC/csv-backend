const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    jobId: { type: String, required: true, unique: true },
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    status: { type: String, enum: ['in_progress', 'completed', 'failed'], default: 'in_progress' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);
