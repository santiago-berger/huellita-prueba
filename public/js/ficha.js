// js/ficha.js
// Maneja la ficha detallada de la mascota.
// Cubre RP-05 (detalle), RP-06 (editar/cerrar), RP-09 (coincidencias),
// RP-10 (reportar avistamiento) y RP-11 (historial de avistamientos).

const idReporte = new URLSearchParams(window.location.search).get('id');
let sesionActual = { autenticado: false };

(async () => {
  sesionActual = await obtenerSesion();
  if (!idReporte) {
    document.getElementById('ficha').innerHTML =
      '<div class="alert alert-danger">No se indico que mascota mostrar.</div>';
    return;
  }
  await cargarFicha();
})();

// Devuelve la clase de color segun el estado.
function claseEstado(estado) {
  if (estado === 'Perdida') return 'estado-perdida';
  if (estado === 'Encontrada') return 'estado-encontrada';
  return 'estado-reencontrada';
}

// --- RP-05: cargar y mostrar el detalle del reporte ---
async function cargarFicha() {
  const cont = document.getElementById('ficha');
  try {
    const resp = await fetch('/reportes/' + idReporte);
    if (!resp.ok) {
      cont.innerHTML = '<div class="alert alert-danger">No se encontro el reporte.</div>';
      return;
    }
    const r = await resp.json();
    const esDueno = sesionActual.autenticado && sesionActual.usuario.id === r.usuario_id;
    const titulo = r.nombre_mascota || (r.especie + (r.estado === 'Encontrada' ? ' encontrado' : ''));

    // Botones del dueño (RP-06)
    let botonesDueno = '';
    if (esDueno && r.estado !== 'Reencontrada') {
      botonesDueno = `
        <div class="mb-3">
          <a href="publicar.html?id=${r.id}" class="btn btn-huellita btn-sm">Editar caso</a>
          <button id="btn-cerrar" class="btn btn-success btn-sm">Marcar como reencontrada</button>
        </div>`;
    }

    cont.innerHTML = `
      <div class="row g-4">
        <div class="col-md-6">
          <img src="${r.foto_url || 'img/sin-foto.svg'}" class="img-fluid rounded card-mascota"
               alt="Mascota" onerror="this.src='img/sin-foto.svg'">
        </div>
        <div class="col-md-6">
          <span class="badge-estado ${claseEstado(r.estado)}">${r.estado}</span>
          <h2 class="mt-2">${titulo}</h2>
          <table class="table table-sm mt-3">
            <tr><th>Especie</th><td>${r.especie}</td></tr>
            <tr><th>Color</th><td>${r.color || '-'}</td></tr>
            <tr><th>Tamano</th><td>${r.tamano || '-'}</td></tr>
            <tr><th>Zona</th><td>${r.zona}</td></tr>
            <tr><th>Fecha</th><td>${r.fecha}</td></tr>
            <tr><th>Publicado por</th><td>${r.Usuario ? r.Usuario.nombre : '-'}</td></tr>
          </table>
          ${r.comentario ? `<p><strong>Comentarios:</strong> ${r.comentario}</p>` : ''}
          ${botonesDueno}
          <a href="cartel.html?id=${r.id}" class="btn btn-outline-primary btn-sm">Ver cartel imprimible</a>
        </div>
      </div>
    `;

    // RP-06: accion de cerrar el caso
    const btnCerrar = document.getElementById('btn-cerrar');
    if (btnCerrar) {
      btnCerrar.addEventListener('click', async () => {
        if (!confirm('Confirmas que la mascota fue reencontrada?')) return;
        const rc = await fetch('/reportes/' + idReporte + '/cerrar', { method: 'PUT' });
        const data = await rc.json();
        if (rc.ok) {
          mostrarMensaje('msg-global', data.mensaje, 'success');
          cargarFicha();
        } else {
          mostrarMensaje('msg-global', data.error, 'danger');
        }
      });
    }

    // Secciones adicionales segun el tipo de reporte
    if (r.estado === 'Perdida') {
      mostrarSeccionAvistamientos();
      mostrarCoincidencias();
    }
  } catch (err) {
    cont.innerHTML = '<div class="alert alert-danger">Error al cargar la ficha.</div>';
  }
}

