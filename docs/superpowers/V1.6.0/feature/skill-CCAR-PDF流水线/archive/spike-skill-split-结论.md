# CCAR 报告 Web/PDF Skill 拆分 · Spike 结论

**日期：** 2026-08-27  
**档位：** 轻量  
**用户选择：** 方案 1

## 结论

| 轨道 | Skill | 状态 |
|------|-------|------|
| Figma 长页 → Web | `figma-long-page` | 已有，补 A2 附录 |
| Web mock → PDF 静态 HTML | `ccar-pdf-static-html` | **新建** |
| 打印 CSS 回归 | `ccar-pdf-static-html/references/print-regression.md` | 嵌在 PDF skill，不单独拆 skill |

## 产物

- `.agents/skills/ccar-pdf-static-html/SKILL.md`
- `.agents/skills/ccar-pdf-static-html/references/print-regression.md`
- `.agents/skills/figma-long-page/SKILL.md`（A2 Web 轨说明）
- `.agents/routing/SKILL_ROUTING.md`（路由注册）

## 调用示例

```text
/ccar-pdf-static-html 修复 A2 第十章打印对齐
用 ccar-pdf-static-html 跑 R11 打印回归
```

```text
用 figma-long-page 还原 A2 第三章 Web 组件
```
