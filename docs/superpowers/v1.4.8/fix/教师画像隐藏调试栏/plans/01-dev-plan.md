# 教师画像隐藏调试栏 · 开发计划

> **For agentic workers:** 按 Task 顺序执行；步骤用 checkbox 跟踪。

**Goal:** 注释隐藏教师画像页 RoleDebugBar，交付接口对接审查结论。  
**Architecture:** 仅改 `index.vue` 模板注释，不删组件与调试状态。  
**Tech Stack:** Vue 3 SFC  
**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

## Task 1：注释 RoleDebugBar

**文件：** `src/pages/school/teacher-portrait/teacher-portrait/index.vue`

1. 将模板中的：

```vue
    <RoleDebugBar
      v-model:role="debugRole"
      v-model:data-mode="teacherPortraitDebugDataMode"
      v-model:use-mock="teacherPortraitUseMockData"
      :effective-role="role"
    />
```

改为 HTML 注释包裹（保留原属性，方便恢复）：

```vue
    <!--
    <RoleDebugBar
      v-model:role="debugRole"
      v-model:data-mode="teacherPortraitDebugDataMode"
      v-model:use-mock="teacherPortraitUseMockData"
      :effective-role="role"
    />
    -->
```

2. 不删除 script 中的相关 import / `debugRole`（spec 允许保留）。
3. 若 ESLint 报 unused，用最小注释或 `eslint-disable-next-line` 处理，避免扩大改动。

**验收：** 页面顶部无调试栏；取消注释可恢复。

## Task 2：门禁与交付

1. 改码前：`pnpm harness:check`
2. 改完后勾选 spec 验收项
3. 写 `archive/教师画像隐藏调试栏-delivered.md`
4. 再跑 `pnpm harness:check` / `pnpm harness:status`
