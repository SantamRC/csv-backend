const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const axios = require('axios');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const Image = require('../models/Image');
const Job = require('../models/Job');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-csv', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

    const jobId = uuidv4();
    const job = new Job({ jobId, status: 'in_progress', total: 0, completed: 0, errors: [] });
    await job.save();

    res.json({
        message: 'Upload started',
        jobId,
        progressUrl: `/api/images/progress/${jobId}`
    });

    processCsv(req.file.path, jobId);
});

router.get('/progress/:jobId', async (req, res) => {
    const job = await Job.findOne({ jobId: req.params.jobId });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const percentage = job.total > 0 ? Math.round((job.completed / job.total) * 100) : 0;
    res.json({ jobId: job.jobId, status: job.status, completed: job.completed, total: job.total, percentage, errors: job.errors });
});

async function processCsv(filePath, jobId) {
    const imageUrls = [];

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
            const urlsString = row[Object.keys(row)[2]];
            if (urlsString) {
                const urls = urlsString.split(',').map(url => url.trim());
                imageUrls.push(...urls);
            }
        })
        .on('end', async () => {
            await Job.updateOne({ jobId }, { $set: { total: imageUrls.length } });

            try {
                for (let i = 0; i < imageUrls.length; i++) {
                    try {
                        await processImage(imageUrls[i]);
                    } catch (error) {
                        console.error(`Failed to process ${imageUrls[i]}:`, error.message);
                        await Job.updateOne({ jobId }, { $push: { errors: { url: imageUrls[i], error: error.message } } });
                    }
                    await Job.updateOne({ jobId }, { $set: { completed: i + 1 } });
                }
                await Job.updateOne({ jobId }, { $set: { status: 'completed' } });
            } catch (err) {
                console.error('Error processing images:', err);
                await Job.updateOne({ jobId }, { $set: { status: 'failed' } });
            } finally {
                fs.unlinkSync(filePath);
            }
        });
}

async function processImage(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const originalImageBuffer = Buffer.from(response.data);

    const compressedImageBuffer = await sharp(originalImageBuffer)
        .resize({ width: 800 })
        .jpeg({ quality: 60 })
        .toBuffer();

    const image = new Image({ originalUrl: url, compressedImage: compressedImageBuffer });
    await image.save();
}

module.exports = router;