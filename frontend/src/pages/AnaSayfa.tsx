import { useEffect, useState } from "react";
import {
  fetchDashboard,
  fetchMembers,
  createMember,
  deleteMember,
} from "../api";

type AnaSayfaVerisi = {
  totalMembers: number;
  activeMembers: number;
  capacity: number;
  occupancyRate: number;
  monthlyStats?: { month: string; count: number }[];
};

export function AnaSayfa() {
  const [token] = useState(() => localStorage.getItem("fitness_token"));
  const [hata, setHata] = useState<string | null>(null);
  const [anaSayfaVerisi, setAnaSayfaVerisi] = useState<AnaSayfaVerisi | null>(null);
  const [uyeler, setUyeler] = useState<any[]>([]);
  const [yeniUye, setYeniUye] = useState({
    name: "",
    email: "",
    phone: "",
    durationMonths: 1,
  });

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [veri, uyeListesi] = await Promise.all([
          fetchDashboard(token),
          fetchMembers(token),
        ]);
        setAnaSayfaVerisi(veri);
        setUyeler(uyeListesi);
      } catch (e: any) {
        setHata(e.message || "Veriler alınırken hata oluştu");
      }
    })();
  }, [token]);

  async function uyeOlustur(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const olusturulan = await createMember(token, yeniUye);
      setUyeler((onceki) => [olusturulan, ...onceki]);
      setYeniUye({ name: "", email: "", phone: "", durationMonths: 1 });
      const guncelVeri = await fetchDashboard(token);
      setAnaSayfaVerisi(guncelVeri);
    } catch (e: any) {
      setHata(e.message || "Üye oluşturulamadı");
    }
  }

  async function uyeSil(id: number) {
    if (!token) return;
    if (!confirm("Bu üyeyi silmek istediğinize emin misiniz?")) return;
    try {
      await deleteMember(token, id);
      setUyeler((onceki) => onceki.filter((uye) => uye.id !== id));
      const guncelVeri = await fetchDashboard(token);
      setAnaSayfaVerisi(guncelVeri);
    } catch (e: any) {
      setHata(e.message || "Üye silinemedi");
    }
  }

  return (
    <>
      <h1>Ana Sayfa</h1>
      {hata && <div className="error">{hata}</div>}

      {anaSayfaVerisi && (
        <>
          <div className="cards">
            <div className="card">
              <h3>Toplam Üye</h3>
              <p>{anaSayfaVerisi.totalMembers}</p>
            </div>
            <div className="card">
              <h3>Aktif Üye</h3>
              <p>{anaSayfaVerisi.activeMembers}</p>
            </div>
            <div className="card">
              <h3>Doluluk Oranı</h3>
              <p>%{anaSayfaVerisi.occupancyRate}</p>
            </div>
          </div>

          <section className="section">
            <h2>Aylık Üye Grafiği</h2>
            <div className="chart-placeholder">
              {anaSayfaVerisi.monthlyStats &&
                anaSayfaVerisi.monthlyStats
                  .slice()
                  .reverse()
                  .map((m) => (
                    <div key={m.month} className="chart-row">
                      <span>{m.month}</span>
                      <div className="bar">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${Number(m.count) * 10}px`,
                          }}
                        />
                      </div>
                      <span>{m.count}</span>
                    </div>
                  ))}
            </div>
          </section>
        </>
      )}

      <section className="section">
        <h2>Yeni Üye Oluştur</h2>
        <form onSubmit={uyeOlustur} className="form-inline">
          <input
            placeholder="Ad Soyad"
            value={yeniUye.name}
            onChange={(e) =>
              setYeniUye({ ...yeniUye, name: e.target.value })
            }
            required
          />
          <input
            placeholder="E-posta"
            value={yeniUye.email}
            onChange={(e) =>
              setYeniUye({ ...yeniUye, email: e.target.value })
            }
            required
          />
          <input
            placeholder="Telefon"
            value={yeniUye.phone}
            onChange={(e) =>
              setYeniUye({ ...yeniUye, phone: e.target.value })
            }
            required
          />
          <input
            type="number"
            min={1}
            placeholder="Süre (ay)"
            value={yeniUye.durationMonths}
            onChange={(e) =>
              setYeniUye({
                ...yeniUye,
                durationMonths: Number(e.target.value),
              })
            }
          />
          <button type="submit">Ekle</button>
        </form>
      </section>

      <section className="section">
        <h2>Üye Listesi</h2>
        <table>
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>E-posta</th>
              <th>Telefon</th>
              <th>Bitiş Tarihi</th>
              <th>Kalan Gün</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {uyeler.map((uye) => {
              const bitisTarihi = new Date(uye.membershipEnd);
              const simdi = new Date();
              const farkMs = bitisTarihi.getTime() - simdi.getTime();
              const kalanGun = Math.ceil(farkMs / (1000 * 60 * 60 * 24));
              const suresiDoldu = kalanGun < 0;
              const yakindaBitecek = kalanGun >= 0 && kalanGun <= 10;

              return (
                <tr
                  key={uye.id}
                  className={
                    suresiDoldu
                      ? "expired-row"
                      : yakindaBitecek
                      ? "danger-row"
                      : ""
                  }
                >
                  <td>{uye.name}</td>
                  <td>{uye.email}</td>
                  <td>{uye.phone}</td>
                  <td>{bitisTarihi.toLocaleDateString("tr-TR")}</td>
                  <td>
                    {suresiDoldu ? "Süresi doldu" : `${kalanGun} gün`}
                  </td>
                  <td>
                    <button
                      className="danger-btn"
                      onClick={() => uyeSil(uye.id)}
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

