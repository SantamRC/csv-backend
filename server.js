const express = require('express');
const mongoose = require('mongoose');
const imageRoutes = require('./routes/imageRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/imageUploadDB');

// Serve static files from public folder
app.use(express.static('public'));

// API routes
app.use('/api/images', imageRoutes);

// Serve upload form at root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
