const sesionesLlamada = new Map();

const crearIdSesion = () => `call_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const limpiarSesionesExpiradas = () => {
  const ahora = Date.now();

  sesionesLlamada.forEach((sesion, id) => {
    const expirada = ahora - sesion.updatedAt > 1000 * 60 * 30;
    const finalizada = ['ended', 'rejected', 'missed'].includes(sesion.status) && ahora - sesion.updatedAt > 1000 * 45;

    if (expirada || finalizada) {
      sesionesLlamada.delete(id);
    }
  });
};

const crearSesion = ({ caller, callee, type, offer }) => {
  limpiarSesionesExpiradas();

  const id = crearIdSesion();
  const sesion = {
    id,
    type,
    status: 'ringing',
    callerId: String(caller.id),
    callerUsername: caller.username,
    callerName: caller.name,
    calleeId: String(callee.id),
    calleeUsername: callee.username,
    calleeName: callee.name,
    offer,
    answer: null,
    callerCandidates: [],
    calleeCandidates: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  sesionesLlamada.set(id, sesion);
  return sesion;
};

const obtenerSesion = (id) => {
  limpiarSesionesExpiradas();
  return sesionesLlamada.get(id) || null;
};

const obtenerLlamadaPendiente = ({ username, peerId }) => {
  limpiarSesionesExpiradas();

  for (const sesion of sesionesLlamada.values()) {
    const coincideReceptor = sesion.calleeUsername === username;
    const coincideChat = !peerId || sesion.callerId === String(peerId);

    if (coincideReceptor && coincideChat && sesion.status === 'ringing') {
      return sesion;
    }
  }

  return null;
};

const actualizarSesion = (id, cambios) => {
  const sesion = sesionesLlamada.get(id);

  if (!sesion) {
    return null;
  }

  Object.assign(sesion, cambios, { updatedAt: Date.now() });
  return sesion;
};

const agregarCandidate = (id, role, candidate) => {
  const sesion = sesionesLlamada.get(id);

  if (!sesion) {
    return null;
  }

  if (role === 'caller') {
    sesion.callerCandidates.push(candidate);
  } else {
    sesion.calleeCandidates.push(candidate);
  }

  sesion.updatedAt = Date.now();
  return sesion;
};

module.exports = {
  crearSesion,
  obtenerSesion,
  obtenerLlamadaPendiente,
  actualizarSesion,
  agregarCandidate
};