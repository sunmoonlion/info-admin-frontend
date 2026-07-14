import { render, screen } from "@testing-library/react";

import { ErrorBoundary } from "~/root";

describe("global error boundary", () => {
  it("offers keyboard reachable recovery actions", () => {
    render(<ErrorBoundary error={new Error("test failure")} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新加载" })).toBeVisible();
    expect(screen.getByRole("link", { name: "返回首页" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
