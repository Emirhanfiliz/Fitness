import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { pool } from "../database";

export const adminRouter = Router();

adminRouter.use(authMiddleware);

adminRouter.post("/members", async (req, res) => {
  const { name, email, phone, password, durationMonths } = req.body;
  if (!name || !email || !phone || !password || !durationMonths) {
    return res
      .status(400)
      .json({ message: "Tüm alanlar zorunludur" });
  }

  const months = Number(durationMonths);
  if (Number.isNaN(months) || months <= 0) {
    return res
      .status(400)
      .json({ message: "Üyelik süresi (ay) pozitif olmalıdır" });
  }

  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);

  const result = await pool.query(
    'INSERT INTO uyeler (ad, eposta, telefon, sifre, uyelik_bitis_tarihi) VALUES ($1, $2, $3, $4, $5) RETURNING id, ad as name, eposta as email, telefon as phone, uyelik_bitis_tarihi as "membershipEnd", olusturma_tarihi as "createdAt"',
    [name, email, phone, password, end]
  );

  return res.status(201).json(result.rows[0]);
});

adminRouter.get("/members", async (_req, res) => {
  const result = await pool.query(
    'SELECT id, ad as name, eposta as email, telefon as phone, uyelik_bitis_tarihi as "membershipEnd", olusturma_tarihi as "createdAt" FROM uyeler ORDER BY olusturma_tarihi DESC'
  );
  return res.json(result.rows);
});

adminRouter.delete("/members/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM uyeler WHERE id = $1 RETURNING *", [id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Üye bulunamadı" });
  }
  
  return res.status(204).send();
});

adminRouter.get("/dashboard", async (_req, res) => {
  const totalResult = await pool.query("SELECT COUNT(*) as count FROM uyeler");
  const totalMembers = parseInt(totalResult.rows[0].count);

  const now = new Date();
  const activeResult = await pool.query(
    "SELECT COUNT(*) as count FROM uyeler WHERE uyelik_bitis_tarihi >= $1",
    [now]
  );
  const activeMembers = parseInt(activeResult.rows[0].count);

  const capacity = 100;
  const occupancyRate = Math.min(
    100,
    Math.round((activeMembers / capacity) * 100)
  );

  const monthlyResult = await pool.query(`
    SELECT
      to_char(olusturma_tarihi, 'YYYY-MM') as month,
      COUNT(*)::int as count
    FROM uyeler
    GROUP BY to_char(olusturma_tarihi, 'YYYY-MM')
    ORDER BY month DESC
    LIMIT 6
  `);

  return res.json({
    totalMembers,
    activeMembers,
    capacity,
    occupancyRate,
    monthlyStats: monthlyResult.rows,
  });
});

adminRouter.get("/stock", async (_req, res) => {
  const result = await pool.query("SELECT id, ad as name, miktar as quantity, min_miktar as \"minQuantity\" FROM stok_urunleri");
  return res.json(result.rows);
});

adminRouter.post("/stock", async (req, res) => {
  const { name, quantity, minQuantity } = req.body;
  if (!name) {
    return res.status(400).json({ message: "İsim zorunlu" });
  }
  
  const result = await pool.query(
    'INSERT INTO stok_urunleri (ad, miktar, min_miktar) VALUES ($1, $2, $3) RETURNING id, ad as name, miktar as quantity, min_miktar as "minQuantity"',
    [name, quantity ?? 0, minQuantity ?? 0]
  );
  
  return res.status(201).json(result.rows[0]);
});

