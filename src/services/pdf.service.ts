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
        // Desactivar animaciones CSS y transiciones para rapidez
        await page.emulateMediaType('screen');

        // Interceptar peticiones innecesarias
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'font'].includes(resourceType)) {
                req.continue();
            } else if (['stylesheet', 'document', 'script'].includes(resourceType)) {
                req.continue();
            } else {
                req.abort(); // Bloquea medios pesados o trackers
            }
        });

        // crisp canvas
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

        // Timeout de seguridad para evitar que peticiones pesadas cuelguen el servicio
        // await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.setContent(html, { waitUntil: "load", timeout: 60000 });

        // Esperar a que las fuentes estén listas (evita errores de layout)
        await page.evaluateHandle('document.fonts.ready');

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
            displayHeaderFooter: options.displayHeaderFooter ?? false,
            headerTemplate: options.headerTemplate ?? '<div></div>',
            footerTemplate: options.footerTemplate ?? '<div style="font-size:10px; margin: 0 auto;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
            margin: options.margin || {
                top: '20mm',    // Requerido para ver el header
                bottom: '20mm', // Requerido para ver el footer
                left: '10mm',
                right: '10mm'
            },
            ...options,
        });

        return Buffer.from(bytes);
    } catch (error) {
        throw error;
    } finally {
        await page.close(); // Garantiza el cierre incluso si hay error
    }

}