// src/utils/socket.js
import { io } from "socket.io-client";

let socket;

export const connectSocket = (token) => {
  socket = io("http://localhost:5003", {
    auth: { token },
  });
  return socket;
};

export const getSocket = () => socket;
