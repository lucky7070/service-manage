import envConfig from "@/config/env";
import { io } from "socket.io-client";

export const socket = io(envConfig.socketUrl, { autoConnect: false });