const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/imageDB');

app.use('/api/images', imageRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
