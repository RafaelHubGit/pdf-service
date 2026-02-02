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

    try {
        // crisp canvas
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

        // Timeout de seguridad para evitar que peticiones pesadas cuelguen el servicio
        await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 20000 });

        // 2. Ejecuta una detección rápida: ¿Este HTML realmente necesita esperar por charts?
        const needsCharts = await page.evaluate(() => {
            // Buscamos si el usuario incluyó la marca de que usará el flag
            return !!document.querySelector('[data-pdf-wait="charts"]');
        });

        if (needsCharts) {
            console.log("Esperando flag de charts...");
            await page.waitForFunction("window.__chartsReady === true", { 
                timeout: 10000 // Baja esto a 10s máximo.
            }).catch(() => console.log("WARN: Timeout charts."));
        } else {
            // 3. Si no necesita charts, espera solo a que las imágenes se carguen (opcional pero recomendado)
            // Esto es mucho más rápido que networkidle0
            await page.evaluate(async () => {
                const selectors = Array.from(document.querySelectorAll("img"));
                await Promise.all(selectors.map(img => {
                    if (img.complete) return;
                    return new Promise((resolve) => {
                        img.onload = img.onerror = resolve;
                    });
                }));
            }).catch(() => {});
        }

        const bytes = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            ...options,
        });

        return Buffer.from(bytes);
    
        // helpful logs
        // page.on("console", (m) => console.log("[console]", m.type(), m.text()));
        // page.on("pageerror", (e) => console.error("[pageerror]", e));
        // page.on("requestfailed", (r) =>
        //     console.error("[requestfailed]", r.url(), r.failure()?.errorText)
        // );
    
        // await page.setContent(html, { waitUntil: "domcontentloaded"});
    
        // await page
        //     .waitForFunction("window.__chartsReady === true")
        //     .catch(() => {});
    
        // const bytes = await page.pdf({
        //     format: "A4",
        //     printBackground: true,
        //     preferCSSPageSize: true,
        //     ...options,
        // });
    
        // await page.close();
        // return Buffer.from(bytes);
    } catch (error) {
        throw error;
    } finally {
        await page.close(); // Garantiza el cierre incluso si hay error
    }

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
