"use client";

import { useActionState } from "react";
import type { ComponentProps } from "react";
import type { ActionState } from "@/lib/validation";
import { emptyActionState } from "@/lib/validation";
import { StatusMessage } from "./ui";

export function ActionForm({
  action,
  children,
  className,
  ...props
}: Omit<ComponentProps<"form">, "action" | "children"> & {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, emptyActionState);

  return (
    <form action={formAction} className={className} {...props}>
      {children}
      <StatusMessage ok={state.ok} message={state.message} />
    </form>
  );
}
