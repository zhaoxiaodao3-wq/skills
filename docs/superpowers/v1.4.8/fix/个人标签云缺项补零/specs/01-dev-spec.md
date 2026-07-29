# 个人标签云缺项补零 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 背景与目标

真实接口下，`personalTagCloud.tagCategories[].tags` 通常只含 count>0 的标签。前端 API 展示路径未按固定枚举补齐，导致模块内标签条数偏少，与 mock 原始需求不一致。

目标：API 路径与 Mock 路径一致——每个已返回模块内，固定枚举标签全部展示，缺失项 `count = 0`，排序规则不变。

## 2. 已确认方案

**方案 A：** 在 `PersonalTagCloudContainer.vue` 中，将 API 模块的 `tags[]` 转为 `counts: Record<label, number>`，再调用已有 `buildModuleTags(defs, counts)`（与 Mock 同源）。

- 枚举来源：`DISCOURSE_TAGS` / `EMOTION_TAGS` / `POWER_TAGS` / `SUBJECT_TAGS`
- 未知 label（不在枚举内）：忽略，不额外展示
- `rank`：以枚举定义为准（不信任后端 rank 做补齐基准）
- 排序：继续由 `buildModuleTags` → `sortTagItems`（count 降序，rank 升序）

## 3. 行为契约

对每个 `slice.modules` 项：

| type | 固定标签数 | 标题 |
|------|-----------|------|
| discourse | 9 | 沿用接口 `title`（经 `formatModuleTitle`） |
| emotion | 5 | 同上 |
| power | 5 | 同上 |
| subject | 4 | 同上（含多学科多模块） |

- 接口有值的标签：用接口 `count`
- 接口未返回的枚举标签：`count = 0`，仍展示
- 不因本需求强制插入后端完全未返回的分类模块
- 缺省态（无 teacher / 无 slice）逻辑不变

## 4. 非目标

- 不改后端契约、VO 类型
- 不改 Figma 样式 / 滚动规则
- 不要求整页缺分类时前端造出「话语/情感/权力」空模块（仍走现有 empty）

## 5. 涉及文件

- 改：`src/pages/school/teacher-portrait/components/personal-tag-cloud/PersonalTagCloudContainer.vue`
- 可选：抽 helper 到同目录小文件（非必须；以 Container 内改为最小）
- 测：若项目已有相关单测，可补一条「稀疏 tags → 补齐固定数量」；无则手工验收即可

## 6. 验收标准

- [x] API 路径下，话语特色固定 9 条、情感 5、权力 5、每学科适配 4 条（即使后端只回部分）
- [x] 缺项显示 `count === 0`，且参与排序（0 靠后，同级按 rank）
- [x] Mock 路径行为不变
- [x] 缺省态 / 未选教师行为不变
