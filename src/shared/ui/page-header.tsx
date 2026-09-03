"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export function PageHeader({
  kicker,
  title,
  lede,
  actions,
}: {
  kicker: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="animate-rise mb-7 grid items-end gap-6 md:grid-cols-[minmax(0,1.5fr)_auto]">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          {kicker}
        </p>
        <h1 className="mt-1.5 mb-2.5 font-heading text-[clamp(32px,4.6vw,56px)] font-extrabold leading-[0.94] tracking-[-0.06em]">
          {title}
        </h1>
        {lede ? (
          <p className="max-w-[42ch] text-[19px] text-muted-foreground">{lede}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap justify-end gap-2.5">{actions}</div> : null}
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
    <div className="animate-rise max-w-[560px] py-8">
      <h2 className="mb-2 font-heading text-[32px] tracking-[-0.05em]">{title}</h2>
      <p className="mb-4 text-muted-foreground">{children}</p>
      {action}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
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
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
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
            className="font-mono text-[11px] tracking-[0.12em] data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
