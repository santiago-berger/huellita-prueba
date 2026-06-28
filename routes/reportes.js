// routes/reportes.js
// Rutas de reportes de mascotas y avistamientos.
// Funcionalidades RP-04 a RP-12 y RP-15.
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Reporte, Avistamiento, Usuario } = require('../models');
const { requiereSesion } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validaciones para crear o editar un reporte
const reglasReporte = [
  body('especie')
    .trim()
    .notEmpty().withMessage('La especie es obligatoria')
    .isIn(['perro', 'gato', 'otro']).withMessage('La especie debe ser perro, gato u otro'),
  body('zona')
    .trim()
    .notEmpty().withMessage('La zona es obligatoria'),
  body('fecha')
    .notEmpty().withMessage('La fecha es obligatoria')
    .isDate().withMessage('La fecha no tiene un formato valido'),
];

// --- RP-04 y RP-12: Crear un reporte (perdida o encontrada) ---
// POST /reportes
router.post('/reportes', requiereSesion, reglasReporte, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    console.log('Errores de validación:', errores.array());
    return res.status(400).json({ errores: errores.array() });
  }
  try {
    const { nombre_mascota, especie, color, tamano, zona, fecha, foto_url, comentario, estado, latitud, longitud } = req.body;

    const estadoInicial = estado === 'Encontrada' ? 'Encontrada' : 'Perdida';

    const reporte = await Reporte.create({
      usuario_id: req.session.usuario.id,
      nombre_mascota: nombre_mascota || null,
      especie, color: color || null, tamano: tamano || null,
      zona, fecha, foto_url: foto_url || null, comentario: comentario || null,
      estado: estadoInicial,
      latitud: latitud || null,
      longitud: longitud || null,
    });
    res.status(201).json({ mensaje: 'Reporte publicado con exito.', id: reporte.id });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al guardar el reporte.' });
  }
});

// --- RP-07 y RP-08: Listado de reportes con filtros ---
// GET /reportes?estado=&especie=&zona=
router.get('/reportes', async (req, res) => {
  try {
    const { estado, especie, zona } = req.query;
    const where = {};

    where.estado = estado || 'Perdida';

    if (especie) where.especie = especie;
    if (zona) where.zona = { [Op.like]: '%' + zona + '%' };

    const reportes = await Reporte.findAll({ where, order: [['fecha', 'DESC']] });
    res.json(reportes);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al obtener los reportes.' });
  }
});

// --- RP-05: Ficha detallada de un reporte ---
// GET /reportes/:id
router.get('/reportes/:id', async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id, {
      include: [{ model: Usuario, attributes: ['nombre'] }],
    });
    if (!reporte) {
      return res.status(404).json({ error: 'No se encontro el reporte solicitado.' });
    }
    res.json(reporte);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al obtener el reporte.' });
  }
});

// --- RP-06: Editar un reporte ---
// PUT /reportes/:id
router.put('/reportes/:id', requiereSesion, reglasReporte, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) {
      return res.status(404).json({ error: 'No se encontro el reporte.' });
    }
    if (reporte.usuario_id !== req.session.usuario.id) {
      return res.status(403).json({ error: 'Solo el dueño del reporte puede editarlo.' });
    }

    const campos = ['nombre_mascota', 'especie', 'color', 'tamano', 'zona', 'fecha', 'foto_url', 'comentario', 'latitud', 'longitud'];
    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) reporte[campo] = req.body[campo];
    });
    await reporte.save();
    res.json({ mensaje: 'Reporte actualizado con exito.' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al actualizar el reporte.' });
  }
});

// --- RP-06: Cerrar un caso (marcar como Reencontrada) ---
// PUT /reportes/:id/cerrar
router.put('/reportes/:id/cerrar', requiereSesion, async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) {
      return res.status(404).json({ error: 'No se encontro el reporte.' });
    }
    if (reporte.usuario_id !== req.session.usuario.id) {
      return res.status(403).json({ error: 'Solo el dueño del reporte puede cerrarlo.' });
    }
    reporte.estado = 'Reencontrada';
    await reporte.save();
    res.json({ mensaje: 'Caso cerrado. La mascota fue marcada como reencontrada.' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al cerrar el caso.' });
  }
});

// --- RP-09: Mascotas encontradas similares ---
// GET /reportes/:id/coincidencias
router.get('/reportes/:id/coincidencias', async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) {
      return res.status(404).json({ error: 'No se encontro el reporte.' });
    }
    const coincidencias = await Reporte.findAll({
      where: {
        estado: 'Encontrada',
        especie: reporte.especie,
        zona: { [Op.like]: '%' + reporte.zona + '%' },
      },
      order: [['fecha', 'DESC']],
    });
    res.json(coincidencias);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al buscar coincidencias.' });
  }
});

// --- RP-10: Reportar un avistamiento ---
// POST /reportes/:id/avistamientos
router.post('/reportes/:id/avistamientos', requiereSesion, async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) {
      return res.status(404).json({ error: 'No se encontro el reporte.' });
    }
    const { lugar, fecha, comentario } = req.body;
    if (!lugar || !fecha) {
      return res.status(400).json({ error: 'El lugar y la fecha son obligatorios.' });
    }
    await Avistamiento.create({
      reporte_id: reporte.id,
      lugar, fecha, comentario: comentario || null,
    });
    res.status(201).json({ mensaje: 'Avistamiento registrado. Gracias por colaborar.' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al guardar el avistamiento.' });
  }
});

// --- RP-11: Historial de avistamientos de un caso ---
// GET /reportes/:id/avistamientos
router.get('/reportes/:id/avistamientos', async (req, res) => {
  try {
    const avistamientos = await Avistamiento.findAll({
      where: { reporte_id: req.params.id },
      order: [['fecha', 'DESC']],
    });
    res.json(avistamientos);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al obtener los avistamientos.' });
  }
});

// --- RP-16: Eliminar un reporte ---
// DELETE /reportes/:id
// Solo el dueño o un admin pueden eliminarlo
router.delete('/reportes/:id', requiereSesion, async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);

    if (!reporte) {
      return res.status(404).json({
        error: 'No se encontro el reporte.'
      });
    }

    // permiso: dueño o admin
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