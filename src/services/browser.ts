import puppeteer, { Browser } from "puppeteer";

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
    if (!browser) {
        browser = await puppeteer.launch({
        headless: true,
        args: [
            // "--no-sandbox",
            // "--disable-setuid-sandbox",
            // "--disable-dev-shm-usage",
            // "--font-render-hinting=medium",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage", // Crucial para Docker/Linux con peticiones pesadas
            "--disable-gpu",
            "--disable-extensions",
            "--no-zygote",
        ],
        });
    }
    return browser;
}

export async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}
