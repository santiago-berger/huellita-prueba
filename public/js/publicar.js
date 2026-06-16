// js/publicar.js
// Maneja la publicacion (RP-04, RP-12) y la edicion (RP-06) de reportes.
// Si la URL trae ?id=, la pagina funciona en modo edicion.


const params = new URLSearchParams(window.location.search);
const idEdicion = params.get('id');

// Pone la fecha de hoy por defecto
document.getElementById('fecha').value = fechaHoy();

// Verifica que haya sesion iniciada antes de permitir publicar.
(async () => {
  const sesion = await obtenerSesion();
  if (!sesion.autenticado) {
    mostrarMensaje('msg-form', 'Debes iniciar sesion para publicar un caso. Redirigiendo...', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
    return;
  }
  if (idEdicion) {
    cargarParaEditar();
  }
})();

// El nombre se oculta cuando es una mascota encontrada.
document.getElementById('tipo').addEventListener('change', (e) => {
  const campoNombre = document.getElementById('campo-nombre');
  campoNombre.style.display = e.target.value === 'Encontrada' ? 'none' : 'block';
});

// --- RP-06: cargar los datos de un reporte existente para editar ---
async function cargarParaEditar() {
  document.getElementById('titulo-form').textContent = 'Editar caso';
  document.getElementById('btn-guardar').textContent = 'Guardar cambios';
  try {
    console.log(r);
    const resp = await fetch('/reportes/' + idEdicion);
    const r = await resp.json();
    document.getElementById('tipo').value = r.estado === 'Encontrada' ? 'Encontrada' : 'Perdida';
    document.getElementById('tipo').dispatchEvent(new Event('change'));
    document.getElementById('nombre_mascota').value = r.nombre_mascota || '';
    document.getElementById('especie').value = r.especie || '';
    document.getElementById('tamano').value = r.tamano || '';
    document.getElementById('color').value = r.color || '';
    document.getElementById('zona').value = r.zona || '';
    document.getElementById('fecha').value = r.fecha || '';
    document.getElementById('foto_url').value = r.foto_url || '';
    document.getElementById('comentario').value = r.comentario || '';
  } catch (err) {
    mostrarMensaje('msg-form', 'No se pudo cargar el reporte.', 'danger');
  }
}

// --- Guardar (crear o editar) ---
document.getElementById('btn-guardar').addEventListener('click', async () => {
  const datos = {
    estado: document.getElementById('tipo').value,
    nombre_mascota: document.getElementById('nombre_mascota').value.trim(),
    especie: document.getElementById('especie').value,
    tamano: document.getElementById('tamano').value,
    color: document.getElementById('color').value.trim(),
    zona: document.getElementById('zona').value.trim(),
    fecha: document.getElementById('fecha').value,
    foto_url: document.getElementById('foto_url').value.trim(),
    comentario: document.getElementById('comentario').value.trim(),
  };

  // Validacion: especie, zona y fecha son obligatorias
  if (!datos.especie || !datos.zona || !datos.fecha) {
    mostrarMensaje('msg-form', 'La especie, la zona y la fecha son obligatorias.', 'danger');
    return;
  }

  try {
    console.log('Datos enviados:', datos);
    let resp;
    if (idEdicion) {
      // RP-06: editar
      resp = await fetch('/reportes/' + idEdicion, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
    } else {
      // RP-04 / RP-12: crear
      resp = await fetch('/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
    }
    const data = await resp.json();
    if (resp.ok) {
      mostrarMensaje('msg-form', data.mensaje, 'success');
      const destino = idEdicion ? 'ficha.html?id=' + idEdicion : 'reportes.html';
      setTimeout(() => { window.location.href = destino; }, 1500);
    } else {
  const msg = data.error
    || (data.errores && data.errores[0]?.msg)
    || 'Error al guardar el reporte.';
    mostrarMensaje('msg-form', msg, 'danger');
}
  } catch (err) {
    mostrarMensaje('msg-form', 'No se pudo conectar con el servidor.', 'danger');
  }
});
