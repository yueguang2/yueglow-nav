import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yueglow Nav - 个人导航工作台",
  description: "自托管的个人导航仪表板，将常用入口、开发文档、AI 工具和设计灵感收束到一个高级感工作台。支持分类管理、智能链接路由和双主题切换。",
  keywords: ["导航", "书签", "自托管", "个人工作台", "导航仪表板", "bookmark", "navigation", "self-hosted", "dashboard"],
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
    title: "Yueglow Nav - 个人导航工作台",
    description: "自托管的个人导航仪表板，将常用入口、开发文档、AI 工具和设计灵感收束到一个高级感工作台。",
    siteName: "Yueglow Nav",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yueglow Nav - 个人导航工作台",
    description: "自托管的个人导航仪表板，支持分类管理、智能链接路由和双主题切换。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (() => {
      const stored = localStorage.getItem("nav-theme");
      const preference = stored === "light" || stored === "dark"
        ? stored
        : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      localStorage.setItem("nav-theme", preference);
      const resolved = preference;
      document.documentElement.dataset.themePreference = preference;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    })();
  `;

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
