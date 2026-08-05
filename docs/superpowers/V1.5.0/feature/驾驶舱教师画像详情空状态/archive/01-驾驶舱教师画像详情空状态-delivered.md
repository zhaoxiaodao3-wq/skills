# 驾驶舱教师画像详情空状态 · 交付快照

**模块：** feature/驾驶舱教师画像详情空状态  
**实现仓：** data-cockpit `mr-teacher-portrait/detail`  
**对照：** 校端 `frontend/src/pages/school/teacher-portrait` 组件内建空态

## 交付摘要

1. `useDetailProfile.forceEmptyPreview`：DEV 开关短路到各 empty builder。  
2. `detail/index.vue`：DEV「有数据 / 空状态」开关；`raw || forceEmptyPreview` 可渲染整页。  
3. 去掉分析面板整卡 `TpEmptyState` 插画；空态保留布局并用图表骨架（对齐校端）。  
4. 补全 empty builder 占位：A/B 雷达维度、标签云四模块 count=0。

## 一致性自检

| 检查项 | 结果 | 证据（路径或说明） |
|--------|------|-------------------|
| 空态 vs 有数据 | 通过 | DEV 开关切换 `forceEmptyPreview`；各 panel 消费 `isEmpty`/`isDefaultEmpty` 走 chart-options 骨架 |
| 常量/mock/真数据 | 通过 | empty builders 在 `use-detail-profile.ts`；真数据仍走 adapter |
| 多入口 | N/A | 仅详情预览页 |
| 失败/缺省 | 通过 | loading/error 在非 emptyPreview 时优先；emptyPreview 可绕过无 raw |

## 还原度自检

不适用：无 Figma / 非 UI（行为对齐校端缺省态，非整卡插画）

## 验收勾选

- [x] 切「空状态」后各卡为组件内建空态（骨架/占位），非整卡插画  
- [x] 切「有数据」恢复接口数据路径  
- [x] DEV 可见开关；生产 `import.meta.env.DEV` 不可见  
- [x] 列表页开关样式复用不受影响  
