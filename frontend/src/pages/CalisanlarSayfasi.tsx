import { useEffect, useState } from "react";
import {
  fetchEmployees,
  createEmployee,
  toggleEmployeeActive,
} from "../api";

export function CalisanlarSayfasi() {
  const [token] = useState(() => localStorage.getItem("fitness_token"));
  const [hata, setHata] = useState<string | null>(null);
  const [calisanlar, setCalisanlar] = useState<any[]>([]);
  const [yeniCalisan, setYeniCalisan] = useState({
    name: "",
    role: "",
    phone: "",
    salary: 0,
  });

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const calisanListesi = await fetchEmployees(token);
        setCalisanlar(calisanListesi);
      } catch (e: any) {
        setHata(e.message || "Çalışanlar alınamadı");
      }
    })();
  }, [token]);

  async function calisanOlustur(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const olusturulan = await createEmployee(token, yeniCalisan);
      setCalisanlar((onceki) => [olusturulan, ...onceki]);
      setYeniCalisan({ name: "", role: "", phone: "", salary: 0 });
    } catch (e: any) {
      setHata(e.message || "Çalışan oluşturulamadı");
    }
  }

  async function calisanDurumDegistir(id: number) {
    if (!token) return;
    try {
      const guncellenen = await toggleEmployeeActive(token, id);
      setCalisanlar((onceki) =>
        onceki.map((calisan) => (calisan.id === id ? guncellenen : calisan))
      );
    } catch (e: any) {
      setHata(e.message || "Çalışan durumu güncellenemedi");
    }
  }

  return (
    <>
      <h1>Çalışan Takibi</h1>
      {hata && <div className="error">{hata}</div>}

      <section className="section">
        <h2>Çalışanlar</h2>
        <form onSubmit={calisanOlustur} className="form-inline">
          <input
            placeholder="Ad Soyad"
            value={yeniCalisan.name}
            onChange={(e) =>
              setYeniCalisan({ ...yeniCalisan, name: e.target.value })
            }
            required
          />
          <input
            placeholder="Pozisyon"
            value={yeniCalisan.role}
            onChange={(e) =>
              setYeniCalisan({ ...yeniCalisan, role: e.target.value })
            }
            required
          />
          <input
            placeholder="Telefon"
            value={yeniCalisan.phone}
            onChange={(e) =>
              setYeniCalisan({ ...yeniCalisan, phone: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Maaş"
            value={yeniCalisan.salary}
            onChange={(e) =>
              setYeniCalisan({
                ...yeniCalisan,
                salary: Number(e.target.value),
              })
            }
          />
          <button type="submit">Ekle</button>
        </form>

        <table>
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Pozisyon</th>
              <th>Telefon</th>
              <th>Maaş</th>
              <th>Durum</th>
              <th>İşe Başlama</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {calisanlar.map((calisan) => (
              <tr
                key={calisan.id}
                className={!calisan.active ? "inactive-row" : ""}
              >
                <td>{calisan.name}</td>
                <td>{calisan.role}</td>
                <td>{calisan.phone}</td>
                <td>{calisan.salary} ₺</td>
                <td>{calisan.active ? "Aktif" : "Pasif"}</td>
                <td>
                  {calisan.hiredAt
                    ? new Date(calisan.hiredAt).toLocaleDateString("tr-TR")
                    : "-"}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => calisanDurumDegistir(calisan.id)}
                  >
                    {calisan.active ? "Pasif Yap" : "Aktif Yap"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