// --- RP-10 y RP-11: seccion de avistamientos ---
function mostrarSeccionAvistamientos() {
  const cont = document.getElementById('ficha');
  const div = document.createElement('div');
  div.className = 'mt-5';
  div.innerHTML = `
    <h3 class="seccion-titulo">Avistamientos</h3>
    <div id="form-avistamiento" class="mb-4"></div>
    <div id="lista-avistamientos"></div>
  `;
  cont.appendChild(div);

  // RP-10: formulario para reportar (solo si hay sesion)
  const formCont = document.getElementById('form-avistamiento');
  if (sesionActual.autenticado) {
    formCont.innerHTML = `
      <div class="card card-mascota p-3">
        <h4 class="h6">Vi a esta mascota</h4>
        <div id="msg-avist"></div>
        <div class="row g-2">
          <div class="col-md-5">
            <input type="text" id="av-lugar" class="form-control" placeholder="Lugar donde la viste">
          </div>
          <div class="col-md-3">
            <input type="date" id="av-fecha" class="form-control">
          </div>
          <div class="col-md-4">
            <input type="text" id="av-comentario" class="form-control" placeholder="Comentario (opcional)">
          </div>
        </div>
        <button id="btn-avistamiento" class="btn btn-huellita btn-sm mt-2">Reportar avistamiento</button>
      </div>
    `;
    document.getElementById('av-fecha').value = fechaHoy();
    document.getElementById('btn-avistamiento').addEventListener('click', enviarAvistamiento);
  } else {
    formCont.innerHTML = '<div class="alert alert-info">Inicia sesion para reportar un avistamiento.</div>';
  }

  cargarAvistamientos();
}

// RP-10: enviar un avistamiento
async function enviarAvistamiento() {
  const lugar = document.getElementById('av-lugar').value.trim();
  const fecha = document.getElementById('av-fecha').value;
  const comentario = document.getElementById('av-comentario').value.trim();

  if (!lugar || !fecha) {
    mostrarMensaje('msg-avist', 'El lugar y la fecha son obligatorios.', 'danger');
    return;
  }
  try {
    const resp = await fetch('/reportes/' + idReporte + '/avistamientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lugar, fecha, comentario }),
    });
    const data = await resp.json();
    if (resp.ok) {
      mostrarMensaje('msg-avist', data.mensaje, 'success');
      document.getElementById('av-lugar').value = '';
      document.getElementById('av-comentario').value = '';
      cargarAvistamientos();
    } else {
      mostrarMensaje('msg-avist', data.error, 'danger');
    }
  } catch (err) {
    mostrarMensaje('msg-avist', 'No se pudo conectar con el servidor.', 'danger');
  }
}

// RP-11: cargar el historial de avistamientos
async function cargarAvistamientos() {
  const cont = document.getElementById('lista-avistamientos');
  try {
    const resp = await fetch('/reportes/' + idReporte + '/avistamientos');
    const lista = await resp.json();
    if (lista.length === 0) {
      cont.innerHTML = '<p class="text-muted">Todavia no hay avistamientos reportados para esta mascota.</p>';
      return;
    }
    cont.innerHTML = lista.map((a) => `
      <div class="item-avistamiento">
        <strong>${a.lugar}</strong> <span class="text-muted">&middot; ${a.fecha}</span>
        ${a.comentario ? `<div class="small">${a.comentario}</div>` : ''}
      </div>
    `).join('');
  } catch (err) {
    cont.innerHTML = '<p class="text-danger">No se pudieron cargar los avistamientos.</p>';
  }
}

// --- RP-09: mascotas encontradas similares ---
async function mostrarCoincidencias() {
  const cont = document.getElementById('ficha');
  const div = document.createElement('div');
  div.className = 'mt-5';
  div.innerHTML = `
    <h3 class="seccion-titulo">Posibles coincidencias</h3>
    <p class="text-muted">Mascotas encontradas de la misma especie y zona.</p>
    <div id="lista-coincidencias" class="row g-3"></div>
  `;
  cont.appendChild(div);

  try {
    const resp = await fetch('/reportes/' + idReporte + '/coincidencias');
    const lista = await resp.json();
    const cl = document.getElementById('lista-coincidencias');
    if (lista.length === 0) {
      cl.innerHTML = '<div class="col-12"><p class="text-muted">No se encontraron coincidencias por el momento.</p></div>';
      return;
    }
    cl.innerHTML = lista.map((r) => `
      <div class="col-md-4">
        <a href="ficha.html?id=${r.id}" class="text-decoration-none">
          <div class="card card-mascota">
            <img src="${r.foto_url || 'img/sin-foto.svg'}" class="foto" alt="Mascota"
                 onerror="this.src='img/sin-foto.svg'">
            <div class="card-body">
              <h4 class="card-title h6">${r.especie} encontrado</h4>
              <p class="mb-1 small text-muted">${r.zona} &middot; ${r.fecha}</p>
              <span class="badge-estado estado-encontrada">Encontrada</span>
            </div>
          </div>
        </a>
      </div>
    `).join('');
  } catch (err) {
    document.getElementById('lista-coincidencias').innerHTML =
      '<div class="col-12"><p class="text-danger">No se pudieron cargar las coincidencias.</p></div>';
  }
}
