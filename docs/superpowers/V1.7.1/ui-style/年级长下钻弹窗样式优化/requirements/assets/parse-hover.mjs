import fs from 'node:fs'
const raw = JSON.parse(fs.readFileSync(
  'E:/code/frontend-local/docs/superpowers/V1.7.1/ui-style/年级长下钻弹窗样式优化/requirements/assets/figma-hover-raw.json',
  'utf8',
))
function hex(c) {
  if (!c) return null
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase()
  return '#' + h(c.r) + h(c.g) + h(c.b)
}
function walk(n, d) {
  const b = n.absoluteBoundingBox
  const fills = (n.fills || []).filter(f => f.visible !== false).map(f => f.color ? hex(f.color) : f.type + (f.opacity !== undefined ? ' op' + f.opacity : ''))
  const strokes = (n.strokes || []).filter(s => s.visible !== false).map(s => ({ c: s.color ? hex(s.color) : s.type, w: n.strokeWeight }))
  let t = ''
  if (n.type === 'TEXT') {
    const s = n.style || {}
    t = ' TEXT="' + n.characters + '" ' + s.fontSize + '/' + s.fontWeight + ' lh=' + s.lineHeightPx + ' fills=' + JSON.stringify((n.fills || []).filter(f => f.visible !== false).map(f => f.color ? hex(f.color) : f.type))
  }
  const cr = typeof n.cornerRadius === 'number' ? ' r=' + n.cornerRadius : ''
  const lay = n.layoutMode ? ' L=' + n.layoutMode + ' gap=' + n.itemSpacing + ' pad=' + n.paddingLeft + ',' + n.paddingRight + ',' + n.paddingTop + ',' + n.paddingBottom : ''
  const box = b ? ' [' + Math.round(b.width) + 'x' + Math.round(b.height) + ']' : ''
  console.log('  '.repeat(d) + '[' + n.type + '] ' + n.name + box + (fills.length ? ' fills=' + JSON.stringify(fills) : '') + (strokes.length ? ' strokes=' + JSON.stringify(strokes) : '') + cr + lay + t)
  if (n.children) n.children.forEach(c => walk(c, d + 1))
}
walk(raw.nodes['9913:57952'].document, 0)
