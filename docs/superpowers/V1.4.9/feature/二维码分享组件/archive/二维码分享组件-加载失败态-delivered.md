# 二维码分享组件 · 加载失败态补充交付归档

**归档类型：** feature 补充交付快照  
**归档日期：** 2026-07-17  
**版本：** V1.4.9  
**Requirement:** [../requirements/02-补充-加载与失败态.md](../requirements/02-补充-加载与失败态.md)  
**Spec:** [../specs/02-dev-spec.md](../specs/02-dev-spec.md)  
**Plan:** [../plans/02-dev-plan.md](../plans/02-dev-plan.md)

## 改动摘要

打开弹窗先请求分享链接（无接口则 Mock 延迟）；链接只读；二维码区支持 loading / 失败 / 重新生成。

## 改动文件

| 操作 | 路径 |
|------|------|
| 改 | `src/components/AppShareLink/AppShareLink.vue` |
| 改 | `src/components/AppShareLink/AppShareLinkDialog.vue` |
| 改 | `src/components/AppShareLink/constants.ts` |
| 改 | `src/components/AppShareLink/index.ts` |

## 验收结果

- [x] 先 loading 再展示链接与二维码  
- [x] 链接只读  
- [x] 失败态 + 重新生成  

未自动 commit。
