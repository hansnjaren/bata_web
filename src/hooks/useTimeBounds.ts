import { useEffect, useState } from "react";
import { defaultDurationMultiplier } from "../constants/skills";

type AttackSkill = {
  startTime: number;
  allDelays: number[];
  character: string;
  detail: string;
};
type BuffSkill = {
  startTime: number;
  delay: number;
  duration: number;
  character: string;
  detail: string;
};

export const useTimeBounds = (
  attackItems: AttackSkill[],
  buffItems: BuffSkill[],
  checkedUE2: Record<string, boolean>
) => {
  const [maxTime, setMaxTime] = useState<number>(600);
  const [minTime, setMinTime] = useState<number>(0);

  useEffect(() => {
    let tempMax = 0;
    let tempMin = 600;

    attackItems.forEach((item) => {
      if (item.startTime > tempMax) tempMax = item.startTime;
      const endTime =
        item.startTime - item.allDelays[item.allDelays.length - 1];
      if (endTime < tempMin) tempMin = endTime;
    });

    buffItems.forEach((item) => {
      if (item.startTime > tempMax) tempMax = item.startTime;
      const isChecked = checkedUE2[item.character] || false;
      const endTime =
        item.startTime -
        item.delay -
        item.duration * (isChecked ? defaultDurationMultiplier : 1);
      if (endTime < tempMin) tempMin = endTime;
    });

    tempMax = Math.ceil(tempMax / 10) * 10;
    tempMin = Math.max(Math.floor(tempMin / 10) * 10, 0);
    setMaxTime(tempMax);
    setMinTime(tempMin);
  }, [attackItems, buffItems, checkedUE2]);

  return { maxTime, minTime };
};
