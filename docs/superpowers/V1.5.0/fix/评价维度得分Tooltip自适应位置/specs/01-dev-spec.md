# 评价维度得分 Tooltip 自适应位置 · 开发 Spec

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

**已确认：** 仅改「评价维度得分」雷达 A/B；用 ECharts `tooltip.position` 回调按空间左右（及上下）自适应；不挂 body。

---

## 1. 目标

hover 左侧点位时，长列表 tooltip 不超出页面左侧；右侧空间不足时摆左，左侧不足时摆右；上下同理。

## 2. 改动范围

| 改 | 路径 |
|----|------|
| 改 | `E:\code\H5\src\pages\share\teacherProfile\chart-options\classroom-content-eval-chart.ts` → `buildClassroomContentEvalRadarOption` |

可选抽公共函数到同目录小文件（如 `tooltip-position.ts`），仅雷达引用即可。

**不改：** 圆环、分数趋势、布鲁姆、其它模块图。

## 3. 实现要点

```ts
position(point, _params, _dom, _rect, size) {
  const gap = 8
  const [px, py] = point
  const [tw, th] = size.contentSize
  const [vw, vh] = size.viewSize
  let x = px + gap
  let y = py + gap
  if (x + tw > vw) x = px - tw - gap
  if (x < 0) x = Math.max(0, vw - tw)
  if (y + th > vh) y = py - th - gap
  if (y < 0) y = Math.max(0, vh - th)
  return [x, y]
}
```

- 保留现有 `confine: false`、无 `appendTo`、换行/`max-width`
- A/B 共用同一 `buildClassroomContentEvalRadarOption`，改一处两端生效

## 4. 验收

- [x] 雷达左侧锚点：tooltip 不显著出屏左侧  
- [x] 右侧锚点：不显著出屏右侧  
- [x] 无 appendTo body；圆环等其它图无回归  

## 5. 样式

无 Figma；视觉不变，仅位置策略。
