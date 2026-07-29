# AB类报告点击时间播放视频 · 开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)

**Goal:** A 类报告指定模块内 `分:秒` 可点；有 `teacherPanoramaVideoUrl` 时单例可拖拽弹窗 seek 播放，无 URL 时 Toast「暂无课堂视频」。

**Architecture:** 纯函数解析时间 → `TimeAnchorText` 渲染可点片段；`useReportTimeVideo` + provide/inject 统一处理有无 URL；`ReportTimeVideoDialog` 单例弹窗；仅在 A 类视图树接入。

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Vitest

**文件地图：**

| 操作 | 路径 |
|------|------|
| 改 | `src/types/teaching-diagnosis-case-basic-info.ts` |
| 新建 | `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/utils/time-anchor.ts` |
| 新建 | `.../utils/time-anchor.spec.ts` |
| 新建 | `.../composables/useReportTimeVideo.ts` |
| 新建 | `.../composables/report-time-video-context.ts`（InjectionKey） |
| 新建 | `.../components/TimeAnchorText.vue` |
| 新建 | `.../components/ReportTimeVideoDialog.vue` |
| 改 | `classroom-content-analysis.vue`、`ReportTypeAView.vue` |
| 改 | `ReportEvidenceExcerptList.vue`、`ReportDataTable.vue`、`ReportInfoCard.vue`、`EqualHeightCardGrid.vue`（及卡片字段渲染处） |

> 提交：本计划**不自动 git commit**，开发完成后由用户确认再提交。

---

### Task 1: 类型字段 + 时间解析纯函数（TDD）

**Files:**
- Modify: `src/types/teaching-diagnosis-case-basic-info.ts`（`CaseBasicInfo`）
- Create: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/utils/time-anchor.ts`
- Test: `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/utils/time-anchor.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
import { describe, expect, it } from 'vitest'
import { parseTimeAnchors, timeAnchorToSeconds } from './time-anchor'

describe('parseTimeAnchors', () => {
  it('识别一位/两位分钟', () => {
    const parts = parseTimeAnchors('在 8:01 与 08:12 出现')
    expect(parts.filter((p) => p.type === 'time').map((p) => p.text)).toEqual(['8:01', '08:12'])
  })

  it('时间段取起始并整段可点文本保留原文', () => {
    const parts = parseTimeAnchors('见 01:20-03:45')
    const time = parts.find((p) => p.type === 'time')
    expect(time?.text).toBe('01:20-03:45')
    expect(time?.seekSeconds).toBe(80)
  })

  it('非时间不匹配', () => {
    expect(parseTimeAnchors('比例 3:1 不是时分秒').every((p) => p.type === 'plain')).toBe(true)
  })
})

describe('timeAnchorToSeconds', () => {
  it('8:01 → 481', () => {
    expect(timeAnchorToSeconds('8:01')).toBe(481)
  })
})
```

注意：`3:1` 秒位只有 1 位，正则要求秒为 `\d{2}`，故不匹配——单测需与正则一致。

- [ ] **Step 2: 运行确认红**

```bash
npx vitest run src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/utils/time-anchor.spec.ts
```

预期：模块未定义 / 失败。

- [ ] **Step 3: 最小实现**

`CaseBasicInfo` 增加：

```ts
/** 教师全景视频 OSS 签名地址；无录播时为 null */
teacherPanoramaVideoUrl?: string | null
```

`time-anchor.ts` 导出：

```ts
export type TimeAnchorPart =
  | { type: 'plain'; text: string }
  | { type: 'time'; text: string; seekSeconds: number }

export function timeAnchorToSeconds(token: string): number | null
export function parseTimeAnchors(text: string): TimeAnchorPart[]
```

正则：`/(\d{1,2}):(\d{2})(?:\s*[-–—]\s*\d{1,2}:\d{2})?/g`  
`seekSeconds` 只用**第一个** `分:秒`。

- [ ] **Step 4: 运行确认绿**

同 Step 2 命令 → 全绿。

---

### Task 2: useReportTimeVideo + 上下文

**Files:**
- Create: `.../composables/report-time-video-context.ts`
- Create: `.../composables/useReportTimeVideo.ts`
- Test（可选轻量）: 同目录 `useReportTimeVideo.spec.ts`（mock `ElMessage`）

- [ ] **Step 1: InjectionKey**

```ts
import type { InjectionKey, Ref } from 'vue'

export type ReportTimeVideoApi = {
  videoUrl: Ref<string | null>
  visible: Ref<boolean>
  seekSeconds: Ref<number>
  openAt: (seconds: number) => void
  close: () => void
  onVideoError: () => void
}

