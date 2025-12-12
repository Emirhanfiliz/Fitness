import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./database";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Fitness salon API" });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

async function initializeTables() {
  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS yoneticiler (
        id SERIAL PRIMARY KEY,
        eposta VARCHAR(255) NOT NULL UNIQUE,
        sifre VARCHAR(255) NOT NULL,
        olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS uyeler (
        id SERIAL PRIMARY KEY,
        ad VARCHAR(255) NOT NULL,
        eposta VARCHAR(255) NOT NULL,
        telefon VARCHAR(255) NOT NULL,
        sifre VARCHAR(255) NOT NULL,
        uyelik_bitis_tarihi DATE NOT NULL,
        olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Mevcut tablolara şifre kolonu ekle (eğer yoksa)
    try {
      await pool.query(`
        ALTER TABLE uyeler 
        ADD COLUMN IF NOT EXISTS sifre VARCHAR(255) NOT NULL DEFAULT '123456'
      `);
    } catch (err) {
      // Kolon zaten varsa hata vermez, devam et
      console.log("Şifre kolonu zaten mevcut veya eklenemedi:", err);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stok_urunleri (
        id SERIAL PRIMARY KEY,
        ad VARCHAR(255) NOT NULL,
        miktar INTEGER NOT NULL DEFAULT 0,
        min_miktar INTEGER NOT NULL DEFAULT 0
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS calisanlar (
        id SERIAL PRIMARY KEY,
        ad VARCHAR(255) NOT NULL,
        pozisyon VARCHAR(255) NOT NULL,
        telefon VARCHAR(255) NOT NULL,
        maas INTEGER NOT NULL DEFAULT 0,
        aktif BOOLEAN NOT NULL DEFAULT true,
        ise_baslama_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ekipmanlar (
        id SERIAL PRIMARY KEY,
        ad VARCHAR(255) NOT NULL,
        tip VARCHAR(255) NOT NULL,
        son_bakim_tarihi DATE NOT NULL,
        sonraki_bakim_tarihi DATE NOT NULL,
        durum VARCHAR(255) NOT NULL DEFAULT 'Aktif'
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS giris_loglari (
        id SERIAL PRIMARY KEY,
        uye_id INTEGER REFERENCES uyeler(id) ON DELETE SET NULL,
        yontem VARCHAR(50) NOT NULL,
        olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error("Error initializing tables:", err);
    throw err;
  }
}

async function start() {
  try {
    await pool.query("SELECT 1");
    
    // Initialize tables if they don't exist
    await initializeTables();

    const adminResult = await pool.query("SELECT COUNT(*) as count FROM yoneticiler");
    const adminCount = parseInt(adminResult.rows[0].count);
    
    if (adminCount === 0) {
      const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@admin.com";
      const password = process.env.DEFAULT_ADMIN_PASSWORD || "123456";
      await pool.query(
        "INSERT INTO yoneticiler (eposta, sifre) VALUES ($1, $2)",
        [email, password]
      );
    }

    const stockResult = await pool.query("SELECT COUNT(*) as count FROM stok_urunleri");
    const stockCount = parseInt(stockResult.rows[0].count);
    
    if (stockCount === 0) {
      await pool.query(
        "INSERT INTO stok_urunleri (ad, miktar, min_miktar) VALUES ($1, $2, $3), ($4, $5, $6), ($7, $8, $9)",
        ["Protein Tozu", 10, 3, "Kreatin", 8, 2, "BCAA", 5, 2]
      );
    }

    const ekipmanResult = await pool.query("SELECT COUNT(*) as count FROM ekipmanlar");
    const ekipmanCount = parseInt(ekipmanResult.rows[0].count);
    
    if (ekipmanCount === 0) {
      const simdi = new Date();
      const birAySonra = new Date(simdi);
      birAySonra.setMonth(birAySonra.getMonth() + 1);
      const ucAySonra = new Date(simdi);
      ucAySonra.setMonth(ucAySonra.getMonth() + 3);

      await pool.query(
        "INSERT INTO ekipmanlar (ad, tip, son_bakim_tarihi, sonraki_bakim_tarihi, durum) VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10), ($11, $12, $13, $14, $15)",
        [
          "Koşu Bandı 1", "Kardiyovasküler", simdi, ucAySonra, "Aktif",
          "Dambıl Seti", "Ağırlık", simdi, birAySonra, "Aktif",
          "Bench Press", "Ağırlık", simdi, ucAySonra, "Aktif"
        ]
      );
    }

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
