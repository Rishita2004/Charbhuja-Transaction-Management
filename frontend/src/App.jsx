import { useState, useEffect, useCallback } from "react";
import { FileDown, RefreshCw, Phone, MapPin } from "lucide-react";
import SummaryCards from "./components/SummaryCards";
import OrdersTable from "./components/OrdersTable";
import ToleranceLog from "./components/ToleranceLog";
import { fetchSummary, fetchToleranceLog, exportExcel } from "./api/api";

export default function App() {
  const [summary, setSummary] = useState(null);
  const [toleranceLog, setToleranceLog] = useState([]);
  const [exporting, setExporting] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([fetchSummary(), fetchToleranceLog()]);
      setSummary(s.data);
      setToleranceLog(t.data);
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleExport = async () => {
    setExporting(true);
    try { await exportExcel(); }
    catch (e) { alert("Export failed. Make sure the backend is running."); }
    finally { setExporting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 shadow-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-4">

          {/* Logo image */}
          <img
            src="/logo.png"
            alt="Charbhuja Cotton Logo"
            className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-pink-700/50 flex-shrink-0"
          />

          {/* Company identity */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold leading-tight tracking-wide"
              style={{ color: "#E0006E" }}>
              Charbhuja Cotton Pvt. Ltd.
            </h1>
            <p className="text-[11px] font-semibold text-gray-400 leading-tight mt-0.5">
              Manufacturers And Sellers Of 100% Pure Cottonseed
            </p>
            <div className="flex flex-wrap items-center gap-x-3 mt-0.5">
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <MapPin size={9} className="text-pink-600" />
                N.H. 79, Post Bera, Dist. Bhilwara (Raj.)
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={loadDashboard} className="btn-secondary" title="Refresh">
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={handleExport} disabled={exporting} className="btn-gold">
              <FileDown size={15} />
              {exporting ? "Exporting…" : "Export Excel"}
            </button>
          </div>
        </div>

        {/* Brand accent strip: magenta → gold → magenta */}
        <div className="h-0.5 bg-gradient-to-r from-pink-700 via-yellow-400 to-pink-700" />
      </header>

      {/* Main */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <SummaryCards summary={summary} />
        <OrdersTable onRefreshSummary={loadDashboard} />
        <ToleranceLog log={toleranceLog} />

        <footer className="mt-10 mb-4 text-center text-xs text-gray-700 space-y-1">
          <div>© 2026 Charbhuja Cotton Pvt. Limited — All rights reserved.</div>
          <div>N.H. 79, Post Bera, Dist. Bhilwara (Raj.)</div>
        </footer>
      </main>
    </div>
  );
}
