import { afterEach, describe, expect, it } from "vitest";
import { clearToken, getToken, setToken } from "@/shared/session/token";

describe("session token", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("stores and clears pw.token", () => {
    expect(getToken()).toBeNull();
    setToken("abc");
    expect(getToken()).toBe("abc");
    expect(window.localStorage.getItem("pw.token")).toBe("abc");
    clearToken();
    expect(getToken()).toBeNull();
  });
});
