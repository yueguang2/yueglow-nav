import { redirect } from "next/navigation";
import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/action-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Field, TextInput } from "@/components/ui";
import { getCurrentAdmin } from "@/lib/auth";
import { getAdminCount } from "@/lib/db";
import { loginAction, setupAdminAction } from "@/lib/actions";

export default async function LoginPage() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  const needsSetup = getAdminCount() === 0;
  const action = needsSetup ? setupAdminAction : loginAction;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="glass relative w-full max-w-md overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-6 size-44 rounded-full bg-lime-200/12 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="text-xs font-semibold uppercase tracking-[0.36em] text-faint">
              Yueglow Nav
            </Link>
            <ThemeSwitcher />
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-[-0.06em]">{needsSetup ? "初始化后台" : "后台登录"}</h1>
          <p className="mt-3 text-sm leading-6 text-tertiary">
            {needsSetup ? "首次使用需要创建管理员账号。账号创建后会自动进入管理后台。" : "使用初始化时创建的管理员账号登录。"}
          </p>

          <ActionForm action={action} className="mt-8 grid gap-4">
            <Field label="用户名">
              <TextInput name="username" autoComplete="username" placeholder="admin" required />
            </Field>
            <Field label="密码" hint={needsSetup ? "至少 8 个字符" : undefined}>
              <TextInput name="password" type="password" autoComplete={needsSetup ? "new-password" : "current-password"} placeholder="••••••••" required />
            </Field>
            <SubmitButton pendingText={needsSetup ? "正在初始化..." : "正在登录..."}>{needsSetup ? "创建账号并进入" : "登录后台"}</SubmitButton>
          </ActionForm>
        </div>
      </div>
    </main>
  );
}
