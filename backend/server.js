import app from "./src/app.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { config } from "./src/config/index.js";
import { connectDb } from "./src/libraries/db.js";

const start = async () => {
    await connectDb();
    const server = createServer(app);
    const io = new Server(server, { cors: { origin: config.frontendUrl } });
    app.locals.io = io;

    io.on("connection", (socket) => {
        socket.on("booking:join", (bookingId) => {
            socket.join(`booking:${bookingId}`);
        });
    });

    server.listen(config.port, () => {
        console.log(`Backend running on http://localhost:${config.port}`);
    });
};

start().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
});
