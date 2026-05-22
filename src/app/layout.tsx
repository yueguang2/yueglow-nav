import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yueglow Nav",
  description: "A refined personal navigation dashboard by Yueguang.",
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
