import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GirisSayfasi } from "./pages/GirisSayfasi";
import { QrGirisSayfasi } from "./pages/QrGirisSayfasi";
import { QrKodSayfasi } from "./pages/QrKodSayfasi";
import { AnaLayout } from "./components/Layout";
import { AnaSayfa } from "./pages/AnaSayfa";
import { StokSayfasi } from "./pages/StokSayfasi";
import { CalisanlarSayfasi } from "./pages/CalisanlarSayfasi";
import { EkipmanlarSayfasi } from "./pages/EkipmanlarSayfasi";

function OzelRota({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("fitness_token");
  return token ? <>{children}</> : <Navigate to="/giris" replace />;
}

export function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("fitness_token")
  );

  function girisYap(yeniToken: string) {
    setToken(yeniToken);
  }

  function cikisYap() {
    localStorage.removeItem("fitness_token");
    setToken(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/giris"
          element={
            token ? (
              <Navigate to="/anasayfa" replace />
            ) : (
              <GirisSayfasi onLogin={girisYap} />
            )
          }
        />
        <Route path="/qr-giris" element={<QrGirisSayfasi />} />
        <Route
          path="/"
          element={
            <OzelRota>
              <AnaLayout onLogout={cikisYap} />
            </OzelRota>
          }
        >
          <Route index element={<Navigate to="/anasayfa" replace />} />
          <Route path="anasayfa" element={<AnaSayfa />} />
          <Route path="qr-kod" element={<QrKodSayfasi />} />
          <Route path="stok" element={<StokSayfasi />} />
          <Route path="calisanlar" element={<CalisanlarSayfasi />} />
          <Route path="ekipmanlar" element={<EkipmanlarSayfasi />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
