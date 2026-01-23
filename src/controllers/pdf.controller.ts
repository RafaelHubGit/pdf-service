import type { RequestHandler } from "express";
import { generatePdf, htmlToPdf } from "../services/pdf.service.js";
import type { PdfRequest } from "../validation/pdf.schema.js";

export const createPdf: RequestHandler = async (req, res, next) => {
    try {
        const { html, pdfOptions } = req.body as PdfRequest;
        // const pdf = await htmlToPdf(html, pdfOptions);
        const pdf = await generatePdf(html, pdfOptions);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'inline; filename="document.pdf"');
        res.send(pdf);
        res.json({
            ok: true,
            pdf: pdf
        });
    } catch (err) {
        next(err);
    }
};


export const createPdfBase64: RequestHandler = async (req, res, next) => {
    try {
        const { html, pdfOptions } = req.body as PdfRequest;
        // const pdf = await htmlToPdf(html, pdfOptions);
        const pdf = await generatePdf(html, pdfOptions);

        if (!pdf || !Buffer.isBuffer(pdf)) {
            throw new Error('Invalid PDF buffer received');
        }

        const base64 = pdf.toString("base64");
        res.json({ 
            ok: true,
            pdfBase64: base64 
        });
    } catch (err) {
        next(err);
    }
};