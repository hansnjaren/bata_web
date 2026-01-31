import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { defaultHeight } from "../constants/sizes";
import { secToTimeString } from "../utils/time";

interface AttackSkillBlockProps {
  item: AttackSkill;
  skillTypes: Array<[string, string]>;
  maxTime: number;
  minTime: number;
  widthMult: number;
  index: number;
  isOpen: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

export function AttackSkillBlock({
  item,
  skillTypes,
  maxTime,
  minTime,
  widthMult,
  index,
  isOpen,
  onHover,
  onLeave,
  onClick,
}: AttackSkillBlockProps) {
  const { startTime, character, detail, allDelays } = item;
  const id = skillTypes.findIndex(
    ([char, det]) => char === character && det === detail,
  );
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
            (widthMult * allDelays[allDelays.length - 1] * 100) /
            (maxTime - minTime)
          }%`,
          top: defaultHeight * id,
          height: defaultHeight,
          borderLeft: "1px solid black",
          backgroundColor: "#0000ff33",
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
          {allDelays.map((delay: number, i: number) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: -defaultHeight * id,
                width: `${(delay * 100) / allDelays[allDelays.length - 1]}%`,
                height: defaultHeight * skillTypes.length,
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
