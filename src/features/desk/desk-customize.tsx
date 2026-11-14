"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Columns2,
  LayoutPanelTop,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  availableWidgetTypes,
  DESK_WIDGET_CATALOG,
  widgetTitle,
  type DeskColumn,
  type DeskLayout,
  type DeskWidgetInstance,
  type DeskWidgetType,
} from "@/features/desk/desk-layout";
import { cn } from "@/lib/utils";

export function DeskCustomizeBar({
  editing,
  onToggleEditing,
  onAddOpen,
  onReset,
  canAdd,
}: {
  editing: boolean;
  onToggleEditing: () => void;
  onAddOpen: () => void;
  onReset: () => void;
  canAdd: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {editing ? (
        <>
          <Button
            type="button"
            size="sm"
            onClick={onAddOpen}
            disabled={!canAdd}
          >
            <Plus className="size-3.5" />
            Add widget
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onReset}>
            <RotateCcw className="size-3.5" />
            Reset layout
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onToggleEditing}
          >
            Done
          </Button>
        </>
      ) : (
        <Button type="button" size="sm" variant="outline" onClick={onToggleEditing}>
          <Pencil className="size-3.5" />
          Customize
        </Button>
      )}
    </div>
  );
}

export function AddWidgetDialog({
  open,
  onOpenChange,
  layout,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout: DeskLayout;
  onAdd: (type: DeskWidgetType) => void;
}) {
  const available = availableWidgetTypes(layout);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Add widget</DialogTitle>
          <DialogDescription>
            Pick a widget to place on the Overview board. Layout is saved in
            this browser.
          </DialogDescription>
        </DialogHeader>

        {available.length === 0 ? (
          <p className="py-4 text-[14px] text-muted-foreground">
            Every available widget is already on the board.
          </p>
        ) : (
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto py-1">
            {available.map((type) => {
              const def = DESK_WIDGET_CATALOG[type];
              return (
                <li key={type}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 border border-border bg-card px-3.5 py-3 text-left transition-colors hover:bg-background"
                    onClick={() => {
                      onAdd(type);
                      onOpenChange(false);
                    }}
                  >
                    <span className="mt-0.5 rounded-md border border-border p-1.5 text-muted-foreground">
                      {def.defaultColumn === "full" ? (
                        <LayoutPanelTop className="size-4" />
                      ) : (
                        <Columns2 className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-foreground">
                        {def.defaultTitle}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-muted-foreground">
                        {def.description}
                      </span>
                      <span className="mt-1.5 block text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
                        {def.defaultColumn} column
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

export function RenameWidgetDialog({
  widget,
  open,
  onOpenChange,
  onSave,
}: {
  widget: DeskWidgetInstance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string) => void;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!widget) return;
    setValue(widget.title ?? DESK_WIDGET_CATALOG[widget.type].defaultTitle);
  }, [widget]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename widget</DialogTitle>
          <DialogDescription>
            Custom titles stay on this browser until you reset the layout.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(value);
            onOpenChange(false);
          }}
        >
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={
              widget
                ? DESK_WIDGET_CATALOG[widget.type].defaultTitle
                : "Widget title"
            }
            autoFocus
            maxLength={48}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save title</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function WidgetEditToolbar({
  widget,
  layout,
  onMove,
  onColumn,
  onRename,
  onRemove,
}: {
  widget: DeskWidgetInstance;
  layout: DeskLayout;
  onMove: (direction: "up" | "down") => void;
  onColumn: (column: DeskColumn) => void;
  onRename: () => void;
  onRemove: () => void;
}) {
  const siblings = layout.widgets.filter((w) => w.column === widget.column);
  const index = siblings.findIndex((w) => w.id === widget.id);
  const canUp = index > 0;
  const canDown = index >= 0 && index < siblings.length - 1;

  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Move up"
        disabled={!canUp}
        onClick={() => onMove("up")}
      >
        <ArrowUp className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Move down"
        disabled={!canDown}
        onClick={() => onMove("down")}
      >
        <ArrowDown className="size-3.5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Move column"
          >
            <Columns2 className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Column</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(
            [
              ["full", "Full width"],
              ["main", "Main"],
              ["side", "Side"],
            ] as const
          ).map(([value, label]) => (
            <DropdownMenuItem
              key={value}
              disabled={widget.column === value}
              onClick={() => onColumn(value)}
            >
              {label}
              {widget.column === value ? " · current" : ""}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={`Rename ${widgetTitle(widget)}`}
        onClick={onRename}
      >
        <Pencil className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={`Remove ${widgetTitle(widget)}`}
        className="text-muted-foreground hover:text-down"
        onClick={onRemove}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

export function EditableFrame({
  editing,
  children,
  className,
}: {
  editing: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 max-w-full",
        editing && "ring-1 ring-primary/35 ring-offset-2 ring-offset-background",
        className,
      )}
    >
      {children}
    </div>
  );
}
