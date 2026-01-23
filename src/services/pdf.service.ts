import type { PDFOptions } from "puppeteer";
import PQueue from "p-queue";
import { getBrowser } from "./browser.js";


export const pdfQueue = new PQueue({ concurrency: Number(process.env.MAX_CONCURRENCY ?? 4) });

export async function generatePdf(html: string, options: PDFOptions = {}) {
    return pdfQueue.add(() => htmlToPdf(html, options));
}

export async function htmlToPdf(
    html: string,
    options: PDFOptions = {}
): Promise<Buffer> {
    const b = await getBrowser();
    const page = await b.newPage();

    // crisp canvas
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

    // helpful logs
    page.on("console", (m) => console.log("[console]", m.type(), m.text()));
    page.on("pageerror", (e) => console.error("[pageerror]", e));
    page.on("requestfailed", (r) =>
        console.error("[requestfailed]", r.url(), r.failure()?.errorText)
    );

    // load the HTML you send (with your own <script src="...">)
    // await page.setContent(html, { waitUntil: "load", timeout: 60_000 });
    await page.setContent(html, { waitUntil: "domcontentloaded"});

    // OPTIONAL: wait for a known chart canvas if you always use one id
    // await page.waitForSelector("#kpiChart", { timeout: 15_000 }).catch(() => {});

    // REQUIRED: wait for YOUR ready flag (set it in your HTML after charts render)
    // await page
    //     .waitForFunction("window.__chartsReady === true", { timeout: 220_000 })
    //     .catch(() => {});
    await page
        .waitForFunction("window.__chartsReady === true")
        .catch(() => {});

    const bytes = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        ...options,
    });

    await page.close();
    return Buffer.from(bytes);
}

// export async function htmlToPdf(
//     html: string,
//     options: PDFOptions = {}
// ): Promise<Buffer> {
//     const b = await getBrowser();
//     const page = await b.newPage();

//     // crisp canvas rendering
//     await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

//     page.on("console", (msg) => console.log("[console]", msg.type(), msg.text()));
//     page.on("pageerror", (err) => console.error("[pageerror]", err));
//     page.on("requestfailed", req => console.error("[requestfailed]", req.url(), req.failure()?.errorText));


//     // generous timeouts
//     page.setDefaultTimeout(60_000);
//     page.setDefaultNavigationTimeout(60_000);


//     // Use "load" instead of "networkidle0" to avoid hanging on CDN connections
//     await page.setContent(html, { waitUntil: "load", timeout: 60_000 });

//     // Wait for your chart canvas to exist
//     await page.waitForSelector("#kpiChart", { timeout: 15_000 }).catch(() => {});

//     // Wait for web fonts (so chart measures text correctly)
//     await page.evaluate(() => (document as any).fonts?.ready ?? Promise.resolve());
//     await page.waitForFunction("document.fonts ? document.fonts.status === 'loaded' : true", { timeout: 10_000 }).catch(() => {});

//     // If your HTML sets window.__chartsReady = true when Chart finishes:
//     await page.waitForFunction("window.__chartsReady === true", { timeout: 10_000 }).catch(() => {});

//     const bytes = await page.pdf({
//         format: "A4",
//         printBackground: true,
//         preferCSSPageSize: true,
//         ...options,
//     });

//     await page.close();
//     return Buffer.from(bytes);
// }
