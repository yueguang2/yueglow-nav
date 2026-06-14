"use client";

import { useState, useRef, useEffect } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  label: string;
  hint?: string;
};

const COMMON_COLORS = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
  "#ff6b6b", "#4ecdc4", "#45b7d1", "#ffa07a", "#98d8c8", "#f7dc6f", "#bb8fce", "#85929e",
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#95a5a6",
];

export function ColorPicker({ value, onChange, label, hint }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-secondary">{label}</label>

      <div className="relative" ref={pickerRef}>
        <div className="flex gap-2">
          {/* 颜色预览按钮 */}
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="focus-ring size-12 shrink-0 rounded-lg border-2 border-[var(--line)] transition-all duration-200 hover:scale-105"
            style={{ background: value }}
            aria-label={`选择颜色：${label}`}
          />

          {/* HEX 输入框 */}
          <div className="flex-1">
            <HexColorInput
              color={value}
              onChange={onChange}
              prefixed
              className="clay-input w-full text-sm uppercase"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* 弹出式选择器 */}
        {showPicker && (
          <div className="absolute top-full z-50 mt-2 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-4 shadow-[var(--shadow-lg)] animate-in fade-in slide-in-from-top-2 duration-200">
            {/* 颜色选择器 */}
            <HexColorPicker color={value} onChange={onChange} />

            {/* 常用色板 */}
            <div className="mt-3 border-t border-[var(--line)] pt-3">
              <p className="mb-2 text-xs font-medium text-secondary">常用颜色</p>
              <div className="grid grid-cols-8 gap-1.5">
                {COMMON_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onChange(color)}
                    className="focus-ring size-7 rounded border border-[var(--line)] transition-all duration-200 hover:scale-110"
                    style={{ background: color }}
                    aria-label={`选择颜色 ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
    </div>
  );
}
