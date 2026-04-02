import React from "react";
import { useSelector } from "react-redux";
import { Menu } from "lucide-react";
import { selectCurrentBatch, selectCurrentPolicy } from "../../store/slices/batchSlice";
import { insureType } from "../screens/ValidatorSetup/ValidatorSetup";
const TITLES = {
  dashboard: "Dashboard",
  policyList: "Policy List",
  checklist: "Policy Checklist",
  // validation: "Validation",
  documents: "Document Viewer",
  validatorsetup: "Validator Setup",
  vadlidateInsurance: "Validator Setup",
  uploadfile: "Upload File",
};

// sidebarOpen lets us optionally style the button differently when open
const Topbar = ({ onMenuClick, sidebarOpen }) => {
  const screen = useSelector((s) => s.navigation.screen);
  const batch = useSelector(selectCurrentBatch);
  const policy = useSelector(selectCurrentPolicy);
  const {insureTypeIndex} = useSelector((state) => state.batch);
   const selectedData = insureType.find((item) => item.id === insureTypeIndex ) || insureType[0];
  const badge =
    screen === "dashboard" ? "" :
      screen === "policyList" ? batch?.batch_number : (screen === "checklist" || screen === "documents") ?
        policy?.policy_number : screen === "validatorsetup" ? "Policy Config" : screen === "vadlidateInsurance" ? selectedData.title : "";

  return (
    <header className="h-14 bg-white border-b-[1.3px] border-gray-200 flex items-center px-4 py-3 gap-3 sticky top-0 z-20 shadow-md">

      {/* Menu toggle — visible whenever sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          title="Open sidebar"
        >
          <Menu size={18} />
        </button>
      )}

      <span className="text-[15px] font-semibold text-gray-800 flex-1">
        {TITLES[screen]}
      </span>

      {badge && (
        <span className="text-[11px] font-semibold text-gray-800 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full font-mono">
          {badge}
        </span>
      )}
    </header>
  );
};

export default Topbar;