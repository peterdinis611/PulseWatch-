"use client";

import type { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 grid gap-2">
      <Label className="text-[13px] font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? (
        <p className="text-[12px] leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function CheckRow({
  checked,
  onCheckedChange,
  children,
  description,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
  description?: string;
}) {
  return (
    <label className="mb-3 flex items-start gap-3 text-[15px] last:mb-0">
      <Checkbox
        className="mt-0.5"
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <span className="min-w-0">
        <span className="block font-medium leading-snug">{children}</span>
        {description ? (
          <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function EnumSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export function FormOk({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="mb-4 text-sm text-up">{children}</p>;
}
