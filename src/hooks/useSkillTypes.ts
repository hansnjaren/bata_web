import { useEffect, useState } from "react";

export const useSkillTypes = (
  attackItems: SkillItem[],
  buffItems: SkillItem[],
) => {
  const [skillTypes, setSkillTypes] = useState<Array<SkillItem>>([]);

  useEffect(() => {
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
    setSkillTypes(newSkillTypes);
  }, [attackItems, buffItems]);

  return skillTypes;
};
