import { useEffect, useMemo, useState } from "react";
import { fetchLoginAnalytics } from "../api";

type LoginAnalytics = {
  rangeMonths: number;
  daily: { day: string; count: number }[];
  monthly: { month: string; count: number }[];
  hourly: { hour: number; count: number }[];
};

type LineChartProps = {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
};

function LineChart({ data, width = 620, height = 220 }: LineChartProps) {
  if (!data.length) return <p>Veri yok</p>;
  const max = Math.max(...data.map((d) => d.value), 1);
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;

  const points =
    data.length === 1
      ? (() => {
          const y =
            height - (data[0].value / max) * (height - 20);
          const cx = width / 2;
          return [`${cx - 10},${y}`, `${cx + 10},${y}`];
        })()
      : data.map((d, i) => {
          const x = i * stepX;
          const y = height - (d.value / max) * (height - 20);
          return `${x},${y}`;
        });

  const maxLabelCount = Math.min(8, data.length);
  const labelStep = Math.max(1, Math.floor(data.length / maxLabelCount));

  return (
    <div style={{ width: width + 20 }}>
      <svg width={width} height={height} style={{ background: "#f7f9fc", borderRadius: 8 }}>
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points={points.join(" ")}
        />
        {data.map((d, i) => {
          const x = data.length > 1 ? i * stepX : width / 2;
          const y = height - (d.value / max) * (height - 20);
          return <circle key={i} cx={x} cy={y} r={3.5} fill="#1d4ed8" />;
        })}
      </svg>
      <div
        style={{
          display: "flex",
          justifyContent: data.length === 1 ? "center" : "space-between",
          fontSize: 12,
          color: "#555",
          marginTop: 6,
        }}
      >
        {data.map((d, i) => {
          if (i % labelStep !== 0 && i !== data.length - 1) return null;
          return (
            <span key={i} style={{ whiteSpace: "nowrap" }}>
              {d.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function VerticalBars({
  data,
  height = 180,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  if (!data.length) return <p>Veri yok</p>;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", minHeight: height }}>
      {data.map((d) => {
        const h = Math.max(8, (d.value / max) * height);
        return (
          <div key={d.label} style={{ textAlign: "center", width: 20 }}>
            <div
              style={{
                height: h,
                background: "#10b981",
                borderRadius: 4,
                transition: "height 0.2s",
              }}
              title={`${d.label}: ${d.value}`}
            />
            <div style={{ fontSize: 11, marginTop: 4 }}>{d.label}</div>
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
            <LineChart data={dailyData} />
          </section>

          <section className="section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Aylık Girişler</h2>
              <span style={{ color: "#555" }}>Toplam: {monthlyTotal}</span>
            </div>
            <LineChart data={monthlyData} />
          </section>

          <section className="section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>En Yoğun Saatler</h2>
              <span style={{ color: "#555" }}>Toplam: {hourlyTotal}</span>
            </div>
            <VerticalBars data={hourlyData} />
          </section>
        </>
      )}
    </>
  );
}