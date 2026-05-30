import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "chip inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "clay-button",
        variant === "secondary" && "clay-panel hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5",
        variant === "danger" && "bg-[var(--danger-soft)] text-[var(--danger)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  className,
  variant = "primary",
  ...props
}: ComponentProps<"a"> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <a
      className={clsx(
        "focus-ring inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300",
        variant === "primary" && "clay-button",
        variant === "secondary" && "clay-panel hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5",
        variant === "danger" && "bg-[var(--danger-soft)] text-[var(--danger)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function TextInput(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={clsx(
        "clay-input w-full text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/70",
        props.className,
      )}
    />
  );
}

export function Textarea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={clsx(
        "clay-input min-h-24 w-full resize-y text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/70",
        props.className,
      )}
    />
  );
}

export function Select(props: ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={clsx(
        "clay-input w-full text-sm text-[var(--foreground)]",
        props.className,
      )}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[var(--soft-text)]">{label}</span>
      {children}
      {hint ? <span className="text-xs text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

export function Checkbox({
  label,
  ...props
}: ComponentProps<"input"> & {
  label: string;
}) {
  return (
    <label className="clay-panel flex items-center gap-3 rounded-[1.5rem] px-4 py-3 text-sm text-[var(--soft-text)] transition-all duration-300 hover:shadow-[var(--shadow-md)]">
      <input type="checkbox" className="size-4 accent-[var(--accent)]" {...props} />
      {label}
    </label>
  );
}

export function StatusMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className={clsx("rounded-[1.5rem] px-4 py-3 text-sm", ok ? "chip-success" : "chip-danger")}>
      {message}
    </p>
  );
}

export function InitialMark({ label, className }: { label: string; className?: string }) {
  const text = label.trim().slice(0, 2).toUpperCase() || "N";

  return (
    <span
      className={clsx(
        "clay-panel grid size-11 shrink-0 place-items-center rounded-[1.25rem] text-sm font-black tracking-tight text-[var(--foreground)]",
        className,
      )}
    >
      {text}
    </span>
  );
}
