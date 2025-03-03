const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const Image = require('../models/Image');

const router = express.Router();

router.post('/compress', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    try {
        // Fetch image from URL
        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer',
        });

        const originalImageBuffer = Buffer.from(response.data);

        // Compress image using sharp
        const compressedImageBuffer = await sharp(originalImageBuffer)
            .resize({ width: 800 })  // Resize (optional)
            .jpeg({ quality: 60 })   // Compress with 60% quality
            .toBuffer();

        // Save in MongoDB
        const imageDocument = new Image({
            originalUrl: imageUrl,
            compressedImage: compressedImageBuffer,
        });

        await imageDocument.save();

        res.json({
            message: 'Image compressed and saved successfully',
            imageId: imageDocument._id
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to process the image' });
    }
});

module.exports = router;
