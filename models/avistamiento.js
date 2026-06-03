// models/avistamiento.js
// Modelo Avistamiento: representa la tabla Avistamientos.
// Cada avistamiento esta asociado a un reporte.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Avistamiento = sequelize.define('Avistamiento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reporte_id: {
    type: DataTypes.INTEGER,
    allowNull: false, // referencia al reporte de la mascota avistada
  },
  lugar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'avistamientos',
  timestamps: false,
});

module.exports = Avistamiento;
