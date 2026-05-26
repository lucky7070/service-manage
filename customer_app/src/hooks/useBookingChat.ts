import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { fetchBookingMessages, sendBookingMessage, type ChatMessage } from "../api";
import type { BookingPresenceSnapshot, BookingTypingPayload } from "../api/types";
import env from "../config/env";

let bookingSocket: Socket | null = null;

function getBookingSocket() {
    if (!bookingSocket) {
        bookingSocket = io(env.socketUrl, {
            autoConnect: false,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 8,
            reconnectionDelay: 1000,
        });
    }
    return bookingSocket;
}

type UseBookingChatOptions = {
    bookingId: string;
    enabled?: boolean;
};

export function useBookingChat({ bookingId, enabled = true }: UseBookingChatOptions) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [connected, setConnected] = useState(false);
    const [providerOnline, setProviderOnline] = useState(false);
    const [providerTyping, setProviderTyping] = useState(false);
    const typingIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadMessages = useCallback(async () => {
        const response = await fetchBookingMessages(bookingId);
        if (response.status && Array.isArray(response.data)) {
            setMessages(response.data);
        }

        setLoading(false);
    }, [bookingId]);

    const emitTyping = useCallback((typing: boolean) => {
        if (!bookingId) return;
        getBookingSocket().emit("booking:typing", { bookingId, typing });
    }, [bookingId]);

    const clearTypingTimers = useCallback(() => {
        if (typingIdleRef.current) {
            clearTimeout(typingIdleRef.current);
            typingIdleRef.current = null;
        }
    }, []);

    const stopTyping = useCallback(() => {
        clearTypingTimers();
        emitTyping(false);
    }, [clearTypingTimers, emitTyping]);

    const onTextChange = useCallback((value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            stopTyping();
            return;
        }
        emitTyping(true);
        clearTypingTimers();
        typingIdleRef.current = setTimeout(() => {
            typingIdleRef.current = null;
            emitTyping(false);
        }, 1600);
    }, [clearTypingTimers, emitTyping, stopTyping]);

    useEffect(() => {
        if (!bookingId) return;
        void loadMessages();
    }, [bookingId, loadMessages]);

    useEffect(() => {
        if (!enabled || !bookingId) return;

        const socket = getBookingSocket();

        const onConnect = () => {
            setConnected(true);
            socket.emit("booking:join", { bookingId, role: "customer" });
        };
        const onDisconnect = () => setConnected(false);

        const onMessage = (next: ChatMessage) => {
            if (!next?._id) return;
            if (next.senderType === "provider") setProviderTyping(false);
            setMessages((prev) => (prev.some((row) => row._id === next._id) ? prev : [...prev, next]));
        };

        const onPresence = (snap: BookingPresenceSnapshot) => {
            setProviderOnline(Boolean(snap?.providerOnline));
        };

        const onPeerTyping = (payload: BookingTypingPayload) => {
            if (payload?.role === "provider") setProviderTyping(Boolean(payload.typing));
        };

        if (!socket.connected) socket.connect();
        else socket.emit("booking:join", { bookingId, role: "customer" });

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("booking:message", onMessage);
        socket.on("booking:presence", onPresence);
        socket.on("booking:typing", onPeerTyping);

        setConnected(socket.connected);

        return () => {
            stopTyping();
            socket.emit("booking:leave", bookingId);
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("booking:message", onMessage);
            socket.off("booking:presence", onPresence);
            socket.off("booking:typing", onPeerTyping);
            clearTypingTimers();
            setProviderOnline(false);
            setProviderTyping(false);
        };
    }, [bookingId, enabled, stopTyping, clearTypingTimers]);

    const send = useCallback(async (payload: { message?: string; imageUri?: string }) => {
        if (!enabled) return { ok: false as const, message: "Chat is closed." };

        const trimmed = payload.message?.trim() || "";
        if (!trimmed && !payload.imageUri) return { ok: false as const, message: "Empty message." };

        stopTyping();
        setSending(true);
        try {
            const response = await sendBookingMessage(bookingId, {
                message: trimmed || undefined,
                imageUri: payload.imageUri,
            });
            
            if (response.status && response.data) {
                setMessages((prev) => (prev.some((row) => row._id === response.data._id) ? prev : [...prev, response.data]));
                return { ok: true as const };
            }
            return { ok: false as const, message: response.message || "Could not send message." };
        } finally {
            setSending(false);
        }
    }, [bookingId, enabled, stopTyping]);

    return { messages, loading, sending, connected, providerOnline, providerTyping, onTextChange, stopTyping, send, reload: loadMessages };
}
