import React, { useState, useRef, useLayoutEffect, useCallback } from "react";
import ReactDOM from "react-dom";

const DescriptionTooltip = ({ text }) => {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const tooltipW = 300;

    const calcPosition = useCallback(() => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const trigRect  = triggerRef.current.getBoundingClientRect();
        const tipH      = tooltipRef.current.getBoundingClientRect().height;
        const gap       = 6;
        const padding   = 8;

        // ── Horizontal ──────────────────────────────────────────
        let left = trigRect.left;
        if (left + tooltipW > window.innerWidth - padding) {
            left = window.innerWidth - tooltipW - padding;
        }
        if (left < padding) left = padding;

        // ── Vertical: flip above if not enough room below ────────
        const spaceBelow = window.innerHeight - trigRect.bottom - gap;
        const spaceAbove = trigRect.top - gap;

        let top;
        if (spaceBelow >= tipH) {
            top = trigRect.bottom + gap;
        } else if (spaceAbove >= tipH) {
            top = trigRect.top - tipH - gap;
        } else {
            // not enough either side — pick whichever is bigger and clamp
            top = spaceBelow >= spaceAbove
                ? trigRect.bottom + gap
                : Math.max(padding, trigRect.top - tipH - gap);
        }

        setCoords({ top, left });
    }, []);

    // ✅ Run after tooltip renders to measure real height
    useLayoutEffect(() => {
        if (visible) calcPosition();
    }, [visible, calcPosition]);

    // ✅ Recalculate on scroll/resize so it stays aligned
    useLayoutEffect(() => {
        if (!visible) return;
        window.addEventListener("scroll", calcPosition, true);
        window.addEventListener("resize", calcPosition);
        return () => {
            window.removeEventListener("scroll", calcPosition, true);
            window.removeEventListener("resize", calcPosition);
        };
    }, [visible, calcPosition]);

    if (!text) {
        return (
            <span className="text-[11px] text-gray-300 truncate w-full">—</span>
        );
    }

    return (
        <div ref={triggerRef} className="flex items-center min-w-0 w-full"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            <span className="text-[11px] text-gray-500 truncate cursor-default w-full">
                {text}
            </span>

            {visible && ReactDOM.createPortal(
                <div
                    ref={tooltipRef}
                    style={{
                        position: "fixed",
                        top: coords.top,
                        left: coords.left,
                        width: tooltipW,
                        zIndex: 2147483647, // ✅ max possible z-index — above everything
                        maxHeight: "40vh",
                        overflowY: "auto",
                        pointerEvents: "none",
                    }}
                    className="bg-gray-900 text-white text-[11px] leading-relaxed px-3 py-2.5 rounded-lg shadow-2xl"
                >
                    {text}
                </div>,
                document.body
            )}
        </div>
    );
};

export default DescriptionTooltip;