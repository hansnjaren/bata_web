'use client';

import { useState } from 'react';
import Timeline from '@/components/Timeline';
import { timeZoneNumMin, widthMultMin } from '@/constants/sizes';
import { AttackSkill, BuffSkill } from '@/interfaces/timelineData';

type TacticEditorState = {
  filteredCharacterNames: string[];
  attackItems: AttackSkill[];
  buffItems: BuffSkill[];
  checkedUE2: Record<string, boolean>;
  widthMult: number;
  timeZoneNum: number;
};

const defaultState: TacticEditorState = {
  filteredCharacterNames: [],
  attackItems: [],
  buffItems: [],
  checkedUE2: {},
  widthMult: widthMultMin,
  timeZoneNum: timeZoneNumMin,
};

function getInitialState(): TacticEditorState {
  if (typeof window === 'undefined') return defaultState;

  const raw = sessionStorage.getItem('tacticEditorState');
  if (!raw) return defaultState;

  try {
    const parsed = JSON.parse(raw) as Partial<TacticEditorState>;
    return {
      filteredCharacterNames: parsed.filteredCharacterNames ?? [],
      attackItems: parsed.attackItems ?? [],
      buffItems: parsed.buffItems ?? [],
      checkedUE2: parsed.checkedUE2 ?? {},
      widthMult: parsed.widthMult ?? widthMultMin,
      timeZoneNum: parsed.timeZoneNum ?? timeZoneNumMin,
    };
  } catch {
    return defaultState;
  }
}

export default function TacticEditor() {
  const [state] = useState<TacticEditorState>(getInitialState);

  return (
    <div className="App">
      <header className="App-header"></header>
      <Timeline
        sentFilteredCharacterNames={state.filteredCharacterNames}
        sentAttackItems={state.attackItems}
        sentBuffItems={state.buffItems}
        sentCheckedUE2={state.checkedUE2}
        sentWidthMult={state.widthMult}
        sentTimeZoneNum={state.timeZoneNum}
      />
    </div>
  );
}
