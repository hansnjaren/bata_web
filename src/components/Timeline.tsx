import React, { useEffect, useState } from "react";
import TimelineGraph from "./TimelineGraph";

const timeStringToSec = (str: string) => {
  const [m, s] = str.split(":");
  return parseInt(m) * 60 + parseFloat(s);
};

// 캐릭터(혹은 스킬)의 alias까지 지원하면서 skill과 name을 함께 찾는 함수
type Role = "attack" | "support";

function findCanonicalNameAndSkill(
  character: string, // 입력 or 파싱된 이름
  type: string | null, // 입력된 스킬 타입(ON/1타/2스 등)
  characters: Character[],
  role: Role
): { name: string; skill: Skill } | null {
  // step1: 캐릭터 객체 찾기 (name/alias 둘 다 확인)
  const char = characters.find(
    (ch) => ch.name === character || ch.alias.includes(character)
  );
  if (!char) return null;

  // step2: type이 null이면 "EX"로 대체, 각 스킬별로 alias 포함 체크
  const skillType = type || "EX";
  // 'type' 혹은 'alias'에 해당 문자열이 있으면 OK, 그리고 role이 요구하는 값 포함하는 것도 확인
  const skill = char.skills.find(
    (sk) =>
      (sk.type === skillType || sk.alias.includes(skillType)) &&
      sk.role.includes(role)
  );
  if (!skill) return null;
  return { name: char.name, skill };
}

export default function Timeline({ parsedData }: TimelineProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [enemies, setEnemies] = useState<Enemy>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [chrRes, enmRes] = await Promise.all([
          fetch("/data/character.json"),
          fetch("/data/enemy.json"),
        ]);

        const [chrData, enmData] = await Promise.all([
          chrRes.json(),
          enmRes.json(),
        ]);

        setCharacters(chrData);
        setEnemies(enmData);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    fetchData();
  }, []);

  const attackItems: AttackSkill[] =
    parsedData?.flatMap(({ time, character, type, target }) => {
      // 캐릭터+type에서 공격용 스킬 찾기
      const result = findCanonicalNameAndSkill(
        character,
        type,
        characters,
        "attack"
      );
      if (!result) return [];
      // 조건: target이 null이거나 enemies 목록에 있어야 함
      if (target !== null && !enemies.includes(target)) return [];
      const tSec = timeStringToSec(time);
      return [
        {
          startTime: tSec,
          character: result.name,
          detail: result.skill.type,
          allDelays: result.skill.delays, // 배열 전체 저장
        },
      ];
    }) || [];

  const buffItems: BuffSkill[] =
    parsedData?.flatMap(({ time, character, type, target }) => {
      const result = findCanonicalNameAndSkill(
        character,
        type,
        characters,
        "support"
      );
      if (!result) return [];
      // 조건: target이 null이거나 target이 attack 역할 스킬을 갖는 캐릭터일 때만 추가
      let validTarget = false;
      if (target === null) {
        validTarget = true;
      } else {
        // target이 공(격) 타입 스킬 가진 캐릭터면 통과
        const targetChar = characters.find(
          (c) => c.name === target || c.alias.includes(target)
        );
        validTarget = !!(
          targetChar && targetChar.skills.some((s) => s.role.includes("attack"))
        );
      }
      if (!validTarget) return [];
      const tSec = timeStringToSec(time);
      return [
        {
          time: tSec + (result.skill.delays[0] || 0),
          duration: result.skill.duration,
          character: result.name,
          detail: result.skill.type,
          UE2: characters.find((c) => c.name === result.name)?.UE2 ?? false,
        },
      ];
    }) || [];

  const usedCharacters = parsedData
    ? Array.from(new Set(parsedData.map((item) => item.character)))
    : [];

  const characterNames = [...characters.map((c) => c.name)];

  const filteredCharacters = characterNames.filter((name) =>
    usedCharacters.includes(name)
  );

  const [checkedUE2, setCheckedUE2] = React.useState<Record<string, boolean>>(
    {}
  );

  const handleCheckboxChange = (name: string) => {
    setCheckedUE2((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div>

      <TimelineGraph attackItems={attackItems} buffItems={buffItems} checkedUE2={checkedUE2}></TimelineGraph>

      <h3>캐릭터 리스트</h3>
      {filteredCharacters.map((name) => {
        const chr = characters.find((c) => c.name === name);
        const isChecked = chr?.UE2 && checkedUE2[name];

        return (
          <div
            key={name}
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <div>{name}</div>
            {chr && chr.UE2 && (
              <>
                <input
                  type="checkbox"
                  checked={!!isChecked}
                  onChange={() => handleCheckboxChange(name)}
                  style={{ marginLeft: 10, marginRight: 4 }}
                />
                <div>전무 2성 여부</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
