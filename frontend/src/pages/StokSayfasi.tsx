import { useEffect, useState } from "react";
import {
  fetchStock,
  createStock,
  updateStock,
  deleteStock,
} from "../api";

export function StokSayfasi() {
  const [token] = useState(() => localStorage.getItem("fitness_token"));
  const [hata, setHata] = useState<string | null>(null);
  const [stokListesi, setStokListesi] = useState<any[]>([]);
  const [yeniStok, setYeniStok] = useState({
    name: "",
    quantity: 0,
    minQuantity: 0,
  });

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const stokVerisi = await fetchStock(token);
        setStokListesi(stokVerisi);
      } catch (e: any) {
        setHata(e.message || "Stok alınamadı");
      }
    })();
  }, [token]);

  async function stokOlustur(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const olusturulan = await createStock(token, yeniStok);
      setStokListesi((onceki) => [...onceki, olusturulan]);
      setYeniStok({ name: "", quantity: 0, minQuantity: 0 });
    } catch (e: any) {
      setHata(e.message || "Stok oluşturulamadı");
    }
  }

  async function stokMiktarGuncelle(id: number, miktar: number) {
    if (!token) return;
    try {
      const guncellenen = await updateStock(token, id, { quantity: miktar });
      setStokListesi((onceki) =>
        onceki.map((urun) => (urun.id === id ? guncellenen : urun))
      );
    } catch (e: any) {
      setHata(e.message || "Stok güncellenemedi");
    }
  }

  async function stokSil(id: number) {
    if (!token) return;
    try {
      await deleteStock(token, id);
      setStokListesi((onceki) => onceki.filter((urun) => urun.id !== id));
    } catch (e: any) {
      setHata(e.message || "Stok silinemedi");
    }
  }

  return (
    <>
      <h1>Stok Sayfası</h1>
      {hata && <div className="error">{hata}</div>}

      <section className="section">
        <h2>Stok Takibi</h2>
        <form onSubmit={stokOlustur} className="form-inline">
          <input
            placeholder="Ürün adı"
            value={yeniStok.name}
            onChange={(e) =>
              setYeniStok({ ...yeniStok, name: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Miktar"
            value={yeniStok.quantity}
            onChange={(e) =>
              setYeniStok({
                ...yeniStok,
                quantity: Number(e.target.value),
              })
            }
          />
          <input
            type="number"
            placeholder="Minimum"
            value={yeniStok.minQuantity}
            onChange={(e) =>
              setYeniStok({
                ...yeniStok,
                minQuantity: Number(e.target.value),
              })
            }
          />
          <button type="submit">Ekle</button>
        </form>

        <table>
          <thead>
            <tr>
              <th>Ürün</th>
              <th>Miktar</th>
              <th>Minimum</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {stokListesi.map((urun) => {
              const fark = urun.quantity - urun.minQuantity;
              const azKaldi = urun.quantity < urun.minQuantity;
              const durumMetni = azKaldi
                ? `Az kaldı (${fark} fazla)`
                : `Yeterli (${fark} fazla)`;

              return (
                <tr
                  key={urun.id}
                  className={azKaldi ? "danger-row" : ""}
                >
                  <td>{urun.name}</td>
                  <td>
                    <input
                      type="number"
                      placeholder="Miktar"
                      value={urun.quantity}
                      onChange={(e) =>
                        stokMiktarGuncelle(
                          urun.id,
                          Number(e.target.value)
                        )
                      }
                      className="small-input"
                    />
                  </td>
                  <td>{urun.minQuantity}</td>
                  <td>{durumMetni}</td>
                  <td>
                    <button
                      className="danger-btn"
                      onClick={() => stokSil(urun.id)}
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
