import puppeteer, { Browser } from "puppeteer";

let browser: Browser | null = null;
let pagesProcessed = 0;
const MAX_PAGES_BEFORE_RESTART = 100;

export async function getBrowser(): Promise<Browser> {

    // Si el navegador ya procesó demasiadas páginas, lo reiniciamos
    if (browser && pagesProcessed >= MAX_PAGES_BEFORE_RESTART) {
        console.log("♻️ Reiniciando navegador para liberar memoria...");
        await closeBrowser();
    }
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
        pagesProcessed = 0;
    }

    pagesProcessed++;
    return browser;
}

export async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}
