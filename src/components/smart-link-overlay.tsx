"use client";

import { CheckCircle2, Loader2, RotateCcw, X, XCircle } from "lucide-react";
import { createContext, useContext, useState } from "react";
import clsx from "clsx";

type ResolveState = "idle" | "loading" | "success" | "error";

type SmartLinkContextValue = {
  open: (site: { id: number; name: string; fallbackHref: string }) => void;
};

const SmartLinkContext = createContext<SmartLinkContextValue | null>(null);

export function SmartLinkProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ResolveState>("idle");
  const [site, setSite] = useState<{ id: number; name: string; fallbackHref: string } | null>(null);
  const [message, setMessage] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [openBlocked, setOpenBlocked] = useState(false);

  async function resolve(siteInput: { id: number; name: string; fallbackHref: string }) {
    setSite(siteInput);
    setState("loading");
    setMessage("正在并发测速，优选最快可用链接...");
    setTargetUrl("");
    setOpenBlocked(false);

    try {
      const response = await fetch(`/api/sites/${siteInput.id}/resolve`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });
      const data = (await response.json()) as {
        ok?: boolean;
        url?: string;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.message || "无法找到可用链接");
      }

      setState("success");
      setTargetUrl(data.url);
      setMessage(data.message || "已选定最快可用链接，正在打开新标签...");

      window.setTimeout(() => {
        const opened = window.open(data.url as string, "_blank", "noopener,noreferrer");

        if (!opened) {
          setOpenBlocked(true);
          setMessage("浏览器阻止了新标签打开，请手动打开链接。");
          return;
        }

        setMessage("已在新标签打开，当前页面已保留。");

        window.setTimeout(() => {
          setSite(null);
          setState("idle");
          setTargetUrl("");
        }, 900);
      }, 650);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "测速失败，请稍后重试");
    }
  }

  return (
    <SmartLinkContext.Provider value={{ open: resolve }}>
      {children}
      {site ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5 backdrop-blur-md">
          <div className="glass relative w-full max-w-md overflow-hidden rounded-[2rem] p-6 text-[var(--foreground)] shadow-2xl">
            <div className="absolute -right-16 -top-16 size-44 rounded-full bg-[var(--accent)]/18 blur-3xl" />
            <div className="absolute -bottom-20 left-4 size-44 rounded-full bg-[var(--accent-2)]/12 blur-3xl" />
            <button
              type="button"
              onClick={() => {
                setSite(null);
                setState("idle");
              }}
              className="focus-ring absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--control-bg)] text-[var(--text-secondary)] transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
              aria-label="关闭"
            >
              <X className="size-4" />
            </button>

            <div className="relative z-10 grid justify-items-center text-center">
              <div className="relative grid size-24 place-items-center">
                <div
                  className={clsx(
                    "absolute inset-0 rounded-full border-2 border-[var(--line)]",
                    state === "loading" && "animate-spin border-t-[var(--accent)]",
                    state === "success" && "border-[var(--success)]",
                    state === "error" && "border-[var(--danger)]",
                  )}
                />
                {state === "loading" ? <Loader2 className="size-9 animate-spin text-[var(--accent)]" /> : null}
                {state === "success" ? <CheckCircle2 className="size-10 text-[var(--success)]" /> : null}
                {state === "error" ? <XCircle className="size-10 text-[var(--danger)]" /> : null}
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-faint">Smart Redirect</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">{site.name}</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-tertiary">{message}</p>

              {targetUrl ? <p className="mt-4 max-w-full truncate rounded-full border border-[var(--line)] bg-[var(--control-bg)] px-3 py-1.5 text-xs text-secondary">{targetUrl}</p> : null}

              {state === "error" ? (
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => resolve(site)}
                    className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)]"
                  >
                    <RotateCcw className="size-4" />
                    重试
                  </button>
                  <a
                    href={site.fallbackHref}
                    className="focus-ring inline-flex items-center rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
                  >
                    使用兜底跳转
                  </a>
                </div>
              ) : null}

              {state === "success" && openBlocked && targetUrl ? (
                <div className="mt-6 flex gap-3">
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring inline-flex items-center rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)]"
                  >
                    手动打开
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSite(null);
                      setState("idle");
                      setTargetUrl("");
                    }}
                    className="focus-ring inline-flex items-center rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
                  >
                    关闭
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </SmartLinkContext.Provider>
  );
}

export function SmartLink({
  siteId,
  siteName,
  className,
  style,
  children,
}: {
  siteId: number;
  siteName: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const context = useContext(SmartLinkContext);
  const fallbackHref = `/go/${siteId}`;

  return (
    <a
      href={fallbackHref}
      className={className}
      style={style}
      onClick={(event) => {
        if (!context || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }

        event.preventDefault();
        context.open({ id: siteId, name: siteName, fallbackHref });
      }}
    >
      {children}
    </a>
  );
}
