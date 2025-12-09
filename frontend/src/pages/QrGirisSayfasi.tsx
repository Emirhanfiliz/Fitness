import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { qrLogin } from "../api";

export function QrGirisSayfasi() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState(false);

  useEffect(() => {
    if (!token) {
      setHata("Geçersiz QR kod");
    }
  }, [token]);

  async function girisYap(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setHata("Geçersiz QR kod");
      return;
    }

    setYukleniyor(true);
    setHata(null);

    try {
      await qrLogin(token, email, sifre);
      setBasari(true);
      setTimeout(() => {
        // Başarılı girişten sonra ana sayfaya yönlendir veya başka bir sayfa göster
        navigate("/anasayfa");
      }, 2000);
    } catch (e: any) {
      setHata(e.message || "Giriş başarısız");
    } finally {
      setYukleniyor(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Geçersiz QR Kod</h1>
          <p>QR kod geçersiz veya süresi dolmuş.</p>
        </div>
      </div>
    );
  }

  if (basari) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Giriş Başarılı!</h1>
          <p>İçeri giriş yapılıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Üye Girişi</h1>
        <p style={{ marginBottom: "1.5rem", color: "#666" }}>
          QR kodu okuttunuz. Lütfen e-posta ve şifrenizi girin.
        </p>
        <form onSubmit={girisYap} className="form">
          <label>
            E-posta
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            Şifre
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
            />
          </label>
          {hata && <div className="error">{hata}</div>}
          <button type="submit" disabled={yukleniyor}>
            {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}

