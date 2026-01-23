import express from "express";
import { routes } from "./routes/index.js";
import { errorHandler } from "./middleware/error.js";
import { notFound } from "./middleware/notFound.js";

export function createApp() {
    const app = express();
    app.use(express.json({ limit: "5mb" }));

    app.use("/assets", express.static("public"));
    app.use("/", express.static("public"));

    app.use(routes);
    app.use(notFound);
    app.use(errorHandler);

    return app;
}
