import { describe, expect, it } from "vitest";
import {
  CREATE_MONITOR,
  CREATE_STRESS,
  DELETE_MONITOR,
  LOGIN_MUTATION,
  MARK_ALL_READ,
  MONITOR_QUERY,
  PROBE_MONITOR,
  QUICK_MONITOR_CHECK,
  NOTIFICATIONS_QUERY,
  REGISTER_MUTATION,
  RUN_MONITOR,
  RUN_STRESS,
  SETTINGS_QUERY,
  SHELL_QUERY,
  STRESS_TESTS_QUERY,
  UPDATE_MONITOR,
  UPDATE_SETTINGS,
} from "@/shared/graphql/documents";

describe("graphql documents", () => {
  it("exports operation names used by the app shell and monitors", () => {
    expect(SHELL_QUERY).toMatch(/query Shell/);
    expect(MONITOR_QUERY).toMatch(/query Monitor/);
    expect(CREATE_MONITOR).toMatch(/mutation CreateMonitor/);
    expect(UPDATE_MONITOR).toMatch(/mutation UpdateMonitor/);
    expect(DELETE_MONITOR).toMatch(/mutation DeleteMonitor/);
    expect(RUN_MONITOR).toMatch(/mutation RunMonitor/);
    expect(PROBE_MONITOR).toMatch(/mutation ProbeMonitor/);
    expect(QUICK_MONITOR_CHECK).toMatch(/mutation QuickMonitorCheck/);
  });

  it("exports auth and notification operations", () => {
    expect(LOGIN_MUTATION).toMatch(/mutation Login/);
    expect(REGISTER_MUTATION).toMatch(/mutation Register/);
    expect(NOTIFICATIONS_QUERY).toMatch(/query Notifications/);
    expect(MARK_ALL_READ).toMatch(/mutation MarkAllNotificationsRead/);
  });

  it("exports load test operations", () => {
    expect(STRESS_TESTS_QUERY).toMatch(/query StressTests/);
    expect(CREATE_STRESS).toMatch(/mutation CreateStressTest/);
    expect(RUN_STRESS).toMatch(/mutation RunStressTest/);
  });

  it("exports settings query", () => {
    expect(SETTINGS_QUERY).toMatch(/query MonitorSettings/);
    expect(UPDATE_SETTINGS).toMatch(/mutation UpdateMonitorSettings/);
  });
});
