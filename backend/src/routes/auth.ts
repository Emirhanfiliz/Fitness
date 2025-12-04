import { Router } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../database";

export const authRouter = Router();

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
