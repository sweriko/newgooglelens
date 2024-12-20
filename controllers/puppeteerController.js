import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

class PuppeteerController {
    constructor(options) {
        this.userDataDir = options.userDataDir;
        this.browser = null;
        this.page = null;
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--start-maximized',
            ],
            userDataDir: this.userDataDir,
        });

        // Grant clipboard permissions
        const context = this.browser.defaultBrowserContext();
        await context.overridePermissions('https://lens.google.com', [
            'clipboard-read',
            'clipboard-write',
            'clipboard-sanitized-write',
        ]);

        const pages = await this.browser.pages();
        this.page = pages.length > 0 ? pages[0] : await this.browser.newPage();
        await this.page.setViewport({ width: 1920, height: 1080 });
        console.log('Puppeteer initialized.');
    }

    async searchWithImage(imageUrl) {
        try {
            console.log(`Processing image URL: ${imageUrl}`);
    
            // Open the image URL in a new tab
            const imagePage = await this.browser.newPage();
            await imagePage.goto(imageUrl, { waitUntil: 'networkidle2' });
    
            // Click anywhere on the page to ensure focus
            await imagePage.click('body');
    
            // Simulate `Ctrl+C` to copy the image to the clipboard
            await imagePage.keyboard.down('Control');
            await imagePage.keyboard.press('C');
            await imagePage.keyboard.up('Control');
    
            console.log('Image successfully copied to clipboard using Ctrl+C.');
    
            await imagePage.close();
    
            // Open Google Lens and paste the image
            await this.page.goto('https://lens.google.com/search?p', { waitUntil: 'networkidle2' });
    
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            await this.page.click('body'); // Click anywhere on the page
            await this.page.keyboard.down('Control');
            await this.page.keyboard.press('V');
            await this.page.keyboard.up('Control');
    
            console.log('Image pasted into Google Lens.');
        } catch (error) {
            console.error('Error during image search:', error);
            throw error;
        }
    }
    

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('Browser closed.');
        }
    }
}

export default PuppeteerController;
