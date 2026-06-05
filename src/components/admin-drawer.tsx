"use client";

import { X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { AdminRoute } from "@/lib/admin-routing";
import type { UiStyle } from "@/lib/types";

type AdminDrawerContextValue = {
  close: () => void;
};

const AdminDrawerContext = createContext<AdminDrawerContextValue | null>(null);

type AdminDrawerBasePath = AdminRoute;

const focusableSelector = [
  "[data-autofocus]",
  "input:not([type='hidden']):not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "a[href]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function AdminDrawer({
  title,
  description,
  basePath,
  closeHref,
  returnFocusSelector,
  size = "md",
  uiStyle = "wechat",
  children,
}: {
  title: string;
  description?: string;
  basePath: AdminDrawerBasePath;
  closeHref?: AdminRoute;
  returnFocusSelector?: string;
  size?: "sm" | "md" | "lg";
  uiStyle?: UiStyle;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [isDirty, setIsDirty] = useState(false);

  const focusReturnTarget = useCallback(() => {
    const target = returnFocusSelector ? document.querySelector<HTMLElement>(returnFocusSelector) : null;
    const fallback = document.querySelector<HTMLElement>("[data-admin-page-title]");
    (target ?? fallback)?.focus();
  }, [returnFocusSelector]);

  const close = useCallback(() => {
    if (isDirty && !window.confirm("表单还有未保存的修改，确定要关闭吗？")) {
      return;
    }

    router.replace(closeHref ?? basePath, { scroll: false });
    window.setTimeout(focusReturnTarget, 0);
  }, [basePath, closeHref, focusReturnTarget, isDirty, router]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const firstFocusable =
      drawerRef.current?.querySelector<HTMLElement>("[data-autofocus]") ??
      drawerRef.current?.querySelector<HTMLElement>("input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href]");

    firstFocusable?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => element.offsetParent !== null,
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  return (
    <AdminDrawerContext.Provider value={{ close }}>
      <div className={uiStyle === "classic" ? "fixed inset-0 z-50 grid place-items-center bg-black/45 p-0 backdrop-blur-md animate-in fade-in duration-200 sm:p-4" : "fixed inset-0 z-50 grid place-items-end bg-black/35 p-0 backdrop-blur-sm animate-in fade-in duration-200 sm:place-items-center sm:p-4"} role="presentation">
        <button type="button" className="absolute inset-0 z-0 cursor-default" aria-label="关闭抽屉" onClick={close} />
        <section
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={clsx(
            uiStyle === "classic"
              ? "relative z-10 flex h-full w-full flex-col overflow-hidden rounded-none border border-[var(--line)] bg-[var(--card-bg)] text-[var(--foreground)] shadow-[var(--shadow-lg)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 sm:max-h-[calc(100vh-2rem)] sm:rounded-[2rem]"
              : "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-[var(--line)] bg-[var(--card-bg)] text-[var(--foreground)] shadow-[var(--shadow-lg)] animate-in fade-in slide-in-from-bottom-4 duration-200 sm:max-h-[calc(100vh-2rem)] sm:rounded-xl",
            size === "sm" && "sm:max-w-[640px]",
            size === "md" && "sm:max-w-[840px]",
            size === "lg" && "sm:max-w-[960px]",
          )}
          onClick={(event) => event.stopPropagation()}
          onClickCapture={(event) => {
            if ((event.target as HTMLElement).closest("[data-dirty-action]")) {
              setIsDirty(true);
            }
          }}
          onInputCapture={() => setIsDirty(true)}
          onChangeCapture={() => setIsDirty(true)}
        >
          <header className={uiStyle === "classic" ? "flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4" : "flex items-start justify-between gap-4 border-b border-[var(--line)] px-4 py-4 sm:px-5"}>
            <div className="min-w-0">
              <h2 id={titleId} className={uiStyle === "classic" ? "text-2xl font-black tracking-tight" : "text-xl font-semibold tracking-tight"}>
                {title}
              </h2>
              {description ? <p className="mt-1 text-sm leading-6 text-tertiary">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={close}
              className={uiStyle === "classic" ? "focus-ring clay-panel grid size-10 shrink-0 place-items-center rounded-full text-secondary transition hover:text-[var(--foreground)]" : "focus-ring grid size-10 shrink-0 place-items-center rounded-lg text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"}
              aria-label="关闭弹窗"
              data-drawer-close
            >
              <X className="size-4" />
            </button>
          </header>
          <div className={clsx(uiStyle === "classic" ? "min-h-0 flex-1 overflow-y-auto px-5 py-5" : "min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5")}>{children}</div>
        </section>
      </div>
    </AdminDrawerContext.Provider>
  );
}

export function AdminDrawerCloseButton({
  children = "取消",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const context = useContext(AdminDrawerContext);

  if (!context) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={context.close}
      className={clsx(
        "focus-ring inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export const AdminModal = AdminDrawer;
export const AdminModalCloseButton = AdminDrawerCloseButton;
