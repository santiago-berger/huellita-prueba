// routes/establecimientos.js
// Ruta del directorio de veterinarias y refugios.
// Funcionalidad RP-14.
const express = require('express');
const router = express.Router();
const { Establecimiento } = require('../models');

// --- RP-14: Directorio de veterinarias y refugios ---
// GET /establecimientos?tipo=
router.get('/establecimientos', async (req, res) => {
  try {
    const { tipo } = req.query;
    const where = {};
    if (tipo) where.tipo = tipo; // filtro opcional por tipo

    const lista = await Establecimiento.findAll({ where, order: [['nombre', 'ASC']] });
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al obtener el directorio.' });
  }
});

module.exports = router;
