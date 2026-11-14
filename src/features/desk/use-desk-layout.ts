"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addWidgetToLayout,
  defaultDeskLayout,
  loadDeskLayout,
  moveWidgetInLayout,
  removeWidgetFromLayout,
  renameWidgetInLayout,
  saveDeskLayout,
  setWidgetColumn,
  type DeskColumn,
  type DeskLayout,
  type DeskWidgetType,
} from "@/features/desk/desk-layout";

export function useDeskLayout() {
  const [layout, setLayout] = useState<DeskLayout>(defaultDeskLayout);
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setLayout(loadDeskLayout());
    setHydrated(true);
  }, []);

  const commit = useCallback((next: DeskLayout) => {
    setLayout(next);
    saveDeskLayout(next);
  }, []);

  const addWidget = useCallback(
    (type: DeskWidgetType, column?: DeskColumn) => {
      commit(addWidgetToLayout(layout, type, column));
    },
    [commit, layout],
  );

  const removeWidget = useCallback(
    (id: string) => {
      commit(removeWidgetFromLayout(layout, id));
    },
    [commit, layout],
  );

  const renameWidget = useCallback(
    (id: string, title: string) => {
      commit(renameWidgetInLayout(layout, id, title));
    },
    [commit, layout],
  );

  const moveWidget = useCallback(
    (id: string, direction: "up" | "down") => {
      commit(moveWidgetInLayout(layout, id, direction));
    },
    [commit, layout],
  );

  const changeColumn = useCallback(
    (id: string, column: DeskColumn) => {
      commit(setWidgetColumn(layout, id, column));
    },
    [commit, layout],
  );

  const resetLayout = useCallback(() => {
    const next = defaultDeskLayout();
    commit(next);
  }, [commit]);

  return {
    layout,
    hydrated,
    editing,
    setEditing,
    addWidget,
    removeWidget,
    renameWidget,
    moveWidget,
    changeColumn,
    resetLayout,
  };
}
