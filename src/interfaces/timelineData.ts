interface Skill {
  type: string;
  alias: string[];
  role: string[];
  delays: number[];
  duration: number;
}

interface AttackSkill {
  startTime: number;
  character: string;
  detail: string | null;
  allDelays: number[];
}

interface BuffSkill {
  startTime: number;
  delay: number;
  duration: number;
  character: string;
  detail: string | null;
  UE2: boolean;
}

interface Character {
  name: string;
  alias: string[];
  skills: Skill[];
  UE2: boolean;
}

type Enemy = string[];

interface ParseResult {
  time: string;
  character: string;
  type: string | null;
  target: string | null;
}

interface TimelineProps {
  parsedData?: ParseResult[] | null;
  sentFilteredCharacterNames?: string[];
  sentAttackItems?: AttackSkill[];
  sentBuffItems?: BuffSkill[];
  sentCheckedUE2?: Record<string, boolean>;
  sentWidthMult?: number;
  sentTimeZoneNum?: number;
}
