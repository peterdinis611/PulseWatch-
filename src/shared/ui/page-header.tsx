"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  lede,
  actions,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="animate-rise mb-8 grid items-end gap-5 md:grid-cols-[minmax(0,1.5fr)_auto]">
      <div>
        <h1 className="font-heading text-[clamp(28px,3.2vw,40px)] font-black tracking-[-0.045em]">
          {title}
        </h1>
        {lede ? (
          <p className="mt-2 max-w-[44ch] text-[16px] text-muted-foreground">
            {lede}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap justify-end gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="animate-rise max-w-[560px] border border-border bg-card px-6 py-8">
      <h2 className="mb-2 font-heading text-[24px] font-black tracking-[-0.04em]">
        {title}
      </h2>
      <p className="mb-5 text-muted-foreground">{children}</p>
      {action}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
    >
      ← {children}
    </Link>
  );
}

export function TypeChips({
  options,
  value,
  onChange,
  label = "Typ",
  className,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 grid gap-2", className)} role="radiogroup" aria-label={label}>
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next);
        }}
        className="flex w-full max-w-full flex-wrap"
        variant="outline"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className="rounded-md text-[12px] tracking-wide data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
