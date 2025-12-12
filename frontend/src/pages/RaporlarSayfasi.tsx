import { useEffect, useState } from "react";
import { fetchLoginAnalytics } from "../api";

type LoginAnalytics = {
  weekly: { day: string; count: number }[];
  monthly: { month: string; count: number }[];
  hourly: { hour: number; count: number }[];
};

export function RaporlarSayfasi() {
  const [token] = useState(() => localStorage.getItem("fitness_token"));
  const [veri, setVeri] = useState<LoginAnalytics | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const response = await fetchLoginAnalytics(token);
        setVeri(response);
      } catch (e: any) {
        setHata(e.message || "Rapor verisi alınamadı");
      }
    })();
  }, [token]);

  function renderBar(label: string, count: number, max: number) {
    const width = max > 0 ? Math.max(8, (count / max) * 180) : 8;
    return (
      <div className="chart-row" key={label}>
        <span>{label}</span>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${width}px` }} />
        </div>
        <span>{count}</span>
      </div>
    );
  }

  return (
    <>
      <h1>Raporlar</h1>
      {hata && <div className="error">{hata}</div>}

      {veri && (
        <>
          <section className="section">
            <h2>Haftalık Giriş Sayıları (Son 7 Gün)</h2>
            <div className="chart-placeholder">
              {veri.weekly.length === 0 && <p>Veri yok</p>}
              {veri.weekly.length > 0 &&
                veri.weekly.map((item) =>
                  renderBar(item.day, item.count, Math.max(...veri.weekly.map((v) => v.count)))
                )}
            </div>
          </section>

          <section className="section">
            <h2>Aylık Giriş Sayıları (Son 6 Ay)</h2>
            <div className="chart-placeholder">
              {veri.monthly.length === 0 && <p>Veri yok</p>}
              {veri.monthly.length > 0 &&
                veri.monthly.map((item) =>
                  renderBar(item.month, item.count, Math.max(...veri.monthly.map((v) => v.count)))
                )}
            </div>
          </section>

          <section className="section">
            <h2>En Yoğun Saatler (Son 30 Gün)</h2>
            <div className="chart-placeholder">
              {veri.hourly.length === 0 && <p>Veri yok</p>}
              {veri.hourly.length > 0 &&
                veri.hourly.map((item) =>
                  renderBar(
                    `${item.hour}:00`,
                    item.count,
                    Math.max(...veri.hourly.map((v) => v.count))
                  )
                )}
            </div>
          </section>
        </>
      )}
    </>
  );
}


