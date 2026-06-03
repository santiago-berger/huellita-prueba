// middleware/auth.js
// Middleware que protege las rutas privadas.
// Verifica que exista una sesion de usuario activa antes de
// permitir el acceso a la ruta. Si no la hay, responde con un
// error 401 (no autorizado).

function requiereSesion(req, res, next) {
  if (req.session && req.session.usuario) {
    return next(); // hay sesion, continua
  }
  return res.status(401).json({ error: 'Debes iniciar sesion para realizar esta accion.' });
}

module.exports = { requiereSesion };
