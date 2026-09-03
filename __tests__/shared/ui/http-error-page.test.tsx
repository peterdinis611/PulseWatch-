import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HttpErrorPage } from "@/shared/ui/http-error-page";

describe("HttpErrorPage", () => {
  it("renders 404 copy with default navigation", () => {
    render(
      <HttpErrorPage
        code="404"
        kicker="Stratený signál"
        title="Táto stránka neexistuje."
        description="URL nevedie na žiadny monitor."
      />,
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Táto stránka neexistuje." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Domov" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Vstup" })).toHaveAttribute(
      "href",
      "/vstup",
    );
  });

  it("accepts custom actions", () => {
    render(
      <HttpErrorPage
        code="500"
        kicker="Výpadok"
        title="Chyba servera."
        description="Skús znova."
        actions={<button type="button">Skúsiť znova</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Skúsiť znova" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Domov" })).not.toBeInTheDocument();
  });
});
