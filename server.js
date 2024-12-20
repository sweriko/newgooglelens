import express from 'express';
import dotenv from 'dotenv';
import PuppeteerController from './controllers/puppeteerController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const USER_DATA_DIR = process.env.USER_DATA_DIR || './puppeteer_data';

const puppeteerController = new PuppeteerController({ userDataDir: USER_DATA_DIR });

app.use(express.json());
app.use(express.static('public'));

// Initialize Puppeteer
puppeteerController.init().catch(error => {
    console.error('Failed to initialize Puppeteer:', error);
    process.exit(1);
});

// Endpoint to process image URL
app.post('/api/search-image', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ success: false, message: 'Image URL is required.' });
    }

    try {
        await puppeteerController.searchWithImage(imageUrl);
        return res.status(200).json({ success: true, message: 'Image search completed.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Shutdown Puppeteer on exit
process.on('SIGINT', async () => {
    await puppeteerController.close();
    process.exit(0);
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
