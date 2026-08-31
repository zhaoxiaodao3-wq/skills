# 教师画像并入分享 Registry · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**工程：** `E:\code\H5\`

## 1. 目标

轻并入：教师画像成为 Registry 中的独立 Variant/Family，路由与 Dev HTML 映射同源配置；**路径与分享内容冻结**。

## 2. Registry 登记（示意）

```ts
'teacher-profile': {
  id: 'teacher-profile',
  path: '/teacher-profile',
  name: 'TeacherProfile',
  family: 'teacher-profile',  // 扩展 ReportFamily
  template: 'teacherProfile',
  label: '教师画像',
  share: {
    title: '教师画像',
    desc: '教师画像分析报告',
    image: '…/teacher-profile.png', // 与 share-meta 现网常量相同
  },
}
```

- `ReportFamily` 增加 `'teacher-profile'`
- `ReportTemplateKey` 增加 `'teacherProfile'`
- `FAMILY_OG_HTML['teacher-profile']` → `/html/teacher-profile.html`
- **禁止**改成 `/analysis-teaching-*`

## 3. 路由

- `TEMPLATE_LOADERS.teacherProfile` → `teacherProfile/index.vue`
- `buildShareReportRoutes()` 已覆盖该 Variant 后，删除 `router/index.ts` 手写 TeacherProfile 条目
- `meta.reportVariantId` / `noAuth` 与现有一致；`meta.title` 用 label「教师画像」

## 4. Vite / OG

- middleware：仅从 registry（含 teacher-profile）生成 path→HTML，去掉写死的 `'/teacher-profile': ...`（若仍有特例注释说明已迁出）
- **不**把教师画像 OG 注入脚本混进 analysis-teaching 的 path 解析逻辑（画像静态 meta 已在 `teacher-profile.html`；根 `index.html` 原有教师画像兜底**保留不变**）
- 构建注入：可不对 `teacher-profile.html` 做 analysis 同款脚本注入（静态 meta 已完整），避免重复改写

## 5. Shell

- 页面继续 `useTeacherProfileShare`
- `share-meta.ts` 常量可改为从 registry 读取同值，或保持常量并加注释「须与 registry 一致」——优先 **registry 为源、share-meta re-export**，避免双源漂移；**字符串必须与线上一致**

## 6. 文档

更新 `docs/share-reports-overview.md` / `share-reports-architecture.md`：教师画像为独立 Family；链接格式 `/teacher-profile?code=`（兼容 `token`）

## 7. 验收

- [x] registry 含 teacher-profile；路由仅由 buildShareReportRoutes 提供
- [x] Vite 访问 `/teacher-profile` 仍落到 `teacher-profile.html`
- [x] 分享 title/desc/image 与改前一致
- [x] 概要文档已写明两套 URL 规则
- [x] 未改画像业务面板与失效分级语义
