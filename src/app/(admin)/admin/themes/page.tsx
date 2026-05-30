import { Badge } from "@/components/ui";
import { listThemes } from "@/lib/db";
import { ThemeCard } from "@/components/theme-card";

type ThemesPageProps = {
  searchParams: Promise<{ activated?: string }>;
};

export default async function ThemesPage({ searchParams }: ThemesPageProps) {
  const params = await searchParams;
  const themes = listThemes();
  const activatedTheme = params.activated ? themes.find(t => t.id === Number(params.activated)) : null;

  return (
    <div className="grid gap-5">
      <header className="glass rounded-[2rem] p-6">
        <Badge>Themes</Badge>
        <h1 className="mt-5 text-4xl font-black tracking-[-0.06em]">主题设置</h1>
        <p className="mt-2 text-sm leading-6 text-tertiary">
          选择预制主题配色方案，支持深色和浅色模式。激活主题后将立即应用到前台页面。
        </p>
        {activatedTheme && (
          <div className="chip-success mt-4 rounded-2xl px-4 py-3 text-sm">
            主题「{activatedTheme.name}」已激活，请刷新前台页面查看效果
          </div>
        )}
      </header>

      <section className="glass rounded-[2rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black tracking-tight">可用主题</h2>
          <span className="text-sm text-faint">{themes.length} 个主题</span>
        </div>
        <div className="mt-5 grid gap-3">
          {themes.length === 0 ? (
            <p className="py-8 text-center text-sm text-faint">暂无主题</p>
          ) : (
            themes.map((theme) => <ThemeCard key={theme.id} theme={theme} />)
          )}
        </div>
      </section>
    </div>
  );
}
