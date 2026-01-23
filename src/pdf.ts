import puppeteer, { PDFOptions, Browser } from "puppeteer";

let browser: Browser | null = null;

async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--font-render-hinting=medium"
            ]
        });
    }
    return browser;
}

export async function htmlToPdf(
    html: string,
    pdfOptions: PDFOptions = {}
): Promise<Buffer> {
    const b = await getBrowser();
    const page = await b.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const bytes = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        ...pdfOptions
    });

    await page.close();
    return Buffer.from(bytes);
}

// allow a clean shutdown in dev/prod
export async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}
