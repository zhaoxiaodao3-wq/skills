# 教师画像跨系统嵌入跳转 · 开发 Spec

**版本：** V1.7.1 · **日期：** 2026-10-20
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. Query 契约

```
{origin}/classroom-app/school/teacher-portrait/teacher-portrait?tenantUserId={id}&embed=1
```

| 参数 | 必填 | 语义 | 缺省 |
|---|---|---|---|
| `tenantUserId` | 推荐 | 画像教师 id，写入 `activeTeacherId`，驱动图表接口 | 回落 whoami 教师 |
| `embed` | 嵌入时必填 | 固定 `1`：隐藏全局菜单 + 页内左侧栏 | 不传 = 完整页 |

### embed=1 展示形态

| 区域 | 是否展示 |
|---|---|
| 全局菜单 / 顶栏（AppLayout） | ❌ |
| 页内左侧栏（教学小组/教师列表/我的信息） | ❌ |
| 教师画像卡 | ✅ |
| 右侧全部图表 | ✅ |

## 2. 目标工程 E:\code\frontend

| 文件 | 职责 |
|---|---|
| `src/pages/school/teacher-portrait/composables/useTeacherPortraitEmbed.ts` | 解析 query → `{ embed, tenantUserId }` |
| `src/pages/school/teacher-portrait/teacher-portrait/index.vue` | embed 锁定 id、`v-if` 隐藏 aside、缺参空态、`loadEmbedProfileBasics` |
| `src/layouts/default.vue` | 仅 `/teacher-portrait` 路径 + `embed=1` 时跳过 `AppLayout` |
| `composables/teacher-profile-basic.ts` | 新增 `fetchProfileBasicsByFacultyList`（姓名/性别/科目） |
| `components/teacher-portrait-card/TeacherPortraitCardContainer.vue` | profile 为空时回落 slice 字段 |
| `src/pages/school/teacher-portrait/EMBED.md` | 对外接入契约文档 |

### 关键实现口径

1. **layout 收敛：** `isEmbed = query.embed==='1' && path.includes('/teacher-portrait')`，其它路由误带 embed 不受影响。
2. **教师初始化：** `embed && tenantUserId` → 锁定 id + 补拉 profile；否则**原 whoami / 角色逻辑原样**。
3. **画像卡数据源：** 姓名/性别/科目/头像依赖 `ActiveTeacherProfile`（非 aggregate）；embed 只有 id，须 `facultyList` 补拉，否则卡片空、其它图表正常。
4. **页面留白：** `--embed` 类挂 `padding: var(--tp-page-padding)`，主区 `flex: 1`。

## 3. 来源工程 apps-development-platform

| 文件 | 职责 |
|---|---|
| `envs/.env.develop\|test\|master` | `VITE_TEACHER_PORTRAIT_URL` |
| `apps/data-board/src/utils/teacher-portrait-url.ts` | `buildTeacherPortraitUrl(tenantUserId)` |
| `teacher-detail-dialog.vue` / `.model.ts` | 【查看教师画像】`window.open`；`tenantUserId?` 入参；无 id 禁用 |
| `teacher-portrait-dialog/` | **已删除**（占位弹窗外链化后下线） |
| 调用方 | teacher-list / teacher-warning-list 传 id；report-list / weak-link / drill 行上暂无 id 则禁用 |

### 环境变量

| 文件 | 值 |
|---|---|
| `.env.develop` | `https://dev.mirayai.com:30443/classroom-app/school/teacher-portrait/teacher-portrait` |
| `.env.test` | `https://test.mirayai.com:31594/classroom-app/school/teacher-portrait/teacher-portrait` |
| `.env.master` | `/classroom-app/school/teacher-portrait/teacher-portrait`（同域相对路径） |

## 4. 鉴权

同域 `window.open` 共享 `localStorage` 登录态；跨域 iframe 不可用。

## 5. 边界

| 场景 | 行为 |
|---|---|
| 无 embed | 完整页，原功能不变 |
| embed 无 id | 隐藏侧栏；回落 whoami；仍无教师显示空态说明 |
| id 伪值 | 图表空态 |
| 缺 `VITE_TEACHER_PORTRAIT_URL` / id | helper 返回 `null`，入口禁用 |
