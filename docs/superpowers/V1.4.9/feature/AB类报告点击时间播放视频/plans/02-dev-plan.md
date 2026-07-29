# B 类报告时间锚点 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/02-dev-spec.md](../specs/02-dev-spec.md)  
**Requirement:** [requirements/02-B类时间锚点.md](../requirements/02-B类时间锚点.md)

**Goal:** B 类指定 14 处时间可点；解析支持时:分:秒；复用 A 类弹窗与 `assets()`。

**Architecture:** 升级共用 `time-anchor` 解析 → `ReportTypeBView` provide 视频能力 → 扩展表格列 / `headerBadge` 接入 `TimeAnchorText`。

**Tech Stack:** Vue 3 + TypeScript + Vitest

> 不自动 git commit，完成后由用户确认再提交。

---

### Task 1: 时间解析支持时:分:秒（TDD）

**Files:**
- Modify: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/utils/time-anchor.ts`
- Modify: `.../utils/time-anchor.spec.ts`

- [x] **Step 1: 补充失败用例**

```ts
it('时:分:秒 00:02:06 → 126', () => {
  expect(timeAnchorToSeconds('00:02:06')).toBe(126)
  const parts = parseTimeAnchors('在 00:02:06 处')
  expect(parts.find((p) => p.type === 'time')).toMatchObject({
    text: '00:02:06',
    seekSeconds: 126,
  })
})

it('时:分:秒 时间段取起点', () => {
  const parts = parseTimeAnchors('见 00:12:01-00:14:19')
  expect(parts.find((p) => p.type === 'time')).toMatchObject({
    text: '00:12:01-00:14:19',
    seekSeconds: 721,
  })
})

it('分:秒 行为不变 8:01 → 481', () => {
  expect(timeAnchorToSeconds('8:01')).toBe(481)
})
```

- [x] **Step 2: 跑测确认红（或旧实现错误：00:02:06→2）**

```bash
npx vitest run src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/utils/time-anchor.spec.ts
```

- [x] **Step 3: 实现**

优先匹配三段 `(\d{1,2}):(\d{2}):(\d{2})`，再两段 `(\d{1,2}):(\d{2})`；时间段两侧同级。  
`seekSeconds = h*3600 + m*60 + s`（分:秒时 h=0）。

- [x] **Step 4: 全绿**

---

### Task 2: ReportTypeBView 挂载视频能力

**Files:**
- Modify: `classroom-content-analysis.vue`
- Modify: `components/ReportTypeBView.vue`

- [x] **Step 1:** 给 `ReportTypeBView` 传 `:teacher-panorama-video-url="teacherPanoramaVideoUrl"`（与 A 相同 computed）

- [x] **Step 2:** `ReportTypeBView` 对齐 A：

```ts
const props = defineProps<{ ..., teacherPanoramaVideoUrl?: string | null }>()
const { videoUrl, visible, seekSeconds, openAt, close, onVideoError } = useReportTimeVideo(
  () => props.teacherPanoramaVideoUrl,
)
provide(REPORT_TIME_VIDEO_KEY, { videoUrl, visible, seekSeconds, openAt, close, onVideoError })
```

模板挂 `ReportTimeVideoDialog`。

---

### Task 3: 表格列与 headerBadge

**Files:**
- Modify: `ReportDataTable.vue` — 扩展默认 `timeAnchorProps`
- Modify: `ReportInfoCard.vue` — `headerBadge` 用 `TimeAnchorText`

- [x] **Step 1: ReportDataTable 默认 props**

```ts
timeAnchorProps: () => [
  'timestamp', 'basis',
  'evidence', 'method', 'reaction',
  'content', 'timing', 'handling',
]
```

- [x] **Step 2: ReportInfoCard headerBadge**

```vue
<span v-if="headerBadge" class="cca-info-card__header-badge">
  <TimeAnchorText :text="headerBadge" />
</span>
```

保持原有 badge 视觉样式（颜色/字号挂在父 span 上即可）。

- [x] **Step 3: 确认 3.3 典型摘录**经 `CalcProcessDisclosureRow` → `ReportInfoCard` items 已可点，无需再改。

---

### Task 4: 验证与归档

- [x] **Step 1:** `npx vitest run .../time-anchor.spec.ts .../useReportTimeVideo.spec.ts`
- [x] **Step 2:** `npx vue-tsc -b --pretty false` → EXIT=0
- [x] **Step 3:** `pnpm harness:check -- --match "AB类报告点击时间播放视频"`
- [x] **Step 4:** 勾选 `specs/02-dev-spec.md` §7
- [x] **Step 5:** 写 `archive/AB类报告点击时间播放视频-B类-delivered.md`
- [x] **Step 6:** 不自动 commit；联调说明交用户

