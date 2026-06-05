"use client";

import { CheckCircle2, Loader2, RotateCcw, X, XCircle } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { UiStyle } from "@/lib/types";

type ResolveState = "idle" | "loading" | "success" | "error";

type SmartLinkContextValue = {
  open: (site: { id: number; name: string; fallbackHref: string; linkCount?: number }) => void;
};

const SmartLinkContext = createContext<SmartLinkContextValue | null>(null);

export function SmartLinkProvider({ children, uiStyle = "wechat" }: { children: React.ReactNode; uiStyle?: UiStyle }) {
  const [state, setState] = useState<ResolveState>("idle");
  const [site, setSite] = useState<{ id: number; name: string; fallbackHref: string; linkCount?: number } | null>(null);
  const [message, setMessage] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [openBlocked, setOpenBlocked] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (site) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      closeButtonRef.current?.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [site]);

  async function resolve(siteInput: { id: number; name: string; fallbackHref: string; linkCount?: number }) {
    setSite(siteInput);
    setState("loading");
    setMessage(siteInput.linkCount === 1 ? "正在打开链接..." : "正在并发测速，优选最快可用链接...");
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
        linkCount?: number;
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

        window.setTimeout(() => {
          setSite(null);
          setState("idle");
          setTargetUrl("");
        }, 200);
      }, 100);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "测速失败，请稍后重试");
    }
  }
  const isClassic = uiStyle === "classic";

  return (
    <SmartLinkContext.Provider value={{ open: resolve }}>
      {children}
      {site ? (
        <div
          className={isClassic ? "fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-md animate-in fade-in duration-200" : "fixed inset-0 z-50 grid place-items-center bg-black/35 px-4 backdrop-blur-sm animate-in fade-in duration-200"}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          <div ref={dialogRef} className={isClassic ? "clay-card relative w-full max-w-md overflow-hidden rounded-[2rem] p-6 text-[var(--foreground)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" : "relative w-full max-w-md overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-5 text-[var(--foreground)] shadow-[var(--shadow-lg)] animate-in fade-in slide-in-from-bottom-2 duration-200"}>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => {
                setSite(null);
                setState("idle");
              }}
              className={isClassic ? "focus-ring clay-panel absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full text-[var(--text-secondary)] transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-md)] hover:text-[var(--foreground)]" : "focus-ring absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-lg text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"}
              aria-label="关闭对话框"
            >
              <X className="size-4" />
            </button>

            <div className="relative z-10 grid justify-items-center text-center">
              <div className="relative grid size-16 place-items-center">
                <div
                  className={clsx(
                    "absolute inset-0 rounded-full border transition-all duration-200",
                    state === "loading" && "animate-spin border-[var(--line)] border-t-[var(--accent)]",
                    state === "success" && "border-[var(--success)]",
                    state === "error" && "border-[var(--danger)]",
                  )}
                  aria-hidden="true"
                />
                {state === "loading" ? <Loader2 className="size-7 animate-spin text-[var(--accent)]" aria-label="加载中" /> : null}
                {state === "success" ? <CheckCircle2 className="size-8 text-[var(--success)] animate-in zoom-in-50 duration-200" aria-label="成功" /> : null}
                {state === "error" ? <XCircle className="size-8 text-[var(--danger)] animate-in zoom-in-50 duration-200" aria-label="错误" /> : null}
              </div>

              <p className="mt-4 text-xs font-medium text-faint">智能跳转</p>
              <h2 id="dialog-title" className="mt-2 text-xl font-semibold tracking-tight">{site.name}</h2>
              <p id="dialog-description" className="mt-3 max-w-sm text-sm leading-6 text-tertiary">{message}</p>

              {targetUrl ? <p className={isClassic ? "clay-panel mt-4 max-w-full truncate rounded-[1rem] px-3 py-2 text-xs text-secondary" : "mt-4 max-w-full truncate rounded-lg border border-[var(--line)] bg-[var(--field-bg)] px-3 py-2 text-xs text-secondary"}>{targetUrl}</p> : null}

              {state === "error" ? (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => resolve(site)}
                    className="clay-button focus-ring inline-flex items-center gap-2 text-sm font-semibold"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    重试
                  </button>
                  <a
                    href={site.fallbackHref}
                    className="focus-ring inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                  >
                    使用兜底跳转
                  </a>
                </div>
              ) : null}

              {state === "success" && openBlocked && targetUrl ? (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="clay-button focus-ring inline-flex items-center text-sm font-semibold"
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
                    className="focus-ring inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
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
  linkCount,
  className,
  style,
  children,
  onClick,
  ...props
}: {
  siteId: number;
  siteName: string;
  linkCount?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const context = useContext(SmartLinkContext);
  const fallbackHref = `/go/${siteId}`;

  return (
    <a
      {...props}
      href={fallbackHref}
      className={className}
      style={style}
      onClick={(event) => {
        onClick?.(event);

        if (!context || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }

        event.preventDefault();

        if (linkCount === 1) {
          window.open(fallbackHref, "_blank", "noopener,noreferrer");
          return;
        }

        context.open({ id: siteId, name: siteName, fallbackHref, linkCount });
      }}
    >
      {children}
    </a>
  );
}
