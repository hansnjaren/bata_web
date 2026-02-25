// TimelineGraph.tsx
import React, { useEffect, useMemo, useState } from "react";
import { defaultHeight } from "../constants/sizes";
import { useSkillTypes } from "../hooks/useSkillTypes";
import { useTimeBounds } from "../hooks/useTimeBounds";
import { secToTimeString } from "../utils/time";
import { AttackSkillBlock } from "./AttackSkillBlock";
import { BuffSkillBlock } from "./BuffSkillBlock";

const FPS = 30;
const snapToFrame = (sec: number) => Math.round(sec * FPS) / FPS;
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export default function TimelineGraph({
  attackItems,
  buffItems,
  checkedUE2,
  widthMult,
  timeZoneNum,
  editable,
}: {
  attackItems: AttackSkill[];
  buffItems: BuffSkill[];
  checkedUE2: Record<string, boolean>;
  widthMult: number;
  timeZoneNum: number;
  editable: boolean;
}) {
  const [attack, setAttack] = useState<AttackSkill[]>(() =>
    attackItems.map((it) => ({ ...it, allDelays: [...it.allDelays] })),
  );
  const [buff, setBuff] = useState<BuffSkill[]>(() =>
    buffItems.map((it) => ({ ...it })),
  );

  const resetData = () => {
    setAttack(
      attackItems.map((it) => ({ ...it, allDelays: [...it.allDelays] })),
    );
    setBuff(buffItems.map((it) => ({ ...it })));
  };

  const skillTypes = useSkillTypes(attack, buff);
  const { maxTime, minTime } = useTimeBounds(attack, buff, checkedUE2);

  type OpenTooltip =
    | { type: "attack"; index: number }
    | { type: "buff"; index: number }
    | null;

  const [openTooltip, setOpenTooltip] = useState<OpenTooltip>(null);
  const [clickLock, setClickLock] = useState<OpenTooltip>(null);

  useEffect(() => {
    if (clickLock === null) return;
    function handleClickOutside() {
      setClickLock(null);
      setOpenTooltip(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clickLock]);

  const handleHover = (type: ItemType, index: number) => {
    if (clickLock === null) setOpenTooltip({ type, index });
    else if (clickLock.type !== type || clickLock.index !== index) {
      setClickLock(null);
      setOpenTooltip({ type, index });
    }
  };
  const handleLeave = () => {
    if (clickLock === null) setOpenTooltip(null);
  };

  const handleClick = (type: ItemType, index: number) => {
    if (clickLock?.type === type && clickLock?.index === index) {
      setClickLock(null);
      setOpenTooltip(null);
    } else {
      setClickLock({ type, index });
      setOpenTooltip({ type, index });
    }
  };

  const dragKeyToId = (type: ItemType, index: number) => `${type}:${index}`;
  const dragBaseRef = React.useRef<Record<string, number>>({});

  const handleDragStart = (type: ItemType, index: number) => {
    if (!editable) return;

    const id = dragKeyToId(type, index);
    const base =
      type === "attack" ? attack[index]?.startTime : buff[index]?.startTime;
    if (base === undefined) return;

    dragBaseRef.current[id] = base;
  };

  const [scrollLeftPx, setScrollLeftPx] = useState(0);
  const [viewportWidthPx, setViewportWidthPx] = useState(0);

  React.useEffect(() => {
    const element = document.getElementById("timelineView");
    if (!element) return;

    const updateRect = () =>
      setViewportWidthPx(element.getBoundingClientRect().width);
    updateRect();

    const onElementScroll = () => setScrollLeftPx(element.scrollLeft);
    const onResize = () => updateRect();

    element.addEventListener("scroll", onElementScroll);
    window.addEventListener("resize", onResize);
    return () => {
      element.removeEventListener("scroll", onElementScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const pxPerSec = useMemo(() => {
    const span = maxTime - minTime;
    if (span <= 0 || viewportWidthPx <= 0) return 0;
    return (widthMult * viewportWidthPx) / span;
  }, [maxTime, minTime, widthMult, viewportWidthPx]);

  const handleDragMove = (type: ItemType, index: number, dxPx: number) => {
    if (!editable) return;
    if (pxPerSec <= 0) return;

    const id = dragKeyToId(type, index);
    const base = dragBaseRef.current[id];
    if (base === undefined) return;

    const deltaSec = -dxPx / pxPerSec;
    const snapped = snapToFrame(base + deltaSec);
    const clampedSec = clamp(snapped, minTime, maxTime);

    if (type === "attack") {
      setAttack((prev) => {
        if (!prev[index]) return prev;
        const next = [...prev];
        next[index] = { ...next[index], startTime: clampedSec };
        return next;
      });
    } else {
      setBuff((prev) => {
        if (!prev[index]) return prev;
        const next = [...prev];
        next[index] = { ...next[index], startTime: clampedSec };
        return next;
      });
    }
  };

  const handleDragEnd = (type: ItemType, index: number) => {
    const id = dragKeyToId(type, index);
    delete dragBaseRef.current[id];
  };

  // ===== 커밋 함수들: snap+clamp는 여기서만 =====
  const commitAttackStartTime = (
    attackIndex: number,
    newStartTimeSec: number,
  ) => {
    const snapped = snapToFrame(newStartTimeSec);
    const clampedSec = clamp(snapped, minTime, maxTime);

    setAttack((prev) => {
      if (!prev[attackIndex]) return prev;
      const next = [...prev];
      next[attackIndex] = { ...next[attackIndex], startTime: clampedSec };
      return next;
    });
  };

  const commitBuffStartTime = (buffIndex: number, newStartTimeSec: number) => {
    const snapped = snapToFrame(newStartTimeSec);
    const clampedSec = clamp(snapped, minTime, maxTime);

    setBuff((prev) => {
      if (!prev[buffIndex]) return prev;
      const next = [...prev];
      next[buffIndex] = { ...next[buffIndex], startTime: clampedSec };
      return next;
    });
  };

  const getAttackStartTimeStr = (i: number) =>
    attack[i] ? secToTimeString(attack[i].startTime) : "00:00.000";

  const getBuffStartTimeStr = (i: number) =>
    buff[i] ? secToTimeString(buff[i].startTime) : "00:00.000";

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
            {secToTimeString(
              maxTime -
                ((maxTime - minTime) * scrollLeftPx) /
                  (viewportWidthPx * widthMult),
            )}
          </div>

          <div style={{ display: "inline-block" }}>
            {secToTimeString(
              maxTime -
                ((maxTime - minTime) * (scrollLeftPx + viewportWidthPx)) /
                  (viewportWidthPx * widthMult),
            )}
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
          {Array.from({ length: timeZoneNum + 1 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: `${(viewportWidthPx * i) / timeZoneNum}px`,
                height: `${defaultHeight * skillTypes.length}px`,
                borderRight: "1px solid gray",
                zIndex: -2,
              }}
            />
          ))}
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
          {skillTypes.map((item, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${defaultHeight * i}px`,
                height: `${defaultHeight}px`,
                width: `${100 * widthMult}%`,
                boxSizing: "border-box",
                borderBottom: "1px solid black",
                backgroundColor: "transparent",
              }}
            >
              {item[0]}
              {item[1] && `>${item[1]}`}
            </div>
          ))}

          <div
            style={{
              position: "relative",
              width: `${widthMult * viewportWidthPx}px`,
              height: `${defaultHeight * skillTypes.length}px`,
              overflow: "hidden",
            }}
          >
            {attack.map((item, i) => (
              <AttackSkillBlock
                key={`attack:${i}`}
                item={item}
                maxTime={maxTime}
                minTime={minTime}
                widthMult={widthMult}
                index={skillTypes.findIndex(
                  ([char, det]) =>
                    char === item.character && det === item.detail,
                )}
                isOpen={
                  openTooltip?.type === "attack" && openTooltip.index === i
                }
                totalItems={skillTypes.length}
                onHover={() => handleHover("attack", i)}
                onLeave={() => handleLeave()}
                onClick={() => handleClick("attack", i)}
                editable={editable}
                onDragStart={() => handleDragStart("attack", i)}
                onDragMove={(dxPx) => handleDragMove("attack", i, dxPx)}
                onDragEnd={() => handleDragEnd("attack", i)}
                onCommitStartTime={(newSec) => commitAttackStartTime(i, newSec)}
                getResetDraftValue={() => getAttackStartTimeStr(i)}
              />
            ))}

            {buff.map((item, i) => (
              <BuffSkillBlock
                key={`buff:${i}`}
                item={item}
                maxTime={maxTime}
                minTime={minTime}
                widthMult={widthMult}
                checkedUE2={checkedUE2}
                index={skillTypes.findIndex(
                  ([char, det]) =>
                    char === item.character && det === item.detail,
                )}
                isOpen={openTooltip?.type === "buff" && openTooltip.index === i}
                onHover={() => handleHover("buff", i)}
                onLeave={() => handleLeave()}
                onClick={() => handleClick("buff", i)}
                editable={editable}
                onDragStart={() => handleDragStart("buff", i)}
                onDragMove={(dxPx) => handleDragMove("buff", i, dxPx)}
                onDragEnd={() => handleDragEnd("buff", i)}
                onCommitStartTime={(newSec) => commitBuffStartTime(i, newSec)}
                getResetDraftValue={() => getBuffStartTimeStr(i)}
              />
            ))}
          </div>
        </div>

        <button onClick={resetData}>타임라인 초기화</button>
      </div>
    </div>
  );
}
