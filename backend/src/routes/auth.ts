import { Router } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../database";
import crypto from "crypto";

export const authRouter = Router();

// QR kod token'larını saklamak için geçici depo (production'da Redis kullanılmalı)
const qrTokens = new Map<string, { expiresAt: number }>();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email ve şifre zorunlu" });
  }

  const result = await pool.query(
    "SELECT id, eposta, sifre FROM yoneticiler WHERE eposta = $1",
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Geçersiz giriş bilgileri" });
  }

  const admin = result.rows[0];
  if (admin.sifre !== password) {
    return res.status(401).json({ message: "Geçersiz giriş bilgileri" });
  }

  const secret = process.env.JWT_SECRET || "dev_secret";
  const token = jwt.sign(
    { id: admin.id, email: admin.eposta },
    secret,
    { expiresIn: "8h" }
  );

  return res.json({ token });
});

// QR kod token'ı oluştur (her 1 dakikada bir yenilenir)
authRouter.get("/qr-token", async (req, res) => {
  // Eski token'ları temizle
  const now = Date.now();
  for (const [token, data] of qrTokens.entries()) {
    if (data.expiresAt < now) {
      qrTokens.delete(token);
    }
  }

  // Yeni token oluştur (60 saniye geçerli)
  const token = crypto.randomBytes(32).toString("hex");
  qrTokens.set(token, {
    expiresAt: now + 60000, // 60 saniye (1 dakika)
  });

  return res.json({ token, expiresIn: 60 });
});

// QR kod ile giriş (şifre kontrolü ile)
authRouter.post("/qr-login", async (req, res) => {
  const { token, password, email } = req.body;

  if (!token || !password || !email) {
    return res.status(400).json({ message: "Token, email ve şifre zorunlu" });
  }

  // Token'ın geçerli olup olmadığını kontrol et
  const tokenData = qrTokens.get(token);
  if (!tokenData) {
    return res.status(401).json({ message: "Geçersiz veya süresi dolmuş QR kod" });
  }

  if (tokenData.expiresAt < Date.now()) {
    qrTokens.delete(token);
    return res.status(401).json({ message: "QR kod süresi dolmuş" });
  }

  // Üyeyi email ile bul ve şifresini kontrol et
  const result = await pool.query(
    "SELECT id, ad, eposta, sifre, uyelik_bitis_tarihi FROM uyeler WHERE eposta = $1",
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Üye bulunamadı" });
  }

  const uye = result.rows[0];
  
  // Üyelik süresinin dolup dolmadığını kontrol et
  const uyelikBitisTarihi = new Date(uye.uyelik_bitis_tarihi);
  const simdi = new Date();
  if (uyelikBitisTarihi < simdi) {
    return res.status(401).json({ message: "Üyelik süreniz dolmuş" });
  }

  // Şifreyi kontrol et
  if (uye.sifre !== password) {
    return res.status(401).json({ message: "Geçersiz şifre" });
  }

  // Token'ı kullanıldığı için sil
  qrTokens.delete(token);

  return res.json({ 
    success: true, 
    message: "Giriş başarılı",
    member: {
      id: uye.id,
      name: uye.ad,
      email: uye.eposta
    }
  });
});
