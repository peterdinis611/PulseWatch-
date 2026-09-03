"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePoll<T>(
  fn: () => Promise<T>,
  intervalMs: number,
  deps: readonly unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const reload = useCallback(async () => {
    try {
      const next = await fnRef.current();
      setData(next);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fnRef.current()
      .then((next) => {
        if (alive) {
          setData(next);
          setError(null);
        }
      })
      .catch((err) => {
        if (alive) setError(err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    const id = window.setInterval(() => {
      fnRef.current()
        .then((next) => {
          if (alive) {
            setData(next);
            setError(null);
          }
        })
        .catch((err) => {
          if (alive) setError(err);
        });
    }, intervalMs);

    return () => {
      alive = false;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, reload, ...deps]);

  return { data, error, loading, reload };
}
