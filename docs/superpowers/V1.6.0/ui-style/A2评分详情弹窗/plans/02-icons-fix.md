# A2 评分详情弹窗 · 对/错图标补缺 · 实施计划

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)（§10 对/错图标补缺）
**Requirement:** [../requirements/02-对错图标补缺.md](../requirements/02-对错图标补缺.md)
**Figma:** `fileKey=vmbLwcwclGPoT3fWJWv7de` · `nodeId=8674:33290`
**档位:** 标准 | **模块:** `ui-style/A2评分详情弹窗`（DELIVERED 追加）

---

## Task 1 · 抽 Figma 真实对勾图标到公共目录

- **文件：** `src/icons/svg/check-circle.svg`（新建）
- **内容：** Figma `8674:33311` 真实 SVG，viewBox `0 0 20 20`，单 path + `fill-rule="evenodd"`，fill `#00B42A`
- **Skill 标注：** 纯资源落盘，无 skill 依赖

```svg
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.99916 3.14202C6.21207 3.14202 3.14202 6.21207 3.14202 9.99916C3.14202 13.7863 6.21207 16.8563 9.99916 16.8563C13.7863 16.8563 16.8563 13.7863 16.8563 9.99916C16.8563 6.21207 13.7863 3.14202 9.99916 3.14202ZM1.42773 9.99916C1.42773 5.26529 5.26529 1.42773 9.99916 1.42773C14.733 1.42773 18.5706 5.26529 18.5706 9.99916C18.5706 14.733 14.733 18.5706 9.99916 18.5706C5.26529 18.5706 1.42773 14.733 1.42773 9.99916ZM14.6767 7.81954L9.14202 13.3542L5.53593 9.74811L6.74811 8.53593L9.14202 10.9298L13.4645 6.60736L14.6767 7.81954Z" fill="#00B42A"/>
</svg>
```

- **验收：** SVG 文件存在，浏览器直接打开 20×20 居中显示绿色对勾

## Task 2 · 抽 Figma 真实叉号图标到公共目录

- **文件：** `src/icons/svg/close-circle.svg`（新建）
- **内容：** Figma `8674:33320` 真实 SVG，viewBox `0 0 20 20`，单 path + `fill-rule="evenodd"`，**fill `#FF2A2A`（修正当前 `#F53F3F`）**
- **Skill 标注：** 纯资源落盘，无 skill 依赖

```svg
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.99916 3.14202C6.21207 3.14202 3.14202 6.21207 3.14202 9.99916C3.14202 13.7863 6.21207 16.8563 9.99916 16.8563C13.7863 16.8563 16.8563 13.7863 16.8563 9.99916C16.8563 6.21207 13.7863 3.14202 9.99916 3.14202ZM1.42773 9.99916C1.42773 5.26529 5.26529 1.42773 9.99916 1.42773C14.733 1.42773 18.5706 5.26529 18.5706 9.99916C18.5706 14.733 14.733 18.5706 9.99916 18.5706C5.26529 18.5706 1.42773 14.733 1.42773 9.99916ZM8.78991 10.0021L6.66859 7.88078L7.88077 6.6686L10.0021 8.78992L12.1234 6.6686L13.3356 7.88078L11.2143 10.0021L13.3356 12.1234L12.1234 13.3356L10.0021 11.2143L7.88077 13.3356L6.66859 12.1234L8.78991 10.0021Z" fill="#FF2A2A"/>
</svg>
```

- **验收：** SVG 文件存在，浏览器直接打开 20×20 居中显示红色叉号

## Task 3 · dialog 改造：import + 替换 inline + 调 SCSS

- **文件：** `src/pages/analysis-web/ai-teaching-diagnosis/classroom-diagnosis/components/ReportA2ScoreDetailDialog.vue`
- **步骤：**
  1. `<script setup>` 顶部 import 两个 SVG URL 与 `SvgIcon` 组件：

     ```ts
     import SvgIcon from '@/components/SvgIcon/index.vue'
     import IconCheckCircle from '@/icons/svg/check-circle.svg'
     import IconCloseCircle from '@/icons/svg/close-circle.svg'
     ```

  2. 删除行 168-198 的 2 段 inline `<svg>`（结果列 20×20），替换为：

     ```vue
     <span class="comp-col-2">
       <SvgIcon v-if="row.resultKind === 'pass'" :src="IconCheckCircle" :size="20" />
       <SvgIcon v-else-if="row.resultKind === 'fail'" :src="IconCloseCircle" :size="20" />
       <span v-else class="cca-a2-score-detail-dialog__icon-dash">-</span>
     </span>
     ```

  3. 删除行 207-237 的 2 段 inline `<svg>`（判定徽章 14×14），替换为：

     ```vue
     <SvgIcon v-if="dimension.compensation.judgment.kind === 'pass'" :src="IconCheckCircle" :size="14" />
     <SvgIcon v-else :src="IconCloseCircle" :size="14" />
     ```

  4. 调整 SCSS：删除 `&__icon--pass` / `&__icon--fail` / `&__icon--sm` 类（行 685-694），保留 `&__icon` 容器（无需则一并删除）与 `&__icon-dash`

- **Skill 标注：** 无（前缀脚本 + 模板替换 + SCSS 微调，全在 dialog 单文件内）
- **验收：** dialog 在浏览器打开，「对」为绿圆单 path 勾，「错」为红圆单 path 叉；判定徽章为 14px 尺寸

## Task 4 · 一致性自检 + Lint

- **动作：**
  1. `pnpm lint` — 全量 lint 跑通
  2. 浏览器打开 A2 报告第十章 → 点击「查看详情」→ 弹窗展开
  3. 自检项：
     - 维度一补偿检查表「条件 ① / 条件 ② / 条件 ③」三行的检查结果列：① 绿对勾（20×20）、② 红叉（20×20）、③「-」短横
     - 「补偿生效 / 补偿不生效」判定徽章：绿对勾（14×14）/ 红叉（14×14）
     - 其它区域（顶栏、表头、表体、徽章、关闭 X）未变
- **Skill 标注：** 无

## Task 5 · 写 archive + harness:check

- **文件：** `docs/superpowers/V1.6.0/ui-style/A2评分详情弹窗/archive/A2-score-detail-dialog-icons-fix-delivered.md`（新建）
- **动作：**
  1. 按 `superpowers-harness-run` 模板写交付归档（含一致性自检 + 还原度自检 + Harness 闭环）
  2. `pnpm harness:check` — 无 SPEC_MISSING_FIGMA_STYLE_TABLE / ARCHIVE_MISSING_* 警告
  3. `pnpm harness:status -- --match "A2评分详情弹窗"` — 阶段 = `DELIVERED`
- **Skill 标注：** `superpowers-harness`（门禁 + validate）

---

## Skill 路由汇总（由 `node .agents/routing/router.mjs --annotate` 标注）

| Task | Skill 标注 | 置信度 | 必要性 |
|------|------------|--------|--------|
| Task 1 · check-circle.svg 落盘 | — | — | 纯资源，无 skill 依赖 |
| Task 2 · close-circle.svg 落盘 | — | — | 纯资源，无 skill 依赖 |
| Task 3 · dialog 改造 | — | — | 模板 + SCSS 微调，单文件，复杂度低 |
| Task 4 · Lint + 自检 | — | — | 跑命令 + 看页面 |
| Task 5 · archive + harness:check | `superpowers-harness` | 高 | 强制（流程门禁） |
