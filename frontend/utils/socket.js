import { io } from 'socket.io-client';

let socketChat = null;
let socketBaseUrl = null;

export const obtenerSocketChat = (apiBaseUrl) => {
  if (!apiBaseUrl) {
    return null;
  }

  if (!socketChat || socketBaseUrl !== apiBaseUrl) {
    if (socketChat) {
      socketChat.disconnect();
    }

    socketBaseUrl = apiBaseUrl;
    socketChat = io(apiBaseUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });
  }

  return socketChat;
};