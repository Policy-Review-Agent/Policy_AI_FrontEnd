import React from "react";
import { useDispatch } from "react-redux";
import { validatorNavigate } from "../../../store/slices/navigationSlice";
import { ChevronRight } from "lucide-react";

// crumbs: [{ label: string, screen?: string }]
// Last item has no `screen` — it is the current page.

const ValidatorBreadcrumb = ({ crumbs }) => {
  const dispatch = useDispatch();

  return (
    <nav className="flex items-center gap-0.5 text-[13px] font-semibold text-gray-400 mb-2 flex-wrap">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={13} className="text-gray-500 mt-0.5" />}

          {crumb.screen ? (
            <button
              onClick={() => dispatch(validatorNavigate(crumb.screen))}
              className="font-medium hover:text-primary transition-colors"
            >
              {crumb.label}
            </button>
          ) : (
            <span className="text-gray-500 font-medium">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default ValidatorBreadcrumb;