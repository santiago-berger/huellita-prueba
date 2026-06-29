// routes/reportes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const { Op } = require('sequelize');
const { Reporte, Avistamiento, Usuario } = require('../models');
const { requiereSesion } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/* =========================
   MULTER (FOTOS)
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const nombre = Date.now() + path.extname(file.originalname);
    cb(null, nombre);
  }
});

const upload = multer({ storage });

/* =========================
   VALIDACIONES
========================= */
const reglasReporte = [
  body('especie')
    .trim()
    .notEmpty().withMessage('La especie es obligatoria')
    .isIn(['perro', 'gato', 'otro']),

  body('zona')
    .trim()
    .notEmpty().withMessage('La zona es obligatoria'),

  body('fecha')
    .notEmpty().withMessage('La fecha es obligatoria')
    .isDate()
];

/* =========================
   CREAR REPORTE
========================= */
router.post('/reportes', requiereSesion, upload.single('foto'), reglasReporte, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  try {
    const {
      nombre_mascota,
      especie,
      raza,
      color,
      tamano,
      zona,
      fecha,
      comentario,
      estado,
      latitud,
      longitud
    } = req.body;

    const foto_url = req.file ? '/uploads/' + req.file.filename : null;
    const estadoInicial = estado === 'Encontrada' ? 'Encontrada' : 'Perdida';

    const reporte = await Reporte.create({
      usuario_id: req.session.usuario.id,
      nombre_mascota: nombre_mascota || null,
      especie,
      raza: raza || null,
      color: color || null,
      tamano: tamano || null,
      zona,
      fecha,
      comentario: comentario || null,
      foto_url,
      estado: estadoInicial,
      latitud: latitud || null,
      longitud: longitud || null
    });

    res.status(201).json({ mensaje: 'Reporte publicado con exito.', id: reporte.id });

  } catch (err) {
    res.status(500).json({ error: 'Error del servidor.' });
  }
});

/* =========================
   LISTAR REPORTES
========================= */
router.get('/reportes', async (req, res) => {
  try {
    const { estado, especie, zona } = req.query;
    const where = {};

    where.estado = estado || 'Perdida';
    if (especie) where.especie = especie;
    if (zona) where.zona = { [Op.like]: `%${zona}%` };

    const reportes = await Reporte.findAll({
      where,
      order: [['fecha', 'DESC']]
    });

    res.json(reportes);

  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reportes.' });
  }
});

/* =========================
   FICHA
========================= */
router.get('/reportes/:id', async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id, {
      include: [{ model: Usuario, attributes: ['nombre'] }]
    });

    if (!reporte) {
      return res.status(404).json({ error: 'No encontrado' });
    }

    res.json(reporte);

  } catch (err) {
    res.status(500).json({ error: 'Error servidor.' });
  }
});

/* =========================
   EDITAR
========================= */
router.put('/reportes/:id', requiereSesion, reglasReporte, async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);

    if (!reporte) return res.status(404).json({ error: 'No existe' });
    if (reporte.usuario_id !== req.session.usuario.id)
      return res.status(403).json({ error: 'Sin permiso' });

    Object.keys(req.body).forEach(campo => {
      if (req.body[campo] !== undefined) reporte[campo] = req.body[campo];
    });

    await reporte.save();
    res.json({ mensaje: 'Actualizado' });

  } catch (err) {
    res.status(500).json({ error: 'Error servidor' });
  }
});

/* =========================
   CERRAR CASO
========================= */
router.put('/reportes/:id/cerrar', requiereSesion, async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);

    if (!reporte) return res.status(404).json({ error: 'No existe' });
    if (reporte.usuario_id !== req.session.usuario.id)
      return res.status(403).json({ error: 'Sin permiso' });

    reporte.estado = 'Reencontrada';
    await reporte.save();

    res.json({ mensaje: 'Caso cerrado' });

  } catch (err) {
    res.status(500).json({ error: 'Error servidor' });
  }
});

/* =========================
   COINCIDENCIAS
========================= */
router.get('/reportes/:id/coincidencias', async (req, res) => {
  try {
    const r = await Reporte.findByPk(req.params.id);

    const lista = await Reporte.findAll({
      where: {
        estado: 'Encontrada',
        especie: r.especie,
        zona: { [Op.like]: `%${r.zona}%` }
      }
    });

    res.json(lista);

  } catch (err) {
    res.status(500).json({ error: 'Error servidor' });
  }
});

/* =========================
   AVISTAMIENTOS (CORRECTO)
========================= */
router.post('/reportes/:id/avistamientos', requiereSesion, async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) return res.status(404).json({ error: 'No existe' });

    const { lugar, fecha, comentario } = req.body;

    if (!lugar || !fecha) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    await Avistamiento.create({
      reporte_id: reporte.id,
      lugar,
      fecha,
      comentario: comentario || null
    });

    res.status(201).json({ mensaje: 'Avistamiento guardado' });

  } catch (err) {
    res.status(500).json({ error: 'Error servidor' });
  }
});

/* =========================
   LISTAR AVISTAMIENTOS
========================= */
router.get('/reportes/:id/avistamientos', async (req, res) => {
  try {
    const data = await Avistamiento.findAll({
      where: { reporte_id: req.params.id },
      order: [['fecha', 'DESC']]
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: 'Error servidor' });
  }
});

/* =========================
   ELIMINAR
========================= */
router.delete('/reportes/:id', requiereSesion, async (req, res) => {
  try {
    const r = await Reporte.findByPk(req.params.id);

    if (!r) return res.status(404).json({ error: 'No existe' });

    if (r.usuario_id !== req.session.usuario.id && req.session.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Sin permiso' });
    }

    await r.destroy();
    res.json({ mensaje: 'Eliminado' });

  } catch (err) {
    res.status(500).json({ error: 'Error servidor' });
  }
});

module.exports = router;