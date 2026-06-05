import { redirect } from "next/navigation";
import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/action-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Field, TextInput } from "@/components/ui";
import { getCurrentAdmin } from "@/lib/auth";
import { getActiveUiStyle, getAdminCount } from "@/lib/db";
import { isLazycatPasswordlessLoginEnabled } from "@/lib/lazycat";
import { isOidcEnabled } from "@/lib/oidc";
import { loginAction, setupAdminAction } from "@/lib/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  const params = await searchParams;
  const needsSetup = getAdminCount() === 0;
  const action = needsSetup ? setupAdminAction : loginAction;
  const oidcEnabled = isOidcEnabled();
  const passwordlessEnabled = isLazycatPasswordlessLoginEnabled();
  const errorMessage = getOidcErrorMessage(params?.error);
  const formAutoComplete = passwordlessEnabled ? undefined : "off";
  const usernameAutoComplete = passwordlessEnabled ? "username" : "off";
  const passwordAutoComplete = passwordlessEnabled ? (needsSetup ? "new-password" : "current-password") : "off";
  const uiStyle = getActiveUiStyle();
  const isClassic = uiStyle === "classic";

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className={isClassic ? "glass relative w-full max-w-md overflow-hidden rounded-[2rem] p-6 sm:p-8" : "relative w-full max-w-md overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-5 shadow-[var(--shadow-sm)] sm:p-6"}>
        {isClassic ? (
          <>
            <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-6 size-44 rounded-full bg-lime-200/12 blur-3xl" />
          </>
        ) : null}
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className={isClassic ? "text-xs font-semibold uppercase text-faint" : "text-sm font-semibold text-secondary"}>
              {isClassic ? "Yueglow Nav" : "个人导航"}
            </Link>
            <ThemeSwitcher />
          </div>
          <h1 className={isClassic ? "mt-6 text-4xl font-black tracking-tight" : "mt-6 text-2xl font-semibold tracking-tight"}>{needsSetup && !oidcEnabled ? "初始化后台" : "后台登录"}</h1>
          <p className="mt-3 text-sm leading-6 text-tertiary">
            {oidcEnabled
              ? needsSetup
                ? "首次可以用懒猫账号进入后台；如果不走 OIDC，请先在这里创建一组本地用户名和密码。"
                : "使用懒猫账号进入管理后台，或使用已设置的本地用户名密码登录。"
              : needsSetup
                ? "首次使用需要创建管理员账号。账号创建后会自动进入管理后台。"
                : "使用初始化时创建的管理员账号登录。"}
          </p>

          {errorMessage ? (
            <p className={isClassic ? "mt-5 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100" : "chip-danger mt-5 rounded-xl px-4 py-3 text-sm font-semibold"}>
              {errorMessage}
            </p>
          ) : null}

          {oidcEnabled ? (
            <a
              href="/auth/oidc/login"
              className="clay-button focus-ring mt-8 flex w-full items-center justify-center px-5 py-3 text-sm font-semibold"
            >
              使用懒猫账号登录
            </a>
          ) : null}

          <ActionForm action={action} autoComplete={formAutoComplete} className="mt-8 grid gap-4">
            <Field label="用户名">
              <TextInput name="username" autoComplete={usernameAutoComplete} placeholder="admin" required />
            </Field>
            <Field label="密码" hint={needsSetup ? "至少 8 个字符" : oidcEnabled ? "已有本地密码时可直接登录" : undefined}>
              <TextInput name="password" type="password" autoComplete={passwordAutoComplete} placeholder={needsSetup ? "创建本地密码" : "请输入本地密码"} required />
            </Field>
            <SubmitButton pendingText={needsSetup ? "正在初始化..." : "正在登录..."}>{needsSetup ? "创建账号并进入" : "登录后台"}</SubmitButton>
          </ActionForm>
        </div>
      </div>
    </main>
  );
}

function getOidcErrorMessage(error?: string) {
  switch (error) {
    case "oidc-forbidden":
      return "当前懒猫账号不在 ADMIN 组，无法进入后台。";
    case "oidc-state":
      return "登录状态已过期，请重新发起登录。";
    case "oidc-unavailable":
      return "OIDC 配置不可用，请确认应用已在懒猫环境中安装。";
    case "oidc-disabled":
      return "懒猫登录当前未启用。";
    case "oidc-failed":
      return "OIDC 登录失败，请稍后重试。";
    default:
      return undefined;
  }
}
