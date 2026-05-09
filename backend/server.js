import app from "./src/app.js";
import { createServer } from "node:http";
import { config } from "./src/config/index.js";
import { connectDb } from "./src/libraries/db.js";
import { createSocket } from "./src/socket/index.js";

const start = async () => {
    await connectDb();
    const server = createServer(app);
    app.io = createSocket(server);

    server.listen(config.port, () => {
        console.log(`Backend running on http://localhost:${config.port}`);
    });
};

start().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
});
