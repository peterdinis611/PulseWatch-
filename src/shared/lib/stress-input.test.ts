import { describe, expect, it } from "vitest";
import { blankStressForm, formToStressInput } from "@/shared/lib/stress-input";

describe("formToStressInput", () => {
  it("maps required fields and omits empty thresholds", () => {
    const form = blankStressForm();
    form.name = "  health  ";
    const input = formToStressInput(form);
    expect(input).toEqual({
      name: "health",
      url: "http://localhost:4000/health",
      method: "GET",
      vus: 10,
      durationSec: 30,
      expectedStatus: 200,
    });
  });

  it("includes optional p95 and fail rate", () => {
    const form = blankStressForm();
    form.name = "burst";
    form.p95Ms = "400";
    form.maxFailRate = "0.05";
    expect(formToStressInput(form)).toMatchObject({
      p95Ms: 400,
      maxFailRate: 0.05,
    });
  });
});
