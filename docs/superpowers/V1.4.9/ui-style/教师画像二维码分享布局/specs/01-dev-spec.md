# 教师画像二维码分享布局 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

> 方案（已确认 **A**）：仅改 `TeacherPortraitCardView.vue` 的模板与样式；直接复用 `AppShareLink`（solid + 内置 Mock）；Container / 数据层不动。分享按钮空态常显示。

## 1. 目标

按 Figma `7485:12328` 调整教师画像卡片右侧信息区布局，并接入已有二维码分享入口，且不破坏既有画像展示能力。

## 2. 方案对比与选型

| 方案 | 做法 | 优点 | 缺点 |
|------|------|------|------|
| **A（推荐）** | 只改 View：重构 header DOM + 引入 `AppShareLink` | 改动面最小、与 AB 报告 Header 接入方式一致 | 本期无自定义分享 URL |
| B | Container 透传 `resolveShareUrl` / 显隐 props | 便于后续接接口 | 本期无接口，增加无用透传 |
| C | 拆出独立 Header 子组件 | 结构更清晰 | 对本次布局调整过重 |

**采用 A。**

## 3. 改动范围

| 操作 | 路径 |
|------|------|
| 改 | `src/pages/school/teacher-portrait/components/teacher-portrait-card/TeacherPortraitCardView.vue` |
| 不改 | `TeacherPortraitCardContainer.vue`、聚合数据、其他教师画像子模块、`AppShareLink` 内部实现 |

## 4. 布局结构（目标 DOM）

将原「姓名 + 风格徽章」单行，改为与 Figma 一致的两段式 header：

```vue
<div class="teacher-portrait-card-view__header-block">
  <div class="teacher-portrait-card-view__header-main">
    <!-- 姓名行：左姓名+性别短标签 / 右分享 -->
    <div class="teacher-portrait-card-view__name-row">
      <div class="teacher-portrait-card-view__name-left">
        <p class="teacher-portrait-card-view__name">{{ formatUserName(...) }}</p>
        <div v-if="genderShortLabel" class="teacher-portrait-card-view__gender-short">
          <span>{{ genderShortLabel }}</span>
          <!-- 图标：有可用资源则加；无则仅文字，不阻塞 -->
        </div>
      </div>
      <AppShareLink variant="solid" class="teacher-portrait-card-view__share" />
    </div>

    <!-- 风格徽章行：有双风格时才渲染 -->
    <div v-if="..." class="teacher-portrait-card-view__style-badges">...</div>
  </div>

  <div class="teacher-portrait-card-view__meta-row">...</div>
</div>
```

要点：

1. **分割线**从原 `name-row` 挪到 `header-main` 底部（包住姓名行 + 徽章行），对齐 Figma。
2. **分享按钮**：`import { AppShareLink } from '@/components/AppShareLink'`，`variant="solid"`，不传 `resolveShareUrl`（走内置 Mock）。
3. **空态常显示**分享按钮（不依赖 `isEmpty`）。
4. **性别短标签**：`data.gender` 有有效值时展示（与元信息同源）；无数据时不展示短标签。图标库无 `MrGeneralMan/Woman` 时，**允许仅文字**，不新增依赖。
5. **元信息文案**：`主教科目` → `主要科目`（仅展示文案）。
6. **风格徽章**：`border-radius: 999px`；水平 padding 约 `15px`（对齐 Figma）；主题色逻辑不变；无双风格时整行不渲染。

## 5. 样式约束

| 区域 | 约束 |
|------|------|
| 姓名行 | `display:flex; justify-content:space-between; align-items:center; gap`；左侧 `name-left` 横向排列姓名与性别短标签 |
| 分享 | `flex-shrink: 0`；窄屏允许整行换行，避免遮挡姓名 |
| 性别短标签 | 字号约 18px、字重 600、色 `#027aff` |
| 徽章行 | 与现网相同 gap / 主题色；圆角改为全圆角胶囊 |
| 画像区 / features / 响应式断点 | 保持现有逻辑；仅在新 class 上补充必要样式，不扩大断点改写 |

## 6. 非目标

1. 不改 `AppShareLink` / Dialog / 二维码生成
2. 不接教师画像专用分享接口
3. 不改 Container、types、mock、其他模块
4. 不做与本卡片无关的视觉重构

## 7. 验收

- [x] 姓名行右侧常显「分享链接」solid 按钮；空态亦显示
- [x] 点击可打开分享弹窗（Mock 链接 + 二维码流程可用）
- [x] 姓名与性别短标签在左；主导/辅助徽章在下一行；分割线在 header-main 底部
- [x] 元信息文案为「主要科目」；字段与空态占位逻辑不变
- [x] 风格徽章全圆角；主题色、无风格不渲染行为不变
- [x] 画像渐进加载、loading、特征标签空态、切换教师无回归
- [x] Container / 数据层无改动（或仅有与本需求无关的误触须回滚）

## 8. 风险与注意

- `AppShareLinkButton` 现高 30px，Figma 标注约 32px：**以复用组件为准**，不为本页单独改公共按钮高度。
- 性别图标缺失时以文字为准，避免为图标阻塞交付。
