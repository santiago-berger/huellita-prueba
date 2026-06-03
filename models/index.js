// models/index.js
// Reune todos los modelos y define las relaciones entre las tablas.
const sequelize = require('../config/database');
const Usuario = require('./usuario');
const Reporte = require('./reporte');
const Avistamiento = require('./avistamiento');
const Establecimiento = require('./establecimiento');

// --- Relaciones ---
// Un Usuario puede tener muchos Reportes (uno a muchos).
Usuario.hasMany(Reporte, { foreignKey: 'usuario_id' });
Reporte.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Un Reporte puede tener muchos Avistamientos (uno a muchos).
Reporte.hasMany(Avistamiento, { foreignKey: 'reporte_id' });
Avistamiento.belongsTo(Reporte, { foreignKey: 'reporte_id' });

module.exports = {
  sequelize,
  Usuario,
  Reporte,
  Avistamiento,
  Establecimiento,
};
