// routes/usuarios.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Usuario } = require('../models');

// Reglas de validacion reutilizables
const reglasRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email no tiene un formato valido'),
  body('contrasena')
    .notEmpty().withMessage('La contrasena es obligatoria')
    .isLength({ min: 6 }).withMessage('La contrasena debe tener al menos 6 caracteres'),
];

// POST /api/usuarios/registro
router.post('/registro', reglasRegistro, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  try {
    const { nombre, email, contrasena } = req.body;
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ mensaje: 'El email ya esta registrado' });
    }
    const usuario = await Usuario.create({ nombre, email, contrasena });
    req.session.usuarioId = usuario.id;
    req.session.usuarioNombre = usuario.nombre;
    res.status(201).json({ mensaje: 'Registro exitoso', nombre: usuario.nombre });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// POST /api/usuarios/login
router.post('/login', [
  body('email').trim().notEmpty().isEmail().withMessage('Email invalido'),
  body('contrasena').notEmpty().withMessage('La contrasena es obligatoria'),
], async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  try {
    const { email, contrasena } = req.body;
    const usuario = await Usuario.findOne({ where: { email, contrasena } });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Email o contrasena incorrectos' });
    }
    req.session.usuarioId = usuario.id;
    req.session.usuarioNombre = usuario.nombre;
    res.json({ mensaje: 'Login exitoso', nombre: usuario.nombre });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// POST /api/usuarios/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ mensaje: 'Sesion cerrada' });
});

// GET /api/usuarios/sesion
router.get('/sesion', (req, res) => {
  if (req.session.usuarioId) {
    res.json({ autenticado: true, nombre: req.session.usuarioNombre });
  } else {
    res.json({ autenticado: false });
  }
});

module.exports = router;