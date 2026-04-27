const usuariosPorSocket = new Map();
const socketsPorUsuario = new Map();

let ioActual = null;

const establecerServidorSockets = (io) => {
  ioActual = io;
};

const registrarSocketUsuario = ({ socketId, username }) => {
  if (!socketId || !username) {
    return;
  }

  usuariosPorSocket.set(socketId, username);

  if (!socketsPorUsuario.has(username)) {
    socketsPorUsuario.set(username, new Set());
  }

  socketsPorUsuario.get(username).add(socketId);
};

const removerSocketUsuario = (socketId) => {
  const username = usuariosPorSocket.get(socketId);

  if (!username) {
    return;
  }

  usuariosPorSocket.delete(socketId);

  const socketsUsuario = socketsPorUsuario.get(username);

  if (!socketsUsuario) {
    return;
  }

  socketsUsuario.delete(socketId);

  if (socketsUsuario.size === 0) {
    socketsPorUsuario.delete(username);
  }
};

const emitirAUsuario = (username, evento, payload) => {
  if (!ioActual || !username) {
    return;
  }

  const socketsUsuario = socketsPorUsuario.get(username);

  if (!socketsUsuario || socketsUsuario.size === 0) {
    return;
  }

  socketsUsuario.forEach((socketId) => {
    ioActual.to(socketId).emit(evento, payload);
  });
};

const emitirALlamada = (callerUsername, calleeUsername, evento, payload) => {
  emitirAUsuario(callerUsername, evento, payload);
  if (calleeUsername !== callerUsername) {
    emitirAUsuario(calleeUsername, evento, payload);
  }
};

module.exports = {
  establecerServidorSockets,
  registrarSocketUsuario,
  removerSocketUsuario,
  emitirAUsuario,
  emitirALlamada
};