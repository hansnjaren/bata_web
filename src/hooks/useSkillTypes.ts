import { useEffect, useState } from "react";

export const useSkillTypes = (
  attackItems: SkillItem[],
  buffItems: SkillItem[],
) => {
  const [skillTypes, setSkillTypes] = useState<Array<[string, string | null]>>(
    [],
  );

  useEffect(() => {
    const combined = [...attackItems, ...buffItems];
    const uniqueSet = new Set<string>();
    const newSkillTypes: [string, string | null][] = [];

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
