import { ClientError } from "graphql-request";
import { describe, expect, it } from "vitest";
import { gqlMessage } from "@/shared/graphql/client";

function clientError(message: string, status = 200) {
  return new ClientError(
    {
      errors: [{ message } as never],
      status,
      headers: new Headers(),
      body: message,
    },
    { query: "query { x }" },
  );
}

describe("gqlMessage", () => {
  it("prefers the GraphQL error message", () => {
    expect(gqlMessage(clientError("Email už existuje"))).toBe("Email už existuje");
  });

  it("falls back to Error.message then a Slovak default", () => {
    expect(gqlMessage(new Error("network down"))).toBe("network down");
    expect(gqlMessage("weird")).toBe("Požiadavka zlyhala.");
  });
});
