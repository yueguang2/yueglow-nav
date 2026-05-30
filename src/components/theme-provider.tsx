"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 监听主题切换事件（从后台激活主题后触发）
    const handleThemeChange = () => {
      // 刷新页面以应用新主题
      window.location.reload();
    };

    // 监听 storage 事件（跨标签页同步）
    window.addEventListener("theme-changed", handleThemeChange);

    return () => {
      window.removeEventListener("theme-changed", handleThemeChange);
    };
  }, []);

  return <>{children}</>;
}
