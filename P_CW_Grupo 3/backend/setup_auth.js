/**
 * =========================================================================
 * ARCHIVO: setup_auth.js
 * FUNCIÓN: Script de configuración inicial (se corre una sola vez).
 * Crea el usuario administrador por defecto (admin@gmail.com) y actualiza 
 * la base de datos si falta alguna columna (como plan_json).
 * =========================================================================
 */
const pool = require('./db');
const bcrypt = require('bcryptjs');

async function run() {
  try {
    console.log('Actualizando tabla usuarios...');
    // Ignorar si la columna ya existe capturando el error
    try {
      await pool.query("ALTER TABLE usuarios ADD COLUMN rol ENUM('user', 'admin') DEFAULT 'user'");
    } catch (e) {
      if (!e.message.includes("Duplicate column name")) throw e;
    }

    console.log('Actualizando tabla planes_semana...');
    try {
      await pool.query("ALTER TABLE planes_semana ADD COLUMN plan_json JSON");
    } catch (e) {
      if (!e.message.includes("Duplicate column name")) throw e;
    }

    console.log('Creando usuario administrador...');
    const hash = await bcrypt.hash('admin', 10);
    // Verificar si ya existe para no duplicar
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = 'admin@gmail.com'");
    if (rows.length === 0) {
      await pool.query("INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ('Administrador', 'admin@gmail.com', ?, 'admin')", [hash]);
      console.log('Administrador admin@gmail.com creado con éxito.');
    } else {
      console.log('El administrador ya existe. Actualizando contraseña y rol...');
      await pool.query("UPDATE usuarios SET password_hash = ?, rol = 'admin' WHERE email = 'admin@gmail.com'", [hash]);
    }
    
    console.log("¡Configuración de base de datos para Auth y Admin completada!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
