export interface Skill {
  type: string;
  alias: string[];
  role: string[];
  delays: number[];
  duration: number;
}

export interface SkillItem {
  character: string;
  type: string | null;
  detail: string | null;
}

export interface AttackSkill {
  startTime: number;
  character: string;
  type: string | null;
  detail: string | null;
  allDelays: number[];
}

export interface BuffSkill {
  startTime: number;
  delay: number;
  duration: number;
  character: string;
  type: string | null;
  detail: string | null;
  UE2: boolean;
}

export type ItemType = "attack" | "buff";

export interface Character {
  name: string;
  alias: string[];
  skills: Skill[];
  UE2: boolean;
}

export type Enemy = string[];

export interface ParseResult {
  time: string;
  character: string;
  type: string | null;
  target: string | null;
}

export interface TimelineProps {
  parsedData?: ParseResult[] | null;
  sentFilteredCharacterNames?: string[];
  sentAttackItems?: AttackSkill[];
  sentBuffItems?: BuffSkill[];
  sentCheckedUE2?: Record<string, boolean>;
  sentWidthMult?: number;
  sentTimeZoneNum?: number;
}
