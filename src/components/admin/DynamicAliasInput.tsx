"use client";

import React from "react";

interface DynamicAliasInputProps {
  aliases: string[];
  onChange: (aliases: string[]) => void;
}

export default function DynamicAliasInput({ aliases, onChange }: DynamicAliasInputProps) {
  // Always show existing aliases + one empty input at the end
  const inputs = [...aliases, ""];

  const handleChange = (index: number, value: string) => {
    const newAliases = [...aliases];

    if (index < aliases.length) {
      newAliases[index] = value;
    } else if (value.trim() !== "") {
      newAliases.push(value);
    }

    // Remove empty entries (they disappear), keeping order
    const filtered = newAliases.filter((a) => a.trim() !== "");
    onChange(filtered);
  };

  return (
    <div className="flex flex-col gap-2">
      {inputs.map((alias, index) => (
        <input
          key={index}
          type="text"
          className="border rounded-md px-3 py-1 bg-background text-foreground"
          placeholder="별명 입력"
          value={alias}
          onChange={(e) => handleChange(index, e.target.value)}
        />
      ))}
    </div>
  );
}
