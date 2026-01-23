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
    } catch (err) {
        next(err);
    }
};
