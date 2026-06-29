// app.js
// Punto de entrada del servidor de Huellita.
// Configura Express, las sesiones, las rutas de la API y sincroniza
// la base de datos con Sequelize.
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const { sequelize, Establecimiento, Usuario } = require('./models');
const rutasUsuarios = require('./routes/usuarios');
const rutasReportes = require('./routes/reportes');
const rutasEstablecimientos = require('./routes/establecimientos');

const app = express();
const PUERTO = process.env.PORT || 3000;

// --- Middlewares ---
app.use(express.json()); // permite leer el cuerpo JSON de las peticiones
app.use(express.urlencoded({ extended: true }));

// Configuracion de sesiones (para RP-02 y RP-03)
app.use(session({
  secret: process.env.SESSION_SECRET || 'huellita-clave-secreta',
  resave: false,
  saveUninitialized: false,
}));

// Archivos estaticos del cliente (HTML, CSS, JS, imagenes)
app.use(express.static(path.join(__dirname, 'public')));

// --- Rutas de la API ---
app.use('/', rutasUsuarios);
app.use('/', rutasReportes);
app.use('/', rutasEstablecimientos);

// --- Carga de datos iniciales del directorio (RP-14) ---
async function cargarDatosIniciales() {
  const cantidad = await Establecimiento.count();
  if (cantidad === 0) {
    await Establecimiento.bulkCreate([
      { nombre: 'Veterinaria San Roque', tipo: 'veterinaria', direccion: 'Av. 25 de Mayo 1200, Formosa', telefono: '370-4420015' },
      { nombre: 'Clinica Veterinaria Patitas', tipo: 'veterinaria', direccion: 'Av. Gutnisky 850, Formosa', telefono: '370-4431188' },
      { nombre: 'Veterinaria del Centro', tipo: 'veterinaria', direccion: 'Belgrano 540, Formosa', telefono: '370-4426700' },
      { nombre: 'Refugio Huellas Formosenas', tipo: 'refugio', direccion: 'Barrio San Antonio, Formosa', telefono: '370-4615522' },
      { nombre: 'Refugio Patas Unidas', tipo: 'refugio', direccion: 'Circunvalacion km 5, Formosa', telefono: '370-4778899' },
      { nombre: 'Veterinaria Mundo Animal', tipo: 'veterinaria', direccion: 'Espana 320, Formosa', telefono: '370-4409933' },
    ]);
    console.log('Datos iniciales del directorio cargados.');
  }
}

// --- Inicio del servidor ---
async function iniciar() {
  try {
    // sync crea las tablas si no existen
    await sequelize.sync();

//admin

const adminExiste = await Usuario.findOne({
  where: { correo: 'admin@huellita.com' }
});

if (!adminExiste) {
  await Usuario.create({
    nombre: 'Administrador',
    correo: 'admin@huellita.com',
    contrasena: 'admin123',
    rol: 'admin'
  });

  console.log('Usuario admin creado');
}

    await cargarDatosIniciales();
    app.listen(PUERTO, () => {
      console.log('Servidor de Huellita corriendo en http://localhost:' + PUERTO);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
  }
}

iniciar();
