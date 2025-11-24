import React, { useState, useEffect } from "react";
import { useSkillTypes } from "../hooks/useSkillTypes";
import { useTimeBounds } from "../hooks/useTimeBounds";
import { AttackSkillBlock } from "./AttackSkillBlock";
import { BuffSkillBlock } from "./BuffSkillBlock";
import { MultiplierInput } from "./MultiplierInput";
import { defaultHeight } from "../constants/sizes";

export default function TimelineGraph({
  attackItems,
  buffItems,
  checkedUE2,
}: {
  attackItems: any[];
  buffItems: any[];
  checkedUE2: Record<string, boolean>;
}) {
  const skillTypes = useSkillTypes(attackItems, buffItems);
  const { maxTime, minTime } = useTimeBounds(attackItems, buffItems, checkedUE2);

  const [widthMult, setWidthMult] = useState<number>(1);
  const [widthMultInput, setWidthMultInput] = useState<string>("1");
  const [heightMult, setHeightMult] = useState<number>(1);
  const [heightMultInput, setHeightMultInput] = useState<string>("1");

  type OpenTooltip =
    | { type: "attack"; index: number }
    | { type: "buff"; index: number }
    | null;

  const [openTooltip, setOpenTooltip] = useState<OpenTooltip>(null);
  const [clickLock, setClickLock] = useState<OpenTooltip>(null);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setWidthMultInput("");
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setWidthMultInput(num < 1 ? "1" : value);
      setWidthMult(num < 1 ? 1 : num);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setHeightMultInput("");
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setHeightMultInput(num < 1 ? "1" : value);
      setHeightMult(num < 1 ? 1 : num);
    }
  };

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

  return (
    <div>
      <h3>시각화 블럭</h3>
      <div style={{ padding: 10 }}>
        <div
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
                width: `${100 * widthMult}%`,
                height: `${defaultHeight * heightMult}px`,
                boxSizing: "border-box",
                backgroundColor: "#00ff0033",
              }}
            >
              ID: {i}, 스킬 종류: {item[0]} {item[1]}
            </div>
          ))}

          {attackItems.map((item, i) => (
            <AttackSkillBlock
              key={i}
              item={item}
              skillTypes={skillTypes}
              maxTime={maxTime}
              minTime={minTime}
              widthMult={widthMult}
              heightMult={heightMult}
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
              heightMult={heightMult}
              checkedUE2={checkedUE2}
              index={i}
              isOpen={openTooltip?.type === "buff" && openTooltip.index === i}
              onHover={() => handleHover("buff", i)}
              onLeave={() => handleLeave("buff", i)}
              onClick={() => handleClick("buff", i)}
            />
          ))}
        </div>
      </div>

      <h3>가로/세로 배율</h3>
      <div>
        <MultiplierInput labelText="Width Multiplier" value={widthMultInput} onChange={handleWidthChange} />
      </div>
      <div>
        <MultiplierInput labelText="Height Multiplier" value={heightMultInput} onChange={handleHeightChange} />
      </div>
      <div>현재 Width Multiplier: {widthMult}</div>
      <div>현재 Height Multiplier: {heightMult}</div>
    </div>
  );
}
