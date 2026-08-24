# figma-long-page 调用示例

## 整页还原

用户：

```text
用 figma-long-page / 长流程还原这个 Figma：
https://www.figma.com/design/vmbLwcwclGPoT3fWJWv7de/明犀?node-id=7487-12170
输出到 mingxi-report/，原生 HTML/CSS，不要动根目录 AirPods
```

Agent 应：拆帧 → 分段 get_design_context → 组装 → **精修关** → 本地 asset → 给预览 URL；未精修不说「做完」。

## 只做精修

用户：

```text
figma-long-page 精修 mingxi-report
```

Agent 应：读 reference.md Checklist，对照截图修 CSS/HTML，汇报仍偏差节号。

## 单节补做

用户：

```text
figma-long-page 只补第五节，node 7487:12841
```

Agent 应：对该节点（及子节点）拉 context，接入既有 token/组件，再对该节做精修对照。
