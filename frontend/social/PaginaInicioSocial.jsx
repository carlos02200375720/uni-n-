import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, Share2, ThumbsDown, X } from 'lucide-react';
import { resolveApiBaseUrl } from '../utils/api';
import { useLogicaSocial } from './LogicaPaginaInicioSocial';

const publicacionesPorDefecto = [
	{
		id: 1,
		usuario: 'tech.reels',
		descripcion: 'Comparativa rápida entre laptop ultraligera y setup de escritorio.',
		likes: 1240,
		comentarios: 84,
		usuarioDioLike: false,
		portada: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=900'
	},
	{
		id: 2,
		usuario: 'mobile.lab',
		descripcion: 'Probando cámara, batería y rendimiento en uso real.',
		likes: 982,
		comentarios: 41,
		usuarioDioLike: true,
		portada: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900'
	}
];



export const PaginaInicioSocial = ({ publicaciones = [], usuario = { username: 'visitante', nombre: 'Visitante' }, darLikePublicacion, darDislikePublicacion, agregarComentarioPublicacion }) => {
	// Utilidad para obtener la foto de perfil de cualquier usuario
	const obtenerFotoPerfil = (userObj) => {
		return userObj?.fotoPerfil || userObj?.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userObj?.usuario || userObj?.username || 'U') + '&background=0D8ABC&color=fff&size=128';
	};
	const navigate = useNavigate();
	const apiBaseUrl = resolveApiBaseUrl();
	const { state } = useLocation();
	const containerRef = useRef(null);

	const filtroUsuario = state?.filtroUsuario;
	const publicacionIdInicial = state?.publicacionId;

	const [archivosPublicos, setArchivosPublicos] = useState([]);
	const [archivosProductos, setArchivosProductos] = useState([]);
	const [error, setError] = useState(false);

	const [comentariosAbiertos, setComentariosAbiertos] = useState(false);
	const [publicacionComentada, setPublicacionComentada] = useState(null);
	const [textoComentario, setTextoComentario] = useState('');

	useEffect(() => {
		let cancelado = false;
		Promise.all([
			fetch('/api/usuario/archivos-perfil-publicos').then(res => res.json()).catch(() => ({ archivos: [] })),
			fetch('/api/tienda/archivos-productos-publicos').then(res => res.json()).catch(() => ({ archivos: [] }))
		]).then(([perfil, productos]) => {
			if (!cancelado) {
				setArchivosPublicos(Array.isArray(perfil.archivos) ? perfil.archivos : []);
				setArchivosProductos(Array.isArray(productos.archivos) ? productos.archivos : []);
			}
		}).catch(() => {
			if (!cancelado) setError(true);
		});
		return () => { cancelado = true; };
	}, []);

	const galeria = [
		...publicaciones.map(p => ({
			...p,
			url: p.mediaUrl,
			tipo: p.tipoContenido,
			fuente: 'social'
		})),
		...archivosPublicos.map(a => ({ ...a, fuente: 'perfil' })),
		...archivosProductos.map(a => ({ ...a, fuente: 'producto' }))
	].filter(archivo => {
		if (!filtroUsuario) return true;
		// Si hay filtro, solo mostrar lo que pertenezca a ese usuario
		const autor = archivo.usuario || archivo.nombreAutor;
		return autor === filtroUsuario;
	});

	// Efecto para hacer scroll al video seleccionado al cargar
	useEffect(() => {
		if (publicacionIdInicial && galeria.length > 0 && containerRef.current) {
			const index = galeria.findIndex(a => String(a.id) === String(publicacionIdInicial));
			if (index !== -1) {
				const height = containerRef.current.clientHeight;
				containerRef.current.scrollTop = index * height;
			}
		}
	}, [galeria.length, publicacionIdInicial]);

	// Lógica de Auto-reproducción y Pausa al hacer scroll
	useEffect(() => {
		const opciones = {
			root: containerRef.current,
			threshold: 0.6, // El video debe estar al menos al 60% visible para reproducirse
		};

		const callback = (entries) => {
			entries.forEach((entry) => {
				const video = entry.target.querySelector('video');
				if (!video) return;

				if (entry.isIntersecting) {
					video.play().catch(() => console.log("Autoplay esperando interacción del usuario"));
				} else {
					video.pause();
				}
			});
		};

		const observer = new IntersectionObserver(callback, opciones);
		const articulos = containerRef.current?.querySelectorAll('article');
		articulos?.forEach((art) => observer.observe(art));

		return () => observer.disconnect();
	}, [galeria]);

	const manejarLike = async (archivo) => {
		if (!usuario || usuario.username === 'visitante') {
			navigate('/perfil'); // Redirigir a login si es visitante
			return;
		}

		try {
			const esProducto = archivo.fuente === 'producto';
			const esSocial = archivo.fuente === 'social';

			if (esSocial && darLikePublicacion) {
				await darLikePublicacion(archivo.id);
				return;
			}

			const ruta = esProducto 
				? `${apiBaseUrl}/api/tienda/like/${archivo.id}`
				: `${apiBaseUrl}/api/social/like`;
			
			const cuerpo = esProducto 
				? { username: usuario.username }
				: { idPublicacion: archivo.id, username: usuario.username };

			const respuesta = await fetch(ruta, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(cuerpo)
			});

			if (respuesta.ok) {
				// Actualizar localmente el estado de los archivos para mostrar el corazón rojo
				if (esProducto) {
					setArchivosProductos(prev => prev.map(a => a.id === archivo.id ? { ...a, usuarioDioLike: !a.usuarioDioLike } : a));
				} else {
					setArchivosPublicos(prev => prev.map(a => a.id === archivo.id ? { ...a, usuarioDioLike: !a.usuarioDioLike } : a));
				}
			}
		} catch (error) {
			console.error("Error al gestionar like:", error);
		}
	};

	const manejarDislike = async (archivo) => {
		if (!usuario || usuario.username === 'visitante') return;
		if (archivo.fuente === 'social' && darDislikePublicacion) {
			await darDislikePublicacion(archivo.id);
		}
	};

	const enviarComentario = async (e) => {
		e.preventDefault();
		if (!textoComentario.trim() || !publicacionComentada) return;

		const exito = await agregarComentarioPublicacion(publicacionComentada.id, textoComentario);
		if (exito) {
			setTextoComentario('');
			// Actualizar el objeto local para que se vea el nuevo comentario
			setPublicacionComentada(prev => ({
				...prev,
				listaComentarios: [...(prev.listaComentarios || []), { usuario: usuario.username, texto: textoComentario, fecha: new Date() }],
				comentarios: (prev.comentarios || 0) + 1
			}));
		}
	};

	return (
		<section 
			ref={containerRef}
			className="h-screen min-h-screen bg-black text-white pb-24 overflow-y-auto snap-y snap-mandatory relative scroll-smooth"
		>
			<div className="space-y-0">
				{galeria.length === 0 && (
					<div className="text-center text-gray-400 py-16">No hay archivos públicos aún.</div>
				)}
				{galeria.map((archivo, idx) => (
					<article
						key={archivo.url + idx}
						className="w-full h-screen min-h-screen overflow-hidden border-b border-white/10 bg-black snap-start flex flex-col justify-center"
					>
						<div className="relative w-full h-full flex-1 flex flex-col justify-end">
							{archivo.tipo === 'video' ? (
								<video
									src={archivo.url}
									className="w-full h-full object-cover cursor-pointer"
									loop
									playsInline
									onClick={(e) => {
										if (e.target.paused) e.target.play();
										else e.target.pause();
									}}
								/>
							) : (
								<img
									src={archivo.url}
									alt={archivo.usuario || archivo.producto}
									className="w-full h-full object-cover"
								/>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
							{/* Menú vertical lado derecho */}
							<div className="absolute right-2 bottom-16 z-30 flex flex-col items-center gap-1 w-16">
								{/* Foto de perfil del dueño de la publicación */}
								<img
									src={obtenerFotoPerfil(archivo)}
									alt={archivo.usuario || archivo.nombreAutor || 'Perfil'}
									className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover cursor-pointer active:scale-90 transition-transform"
									onClick={() => {
										const targetUser = archivo.usuario || archivo.nombreAutor;
										if (targetUser && targetUser !== 'tienda') {
											navigate(`/perfil/${targetUser}`);
										}
									}}
								/>

								{/* Corazón (me gusta) */}
								<div className="flex flex-col items-center">
									<button 
										onClick={() => manejarLike(archivo)}
										className={`bg-black/20 backdrop-blur-sm rounded-full p-2.5 transition-all active:scale-75 ${archivo.usuarioDioLike ? 'text-red-600' : 'text-white'}`} 
										title="Me gusta"
									>
										<Heart 
											size={15} 
											fill={archivo.usuarioDioLike ? "#ef4444" : "none"} 
											color="currentColor" 
										/>
									</button>
									<span className="text-[11px] font-bold drop-shadow-md">{archivo.likes || 0}</span>
								</div>

								{/* Pulgar abajo (no me gusta) */}
								<button 
									onClick={() => manejarDislike(archivo)}
									className={`bg-black/20 backdrop-blur-sm rounded-full p-2.5 transition active:scale-75 ${archivo.usuarioDioDislike ? 'text-yellow-500' : 'text-white'}`} 
									title="No me gusta"
								>
									<ThumbsDown 
										size={24} 
										fill={archivo.usuarioDioDislike ? "currentColor" : "none"}
										color="currentColor" 
									/>
								</button>

								{/* Comentarios */}
								<div className="flex flex-col items-center">
									<button 
										onClick={() => { setPublicacionComentada(archivo); setComentariosAbiertos(true); }}
										className="bg-black/20 backdrop-blur-sm rounded-full p-2.5 hover:bg-blue-600/40 transition active:scale-75" 
										title="Comentarios"
									>
										<MessageCircle size={26} color="#fff" />
									</button>
									<span className="text-[11px] font-bold drop-shadow-md">{archivo.comentarios || 0}</span>
								</div>

								{/* Compartir */}
								<div className="flex flex-col items-center">
									<button className="bg-black/20 backdrop-blur-sm rounded-full p-2.5 hover:bg-green-600/40 transition active:scale-75" title="Compartir">
										<Share2 size={15} color="#fff" />
									</button>
									<span className="text-[11px] font-bold drop-shadow-md">Share</span>
								</div>
							</div>
							{/* Nombre del usuario abajo a la izquierda, encima de la barra de navegación */}
							<div className="absolute left-2 bottom-14 z-20 flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<p className="text-sm font-black bg-black/0 px-3 py-1 rounded-full w-fit mb-0.5">{archivo.usuario || archivo.nombreAutor || 'tienda'}</p>
									{(archivo.fuente === 'social' || archivo.fuente === 'perfil') && (archivo.usuario || archivo.nombreAutor) && (archivo.usuario || archivo.nombreAutor) !== usuario.username && (
										<button 
											className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-3 py-1 rounded-full transition-colors active:scale-95 shadow-lg uppercase tracking-wider"
											onClick={() => console.log('Siguiendo a:', archivo.usuario || archivo.nombreAutor)}
										>
											Seguir
										</button>
									)}
								</div>
								{archivo.fuente === 'producto' && (
									<p className="text-xs font-bold bg-black/40 px-2 py-0.5 rounded w-fit">{archivo.producto}</p>
								)}
							</div>
							<div className="absolute left-5 right-24 bottom-5 flex flex-col gap-2 z-20">
								{archivo.descripcion && (
									<p className="text-xs text-white/80 line-clamp-2">{archivo.descripcion}</p>
								)}
								{archivo.fuente === 'producto' && (
									<button
										className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-full font-bold text-xs shadow-lg hover:bg-blue-700 transition w-fit"
										onClick={() => {
											if (archivo.fuente === 'producto' && archivo.id) {
												navigate(`/tienda/detalle/${archivo.id}`);
											}
										}}
									>
										Comprar
									</button>
								)}
							</div>
						</div>
					</article>
				))}
			</div>

			{/* Panel de Comentarios (TikTok Style) */}
			{comentariosAbiertos && (
				<>
					<div className="absolute inset-0 bg-black/40 z-40 animate-in fade-in" onClick={() => setComentariosAbiertos(false)} />
					<div className="absolute inset-x-0 bottom-0 z-50 bg-white text-black rounded-t-[32px] h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
						{/* Header del Panel */}
						<div className="flex justify-between items-center p-5 border-b border-gray-100">
							<span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
								{publicacionComentada?.comentarios || 0} Comentarios
							</span>
							<button onClick={() => setComentariosAbiertos(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
								<X size={24} className="text-gray-400" />
							</button>
						</div>

						{/* Lista de Comentarios */}
						<div className="flex-1 overflow-y-auto p-5 space-y-5">
							{(publicacionComentada?.listaComentarios || []).length === 0 ? (
								<div className="text-center py-10">
									<p className="text-sm text-gray-400 font-medium">Sé el primero en comentar...</p>
								</div>
							) : (
								publicacionComentada.listaComentarios.map((c, i) => (
									<div key={i} className="flex gap-3">
										<div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center font-bold text-blue-600 text-[10px] uppercase">
											{c.usuario[0]}
										</div>
										<div className="flex-1">
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">@{c.usuario}</p>
											<p className="text-sm text-gray-800 font-medium leading-snug mt-0.5">{c.texto}</p>
										</div>
									</div>
								))
							)}
						</div>

						{/* Input de Comentario */}
						<div className="p-4 border-t border-gray-100 bg-gray-50 pb-8">
							<form onSubmit={enviarComentario} className="flex gap-2">
								<input 
									type="text" 
									value={textoComentario}
									onChange={(e) => setTextoComentario(e.target.value)}
									placeholder="Añadir comentario..."
									className="flex-1 bg-white border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
								/>
								<button 
									disabled={!textoComentario.trim()}
									className="bg-blue-600 text-white px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:bg-gray-300 transition-all active:scale-95 shadow-lg shadow-blue-100"
								>
									Enviar
								</button>
							</form>
						</div>
					</div>
				</>
			)}
		</section>
	);
};
export default PaginaInicioSocial;
