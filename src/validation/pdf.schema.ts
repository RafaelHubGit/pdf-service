import { z } from "zod";
import { PaperFormats } from "../types/pdf.js";

const Units = ["mm", "cm", "in", "px"] as const;

export const PdfRequestSchema = z.object({
    html: z.string().min(1, "html is required"),
    pdfOptions: z.object({
        // format: z.enum(PaperFormats).optional(),
        format: z.string().optional(),
        unit: z.enum(Units).default("mm").optional(),
        width: z.union([z.string(), z.number()]).optional(),
        height: z.union([z.string(), z.number()]).optional(),
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
    }).optional()
    // .partial().superRefine(( data, ctx ) => {
    //     if (data.format && (data.width || data.height)) {
    //         ctx.addIssue({
    //             code: "custom",
    //             message: "No puedes especificar 'format' y dimensiones ('width'/'height') al mismo tiempo.",
    //             path: ["pdfOptions"],
    //         });
    //     }
    // }),
});
export type PdfRequest = z.infer<typeof PdfRequestSchema>;
