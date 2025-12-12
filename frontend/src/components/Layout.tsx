import { Link, Outlet, useLocation } from "react-router-dom";

type AnaLayoutProps = {
  onLogout: () => void;
};

export function AnaLayout({ onLogout }: AnaLayoutProps) {
  const location = useLocation();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div>
          <div className="nav-buttons">
            <Link
              to="/anasayfa"
              className={
                location.pathname === "/anasayfa"
                  ? "nav-btn active"
                  : "nav-btn"
              }
            >
              Ana Sayfa
            </Link>
            <Link
              to="/qr-kod"
              className={
                location.pathname === "/qr-kod"
                  ? "nav-btn active"
                  : "nav-btn"
              }
            >
              QR Kod
            </Link>
            <Link
              to="/stok"
              className={
                location.pathname === "/stok" ? "nav-btn active" : "nav-btn"
              }
            >
              Stok
            </Link>
            <Link
              to="/calisanlar"
              className={
                location.pathname === "/calisanlar"
                  ? "nav-btn active"
                  : "nav-btn"
              }
            >
              Çalışanlar
            </Link>
            <Link
              to="/ekipmanlar"
              className={
                location.pathname === "/ekipmanlar"
                  ? "nav-btn active"
                  : "nav-btn"
              }
            >
              Ekipmanlar
            </Link>
          </div>
        </div>
        <button onClick={onLogout} className="logout-btn">
          Çıkış Yap
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

