# 临时占位页面块 · 实施计划（标准档）

> **For engineer:** 按任务顺序执行；**禁止 git commit**（用户规则）。每 Task 做完验证再往下。

**Spec:** [../specs/03-dev-spec.md](../specs/03-dev-spec.md)
**Goal:** 三个页面接入设计稿截图占位（等级分布 ×2 + 热力图 ×1），带 `TODO(1.7.1-临时占位):` 标记；对接文档写明「同事组件接入后删除 img **与截图资源文件**」。

---

## Task 1：页面接入占位图

> **Skill:** — 无匹配（router.mjs --annotate 无建议）

**Files:**

- Modify: `apps/data-board/src/views/plan-lessons/plan-lessons.vue`
- Modify: `apps/data-board/src/views/grade-overview/grade-overview.vue`

**Step 1：plan-lessons.vue**（GroupFocus 之后追加；补 import）

```vue
<!-- TODO(1.7.1-临时占位): 同事「等级分布（本组/班级）」组件接入后，删除本 img 与 placeholder 资源 -->
<img
  class="plan-lessons__placeholder"
  src="../../assets/placeholders/ph-distribution-plan.png"
  alt="等级分布占位（本组等级分布 / 班级等级分布，待同事组件）"
>
```

**Step 2：grade-overview.vue**（GroupFocus 之后追加两块）

```vue
<!-- TODO(1.7.1-临时占位): 同事「等级分布（本组/等级构成对比）」组件接入后，删除本 img 与 placeholder 资源 -->
<img
  class="grade-overview__placeholder"
  src="../../assets/placeholders/ph-distribution-grade.png"
  alt="等级分布占位（本组等级分布 / 等级构成对比，待同事组件）"
>
<!-- TODO(1.7.1-临时占位): 同事「年级 × 科目热力图」组件接入后，删除本 img 与 placeholder 资源 -->
<img
  class="grade-overview__placeholder"
  src="../../assets/placeholders/ph-heatmap-grade.png"
  alt="年级 × 科目热力图占位，待同事组件"
>
```

**Step 3：样式（两页 scss 追加）**

```scss
&__placeholder {
  display: block;
  width: 100%;
  height: auto;
}
```

**Step 4：验证**

vue-tsc 0 error。

---

## Task 2：浏览器实测 + 归档文档

> **Skill:** — 无匹配

**Step 1：浏览器实测**

1. `plan-lessons`：等级分布占位渲染在组内即时关注下方，满宽不变形
2. `grade-overview`：等级分布占位 + 热力图占位顺序正确
3. 其余页面无占位块；组件无回归

**Step 2：归档文档（02-占位-delivered）**

必须包含「占位说明与删除清单」小节：

| 占位块 | 页面 | 删除内容 |
|--------|------|---------|
| 等级分布（本组/班级） | plan-lessons | img + import + `ph-distribution-plan.png` |
| 等级分布（本组/等级构成对比） | grade-overview | img + import + `ph-distribution-grade.png` |
| 年级 × 科目热力图 | grade-overview | img + import + `ph-heatmap-grade.png` |

**明确要求（用户附加）：同事组件对接后，占位截图资源文件必须从项目删除**（全局搜索 `TODO(1.7.1-临时占位):` 共 3 处）。
