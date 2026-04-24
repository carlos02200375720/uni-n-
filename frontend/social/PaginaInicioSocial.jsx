import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
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

export const PaginaInicioSocial = ({ publicaciones = [] }) => {
	const publicacionesIniciales = publicaciones.length > 0 ? publicaciones : publicacionesPorDefecto;
	const { publicaciones: feed, darLike, compartirPublicacion } = useLogicaSocial(publicacionesIniciales);

	return (
		<section className="min-h-screen bg-black text-white pb-24">
			<div className="space-y-0">
				{feed.map((publicacion) => (
					<article key={publicacion.id} className="w-full overflow-hidden border-b border-white/10 bg-black">
						<div className="aspect-[4/5] relative">
							{publicacion.tipoContenido === 'video' ? (
								<video
									src={publicacion.mediaUrl || publicacion.portada}
									className="w-full h-full object-cover"
									autoPlay
									muted
									loop
									playsInline
								/>
							) : (
								<img
									src={publicacion.mediaUrl || publicacion.portada}
									alt={publicacion.usuario}
									className="w-full h-full object-cover"
								/>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
							<div className="absolute right-4 bottom-6 z-10 flex flex-col items-center gap-5 text-white">
								<button
									onClick={() => darLike(publicacion.id)}
									className="flex flex-col items-center gap-1 text-white/90 active:scale-95 transition-transform"
								>
									<span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
										<Heart size={22} fill={publicacion.usuarioDioLike ? 'currentColor' : 'none'} />
									</span>
									<span className="text-xs font-bold">{publicacion.likes}</span>
								</button>
								<div className="flex flex-col items-center gap-1 text-white/80">
									<span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
										<MessageCircle size={22} />
									</span>
									<span className="text-xs font-bold">{publicacion.comentarios}</span>
								</div>
								<button
									onClick={() => compartirPublicacion(publicacion)}
									className="flex flex-col items-center gap-1 text-white/80 active:scale-95 transition-transform"
								>
									<span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
										<Share2 size={22} />
									</span>
									<span className="text-xs font-bold">Compartir</span>
								</button>
							</div>
							<div className="absolute left-5 right-24 bottom-5">
								<p className="text-sm font-black mb-2">@{publicacion.usuario}</p>
								<p className="text-sm text-white/80 leading-relaxed">{publicacion.descripcion}</p>
							</div>
						</div>
					</article>
				))}
			</div>
		</section>
	);
};

export default PaginaInicioSocial;
