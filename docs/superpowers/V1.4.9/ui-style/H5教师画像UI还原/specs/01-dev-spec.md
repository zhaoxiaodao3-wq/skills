# H5教师画像UI还原 · 开发规格（一期：0+1）

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Fixture:** [fixtures/getReport.sample.json](../fixtures/getReport.sample.json)  
**日期：** 2026-07-21  
**方案：** A · 分模块；一期仅 **0 数据壳 + 1 画像头图**  
**目标仓库：** `E:\code\H5`  
**视觉原则：** 样式大体对齐 PC；按 Figma 移动端调整布局与小样式（非全新视觉）

## 1. 目标

1. `token` → `getReport` 拉数（联调可用固定 token）  
2. 还原头图卡 Figma `7485:14519`  
3. 不做模块 2～10

## 2. 响应外层（已由样例确认）

```ts
{
  code: 200,
  msg: 'ok',
  data: {
    status: 0 | 1 | 2 | 3,   // 分享有效性，同现有 ShareLinkStatus
    shareType: 3,            // 教师画像
    basicInfo: object | null, // 头图姓名/性别/科目/时长等；样例为 null
    reportContent: {         // 内层对齐 PC getTeacherProfile 业务字段
      myLessonPlan, postClassReport, questionType, classroomClarity,
      speakingBehavior, speakingComprehensibility, personalTagCloud,
      teachingStyleTrend, teachingStyleElasticity, personalFeature
      // 注意：样例 postClassReport 为 areport/breport 小写，与 PC 联调一致
    }
  }
}
```

| 项 | 约定 |
|----|------|
| 方法 | `GET` |
| Path | `/analysis/public/share/getReport`（相对 `VITE_BASE_URL`） |
| Query | `token` |
| Adapter | `adaptShareGetReport`：读 `data.status`；头图从 `basicInfo` + `reportContent.personalFeature`（及风格字段）组装 |

### 头图字段映射（一期）

| UI | 来源（优先） |
|----|----------------|
| 姓名 / 性别 / 科目 / 时长 | `basicInfo`；**为空则用下方 Mock，后端补齐后删 Mock** |
| 主导 / 辅助风格 | `personalFeature.dominantStyle` / `auxiliaryStyle` |
| 底部特征标签 | `personalFeature`：speech / emotion / power / subjectFeature（对齐 PC） |
| 风格立绘 | **复刻 PC**：性别 + 主导/辅助 → OSS URL（无分享按钮） |

### 后端缺口 → 前端 Mock（用户确认 2026-07-21）

| 缺口 | 一期处理 |
|------|----------|
| `basicInfo` 姓名/性别/科目/上课总时长 | Adapter 内 Mock，例如：姓名「张伟」、性别「男」、科目「数学」、时长 `1280`（与 Figma 示例一致；集中常量，便于后端就绪后替换） |
| `scoreTrend` 得分趋势 | **本期不做 UI**；后续模块 3 接入时同样先 Mock 列表，再换真字段。本规格仅登记，不实现趋势面板 |

联调 token：`cPbPGmnuo0SNOYjmKwbwdpis5v6WGjvU`（仅缺省/开发；正式读 URL `token`）。

## 3. UI（模块 1）

- 白底圆角卡、左立绘 150、右信息、底标签行（Figma）  
- 风格 pill 配色对齐 PC `TEACHING_STYLE_THEMES`  
- **无** PC 分享按钮  

## 4. 工程（确认后才改 H5）

| 文件方向 | 内容 |
|----------|------|
| API | `getShareReport(token)` |
| Adapter + types | envelope + hero view-model |
| `useTeacherProfileShare` | 真实 getReport 替换 mock meta；保留无效态 + `enableWxShare` |
| 组件 | `TeacherPortraitHero` |
| 页面 | `status===0` 渲染头图 |

### Out of Scope

模块 2～10、左侧栏、改 A/B、改封面 URL。

## 5. 验收

- [ ] Adapter 与 fixture 外层一致  
- [ ] `basicInfo` 空时用 Mock 姓名/性别/科目/时长，并能拼出风格立绘  
- [ ] 头图布局对齐 Figma；观感对齐 PC；无分享按钮  
- [ ] 无效 status / 无 token → 空态；有效仍配置微信分享  
- [ ] 未做教案及以下模块；未做 scoreTrend UI  

## 6. 风险

- Mock 与真 `basicInfo` 字段名需后端对齐后一次替换  
- H5 `createRequest` 默认 `/backstage` 前缀：public 路径需确认能否直打 `/analysis/...`
