// routes/reportes.js
// Rutas de reportes de mascotas y avistamientos.
// Funcionalidades RP-04 a RP-12 y RP-15.
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Reporte, Avistamiento, Usuario } = require('../models');
const { requiereSesion } = require('../middleware/auth');

// --- RP-04 y RP-12: Crear un reporte (perdida o encontrada) ---
// POST /reportes
router.post('/reportes', requiereSesion, async (req, res) => {
  try {
    const { nombre_mascota, especie, color, tamano, zona, fecha, foto_url, comentario, estado } = req.body;

    // CA: no se puede publicar sin completar zona y fecha
    if (!especie || !zona || !fecha) {
      return res.status(400).json({ error: 'La especie, la zona y la fecha son obligatorias.' });
    }

    // El estado solo puede ser Perdida o Encontrada al crear
    const estadoInicial = estado === 'Encontrada' ? 'Encontrada' : 'Perdida';

    const reporte = await Reporte.create({
      usuario_id: req.session.usuario.id,
      nombre_mascota: nombre_mascota || null,
      especie, color: color || null, tamano: tamano || null,
      zona, fecha, foto_url: foto_url || null, comentario: comentario || null,
      estado: estadoInicial,
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

    // Por defecto se muestran las mascotas perdidas (RP-07)
    where.estado = estado || 'Perdida';

    // RP-08: filtros opcionales por especie y zona
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
router.put('/reportes/:id', requiereSesion, async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) {
      return res.status(404).json({ error: 'No se encontro el reporte.' });
    }
    // CA: solo el dueño del reporte puede editarlo
    if (reporte.usuario_id !== req.session.usuario.id) {
      return res.status(403).json({ error: 'Solo el dueño del reporte puede editarlo.' });
    }

    const campos = ['nombre_mascota', 'especie', 'color', 'tamano', 'zona', 'fecha', 'foto_url', 'comentario'];
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
    // Se buscan reportes "Encontrada" con la misma especie y zona
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
      order: [['fecha', 'DESC']], // del mas reciente al mas antiguo
    });
    res.json(avistamientos);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al obtener los avistamientos.' });
  }
});

module.exports = router;
