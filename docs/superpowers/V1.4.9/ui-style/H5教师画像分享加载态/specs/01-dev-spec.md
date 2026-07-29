# H5教师画像分享加载态 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**日期：** 2026-07-22  
**方案：** A · Vue 组件化（工程化）  
**目标仓库：** `E:\code\H5`  
**原型参考：** `src/pages/share/teacherProfile/loading.html`

## 1. 目标

用可复用的 Vue 加载组件替换分享页「加载中…」文案；视觉对齐 `loading.html`（全屏环 + 书本 +「正在加载报告…」），显隐由页面 `loading` 驱动。

**工程原则：** 组件化、单一职责、样式自包含；demo HTML 不进运行时路径。

## 2. 组件设计

### 2.1 文件

| 路径 | 职责 |
|------|------|
| `components/TeacherProfileLoading.vue` | 全屏 Loading UI（模板 + scoped 样式 + 动画） |
| `index.vue` | `v-if` / `Transition` 挂载；去掉旧文案加载态 |
| `loading.html` | 仅作设计参考；交付后可保留旁路或移入 `fixtures/`，**不**被路由/iframe 引用 |

### 2.2 API（组件）

```ts
// 无业务 props 亦可；可选扩展：
defineProps<{
  /** 文案，默认「正在加载报告」 */
  text?: string
}>()
```

- 不内置定时关闭；不依赖 `getReport`
- 父级：`loading === true` 显示；`false` 卸载或淡出后卸载

### 2.3 视觉（对齐 loading.html）

| 项 | 值 |
|----|-----|
| 背景 | `#F7FAFF`；全屏 fixed / 铺满主区域 |
| 环 | 外径约 `88`；底环 `#E8EEF7`；进度边 `#2554C3` / `#648CD9`；旋转动画 |
| 书本 | CSS 伪元素叠中心；pulse |
| 文案 | `15`、`#333644`；三点跳动 |
| 淡出 | 可选 `opacity` ~0.6s（对齐 `.hide`） |

尺寸用设计稿 px（经 pxtorem）；不强制 ECharts `designPx`。

### 2.4 挂载

```vue
<TeacherProfileLoading v-if="loading" />
<!-- 或 Transition + v-if，结束带淡出 -->
```

无效态 / 内容区逻辑不变；仅替换原 `.teacher-profile-page__loading`。

## 3. Out of Scope

- 模块内 mini-loader（html 注释块）本期不做，可后续抽 `size="mini"`  
- 改 getReport、微信分享、各业务模块  
- iframe / 注入整页 HTML

## 4. 验收

- [x] 加载中展示环+书本+「正在加载报告…」，无「加载中…」纯文案  
- [x] `loading` 结束后进入内容或无效态，Loading 消失（可淡出）  
- [x] 独立 Vue SFC，无运行时依赖 `loading.html`  
- [x] 样式 scoped，不影响其它页  

## 5. 样式对照（原型）

来源：`loading.html`（非 Figma 节点；表内 token 摘自该文件）

| 项 | 值 |
|----|-----|
| 容器 | fixed 全屏、`#F7FAFF`、居中 column |
| 环 | `88×88`；border `3` |
| 文案 | `15px`、`#333644`、letter-spacing `1` |
| 动画 | rotate 1.6s；pulse 2.2s；dot 1.4s |
