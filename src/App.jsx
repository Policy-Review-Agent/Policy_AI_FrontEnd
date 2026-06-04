import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Toast from "./components/ui/Toast";
import Dashboard from "./components/screens/Dashboard/Dashboard";
import PolicyListing from "./components/screens/PolicyListing/PolicyListing";
import PolicyChecklist from "./components/screens/PolicyChecklist/PolicyChecklist";
import Documents from "./components/screens/Documents/Documents";
import Login from "./components/screens/Login/Login";
import ValidatorSetup from "./components/screens/ValidatorSetup/ValidatorSetup";
import AutoInsurance from "./components/screens/ValidatorSetup/AutoInsurance";
import UploadFile from "./components/screens/UploadFile/UploadFile";
import RedirectHandler from "./components/msalConfig/RedirectHandler";
import PrivateRoutes from "./components/screens/Login/PrivateRoutes";
import PrivateErrorRoute from "./components/screens/Login/PrivateErrorRoute";
import Error from "./components/screens/Login/Error";
import { BrowserRouter, Route, Routes, useNavigate as useRouterNavigate } from "react-router-dom";
import AdminUserMain from "./components/screens/AdminUser/AdminUserMain";
import { navigate } from "./store/slices/navigationSlice";

const SCREENS = {
  dashboard: Dashboard,
  policyList: PolicyListing,
  checklist: PolicyChecklist,
  documents: Documents,
  validatorsetup: ValidatorSetup,
  vadlidateInsurance: AutoInsurance,
  uploadfile: UploadFile,
  adminuser: AdminUserMain,
};

const HomeLayout = ({ sidebarOpen, setSidebarOpen }) => {
  const screen = useSelector((s) => s.navigation.screen);
  const Screen = SCREENS[screen] || Dashboard;
  const routerNavigate = useRouterNavigate();
  const dispatch = useDispatch();
  const historyStack = React.useRef(["dashboard"]); // ✅ track our own screen stack

  // ✅ On mount: fill browser history with enough buffer entries
  useEffect(() => {
    // Push 5 buffer entries so user has to click back many times before escaping
    for (let i = 0; i < 5; i++) {
      window.history.pushState({ screen: "dashboard", buffer: true }, "", "/home");
    }
    window.history.pushState({ screen: screen }, "", "/home");
  }, []); // only on mount

  // ✅ When Redux screen changes push to both stacks
  useEffect(() => {
    const prev = historyStack.current[historyStack.current.length - 1];
    if (prev !== screen) {
      historyStack.current.push(screen);
      window.history.pushState({ screen }, "", "/home");
    }
  }, [screen]);

  // ✅ Handle back/forward
  useEffect(() => {
    const handlePopState = (event) => {
      const token = sessionStorage.getItem("access_token");
      const isApproved = sessionStorage.getItem("is_approved") === "true";

      if (!token || !isApproved) {
        routerNavigate("/", { replace: true });
        return;
      }

      // ✅ If it's a buffer entry or no state, stay on dashboard and refill buffer
      if (!event.state?.screen || event.state?.buffer) {
        dispatch(navigate("dashboard"));
        historyStack.current = ["dashboard"];
        // Refill buffer so next back presses are also caught
        for (let i = 0; i < 5; i++) {
          window.history.pushState({ screen: "dashboard", buffer: true }, "", "/home");
        }
        window.history.pushState({ screen: "dashboard" }, "", "/home");
        return;
      }

      // ✅ Valid screen in history — pop our stack and restore
      historyStack.current.pop();
      dispatch(navigate(event.state.screen));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [routerNavigate, dispatch]);

  return (
    <div className="flex min-h-screen bg-bg overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 shrink-0 transition-all duration-200 overflow-hidden
          lg:static
          ${sidebarOpen ? "w-56" : "w-0"}
        `}
      >
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          onNavigate={() => {
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
        />
      </aside>
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden thin-scroll">
        <Topbar
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen((o) => !o)}
        />
        <main className="flex-1 p-5 bg-gray-50">
          <Screen />
        </main>
      </div>
      <Toast />
    </div>
  );
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/redirect" element={<RedirectHandler />} />
        <Route path="/" element={<Login />} />
        <Route element={<PrivateRoutes />}>
          <Route
            path="/home"
            element={
              <HomeLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          />
        </Route>
        <Route element={<PrivateErrorRoute />}>
          <Route element={<Error />} path="/Error" exact />
        </Route>
        <Route path="/Error" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;