# Huellita

Aplicacion web de busqueda de mascotas perdidas - Ciudad de Formosa.
Proyecto de la asignatura Taller de Lenguajes de Programacion I.

## Tecnologias

- HTML, CSS y Bootstrap 5 (cliente)
- JavaScript (validaciones y manipulacion del DOM)
- Node.js con Express (servidor)
- MySQL con Sequelize (base de datos)

## Requisitos previos

- Node.js instalado (version 16 o superior).
- MySQL instalado y en ejecucion.

## Instalacion

1. Crear en MySQL una base de datos vacia llamada `huellita`:

   ```sql
   CREATE DATABASE huellita;
   ```

2. Abrir el archivo `config/database.js` y ajustar el usuario y la
   contrasena de MySQL segun la instalacion de cada equipo.

3. Abrir una terminal en la carpeta del proyecto e instalar las
   dependencias:

   ```
   npm install
   ```

   Las tablas se crean automaticamente la primera vez que arranca
   el servidor, porque Sequelize ejecuta sync().

## Ejecucion

```
npm start
```

Luego abrir el navegador en: http://localhost:3000

## Funcionalidades

El proyecto implementa las 15 funcionalidades del Product Backlog,
agrupadas en 5 Epics:

- Epic 1 - Acceso: registro, inicio y cierre de sesion (RP-01 a RP-03).
- Epic 2 - Publicacion: reportar, ficha y edicion de casos (RP-04 a RP-06).
- Epic 3 - Busqueda: listado, filtros y coincidencias (RP-07 a RP-09).
- Epic 4 - Colaboracion: avistamientos y mascotas encontradas (RP-10 a RP-12).
- Epic 5 - Prevencion: guia, directorio y cartel imprimible (RP-13 a RP-15).

## Estructura del proyecto

```
huellita/
|-- app.js               Punto de entrada del servidor
|-- package.json         Dependencias del proyecto
|-- config/              Configuracion de la base de datos
|   '-- database.js
|-- models/              Modelos Sequelize (tablas)
|   |-- index.js         Reune los modelos y define las relaciones
|   |-- usuario.js
|   |-- reporte.js
|   |-- avistamiento.js
|   '-- establecimiento.js
|-- routes/              Rutas de la API REST
|   |-- usuarios.js
|   |-- reportes.js
|   '-- establecimientos.js
|-- middleware/          Verificacion de sesion
|   '-- auth.js
'-- public/              Archivos del cliente
    |-- index.html       Pagina principal
    |-- login.html       Registro e inicio de sesion
    |-- publicar.html    Publicar o editar un caso
    |-- reportes.html    Listado de mascotas perdidas
    |-- encontradas.html Listado de mascotas encontradas
    |-- ficha.html       Ficha detallada de una mascota
    |-- cartel.html      Cartel de busqueda imprimible
    |-- guia.html        Guia de pasos a seguir
    |-- directorio.html  Directorio de veterinarias y refugios
    |-- css/             Hojas de estilo
    |-- js/              Scripts del cliente
    '-- img/             Imagenes (logo, imagen por defecto)
```

## Datos iniciales

Al arrancar por primera vez, el servidor carga automaticamente
seis establecimientos de ejemplo (veterinarias y refugios) en el
directorio, para que la seccion correspondiente no quede vacia.
