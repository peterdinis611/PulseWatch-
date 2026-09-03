"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { gql, subscribeGql } from "@/shared/graphql/client";
import { NOTIFICATION_SUB, SHELL_QUERY } from "@/shared/graphql/documents";
import { clearToken, getToken, setToken } from "@/shared/session/token";
import type { Monitor, Notification, User } from "@/shared/lib/types";

type ShellData = {
  me: User;
  monitors: Monitor[];
  unreadNotificationCount: number;
};

type SessionValue = {
  ready: boolean;
  token: string | null;
  user: User | null;
  monitors: Monitor[];
  unread: number;
  refresh: () => Promise<void>;
  signIn: (accessToken: string) => Promise<void>;
  signOut: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [unread, setUnread] = useState(0);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const current = getToken();
    if (!current) {
      setTokenState(null);
      setUser(null);
      setMonitors([]);
      setUnread(0);
      setReady(true);
      return;
    }
    setTokenState(current);
    const data = await gql<ShellData>(SHELL_QUERY);
    setUser(data.me);
    setMonitors(data.monitors);
    setUnread(data.unreadNotificationCount);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh().catch(() => setReady(true));
  }, [refresh]);

  useEffect(() => {
    if (!token) return;
    const interval = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, 8000);
    const stopSub = subscribeGql<{ notificationReceived: Notification }>(
      NOTIFICATION_SUB,
      () => {
        setUnread((n) => n + 1);
        refresh().catch(() => undefined);
      },
    );
    return () => {
      window.clearInterval(interval);
      stopSub();
    };
  }, [token, refresh]);

  const signIn = useCallback(
    async (accessToken: string) => {
      setToken(accessToken);
      setTokenState(accessToken);
      await refresh();
    },
    [refresh],
  );

  const signOut = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setMonitors([]);
    setUnread(0);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      ready,
      token,
      user,
      monitors,
      unread,
      refresh,
      signIn,
      signOut,
    }),
    [ready, token, user, monitors, unread, refresh, signIn, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
