# AB类报告点击时间播放视频 · 开发规格

**Requirement:** [requirements/01-A类时间锚点.md](../requirements/01-A类时间锚点.md)  
**接口文档:** [docs/V1.4.9_caseBasicInfo_教师全景视频URL.md](../docs/V1.4.9_caseBasicInfo_教师全景视频URL.md)

> 方案：**A**（已确认）— 复用页内 `caseBasicInfo.teacherPanoramaVideoUrl`；无 Mock；无 URL 时 Toast、不弹窗。  
> **生效范围：仅 A 类报告**（B 类本期不接入）。

## 1. 目标

在 A 类「课堂教学内容分析」报告中，对指定模块内 `分:秒` 时间文本统一可点；有教师全景视频 URL 时打开可拖拽单例弹窗并 seek 播放；无 URL 时 Toast「暂无课堂视频」。

## 2. 挂载点与数据流

### 2.1 页面

| 层级 | 路径 | 职责 |
|------|------|------|
| 容器 | `classroom-diagnosis/classroom-content-analysis.vue` | 已有 `caseBasicInfo`；向 A 视图下发 `teacherPanoramaVideoUrl`（或 provide） |
| A 视图 | `components/ReportTypeAView.vue` | 仅 A 类渲染；挂载时间锚点能力与单例视频弹窗 |
| 块渲染 | `ReportBlockRenderer` + 各子组件 | 在目标文本/表格单元格内渲染可点时间 |

### 2.2 视频 URL

```
analysisResult
  └─ caseBasicInfo.teacherPanoramaVideoUrl  // OSS 签名地址，可 null
```

- 类型：`CaseBasicInfo` 增加 `teacherPanoramaVideoUrl?: string | null`
- **不**为点击再请求 `getDiagnosisResult`
- **无 Mock 兜底**

### 2.3 点击分支

| 条件 | 行为 |
|------|------|
| URL 非空（trim 后有值） | 打开/复用唯一弹窗，`src`=URL，seek 到点击秒数并播放 |
| URL 为空 | 不弹窗；`ElMessage.warning('暂无课堂视频')`（或项目统一 Toast） |
| 时间样式 | 无论有无 URL，目标模块内匹配时间均为 `.time-anchor` 可点态 |

## 3. 时间生效范围（仅 A 类章节）

与需求第二节对齐，在 A 报告渲染树中覆盖：

1. 第三大点「依据摘录」（`evidenceExcerpts` 时间戳）
2. 4.1 表格「时间戳」列
3. 5.3 卡片内「可识别突破方法」「学生显性理解反应」等含时间文本区域
4. 5.6「典型学生输出摘录」
5. 6.1 / 6.2 表格「依据」列

实现策略（推荐）：

- 抽纯函数：`parseTimeAnchors(text)` → 片段列表（plain / time）
- 抽组件：`TimeAnchorText`（整段文字内嵌时间）与表格单元格包装
- 在上述模块对应组件上接入，**避免**对整页 `innerHTML` 全量扫描

## 4. 时间识别规则

| 规则 | 说明 |
|------|------|
| 格式 | `分:秒`，分钟 1～2 位，秒 2 位（如 `8:01`、`08:01`） |
| 时间段 | `01:20-03:45` / `01:20 - 03:45` → 取**起始**时刻 |
| 跳转 | 转为秒：`minutes * 60 + seconds` |
| 原则 | 只改样式与点击，不改原文其他字符 |

正则建议（实现时可微调，须有单测）：匹配 `(\d{1,2}):(\d{2})(?:\s*[-–—]\s*\d{1,2}:\d{2})?`

样式：按需求第四节 `.time-anchor`（色 `#027AFF`、字重 600、下划线、pointer）。

## 5. 视频弹窗

### 5.1 能力

- 原生 `<video controls>` 或等价控件：播放/暂停、进度、音量、关闭
- **可拖拽**；边界限制在视口内；默认居中；关闭再开恢复居中（拖拽中位置可保留至关闭）
- **同页单例**：再点时间只 `currentTime = seekSeconds` + `play()`，不叠多个弹窗
- 关闭：暂停；「下次打开保留上次播放位置」——本期保留为可配置默认 **开**（与需求一致）

### 5.2 失败

- `error` / 无法加载（含签名过期）：Toast 或弹窗内错误文案；**不**自动重拉诊断接口

### 5.3 视觉

对齐 Figma：`node-id=7502-23652`

- 尺寸约 **480×320**，圆角 8px，阴影 `0 6px 24px rgba(0,0,0,0.15)`
- **无**独立标题栏；视频铺满；右上角圆形半透明关闭（24px，`rgba(0,0,0,0.3)`）
- 播放控件使用原生 `<video controls>`
- 顶部空白区可拖拽（避开关闭按钮）

## 6. 架构拆分（建议文件）

| 文件 | 职责 |
|------|------|
| `types/.../CaseBasicInfo` | 补字段 |
| `classroom-diagnosis/utils/time-anchor.ts` | 解析、求秒、单测 |
| `classroom-diagnosis/components/TimeAnchorText.vue` | 文本内时间可点 |
| `classroom-diagnosis/components/ReportTimeVideoDialog.vue` | 可拖拽单例弹窗 |
| `classroom-diagnosis/composables/useReportTimeVideo.ts` | 提供 `openAt(seconds)` / URL / 无 URL Toast |
| 目标展示组件 | `ReportEvidenceExcerptList`、`ReportDataTable`（指定列）、5.3/5.6 相关卡片等接入 |

Provide/inject key：在 `ReportTypeAView`（或 `classroom-content-analysis` 仅 A 分支）provide `useReportTimeVideo`，子组件 inject 后点击调用。

## 7. 非目标

- B 类报告时间锚点
- Mock 视频
- 签名过期自动续签续播
- 独立「只取视频 URL」接口

## 8. 测试

1. `time-anchor` 纯函数：单位数/两位数分钟、时间段取起点、非时间不匹配、求秒正确
2. 无 URL：点击不打开弹窗（可用 composable 单测 mock Toast）
3. 有 URL：`openAt` 更新 seek 秒数且可见状态为开

## 9. 验收标准

- [x] 仅 A 类：指定模块时间均为可点链接样式
- [x] 有 `teacherPanoramaVideoUrl`：点击弹窗并从对应时刻播放；同页单例，再点只 seek
- [x] 无 URL：Toast「暂无课堂视频」，不弹窗；样式仍可点
- [x] 无 Mock；URL 仅来自 `caseBasicInfo.teacherPanoramaVideoUrl`
- [x] 播放/签名失败仅提示，不自动重拉
- [x] `CaseBasicInfo` 类型已声明该字段
- [x] 时间解析单测通过；相关 lint / `vue-tsc` 无新增错误
