"use client";

import React, { useState } from "react";
import DynamicAliasInput from "./DynamicAliasInput";

/* ──────────────────── Types ──────────────────── */
interface Skill {
  id: number;
  characterId: number;
  type: string;
  alias: string[];
  role: string[];
  delays: number[];
  duration: number;
}

interface SkillEditorProps {
  skill: Skill;
  onSave: (data: Partial<Skill>) => void;
  onDelete: () => void;
}

/* ──────────────────── Component ──────────────────── */
export default function SkillEditor({ skill, onSave, onDelete }: SkillEditorProps) {
  const [type, setType] = useState(skill.type);
  const [alias, setAlias] = useState<string[]>([...skill.alias]);
  const [isAttack, setIsAttack] = useState(skill.role.includes("attack"));
  const [isSupport, setIsSupport] = useState(skill.role.includes("support"));
  const [hitCount, setHitCount] = useState(skill.delays.length || 1);
  const [delays, setDelays] = useState<string[]>(
    skill.delays.length > 0 ? skill.delays.map(String) : [""],
  );
  const [duration, setDuration] = useState(skill.duration ? String(skill.duration) : "");

  /* ──── Sync hitCount → delays length ──── */
  // useEffect(() => {
  //   const count = Math.max(1, hitCount);
  //   setDelays((prev) => {
  //     const newArr = [...prev];
  //     while (newArr.length < count) newArr.push("");
  //     return newArr.slice(0, count);
  //   });
  // }, [hitCount]);

  const handleHitCountChange = (newCount: number) => {
    setHitCount(newCount);
    
    const count = Math.max(1, newCount);
    setDelays((prev) => {
      const newArr = [...prev];
      while (newArr.length < count) newArr.push("");
      return newArr.slice(0, count);
    });
  };

  /* ──── Build role array from toggles ──── */
  const buildRole = (): string[] => {
    const r: string[] = [];
    if (isAttack) r.push("attack");
    if (isSupport) r.push("support");
    return r;
  };

  /* ──── Validation ──── */
  const isValid = (): boolean => {
    if (!type.trim()) return false;
    if (isAttack) {
      for (const d of delays) {
        if (d.trim() === "" || isNaN(Number(d))) return false;
      }
    }
    if (isSupport) {
      if (duration.trim() === "" || isNaN(Number(duration))) return false;
    }
    return true;
  };

  /* ──── Handle save ──── */
  const handleSave = () => {
    if (!isValid()) return;
    const role = buildRole();
    onSave({
      type: type.trim(),
      alias,
      role,
      delays: isAttack ? delays.map(Number) : [],
      duration: isSupport ? Number(duration) : 0,
    });
  };

  return (
    <div className="border rounded-lg p-5 space-y-4 bg-gray-50 dark:bg-gray-800/50">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          className="w-1/2 border rounded-md px-3 py-2 bg-background text-foreground"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="EX, 1스, 2스 …"
        />
        <button
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-medium rounded-md border border-red-700 shadow-sm transition-colors"
        >
          스킬 삭제
        </button>
      </div>

      {/* ── Alias ── */}
      <div>
        <label className="block text-sm font-semibold mb-1 opacity-70">별명</label>
        <DynamicAliasInput aliases={alias} onChange={setAlias} />
      </div>

      {/* ── Role toggles ── */}
      <div>
        <label className="block text-sm font-semibold mb-2 opacity-70">역할</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-red-500"
              checked={isAttack}
              onChange={(e) => setIsAttack(e.target.checked)}
            />
            <span className="text-sm">공격</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-500"
              checked={isSupport}
              onChange={(e) => setIsSupport(e.target.checked)}
            />
            <span className="text-sm">버프/디버프</span>
          </label>
        </div>
      </div>

      {/* ── Attack: delays ── */}
      {isAttack && (
        <div className="pl-4 border-l-4 border-red-400 space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1 opacity-70">타수</label>
            <input
              type="number"
              className="w-24 border rounded-md px-3 py-1 bg-background text-foreground"
              min={1}
              value={hitCount}
              onChange={(e) => handleHitCountChange(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 opacity-70">Delays</label>
            <div className="flex flex-wrap gap-2">
              {delays.map((d, i) => (
                <input
                  key={i}
                  type="number"
                  step="1/30"
                  className={`w-20 border rounded-md px-3 py-1 bg-background text-foreground ${
                    d.trim() === "" || isNaN(Number(d))
                      ? "border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder={`Hit ${i + 1}`}
                  value={d}
                  onChange={(e) => {
                    const newDelays = [...delays];
                    newDelays[i] = e.target.value;
                    setDelays(newDelays);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Support: duration ── */}
      {isSupport && (
        <div className="pl-4 border-l-4 border-blue-400 space-y-2">
          <label className="block text-sm font-semibold mb-1 opacity-70">지속시간</label>
          <input
            type="number"
            step="any"
            className={`w-36 border rounded-md px-3 py-1 bg-background text-foreground ${
              duration.trim() === "" || isNaN(Number(duration))
                ? "border-red-400"
                : "border-gray-300 dark:border-gray-600"
            }`}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="초 단위"
          />
        </div>
      )}

      {/* ── Save ── */}
      <button
        onClick={handleSave}
        disabled={!isValid()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium rounded-md border border-blue-700 shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        스킬 저장
      </button>
      {!isValid() && (isAttack || isSupport) && (
        <span className="ml-3 text-xs text-red-400">모든 입력 칸을 채워주세요</span>
      )}
    </div>
  );
}
