import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'museum.db');
const db = new Database(dbPath);

// Inicializar la tabla de obras si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS obras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    fecha TEXT NOT NULL,
    imagen_url TEXT NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
