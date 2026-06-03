// js/login.js
// Maneja el registro (RP-01) y el inicio de sesion (RP-02).

// --- RP-01: Registro de usuario ---
document.getElementById('btn-registro').addEventListener('click', async () => {
  const nombre = document.getElementById('reg-nombre').value.trim();
  const correo = document.getElementById('reg-correo').value.trim();
  const contrasena = document.getElementById('reg-contrasena').value;

  // Validacion en el navegador con JavaScript
  if (!nombre || !correo || !contrasena) {
    mostrarMensaje('msg-registro', 'Completa todos los campos.', 'danger');
    return;
  }
  if (contrasena.length < 6) {
    mostrarMensaje('msg-registro', 'La contrasena debe tener al menos 6 caracteres.', 'danger');
    return;
  }

  try {
    const resp = await fetch('/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, contrasena }),
    });
    const data = await resp.json();
    if (resp.ok) {
      mostrarMensaje('msg-registro', data.mensaje + ' Ya puedes iniciar sesion.', 'success');
      document.getElementById('reg-nombre').value = '';
      document.getElementById('reg-correo').value = '';
      document.getElementById('reg-contrasena').value = '';
    } else {
      mostrarMensaje('msg-registro', data.error, 'danger');
    }
  } catch (err) {
    mostrarMensaje('msg-registro', 'No se pudo conectar con el servidor.', 'danger');
  }
});

// --- RP-02: Inicio de sesion ---
document.getElementById('btn-login').addEventListener('click', async () => {
  const correo = document.getElementById('login-correo').value.trim();
  const contrasena = document.getElementById('login-contrasena').value;

  if (!correo || !contrasena) {
    mostrarMensaje('msg-login', 'Ingresa el correo y la contrasena.', 'danger');
    return;
  }

  try {
    const resp = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena }),
    });
    const data = await resp.json();
    if (resp.ok) {
      // CA: tras iniciar sesion, se redirige a la pagina principal
      window.location.href = 'index.html';
    } else {
      mostrarMensaje('msg-login', data.error, 'danger');
    }
  } catch (err) {
    mostrarMensaje('msg-login', 'No se pudo conectar con el servidor.', 'danger');
  }
});
