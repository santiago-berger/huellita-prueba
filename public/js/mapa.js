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
  // Centro y macrocentro
  'centro':                   [-26.1775, -58.1781],
  'centro historico':         [-26.1775, -58.1781],
  // Barrios mencionados en fuentes oficiales de Formosa Capital
  'san miguel':               [-26.1658, -58.1742],
  'san francisco':            [-26.1720, -58.1855],
  '2 de abril':               [-26.1695, -58.1930],
  'dos de abril':             [-26.1695, -58.1930],
  'juan domingo peron':       [-26.1820, -58.1650],
  'peron':                    [-26.1820, -58.1650],
  'eva peron':                [-26.1850, -58.1600],
  'independencia':            [-26.1740, -58.1680],
  'namqom':                   [-26.1530, -58.1590],
  'villa del carmen':         [-26.1950, -58.1780],
  'la nueva formosa':         [-26.1980, -58.1820],
  'nueva pompeya':            [-26.2010, -58.1850],
  'antenor gauna':            [-26.1700, -58.2020],
  'gauna':                    [-26.1700, -58.2020],
  'guadalupe':                [-26.1760, -58.1600],
  'la paz':                   [-26.1810, -58.1900],
  'simon bolivar':            [-26.1870, -58.1650],
  'bolivar':                  [-26.1870, -58.1650],
  'mariano moreno':           [-26.1900, -58.1960],
  'moreno':                   [-26.1900, -58.1960],
  'parque urbano':            [-26.1750, -58.1800],
  'bernardino rivadavia':     [-26.1680, -58.1700],
  'rivadavia':                [-26.1680, -58.1700],
  'republica argentina':      [-26.1920, -58.1700],
  'colluccio':                [-26.1760, -58.1840],
  'divino nino':              [-26.1730, -58.1760],
  'san antonio':              [-26.1850, -58.2050],
  'illia':                    [-26.1800, -58.1750],
  'el puco':                  [-26.1920, -58.1900],
  'lujan':                    [-26.1770, -58.1870],
  'lote 111':                 [-26.1650, -58.1830],
  '8 de marzo':               [-26.1960, -58.1850],
  '28 de junio':              [-26.1880, -58.1720],
  'fray salvador gurrieri':   [-26.1940, -58.1760],
  'mbigue':                   [-26.1560, -58.1670],
  'juan manuel de rosas':     [-26.1710, -58.1910],
  // Puntos cardinales como fallback
  'norte':                    [-26.1580, -58.1750],
  'sur':                      [-26.1950, -58.1800],
  'este':                     [-26.1780, -58.1580],
  'oeste':                    [-26.1780, -58.2000],
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