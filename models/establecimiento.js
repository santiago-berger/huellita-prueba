// models/establecimiento.js
// Modelo Establecimiento: representa la tabla Establecimientos.
// Contiene las veterinarias y refugios del directorio.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Establecimiento = sequelize.define('Establecimiento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false, // "veterinaria" | "refugio"
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'establecimientos',
  timestamps: false,
});

module.exports = Establecimiento;
