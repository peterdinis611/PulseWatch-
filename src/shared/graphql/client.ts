import { ClientError, GraphQLClient } from "graphql-request";
import { createClient, type Client as WsClient } from "graphql-ws";
import { clearToken, getToken } from "@/shared/session/token";

export const GRAPHQL_HTTP =
  process.env.NEXT_PUBLIC_GRAPHQL_HTTP ?? "http://localhost:4000/graphql";
export const GRAPHQL_WS =
  process.env.NEXT_PUBLIC_GRAPHQL_WS ?? "ws://localhost:4000/graphql";

export function gqlMessage(err: unknown): string {
  if (err instanceof ClientError) {
    const first = err.response.errors?.[0]?.message;
    if (first) return first;
  }
  if (err instanceof Error && err.message) return err.message;
  return "Požiadavka zlyhala.";
}

function isUnauthorized(err: unknown): boolean {
  if (!(err instanceof ClientError)) return false;
  if (err.response.status === 401) return true;
  const msg = err.response.errors?.[0]?.message?.toLowerCase() ?? "";
  return msg.includes("unauthorized");
}

export function createGqlClient(token?: string | null) {
  return new GraphQLClient(GRAPHQL_HTTP, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function gql<T>(
  document: string,
  variables?: Record<string, unknown>,
  options?: { auth?: boolean },
): Promise<T> {
  const auth = options?.auth !== false;
  const token = auth ? getToken() : null;
  const client = createGqlClient(token);
  try {
    return await client.request<T>(document, variables);
  } catch (err) {
    if (auth && isUnauthorized(err)) {
      clearToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.assign("/");
      }
    }
    throw err;
  }
}

export function subscribeGql<T>(
  query: string,
  onData: (data: T) => void,
): () => void {
  const ws: WsClient = createClient({
    url: GRAPHQL_WS,
    connectionParams: () => {
      const token = getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    retryAttempts: 8,
  });

  const dispose = ws.subscribe(
    { query },
    {
      next: (result) => {
        if (result.data) onData(result.data as T);
      },
      error: () => undefined,
      complete: () => undefined,
    },
  );

  return () => {
    dispose();
    ws.dispose();
  };
}
