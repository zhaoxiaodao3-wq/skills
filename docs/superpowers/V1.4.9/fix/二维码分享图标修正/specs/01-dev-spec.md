# 二维码分享图标修正 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 方案

从 Figma 导出 4 个 Miray 图标 SVG，放入 `src/components/AppShareLink/assets/`，通过项目已有 `SvgIcon` 渲染：

| 文件 | 用法 | 尺寸 | 颜色 |
|------|------|------|------|
| `mr-general-launch.svg` | 按钮左侧 | 16 | `currentColor`（随按钮白字） |
| `mr-general-link.svg` | 弹窗链接区标题 | 20 | `#027AFF`（或保留原色） |
| `mr-edit-copy.svg` | 复制按钮 | 16 | `#fff` / `currentColor` |
| `mr-general-qrcode.svg` | 扫码区标题 | 20 | `#00BCBC`（或保留原色） |

`@miray/icons` 尚无 `MrGeneralLink` / `MrGeneralQrcode`，故统一走本地 SVG + `SvgIcon`，避免混用两套。

## 2. 改动文件

- `AppShareLinkButton.vue`
- `AppShareLinkDialog.vue`
- `AppShareLink/assets/*.svg`（新增）

## 3. 验收

- [x] 按钮图标为 launch（外链箭头），非手写近似形
- [x] 弹窗链接区为链环图标、青色/蓝色圆形底
- [x] 复制按钮为双层文档 copy 图标
- [x] 扫码区为 qrcode 图标
