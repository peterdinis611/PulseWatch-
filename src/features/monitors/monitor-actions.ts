import { gql, gqlMessage } from "@/shared/graphql/client";
import {
  CREATE_MONITOR,
  DELETE_MONITOR,
  RUN_MONITOR,
  UPDATE_MONITOR,
} from "@/shared/graphql/documents";
import {
  formToMonitorInput,
  monitorToForm,
} from "@/shared/lib/monitor-input";
import type { Monitor } from "@/shared/lib/types";
import { toast } from "sonner";

export async function runMonitorCheck(id: string): Promise<Monitor> {
  const data = await gql<{ runMonitorCheck: Monitor }>(RUN_MONITOR, { id });
  return data.runMonitorCheck;
}

export async function setMonitorEnabled(
  id: string,
  enabled: boolean,
): Promise<Monitor> {
  const data = await gql<{ updateMonitor: Monitor }>(UPDATE_MONITOR, {
    id,
    input: { enabled },
  });
  return data.updateMonitor;
}

export async function setMonitorMuted(
  id: string,
  alertsMuted: boolean,
): Promise<Monitor> {
  const data = await gql<{ updateMonitor: Monitor }>(UPDATE_MONITOR, {
    id,
    input: { alertsMuted },
  });
  return data.updateMonitor;
}

export async function deleteMonitor(id: string): Promise<void> {
  await gql(DELETE_MONITOR, { id });
}

export async function duplicateMonitor(monitor: Monitor): Promise<Monitor> {
  const form = monitorToForm(monitor);
  form.name = `${monitor.name} (copy)`;
  const input = formToMonitorInput(form);
  const data = await gql<{ createMonitor: Monitor }>(CREATE_MONITOR, { input });
  return data.createMonitor;
}

export function toastActionError(label: string, err: unknown) {
  const message = gqlMessage(err);
  toast.error(label, { description: message });
  return message;
}

export async function runBulk(
  ids: string[],
  action: (id: string) => Promise<unknown>,
  labels: { ok: string; fail: string },
): Promise<{ ok: number; fail: number }> {
  let ok = 0;
  let fail = 0;
  for (const id of ids) {
    try {
      await action(id);
      ok += 1;
    } catch {
      fail += 1;
    }
  }
  if (fail === 0) {
    toast.success(labels.ok, { description: `${ok} ${ok === 1 ? "monitor" : "monitors"}` });
  } else {
    toast.error(labels.fail, {
      description: `${ok} succeeded · ${fail} failed`,
    });
  }
  return { ok, fail };
}
