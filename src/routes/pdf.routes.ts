import { Router } from "express";
import { createPdf } from "../controllers/pdf.controller.js";
import { validate } from "../middleware/validate.js";
import { PdfRequestSchema } from "../validation/pdf.schema.js";

export const pdfRouter = Router();

pdfRouter.post("/", validate(PdfRequestSchema), createPdf);
