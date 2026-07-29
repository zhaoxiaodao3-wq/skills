# 二维码分享组件 · 补充开发规格（加载 / 失败 / 重新生成）

**Requirement:** [requirements/02-补充-加载与失败态.md](../requirements/02-补充-加载与失败态.md)  
**前置 Spec:** [specs/01-dev-spec.md](./01-dev-spec.md)

> 方案（已确认 **A**）：打开弹窗即请求链接；链接只读；二维码区具备 loading / 失败 / 重新生成。

## 1. 目标

修订 `AppShareLink` 交互：

1. 点击按钮 → 打开弹窗 → **先请求**拿到 URL，再展示链接与二维码  
2. 链接**只读**（非可编辑 input）  
3. 二维码区：loading、失败态、「重新生成」

## 2. 状态机

| 状态 | 链接区 | 二维码区 | 复制按钮 |
|------|--------|----------|----------|
| `loading` | skeleton / v-loading | loading | disabled |
| `success` | 只读 URL 文本 | `QrcodeVue` | 可用 |
| `error` | 失败提示文案 | 失败提示 +「重新生成」 | disabled |

## 3. 改动文件

| 文件 | 改动 |
|------|------|
| `AppShareLink.vue` | 打开时必走拉取；状态 `idle/loading/success/error`；`regenerate` 再请求 |
| `AppShareLinkDialog.vue` | 接收 `status`；只读链接；二维码 loading/error/regen；emit `regenerate` |
| `constants.ts` | Mock 拉取延迟常量（可选） |

## 4. 行为细则

### 4.1 打开弹窗

1. `visible = true`，`status = loading`，清空已展示 URL（或占位「获取中…」）  
2. 调用 `resolveShareUrl?.()`；**未传入时**用内置 Mock：`delay` 后 resolve `SHARE_LINK_MOCK_URL`（模拟接口）  
3. 成功：`status = success`，写入只读 URL，渲染二维码  
4. 失败 / 空串：`status = error`

### 4.2 重新生成

- Dialog 内按钮触发 `emit('regenerate')`  
- 父组件再次执行与打开时相同的拉取逻辑  

### 4.3 链接只读

- 使用 `<p>` 或 `ElInput readonly`（推荐 `<p>`，避免误以为可编辑）  
- 禁止普通 `input` 可编辑态  

### 4.4 二维码

- `status === loading`：区域 `v-loading` 或居中 spinner  
- `status === success`：`QrcodeVue`  
- `status === error`：文案「二维码生成失败」+「重新生成」按钮  

## 5. 非目标

- 不实现真实后端 API path（仍由调用方传 `resolveShareUrl`）  
- 不强制挂业务页  

## 6. 验收

- [x] 打开弹窗先 loading，再出链接与二维码  
- [x] 链接不可编辑  
- [x] 模拟/真实失败时出现失败态与「重新生成」  
- [x] 重新生成会再次请求并刷新二维码  
