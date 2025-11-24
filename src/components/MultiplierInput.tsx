import React from "react";

interface MultiplierInputProps {
  labelText: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MultiplierInput = ({ labelText, value, onChange }: MultiplierInputProps) => (
  <label>
    {labelText}:
    <input
      type="number"
      step="0.1"
      value={value}
      onChange={onChange}
      min="1"
    />
  </label>
);
