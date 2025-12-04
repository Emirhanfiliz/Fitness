import { useState } from "react";
import { login } from "../api";

type GirisProps = {
  onLogin: (token: string) => void;
};

export function GirisSayfasi({ onLogin }: GirisProps) {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function girisYap(e: React.FormEvent) {
    e.preventDefault();
    setYukleniyor(true);
    setHata(null);
    try {
      const res = await login(email, sifre);
      localStorage.setItem("fitness_token", res.token);
      onLogin(res.token);
    } catch (e: any) {
      setHata(e.message || "Giriş başarısız");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Fitness Salon Admin Girişi</h1>
        <form onSubmit={girisYap} className="form">
          <label>
            E-posta
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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

