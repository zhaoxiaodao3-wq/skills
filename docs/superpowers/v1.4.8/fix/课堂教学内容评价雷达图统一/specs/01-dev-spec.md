# 课堂教学内容评价雷达图统一 · 开发规格

**Requirement:** [requirements/01-原始需求.md](../requirements/01-原始需求.md)

## 1. 目标

`buildEmptyViewModel()` 中空状态雷达图维度与有数据态完全一致，A/B 类各自独立。

## 2. 改动

### 2.1 A 类空状态维度

```ts
const emptyDimensionsA = [
  { name: '教案落实度', score: 0, maxScore: 20, scoreText: '0' },
  { name: '思维启发度', score: 0, maxScore: 25, scoreText: '0' },
  { name: '难点突破度', score: 0, maxScore: 25, scoreText: '0' },
  { name: '练习有效度', score: 0, maxScore: 15, scoreText: '0' },
  { name: '小结完整度', score: 0, maxScore: 5, scoreText: '0' },
  { name: '节奏合理度', score: 0, maxScore: 10, scoreText: '0' },
]
```

### 2.2 B 类空状态维度

```ts
const emptyDimensionsB = [
  { name: '知识落实度', score: 0, maxScore: 25, scoreText: '0' },
  { name: '思维启发度', score: 0, maxScore: 20, scoreText: '0' },
  { name: '学生参与度', score: 0, maxScore: 15, scoreText: '0' },
  { name: '逻辑清晰度', score: 0, maxScore: 15, scoreText: '0' },
  { name: '练习与反馈有效性', score: 0, maxScore: 15, scoreText: '0' },
  { name: '节奏把控度', score: 0, maxScore: 10, scoreText: '0' },
]
```

### 2.3 buildEmptyViewModel 返回

```ts
return {
  ...
  dimensionsA: emptyDimensionsA,
  dimensionsB: emptyDimensionsB,
}
```

## 3. 不在范围

- 不改变有数据时的维度数据流（`mapDimensions`）
- 不改变 View 层模板和样式
- 不改变 radar 的 RADAR_AXIS_DIMENSION_INDEX 映射
