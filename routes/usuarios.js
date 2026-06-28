// routes/usuarios.js
// Rutas de registro, inicio de sesion y cierre de sesion.
// Funcionalidades RP-01, RP-02 y RP-03.
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sequelize, Establecimiento, Usuario } = require('../models');
const { requiereSesion } = require('../middleware/auth');

// Reglas de validacion para el registro
const reglasRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('El correo no tiene un formato valido'),
  body('contrasena')
    .notEmpty().withMessage('La contrasena es obligatoria')
    .isLength({ min: 6 }).withMessage('La contrasena debe tener al menos 6 caracteres'),
];

// --- RP-01: Registro de usuario ---
// POST /usuarios
router.post('/usuarios', reglasRegistro, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ error: errores.array()[0].msg });
  }
  try {
    const { nombre, correo, contrasena } = req.body;
    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) {
      return res.status(400).json({ error: 'Ya existe una cuenta con ese correo electronico.' });
    }
    const usuario = await Usuario.create({ nombre, correo, contrasena });
    res.status(201).json({ mensaje: 'Cuenta creada con exito.', id: usuario.id });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al registrar el usuario.' });
  }
});

// --- RP-02: Inicio de sesion ---
// POST /login
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Ingresa el correo y la contrasena.' });
    }

    const usuario = await Usuario.findOne({ where: { correo } });

    // CA: si los datos son incorrectos, se muestra un mensaje de error
    if (!usuario || usuario.contrasena !== contrasena) {
      return res.status(401).json({ error: 'Correo o contrasena incorrectos.' });
    }

    // Se guarda la sesion del usuario junto con su rol.
    // El rol se utilizara para determinar los permisos dentro del sistema.
    req.session.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
    };

    res.json({
      mensaje: 'Sesion iniciada.',
      nombre: usuario.nombre,
      rol: usuario.rol,
    });

  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al iniciar sesion.' });
  }
});

// --- RP-03: Cierre de sesion ---
// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ mensaje: 'Sesion cerrada.' });
  });
});

// --- Consulta del estado de la sesion ---
// GET /sesion
router.get('/sesion', (req, res) => {
  if (req.session && req.session.usuario) {
    res.json({ autenticado: true, usuario: req.session.usuario });
  } else {
    res.json({ autenticado: false });
  }
});

// --- RP-16: Eliminar un reporte ---
// DELETE /reportes/:id
// Un usuario solo puede eliminar sus propios reportes.
// Un administrador puede eliminar cualquier reporte.
router.delete('/reportes/:id', requiereSesion, async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);

    if (!reporte) {
      return res.status(404).json({
        error: 'No se encontro el reporte.'
      });
    }

    // Solo el dueño del reporte o un administrador pueden eliminarlo.
    if (
      reporte.usuario_id !== req.session.usuario.id &&
      req.session.usuario.rol !== 'admin'
    ) {
      return res.status(403).json({
        error: 'No tienes permisos para eliminar este reporte.'
      });
    }

    await reporte.destroy();

    res.json({
      mensaje: 'Reporte eliminado correctamente.'
    });

  } catch (err) {
    res.status(500).json({
      error: 'Error del servidor al eliminar el reporte.'
    });
  }
});

module.exports = router;