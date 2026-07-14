import {
  filterNavigation,
  findNavigationItem,
  findNavigationTrail,
  flattenNavigation,
  navigationItems,
} from "~/lib/navigation";

describe("navigation metadata", () => {
  it("filters protected menu entries by role without removing public routes", () => {
    const visible = filterNavigation(navigationItems, ["users"]);
    expect(flattenNavigation(visible).map((item) => item.path)).toEqual(["/"]);
    expect(findNavigationItem(visible, "/reference")).toBeUndefined();
  });

  it("accepts a required role or wildcard role", () => {
    expect(
      findNavigationItem(
        filterNavigation(navigationItems, ["operator"]),
        "/reference",
      ),
    ).toBeDefined();
    expect(
      findNavigationItem(
        filterNavigation(navigationItems, ["*"]),
        "/reference",
      ),
    ).toBeDefined();
    expect(
      findNavigationItem(
        filterNavigation(navigationItems, ["operator"]),
        "/info/crawl",
      ),
    ).toMatchObject({ labelKey: "infoCrawl" });
  });

  it("derives nested breadcrumbs from the same menu metadata", () => {
    expect(
      findNavigationTrail(navigationItems, "/reference").map(
        (item) => item.labelKey,
      ),
    ).toEqual(["workspace", "reference"]);
  });
});
