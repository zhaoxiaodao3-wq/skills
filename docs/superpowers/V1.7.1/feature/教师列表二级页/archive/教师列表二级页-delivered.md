# 教师列表二级页 · 交付归档

**归档类型：** feature 交付快照
**归档日期：** 2026-10-19
**版本：** V1.7.1
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)
**代码仓库：** `apps-development-platform` · **未 commit**

## 改动摘要

新增四权限共用的教师列表二级页 `/teacher-list`：筛选（姓名/年级/科目/性别/双范围，无等级）+ 查询重置、排序胶囊 ↓/↑、多选对比空壳、分页表格与教师详情联动；mock 接口 #17/#18；按 Figma `9913:50219` 二次定制 EP。样式精修对齐设计稿（表 16px、分页居中、返回 SVG、数字框插槽三角）；二级页保持来源一级菜单高亮（`query.from`）。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `apps/data-board/src/views/teacher-list/*`（vue/scss/data/model/README） |
| 增 | `apps/data-board/src/assets/icons/arrow-left.svg`（Figma `direction/left`） |
| 改 | `apps/data-board/src/router/index.ts`（`/teacher-list` + `secondaryPage`） |
| 改 | `apps/data-board/src/api/overview.ts`（#17/#18 mock） |
| 改 | `apps/data-board/src/components/overview-nav/overview-nav.vue`（跳转带 `from`） |
| 改 | `apps/data-board/src/components/app-navigation/app-navigation.vue`（二级页用 `from` 保持高亮） |

## 验收结果

- [x] 入口锁定矩阵；无等级筛选
- [x] 查询/重置/范围补全
- [x] 排序默认无箭头；评分/达标率首次↓再点↑
- [x] 勾选跨页、上限 10、<2 提示；对比空壳
- [x] 详情：人+校区+学期
- [x] 分页 20 居中；等级分布/均分一位小数
- [x] 样式对齐设计稿；数字框 `decrease/increase-icon` 插槽小三角；返回 Figma SVG
- [x] 进入二级页不取消一级菜单选中
- [x] vue-tsc / stylelint 0

## 一致性自检

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 空态 vs 有数据 | 通过 | el-table 空态；筛选无结果 total 0 |
| 常量/mock/真数据 | 通过 | 九科/年级/性别 mock 单点；`TODO` #17/#18 |
| 多入口 | 通过 | 四 permissionType 锁定矩阵；`from` 保持菜单高亮 |
| 失败/缺省 | 通过 | 双范围只填一侧补 0/100；query 缺省默认文案 |

## 还原度自检

**适用**（`9913:50219`）。

- 对照：REST + 2x 渲染图 token → scss；返回箭头节点导出 SVG
- 偏差：1）对比弹窗空壳（待设计稿）2）筛选折行随视口 3）均分无 %（用户确认）4）等级分布 mock 个别行色映射按四色固定（稿中 mock 示意有偏差）
- 结论：可交付

## 交付后修订（2026-10-19）

1. 样式精修：表头/正文 16px、列宽、操作列 128、分页 32 方块间距 8  
2. 数字范围框：EP `#decrease-icon`/`#increase-icon` 插槽画小三角；禁用态不改色  
3. 返回箭头：Figma 导出 `arrow-left.svg`，静态 import  
4. 二级页菜单：`query.from` + `meta.secondaryPage`，保持来源一级高亮  

## Harness 闭环

- [x] 四层文档齐全
- [x] P1 / P2（spec OK）/ P3（Inline）已确认
- [x] 验收勾选 + A/B 自检 + archive
- [x] 未 commit
