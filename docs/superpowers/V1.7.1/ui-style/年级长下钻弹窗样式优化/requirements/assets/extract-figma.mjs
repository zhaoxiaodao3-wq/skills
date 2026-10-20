import fs from 'node:fs'

const raw = JSON.parse(fs.readFileSync(
  'E:/code/frontend-local/docs/superpowers/V1.7.1/ui-style/年级长下钻弹窗样式优化/requirements/assets/figma-nodes-raw.json',
  'utf8',
))

function hex(c) {
  if (!c) return null
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase()
  return '#' + h(c.r) + h(c.g) + h(c.b) + (c.a !== undefined && c.a < 1 ? h(c.a) : '')
}

function fills(node) {
  if (!node.fills || !Array.isArray(node.fills)) return []
  return node.fills.filter(f => f.visible !== false).map(f => ({
    type: f.type,
    color: f.color ? hex(f.color) : undefined,
    opacity: f.opacity,
    stops: f.gradientStops
      ? f.gradientStops.map(s => ({ pos: s.position, c: hex(s.color) }))
      : undefined,
  }))
}

function strokes(node) {
  if (!node.strokes || !Array.isArray(node.strokes)) return []
  return node.strokes.filter(s => s.visible !== false).map(s => ({
    type: s.type,
    color: s.color ? hex(s.color) : undefined,
    weight: node.strokeWeight,
  }))
}

function textInfo(node) {
  if (node.type !== 'TEXT') return null
  const style = node.style || {}
  let chars = node.characters
  if (chars && chars.length > 120) chars = chars.slice(0, 120) + '…'
  return {
    chars,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeightPx,
    letterSpacing: style.letterSpacing,
    textAlign: style.textAlignHorizontal,
    fills: fills(node),
  }
}

function walk(node, path, out, depth) {
  const info = {
    id: node.id,
    name: node.name,
    type: node.type,
    path,
    box: node.absoluteBoundingBox
      ? {
          x: Math.round(node.absoluteBoundingBox.x),
          y: Math.round(node.absoluteBoundingBox.y),
          w: Math.round(node.absoluteBoundingBox.width),
          h: Math.round(node.absoluteBoundingBox.height),
        }
      : undefined,
    fills: fills(node).length ? fills(node) : undefined,
    strokes: strokes(node).length ? strokes(node) : undefined,
    cornerRadius:
      node.cornerRadius !== undefined && typeof node.cornerRadius === 'number'
        ? node.cornerRadius
        : node.topLeftRadius !== undefined
          ? { tl: node.topLeftRadius, tr: node.topRightRadius, br: node.bottomRightRadius, bl: node.bottomLeftRadius }
          : undefined,
    opacity: node.opacity !== undefined && node.opacity !== 1 ? node.opacity : undefined,
    layoutMode: node.layoutMode,
    itemSpacing: node.itemSpacing,
    padding:
      node.paddingLeft !== undefined
        ? { l: node.paddingLeft, r: node.paddingRight, t: node.paddingTop, b: node.paddingBottom }
        : undefined,
    text: textInfo(node),
  }
  const interesting =
    info.fills || info.strokes || info.text || info.cornerRadius !== undefined || (info.box && info.box.w > 0)
  if (interesting) out.push(info)
  if (node.children && depth < 40) {
    node.children.forEach((c, i) => walk(c, path + '/' + node.name + '#' + i, out, depth + 1))
  }
}

const all = []
walk(raw.nodes['9913:57744'].document, 'main', all, 0)
walk(raw.nodes['9913:58229'].document, 'level', all, 0)
walk(raw.nodes['9913:58230'].document, 'score', all, 0)

