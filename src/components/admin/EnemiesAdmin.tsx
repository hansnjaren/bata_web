"use client";

import React, { useState, useEffect, useCallback } from "react";

/* ──────────────────── Types ──────────────────── */
interface Enemy {
  id: number;
  name: string;
}

/* ──────────────────── Component ──────────────────── */
export default function EnemiesAdmin() {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [editName, setEditName] = useState("");

  /* ──── Fetch ──── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enemies");
      const data: Enemy[] = await res.json();
      setEnemies(data);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ──── Select ──── */
  const selectEnemy = useCallback(
    (id: number) => {
      setSelectedId(id);
      const en = enemies.find((e) => e.id === id);
      if (en) setEditName(en.name);
      setStatusMsg(null);
    },
    [enemies],
  );

  const selectedEnemy = enemies.find((e) => e.id === selectedId);

  /* ──── Save ──── */
  const saveEnemy = async () => {
    if (!selectedId || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/enemies/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatusMsg("✅ 저장 완료");
      await fetchData();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setStatusMsg("❌ 저장 실패: " + e.message);
      }
      else {
        setStatusMsg("❌ 저장 실패: 알 수 없는 에러");
      }
    } finally {
      setSaving(false);
    }
  };

  /* ──── Add ──── */
  const addEnemy = async () => {
    const name = prompt("새 적 이름:");
    if (!name?.trim()) return;
    try {
      const res = await fetch("/api/enemies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Add failed");
      const newEnemy: Enemy = await res.json();
      await fetchData();
      selectEnemy(newEnemy.id);
      setStatusMsg("✅ 적 추가 완료");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setStatusMsg("❌ 적 추가 실패: " + e.message);
      }
      else {
        setStatusMsg("❌ 적 추가 실패: 알 수 없는 에러");
      }
    }
  };

  /* ──── Delete ──── */
  const deleteEnemy = async () => {
    if (!selectedId) return;
    if (!confirm(`"${selectedEnemy?.name}" 적을 삭제합니다. 계속하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/enemies/${selectedId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSelectedId(null);
      setStatusMsg("✅ 적 삭제 완료");
      await fetchData();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setStatusMsg("❌ 적 삭제 실패: " + e.message);
      }
      else {
        setStatusMsg("❌ 적 삭제 실패: 알 수 없는 에러");
      }
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
      {/* ── Left: Enemy list ── */}
      <div className="w-56 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold">적 목록</h3>
          <button 
            onClick={addEnemy}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-medium rounded-md border border-green-700 shadow-sm transition-colors"
          >
            + 추가
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          {enemies.map((en) => (
            <div
              key={en.id}
              onClick={() => selectEnemy(en.id)}
              className={`flex items-center px-4 h-12 cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-colors ${
                selectedId === en.id
                  ? "bg-blue-50 dark:bg-blue-900/40 border-l-4 border-l-blue-500 font-bold"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium"
              }`}
            >
              {en.name}
            </div>
          ))}
          {enemies.length === 0 && (
            <div className="px-4 py-6 text-center opacity-40">적이 없습니다</div>
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

        {!selectedEnemy ? (
          <div className="flex items-center justify-center h-full opacity-40 text-lg">
            좌측에서 적을 선택하세요
          </div>
        ) : (
          <div className="max-w-md space-y-6">
            <section>
              <label className="block text-sm font-semibold mb-1 opacity-70">이름</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 bg-background text-foreground"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </section>

            <div className="flex gap-3">
              <button
                onClick={saveEnemy}
                disabled={saving || !editName.trim()}
              >
                {saving ? "저장 중…" : "저장"}
              </button>
              <button onClick={deleteEnemy}>
                삭제
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
