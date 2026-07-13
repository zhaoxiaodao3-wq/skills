---
name: api-ui-mapping
description: 系统性梳理 UI 与 API 接口的极致精准映射关系，确保 100% 溯源。
---

# API-UI 极致精准映射 (Absolute Precision Mapping)

本 Skill 用于对复杂前端页面进行深度解析，建立从 UI 视觉区域到后端 API 字段的 **100% 绝对映射**。该方法论起源于“AI教学诊断分析”项目的梳理经验，旨在消除文档中的省略号（...）和模糊表述。

## 适用场景
- 复杂数据大屏或分析页面。
- 涉及多接口、多静态 JSON 资源驱动的 UI。
- 需要将每一个图标、属性、曲线无歧义溯源至具体的后端字段。

## 操作步骤

### 第一步：入口与路由分析 (Entry Point)
1. **定位主组件**：找到页面对应的 `.vue` 或 `.tsx` 文件。
2. **解析路由逻辑**：检查 `useRoute` 或 `computed` 中的菜单逻辑，识别页面层级。
3. **识别资源类型**：确认页面是否存在不同的渲染模式（如 resourceType=1 或 2），并在文档中明确区分。

### 第二步：层级化维度分解 (Hierarchy)
按照以下四级或五级结构进行梳理：
1. **顶级菜单 (Menu)**：导航栏显示的名称。
2. **子页签 (Tab)**：页面内部的切换项。
3. **功能区域 (Area)**：Tab 内部的具体卡片、图表、统计块。
4. **数据源 (Data Source)**：对应的后端接口别名（如 API 1, API 2）。
5. **绝对路径字段 (Full Path)**：在 JSON 中的完整 Key Path。

### 第三步：数据源深度探测 (Discovery)
1. **扫描服务层**：查看 `src/service/` 或 `composables/`，提取出真实的接口路径。
2. **提取字段定义**：通过接口返回的 TypeScript `type` 或真实的 `mock/json` 文件，锁定每一项数据的母体。
3. **识别媒体资源**：特别注意视频 (mp4)、音频 (mp3)、文档 (pdf/ppt) 的 URL 获取字段。

### 第四步：绝对化路径映射 (Absolute Mapping)
**原则：文档中禁止出现省略号 `...`。**
- **错误示范**：`analysis_result...v2_json.summary`
- **正确示范**：`analysis_result_teacher_edition_v2_json.summary.teacher_teach_analysis.summary_text`
- **图表点位**：必须明确到具体的点位路径，例如 `plotData.fiasLabels.points`。

### 第五步：动作链接梳理 (Action & Linkage)
1. **识别交互点**：找到所有的 [保存]、[更新]、[删除]、[预览] 按钮。
2. **映射触发接口**：关联到具体的 `POST` 或 `GET` 请求。
3. **明确参数来源**：备注参数（如 `id`, `fileUrl`）是从哪个字段取的。

## 文档输出模板

建议采用 Markdown 表格形式：

| 子页签 (Tab) | 功能区域 (Area) | 接口路径 & 精确字段 (Full Path) |
| :--- | :--- | :--- |
| **[模块名]** | **[具体 UI 区域]** | **[接口别名]** -> `[json.full.path.key]` |
| ... | ... | ... |

---
**核心要求**：完成后的文档必须支持“无需阅读代码即可直接调用后端字段进行功能开发”的精确度。
