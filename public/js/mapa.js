// js/mapa.js
// Mapa interactivo con Leaflet.
// Muestra marcadores rojos (perdidas) y verdes (encontradas).
// SCRUM-87 a SCRUM-96

// Centro del mapa: Ciudad de Formosa
const LAT_FORMOSA = -26.1775;
const LNG_FORMOSA = -58.1781;
const ZOOM_INICIAL = 13;

// Colores de marcadores segun estado
const iconoPerdida = crearIcono('#dc3545');
const iconoEncontrada = crearIcono('#198754');

// Inicializar el mapa
const mapa = L.map('mapa').setView([LAT_FORMOSA, LNG_FORMOSA], ZOOM_INICIAL);

// Capa base OpenStreetMap (gratuita, sin clave)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
  maxZoom: 19,
}).addTo(mapa);

// Grupo de marcadores (permite limpiar y redibujar)
let capaMarcadores = L.layerGroup().addTo(mapa);

// Crea un icono circular de color personalizado
function crearIcono(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:18px; height:18px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

// Construye el contenido HTML del popup
function contenidoPopup(r) {
  const foto = r.foto_url
    ? `<img src="${r.foto_url}" alt="Foto" style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:8px;">`
    : '';
  const nombre = r.nombre_mascota || 'Sin nombre';
  const estado = r.estado === 'Perdida'
    ? '<span class="badge bg-danger">Perdida</span>'
    : '<span class="badge bg-success">Encontrada</span>';
  return `
    <div style="min-width:180px;font-family:'Nunito Sans',sans-serif;">
      ${foto}
      <strong style="font-size:1rem;">${nombre}</strong> ${estado}<br>
      <small>🐾 ${r.especie} &nbsp;|&nbsp; 📍 ${r.zona}</small><br>
      <a href="ficha.html?id=${r.id}" class="btn btn-sm btn-huellita mt-2 w-100"
         style="background:#2E75B6;color:white;border:none;border-radius:6px;padding:4px 0;display:block;text-align:center;text-decoration:none;">
        Ver ficha completa
      </a>
    </div>
  `;
}

// Carga los reportes desde la API y los dibuja en el mapa
async function cargarMarcadores() {
  const estado = document.getElementById('filtro-estado').value;
  const especie = document.getElementById('filtro-especie').value;

  capaMarcadores.clearLayers();

  try {
    // Buscar perdidas
    let reportes = [];

    if (estado === 'todas' || estado === 'Perdida') {
      const url = `/reportes?estado=Perdida${especie ? '&especie=' + especie : ''}`;
      const resp = await fetch(url);
      const data = await resp.json();
      reportes = reportes.concat(data.map(r => ({ ...r, _estado: 'Perdida' })));
    }

    if (estado === 'todas' || estado === 'Encontrada') {
      const url = `/reportes?estado=Encontrada${especie ? '&especie=' + especie : ''}`;
      const resp = await fetch(url);
      const data = await resp.json();
      reportes = reportes.concat(data.map(r => ({ ...r, _estado: 'Encontrada' })));
    }

    // Dibujar marcadores con coordenadas de Formosa + variación aleatoria por zona
    reportes.forEach(r => {
      const coords = coordenadasPorZona(r.zona);
      const icono = r._estado === 'Perdida' ? iconoPerdida : iconoEncontrada;
      L.marker(coords, { icon: icono })
        .bindPopup(contenidoPopup(r), { maxWidth: 220 })
        .addTo(capaMarcadores);
    });

    const contador = document.getElementById('contador');
    contador.textContent = `Mostrando ${reportes.length} mascota${reportes.length !== 1 ? 's' : ''} en el mapa.`;

  } catch (err) {
    console.error('Error al cargar marcadores:', err);
  }
}

// Asigna coordenadas aproximadas según la zona ingresada en el reporte.
// Centra en Formosa y agrega una pequeña variación aleatoria para que
// los marcadores no se superpongan exactamente.
function coordenadasPorZona(zona) {
  const zonas = {
    'centro':     [-26.1775, -58.1781],
    'norte':      [-26.1650, -58.1750],
    'sur':        [-26.1900, -58.1800],
    'este':       [-26.1780, -58.1600],
    'oeste':      [-26.1780, -58.1950],
    'villa del parque': [-26.1720, -58.1850],
    'john f kennedy':   [-26.1830, -58.1700],
    'san miguel':       [-26.1700, -58.1900],
  };

  const clave = zona ? zona.toLowerCase().trim() : '';
  let base = zonas[clave] || [LAT_FORMOSA, LNG_FORMOSA];

  // Variación aleatoria pequeña para evitar superposición
  const variacion = () => (Math.random() - 0.5) * 0.01;
  return [base[0] + variacion(), base[1] + variacion()];
}

// Arrancar
generarNavbar('mapa');
generarFooter();
cargarMarcadores();

document.getElementById('btn-filtrar').addEventListener('click', cargarMarcadores);