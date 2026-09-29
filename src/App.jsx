import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import UserPage from "./pages/UserPage";
import KitchenPage from "./pages/KitchenPage";
import DisplayPage from "./pages/DisplayPage";

function App() {
  return (
    <BrowserRouter>
      {/* 開発時の画面切り替えを楽にするための簡易ナビゲーションバー */}
      <nav style={{ display: "flex", gap: "20px" }}>
        <span className="font-bold">POSシステム開発用ナビ:</span>
        <Link to="/" className="hover:underline">
          顧客用 (/)
        </Link>
        <Link to="/kitchen" className="hover:underline">
          キッチン (/kitchen)
        </Link>
        <Link to="/display" className="hover:underline">
          ディスプレイ (/display)
        </Link>
      </nav>

      {/* ルーティング設定 */}
      <Routes>
        <Route path="/" element={<UserPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/display" element={<DisplayPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
