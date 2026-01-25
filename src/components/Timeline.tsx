import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { timeZoneNumMin, widthMultMin } from "../constants/sizes";
import { timeStringToSec } from "../utils/time";
import { MultiplierInput } from "./MultiplierInput";
import TimelineGraph from "./TimelineGraph";

function GoToButtonWithData({
  children,
  route,
  filteredCharacterNames,
  attackItems,
  buffItems,
  checkedUE2,
  widthMult,
  timeZoneNum,
}: {
  children?: React.ReactNode;
  route: string;
  filteredCharacterNames: string[];
  attackItems: AttackSkill[];
  buffItems: BuffSkill[];
  checkedUE2: Record<string, boolean>;
  widthMult: number;
  timeZoneNum: number;
}) {
  const navigate = useNavigate();
  const data = {
    filteredCharacterNames,
    attackItems,
    buffItems,
    checkedUE2,
    widthMult,
    timeZoneNum,
  };

  const goToParser = () => {
    navigate(route, { state: data });
  };

  return <button onClick={goToParser}>{children}</button>;
}

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

export default function Timeline({
  parsedData,
  sentFilteredCharacterNames,
  sentAttackItems,
  sentBuffItems,
  sentCheckedUE2,
  sentWidthMult,
  sentTimeZoneNum,
}: TimelineProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [enemies, setEnemies] = useState<Enemy>([]);
  const location = useLocation();

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

  const attackItems: AttackSkill[] = sentAttackItems
    ? sentAttackItems
    : parsedData?.flatMap(({ time, character, type, target }) => {
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
            detail: target,
            allDelays: result.skill.delays, // 배열 전체 저장
          },
        ];
      }) || [];

  const buffItems: BuffSkill[] = sentBuffItems
    ? sentBuffItems
    : parsedData?.flatMap(({ time, character, type, target }) => {
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
            targetChar &&
            targetChar.skills.some((s) => s.role.includes("attack"))
          );
        }
        if (!validTarget) return [];
        const tSec = timeStringToSec(time);
        return [
          {
            startTime: tSec,
            delay: result.skill.delays[0] || 0,
            duration: result.skill.duration,
            character: result.name,
            detail: target,
            UE2: characters.find((c) => c.name === result.name)?.UE2 ?? false,
          },
        ];
      }) || [];

  const usedCharacters = parsedData
    ? Array.from(new Set(parsedData.map((item) => item.character)))
    : [];

  const characterNames = [...characters.map((c) => c.name)];

  const filteredCharacters = sentFilteredCharacterNames
    ? sentFilteredCharacterNames
    : characters
        .filter(
          (char) =>
            usedCharacters.includes(char.name) ||
            char.alias.some((name) => usedCharacters.includes(name))
        )
        .map((char) => char.name);

  const [checkedUE2, setCheckedUE2] = React.useState<Record<string, boolean>>(
    sentCheckedUE2 ? sentCheckedUE2 : {}
  );

  const handleCheckboxChange = (name: string) => {
    setCheckedUE2((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const defaultWidthMult = sentWidthMult ? sentWidthMult : widthMultMin;
  const defaultTimeZoneNum = sentTimeZoneNum ? sentTimeZoneNum : timeZoneNumMin;

  const [widthMult, setWidthMult] = useState<number>(defaultWidthMult);
  const [widthMultInput, setWidthMultInput] = useState<string>(
    `${defaultWidthMult}`
  );
  const [timeZoneNum, setTimeZoneNum] = useState<number>(defaultTimeZoneNum);
  const [timeZoneNumInput, setTimeZoneNumInput] = useState<string>(
    `${defaultTimeZoneNum}`
  );

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setWidthMultInput("");
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setWidthMultInput(num < widthMultMin ? `${widthMultMin}` : value);
      setWidthMult(num < widthMultMin ? widthMultMin : num);
    }
  };

  const handleTimeZoneNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setTimeZoneNumInput("");
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setTimeZoneNumInput(num < timeZoneNumMin ? `${timeZoneNumMin}` : value);
      setTimeZoneNum(num < timeZoneNumMin ? timeZoneNumMin : num);
    }
  };

  return (
    <div>
      <TimelineGraph
        attackItems={attackItems}
        buffItems={buffItems}
        checkedUE2={checkedUE2}
        widthMult={widthMult}
        timeZoneNum={timeZoneNum}
      ></TimelineGraph>

      <div>
        <MultiplierInput
          labelText="가로/세로 배율"
          step="0.1"
          value={widthMultInput}
          onChange={handleWidthChange}
          min={`${widthMultMin}`}
        />
      </div>
      <div>
        <MultiplierInput
          labelText="중간 구간 개수"
          step="1"
          value={timeZoneNumInput}
          onChange={handleTimeZoneNumChange}
          min={`${timeZoneNumMin}`}
        />
      </div>

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
      {location.pathname === "/parseTimeline" && (
        <GoToButtonWithData
          route="/tacticEditor"
          filteredCharacterNames={filteredCharacters}
          attackItems={attackItems}
          buffItems={buffItems}
          checkedUE2={checkedUE2}
          widthMult={widthMult}
          timeZoneNum={timeZoneNum}
        >
          Go to tactic editor with this data
        </GoToButtonWithData>
      )}
    </div>
  );
}
