"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";

export function ConfirmSubmitForm({
  action,
  confirmMessage,
  children,
  buttonText = "删除",
  pendingText = "处理中...",
  className,
  buttonClassName,
}: {
  action: ComponentProps<"form">["action"];
  confirmMessage: string;
  children?: React.ReactNode;
  buttonText?: string;
  pendingText?: string;
  className?: string;
  buttonClassName?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
      <ConfirmSubmitButton className={buttonClassName} pendingText={pendingText}>
        {buttonText}
      </ConfirmSubmitButton>
    </form>
  );
}

function ConfirmSubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        "rounded-2xl border border-[color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[var(--danger-soft)] px-4 py-2 text-sm font-semibold text-[var(--danger)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {pending ? pendingText : children}
    </button>
  );
}
