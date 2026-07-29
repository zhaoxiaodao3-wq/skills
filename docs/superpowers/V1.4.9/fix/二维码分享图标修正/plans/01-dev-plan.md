# 二维码分享图标修正 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

## Task 1：落地 SVG 资源

- [x] **Step 1:** 将 Figma 导出的 4 个 SVG 清理后写入 `src/components/AppShareLink/assets/`

## Task 2：替换组件内联图标

- [x] **Step 1:** `AppShareLinkButton.vue` 用 `SvgIcon` + `mr-general-launch.svg`
- [x] **Step 2:** `AppShareLinkDialog.vue` 用 link / copy / qrcode 三个 SVG

## Task 3：交付

- [x] **Step 1:** 勾选 spec 验收；写 archive；`pnpm harness:check -- --match "二维码分享图标修正"`

