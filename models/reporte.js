// models/reporte.js
// Modelo Reporte: representa la tabla Reportes.
// Almacena tanto mascotas perdidas como encontradas; se diferencian
// por el campo "estado".
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reporte = sequelize.define('Reporte', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false, // referencia al usuario que publico el reporte
  },
  nombre_mascota: {
    type: DataTypes.STRING,
    allowNull: true, // vacio cuando la mascota fue encontrada
  },
  especie: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tamano: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  zona: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  foto_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Perdida', // Perdida | Encontrada | Reencontrada
  },
}, {
  tableName: 'reportes',
  timestamps: false,
});

module.exports = Reporte;
