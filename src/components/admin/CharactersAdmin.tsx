"use client";

import React, { useState, useEffect, useCallback } from "react";
import DynamicAliasInput from "./DynamicAliasInput";
import SkillEditor from "./SkillEditor";

/* ──────────────────── Types ──────────────────── */
interface Character {
  id: number;
  name: string;
  alias: string[];
  ue2: boolean;
}

interface Skill {
  id: number;
  characterId: number;
  type: string;
  alias: string[];
  role: string[];
  delays: number[];
  duration: number;
}

/* ──────────────────── Component ──────────────────── */
export default function CharactersAdmin() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Editable state for the selected character
  const [editName, setEditName] = useState("");
  const [editAlias, setEditAlias] = useState<string[]>([]);
  const [editUe2, setEditUe2] = useState(false);

  /* ──── Fetch ──── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [charRes, skillRes] = await Promise.all([
        fetch("/api/characters"),
        fetch("/api/skills"),
      ]);
      const charData: Character[] = await charRes.json();
      const skillData: Skill[] = await skillRes.json();
      setCharacters(charData);
      setSkills(skillData);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ──── Select a character ──── */
  const selectCharacter = useCallback(
    (id: number) => {
      setSelectedId(id);
      const ch = characters.find((c) => c.id === id);
      if (ch) {
        setEditName(ch.name);
        setEditAlias([...ch.alias]);
        setEditUe2(ch.ue2);
      }
      setStatusMsg(null);
    },
    [characters],
  );

  const selectedCharacter = characters.find((c) => c.id === selectedId);
  const characterSkills = skills.filter((s) => s.characterId === selectedId);

  /* ──── Save character ──── */
  const saveCharacter = async () => {
    if (!selectedId || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/characters/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          alias: editAlias,
          ue2: editUe2,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatusMsg("✅ 캐릭터 저장 완료");
      await fetchData();
    } catch (e: any) {
      setStatusMsg("❌ 저장 실패: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ──── Add character ──── */
  const addCharacter = async () => {
    const name = prompt("새 캐릭터 이름:");
    if (!name?.trim()) return;
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), alias: [], ue2: false }),
      });
      if (!res.ok) throw new Error("Add failed");
      const newChar: Character = await res.json();
      await fetchData();
      selectCharacter(newChar.id);
      setStatusMsg("✅ 캐릭터 추가 완료");
    } catch (e: any) {
      setStatusMsg("❌ 추가 실패: " + e.message);
    }
  };

  /* ──── Delete character ──── */
  const deleteCharacter = async () => {
    if (!selectedId) return;
    if (
      !confirm(
        `"${selectedCharacter?.name}" 캐릭터와 관련 스킬을 삭제합니다. 계속하시겠습니까?`,
      )
    )
      return;
    try {
      const res = await fetch(`/api/characters/${selectedId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setSelectedId(null);
      setStatusMsg("✅ 캐릭터 삭제 완료");
      await fetchData();
    } catch (e: any) {
      setStatusMsg("❌ 삭제 실패: " + e.message);
    }
  };

  /* ──── Add skill ──── */
  const addSkill = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: selectedId,
          type: "EX",
          alias: [],
          role: [],
          delays: [],
          duration: 0,
        }),
      });
      if (!res.ok) throw new Error("Add skill failed");
      setStatusMsg("✅ 스킬 추가 완료");
      await fetchData();
    } catch (e: any) {
      setStatusMsg("❌ 스킬 추가 실패: " + e.message);
    }
  };

  /* ──── Delete skill ──── */
  const deleteSkill = async (skillId: number) => {
    if (!confirm("이 스킬을 삭제합니다. 계속하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/skills/${skillId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete skill failed");
      setStatusMsg("✅ 스킬 삭제 완료");
      await fetchData();
    } catch (e: any) {
      setStatusMsg("❌ 스킬 삭제 실패: " + e.message);
    }
  };

  /* ──── Save skill ──── */
  const saveSkill = async (skillId: number, data: Partial<Skill>) => {
    try {
      const res = await fetch(`/api/skills/${skillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save skill failed");
      setStatusMsg("✅ 스킬 저장 완료");
      await fetchData();
    } catch (e: any) {
      setStatusMsg("❌ 스킬 저장 실패: " + e.message);
    }
  };

  /* ──────────────────── Render ──────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <span className="text-lg opacity-60">로딩 중…</span>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* ── Left: Character list ── */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold">캐릭터 목록</h3>
          <button
            onClick={addCharacter}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-medium rounded-md border border-green-700 shadow-sm transition-colors"
          >
            + 추가
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          {characters.map((ch) => (
            <div
              key={ch.id}
              onClick={() => selectCharacter(ch.id)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-colors ${
                selectedId === ch.id
                  ? "bg-blue-50 dark:bg-blue-900/40 border-l-4 border-l-blue-500"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <span className="font-medium">{ch.name}</span>
            </div>
          ))}
          {characters.length === 0 && (
            <div className="px-4 py-6 text-center opacity-40">
              캐릭터가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Detail / Editor ── */}
      <div className="flex-1 p-6 overflow-y-auto">
        {statusMsg && (
          <div className="mb-4 px-4 py-2 rounded-md text-sm bg-gray-100 dark:bg-gray-800">
            {statusMsg}
          </div>
        )}

        {!selectedCharacter ? (
          <div className="flex items-center justify-center h-full opacity-40 text-lg">
            좌측에서 캐릭터를 선택하세요
          </div>
        ) : (
          <div className="max-w-3xl space-y-8">
            {/* ── Top: Save / Delete character buttons (right-aligned) ── */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={saveCharacter}
                disabled={saving || !editName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium rounded-md border border-blue-700 shadow-sm transition-colors disabled:opacity-40"
              >
                {saving ? "저장 중…" : "캐릭터 저장"}
              </button>
              <button
                onClick={deleteCharacter}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-medium rounded-md border border-red-700 shadow-sm transition-colors"
              >
                캐릭터 삭제
              </button>
            </div>

            {/* ── Name ── */}
            <section>
              <label className="block text-sm font-semibold mb-1 opacity-70">
                이름
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </section>

            {/* ── Alias ── */}
            <section>
              <label className="block text-sm font-semibold mb-1 opacity-70">
                별명 (alias)
              </label>
              <DynamicAliasInput aliases={editAlias} onChange={setEditAlias} />
            </section>

            {/* ── UE2 ── */}
            <section>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-blue-500"
                  checked={editUe2}
                  onChange={(e) => setEditUe2(e.target.checked)}
                />
                <span className="text-sm font-semibold opacity-70">
                  전무 2성 지속 시간 (UE2)
                </span>
              </label>
            </section>

            {/* ── Skills ── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">스킬 목록</h3>
                <button
                  onClick={addSkill}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-medium rounded-md border border-green-700 shadow-sm transition-colors"
                >
                  + 스킬 추가
                </button>
              </div>

              {characterSkills.length === 0 ? (
                <p className="opacity-40">
                  스킬이 없습니다. 위 버튼으로 추가하세요.
                </p>
              ) : (
                <div className="space-y-6">
                  {characterSkills.map((skill) => (
                    <SkillEditor
                      key={skill.id}
                      skill={skill}
                      onSave={(data) => saveSkill(skill.id, data)}
                      onDelete={() => deleteSkill(skill.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── Bottom: Save / Delete character buttons (right-aligned) ── */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={saveCharacter}
                disabled={saving || !editName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium rounded-md border border-blue-700 shadow-sm transition-colors disabled:opacity-40"
              >
                {saving ? "저장 중…" : "캐릭터 저장"}
              </button>
              <button
                onClick={deleteCharacter}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-medium rounded-md border border-red-700 shadow-sm transition-colors"
              >
                캐릭터 삭제
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
