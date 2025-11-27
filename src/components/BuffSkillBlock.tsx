import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { defaultHeight } from "../constants/sizes";
import { defaultDurationMultiplier } from "../constants/skills";
import { secToTimeString } from "../utils/time";

interface BuffSkillBlockProps {
  item: BuffSkill;
  skillTypes: Array<[string, string]>;
  maxTime: number;
  minTime: number;
  widthMult: number;
  checkedUE2: Record<string, boolean>;
  index: number;
  isOpen: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

export function BuffSkillBlock({
  item,
  skillTypes,
  maxTime,
  minTime,
  widthMult,
  checkedUE2,
  index,
  isOpen,
  onHover,
  onLeave,
  onClick,
}: BuffSkillBlockProps) {
  const { startTime, delay, duration, character, detail } = item;
  const id = skillTypes.findIndex(
    ([char, det]) => char === character && det === detail
  );
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

  useEffect(() => {
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
  }, [isOpen]);

  return (
    <>
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: `${
            (widthMult * (maxTime - startTime) * 100) / (maxTime - minTime)
          }%`,
          width: `${
            (widthMult * (delay + exactDuration) * 100) / (maxTime - minTime)
          }%`,
          top: defaultHeight * id,
          height: defaultHeight,
          borderLeft: "1px solid red",
          cursor: "pointer",
        }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
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
            종료 시간: {secToTimeString(startTime - delay - duration)}
            <br />
            지속시간: {exactDuration.toFixed(2)}초
          </div>,
          document.body
        )}
    </>
  );
}
