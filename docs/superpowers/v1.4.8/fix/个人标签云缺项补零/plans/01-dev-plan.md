# 个人标签云缺项补零 · 开发计划

> **For agentic workers:** 按 Task 顺序执行。

**Goal:** API 路径按固定枚举补齐缺失标签（count=0），与 Mock 展示规则一致。  
**Architecture:** Container 内将稀疏 `tags[]` 转 `counts`，复用 `buildModuleTags`。  
**Tech Stack:** Vue 3 + 现有 `tag-sort.ts`  
**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

---

## Task 1：改 PersonalTagCloudContainer API 路径

**文件：** `src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudContainer.vue`

1. 新增 helper：从 `module.tags` 生成 `Record<label, count>`（空 label 跳过）。
2. 重写 `buildModulesFromApiTags`（或与 `buildModulesFromSlice` 合并）：按 `module.type` 选择 `DISCOURSE_TAGS` / `EMOTION_TAGS` / `POWER_TAGS` / `SUBJECT_TAGS`，调用 `buildModuleViewModel(..., counts)`。
3. 删除仅「排序后端 tags」的旧逻辑。
4. Mock 分支与缺省态不动。

**建议实现片段：**

```ts
function tagsToCounts(tags: TagCloudTagSlice[] | undefined): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const tag of tags ?? []) {
    const label = tag.label?.trim()
    if (!label) continue
    counts[label] = tag.count
  }
  return counts
}

function buildModulesFromApiTags(slice: PersonalTagCloudSlice): TagCloudModuleViewModel[] {
  return slice.modules.map((module) => {
    const counts = tagsToCounts(module.tags)
    if (module.type === 'discourse') {
      return buildModuleViewModel('discourse', module.title, DISCOURSE_TAGS, counts)
    }
    if (module.type === 'emotion') {
      return buildModuleViewModel('emotion', module.title, EMOTION_TAGS, counts)
    }
    if (module.type === 'power') {
      return buildModuleViewModel('power', module.title, POWER_TAGS, counts)
    }
    return buildModuleViewModel('subject', module.title, SUBJECT_TAGS, counts)
  })
}
```

**验收：** 后端只回 2 个话语标签时，前端仍展示 9 条，缺项为 0。

## Task 2：门禁与交付

1. 改码前：`pnpm harness:check`
2. lint 检查改动文件
3. 勾选 spec 验收项；写 `archive/个人标签云缺项补零-delivered.md`
4. 再跑 `pnpm harness:check` / `pnpm harness:status`