const keywords = [
  '等级分布', '报告评分', '分页', 'pagination', '分数趋势', '等级趋势', '趋势',
  'Ellipse', '轨道', 'tab', 'Tab', 'switch', 'Switch', '坐标', 'axis', 'Axis',
  '第1周', '优秀', '良好', '合格', '待改进', '共', '前往', 'pager', 'grade',
  'Grade', 'badge', 'Badge', 'pill', 'Pill', 'chip', 'Chip', '分布', '评分',
  '上課', '上课', '报告', '趋势图', 'Line', 'Chart', 'chart', 'legend', 'Legend',
  'yAxis', 'xAxis', 'grid', 'Grid', 'num', 'Num', 'label', 'Label',
]

const hits = all.filter((n) => {
  const s = (n.name || '') + (n.text && n.text.chars ? n.text.chars : '')
  return keywords.some(k => s.includes(k))
})

console.log('TOTAL', all.length, 'hits', hits.length)
for (const h of hits) {
  const parts = [`[${h.type}]`, h.path + '/' + h.name]
  if (h.box) parts.push(`[${h.box.x},${h.box.y} ${h.box.w}x${h.box.h}]`)
  if (h.fills) parts.push('fills=' + JSON.stringify(h.fills))
  if (h.strokes) parts.push('strokes=' + JSON.stringify(h.strokes))
  if (h.cornerRadius !== undefined) parts.push('r=' + JSON.stringify(h.cornerRadius))
  if (h.padding) parts.push('pad=' + JSON.stringify(h.padding))
  if (h.itemSpacing !== undefined) parts.push('gap=' + h.itemSpacing)
  if (h.layoutMode) parts.push('layout=' + h.layoutMode)
  if (h.opacity !== undefined) parts.push('op=' + h.opacity)
  if (h.text) {
    parts.push(
      `TEXT="${h.text.chars}" ${h.text.fontSize}px/${h.text.fontWeight} fills=${JSON.stringify(h.text.fills)} lh=${h.text.lineHeight} ls=${JSON.stringify(h.text.letterSpacing)} align=${h.text.textAlign}`,
    )
  }
  console.log(parts.join(' '))
}

// Also dump full outline of score trend chart area and level trend chart area to a file
function outline(node, depth, lines) {
  const box = node.absoluteBoundingBox
    ? ` [${Math.round(node.absoluteBoundingBox.x)},${Math.round(node.absoluteBoundingBox.y)} ${Math.round(node.absoluteBoundingBox.width)}x${Math.round(node.absoluteBoundingBox.height)}]`
    : ''
  const f = fills(node)
  const s = strokes(node)
  const cr = node.cornerRadius !== undefined && typeof node.cornerRadius === 'number' ? ` r=${node.cornerRadius}` : ''
  let t = ''
  if (node.type === 'TEXT') {
    t = ` TEXT="${node.characters}" ${node.style?.fontSize}px/${node.style?.fontWeight} ${JSON.stringify(fills(node))}`
  }
  lines.push(
    '  '.repeat(depth) + `[${node.type}] ${node.name}${box}${f.length ? ' fills=' + JSON.stringify(f) : ''}${s.length ? ' strokes=' + JSON.stringify(s) : ''}${cr}${t}`,
  )
  if (node.children) node.children.forEach(c => outline(c, depth + 1, lines))
}

const outlineLines = []
outlineLines.push('=== MAIN 9913:57744 ===')
outline(raw.nodes['9913:57744'].document, 0, outlineLines)
outlineLines.push('')
outlineLines.push('=== LEVEL TREND 9913:58229 ===')
outline(raw.nodes['9913:58229'].document, 0, outlineLines)
outlineLines.push('')
outlineLines.push('=== SCORE TREND 9913:58230 ===')
outline(raw.nodes['9913:58230'].document, 0, outlineLines)
fs.writeFileSync(
  'E:/code/frontend-local/docs/superpowers/V1.7.1/ui-style/年级长下钻弹窗样式优化/requirements/assets/figma-outline.txt',
  outlineLines.join('\n'),
  'utf8',
)
console.log('OUTLINE_SAVED', outlineLines.length, 'lines')
