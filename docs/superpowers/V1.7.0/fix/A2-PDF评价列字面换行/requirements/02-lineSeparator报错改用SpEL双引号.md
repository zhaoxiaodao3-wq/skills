# A2 PDF 评价列换行 · 跟进：lineSeparator 导致生成失败

**日期：** 2026-09-20  
**分类：** fix（跟进）  
**档位：** 标准  
**前置：** [01-原始需求.md](./01-原始需求.md) 已交付，但 `T(java.lang.System).lineSeparator()` 导致后端 PDF 生成报错。

## 问题

3.4.3 `aidAnalysis` 评价列使用 `lineSeparator()` 后模板渲染失败（疑似 SpEL/Thymeleaf 限制访问 `java.lang.System`）。

## P1 已确认 → 实现纠偏

原选方案 A（SpEL `"\n"`）在 HTML 双引号属性内会拆破标记（`Attribute ":" appears more than once`）。

**最终实现：** 同处改为单引号包裹的**真实换行字符**：

```text
#strings.listJoin(evRaw, '<LF>')
```

不调用 `System`、不嵌套 `"`、保留 `th:text` + 表格 `pre-wrap`。
