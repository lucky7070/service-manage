import app from "./src/app.js";
import { createServer } from "node:http";
import { config } from "./src/config/index.js";
import { connectDb } from "./src/libraries/db.js";
import { createSocket } from "./src/socket/index.js";
import { initFirebase } from "./src/libraries/firebase.js";
import { startCronJobs } from "./src/cron/index.js";

const start = async () => {
    await connectDb();
    initFirebase();
    startCronJobs();
    const server = createServer(app);
    app.io = createSocket(server);

    server.listen(config.port, "0.0.0.0", () => {
        console.log(`Backend running on http://localhost:${config.port}`);
        console.log(`LAN access: use your IPv4 address on port ${config.port} for mobile devices`);
    });
};

start().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
});
