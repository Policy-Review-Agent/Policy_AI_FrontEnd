import React, { useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Toast from "./components/ui/Toast";
import Dashboard from "./components/screens/Dashboard/Dashboard";
import PolicyListing from "./components/screens/PolicyListing/PolicyListing";
import PolicyChecklist from "./components/screens/PolicyChecklist/PolicyChecklist";
import Validation from "./components/screens/Validation/Validation";
import Documents from "./components/screens/Documents/Documents";
import Login from "./components/screens/Login/Login";
import ValidatorSetup from "./components/screens/ValidatorSetup/ValidatorSetup"
import AutoInsurance from "./components/screens/ValidatorSetup/AutoInsurance";

const SCREENS = {
  dashboard: Dashboard,
  policyList: PolicyListing,
  checklist: PolicyChecklist,
  // validation: Validation,
  documents: Documents,
  validatorsetup: ValidatorSetup,
  vadlidateInsurance: AutoInsurance,
};

const App = () => {
  const screen = useSelector((s) => s.navigation.screen);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const Screen = SCREENS[screen] || Dashboard;

  // Single source of truth for sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg overflow-hidden font-sans">
        <Login />
        <Toast />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg overflow-hidden">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──
            Desktop : slides in/out by toggling w-56 / w-0
            Mobile  : fixed overlay                          */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 shrink-0 transition-all duration-200 overflow-hidden
          lg:static
          ${sidebarOpen ? "w-56" : "w-0"}
        `}
      >
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          onNavigate={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
        />
      </aside>

      {/* ── Right column ── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden thin-scroll">
        <Topbar
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen((o) => !o)}
        />
        <main className="flex-1 p-5">
          <Screen />
        </main>
      </div>

      <Toast />
    </div>
  );
};

export default App;