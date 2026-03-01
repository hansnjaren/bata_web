import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { defaultHeight } from "../constants/sizes";
import { parseNormalizeTimeNoSnap, secToTimeString } from "../utils/time";

interface AttackSkillBlockProps {
  item: AttackSkill;
  maxTime: number;
  minTime: number;
  widthMult: number;
  index: number;
  isOpen: boolean;
  totalItems: number;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;

  editable?: boolean;
  onDragStart?: () => void;
  onDragMove?: (dxPx: number) => void;
  onDragEnd?: () => void;

  onCommitStartTime: (newStartTimeSec: number) => void;
  getResetDraftValue: () => string;
}

export function AttackSkillBlock({
  item,
  maxTime,
  minTime,
  widthMult,
  index,
  isOpen,
  totalItems,
  onHover,
  onLeave,
  onClick,
  editable = false,
  onDragStart,
  onDragMove,
  onDragEnd,
  onCommitStartTime,
  getResetDraftValue,
}: AttackSkillBlockProps) {
  const { startTime, character, allDelays } = item;

  const ref = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left?: number;
    right?: number;
  }>({
    top: 0,
    left: 0,
  });
  const [tooltipDir, setTooltipDir] = useState<"right" | "left">("right");

  const dragRef = useRef<null | { pointerId: number; startX: number }>(null);

  // 시간 입력(draft)
  const [draftTime, setDraftTime] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    setDraftTime(secToTimeString(startTime));
    queueMicrotask(() => inputRef.current?.focus());
  }, [isOpen, startTime]);

  useEffect(() => {
    if (!isOpen) return;
    return () => {
      setDraftTime("");
    };
  }, [isOpen]);

  const commit = () => {
    const r = parseNormalizeTimeNoSnap(draftTime);
    if (r == null) return;

    // snap은 TimelineGraph에서만
    onCommitStartTime(r.sec);

    // 입력창은 정규화된 mm:ss.000로 교체(스냅 전 값이므로 프레임 정렬은 TG가 책임)
    setDraftTime(r.normalized);
  };

  useLayoutEffect(() => {
    if (isOpen && ref.current && tooltipRef.current) {
      const rect = ref.current.getBoundingClientRect();
      const clientWidth = document.documentElement.clientWidth;
      const tooltipWidth = tooltipRef.current.offsetWidth;

      if (clientWidth - rect.left < tooltipWidth) {
        setTooltipDir("left");
        setTooltipPos({
          top: rect.bottom + window.scrollY,
          right: clientWidth - rect.left,
        });
      } else {
        setTooltipDir("right");
        setTooltipPos({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
    }
  }, [isOpen, startTime]);

  return (
    <>
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: `${(widthMult * (maxTime - startTime) * 100) / (maxTime - minTime)}%`,
          width: `${(widthMult * allDelays[allDelays.length - 1] * 100) / (maxTime - minTime)}%`,
          top: defaultHeight * index,
          height: defaultHeight,
          borderLeft: "1px solid black",
          backgroundColor: "#0000ff33",
          cursor: editable ? "ew-resize" : "pointer",
          touchAction: editable ? "none" : "auto",
        }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerDown={(e) => {
          if (!editable) return;
          e.stopPropagation();

          if (e.pointerType === "mouse" && e.button !== 0) return;

          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          dragRef.current = { pointerId: e.pointerId, startX: e.clientX };
          onDragStart?.();
        }}
        onPointerMove={(e) => {
          if (!editable) return;
          const s = dragRef.current;
          if (!s || s.pointerId !== e.pointerId) return;

          const dxPx = e.clientX - s.startX;
          onDragMove?.(dxPx);
        }}
        onPointerUp={(e) => {
          if (!editable) return;
          const s = dragRef.current;
          if (!s || s.pointerId !== e.pointerId) return;

          dragRef.current = null;

          try {
            (e.currentTarget as HTMLDivElement).releasePointerCapture(
              e.pointerId,
            );
          } catch {}

          onDragEnd?.();
        }}
        onPointerCancel={(e) => {
          const s = dragRef.current;
          if (!s || s.pointerId !== e.pointerId) return;
          dragRef.current = null;
          onDragEnd?.();
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          {allDelays.map((delay: number, i: number) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: -defaultHeight * index,
                width: `${(delay * 100) / allDelays[allDelays.length - 1]}%`,
                height: defaultHeight * totalItems,
                borderRight: "1px solid black",
                zIndex: -1,
              }}
            />
          ))}
        </div>
      </div>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: "absolute",
              top: tooltipPos.top,
              left: tooltipDir === "right" ? tooltipPos.left : undefined,
              right: tooltipDir === "left" ? tooltipPos.right : undefined,
              border: "1px solid black",
              background: "white",
              padding: 4,
              zIndex: 1000,
              pointerEvents: "auto",
              maxWidth: "33vw",
              wordBreak: "break-word",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            스킬 사용 캐릭터: {character}
            <br />
            스킬 사용 시간:{" "}
            {editable ? (
              <span>
                <input
                  ref={inputRef}
                  value={draftTime}
                  inputMode="decimal"
                  onChange={(e) => {
                    const filtered = e.target.value.replace(/[^\d:.\-+]/g, "");
                    setDraftTime(filtered);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commit();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setDraftTime(getResetDraftValue());
                    }
                  }}
                  style={{ width: 140, fontFamily: "monospace" }}
                  placeholder="(m:)s(.0)"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    commit();
                  }}
                >
                  적용
                </button>
              </span>
            ) : (
              <span>{draftTime}</span>
            )}
            <br />
            모든 타수 시점:{" "}
            {allDelays.map((d) => secToTimeString(startTime - d)).join(", ")}
          </div>,
          document.body,
        )}
    </>
  );
}
