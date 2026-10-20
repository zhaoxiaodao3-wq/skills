import fs from 'node:fs'
const raw = JSON.parse(fs.readFileSync(
  'E:/code/frontend-local/docs/superpowers/V1.7.1/feature/教师列表二级页/requirements/assets/figma-nodes-raw.json',
  'utf8',
))
function hex(c) {
  if (!c) return null
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase()
  return '#' + h(c.r) + h(c.g) + h(c.b)
}
function walk(n, d, out) {
  const b = n.absoluteBoundingBox
  const fills = (n.fills || []).filter(f => f.visible !== false).map(f => f.color ? hex(f.color) : f.type)
  const strokes = (n.strokes || []).filter(s => s.visible !== false).map(s => ({ c: s.color ? hex(s.color) : s.type, w: n.strokeWeight }))
  let t = ''
  if (n.type === 'TEXT') {
    const s = n.style || {}
    t = ' TEXT="' + (n.characters || '').slice(0, 100) + '" ' + s.fontSize + '/' + s.fontWeight
  }
  const cr = typeof n.cornerRadius === 'number' ? ' r=' + n.cornerRadius : ''
  const box = b ? ' [' + Math.round(b.x) + ',' + Math.round(b.y) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height) + ']' : ''
  const lay = n.layoutMode ? ' L=' + n.layoutMode + ' gap=' + n.itemSpacing + ' pad=' + n.paddingLeft + ',' + n.paddingRight + ',' + n.paddingTop + ',' + n.paddingBottom : ''
  if (d <= 5 || n.type === 'TEXT' || (b && b.width > 80 && b.height > 16)) {
    out.push('  '.repeat(d) + '[' + n.type + '] ' + n.name + box + (fills.length ? ' fills=' + JSON.stringify(fills) : '') + (strokes.length ? ' strokes=' + JSON.stringify(strokes) : '') + cr + lay + t)
  }
  if (n.children && d < 14) n.children.forEach(c => walk(c, d + 1, out))
}
const out = []
walk(raw.nodes['9913:50219'].document, 0, out)
fs.writeFileSync(
  'E:/code/frontend-local/docs/superpowers/V1.7.1/feature/教师列表二级页/requirements/assets/figma-outline.txt',
  out.join('\n'),
  'utf8',
)
console.log(out.slice(0, 120).join('\n'))
console.log('TOTAL', out.length)
