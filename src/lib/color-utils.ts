/**
 * 颜色工具库
 * 提供对比度检查、色彩转换等功能
 */

/**
 * 将 HEX 颜色转换为 RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * 将 RGB 转换为 HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * 计算相对亮度（Relative Luminance）
 * 根据 WCAG 2.0 标准
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  // 归一化到 0-1
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  // 应用 sRGB 伽马校正
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // 计算相对亮度
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 计算对比度比值
 * 根据 WCAG 2.0 标准
 */
export function getContrastRatio(foreground: string, background: string): number {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG 标准等级
 */
export type WCAGLevel = "AAA" | "AA" | "AA-Large" | "Fail";

/**
 * 检查对比度是否符合 WCAG 标准
 */
export function checkWCAGCompliance(
  contrastRatio: number,
  level: "AA" | "AAA" = "AA"
): {
  normal: boolean; // 普通文本
  large: boolean; // 大文本（18pt+ 或 14pt+ 粗体）
  level: WCAGLevel;
} {
  const normal = level === "AA" ? contrastRatio >= 4.5 : contrastRatio >= 7;
  const large = level === "AA" ? contrastRatio >= 3 : contrastRatio >= 4.5;

  let wcagLevel: WCAGLevel;
  if (contrastRatio >= 7) {
    wcagLevel = "AAA";
  } else if (contrastRatio >= 4.5) {
    wcagLevel = "AA";
  } else if (contrastRatio >= 3) {
    wcagLevel = "AA-Large";
  } else {
    wcagLevel = "Fail";
  }

  return {
    normal,
    large,
    level: wcagLevel,
  };
}

/**
 * 获取建议的前景色（黑色或白色）
 */
export function getSuggestedForeground(background: string): string {
  const luminance = getRelativeLuminance(background);
  // 亮度大于 0.5 用黑色，否则用白色
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

/**
 * 将 HEX 转换为 HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * 将 HSL 转换为 HEX
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

/**
 * 生成和谐配色
 * @param baseHex 基础色
 * @param type 配色类型
 */
export function generateHarmoniousColors(
  baseHex: string,
  type: "complementary" | "analogous" | "triadic" | "split-complementary"
): string[] {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return [baseHex];

  const colors: string[] = [baseHex];

  switch (type) {
    case "complementary":
      // 互补色（色相相差 180°）
      colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
      break;

    case "analogous":
      // 邻近色（色相相差 ±30°）
      colors.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
      colors.push(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l));
      break;

    case "triadic":
      // 三角色（色相相差 120°）
      colors.push(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
      colors.push(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
      break;

    case "split-complementary":
      // 分裂互补色（互补色的两侧 ±30°）
      const complementary = (hsl.h + 180) % 360;
      colors.push(hslToHex((complementary + 30) % 360, hsl.s, hsl.l));
      colors.push(hslToHex((complementary - 30 + 360) % 360, hsl.s, hsl.l));
      break;
  }

  return colors;
}

/**
 * 调整颜色亮度
 */
export function adjustLightness(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;

  const newL = Math.max(0, Math.min(100, hsl.l + amount));
  return hslToHex(hsl.h, hsl.s, newL);
}

/**
 * 调整颜色饱和度
 */
export function adjustSaturation(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;

  const newS = Math.max(0, Math.min(100, hsl.s + amount));
  return hslToHex(hsl.h, newS, hsl.l);
}
