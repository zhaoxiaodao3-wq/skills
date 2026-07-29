# 课堂评分点击事件 fix — 执行计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

## Task 1：课堂评分列改为只读

**文件：** `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue`

- [ ] 将「课堂评分」列 `ElLink` 替换为 `span`，移除 `@click`
- [ ] 删除 `BctiScoreDialog` 模板节点
- [ ] 删除 import、`bctiUseV2Api`、`bctiDialogVisible`、`bctiDialogData`、`handleShowBcti`

## Task 2：自检

- [ ] `read_lints` 目标文件无新增问题
- [ ] 目视确认其他列交互未动
