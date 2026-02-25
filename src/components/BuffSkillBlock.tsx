import { useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { defaultHeight } from "../constants/sizes";
import { defaultDurationMultiplier } from "../constants/skills";
import { secToTimeString } from "../utils/time";

interface BuffSkillBlockProps {
  item: BuffSkill;
  maxTime: number;
  minTime: number;
  widthMult: number;
  checkedUE2: Record<string, boolean>;
  index: number;
  isOpen: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;

  editable?: boolean;
  onDragStart?: () => void;
  onDragMove?: (dxPx: number) => void; // 누적 dxPx
  onDragEnd?: () => void;
}

export function BuffSkillBlock({
  item,
  maxTime,
  minTime,
  widthMult,
  checkedUE2,
  index,
  isOpen,
  onHover,
  onLeave,
  onClick,
  editable = false,
  onDragStart,
  onDragMove,
  onDragEnd,
}: BuffSkillBlockProps) {
  const { startTime, delay, duration, character } = item;

  const exactDuration =
    duration * (checkedUE2[character] ? defaultDurationMultiplier : 1);

  const ref = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left?: number;
    right?: number;
  }>({ top: 0, left: 0 });
  const [tooltipDir, setTooltipDir] = useState<"right" | "left">("right");

  // drag state
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
          width: `${(widthMult * (delay + exactDuration) * 100) / (maxTime - minTime)}%`,
          top: defaultHeight * index,
          height: defaultHeight,
          borderLeft: "1px solid red",
          cursor: editable ? "ew-resize" : "pointer",
          touchAction: editable ? "none" : "auto", // 터치 제스처로 인한 cancel 방지에 도움 [web:92]
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

          onDragMove?.(e.clientX - s.startX);
        }}
        onPointerUp={(e) => {
          if (!editable) return;
          const s = dragRef.current;
          if (!s || s.pointerId !== e.pointerId) return;

          dragRef.current = null;
          // pointerup에서 캡처는 자동 해제될 수 있지만, 명시적으로 호출해도 됨 [web:50]
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
          onDragEnd?.(); // 브라우저가 스크롤/줌으로 전환하면 cancel 날 수 있음 [web:138]
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${(delay * 100) / (delay + exactDuration)}%`,
              width: `${(exactDuration * 100) / (delay + exactDuration)}%`,
              height: "100%",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              backgroundColor: "#0000ff33",
            }}
          />
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
            시작 시간: {secToTimeString(startTime - delay)}
            <br />
            종료 시간: {secToTimeString(startTime - delay - exactDuration)}
            <br />
            지속시간: {exactDuration.toFixed(2)}초
          </div>,
          document.body,
        )}
    </>
  );
}
