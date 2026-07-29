# 个人标签云组件 — 滚动规则修订开发规格

**Requirement:** [../requirements/滚动规则修订.md](../requirements/滚动规则修订.md)

**变更范围：** 仅滚动行为；条形列表 UI、标签枚举、排序、缺省态等既有实现不变。

**前置基线：** [../specs/原始需求-dev-spec.md](../specs/原始需求-dev-spec.md)

## 1. 需求摘要

当存在多个学科适配模块，且模块列表总高度**超过侧栏容器高度**时：

- 模块列表区域支持**上下滚动**查看全部模块
- 滚动交互样式对齐 Figma `6696:13461`
- 标题「个人标签云」固定不随内容滚动

**不再适用（v1 已废弃）：**「默认可视高度展示 4 个模块」「总模块 > 4 才滚动」。

## 2. 设计稿

| 状态 | Figma | 说明 |
|------|-------|------|
| 完整 | [6696-13461](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-13461&m=dev) | 侧栏 270px 全高卡片 |
| 缺省 | [6696-20779](https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de?node-id=6696-20779&m=dev) | 4 模块全零，通常无需滚动 |

## 3. 滚动行为规格

### 3.1 触发条件

- 以**实际渲染高度**为准：所有模块（话语 + 情感 + 权力 + N 个学科）总高度 > 模块列表可视区高度时，出现纵向滚动
- 与模块**个数无关**；单学科但视口较矮时也可能出现滚动

### 3.2 滚动区域

| 区域 | 行为 |
|------|------|
| 组件标题区（`__header`） | `flex-shrink: 0`，固定 |
| 模块列表区（`__modules`） | `flex: 1; min-height: 0; overflow-y: auto`，唯一滚动容器 |
| 组件外壳（`personal-tag-cloud-view`） | `overflow: hidden`，禁止整体撑高侧栏 |

### 3.3 高度传递链

```
teacher-portrait-side-col (overflow: hidden, stretch 全高)
  └── personal-tag-cloud-container (height: 100%, min-height: 0, overflow: hidden)
        └── personal-tag-cloud-view (height: 100%, overflow: hidden)
              ├── __header (固定)
              └── __modules (滚动)
```

侧栏高度由同行 `teacher-portrait-main-col` 内容撑开（`align-items: stretch`），标签云不得反向撑高整行。

### 3.4 滚动条样式

对齐 Figma 细滚动条：

| 属性 | 值 |
|------|-----|
| 宽度 | 4px |
| thumb 颜色 | `#e5e6eb`，hover `#d9d9d9` |
| track | 透明 |
| 实现 | 原生 `overflow-y: auto` + `::-webkit-scrollbar`；Firefox `scrollbar-width: thin` |
| 其他 | `overscroll-behavior: contain`；`scrollbar-gutter: stable` |

### 3.5 响应式

- `md` 断点侧栏 `max-height: min(480px, 45vh)` 时，多学科场景更易触发滚动，行为与桌面一致

## 4. 涉及文件

| 文件 | 职责 |
|------|------|
| `PersonalTagCloudView.vue` | 模块列表滚动容器与滚动条样式 |
| `PersonalTagCloudContainer.vue` | 高度传递包裹层 |
| `teacher-portrait/index.vue` | `.teacher-portrait-side-col { overflow: hidden }` |
| `mock/teacher-portrait-aggregate.mock.ts` | full 态多学科 Mock，便于验证滚动 |

**不在本次变更范围：** `TagCloudModulePanel.vue`、`tag-sort.ts`、`constants.ts`（除非滚动验收发现布局问题）

## 5. Mock 场景

| 场景 | 数据 | 预期 |
|------|------|------|
| 单学科 | 话语 + 情感 + 权力 + 1 学科 | 视口足够高时无滚动条 |
| 多学科 | 话语 + 情感 + 权力 + ≥3 学科 | 模块列表可上下滚动，底部学科可见 |
| 缺省 | 未选教师 / 无数据 | 4 模块全零，通常无滚动 |

## 6. 验收标准

- [ ] 标题「个人标签云」滚动时保持固定
- [ ] 模块总高度超出容器时，仅 `__modules` 区域出现纵向滚动
- [ ] 滚动条样式为 4px 细条，不挤压模块内容布局
- [ ] 滚动到底可看到最后一个学科适配模块
- [ ] 内容未超出时无多余滚动条
- [ ] `pnpm run typecheck` 通过
