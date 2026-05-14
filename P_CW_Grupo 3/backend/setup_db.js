/**
 * =========================================================================
 * ARCHIVO: setup_db.js
 * FUNCIÓN: Script de migración inicial.
 * Se encarga de conectarse a MySQL y crear automáticamente todas las tablas
 * necesarias para que el sistema funcione (usuarios, recetas, planes, etc)
 * en caso de que no existan.
 * =========================================================================
 */
const pool = require('./db');

async function setup() {
  try {
    console.log('Creando tabla usuarios...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        nombre        VARCHAR(100),
        email         VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        plan_activo   ENUM('gratis','pro') DEFAULT 'gratis',
        created_at    DATETIME DEFAULT NOW()
      )
    `);

    console.log('Creando tabla recetas...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recetas (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id  INT NOT NULL,
        nombre      VARCHAR(255) NOT NULL,
        descripcion TEXT,
        porciones   INT DEFAULT 2,
        tiempo_min  INT DEFAULT 30,
        categoria   VARCHAR(100),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);

    console.log('Creando tabla receta_ingrediente...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS receta_ingrediente (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        receta_id       INT NOT NULL,
        nombre_ingrediente VARCHAR(255) NOT NULL,
        cantidad        DECIMAL(8,2),
        unidad          VARCHAR(50),
        FOREIGN KEY (receta_id) REFERENCES recetas(id)
      )
    `);

    console.log('Creando tabla planes_semana...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS planes_semana (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id    INT NOT NULL,
        semana_inicio DATE NOT NULL,
        costo_aki     DECIMAL(8,2) DEFAULT 0,
        costo_supermaxi DECIMAL(8,2) DEFAULT 0,
        created_at    DATETIME DEFAULT NOW(),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);

    console.log('Creando tabla plan_receta...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plan_receta (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        plan_id    INT NOT NULL,
        receta_id  INT NOT NULL,
        dia_semana ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo'),
        momento    ENUM('desayuno','almuerzo','cena','merienda'),
        FOREIGN KEY (plan_id) REFERENCES planes_semana(id),
        FOREIGN KEY (receta_id) REFERENCES recetas(id)
      )
    `);

    console.log('Creando tabla lista_compras...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lista_compras (
        id                 INT AUTO_INCREMENT PRIMARY KEY,
        plan_id            INT NOT NULL,
        nombre_ingrediente VARCHAR(255),
        cantidad_total     DECIMAL(8,2),
        unidad             VARCHAR(50),
        precio_aki         DECIMAL(8,2),
        precio_supermaxi   DECIMAL(8,2),
        comprado           BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (plan_id) REFERENCES planes_semana(id)
      )
    `);

    console.log('¡Todas las tablas creadas exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error creando tablas:', error);
    process.exit(1);
  }
}

setup();
