const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    originalUrl: String,
    compressedImage: Buffer,  // Store compressed image as binary
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema);
