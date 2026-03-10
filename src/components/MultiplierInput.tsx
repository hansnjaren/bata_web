import React from "react";

interface MultiplierInputProps {
  labelText: string;
  step: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: string;
}

export const MultiplierInput = ({
  labelText,
  step,
  value,
  onChange,
  min,
}: MultiplierInputProps) => (
  <label>
    {labelText}:
    <input
      type="number"
      step={step}
      value={value}
      onChange={onChange}
      min={min}
    />
  </label>
);
