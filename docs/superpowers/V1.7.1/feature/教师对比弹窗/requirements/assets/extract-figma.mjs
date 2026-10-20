import fs from 'node:fs'

const assets = 'E:/code/frontend-local/docs/superpowers/V1.7.1/feature/教师对比弹窗/requirements/assets'
const raw = JSON.parse(fs.readFileSync(`${assets}/figma-nodes-raw.json`, 'utf8'))

function hex(c) {
  if (!c) return null
  const h = v => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase()
  return '#' + h(c.r) + h(c.g) + h(c.b) + (c.a !== undefined && c.a < 1 ? h(c.a) : '')
}

function fills(n) {
  if (!n.fills || !Array.isArray(n.fills)) return []
  return n.fills.filter(f => f.visible !== false).map(f => ({
    type: f.type,
    color: f.color ? hex(f.color) : undefined,
    opacity: f.opacity,
    stops: f.gradientStops ? f.gradientStops.map(s => ({ pos: s.position, c: hex(s.color) })) : undefined,
  }))
}

function strokes(n) {
  if (!n.strokes || !Array.isArray(n.strokes)) return []
  return n.strokes.filter(s => s.visible !== false).map(s => ({
    type: s.type,
    color: s.color ? hex(s.color) : undefined,
    weight: n.strokeWeight,
  }))
}

function outline(node, depth, lines) {
  const box = node.absoluteBoundingBox
    ? ` [${Math.round(node.absoluteBoundingBox.x)},${Math.round(node.absoluteBoundingBox.y)} ${Math.round(node.absoluteBoundingBox.width)}x${Math.round(node.absoluteBoundingBox.height)}]`
    : ''
  const f = fills(node)
  const s = strokes(node)
  const cr = node.cornerRadius !== undefined && typeof node.cornerRadius === 'number' ? ` r=${node.cornerRadius}` : ''
  const pad = node.paddingLeft !== undefined ? ` pad=${node.paddingLeft},${node.paddingRight},${node.paddingTop},${node.paddingBottom}` : ''
  const gap = node.itemSpacing !== undefined ? ` gap=${node.itemSpacing}` : ''
  const lay = node.layoutMode ? ` layout=${node.layoutMode}` : ''
  let t = ''
  if (node.type === 'TEXT') {
    t = ` TEXT="${node.characters}" ${node.style?.fontSize}px/${node.style?.fontWeight} ${JSON.stringify(fills(node))} lh=${node.style?.lineHeightPx}`
  }
  lines.push('  '.repeat(depth) + `[${node.type}] ${node.name}${box}${f.length ? ' fills=' + JSON.stringify(f) : ''}${s.length ? ' strokes=' + JSON.stringify(s) : ''}${cr}${pad}${gap}${lay}${t}`)
  if (node.children) node.children.forEach(c => outline(c, depth + 1, lines))
}

const lines = []
const root = raw.nodes['9913:52667'] || raw.nodes[Object.keys(raw.nodes)[0]]
console.log('ROOT_NAME', root.document.name, 'children', root.document.children?.length)
outline(root.document, 0, lines)
fs.writeFileSync(`${assets}/figma-outline.txt`, lines.join('\n'), 'utf8')
console.log('OUTLINE_LINES', lines.length)
console.log(lines.slice(0, 120).join('\n'))
