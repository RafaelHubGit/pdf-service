import { Router } from "express";
import { pdfRouter } from "./pdf.routes.js";

export const routes = Router();

routes.get("/health", (_req, res) => res.json({ ok: true }));
routes.use("/pdf", pdfRouter);
