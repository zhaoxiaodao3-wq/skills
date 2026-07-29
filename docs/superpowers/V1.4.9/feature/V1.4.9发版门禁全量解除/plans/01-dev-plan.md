# V1.4.9 发版门禁全量解除 · 开发计划

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**版本：** V1.4.9  
**预估：** 6 个文件，约 15 分钟

---

## Task 1：恢复教师画像评分趋势（G1 + G2）

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalView.vue`
- Modify: `src/pages/school/teacher-portrait/components/classroom-content-eval/ClassroomContentEvalContainer.vue`

**Step 1.1 · View 恢复图表**

取消注释 import 与模板：

```vue
import ScoreTrendPanel from './ScoreTrendPanel.vue'
```

```vue
<ScoreTrendPanel :data="data.scoreTrend" />
```

**Step 1.2 · Container 恢复接口请求**

取消注释 watch 块：

```ts
watch(
  activeTeacherId,
  (id) => {
    if (!id) {
      scoreTrendFetchGeneration += 1
      scoreTrend.value = emptyScoreTrend()
      return
    }
    fetchScoreTrend(id)
  },
  { immediate: true },
)
```

删除占位：`void fetchScoreTrend`、`void activeTeacherId` 及门禁注释。

**Verify:** lint 两个文件无报错。

---

## Task 2：恢复分享按钮（G3 + G4）

**Files:**
- Modify: `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardView.vue`
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportHeroHeader.vue`

**Step 2.1 · TeacherPortraitCardView**

```vue
import { AppShareLink } from '@/components/AppShareLink'
```

```vue
<AppShareLink
  variant="solid"
  class="teacher-portrait-card-view__share"
  :resolve-share-url="resolveShareUrl"
/>
```

**Step 2.2 · ReportHeroHeader**

```vue
import { AppShareLink } from '@/components/AppShareLink'
```

```vue
<div class="cca-hero__share">
  <AppShareLink variant="ghost" :resolve-share-url="resolveShareUrl" />
</div>
```

**Verify:** lint 两个文件无报错。

---

## Task 3：恢复时间锚点点击播放（G5）

**File:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/TimeAnchorText.vue`

**Step 3.1 · 恢复 click handler**

```ts
function handleTimeClick(seekSeconds: number) {
  api?.openAt(seekSeconds)
}
```

**Step 3.2 · 恢复可点 button 模板**

将 plain-text fallback 的 `v-else` 分支改回 `<button type="button" class="time-anchor" @click="handleTimeClick(part.seekSeconds)">`。

**Step 3.3 · 取消注释 `.time-anchor` 样式**

**Verify:** lint 无报错。

---

## Task 4：恢复自主分析列表能力（G6 + G7）

**File:**
- Modify: `src/pages/school/analysis-management/ai-autonomous-analysis/index.vue`

**Step 4.1 · 恢复 SORT_TYPE_OPTIONS 与筛选 UI**

取消注释常量与 `ElFormItem label="排序方式"` 块。

**Step 4.2 · 恢复 filter 与 params**

```ts
filter: {
  // ...
  sortType: 'default',
}
```

```ts
sortType: filter?.sortType || 'default',
```

**Step 4.3 · 恢复 B 类标红**

模板 class 绑定 + `.report-type--danger` 样式；删除 `void isReportTypeHighlightRed`。

**Verify:** lint 无报错。

---

## Task 5：Harness 收尾

**Step 5.1 · 开发前 check（已在 Step D 入口跑）**

```bash
pnpm harness:status -- --match "发版门禁"
pnpm harness:check
```

**Step 5.2 · 全量检索确认无残留**

```bash
rg "TODO\(1\.4\.9 发版门禁" src/
```

预期：0 匹配。

**Step 5.3 · 一致性自检 + archive + 交付后 check**

写 `archive/V1.4.9发版门禁全量解除-delivered.md`，勾选 spec 验收项，再跑 `pnpm harness:check`。

---

## 执行顺序

Task 1 → Task 2 → Task 3 → Task 4 → Task 5（顺序执行，无依赖冲突）
