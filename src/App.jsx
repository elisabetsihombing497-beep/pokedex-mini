import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ListPage from "./pages/ListPage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  const [introDismissed, setIntroDismissed] = useState(false);

  function dismissIntro() {
    setIntroDismissed(true);
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ListPage showIntro={!introDismissed} onIntroDismiss={dismissIntro} />} />
          <Route path="/pokemon/:name" element={<DetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
