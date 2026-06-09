// js/comun.js
// Funciones compartidas por todas las paginas:
// genera la barra de navegacion y el pie, y maneja el estado de sesion.

// Consulta al servidor si hay una sesion activa.
async function obtenerSesion() {
  try {
    const resp = await fetch('/sesion');
    return await resp.json();
  } catch (err) {
    return { autenticado: false };
  }
}

// Dibuja la barra de navegacion segun el estado de la sesion.
async function generarNavbar(paginaActiva) {
  const sesion = await obtenerSesion();
  const cont = document.getElementById('navbar');
  if (!cont) return;

  // Opciones del menu visibles para todos
  let enlaces = `
    <li class="nav-item"><a class="nav-link ${paginaActiva === 'inicio' ? 'active' : ''}" href="index.html">Inicio</a></li>
    <li class="nav-item"><a class="nav-link ${paginaActiva === 'reportes' ? 'active' : ''}" href="reportes.html">Mascotas perdidas</a></li>
    <li class="nav-item"><a class="nav-link ${paginaActiva === 'encontradas' ? 'active' : ''}" href="encontradas.html">Encontradas</a></li>
    <li class="nav-item"><a class="nav-link ${paginaActiva === 'mapa' ? 'active' : ''}" href="mapa.html">Mapa</a></li>
    <li class="nav-item"><a class="nav-link ${paginaActiva === 'guia' ? 'active' : ''}" href="guia.html">Guia</a></li>
    <li class="nav-item"><a class="nav-link ${paginaActiva === 'directorio' ? 'active' : ''}" href="directorio.html">Directorio</a></li>
  `;

  // Opciones que dependen de la sesion (RP-02 y RP-03)
  let acciones;
  if (sesion.autenticado) {
    acciones = `
      <li class="nav-item"><a class="nav-link" href="publicar.html">Publicar caso</a></li>
      <li class="nav-item"><span class="nav-link">Hola, ${sesion.usuario.nombre}</span></li>
      <li class="nav-item"><a class="nav-link" href="#" id="btn-logout">Cerrar sesion</a></li>
    `;
  } else {
    acciones = `
      <li class="nav-item"><a class="nav-link" href="login.html">Iniciar sesion</a></li>
      <li class="nav-item"><a class="nav-link" href="login.html#registro">Registrarse</a></li>
    `;
  }

  cont.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-huellita">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <img src="img/logo.svg" alt="Huellita"> Huellita
        </a>
        <button class="navbar-toggler bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="menu">
          <ul class="navbar-nav ms-auto">
            ${enlaces}
            ${acciones}
          </ul>
        </div>
      </div>
    </nav>
  `;

  // RP-03: cierre de sesion
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch('/logout');
      window.location.href = 'index.html';
    });
  }
}

// Dibuja el pie de pagina.
function generarFooter() {
  const cont = document.getElementById('footer');
  if (!cont) return;
  cont.innerHTML = `
    <footer class="footer-huellita">
      <div class="container">
        Huellita &middot; Aplicacion web de busqueda de mascotas perdidas &middot; Ciudad de Formosa
      </div>
    </footer>
  `;
}

// Muestra un mensaje (de exito o error) en un contenedor dado.
function mostrarMensaje(idContenedor, texto, tipo) {
  const cont = document.getElementById(idContenedor);
  if (!cont) return;
  cont.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;
}

// Devuelve la fecha de hoy en formato YYYY-MM-DD.
function fechaHoy() {
  return new Date().toISOString().split('T')[0];
}
