import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { initialMenu } from '../src/data/initialMenu.js';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'node256.iseencloud.net',
  user: process.env.DB_USER || 'amigoweb_idlish',
  password: process.env.DB_PASSWORD || 'Aammigo@123',
  port: parseInt(process.env.DB_PORT || '3306')
};

const dbName = process.env.DB_DATABASE || process.env.DB_NAME || 'amigoweb_idlish';

let pool;

// Database initialization promise to resolve race conditions
let resolveDbReady;
export const dbReady = new Promise((resolve) => {
  resolveDbReady = resolve;
});

async function seedMariaDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price DOUBLE NOT NULL,
      originalPrice DOUBLE,
      discountText VARCHAR(50),
      category VARCHAR(100) NOT NULL,
      isVeg TINYINT(1) DEFAULT 1,
      spicyLevel INT DEFAULT 0,
      rating DOUBLE DEFAULT 4.5,
      isBestSeller TINYINT(1) DEFAULT 0,
      isAvailable TINYINT(1) DEFAULT 1,
      icon VARCHAR(10),
      image VARCHAR(255),
      customization TINYINT(1) DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      customerName VARCHAR(100) NOT NULL,
      customerPhone VARCHAR(20) NOT NULL,
      type VARCHAR(20) NOT NULL,
      address TEXT,
      outlet VARCHAR(100) NOT NULL,
      items TEXT NOT NULL,
      subtotal DOUBLE NOT NULL,
      packagingFee DOUBLE,
      gst DOUBLE NOT NULL,
      deliveryCharges DOUBLE,
      total DOUBLE NOT NULL,
      paymentMethod VARCHAR(20) NOT NULL,
      paymentStatus VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL,
      timestamp VARCHAR(50) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS outlets (
      name VARCHAR(100) PRIMARY KEY,
      status VARCHAR(20) NOT NULL
    )
  `);

  const [outletsRows] = await pool.query(`SELECT COUNT(*) as count FROM outlets`);
  if (outletsRows[0].count === 0) {
    console.log('Seeding outlets into MariaDB...');
    await pool.query(`INSERT INTO outlets (name, status) VALUES ('Goregaon East', 'Open')`);
    await pool.query(`INSERT INTO outlets (name, status) VALUES ('Vile Parle West', 'Open')`);
  }

  const [menuRows] = await pool.query(`SELECT COUNT(*) as count FROM menu`);
  if (menuRows[0].count === 0) {
    console.log('Seeding menu catalog into MariaDB...');
    for (const item of initialMenu) {
      await pool.query(`
        INSERT INTO menu (
          id, name, description, price, originalPrice, discountText, 
          category, isVeg, spicyLevel, rating, isBestSeller, isAvailable, 
          icon, image, customization
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.id, item.name, item.description, item.price, item.originalPrice || null,
        item.discountText || null, item.category, item.isVeg ? 1 : 0, item.spicyLevel || 0,
        item.rating || 4.5, item.isBestSeller ? 1 : 0, item.isAvailable ? 1 : 0,
        item.icon || null, item.image || null, item.customization ? 1 : 0
      ]);
    }
  }
}

async function initDatabase() {
  try {
    console.log(`Attempting to connect to MariaDB at ${dbConfig.host}:${dbConfig.port}...`);
    const connection = await mysql.createConnection({
      ...dbConfig,
      connectTimeout: 2000 // fail fast if not running
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await seedMariaDB();
    console.log(`Connected to MariaDB server successfully! Database: ${dbName}`);
    resolveDbReady();
  } catch (err) {
    console.error(`\n❌  MariaDB connection failed: ${err.message || err}`);
    console.error(`❌  SQLite fallback disabled. Server will remain offline.\n`);
    // Do not resolve dbReady, requests will stay blocked or throw error to let user know connection failed
  }
}

initDatabase();

// --- SQL Wrapper Actions ---

export const query = async (sql, params = []) => {
  await dbReady; // Wait until connection is ready
  const [rows] = await pool.query(sql, params);
  return rows;
};

export const get = async (sql, params = []) => {
  await dbReady;
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
};

export const run = async (sql, params = []) => {
  await dbReady;
  const [result] = await pool.query(sql, params);
  return { id: result.insertId, changes: result.affectedRows };
};

// Data mappers
export const mapMenuItem = (row) => {
  if (!row) return null;
  return {
    ...row,
    isVeg: row.isVeg === 1 || row.isVeg === true,
    isBestSeller: row.isBestSeller === 1 || row.isBestSeller === true,
    isAvailable: row.isAvailable === 1 || row.isAvailable === true,
    customization: row.customization === 1 || row.customization === true
  };
};

export const mapOrder = (row) => {
  if (!row) return null;
  return {
    ...row,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
  };
};
