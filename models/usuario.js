// models/usuario.js
// Modelo Usuario: representa la tabla Usuarios de la base de datos.
// Se agrega el campo "rol" para distinguir entre usuarios normales
// y administradores del sistema.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // no se permiten dos cuentas con el mismo correo
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    // Rol del usuario dentro del sistema.
    // "usuario": puede administrar únicamente sus publicaciones.
    // "admin": puede administrar todas las publicaciones.
    type: DataTypes.ENUM('usuario', 'admin'),
    allowNull: false,
    defaultValue: 'usuario',
  },
}, {
  tableName: 'usuarios',
  timestamps: false,
});

module.exports = Usuario;