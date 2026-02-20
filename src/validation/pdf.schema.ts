import { z } from "zod";
import { PaperFormats } from "../types/pdf.js";

export const PdfRequestSchema = z.object({
    html: z.string().min(1, "html is required"),
    pdfOptions: z.object({
        format: z.enum(PaperFormats).optional(),
        landscape: z.boolean().optional(),
        printBackground: z.boolean().optional(),
        preferCSSPageSize: z.boolean().optional(),
        pageRanges: z.string().optional(),
        displayHeaderFooter: z.boolean().optional(),
        headerTemplate: z.string().optional(),
        footerTemplate: z.string().optional(),
        margin: z.object({
            top: z.union([z.string(), z.number()]).optional(),
            right: z.union([z.string(), z.number()]).optional(),
            bottom: z.union([z.string(), z.number()]).optional(),
            left: z.union([z.string(), z.number()]).optional(),
        }).partial().optional(),
    }).partial().optional(),
});
export type PdfRequest = z.infer<typeof PdfRequestSchema>;
