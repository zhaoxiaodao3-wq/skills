# 教师画像工程化重构 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md) · [requirements/02-方案确认.md](../requirements/02-方案确认.md)

## 1. 目标

提升可维护性与接真接口准备度；**零视觉回归**。

## 2. 范围

| 做 | 不做 |
|----|------|
| `types/` 领域类型 | 真接口对接 |
| `adapters/` 统一 resolve | 改 UI/交互 |
| heatmap / style-distribution layout 外提 | 拆教师列表筛选（可后续） |
| DEV-only 数据态开关 | 其它 mr-* |

## 3. 结构

```
mr-teacher-portrait-1/
  types/*.ts
  adapters/portrait-data.ts   # re-export resolve* from mock
  mock/*.ts                   # 只产数据，类型从 types 引入
  components/.../xxx.layout.ts
```

## 4. 验收

- [x] 组件不直接依赖 mock 类型作为唯一来源（经 types / adapters）
- [x] heatmap layout、style-distribution 标签布局函数可独立引用
- [x] 生产构建无「数据态」开关；DEV 仍可用
- [x] 预览空态/有数据切换正常
