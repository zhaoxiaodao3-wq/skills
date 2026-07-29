# B 类报告时间锚点 + 视频弹窗 · 开发规格

**Requirement:** [requirements/02-B类时间锚点.md](../requirements/02-B类时间锚点.md)  
**前置 Spec:** [specs/01-dev-spec.md](./01-dev-spec.md)（A 类已交付）  
**接口文档:** [docs/V1.4.9_caseBasicInfo_教师全景视频URL.md](../docs/V1.4.9_caseBasicInfo_教师全景视频URL.md)

> 方案（已确认）：复用 A 类弹窗 / composable / `TimeAnchorText` / `assets()`；在 `ReportTypeBView` 注入同一套能力。  
> **时间格式（已确认 A）**：解析同时支持 `分:秒` 与 `时:分:秒`（及时间段取起点），A/B 共用。

## 1. 目标

B 类报告指定 14 处文本中的时间可点；有 `teacherPanoramaVideoUrl` 时单例弹窗 seek 播放；无 URL Toast「暂无课堂视频」。升级时间解析，避免 `00:02:06` 被误解析为 2 秒。

## 2. 时间解析升级（共用）

### 2.1 文件

`classroom-diagnosis/utils/time-anchor.ts` + `time-anchor.spec.ts`

### 2.2 规则

| 形态 | 示例 | seekSeconds |
|------|------|-------------|
| 分:秒 | `8:01`、`08:12` | `8*60+1`、`8*60+12` |
| 时:分:秒 | `00:02:06` | `2*60+6 = 126` |
| 分:秒 段 | `01:20-03:45` | 起点 `80` |
| 时:分:秒 段 | `00:12:01-00:14:19` / `00:12:01 - 00:14:19` | 起点 `12*60+1 = 721` |

实现要点：

1. 匹配时**优先**尝试 `时:分:秒`（三段），再回退 `分:秒`（两段），避免 `00:02:06` 被吃成 `00:02`。  
2. 时间段：整段原文保留为可点文本，`seekSeconds` 只取**左侧**完整时刻。  
3. 秒、分均为两位；小时 1～2 位。  
4. 更新/补充单测覆盖上表及「比例 3:1 不匹配」。

### 2.3 对 A 类影响

A 类若已有 `00:xx:xx` 数据，行为会从「错误跳转」变为正确；纯 `分:秒` 行为保持不变。

## 3. B 类挂载与数据流

| 层级 | 改动 |
|------|------|
| `classroom-content-analysis.vue` | 已有 `teacherPanoramaVideoUrl`；**同时**传给 `ReportTypeBView` |
| `ReportTypeBView.vue` | 增加 prop；`useReportTimeVideo` + `provide(REPORT_TIME_VIDEO_KEY)` + `ReportTimeVideoDialog`（与 A 对称） |

B 无 inject 时 `TimeAnchorText` 仍降级纯文本（防御）。

## 4. 展示层接入（14 处）

复用组件，按列 `prop` / 节点接入：

### 4.1 `ReportDataTable`

- 默认 `timeAnchorProps`：**仅** `['timestamp', 'basis']`（覆盖 A 的 4.1/6.x 与 B 的 5.4/7.1/7.2 回退）。
- B 类其它列**必须**在 mapper 对应 table block 上显式传入白名单，禁止靠扩大默认 props「顺带可点」：

| 模块 | `timeAnchorProps` |
|------|-------------------|
| 2.1 | `['evidence']` |
| 2.3 | `['method', 'reaction']` |
| 3.2 / 3.3 / 4.2 观察内容、5.2 内容 | `['content']` |
| 4.2 资源时间戳 | `['timing']` |
| 5.3 教师处理方式 | `['handling']` |
| 5.4 时间戳范围 | `['timestamp']` |
| 5.5 达成证据 | `['evidence']` |
| 7.1 / 7.2 依据 | `['basis']` |

### 4.2 `ReportInfoCard`

- **`headerBadge`**：始终 `<TimeAnchorText>`（B 5.3 卡片右侧时间段）
- 正文 `fields` / `items` / `content`：由 `enableTimeAnchor` 控制，**默认 `false`**

### 4.3 `CalcProcessDisclosureRow` / `EqualHeightCardGrid`

- 计算过程行：仅当标题含「典型学生输出摘录」时 `enableTimeAnchor=true`（覆盖 B 3.3）；**5.4 计算过程公示等保持纯文本**
- 等高卡片：`enableTimeAnchor` 默认 `false`（B 5.3 练习卡片正文不可点）；A 类 5.3 重难点在 mapper 显式 `enableTimeAnchor: true`

### 4.4 不做（白名单外）

- 5.1 内容列、5.3 反馈质量表、5.4 计算过程公示 / 时间分配诊断、5.3 练习卡片正文、其它未列章节
- 不得因同名 `prop`（如全局默认 `content`）导致未列模块可点

## 5. 非目标

- 新视频接口 / Mock  
- 改弹窗 UI  
- B 类未列出的章节专项改造  
- 签名过期自动续签  

## 6. 测试

1. `time-anchor`：`00:02:06` → 126；`00:12:01-00:14:19` → 721；`8:01` → 481；`3:1` 不匹配  
2. 既有 `useReportTimeVideo` 单测仍绿  
3. 手工 / 联调：B 类 2.1、5.3 badge、7.1 抽样点击  

## 7. 验收标准

- [x] 时间解析支持分:秒与时:分:秒（含段起点）  
- [x] B 类需求 14 处可点；有 URL 弹窗 seek（经 `assets()`）；无 URL Toast  
- [x] `ReportTypeBView` 已 provide + 弹窗  
- [x] A 类不回退；相关单测通过；`vue-tsc` 无新增错误  
- [x] 白名单外不可点（含 5.4 计算过程公示、5.3 练习卡片正文、5.1 等）  
