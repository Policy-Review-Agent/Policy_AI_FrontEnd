import { useState, useRef, useEffect, useCallback, useMemo } from "react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}
function isSameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function isInRange(date, start, end) {
  if (!start || !end || !date) return false;
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}
function formatDate(d) {
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

const PRESETS = [
  { label: "Today", fn: () => { const t = new Date(); return [new Date(t), new Date(t)]; } },
  { label: "Yesterday", fn: () => { const t = new Date(); t.setDate(t.getDate() - 1); return [new Date(t), new Date(t)]; } },
  { label: "Last 7 days", fn: () => { const t = new Date(), f = new Date(); f.setDate(t.getDate() - 6); return [f, t]; } },
  { label: "Last 30 days", fn: () => { const t = new Date(), f = new Date(); f.setDate(t.getDate() - 29); return [f, t]; } },
  { label: "This month", fn: () => { const t = new Date(); return [new Date(t.getFullYear(), t.getMonth(), 1), t]; } },
  { label: "Last month", fn: () => { const t = new Date(); return [new Date(t.getFullYear(), t.getMonth() - 1, 1), new Date(t.getFullYear(), t.getMonth(), 0)]; } },
];

// ─── CalendarMonth ────────────────────────────────────────────────────────────
const CalendarMonth = ({ year, month, startDate, endDate, hoverDate, onDayClick, onDayHover, compact, maxDate }) => {
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  const rangeEnd = endDate || hoverDate;
  const cellSize = compact ? 26 : 30;

  return (
    <div style={{ width: compact ? 175 : 210 }}>
      <div style={{ textAlign: "center", fontWeight: 600, fontSize: compact ? 11 : 12, color: "#111", marginBottom: 6 }}>
        {MONTHS[month]} {year}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, marginBottom: 2 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 9, color: "#9ca3af", fontWeight: 600, padding: "2px 0" }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={i} style={{ height: cellSize }} />;

          const isFuture = maxDate && date > maxDate;
          const isStart = isSameDay(date, startDate);
          const isEnd = isSameDay(date, endDate) || isSameDay(date, hoverDate);
          const inRange = isInRange(date, startDate, rangeEnd);
          const isToday = isSameDay(date, new Date());
          const isSelected = isStart || isEnd;

          let bg = "transparent", color = "#374151", borderRadius = "4px";
          if (isSelected) { bg = "#4f46e5"; color = "#fff"; }
          else if (inRange) { bg = "#eef2ff"; color = "#4f46e5"; borderRadius = "0"; }
          if (isStart && inRange) borderRadius = "4px 0 0 4px";
          if (isEnd && inRange && !isStart) borderRadius = "0 4px 4px 0";

          return (
            <div
              key={i}
              onClick={() => !isFuture && onDayClick(date)}
              onMouseEnter={() => !isFuture && onDayHover(date)}
              style={{
                textAlign: "center",
                fontSize: compact ? 10 : 11,
                height: cellSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isFuture ? "transparent" : bg,
                color: isFuture ? "#d1d5db" : color,
                borderRadius,
                cursor: isFuture ? "not-allowed" : "pointer",
                fontWeight: isSelected ? 600 : isToday ? 600 : 400,
                outline: isToday && !isSelected ? "1.5px solid #c7d2fe" : "none",
                outlineOffset: -1,
                transition: "background 0.1s",
                userSelect: "none",
              }}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── PresetItem ───────────────────────────────────────────────────────────────
const PresetItem = ({ label, active, onClick, compact }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: compact ? "5px 10px" : "6px 12px",
        fontSize: compact ? 11 : 12,
        cursor: "pointer",
        color: active ? "#4f46e5" : "#374151",
        background: active ? "#eef2ff" : hovered ? "#f5f3ff" : "transparent",
        fontWeight: active ? 600 : 400,
        borderLeft: active ? "2px solid #6366f1" : "2px solid transparent",
        transition: "background 0.1s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const CustomDatePicker = ({ onApply, onClear }) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [leftMonth, setLeftMonth] = useState({
    year: today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear(),
    month: today.getMonth() === 0 ? 11 : today.getMonth() - 1,
  });
  const [rightMonth, setRightMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const [layout, setLayout] = useState({ mode: "dual", openUp: false, alignLeft: false, popupWidth: 600 });

  const triggerRef = useRef();
  const popupRef = useRef();
  const ref = useRef();

  // ── Clamp a month object so it never exceeds today's month ──
  const clampToToday = (m) => {
    if (
      m.year > today.getFullYear() ||
      (m.year === today.getFullYear() && m.month > today.getMonth())
    ) {
      return { year: today.getFullYear(), month: today.getMonth() };
    }
    return m;
  };

  // ── Compute layout ──
  const computeLayout = useCallback(() => {
    if (!triggerRef.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = vh - rect.bottom - 8;
    const spaceAbove = rect.top - 8;

    let mode = "dual", popupWidth = 600;
    if (vw < 480) { mode = "mobile"; popupWidth = Math.min(vw - 16, 280); }
    else if (vw < 700) { mode = "single"; popupWidth = 340; }

    const useAlignLeft = rect.left + popupWidth <= vw;
    const needsAbove = spaceBelow < 320 && spaceAbove > spaceBelow;

    setLayout({ mode, openUp: needsAbove, alignLeft: useAlignLeft, popupWidth });
  }, []);

  useEffect(() => { if (open) computeLayout(); }, [open, computeLayout]);
  useEffect(() => {
    window.addEventListener("resize", computeLayout);
    return () => window.removeEventListener("resize", computeLayout);
  }, [computeLayout]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Handlers ──
  const handleDayClick = (date) => {
    if (!selecting || !startDate) {
      setStartDate(date); setEndDate(null); setSelecting(true); setActivePreset(null);
    } else {
      if (date < startDate) { setStartDate(date); setEndDate(startDate); }
      else { setEndDate(date); }
      setSelecting(false); setActivePreset(null);
    }
  };

  const handlePreset = (p, idx) => {
    const [s, e] = p.fn();
    setStartDate(s); setEndDate(e); setSelecting(false); setActivePreset(idx);

    const sm = s.getMonth(), sy = s.getFullYear();

    // Build the two months and clamp both to today
    let newLeft = { year: sy, month: sm };
    let newRight = sm + 1 > 11 ? { year: sy + 1, month: 0 } : { year: sy, month: sm + 1 };

    newRight = clampToToday(newRight);
    // If clamping pushed right == left, shift left back one month
    if (newRight.year === newLeft.year && newRight.month === newLeft.month) {
      newLeft = newLeft.month - 1 < 0
        ? { year: newLeft.year - 1, month: 11 }
        : { year: newLeft.year, month: newLeft.month - 1 };
    }

    setLeftMonth(newLeft);
    setRightMonth(newRight);
  };

  const prevMonth = () => {
    setLeftMonth(p => {
      const m = p.month - 1 < 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: p.month - 1 };
      setRightMonth(m.month + 1 > 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 });
      return m;
    });
  };

  const nextMonth = () => {
    // Block if right is already at current month
    const isAtMax =
      rightMonth.year > today.getFullYear() ||
      (rightMonth.year === today.getFullYear() && rightMonth.month >= today.getMonth());
    if (isAtMax) return;

    setRightMonth(p => {
      const m = clampToToday(
        p.month + 1 > 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: p.month + 1 }
      );
      setLeftMonth(m.month - 1 < 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 });
      return m;
    });
  };

  const handleApply = () => {
    if (startDate && onApply) onApply(startDate, endDate || startDate);
    setOpen(false);
  };

  const handleClear = () => {
    setStartDate(null); setEndDate(null); setSelecting(false); setActivePreset(null);
    if (onClear) onClear();
  };

  const hasValue = !!startDate;
  const displayValue = hasValue
    ? (endDate && !isSameDay(startDate, endDate)
      ? `${formatDate(startDate)} – ${formatDate(endDate)}`
      : formatDate(startDate))
    : "Select date range";

  const { mode, openUp, alignLeft, popupWidth } = layout;
  const compact = mode !== "dual";

  const isNextDisabled =
    rightMonth.year > today.getFullYear() ||
    (rightMonth.year === today.getFullYear() && rightMonth.month >= today.getMonth());

  const popupPositionStyle = {
    position: "absolute",
    ...(openUp ? { bottom: "calc(100% + 6px)", top: "auto" } : { top: "calc(100% + 6px)", bottom: "auto" }),
    ...(alignLeft ? { left: 0, right: "auto" } : { right: 0, left: "auto" }),
    width: popupWidth,
    maxWidth: "calc(100vw - 16px)",
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>

      {/* ── Trigger ── */}
      <div
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg border text-[12px] font-mono cursor-pointer select-none transition-all ${
          open
            ? "border-[#6366f1] ring-2 ring-[#6366f1]/20 bg-white text-[#4f46e5]"
            : hasValue
              ? "border-[#6366f1]/40 bg-[#eef2ff] text-[#4f46e5]"
              : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-white"
        }`}
        style={{ minWidth: 190 }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={hasValue || open ? "#4f46e5" : "#9ca3af"}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="flex-1 truncate">{displayValue}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasValue && (
            <span
              onClick={e => { e.stopPropagation(); handleClear(); }}
              className="w-[14px] h-[14px] rounded-full bg-[#4f46e5]/10 hover:bg-[#4f46e5]/20 flex items-center justify-center cursor-pointer"
            >
              <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="2" x2="8" y2="8" /><line x1="8" y1="2" x2="2" y2="8" />
              </svg>
            </span>
          )}
          <svg
            width="9" height="9" viewBox="0 0 12 12" fill="none"
            stroke={hasValue || open ? "#4f46e5" : "#9ca3af"} strokeWidth="2" strokeLinecap="round"
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            <polyline points="2,4 6,8 10,4" />
          </svg>
        </div>
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div
          ref={popupRef}
          style={{
            ...popupPositionStyle,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            zIndex: 9999,
            display: "flex",
            overflow: "hidden",
          }}
        >
          {/* Presets */}
          {mode !== "mobile" && (
            <div style={{ width: compact ? 100 : 115, borderRight: "1px solid #f0f0f0", padding: "10px 0", flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase", padding: "0 10px 6px" }}>
                Quick select
              </div>
              {PRESETS.map((p, i) => (
                <PresetItem key={i} label={p.label} active={activePreset === i} compact={compact} onClick={() => handlePreset(p, i)} />
              ))}
            </div>
          )}

          {/* Calendar area */}
          <div style={{ flex: 1, padding: compact ? "10px 8px 8px" : "14px 10px 10px", minWidth: 0 }}>

            {/* Mobile preset chips */}
            {mode === "mobile" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handlePreset(p, i)}
                    style={{
                      fontSize: 10, padding: "3px 8px", borderRadius: 20,
                      border: activePreset === i ? "1px solid #6366f1" : "1px solid #e5e7eb",
                      background: activePreset === i ? "#eef2ff" : "#f9fafb",
                      color: activePreset === i ? "#4f46e5" : "#6b7280",
                      cursor: "pointer", fontWeight: activePreset === i ? 600 : 400,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Nav */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <button
                onClick={prevMonth}
                style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 5, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}
              >
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="8,2 4,6 8,10" />
                </svg>
              </button>
              <button
                onClick={nextMonth}
                disabled={isNextDisabled}
                style={{
                  background: "none", border: "1px solid #e5e7eb", borderRadius: 5,
                  width: 22, height: 22, display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#6b7280",
                  opacity: isNextDisabled ? 0.3 : 1,
                  cursor: isNextDisabled ? "not-allowed" : "pointer",
                }}
              >
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="4,2 8,6 4,10" />
                </svg>
              </button>
            </div>

            {/* Calendars */}
            <div
              style={{ display: "flex", justifyContent: "center", gap: mode === "dual" ? 12 : 0 }}
              onMouseLeave={() => setHoverDate(null)}
            >
              <CalendarMonth
                {...leftMonth}
                maxDate={today}
                startDate={startDate} endDate={endDate}
                hoverDate={selecting ? hoverDate : null}
                onDayClick={handleDayClick}
                onDayHover={d => selecting && setHoverDate(d)}
                compact={compact}
              />
              {mode === "dual" && (
                <>
                  <div style={{ width: 1, background: "#f0f0f0", flexShrink: 0 }} />
                  <CalendarMonth
                    {...rightMonth}
                    maxDate={today}
                    startDate={startDate} endDate={endDate}
                    hoverDate={selecting ? hoverDate : null}
                    onDayClick={handleDayClick}
                    onDayHover={d => selecting && setHoverDate(d)}
                    compact={compact}
                  />
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <span style={{ fontSize: 10, color: "#9ca3af", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selecting ? "Now click an end date" : startDate ? `${formatDate(startDate)}${endDate ? ` – ${formatDate(endDate)}` : ""}` : "Click a start date"}
              </span>
              <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                <button onClick={handleClear} className="text-[11px] px-2.5 py-1 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 cursor-pointer">
                  Clear
                </button>
                <button
                  onClick={handleApply}
                  disabled={!startDate}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium border-0 ${startDate ? "bg-[#4f46e5] text-white hover:bg-[#4338ca] cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;