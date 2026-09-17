# PDF大纲同页滚动贴顶 · 交付归档

**归档类型：** fix 交付快照  
**归档日期：** 2026-09-17  
**版本：** V1.6.0  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)

## 改动摘要

修复 PDF 预览大纲跳转只认页码导致的「同页子节无反应」与「未贴顶」：解析书签 dest 页内 Y，失败则按标题匹配 `page.lines`，用相对 viewer 的视觉坐标滚到顶部附近。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/components/AppViewerAnalysis/AppViewerAnalysis.vue` |

## 验收结果

- [x] 同页跳转：`jumpToPageOffset` 在页码不变时仍 scrollTo，并用行 Y / dest Y 贴顶
- [x] dest XYZ/FitH 解析 + 标题文本回退
- [x] `jumpMenuItemPageNumber` 真正跳转（不再只 return page）
- [ ] 浏览器手工点「一、…」后再点同屏「1.2」确认贴顶（需本地预览复核）

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | N/A | 仅跳转逻辑 |
| 常量/mock/真数据 | N/A | 不改报告数据 |
| 多入口 | 通过 | outline 与 menu 共用 jumpToPageOffset |
| 失败/缺省 | 通过 | dest 失败走标题回退；无命中则不滚 |

## 还原度自检

不适用：无 Figma / 非 UI 视觉还原

## Harness 闭环

- [x] validate 开发前已跑
- [x] archive 交付快照已写
- [x] validate 交付后已跑