export const REPORT_TIME_VIDEO_KEY: InjectionKey<ReportTimeVideoApi> = Symbol('report-time-video')
```

- [ ] **Step 2: composable**

```ts
export function useReportTimeVideo(getUrl: () => string | null | undefined) {
  const visible = ref(false)
  const seekSeconds = ref(0)
  const videoUrl = computed(() => {
    const raw = getUrl()?.trim()
    return raw ? raw : null
  })

  function openAt(seconds: number) {
    if (!videoUrl.value) {
      ElMessage.warning('暂无课堂视频')
      return
    }
    seekSeconds.value = Math.max(0, seconds)
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  function onVideoError() {
    ElMessage.error('视频加载失败，请刷新页面后重试')
  }

  return { videoUrl, visible, seekSeconds, openAt, close, onVideoError }
}
```

- [ ] **Step 3: 无 URL 时 openAt 不把 visible 设为 true**（手写或单测断言）

---

### Task 3: TimeAnchorText + ReportTimeVideoDialog

**Files:**
- Create: `.../components/TimeAnchorText.vue`
- Create: `.../components/ReportTimeVideoDialog.vue`

- [ ] **Step 1: TimeAnchorText**

Props: `text: string`  
Inject `REPORT_TIME_VIDEO_KEY`；对 `parseTimeAnchors(text)` 渲染；`type==='time'` 用 `<button type="button" class="time-anchor">`，点击 `api.openAt(part.seekSeconds)`。  
样式对齐需求 `.time-anchor`（scoped 或共享 scss）。

无 inject 时降级为纯文本（防御，A 树外误用不报错）。

- [ ] **Step 2: ReportTimeVideoDialog**

Props/绑定：`visible`、`src`、`seekSeconds`、`@close`、`@error`  
- `v-show`/`Teleport` 到 `body`；居中；标题栏可拖拽（mousedown + 视口钳制）
- `<video ref controls :src>`；`watch([visible, seekSeconds])` 在可播放时 `currentTime = seekSeconds` + `play()`
- 关闭：emit close；暂停 video
- 默认保留播放位置：关闭不重置 `currentTime`（再次打开同 src 时先 seek 到新点击时间，需求「再点只 seek」优先于「保留位置」——**再点时间以新 seek 为准**；无新点击仅重开时可保留）
- `@error` → `onVideoError`

---

### Task 4: A 类页挂载 provide + 弹窗

**Files:**
- Modify: `classroom-content-analysis.vue`
- Modify: `ReportTypeAView.vue`

- [ ] **Step 1:** `classroom-content-analysis.vue` 增加 computed：

```ts
const teacherPanoramaVideoUrl = computed(
  () => caseBasicInfo.value?.teacherPanoramaVideoUrl ?? null,
)
```

传给 `ReportTypeAView`：`:teacher-panorama-video-url="teacherPanoramaVideoUrl"`

- [ ] **Step 2:** `ReportTypeAView.vue`

```ts
const props = defineProps<{ ..., teacherPanoramaVideoUrl?: string | null }>()
const timeVideo = useReportTimeVideo(() => props.teacherPanoramaVideoUrl)
provide(REPORT_TIME_VIDEO_KEY, timeVideo)
```

模板根节点旁挂：

```vue
<ReportTimeVideoDialog
  :visible="timeVideo.visible.value"
  :src="timeVideo.videoUrl.value"
  :seek-seconds="timeVideo.seekSeconds.value"
  @close="timeVideo.close"
  @error="timeVideo.onVideoError"
/>
```

（若解构丢失响应式，改为在 script 用 `toRefs` / 模板直接绑定 composable 返回的 ref。）

---

### Task 5: 目标模块接入 TimeAnchorText

**Files:**
- Modify: `ReportEvidenceExcerptList.vue` — `item.timestamp`、必要时 `quote`
- Modify: `ReportDataTable.vue` — 对 `prop` 为 `timestamp` / `basis` 的列用自定义 `#default` + `TimeAnchorText`（或 props `anchorProps?: string[]` 默认 `['timestamp','basis']`）
- Modify: `ReportInfoCard.vue` / `EqualHeightCardGrid.vue`（及内部字段行）— `content`、列表项、字段 value 走 `TimeAnchorText`

- [ ] **Step 1:** 依据摘录时间戳可点
- [ ] **Step 2:** 表格 `timestamp`、`basis` 列可点（覆盖 4.1 / 6.1 / 6.2）
- [ ] **Step 3:** 5.3 / 5.6 卡片文本可点（equalHeightCards / infoCard 字段）

仅改文本展示层；**不要**改 mapper 数据结构。

---

### Task 6: 验证与归档

- [ ] **Step 1:** `npx vitest run src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/utils/time-anchor.spec.ts`
- [ ] **Step 2:** `npx vue-tsc -b --pretty false`（或项目惯用检查）→ 无本需求引入错误
- [ ] **Step 3:** `pnpm harness:check -- --match "AB类报告点击时间播放视频"`
- [ ] **Step 4:** 勾选 `specs/01-dev-spec.md` §9 验收项
- [ ] **Step 5:** 写 `archive/AB类报告点击时间播放视频-delivered.md`
- [ ] **Step 6:** 再跑 `pnpm harness:status` 确认 `DELIVERED`；**不自动 commit**

---

### 联调说明（交付时告知用户）

需 A 类报告 + 真实 `teacherPanoramaVideoUrl` 账号验证：有视频 seek、无视频 Toast、弹窗拖拽与单例。
