# 原始需求：临时预览页面（校长驾驶舱 / 学科组长概览）

> 来源：用户口述（2026-10-16）
> 关联：[01-原始需求.md](01-原始需求.md)（概览顶部模块，已 DELIVERED）

顶部模块是按四种权限设计的业务组件，但当前只接入了自己负责的两个页面（年级长概览/备课组长概览），另外两个页面（校长驾驶舱、学科组长概览）由同事负责、尚未创建。为在全量权限场景下查看组件效果（尤其权限守卫、筛选组合、校长/学科组长卡片 variant），需要新建两个**临时预览页面**：

- `/principal-cockpit-2` 校长驾驶舱（`/principal-cockpit` 已被同事占位，不删不动，新路径拼 `-2`）
- `/subject-overview-2` 学科组长概览

**临时性质（用户明确）**：这两个页面后续接入同事页面时**要删掉**；`/principal-cockpit-2` 同名正式页由同事建在 `/principal-cockpit`。

## P1 方案要点

1. 两个页面与 grade-overview 同构：`DataPermissionGuard`（required 分别为 `campus` / `campus-stage-subject`）+ 顶部模块三组件，配置取 `OVERVIEW_PAGE_CONFIGS[页面权限]`
2. 路由注册 2 条（name `PrincipalCockpit2` / `SubjectOverview2`，meta 含 title 与 `dataPermission`）
3. `DEV_FALLBACK_RESOURCES`（DEV 菜单兜底，替换点 #3 同文件）追加两条，否则登录态下会被现有守卫重定向、菜单也不可见
4. 代码内统一 `TODO(1.7.1-临时预览):` 标记；文档写明删除清单与权限切换演示表
