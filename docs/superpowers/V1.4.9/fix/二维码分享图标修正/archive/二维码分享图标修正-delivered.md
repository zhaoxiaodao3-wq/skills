# 二维码分享图标修正 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-07-17  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

将 `AppShareLink` 内手写近似图标替换为 Figma Miray 设计稿对应 SVG（launch / link / copy / qrcode），经 `SvgIcon` 着色渲染。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/components/AppShareLink/assets/mr-general-launch.svg` |
| 增 | `src/components/AppShareLink/assets/mr-general-link.svg` |
| 增 | `src/components/AppShareLink/assets/mr-edit-copy.svg` |
| 增 | `src/components/AppShareLink/assets/mr-general-qrcode.svg` |
| 改 | `src/components/AppShareLink/AppShareLinkButton.vue` |
| 改 | `src/components/AppShareLink/AppShareLinkDialog.vue` |

## 验收结果

- [x] 按钮 launch 图标  
- [x] 弹窗 link / copy / qrcode 图标  

## Harness 闭环

- [x] 开发前 validate  
- [x] archive 已写  
- [x] 交付后 validate  

未自动 commit。
