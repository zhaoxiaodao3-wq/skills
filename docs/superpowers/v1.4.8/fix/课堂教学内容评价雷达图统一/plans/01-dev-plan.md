# 课堂教学内容评价雷达图统一 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** 空状态雷达图维度与有数据态一致，A/B 类独立

## Task 1: 修复 buildEmptyViewModel

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalContainer.vue`

- [ ] **Step 1:** 将 `emptyDimensions` 拆分为 `emptyDimensionsA` 和 `emptyDimensionsB`
- [ ] **Step 2:** A 类：教案落实度/20、思维启发度/25、难点突破度/25、练习有效度/15、小结完整度/5、节奏合理度/10
- [ ] **Step 3:** B 类：知识落实度/25、思维启发度/20、学生参与度/15、逻辑清晰度/15、练习与反馈有效性/15、节奏把控度/10
- [ ] **Step 4:** 返回 `dimensionsA: emptyDimensionsA, dimensionsB: emptyDimensionsB`

## Task 2: 验证

- [ ] `pnpm harness:check` 无新增警告
- [ ] 写 archive 交付记录
