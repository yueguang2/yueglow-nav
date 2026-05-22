"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { SiteLinkInput } from "@/lib/types";
import { Checkbox, Field, TextInput } from "./ui";

type EditableLink = SiteLinkInput & {
  key: string;
};

function createLink(index: number): EditableLink {
  return {
    key: crypto.randomUUID(),
    label: index === 0 ? "默认链接" : `备用链接 ${index}`,
    url: "",
    sortOrder: (index + 1) * 10,
    isEnabled: true,
  };
}

export function SiteLinksEditor({ defaultLinks }: { defaultLinks: SiteLinkInput[] }) {
  const [links, setLinks] = useState<EditableLink[]>(() => {
    const initial = defaultLinks.length > 0 ? defaultLinks : [createLink(0)];

    return initial.map((link, index) => ({
      ...link,
      key: link.id ? String(link.id) : crypto.randomUUID(),
      label: link.label || (index === 0 ? "默认链接" : `备用链接 ${index}`),
      sortOrder: link.sortOrder || (index + 1) * 10,
      isEnabled: link.isEnabled,
    }));
  });

  const serialized = useMemo(
    () =>
      JSON.stringify(
        links.map((item) => ({
          id: item.id,
          label: item.label.trim(),
          url: item.url.trim(),
          sortOrder: Number(item.sortOrder) || 100,
          isEnabled: Boolean(item.isEnabled),
        })),
      ),
    [links],
  );

  function updateLink(key: string, patch: Partial<EditableLink>) {
    setLinks((current) => current.map((link) => (link.key === key ? { ...link, ...patch } : link)));
  }

  function removeLink(key: string) {
    setLinks((current) => (current.length > 1 ? current.filter((link) => link.key !== key) : current));
  }

  return (
    <div className="grid gap-3">
      <input type="hidden" name="links" value={serialized} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--soft-text)]">站点链接</p>
          <p className="mt-1 text-xs text-[var(--muted)]">访问时会测速并优先跳转最快可用链接。</p>
        </div>
        <button
          type="button"
          onClick={() => setLinks((current) => [...current, createLink(current.length)])}
          className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-strong)]"
        >
          <Plus className="size-3.5" />
          添加链接
        </button>
      </div>

      {links.map((link, index) => (
        <div key={link.key} className="rounded-3xl border border-[var(--line)] bg-[var(--control-bg)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-black tracking-tight text-[var(--foreground)]">链接 {index + 1}</span>
            <button
              type="button"
              onClick={() => removeLink(link.key)}
              disabled={links.length === 1}
              className="focus-ring inline-flex items-center gap-1.5 rounded-2xl border border-[color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[var(--danger-soft)] px-3 py-2 text-xs font-semibold text-[var(--danger)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="size-3.5" />
              删除
            </button>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <Field label="链接名称">
                <TextInput value={link.label} onChange={(event) => updateLink(link.key, { label: event.target.value })} placeholder="默认链接" />
              </Field>
              <Field label="排序">
                <TextInput
                  type="number"
                  min="0"
                  max="9999"
                  value={link.sortOrder}
                  onChange={(event) => updateLink(link.key, { sortOrder: Number(event.target.value) })}
                />
              </Field>
            </div>
            <Field label="URL">
              <TextInput type="url" value={link.url} onChange={(event) => updateLink(link.key, { url: event.target.value })} placeholder="https://example.com" required />
            </Field>
            <Checkbox label="启用此链接" checked={link.isEnabled} onChange={(event) => updateLink(link.key, { isEnabled: event.target.checked })} />
          </div>
        </div>
      ))}
    </div>
  );
}
