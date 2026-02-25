import { useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { defaultHeight } from "../constants/sizes";
import { secToTimeString } from "../utils/time";

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
  onDragMove?: (dxPx: number) => void; // 누적 dxPx
  onDragEnd?: () => void;
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
}: AttackSkillBlockProps) {
  const { startTime, character, allDelays } = item;

  const ref = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left?: number;
    right?: number;
  }>({ top: 0, left: 0 });
  const [tooltipDir, setTooltipDir] = useState<"right" | "left">("right");

  const dragRef = useRef<null | { pointerId: number; startX: number }>(null);

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
          touchAction: editable ? "none" : "auto", // 기본 터치 동작 비활성화 [web:92]
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

          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId); // [web:50]
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

          // pointerup 때 캡처는 암시적으로도 해제될 수 있지만, 명시적으로 해도 됨 [web:50][web:91]
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
            onClick={(e) => e.stopPropagation()}
          >
            스킬 사용 캐릭터: {character}
            <br />
            스킬 사용 시간: {secToTimeString(startTime)}
            <br />
            모든 타수 시점:{" "}
            {allDelays.map((d) => secToTimeString(startTime - d)).join(", ")}
          </div>,
          document.body,
        )}
    </>
  );
}
