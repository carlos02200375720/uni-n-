import React, { useState } from 'react';

const variantesIniciales = [{ talla: '', color: '', imagen: null, preview: null }];

const FormularioProducto = ({ onGuardar }) => {
  const [titulo, setTitulo] = useState('');
  const [archivos, setArchivos] = useState([]); // array de archivos (imágenes y videos)
  const [previewArchivos, setPreviewArchivos] = useState([]); // para previsualización
  const [descripcion, setDescripcion] = useState('');
  const [variantes, setVariantes] = useState(variantesIniciales);
  const [tiempoEnvio, setTiempoEnvio] = useState('');
  const [precioEnvio, setPrecioEnvio] = useState('');
  const [precio, setPrecio] = useState('');
  const categoriasDisponibles = [
    'Móviles',
    'Audio',
    'Laptops',
    'Relojes',
    'Accesorios',
    'Calzado',
    'Ropa',
    'Hogar'
  ];
  const [categoria, setCategoria] = useState('');
  const [oferta, setOferta] = useState(false);
  const [descuento, setDescuento] = useState('');
  const [stock, setStock] = useState('');

  const handleArchivos = (e) => {
    const files = Array.from(e.target.files || []);
    // Acumular archivos previos + nuevos
    const nuevosArchivos = [...archivos, ...files];
    setArchivos(nuevosArchivos);
    // Crear previsualizaciones acumuladas
    const previews = nuevosArchivos.map(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (["mp4","mov","avi","wmv","flv","mkv","webm"].includes(ext)) {
        return { tipo: 'video', url: URL.createObjectURL(file) };
      } else {
        return { tipo: 'imagen', url: URL.createObjectURL(file) };
      }
    });
    setPreviewArchivos(previews);
    e.target.value = '';
  };

  const eliminarArchivo = (indice) => {
    const nuevosArchivos = archivos.filter((_, idx) => idx !== indice);
    setArchivos(nuevosArchivos);
    const previews = nuevosArchivos.map(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (["mp4","mov","avi","wmv","flv","mkv","webm"].includes(ext)) {
        return { tipo: 'video', url: URL.createObjectURL(file) };
      } else {
        return { tipo: 'imagen', url: URL.createObjectURL(file) };
      }
    });
    setPreviewArchivos(previews);
  };

  const handleVariante = (i, campo, valor) => {
    const nuevas = variantes.map((v, idx) => idx === i ? { ...v, [campo]: valor } : v);
    setVariantes(nuevas);
  };

  const handleImagenVariante = (i, file) => {
    const nuevas = variantes.map((v, idx) => {
      if (idx === i) {
        return {
          ...v,
          imagen: file,
          preview: file ? URL.createObjectURL(file) : null
        };
      }
      return v;
    });
    setVariantes(nuevas);
  };

  const agregarVariante = () => setVariantes([...variantes, { talla: '', color: '', imagen: null, preview: null }]);
  const quitarVariante = (i) => setVariantes(variantes.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar que todos los archivos sean File
    const archivosValidos = archivos.filter(f => f instanceof File);
    // Extraer imágenes de variantes
    const imagenesColores = variantes.map(v => v.imagen).filter(Boolean);
    onGuardar && onGuardar({ titulo, archivos: [...archivosValidos, ...imagenesColores], descripcion, variantes, tiempoEnvio, precioEnvio, precio, categoria, oferta, descuento, stock });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block font-bold">Título</label>
        <input className="input" value={titulo} onChange={e => setTitulo(e.target.value)} required />
      </div>
      <div>
        <label className="block font-bold">Imágenes y Videos</label>
        <input type="file" multiple accept="image/*,video/*" onChange={handleArchivos} />
        {previewArchivos.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {previewArchivos.map((prev, idx) => (
              <div key={idx} className="relative group">
                {prev.tipo === 'imagen' ? (
                  <img src={prev.url} alt={`preview-img-${idx}`} className="w-20 h-20 object-cover rounded border" />
                ) : (
                  <video src={prev.url} className="w-20 h-20 object-cover rounded border" controls />
                )}
                <button
                  type="button"
                  onClick={() => eliminarArchivo(idx)}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-80 hover:opacity-100 group-hover:scale-110 transition-all"
                  title="Eliminar archivo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="block font-bold">Descripción</label>
        <textarea className="input" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
      </div>
      <div>
        <label className="block font-bold">Variantes (color, talla, imagen)</label>
        {variantes.map((v, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <input className="input" placeholder="Talla" value={v.talla} onChange={e => handleVariante(i, 'talla', e.target.value)} />
            <input className="input" placeholder="Color" value={v.color} onChange={e => handleVariante(i, 'color', e.target.value)} />
            <input type="file" accept="image/*" onChange={e => handleImagenVariante(i, e.target.files[0])} />
            {v.preview && (
              <img src={v.preview} alt="preview-color" className="w-10 h-10 object-cover rounded border" />
            )}
            {variantes.length > 1 && <button type="button" onClick={() => quitarVariante(i)} className="text-red-500">Quitar</button>}
          </div>
        ))}
        <button type="button" onClick={agregarVariante} className="text-blue-600">+ Añadir variante</button>
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block font-bold">Tiempo de envío</label>
          <input className="input" value={tiempoEnvio} onChange={e => setTiempoEnvio(e.target.value)} />
        </div>
        <div>
          <label className="block font-bold">Precio de envío</label>
          <input className="input" type="number" value={precioEnvio} onChange={e => setPrecioEnvio(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block font-bold">Precio del producto</label>
        <input className="input" type="number" value={precio} onChange={e => setPrecio(e.target.value)} required />
      </div>
      <div>
        <label className="block font-bold">Categoría</label>
        <select
          className="input"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          required
        >
          <option value="" disabled>Selecciona una categoría</option>
          {categoriasDisponibles.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={oferta} onChange={e => setOferta(e.target.checked)} />
        <label className="font-bold">¿Producto en oferta?</label>
        {oferta && (
          <input className="input ml-2" type="number" placeholder="% Descuento" value={descuento} onChange={e => setDescuento(e.target.value)} />
        )}
      </div>
      <div>
        <label className="block font-bold">Cantidad en stock</label>
        <input className="input" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
      </div>
      <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold" type="submit">Guardar producto</button>
    </form>
  );
};

export default FormularioProducto;
