import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  route("login", "./routes/login.tsx"),
  layout("./routes/protected-layout.tsx", [
    index("./routes/home.tsx"),
    route("reference", "./routes/reference.tsx"),
    route("rich-reference", "./routes/rich-reference.tsx"),
    route("info/crawl", "./routes/info-crawl.tsx"),
    route("forbidden", "./routes/forbidden.tsx"),
  ]),
  route("*", "./routes/not-found.tsx"),
] satisfies RouteConfig;
