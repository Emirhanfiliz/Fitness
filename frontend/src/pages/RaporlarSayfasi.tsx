import { useEffect, useMemo, useState } from "react";
import { fetchLoginAnalytics } from "../api";

type LoginAnalytics = {
  rangeMonths: number;
  daily: { day: string; count: number }[];
  monthly: { month: string; count: number }[];
  hourly: { hour: number; count: number }[];
};

function HorizontalBars({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  if (!data.length) return <p>Veri yok</p>;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="chart-placeholder">
      {data.map((d) => {
        const width = Math.max(10, (d.value / max) * 240);
        return (
          <div key={d.label} className="chart-row">
            <span>{d.label}</span>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${width}px` }} />
            </div>
            <span>{d.value}</span>
          </div>
        );
      })}
    </div>
  );
}

export function RaporlarSayfasi() {
  const [token] = useState(() => localStorage.getItem("fitness_token"));
  const [veri, setVeri] = useState<LoginAnalytics | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [range, setRange] = useState<number>(3);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const response = await fetchLoginAnalytics(token, range);
        setVeri(response);
      } catch (e: any) {
        setHata(e.message || "Rapor verisi alınamadı");
      }
    })();
  }, [token, range]);

  const dailyData = useMemo(
    () =>
      (veri?.daily || []).map((d) => ({
        label: d.day.slice(5), // MM-DD
        value: d.count,
      })),
    [veri]
  );

  const hourlyData = useMemo(
    () =>
      (veri?.hourly || []).map((h) => ({
        label: `${h.hour}:00`,
        value: h.count,
      })),
    [veri]
  );

  const monthlyData = useMemo(
    () =>
      (veri?.monthly || []).map((m) => ({
        label: m.month,
        value: m.count,
      })),
    [veri]
  );

  const dailyTotal = useMemo(
    () => dailyData.reduce((sum, d) => sum + d.value, 0),
    [dailyData]
  );
  const monthlyTotal = useMemo(
    () => monthlyData.reduce((sum, d) => sum + d.value, 0),
    [monthlyData]
  );
  const hourlyTotal = useMemo(
    () => hourlyData.reduce((sum, d) => sum + d.value, 0),
    [hourlyData]
  );

  return (
    <>
      <h1>Raporlar</h1>
      {hata && <div className="error">{hata}</div>}

      <div className="section" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span>Dönem:</span>
        <select value={range} onChange={(e) => setRange(Number(e.target.value))}>
          <option value={1}>Son 1 Ay</option>
          <option value={3}>Son 3 Ay</option>
          <option value={6}>Son 6 Ay</option>
        </select>
        <span style={{ fontSize: 12, color: "#666" }}>
          Günlük, aylık ve saatlik girişler seçili döneme göre hesaplanır.
        </span>
      </div>

      {veri && (
        <>
          <section className="section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Günlük Girişler</h2>
              <span style={{ color: "#555" }}>Toplam: {dailyTotal}</span>
            </div>
            <HorizontalBars data={dailyData} />
          </section>

          <section className="section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Aylık Girişler</h2>
              <span style={{ color: "#555" }}>Toplam: {monthlyTotal}</span>
            </div>
            <HorizontalBars data={monthlyData} />
          </section>

          <section className="section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>En Yoğun Saatler</h2>
              <span style={{ color: "#555" }}>Toplam: {hourlyTotal}</span>
            </div>
            <HorizontalBars data={hourlyData} />
          </section>
        </>
      )}
    </>
  );
}