// routes/usuarios.js
// Rutas de registro, inicio de sesion y cierre de sesion.
// Funcionalidades RP-01, RP-02 y RP-03.
const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');

// --- RP-01: Registro de usuario ---
// POST /usuarios
router.post('/usuarios', async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    // Validacion de campos obligatorios
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    // CA: la contrasena debe tener al menos 6 caracteres
    if (contrasena.length < 6) {
      return res.status(400).json({ error: 'La contrasena debe tener al menos 6 caracteres.' });
    }
    // CA: no se permiten dos cuentas con el mismo correo
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

    // Se guarda la sesion del usuario
    req.session.usuario = { id: usuario.id, nombre: usuario.nombre };
    res.json({ mensaje: 'Sesion iniciada.', nombre: usuario.nombre });
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

// --- Consulta del estado de la sesion (auxiliar para el frontend) ---
// GET /sesion
router.get('/sesion', (req, res) => {
  if (req.session && req.session.usuario) {
    res.json({ autenticado: true, usuario: req.session.usuario });
  } else {
    res.json({ autenticado: false });
  }
});

module.exports = router;
