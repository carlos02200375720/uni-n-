import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, ShoppingBag, Edit3, LogOut, Eye, EyeOff, User, X, Play } from 'lucide-react';
import { resolveApiBaseUrl } from '../utils/api';

// ─── Utilidad fuera del componente ───────────────────────────────────────────
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], filename, { type: mime });
}

// ─── Componente principal ─────────────────────────────────────────────────────
function PaginaPerfil({
  usuarioInicial,
  requiereRegistroInicial,
  productosConMeGusta = [],
  onRegistroExitoso,
  onInicioSesionExitoso,
  onCerrarSesion,
  cerrarSesion,
  setSeccionActual,
  manejarArchivoPerfilGeneral,
}) {
  const { username: usernameUrl } = useParams();
  const navigate = useNavigate();
  const esMiPropioPerfil = !usernameUrl || (usuarioInicial && usuarioInicial.username === usernameUrl);
  const usernameABuscar = usernameUrl || usuarioInicial?.username;

  const apiBaseUrl = resolveApiBaseUrl();

  // ── Estados principales ───────────────────────────────────────────────────
  const [usuario, setUsuario] = useState(usuarioInicial || null);
  const [pestanaActiva, setPestanaActiva] = useState('publicaciones');
  const [subpestanaGuardados, setSubpestanaGuardados] = useState('productos');
  const [estaEditando, setEstaEditando] = useState(false);

  // ── Estados de perfil y carga ─────────────────────────────────────────────
  const inputPublicacionRef = useRef(null);
  const [subiendoPost, setSubiendoPost] = useState(false);
  const [resumenPerfil, setResumenPerfil] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // ── Estados de autenticación ──────────────────────────────────────────────
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [modoAutenticacion, setModoAutenticacion] = useState('login');
  const [registroEnCurso, setRegistroEnCurso] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [formularioRegistro, setFormularioRegistro] = useState({
    nombre: '',
    username: '',
    email: '',
    password: '',
    bio: '',
  });

  // ── Estados de edición de perfil ──────────────────────────────────────────
  const [formularioPerfil, setFormularioPerfil] = useState({ nombre: '', bio: '', foto: '' });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [procesandoFoto, setProcesandoFoto] = useState(false);
  const [progresoFoto, setProgresoFoto] = useState(0);
  const [errorPerfil, setErrorPerfil] = useState('');
  const [mensajeFotoLista, setMensajeFotoLista] = useState('');
  const [notificacionPost, setNotificacionPost] = useState('');

  // ── Derivados ─────────────────────────────────────────────────────────────
  const guardadosCount = Number(resumenPerfil?.totalGuardados ?? productosConMeGusta.length ?? 0);
  const publicacionesRecientes = Array.isArray(resumenPerfil?.publicacionesRecientes)
    ? resumenPerfil.publicacionesRecientes
    : [];
  const pedidosRecientes = Array.isArray(resumenPerfil?.pedidosRecientes)
    ? resumenPerfil.pedidosRecientes
    : [];

  // ── Efectos ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setMostrarRegistro(requiereRegistroInicial);
  }, [requiereRegistroInicial]);

  useEffect(() => {
    if (requiereRegistroInicial) setModoAutenticacion('registro');
  }, [requiereRegistroInicial]);

  useEffect(() => {
    if (mostrarRegistro) {
      setCargandoPerfil(false);
      return;
    }
    if (esMiPropioPerfil && (!usuarioInicial || usuarioInicial.username === 'visitante')) {
      setMostrarRegistro(true);
      setCargandoPerfil(false);
      return;
    }

    let activo = true;
    const cargarPerfil = async () => {
      try {
        const respuesta = await fetch(
          `${apiBaseUrl}/api/usuario/perfil/${encodeURIComponent(usernameABuscar)}`
        );
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status} al cargar perfil`);
        const datos = await leerJsonSeguro(respuesta);
        if (activo) {
          setResumenPerfil(datos);
          setUsuario(datos);
        }
      } catch (error) {
        console.error('No se pudo cargar el perfil desde la API.', error);
        setErrorRegistro(normalizarErrorApi(error, 'No se pudo cargar el perfil.'));
      } finally {
        if (activo) setCargandoPerfil(false);
      }
    };
    cargarPerfil();
    return () => { activo = false; };
  }, [apiBaseUrl, mostrarRegistro, usernameABuscar, esMiPropioPerfil, usuarioInicial?.username]);

  useEffect(() => {
    setFormularioPerfil({
      nombre: usuario?.nombre || '',
      bio: usuario?.bio || '',
      foto: usuario?.foto || '',
    });
  }, [usuario?.nombre, usuario?.bio, usuario?.foto]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const leerJsonSeguro = async (respuesta) => {
    const contenido = await respuesta.text();
    const tipoContenido = (respuesta.headers.get('content-type') || '').toLowerCase();
    if (!contenido.trim()) return {};
    if (tipoContenido.includes('text/html') || contenido.trim().startsWith('<')) {
      throw new Error('El servidor devolvió una página HTML. Verifica que el backend esté encendido en el puerto 5000.');
    }
    try {
      return JSON.parse(contenido);
    } catch {
      throw new Error('La respuesta del servidor no llegó en formato JSON válido.');
    }
  };

  const normalizarErrorApi = (error, mensajeBase) => {
    if (error instanceof TypeError)
      return 'No se pudo conectar con el backend. Verifica que el servidor esté encendido en el puerto 5000.';
    return error?.message || mensajeBase;
  };

  const formatearCantidad = (valor) => {
    if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`;
    if (valor >= 1_000) return `${(valor / 1_000).toFixed(1)}k`;
    return String(valor || 0);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Reciente';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return 'Reciente';
    return d.toLocaleDateString('es-DO', { day: '2-digit', month: 'short' });
  };

  // ── Navegación ────────────────────────────────────────────────────────────
  const navegarA = (ruta) => {
    if (typeof setSeccionActual === 'function') {
      setSeccionActual(ruta);
    } else {
      console.log(`Navegando a la sección: ${ruta}`);
    }
  };

  // ── Autenticación ─────────────────────────────────────────────────────────
  const manejarCambioRegistro = (e) => {
    const { name, value } = e.target;
    setFormularioRegistro((prev) => ({ ...prev, [name]: value }));
  };

  const registrarUsuario = async (e) => {
    e.preventDefault();
    if (
      !formularioRegistro.nombre.trim() ||
      !formularioRegistro.username.trim() ||
      !formularioRegistro.email.trim() ||
      !formularioRegistro.password.trim()
    ) {
      setErrorRegistro('Completa nombre, usuario, correo y contraseña.');
      return;
    }
    setRegistroEnCurso(true);
    setErrorRegistro('');
    try {
      const respuesta = await fetch(`${apiBaseUrl}/api/usuario/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formularioRegistro.nombre,
          username: formularioRegistro.username,
          email: formularioRegistro.email,
          password: formularioRegistro.password,
          bio: formularioRegistro.bio,
        }),
      });
      const datos = await leerJsonSeguro(respuesta);
      if (!respuesta.ok) throw new Error(datos.mensaje || `Error ${respuesta.status} al registrar usuario`);
      if (typeof onRegistroExitoso === 'function') onRegistroExitoso(datos.usuario);
      setUsuario(datos.usuario);
      setResumenPerfil({
        ...datos.usuario,
        publicacionesRecientes: [],
        pedidosRecientes: [],
        totalCompras: 0,
        totalGuardados: 0,
        publicacionesCount: 0,
        likesTotales: 0,
        seguidores: 0,
        siguiendo: 0,
      });
      setMostrarRegistro(false);
    } catch (error) {
      console.error('No se pudo registrar el usuario.', error);
      setErrorRegistro(normalizarErrorApi(error, 'No se pudo registrar el usuario.'));
    } finally {
      setRegistroEnCurso(false);
    }
  };

  const iniciarSesionUsuario = async (e) => {
    e.preventDefault();
    if (!formularioRegistro.username.trim() || !formularioRegistro.password.trim()) {
      setErrorRegistro('Completa usuario y contraseña para iniciar sesión.');
      return;
    }
    setRegistroEnCurso(true);
    setErrorRegistro('');
    try {
      const respuestaLogin = await fetch(`${apiBaseUrl}/api/usuario/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formularioRegistro.username,
          password: formularioRegistro.password,
        }),
      });
      const datosLogin = await leerJsonSeguro(respuestaLogin);
      if (!respuestaLogin.ok)
        throw new Error(datosLogin.mensaje || `Error ${respuestaLogin.status} al iniciar sesión`);

      const respuestaPerfil = await fetch(
        `${apiBaseUrl}/api/usuario/perfil/${encodeURIComponent(datosLogin.usuario.username)}`
      );
      const datosPerfil = await leerJsonSeguro(respuestaPerfil);
      if (!respuestaPerfil.ok)
        throw new Error(datosPerfil.mensaje || `Error ${respuestaPerfil.status} al cargar el perfil`);

      if (typeof onInicioSesionExitoso === 'function') onInicioSesionExitoso(datosPerfil);
      setUsuario(datosPerfil);
      setResumenPerfil(datosPerfil);
      setMostrarRegistro(false);
    } catch (error) {
      console.error('No se pudo iniciar sesión.', error);
      setErrorRegistro(normalizarErrorApi(error, 'No se pudo iniciar sesión.'));
    } finally {
      setRegistroEnCurso(false);
    }
  };

  // ── Edición de perfil ─────────────────────────────────────────────────────
  const abrirEditorPerfil = () => {
    setErrorPerfil('');
    setMensajeFotoLista('');
    setProcesandoFoto(false);
    setProgresoFoto(0);
    setFormularioPerfil({
      nombre: usuario?.nombre || '',
      bio: usuario?.bio || '',
      foto: usuario?.foto || '',
    });
    setEstaEditando(true);
  };

  const cerrarEditorPerfil = () => {
    if (guardandoPerfil || procesandoFoto) return;
    setErrorPerfil('');
    setMensajeFotoLista('');
    setProcesandoFoto(false);
    setProgresoFoto(0);
    setEstaEditando(false);
  };

  const manejarSeleccionPost = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendoPost(true);
    setErrorPerfil('');

    try {
      // 1. Preparar el archivo para el backend
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('username', usuario?.username);

      // 2. Subida al backend (que procesará hacia Cloudinary)
      // Nota: Usamos la ruta que mencionas que pasa por el backend
      const respuestaSubida = await fetch(`${apiBaseUrl}/api/social/subir`, {
        method: 'POST',
        body: formData,
        // No enviamos Content-Type manual para que el navegador configure el boundary del FormData
      });

      const resultado = await respuestaSubida.json();

      if (!respuestaSubida.ok) {
        throw new Error(resultado.mensaje || 'Error al subir la publicación');
      }

      // 3. Éxito: Limpiar y refrescar datos
      setNotificacionPost('¡Publicación creada con éxito!');
      setTimeout(() => setNotificacionPost(''), 3500);
      
      // Opcional: Recargar los datos del perfil para ver la nueva publicación
      const respPerfil = await fetch(`${apiBaseUrl}/api/usuario/perfil/${encodeURIComponent(usuario.username)}`);
      if (respPerfil.ok) {
        const nuevosDatos = await respPerfil.json();
        setResumenPerfil(nuevosDatos);
      }

    } catch (error) {
      console.error('Error al crear publicación:', error);
      setNotificacionPost(`Error: ${error.message}`);
      setTimeout(() => setNotificacionPost(''), 4000);
    } finally {
      setSubiendoPost(false);
    }
  };

  const manejarEliminarPublicacion = async (idPublicacion) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return;

    try {
      const respuesta = await fetch(`${apiBaseUrl}/api/social/${idPublicacion}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usuario.username }),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.mensaje || 'Error al eliminar');

      setNotificacionPost('Publicación eliminada correctamente');
      setTimeout(() => setNotificacionPost(''), 3000);
      
      // Recargar los datos del perfil para reflejar el cambio
      const respPerfil = await fetch(`${apiBaseUrl}/api/usuario/perfil/${encodeURIComponent(usuario.username)}`);
      if (respPerfil.ok) {
        const nuevosDatos = await respPerfil.json();
        setResumenPerfil(nuevosDatos);
      }

    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      alert(error.message);
    }
  };

  const manejarCambioPerfil = (e) => {
    const { name, value } = e.target;
    setFormularioPerfil((prev) => ({ ...prev, [name]: value }));
  };

  const recortarImagenPerfil = (dataUrl) =>
    new Promise((resolve, reject) => {
      const imagen = new Image();
      imagen.onload = () => {
        setProgresoFoto(72);
        const lado = Math.min(imagen.width, imagen.height);
        const origenX = Math.max(0, (imagen.width - lado) / 2);
        const origenY = Math.max(0, (imagen.height - lado) / 2);
        const canvas = document.createElement('canvas');
        const tamanoSalida = 420;
        canvas.width = tamanoSalida;
        canvas.height = tamanoSalida;
        const contexto = canvas.getContext('2d');
        if (!contexto) {
          reject(new Error('No se pudo preparar el recorte de la imagen.'));
          return;
        }
        contexto.drawImage(imagen, origenX, origenY, lado, lado, 0, 0, canvas.width, canvas.height);
        setProgresoFoto(100);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      imagen.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
      imagen.src = dataUrl;
    });

  const manejarArchivoPerfil = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setErrorPerfil('');
    setMensajeFotoLista('');
    setProcesandoFoto(true);
    setProgresoFoto(8);
    const lector = new FileReader();
    lector.onprogress = (evento) => {
      if (!evento.lengthComputable) return;
      setProgresoFoto(Math.max(10, Math.round((evento.loaded / evento.total) * 50)));
    };
    lector.onload = async () => {
      if (typeof lector.result !== 'string') {
        setProcesandoFoto(false);
        setProgresoFoto(0);
        return;
      }
      try {
        setProgresoFoto((v) => Math.max(v, 58));
        const fotoRecortada = await recortarImagenPerfil(lector.result);
        setFormularioPerfil((prev) => ({ ...prev, foto: fotoRecortada }));
        setMensajeFotoLista('Foto lista');
        setTimeout(() => { setProcesandoFoto(false); setProgresoFoto(0); }, 250);
        setTimeout(() => setMensajeFotoLista(''), 2200);
      } catch (error) {
        console.error('No se pudo recortar la foto del perfil.', error);
        setErrorPerfil(error.message || 'No se pudo preparar la foto seleccionada.');
        setMensajeFotoLista('');
        setProcesandoFoto(false);
        setProgresoFoto(0);
      }
    };
    lector.onerror = () => {
      setErrorPerfil('No se pudo leer la foto seleccionada.');
      setMensajeFotoLista('');
      setProcesandoFoto(false);
      setProgresoFoto(0);
    };
    lector.readAsDataURL(archivo);
  };

  const enviarPerfil = async (e) => {
    e.preventDefault();
    const nombre = String(formularioPerfil.nombre || '').trim();
    const bio = String(formularioPerfil.bio || '').trim();
    let foto = String(formularioPerfil.foto || '').trim();

    if (!nombre || !bio) {
      setErrorPerfil('Completa nombre y biografía antes de guardar.');
      return;
    }
    setGuardandoPerfil(true);
    setErrorPerfil('');
    try {
      if (foto.startsWith('data:image/')) {
        const formData = new FormData();
        formData.append('archivo', dataURLtoFile(foto, 'foto_perfil.png'));
        const idUsuario = usuario?.username || usuarioInicial?.username || 'visitante';
        const respuesta = await fetch(
          `${apiBaseUrl}/api/usuario/subir-archivo-perfil/${encodeURIComponent(idUsuario)}`,
          { method: 'POST', body: formData }
        );
        const data = await respuesta.json();
        if (!respuesta.ok || !data.url) throw new Error(data.mensaje || 'Error al subir archivo');
        foto = data.url;
      }
      const respuesta = await fetch(
        `${apiBaseUrl}/api/usuario/actualizar/${encodeURIComponent(usuario.username)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, bio, foto }),
        }
      );
      const datos = await leerJsonSeguro(respuesta);
      if (!respuesta.ok) throw new Error(datos.mensaje || `Error ${respuesta.status} al guardar perfil`);
      const usuarioActualizado = datos.usuario || { nombre, bio, foto };
      setUsuario((prev) => ({ ...prev, ...usuarioActualizado }));
      setResumenPerfil((prev) => ({ ...(prev || {}), ...usuarioActualizado }));
      setEstaEditando(false);
    } catch (error) {
      console.error('No se pudo guardar el perfil.', error);
      setErrorPerfil(normalizarErrorApi(error, 'No se pudo guardar el perfil.'));
    } finally {
      setGuardandoPerfil(false);
    }
  };

  // ── Cerrar sesión ─────────────────────────────────────────────────────────
  const ejecutarCerrarSesion = () => {
    if (typeof cerrarSesion === 'function') cerrarSesion();
    setMostrarRegistro(true);
    setModoAutenticacion('login');
    setResumenPerfil(null);
    setFormularioRegistro({ nombre: '', username: '', email: '', password: '', bio: '' });
    if (typeof onCerrarSesion === 'function') onCerrarSesion();
  };

  // ── Render: pantalla de autenticación ─────────────────────────────────────
  if (mostrarRegistro) {
    return (
      <div className="min-h-screen bg-white px-5 pt-8 pb-28 animate-in fade-in duration-500 text-left">
        <div className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-700 px-5 py-5 text-white shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Perfil</p>
          <h1 className="mt-3 text-2xl font-black leading-tight">
            {modoAutenticacion === 'registro'
              ? 'Crea tu cuenta para entrar al perfil'
              : 'Inicia sesión para entrar al perfil'}
          </h1>
          <p className="mt-2 text-sm text-white/75">
            {modoAutenticacion === 'registro'
              ? 'Regístrate para guardar tus compras, actividad y publicaciones en tu cuenta.'
              : 'Tu sesión se mantendrá activa hasta que hagas clic en cerrar sesión.'}
          </p>
        </div>

        <div className="mt-4 flex rounded-[22px] bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => { setModoAutenticacion('registro'); setErrorRegistro(''); }}
            className={`flex-1 rounded-[18px] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition-all ${
              modoAutenticacion === 'registro' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Registro
          </button>
          <button
            type="button"
            onClick={() => { setModoAutenticacion('login'); setErrorRegistro(''); }}
            className={`flex-1 rounded-[18px] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition-all ${
              modoAutenticacion === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Iniciar sesión
          </button>
        </div>

        <form
          onSubmit={modoAutenticacion === 'registro' ? registrarUsuario : iniciarSesionUsuario}
          className="mt-4 space-y-3"
        >
          {modoAutenticacion === 'registro' && (
            <input
              name="nombre"
              value={formularioRegistro.nombre}
              onChange={manejarCambioRegistro}
              className="w-full rounded-[22px] bg-gray-50 px-4 py-4 text-sm font-medium outline-none ring-1 ring-transparent transition-all focus:ring-blue-100"
              placeholder="Nombre completo"
            />
          )}
          <input
            name="username"
            value={formularioRegistro.username}
            onChange={manejarCambioRegistro}
            className="w-full rounded-[22px] bg-gray-50 px-4 py-4 text-sm font-medium outline-none ring-1 ring-transparent transition-all focus:ring-blue-100"
            placeholder="Nombre de usuario"
          />
          {modoAutenticacion === 'registro' && (
            <input
              type="email"
              name="email"
              value={formularioRegistro.email}
              onChange={manejarCambioRegistro}
              className="w-full rounded-[22px] bg-gray-50 px-4 py-4 text-sm font-medium outline-none ring-1 ring-transparent transition-all focus:ring-blue-100"
              placeholder="Correo electrónico"
            />
          )}
          <div className="relative">
            <input
              type={mostrarContrasena ? 'text' : 'password'}
              name="password"
              value={formularioRegistro.password}
              onChange={manejarCambioRegistro}
              className="w-full rounded-[22px] bg-gray-50 px-4 py-4 pr-14 text-sm font-medium outline-none ring-1 ring-transparent transition-all focus:ring-blue-100"
              placeholder="Contraseña"
            />
            <button
              type="button"
              onClick={() => setMostrarContrasena((v) => !v)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-all active:scale-95"
              aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {modoAutenticacion === 'registro' && (
            <textarea
              name="bio"
              value={formularioRegistro.bio}
              onChange={manejarCambioRegistro}
              className="min-h-24 w-full resize-none rounded-[22px] bg-gray-50 px-4 py-4 text-sm font-medium outline-none ring-1 ring-transparent transition-all focus:ring-blue-100"
              placeholder="Biografía (opcional)"
            />
          )}
          {errorRegistro && (
            <div className="rounded-[22px] bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
              {errorRegistro}
            </div>
          )}
          <button
            type="submit"
            disabled={registroEnCurso}
            className="w-full rounded-[24px] bg-blue-600 px-4 py-4 text-sm font-black uppercase tracking-wide text-white shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400"
          >
            {registroEnCurso
              ? modoAutenticacion === 'registro' ? 'Creando cuenta...' : 'Entrando...'
              : modoAutenticacion === 'registro' ? 'Registrarme' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    );
  }

  // ── Render: edición de perfil ─────────────────────────────────────────────
  if (estaEditando) {
    return (
      <div className="min-h-screen bg-white pt-8 pb-28 animate-in fade-in duration-500 text-left flex flex-col items-center">
        <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6">Editar perfil</h2>
        <form onSubmit={enviarPerfil} className="w-full max-w-xs flex flex-col gap-4 bg-gray-50 p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                {formularioPerfil.foto ? (
                  <img src={formularioPerfil.foto} className="w-full h-full object-cover" alt="Nueva foto" />
                ) : (
                  <User size={64} color="#cbd5e1" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full border-2 border-white shadow-lg cursor-pointer">
                <Edit3 size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={manejarArchivoPerfil}
                  disabled={procesandoFoto}
                />
              </label>
            </div>
            {mensajeFotoLista && (
              <span className="text-green-600 text-xs font-bold">{mensajeFotoLista}</span>
            )}
            {procesandoFoto && (
              <div className="w-full">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${progresoFoto}%` }}
                  />
                </div>
                <span className="text-blue-600 text-xs font-bold mt-1 block text-center">
                  Procesando foto...
                </span>
              </div>
            )}
          </div>
          <input
            name="nombre"
            value={formularioPerfil.nombre}
            onChange={manejarCambioPerfil}
            className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium outline-none ring-1 ring-gray-200 transition-all focus:ring-blue-300"
            placeholder="Nombre completo"
            disabled={guardandoPerfil}
          />
          <textarea
            name="bio"
            value={formularioPerfil.bio}
            onChange={manejarCambioPerfil}
            className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium outline-none ring-1 ring-gray-200 transition-all focus:ring-blue-300 min-h-20 resize-none"
            placeholder="Biografía"
            disabled={guardandoPerfil}
          />
          {errorPerfil && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-500">
              {errorPerfil}
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={cerrarEditorPerfil}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-300 transition-all"
              disabled={guardandoPerfil || procesandoFoto}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all disabled:bg-gray-200 disabled:text-gray-400"
              disabled={guardandoPerfil || procesandoFoto}
            >
              {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Render: perfil principal ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white pt-8 pb-28 animate-in fade-in duration-500 text-left">

      {/* Barra Superior */}
      <header className="px-5 flex justify-between items-center mb-5">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          {usuario?.username || usernameABuscar || 'perfil'}
        </h2>
        <div className="flex gap-3">
          {esMiPropioPerfil && (
            <>
              <button
                onClick={abrirEditorPerfil}
                className="p-2 bg-gray-50 rounded-full text-gray-600 active:scale-90 transition-all"
                aria-label="Configuración"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={ejecutarCerrarSesion}
                className="p-2 bg-red-50 rounded-full text-red-500 active:scale-90 transition-all"
                aria-label="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Foto + Info */}
      <section className="px-5 flex items-center gap-4 mb-5">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
          {usuario?.foto ? (
            <img
              src={usuario.foto}
              className="w-full h-full object-cover"
              alt={`Foto de ${usuario?.nombre || usuario?.username}`}
            />
          ) : (
            <User size={40} color="#cbd5e1" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-black text-gray-900 truncate">
            {usuario?.nombre || usuario?.username || '—'}
          </p>
          {usuario?.email && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{usuario.email}</p>
          )}
          <p className="text-sm text-gray-500 mt-1 leading-snug line-clamp-2">
            {usuario?.bio || 'Sin biografía aún.'}
          </p>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="px-5 grid grid-cols-4 gap-2 mb-5">
        {[
          { label: 'Publicaciones', valor: resumenPerfil?.publicacionesCount ?? 0 },
          { label: 'Seguidores',    valor: resumenPerfil?.seguidores ?? 0 },
          { label: 'Siguiendo',     valor: resumenPerfil?.siguiendo ?? 0 },
          { label: 'Likes',         valor: resumenPerfil?.likesTotales ?? 0 },
        ].map(({ label, valor }) => (
          <div key={label} className="bg-gray-50 rounded-2xl p-3 text-center">
            <p className="text-lg font-black text-gray-900">{formatearCantidad(valor)}</p>
            <p className="text-[10px] text-gray-400 font-semibold leading-tight">{label}</p>
          </div>
        ))}
      </section>

      {/* Botón editar perfil */}
      {esMiPropioPerfil && (
        <div className="px-5 mb-5">
          <button
            onClick={abrirEditorPerfil}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-100 py-3 text-sm font-bold text-gray-700 active:scale-[0.98] transition-all hover:bg-gray-200"
          >
            <Edit3 size={15} />
            Editar perfil
          </button>
        </div>
      )}

      {/* Pestañas */}
      <div className="flex border-b border-gray-100 mb-4 px-5">
        {['publicaciones', 'pedidos', 'guardados']
          .filter(tab => esMiPropioPerfil || tab === 'publicaciones')
          .map((tab) => (
          <button
            key={tab}
            onClick={() => setPestanaActiva(tab)}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wide transition-all border-b-2 ${
              pestanaActiva === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contenido de pestañas */}
      <div className="px-5">

        {/* ── Publicaciones ── */}
        {pestanaActiva === 'publicaciones' && (
          <div>
            {notificacionPost && (
              <div className={`mb-4 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-500 shadow-sm ${
                notificacionPost.startsWith('Error') 
                  ? 'bg-red-50 text-red-500 border border-red-100' 
                  : 'bg-green-50 text-green-600 border border-green-100'
              }`}>
                {notificacionPost}
              </div>
            )}

            {cargandoPerfil ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                <p className="text-sm text-gray-400">Cargando publicaciones...</p>
              </div>
            ) : publicacionesRecientes.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Edit3 size={24} color="#cbd5e1" />
                </div>
                <p className="text-sm text-gray-400 font-medium">No tienes publicaciones aún.</p>
                {esMiPropioPerfil && (
                  <button
                    onClick={() => inputPublicacionRef.current?.click()}
                    disabled={subiendoPost}
                    className="mt-1 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white uppercase tracking-wide active:scale-95 transition-all"
                  >
                    {subiendoPost ? 'Subiendo...' : 'Crear publicación'}
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Tus fotos y videos
                  </p>
                  {esMiPropioPerfil && (
                    <button
                      onClick={() => inputPublicacionRef.current?.click()}
                      disabled={subiendoPost}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-[10px] font-black text-white uppercase tracking-wide active:scale-95 transition-all"
                    >
                      {subiendoPost ? 'Subiendo...' : '+ Publicar'}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {publicacionesRecientes.map((pub) => (
                    <div
                      key={pub.id || pub._id}
                      className="flex flex-col rounded-2xl bg-gray-50 overflow-hidden shadow-sm active:scale-[0.97] transition-all cursor-pointer"
                      onClick={() => {
                        navigate('/social', { 
                          state: { 
                            filtroUsuario: usernameABuscar, 
                            publicacionId: pub.id 
                          } 
                        });
                      }}
                    >
                      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                        {/* Indicador de video */}
                        {pub.tipoContenido === 'video' && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 pointer-events-none">
                            <Play size={24} className="text-white drop-shadow-md fill-white/20" />
                          </div>
                        )}

                        {esMiPropioPerfil && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              manejarEliminarPublicacion(pub.id);
                            }}
                            className="absolute top-2 right-2 z-20 p-1.5 bg-black/40 hover:bg-red-600 text-white rounded-full transition-colors backdrop-blur-sm"
                          >
                            <X size={14} />
                          </button>
                        )}
                        {pub.imagen && (
                          <img
                            src={pub.imagen}
                            alt={pub.titulo}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-bold text-gray-800 truncate">{pub.titulo}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formatearFecha(pub.fecha || pub.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Pedidos ── */}
        {pestanaActiva === 'pedidos' && (
          <div>
            {cargandoPerfil ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                <p className="text-sm text-gray-400">Cargando pedidos...</p>
              </div>
            ) : pedidosRecientes.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <ShoppingBag size={36} color="#e2e8f0" />
                <p className="text-sm text-gray-400 font-medium">No tienes pedidos recientes.</p>
                <button
                  onClick={() => navegarA('tienda')}
                  className="mt-1 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white uppercase tracking-wide active:scale-95 transition-all"
                >
                  Ir a la tienda
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pedidosRecientes.map((pedido) => (
                  <div
                    key={pedido.id || pedido._id}
                    className="bg-gray-50 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-bold text-gray-800 flex-1 truncate">
                        {pedido.titulo || 'Pedido'}
                      </p>
                      <span className="text-[10px] bg-blue-100 text-blue-600 font-black px-2 py-1 rounded-full uppercase tracking-wide flex-shrink-0">
                        {pedido.estado || 'pendiente'}
                      </span>
                    </div>
                    {pedido.total !== undefined && (
                      <p className="text-sm font-black text-gray-900 mt-1">
                        RD$ {Number(pedido.total).toLocaleString('es-DO')}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatearFecha(pedido.fecha || pedido.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Guardados ── */}
        {pestanaActiva === 'guardados' && (
          <div>
            {/* Sub-pestañas */}
            <div className="flex gap-2 mb-4">
              {['productos', 'publicaciones'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubpestanaGuardados(sub)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    subpestanaGuardados === sub
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </button>
              ))}
            </div>

            {/* Contenido guardados */}
            {subpestanaGuardados === 'productos' && (
              <div>
                {guardadosCount === 0 ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <ShoppingBag size={36} color="#e2e8f0" />
                    <p className="text-sm text-gray-400 font-medium">No tienes productos guardados.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {productosConMeGusta.map((producto) => (
                      <div
                        key={producto.id || producto._id}
                        className="flex flex-col rounded-2xl bg-gray-50 overflow-hidden shadow-sm active:scale-[0.97] transition-all cursor-pointer"
                      >
                        <div className="w-full aspect-square overflow-hidden bg-gray-100">
                          {producto.imagen && (
                            <img
                              src={producto.imagen}
                              alt={producto.nombre || producto.titulo}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {producto.nombre || producto.titulo}
                          </p>
                          {producto.precio !== undefined && (
                            <p className="text-xs font-black text-blue-600 mt-0.5">
                              RD$ {Number(producto.precio).toLocaleString('es-DO')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {subpestanaGuardados === 'publicaciones' && (
              <div>
                {resumenPerfil?.publicacionesMeGusta?.length === 0 ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <Edit3 size={36} color="#e2e8f0" />
                    <p className="text-sm text-gray-400 font-medium">No tienes publicaciones guardadas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {resumenPerfil.publicacionesMeGusta.map((pub) => (
                      <div
                        key={pub.id}
                        className="flex flex-col rounded-2xl bg-gray-50 overflow-hidden shadow-sm active:scale-[0.97] transition-all cursor-pointer"
                        onClick={() => navigate('/social', { state: { filtroUsuario: pub.usuario, publicacionId: pub.id } })}
                      >
                        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                          {pub.tipoContenido === 'video' && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 pointer-events-none">
                              <Play size={24} className="text-white drop-shadow-md fill-white/20" />
                            </div>
                          )}
                          <img
                            src={pub.imagen || pub.portada}
                            alt={pub.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2.5">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-tight truncate">@{pub.usuario}</p>
                          <p className="text-xs font-bold text-gray-800 truncate mt-0.5">{pub.titulo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
      {/* Input oculto para activar la galería */}
      <input
        type="file"
        ref={inputPublicacionRef}
        onChange={manejarSeleccionPost}
        accept="image/*,video/*"
        className="hidden"
      />
    </div>
  );
}

export default PaginaPerfil;