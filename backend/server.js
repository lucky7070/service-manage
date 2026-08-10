import app from "./src/app.js";
import { createServer } from "node:http";
import { config } from "./src/config/index.js";
import { connectDb } from "./src/libraries/db.js";
import { createSocket } from "./src/socket/index.js";
import { initFirebase } from "./src/libraries/firebase.js";
import { startCronJobs } from "./src/cron/index.js";
import { getLocalIpAddress } from "./src/helpers/utils.js";

const start = async () => {
    await connectDb();
    initFirebase();
    startCronJobs();
    const server = createServer(app);
    app.io = createSocket(server);

    const ipAddress = await getLocalIpAddress('IPv4');
    server.listen(config.port, "0.0.0.0", () => {
        console.log(`Backend running on http://localhost:${config.port} or use the IPv4 address http://${ipAddress}:${config.port}`);
    });
};

start().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
});
