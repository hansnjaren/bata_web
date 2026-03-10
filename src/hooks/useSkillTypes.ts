import { useMemo } from "react";
import { SkillItem } from "../interfaces/timelineData";

export const useSkillTypes = (
  attackItems: SkillItem[],
  buffItems: SkillItem[],
) => {
  return useMemo(() => {
    const combined = [...attackItems, ...buffItems];
    const uniqueSet = new Set<string>();
    const newSkillTypes: SkillItem[] = [];

    combined.forEach((item) => {
      const key = `${item.character}-${item.type}-${item.detail}`;
      if (!uniqueSet.has(key)) {
        uniqueSet.add(key);
        newSkillTypes.push({
          character: item.character,
          type: item.type,
          detail: item.detail,
        });
      }
    });
    
    return newSkillTypes;
  }, [attackItems, buffItems]);
};