adminRouter.put("/stock/:id", async (req, res) => {
  const { id } = req.params;
  const { name, quantity, minQuantity } = req.body;
  
  const checkResult = await pool.query("SELECT id, ad as name, miktar as quantity, min_miktar as \"minQuantity\" FROM stok_urunleri WHERE id = $1", [id]);
  if (checkResult.rows.length === 0) {
    return res.status(404).json({ message: "Ürün bulunamadı" });
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`ad = $${paramIndex++}`);
    values.push(name);
  }
  if (quantity !== undefined) {
    updates.push(`miktar = $${paramIndex++}`);
    values.push(quantity);
  }
  if (minQuantity !== undefined) {
    updates.push(`min_miktar = $${paramIndex++}`);
    values.push(minQuantity);
  }

  if (updates.length === 0) {
    return res.json(checkResult.rows[0]);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE stok_urunleri SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING id, ad as name, miktar as quantity, min_miktar as "minQuantity"`,
    values
  );

  return res.json(result.rows[0]);
});

adminRouter.delete("/stock/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM stok_urunleri WHERE id = $1 RETURNING *", [id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Ürün bulunamadı" });
  }
  
  return res.status(204).send();
});

adminRouter.get("/employees", async (_req, res) => {
  const result = await pool.query('SELECT id, ad as name, pozisyon as role, telefon as phone, maas as salary, aktif as active, ise_baslama_tarihi as "hiredAt" FROM calisanlar ORDER BY ise_baslama_tarihi DESC');
  return res.json(result.rows);
});

adminRouter.post("/employees", async (req, res) => {
  const { name, role, phone, salary } = req.body;
  if (!name || !role || !phone) {
    return res
      .status(400)
      .json({ message: "İsim, pozisyon ve telefon zorunlu" });
  }
  
  const result = await pool.query(
    'INSERT INTO calisanlar (ad, pozisyon, telefon, maas) VALUES ($1, $2, $3, $4) RETURNING id, ad as name, pozisyon as role, telefon as phone, maas as salary, aktif as active, ise_baslama_tarihi as "hiredAt"',
    [name, role, phone, Number(salary) || 0]
  );
  
  return res.status(201).json(result.rows[0]);
});

adminRouter.put("/employees/:id/toggle", async (req, res) => {
  const { id } = req.params;
  
  const checkResult = await pool.query('SELECT id, ad as name, pozisyon as role, telefon as phone, maas as salary, aktif as active, ise_baslama_tarihi as "hiredAt" FROM calisanlar WHERE id = $1', [id]);
  if (checkResult.rows.length === 0) {
    return res.status(404).json({ message: "Çalışan bulunamadı" });
  }

  const newActive = !checkResult.rows[0].active;
  const result = await pool.query(
    'UPDATE calisanlar SET aktif = $1 WHERE id = $2 RETURNING id, ad as name, pozisyon as role, telefon as phone, maas as salary, aktif as active, ise_baslama_tarihi as "hiredAt"',
    [newActive, id]
  );

  return res.json(result.rows[0]);
});

adminRouter.get("/ekipmanlar", async (_req, res) => {
  const result = await pool.query('SELECT id, ad, tip, son_bakim_tarihi as "sonBakimTarihi", sonraki_bakim_tarihi as "sonrakiBakimTarihi", durum FROM ekipmanlar ORDER BY sonraki_bakim_tarihi ASC');
  return res.json(result.rows);
});

adminRouter.post("/ekipmanlar", async (req, res) => {
  const { ad, tip, sonBakimTarihi, bakimAraligiAy } = req.body;
  if (!ad || !tip || !sonBakimTarihi) {
    return res.status(400).json({ message: "Ad, tip ve son bakım tarihi zorunlu" });
  }

  const sonBakim = new Date(sonBakimTarihi);
  const sonrakiBakim = new Date(sonBakim);
  sonrakiBakim.setMonth(sonrakiBakim.getMonth() + (Number(bakimAraligiAy) || 3));

  const result = await pool.query(
    'INSERT INTO ekipmanlar (ad, tip, son_bakim_tarihi, sonraki_bakim_tarihi, durum) VALUES ($1, $2, $3, $4, $5) RETURNING id, ad, tip, son_bakim_tarihi as "sonBakimTarihi", sonraki_bakim_tarihi as "sonrakiBakimTarihi", durum',
    [ad, tip, sonBakim, sonrakiBakim, "Aktif"]
  );
  
  return res.status(201).json(result.rows[0]);
});

adminRouter.put("/ekipmanlar/:id", async (req, res) => {
  const { id } = req.params;
  const { ad, tip, sonBakimTarihi, bakimAraligiAy, durum } = req.body;

  const checkResult = await pool.query('SELECT id, ad, tip, son_bakim_tarihi as "sonBakimTarihi", sonraki_bakim_tarihi as "sonrakiBakimTarihi", durum FROM ekipmanlar WHERE id = $1', [id]);
  if (checkResult.rows.length === 0) {
    return res.status(404).json({ message: "Ekipman bulunamadı" });
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (ad !== undefined) {
    updates.push(`ad = $${paramIndex++}`);
    values.push(ad);
  }
  if (tip !== undefined) {
    updates.push(`tip = $${paramIndex++}`);
    values.push(tip);
  }
  if (durum !== undefined) {
    updates.push(`durum = $${paramIndex++}`);
    values.push(durum);
  }
  
  if (sonBakimTarihi !== undefined) {
    const sonBakim = new Date(sonBakimTarihi);
    updates.push(`son_bakim_tarihi = $${paramIndex++}`);
    values.push(sonBakim);
    const sonrakiBakim = new Date(sonBakim);
    sonrakiBakim.setMonth(sonrakiBakim.getMonth() + (Number(bakimAraligiAy) || 3));
    updates.push(`sonraki_bakim_tarihi = $${paramIndex++}`);
    values.push(sonrakiBakim);
  }

  if (updates.length === 0) {
    return res.json(checkResult.rows[0]);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE ekipmanlar SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING id, ad, tip, son_bakim_tarihi as "sonBakimTarihi", sonraki_bakim_tarihi as "sonrakiBakimTarihi", durum`,
    values
  );

  return res.json(result.rows[0]);
});

adminRouter.delete("/ekipmanlar/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM ekipmanlar WHERE id = $1 RETURNING *", [id]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Ekipman bulunamadı" });
  }
  
  return res.status(204).send();
});

adminRouter.put("/ekipmanlar/:id/bakim-yap", async (req, res) => {
  const { id } = req.params;
  const { bakimAraligiAy } = req.body;

  const checkResult = await pool.query('SELECT id, ad, tip, son_bakim_tarihi as "sonBakimTarihi", sonraki_bakim_tarihi as "sonrakiBakimTarihi", durum FROM ekipmanlar WHERE id = $1', [id]);
  if (checkResult.rows.length === 0) {
    return res.status(404).json({ message: "Ekipman bulunamadı" });
  }

  const simdi = new Date();
  const sonrakiBakim = new Date(simdi);
  sonrakiBakim.setMonth(sonrakiBakim.getMonth() + (Number(bakimAraligiAy) || 3));

  const result = await pool.query(
    'UPDATE ekipmanlar SET son_bakim_tarihi = $1, sonraki_bakim_tarihi = $2 WHERE id = $3 RETURNING id, ad, tip, son_bakim_tarihi as "sonBakimTarihi", sonraki_bakim_tarihi as "sonrakiBakimTarihi", durum',
    [simdi, sonrakiBakim, id]
  );

  return res.json(result.rows[0]);
});
