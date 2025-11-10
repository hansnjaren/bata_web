export type Enemy = string[];

export interface Supporter {
  name: string;
  delay: number;
  duration: number;
  UE2: boolean;
}
export type SupporterList = Supporter[];

export interface Attacker {
  name: string;
  delays: number[];
}
export type AttackerList = Attacker[];

export async function fetchEnemies(): Promise<Enemy> {
  const res = await fetch('/data/enemy.json');
  if (!res.ok) throw new Error('Failed to fetch enemies');
  console.log(res)
  return res.json();
}

export async function fetchSupporters(): Promise<SupporterList> {
  const res = await fetch('/data/supporter.json');
  if (!res.ok) throw new Error('Failed to fetch supporters');
  return res.json();
}

export async function fetchAttackers(): Promise<AttackerList> {
  const res = await fetch('/data/attacker.json');
  if (!res.ok) throw new Error('Failed to fetch attackers');
  return res.json();
}
