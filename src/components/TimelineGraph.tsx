import React, { useEffect, useState } from "react";
import { defaultHeight } from "../constants/sizes";
import { useSkillTypes } from "../hooks/useSkillTypes";
import { useTimeBounds } from "../hooks/useTimeBounds";
import { secToTimeString } from "../utils/time";
import { AttackSkillBlock } from "./AttackSkillBlock";
import { BuffSkillBlock } from "./BuffSkillBlock";

export default function TimelineGraph({
  attackItems,
  buffItems,
  checkedUE2,
  widthMult,
  timeZoneNum,
}: {
  attackItems: any[];
  buffItems: any[];
  checkedUE2: Record<string, boolean>;
  widthMult: number;
  timeZoneNum: number;
}) {
  const skillTypes = useSkillTypes(attackItems, buffItems);
  const { maxTime, minTime } = useTimeBounds(
    attackItems,
    buffItems,
    checkedUE2
  );

  type OpenTooltip =
    | { type: "attack"; index: number }
    | { type: "buff"; index: number }
    | null;

  const [openTooltip, setOpenTooltip] = useState<OpenTooltip>(null);
  const [clickLock, setClickLock] = useState<OpenTooltip>(null);

  useEffect(() => {
    if (clickLock === null) return;

    function handleClickOutside(event: MouseEvent) {
      setClickLock(null);
      setOpenTooltip(null);
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clickLock]);

  const handleHover = (type: "attack" | "buff", index: number) => {
    if (clickLock === null) {
      setOpenTooltip({ type, index });
    } else if (clickLock.type !== type || clickLock.index !== index) {
      setClickLock(null);
      setOpenTooltip({ type, index });
    }
  };

  const handleLeave = (type: "attack" | "buff", index: number) => {
    if (clickLock === null) {
      setOpenTooltip(null);
    }
  };

  const handleClick = (type: "attack" | "buff", index: number) => {
    if (clickLock?.type === type && clickLock?.index === index) {
      setClickLock(null);
      setOpenTooltip(null);
    } else {
      setClickLock({ type, index });
      setOpenTooltip({ type, index });
    }
  };

  const [scrollDownPx, setScrollDownPx] = useState(0);
  const [scrollLeftPx, setScrollLeftPx] = useState(0);
  const [viewportWidthPx, setViewportWidthPx] = useState(0);
  const [viewportTopPx, setViewportTopPx] = useState(0);
  const [viewportLeftPx, setViewportLeftPx] = useState(0);

  React.useEffect(() => {
    const element = document.getElementById("timelineView");
    if (!element) return;

    const updateRect = () => {
      const rect = element.getBoundingClientRect();
      setViewportWidthPx(rect.width);
      setViewportTopPx(rect.top);
      setViewportLeftPx(rect.left);
    };
    updateRect();

    const onElementScroll = () => {
      setScrollLeftPx(element.scrollLeft);
    };

    const onDocumentScroll = () => {
      setScrollDownPx(window.scrollY);
    }

    const onResize = () => {
      updateRect();
    };

    element.addEventListener("scroll", onElementScroll);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onDocumentScroll);
    return () => {
      element.removeEventListener("scroll", onElementScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onDocumentScroll);
    };
  }, [attackItems, buffItems, window.scrollY]);

  return (
    <div>
      <h3>시각화 블럭</h3>
      <div style={{ padding: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            borderBottom: "1px solid black",
          }}
        >
          <div style={{ display: "inline-block" }}>
            {" "}
            {secToTimeString(
              maxTime -
                ((maxTime - minTime) * scrollLeftPx) /
                  (viewportWidthPx * widthMult)
            )}{" "}
          </div>
          <div style={{ display: "inline-block" }}>
            {" "}
            {secToTimeString(
              maxTime -
                ((maxTime - minTime) * (scrollLeftPx + viewportWidthPx)) /
                  (viewportWidthPx * widthMult)
            )}{" "}
          </div>
          {Array.from({ length: timeZoneNum - 1 }).map((_, i) => {
            const ratio = (i + 1) / timeZoneNum;
            const time =
              maxTime -
              ((maxTime - minTime) * (scrollLeftPx + viewportWidthPx * ratio)) /
                (viewportWidthPx * widthMult);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${ratio * 100}%`,
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                }}
              >
                {secToTimeString(time)}
              </div>
            );
          })}
        </div>
        <div>
          {Array.from({ length: timeZoneNum + 1 }).map((_, i) => {
            return (
              <div
                style={{
                  position: "absolute",
                  top: ``,
                  width: `${(viewportWidthPx * i) / timeZoneNum}px`,
                  height: `${defaultHeight * skillTypes.length}px`,
                  borderRight: "1px solid gray",
                  zIndex: -2,
                }}
              ></div>
            );
          })}
        </div>

        <div
          id="timelineView"
          style={{
            position: "relative",
            width: "100%",
            height: `${defaultHeight * skillTypes.length + 20}px`,
            boxSizing: "border-box",
            overflow: "auto",
          }}
        >
          <div style={{ width: `${100 * widthMult}%` }}></div>
          {attackItems.map((item, i) => (
            <AttackSkillBlock
              key={i}
              item={item}
              skillTypes={skillTypes}
              maxTime={maxTime}
              minTime={minTime}
              widthMult={widthMult}
              index={i}
              isOpen={openTooltip?.type === "attack" && openTooltip.index === i}
              onHover={() => handleHover("attack", i)}
              onLeave={() => handleLeave("attack", i)}
              onClick={() => handleClick("attack", i)}
            />
          ))}

          {buffItems.map((item, i) => (
            <BuffSkillBlock
              key={i}
              item={item}
              skillTypes={skillTypes}
              maxTime={maxTime}
              minTime={minTime}
              widthMult={widthMult}
              checkedUE2={checkedUE2}
              index={i}
              isOpen={openTooltip?.type === "buff" && openTooltip.index === i}
              onHover={() => handleHover("buff", i)}
              onLeave={() => handleLeave("buff", i)}
              onClick={() => handleClick("buff", i)}
            />
          ))}
        </div>

        {skillTypes.map((item, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${scrollDownPx + viewportTopPx + defaultHeight * i}px`,
              left: `${viewportLeftPx}px`,
              width: `${viewportWidthPx}px`,
              height: `${defaultHeight}px`,
              boxSizing: "border-box",
              borderBottom: "1px solid black",
              zIndex: -2,
            }}
          >
            {item[0]} {item[1]}
          </div>
        ))}
      </div>
    </div>
  );
}
