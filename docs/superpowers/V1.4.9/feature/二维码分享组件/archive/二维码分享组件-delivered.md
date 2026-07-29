# 二维码分享组件 · 交付归档

**归档类型：** feature 交付快照  
**归档日期：** 2026-07-17  
**版本：** V1.4.9  
**Requirement:** [../requirements/01-原始需求.md](../requirements/01-原始需求.md)  
**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Plan:** [../plans/01-dev-plan.md](../plans/01-dev-plan.md)

## 改动摘要

新增全局可复用分享组件 `AppShareLink`：双样式按钮 + 弹窗（链接复制 / 二维码），Mock URL + 预留 `resolveShareUrl`；复用项目已有 `qrcode.vue`。

## 改动文件

| 操作 | 路径 |
|------|------|
| 增 | `src/components/AppShareLink/constants.ts` |
| 增 | `src/components/AppShareLink/useShareLinkCopy.ts` |
| 增 | `src/components/AppShareLink/AppShareLinkButton.vue` |
| 增 | `src/components/AppShareLink/AppShareLinkDialog.vue` |
| 增 | `src/components/AppShareLink/AppShareLink.vue` |
| 增 | `src/components/AppShareLink/index.ts` |

## 用法

```vue
import { AppShareLink } from '@/components/AppShareLink'

<AppShareLink variant="solid" />
<AppShareLink variant="ghost" :share-url="url" :resolve-share-url="fetchShareUrl" />
```

## 验收结果

- [x] 组件可全局引入  
- [x] solid / ghost、弹窗复制与二维码  
- [x] `vue-tsc` 无本模块新增错误  

## Harness 闭环

- [x] 开发前 validate  
- [x] archive 已写  
- [x] 交付后 validate  

未自动 commit。业务页接入另开需求。
