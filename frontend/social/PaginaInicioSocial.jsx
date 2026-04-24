import React from 'react';
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';
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
			<header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-black/80 backdrop-blur-md border-b border-white/10">
				<div>
					<p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Feed</p>
					<h1 className="text-xl font-black tracking-tight">Red social</h1>
				</div>
				<div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
					<Play size={18} />
				</div>
			</header>

			<div className="space-y-6 px-4 pt-4">
				{feed.map((publicacion) => (
					<article key={publicacion.id} className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl">
						<div className="aspect-[4/5] relative">
							<img
								src={publicacion.portada}
								alt={publicacion.usuario}
								className="w-full h-full object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
							<div className="absolute left-5 right-5 bottom-5">
								<p className="text-sm font-black mb-2">@{publicacion.usuario}</p>
								<p className="text-sm text-white/80 leading-relaxed">{publicacion.descripcion}</p>
							</div>
						</div>

						<div className="flex items-center justify-between px-5 py-4 text-sm">
							<div className="flex items-center gap-5">
								<button
									onClick={() => darLike(publicacion.id)}
									className="flex items-center gap-2 text-white/85 active:scale-95 transition-transform"
								>
									<Heart size={18} fill={publicacion.usuarioDioLike ? 'currentColor' : 'none'} />
									<span>{publicacion.likes}</span>
								</button>
								<div className="flex items-center gap-2 text-white/70">
									<MessageCircle size={18} />
									<span>{publicacion.comentarios}</span>
								</div>
							</div>
							<button
								onClick={() => compartirPublicacion(publicacion)}
								className="flex items-center gap-2 text-white/70 active:scale-95 transition-transform"
							>
								<Share2 size={18} />
								<span>Compartir</span>
							</button>
						</div>
					</article>
				))}
			</div>
		</section>
	);
};

export default PaginaInicioSocial;
