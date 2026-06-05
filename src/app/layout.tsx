import type { Metadata } from "next";
import { getActiveTheme } from "@/lib/db";
import { generateThemeCSS } from "@/lib/theme-utils";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yueglow Nav - 个人导航",
  description: "自托管个人导航，集中管理常用入口、分类站点和智能链接跳转。",
  keywords: ["导航", "书签", "自托管", "个人导航", "bookmark", "navigation", "self-hosted"],
  authors: [{ name: "Yueguang" }],
  creator: "Yueguang",
  publisher: "Yueguang",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://nav.yueglow.com",
    title: "Yueglow Nav - 个人导航",
    description: "自托管个人导航，集中管理常用入口、分类站点和智能链接跳转。",
    siteName: "Yueglow Nav",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yueglow Nav - 个人导航",
    description: "自托管个人导航，支持分类管理、智能链接路由和双主题切换。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeTheme = getActiveTheme();
  const uiStyle = activeTheme?.uiStyle ?? "wechat";

  const themeScript = `
    (() => {
      const storageKey = "nav-theme";
      const validTheme = (value) => value === "light" || value === "dark";
      const systemTheme = () => {
        try {
          return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } catch {
          return "dark";
        }
      };
      const readStoredTheme = () => {
        try {
          return localStorage.getItem(storageKey);
        } catch {
          return null;
        }
      };
      const writeStoredTheme = (value) => {
        try {
          localStorage.setItem(storageKey, value);
        } catch {}
      };
      const applyTheme = (value) => {
        document.documentElement.dataset.themePreference = value;
        document.documentElement.dataset.theme = value;
        document.documentElement.style.colorScheme = value;
      };
      const syncSwitchers = (value) => {
        document.documentElement.dataset.themeCurrent = value;
        document.querySelectorAll("[data-theme-switcher]").forEach((switcher) => {
          switcher.querySelectorAll("[data-theme-value]").forEach((button) => {
            const active = button.getAttribute("data-theme-value") === value;
            button.setAttribute("aria-pressed", active ? "true" : "false");
            button.setAttribute("data-active", active ? "true" : "false");
          });
        });
      };
      const setTheme = (value) => {
        if (!validTheme(value)) {
          return;
        }

        writeStoredTheme(value);
        applyTheme(value);
        syncSwitchers(value);
      };
      const stored = readStoredTheme();
      const preference = validTheme(stored) ? stored : systemTheme();

      setTheme(preference);

      document.addEventListener("click", (event) => {
        const target = event.target instanceof Element
          ? event.target.closest("[data-theme-switcher] [data-theme-value]")
          : null;

        if (!target) {
          return;
        }

        const nextTheme = target.getAttribute("data-theme-value");

        if (!validTheme(nextTheme)) {
          return;
        }

        setTheme(nextTheme);
      });

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => syncSwitchers(preference), { once: true });
      } else {
        syncSwitchers(preference);
      }
    })();
  `;

  return (
    <html lang="zh-CN" data-ui-style={uiStyle} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {activeTheme && (
          <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(activeTheme) }} />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
