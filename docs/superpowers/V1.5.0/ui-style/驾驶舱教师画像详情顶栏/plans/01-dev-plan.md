# 驾驶舱教师画像详情顶栏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**Goal:** 详情页顶部补齐「教师画像大数据看板」装饰标题栏，对齐 Figma `8030:31830`。

**Architecture:** 独立 `tp-page-header` 组件，用已落盘 SVG 拼中心牌+翼形+左右渐变线；挂入 `detail/index.vue` 的 `__shell` 顶部；三主题共用模板 1 装饰。

**Tech Stack:** Vue 3、SCSS、本地 SVG assets

**实现根目录：** `E:/code/dataView/apps-development-platform/apps/data-cockpit/src/views/preview/mr-teacher-portrait/detail/`

**资源目录（已存在）：** `.../src/assets/images/teacher-portrait-detail/title-bar/`  
（`plate.svg` / `chevron-l.svg` / `chevron-r.svg` / `accent-l.svg` / `accent-r.svg` / `line.svg`）

---

## Task 1: 页头组件 `tp-page-header`

**Files:**
- Create: `detail/components/page-header/tp-page-header.vue`

- [x] **Step 1:** 模板结构（语义示意）：

```vue
<header class="tp-page-header" aria-label="教师画像大数据看板">
  <div class="tp-page-header__line tp-page-header__line--left" aria-hidden="true" />
  <div class="tp-page-header__badge" aria-hidden="true">
    <img class="tp-page-header__wing tp-page-header__wing--outer-l" :src="chevronL" alt="" />
    <img class="tp-page-header__wing tp-page-header__wing--inner-l" :src="accentL" alt="" />
    <img class="tp-page-header__plate" :src="plate" alt="" />
    <img class="tp-page-header__wing tp-page-header__wing--inner-r" :src="accentR" alt="" />
    <img class="tp-page-header__wing tp-page-header__wing--outer-r" :src="chevronR" alt="" />
  </div>
  <h1 class="tp-page-header__title">教师画像大数据看板</h1>
  <div class="tp-page-header__line tp-page-header__line--right" aria-hidden="true" />
</header>
```

- [x] **Step 2:** `import` 六个 SVG（`@/assets/images/teacher-portrait-detail/title-bar/...`）；文案写死，无 props
- [x] **Step 3:** SCSS（scoped）：
  - 根：`display:grid` 或 flex；三列「左线 | 中心组 | 右线」；高约 **50px**；宽 **100%**
  - 中心组宽约 **360px**（牌 309.6 + 两侧翼叠压）；相对定位，标题绝对居中
  - 标题：PingFang SC / **20px** / **600** / `#fff` / `white-space:nowrap` / `pointer-events:none`
  - 翼/牌：`height:50px`；`object-fit:fill`；左右翼按稿叠放（内翼压外翼内侧）
  - 左右线：`background:url(line.svg)` 或 `linear-gradient` 等价 `#28DCD1`→透明；高 2px；垂直居中；左线 `scaleX(-1)` 镜像
- [x] **Step 4:** 无交互；`img` 加 `draggable="false"`

---

## Task 2: 接入详情页

**Files:**
- Modify: `detail/index.vue`

- [x] **Step 1:** `import TpPageHeader from './components/page-header/tp-page-header.vue'`
- [x] **Step 2:** 在 `__shell` 内、DEV 开关**之上**插入 `<tp-page-header class="mr-teacher-portrait-detail__page-header" />`
- [x] **Step 3:** 样式：
  - `&__page-header { width:100%; margin-bottom: … }`（页头→首行约 30–40px，对照稿面内容 `y≈100`）
  - 视需要微调根 `padding-top`（现 24px），使视觉顶距接近稿 `y=30`
- [x] **Step 4:** 确认加载/错误/空态分支下页头仍可见（页头在 `v-if loading/error` **之外**，与 shell 同级常驻）

---

## Task 3: 视觉自检与交付

**Files:**
- Create: `docs/.../ui-style/驾驶舱教师画像详情顶栏/archive/*-delivered.md`

- [x] **Step 1:** 本地打开预览页，对照 Figma `8030:31830`：文案、中心牌、翼形、左右线、字号色
- [x] **Step 2:** 三主题 query 各扫一眼（装饰可相同）；DEV 开关不遮挡页头
- [x] **Step 3:** 写 A/B 自检 + archive；`pnpm harness:check`；状态行 DELIVERED
