# 教师风格画像 — OSS 英文命名对照表

> 版本：v1.4.8 | 模块：ui-style / 教师画像映射  
> 源文件目录：`C:\Users\YIL\Downloads\明睿开发稿 ·团队版`（已按本规范重命名）

## 命名规则

```
{styleA}__{styleB}__{gender}.png
```

| 规则 | 说明 |
|------|------|
| 风格 slug | 固定 5 种，见下表 |
| 风格顺序 | 两个 slug **按枚举顺序排列**（index 小的在前） |
| 性别 | `male` / `female` |
| 查图逻辑 | 接口返回「主导 + 辅助 + 性别」时，**顺序无关**，归一化后查同一张图 |
| OSS 路径 | `https://mirayai-iot-dev.oss-cn-shenzhen.aliyuncs.com/image/aiClassroom/aiAutonomousAnalysis/{filename}` |
| 高清 OSS 路径 | `https://mirayai-iot-dev.oss-cn-shenzhen.aliyuncs.com/image/aiClassroom/hd/{filename}` |

## 高清版上传

1. 本地重命名：`node scripts/rename-teacher-style-portraits.mjs "C:\Users\YIL\Downloads\明睿开发稿 ·团队版 (1)"`
2. 将 20 个英文文件名 PNG 上传至 OSS 目录：`image/aiClassroom/hd/`
3. 页面默认加载标清，后台预加载高清同名文件，成功则自动替换

## 菜单（后端配置）

前端路由：`/classroom-app/school/teacher-portrait/teacher-portrait`

| 字段 | 值 |
|------|-----|
| 一级菜单 `label` | 教师画像 |
| 二级菜单 `page` | 教师画像 |
| `href` | `school/teacher-portrait/teacher-portrait` |

## 风格 slug 对照

| 顺序 | 中文名称 | slug |
|------|----------|------|
| 1 | 温暖引导型 | `warm-guiding` |
| 2 | 理性启发型 | `rational-inspiring` |
| 3 | 激情讲授型 | `passionate-lecturing` |
| 4 | 权威传授型 | `authoritative-imparting` |
| 5 | 严厉规训型 | `strict-disciplining` |

## 性别对照

| 中文 | slug |
|------|------|
| 男 | `male` |
| 女 | `female` |

## 文件名对照（20 张）

| 原中文文件名 | OSS 英文文件名 | 风格组合（归一化） | 性别 |
|-------------|----------------|-------------------|------|
| 温暖引导型 × 理性启发型-男.png | `warm-guiding__rational-inspiring__male.png` | 温暖引导型 + 理性启发型 | 男 |
| 温暖引导型 × 理性启发型-女.png | `warm-guiding__rational-inspiring__female.png` | 温暖引导型 + 理性启发型 | 女 |
| 温暖引导型 × 激情讲授型-男.png | `warm-guiding__passionate-lecturing__male.png` | 温暖引导型 + 激情讲授型 | 男 |
| 温暖引导型 × 激情讲授型-女.png | `warm-guiding__passionate-lecturing__female.png` | 温暖引导型 + 激情讲授型 | 女 |
| 温暖引导型 × 权威传授型-男.png | `warm-guiding__authoritative-imparting__male.png` | 温暖引导型 + 权威传授型 | 男 |
| 温暖引导型 × 权威传授型-女.png | `warm-guiding__authoritative-imparting__female.png` | 温暖引导型 + 权威传授型 | 女 |
| 温暖引导型 × 严厉规训型-男.png | `warm-guiding__strict-disciplining__male.png` | 温暖引导型 + 严厉规训型 | 男 |
| 温暖引导型 × 严厉规训型-女.png | `warm-guiding__strict-disciplining__female.png` | 温暖引导型 + 严厉规训型 | 女 |
| 理性启发型 × 激情讲授型-男.png | `rational-inspiring__passionate-lecturing__male.png` | 理性启发型 + 激情讲授型 | 男 |
| 理性启发型 × 激情讲授型-女.png | `rational-inspiring__passionate-lecturing__female.png` | 理性启发型 + 激情讲授型 | 女 |
| 理性启发型 × 权威传授型-男.png | `rational-inspiring__authoritative-imparting__male.png` | 理性启发型 + 权威传授型 | 男 |
| 理性启发型 × 权威传授型-女.png | `rational-inspiring__authoritative-imparting__female.png` | 理性启发型 + 权威传授型 | 女 |
| 理性启发型 × 严厉规训型-男.png | `rational-inspiring__strict-disciplining__male.png` | 理性启发型 + 严厉规训型 | 男 |
| 理性启发型 × 严厉规训型-女.png | `rational-inspiring__strict-disciplining__female.png` | 理性启发型 + 严厉规训型 | 女 |
| 激情讲授型 × 权威传授型-男.png | `passionate-lecturing__authoritative-imparting__male.png` | 激情讲授型 + 权威传授型 | 男 |
| 激情讲授型 × 权威传授型-女.png | `passionate-lecturing__authoritative-imparting__female.png` | 激情讲授型 + 权威传授型 | 女 |
| 激情讲授型 × 严厉规训型-男.png | `passionate-lecturing__strict-disciplining__male.png` | 激情讲授型 + 严厉规训型 | 男 |
| 激情讲授型 × 严厉规训型-女.png | `passionate-lecturing__strict-disciplining__female.png` | 激情讲授型 + 严厉规训型 | 女 |
| 权威传授型 × 严厉规训型-男.png | `authoritative-imparting__strict-disciplining__male.png` | 权威传授型 + 严厉规训型 | 男 |
| 权威传授型 × 严厉规训型-女.png | `authoritative-imparting__strict-disciplining__female.png` | 权威传授型 + 严厉规训型 | 女 |

## 组合数说明

- 5 种风格中选 2 种（无序）：C(5,2) = **10** 组
- 每组 × 男/女：**20** 张
- 「A 主导 B 辅助」与「B 主导 A 辅助」共用同一张图

## 前端查图 key 示例

```
warm-guiding|passionate-lecturing|male
→ 标清：https://mirayai-iot-dev.oss-cn-shenzhen.aliyuncs.com/image/aiClassroom/aiAutonomousAnalysis/warm-guiding__passionate-lecturing__male.png
→ 高清：https://mirayai-iot-dev.oss-cn-shenzhen.aliyuncs.com/image/aiClassroom/hd/warm-guiding__passionate-lecturing__male.png
```

接口若返回主导=激情讲授型、辅助=温暖引导型、性别=男，归一化后 key 相同，仍指向 `warm-guiding__passionate-lecturing__male.png`。

## 别名（待接口确认后补充）

| 接口可能返回值 | 归一化为 |
|---------------|----------|
| 严厉规则型 | 严厉规训型 |
