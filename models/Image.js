const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    originalUrl: String,
    compressedImage: Buffer,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema);
