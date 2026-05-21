import { Server } from "socket.io";
import { config } from "../config/index.js";

/** @type {Map<string, Map<string, Set<string>>>} */
const booking = new Map();

const room = (bookingId) => String("booking:" + bookingId).trim();

const ensure = (bookingId) => {
    if (!booking.has(bookingId)) {
        booking.set(bookingId, new Map([["customer", new Set()], ["provider", new Set()]]));
    }

    return booking.get(bookingId);
};

const add = (bookingId, role, socketId) => {
    const roles = ensure(bookingId);
    const set = roles.get(role);
    if (set) set.add(socketId);
}

const remove = (bookingId, role, socketId) => {
    const roles = booking.get(bookingId);
    if (!roles) return;

    const set = roles.get(role);
    if (set) set.delete(socketId);
    if (roles.get("customer").size === 0 && roles.get("provider").size === 0) {
        booking.delete(bookingId);
    }
}

const snapshot = (bookingId) => {
    const roles = booking.get(bookingId);
    if (!roles) return { customerOnline: false, providerOnline: false };

    return {
        customerOnline: roles.get("customer").size > 0,
        providerOnline: roles.get("provider").size > 0,
    };
};

export function createSocket(server) {

    const io = new Server(server, { cors: { origin: config.isDevelopment ? true : config.frontendUrl } });
    io.on("connection", (socket) => {
        socket.data.bookingPresence = [];

        socket.on("booking:join", (payload) => {
            const { bookingId, role } = payload;
            if (bookingId && role && ["customer", "provider"].includes(role)) {
                socket.join(room(bookingId));
                socket.data.bookingPresence.push({ bookingId, role });
                add(bookingId, role, socket.id);
                io.to(room(bookingId)).emit("booking:presence", snapshot(bookingId));
            }
        });

        socket.on("booking:leave", (bookingId) => {
            if (!bookingId) return;

            socket.leave(room(bookingId));
            const kept = [];
            for (const entry of socket.data.bookingPresence || []) {
                if (entry.bookingId === bookingId) {
                    io.to(room(bookingId)).emit("booking:typing", { role: entry.role, typing: false });
                    remove(bookingId, entry.role, socket.id);
                    io.to(room(bookingId)).emit("booking:presence", snapshot(bookingId));
                } else {
                    kept.push(entry);
                }
            }

            socket.data.bookingPresence = kept;
        });

        socket.on("booking:typing", (payload) => {
            const bookingId = payload?.bookingId;
            const typing = Boolean(payload?.typing);
            if (!bookingId) return;

            const entry = (socket.data.bookingPresence || []).find((e) => e.bookingId === bookingId);
            if (!entry) return;

            socket.to(room(bookingId)).emit("booking:typing", { role: entry.role, typing });
        });

        socket.on("disconnect", () => {
            for (const { bookingId, role } of socket.data.bookingPresence || []) {
                io.to(room(bookingId)).emit("booking:typing", { role, typing: false });
                remove(bookingId, role, socket.id);
                io.to(room(bookingId)).emit("booking:presence", snapshot(bookingId));
            }

            socket.data.bookingPresence = [];
        });
    });

    return io;
}
