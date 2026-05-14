import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";



const CustomSelect = ({ options, value, onChange, placeholder = "Select…" }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected = options.find((o) => o.value === value) || null;
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (opt) => { onChange(opt.value); setOpen(false); setSearch(""); };

  return (
    <div ref={ref} className="relative  select-none font-sans">
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-2 px-3 h-[34px] bg-white border rounded-md text-[13px] transition-all
          ${open ? "border-[#6B55E8]" : "border-gray-200 hover:border-gray-300"}`}
      >
        <div className="flex items-center gap-2">
          {/* {selected && (
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: selected.color }} />
          )} */}
          <span className={selected ? "text-gray-800" : "text-gray-400"}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-md shadow-md z-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full h-7 px-2 text-[12px] bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-[#6B55E8]"
            />
          </div>

          {/* Options */}
          <div className="max-h-32 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-center text-[12px] text-gray-400 py-4">No results</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => pick(opt)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[13px] transition-colors
                    ${value === opt.value
                      ? "bg-[#6B55E8]/10 text-[#6B55E8] font-medium"
                      : "text-gray-700 hover:bg-gray-50"}`}
                >
                  {/* <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: opt.color }} /> */}
                  {opt.label}
                  {value === opt.value && <Check size={13} className="ml-auto text-[#6B55E8]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;