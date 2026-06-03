// config/database.js
// Configuracion de la conexion a la base de datos con Sequelize.
//
// El proyecto usa MySQL como motor de base de datos, segun la
// documentacion. Antes de iniciar el servidor por primera vez,
// se debe crear una base de datos vacia llamada "huellita".
//
// Sequelize se encarga de crear las tablas automaticamente al
// arrancar el servidor (mediante sequelize.sync() en app.js).

const { Sequelize } = require('sequelize');

// --- Datos de conexion a MySQL ---
// Ajustar el usuario y la contrasena segun la instalacion local
// de MySQL de cada equipo.
const NOMBRE_BD   = 'huellita';
const USUARIO_BD  = 'root';
const CLAVE_BD    = '';
const HOST_BD     = 'localhost';

const sequelize = new Sequelize(NOMBRE_BD, USUARIO_BD, CLAVE_BD, {
  host: HOST_BD,
  dialect: 'mysql',
  logging: false, // poner true para ver las consultas SQL en la consola
});

module.exports = sequelize;
