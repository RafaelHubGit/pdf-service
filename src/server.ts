import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { closeBrowser } from "./services/browser.js";

const app = createApp();
const server = app.listen(config.port, () => {
    console.log(`PDF service listening on :${config.port}`);
});

async function shutdown() {
    console.log("Shutting down...");
    await closeBrowser();
    server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
