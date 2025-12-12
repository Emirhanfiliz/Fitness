import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getQrToken } from "../api";

export function QrKodSayfasi() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // QR kod token'ını her 1 dakikada bir yenile
  useEffect(() => {
    async function updateQrCode() {
      try {
        const { token: qrToken } = await getQrToken();
        const baseUrl = window.location.origin;
        const qrUrl = `${baseUrl}/qr-giris?token=${qrToken}`;
        setQrCodeUrl(qrUrl);
      } catch (e) {
        console.error("QR kod alınamadı:", e);
      }
    }

    updateQrCode();
    const interval = setInterval(updateQrCode, 60000); // Her 1 dakikada bir

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1>QR Kod (Üye Girişi)</h1>
      <section className="section">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {qrCodeUrl && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "white",
                borderRadius: "8px",
                display: "inline-block",
              }}
            >
              <QRCodeSVG value={qrCodeUrl} size={256} />
            </div>
          )}
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Bu QR kodu okutarak giriş yapabilirsiniz. Kod her 1 dakikada bir
            yenilenir.
          </p>
        </div>
      </section>
    </>
  );
}


