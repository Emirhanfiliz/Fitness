import { useEffect, useState } from "react";
import {
  fetchEkipmanlar,
  createEkipman,
  updateEkipman,
  deleteEkipman,
  bakimYap,
} from "../api";

export function EkipmanlarSayfasi() {
  const [token] = useState(() => localStorage.getItem("fitness_token"));
  const [hata, setHata] = useState<string | null>(null);
  const [ekipmanlar, setEkipmanlar] = useState<any[]>([]);
  const [yeniEkipman, setYeniEkipman] = useState({
    ad: "",
    tip: "",
    sonBakimTarihi: "",
    bakimAraligiAy: 3,
  });

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const ekipmanListesi = await fetchEkipmanlar(token);
        setEkipmanlar(ekipmanListesi);
      } catch (e: any) {
        setHata(e.message || "Ekipmanlar alınamadı");
      }
    })();
  }, [token]);

  async function ekipmanOlustur(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const olusturulan = await createEkipman(token, yeniEkipman);
      setEkipmanlar((onceki) => [olusturulan, ...onceki]);
      setYeniEkipman({ ad: "", tip: "", sonBakimTarihi: "", bakimAraligiAy: 3 });
    } catch (e: any) {
      setHata(e.message || "Ekipman oluşturulamadı");
    }
  }

  async function ekipmanSil(id: number) {
    if (!token) return;
    if (!confirm("Bu ekipmanı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteEkipman(token, id);
      setEkipmanlar((onceki) => onceki.filter((ekipman) => ekipman.id !== id));
    } catch (e: any) {
      setHata(e.message || "Ekipman silinemedi");
    }
  }

  async function bakimYapildi(id: number) {
    if (!token) return;
    const bakimAraligi = prompt("Bakım aralığı (ay):", "3");
    if (!bakimAraligi) return;
    try {
      const guncellenen = await bakimYap(token, id, Number(bakimAraligi));
      setEkipmanlar((onceki) =>
        onceki.map((ekipman) => (ekipman.id === id ? guncellenen : ekipman))
      );
    } catch (e: any) {
      setHata(e.message || "Bakım kaydedilemedi");
    }
  }

  return (
    <>
      <h1>Ekipman Bakım Takibi</h1>
      {hata && <div className="error">{hata}</div>}

      <section className="section">
        <h2>Yeni Ekipman Ekle</h2>
        <form onSubmit={ekipmanOlustur} className="form-inline">
          <input
            placeholder="Ekipman Adı"
            value={yeniEkipman.ad}
            onChange={(e) =>
              setYeniEkipman({ ...yeniEkipman, ad: e.target.value })
            }
            required
          />
          <input
            placeholder="Tip  "
            value={yeniEkipman.tip}
            onChange={(e) =>
              setYeniEkipman({ ...yeniEkipman, tip: e.target.value })
            }
            required
          />
          <input
            type="date"
            value={yeniEkipman.sonBakimTarihi}
            onChange={(e) =>
              setYeniEkipman({ ...yeniEkipman, sonBakimTarihi: e.target.value })
            }
            required
          />
          <input
            type="number"
            min={1}
            placeholder="Bakım Aralığı"
            value={yeniEkipman.bakimAraligiAy}
            onChange={(e) =>
              setYeniEkipman({
                ...yeniEkipman,
                bakimAraligiAy: Number(e.target.value),
              })
            }
          />
          <button type="submit">Ekle</button>
        </form>
      </section>

      <section className="section">
        <h2>Ekipman Listesi</h2>
        <table>
          <thead>
            <tr>
              <th>Ekipman Adı</th>
              <th>Tip</th>
              <th>Son Bakım</th>
              <th>Sonraki Bakım</th>
              <th>Kalan Gün</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {ekipmanlar.map((ekipman) => {
              const sonrakiBakim = new Date(ekipman.sonrakiBakimTarihi);
              const simdi = new Date();
              const farkMs = sonrakiBakim.getTime() - simdi.getTime();
              const kalanGun = Math.ceil(farkMs / (1000 * 60 * 60 * 24));
              const bakimGecmis = kalanGun < 0;
              const bakimYaklasmis = kalanGun >= 0 && kalanGun <= 7;

              return (
                <tr
                  key={ekipman.id}
                  className={
                    bakimGecmis
                      ? "expired-row"
                      : bakimYaklasmis
                      ? "danger-row"
                      : ""
                  }
                >
                  <td>{ekipman.ad}</td>
                  <td>{ekipman.tip}</td>
                  <td>
                    {new Date(ekipman.sonBakimTarihi).toLocaleDateString("tr-TR")}
                  </td>
                  <td>{sonrakiBakim.toLocaleDateString("tr-TR")}</td>
                  <td>
                    {bakimGecmis
                      ? `Geçmiş (${Math.abs(kalanGun)} gün)`
                      : `${kalanGun} gün`}
                  </td>
                  <td>{ekipman.durum}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => bakimYapildi(ekipman.id)}
                      style={{ marginRight: "0.5rem" }}
                    >
                      Bakım Yap
                    </button>
                    <button
                      className="danger-btn"
                      onClick={() => ekipmanSil(ekipman.id)}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}

