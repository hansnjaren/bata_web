import { useEffect, useState } from "react";

type SkillItem = { character: string; detail: string };

export const useSkillTypes = (
  attackItems: SkillItem[],
  buffItems: SkillItem[]
) => {
  const [skillTypes, setSkillTypes] = useState<Array<[string, string]>>([]);

  useEffect(() => {
    const combined = [...attackItems, ...buffItems];
    const uniqueSet = new Set<string>();
    const newSkillTypes: [string, string][] = [];

    combined.forEach((item) => {
      const key = `${item.character}-${item.detail}`;
      if (!uniqueSet.has(key)) {
        uniqueSet.add(key);
        newSkillTypes.push([item.character, item.detail]);
      }
    });
    setSkillTypes(newSkillTypes);
  }, [attackItems, buffItems]);

  return skillTypes;
};
