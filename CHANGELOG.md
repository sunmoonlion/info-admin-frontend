## [Unreleased]

### Fixed
- Dev server CSS pre-transform error caused by `vite-plugin-cdn-next` touching `.css` during serve. Limited the CDN plugin to `apply: 'build'` in `vite.config.ts`.
- Sidebar displayed unnecessary nested menus due to layout placeholder routes (`meta.isLayout`). Updated `generateMenuData` in `src/layouts/default.vue` to lift children when `isLayout` is true.

### Changed
- Removed stray trailing item in plugins array after `I18n(...)` to keep config clean.

---

## [2.0.0] - 2024-12-24
- Initial release of Investment Admin CSR project.


