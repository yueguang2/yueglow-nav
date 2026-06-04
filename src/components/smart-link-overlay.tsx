"use client";

import { CheckCircle2, Loader2, RotateCcw, X, XCircle } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";

type ResolveState = "idle" | "loading" | "success" | "error";

type SmartLinkContextValue = {
  open: (site: { id: number; name: string; fallbackHref: string; linkCount?: number }) => void;
};

const SmartLinkContext = createContext<SmartLinkContextValue | null>(null);

export function SmartLinkProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <SmartLinkContext.Provider value={{ open: resolve }}>
      {children}
      {site ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          <div ref={dialogRef} className="clay-card relative w-full max-w-md overflow-hidden rounded-[2rem] p-6 text-[var(--foreground)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => {
                setSite(null);
                setState("idle");
              }}
              className="focus-ring absolute right-4 top-4 z-10 clay-panel grid size-9 place-items-center rounded-full text-[var(--text-secondary)] transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-md)] hover:text-[var(--foreground)]"
              aria-label="关闭对话框"
            >
              <X className="size-4" />
            </button>

            <div className="relative z-10 grid justify-items-center text-center">
              <div className="relative grid size-24 place-items-center">
                <div
                  className={clsx(
                    "absolute inset-0 rounded-full border-2 transition-all duration-300",
                    state === "loading" && "animate-spin border-[var(--line)] border-t-[var(--accent)]",
                    state === "success" && "border-[var(--success)] scale-110",
                    state === "error" && "border-[var(--danger)] scale-110",
                  )}
                  aria-hidden="true"
                />
                {state === "loading" ? <Loader2 className="size-9 animate-spin text-[var(--accent)] transition-all duration-300" aria-label="加载中" /> : null}
                {state === "success" ? <CheckCircle2 className="size-10 text-[var(--success)] animate-in zoom-in-50 duration-300" aria-label="成功" /> : null}
                {state === "error" ? <XCircle className="size-10 text-[var(--danger)] animate-in zoom-in-50 duration-300" aria-label="错误" /> : null}
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-faint">智能跳转</p>
              <h2 id="dialog-title" className="mt-3 text-3xl font-black tracking-[-0.05em]">{site.name}</h2>
              <p id="dialog-description" className="mt-3 max-w-sm text-sm leading-6 text-tertiary">{message}</p>

              {targetUrl ? <p className="mt-4 max-w-full truncate rounded-full bg-[var(--panel)] px-3 py-1.5 text-xs text-secondary shadow-[var(--shadow-subtle)]">{targetUrl}</p> : null}

              {state === "error" ? (
                <div className="mt-6 flex gap-3">
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
                    className="focus-ring clay-panel inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all duration-300 hover:shadow-[var(--shadow-md)]"
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
                    className="focus-ring clay-panel inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all duration-300 hover:shadow-[var(--shadow-md)]"
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
