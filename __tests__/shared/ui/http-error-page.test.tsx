import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HttpErrorPage } from "@/shared/ui/http-error-page";

describe("HttpErrorPage", () => {
  it("renders 404 copy with default navigation", () => {
    render(
      <HttpErrorPage
        code="404"
        kicker="Signal not found"
        title="This page doesn't exist."
        description="This URL doesn't lead to any monitor."
      />,
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "This page doesn't exist." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("accepts custom actions", () => {
    render(
      <HttpErrorPage
        code="500"
        kicker="Outage"
        title="Chyba servera."
        description="Try again."
        actions={<button type="button">Try again</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Home" })).not.toBeInTheDocument();
  });
});
