import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import FieldScene from "./FieldScene.jsx";
import { playTick } from "../sound.js";

function Layout() {
  const location = useLocation();
  const isDetailPage = location.pathname.startsWith("/pokemon");
  const [logoSpin, setLogoSpin] = useState(0);

  useEffect(() => {
    let frame = 0;
    function onMove(event) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        document.documentElement.style.setProperty("--px", x.toFixed(3));
        document.documentElement.style.setProperty("--py", y.toFixed(3));
      });
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="app-container">
      <FieldScene />
      {!isDetailPage && (
        <header className="app-header">
          <Link to="/" className="app-title-link" onClick={() => { playTick(); setLogoSpin((n) => n + 1); }}>
            <div className="logo-container">
              <img
                key={logoSpin}
                src={`${import.meta.env.BASE_URL}pokeball.svg`}
                alt=""
                className={`pokeball-img ${logoSpin > 0 ? "logo-spin" : ""}`}
              />
              <h1>PokéDex Mini</h1>
            </div>
          </Link>
        </header>
      )}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
