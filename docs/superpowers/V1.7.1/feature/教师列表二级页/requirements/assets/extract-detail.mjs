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
function walk(n, d, out, maxD) {
  const b = n.absoluteBoundingBox
  const fills = (n.fills || []).filter(f => f.visible !== false).map(f => f.color ? hex(f.color) : f.type)
  const strokes = (n.strokes || []).filter(s => s.visible !== false).map(s => ({ c: s.color ? hex(s.color) : s.type, w: n.strokeWeight }))
  let t = ''
  if (n.type === 'TEXT') {
    const s = n.style || {}
    t = ' TEXT="' + (n.characters || '').slice(0, 60) + '" ' + s.fontSize + '/' + s.fontWeight
  }
  const cr = typeof n.cornerRadius === 'number' ? ' r=' + n.cornerRadius : ''
  const box = b ? ' [' + Math.round(b.x) + ',' + Math.round(b.y) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height) + ']' : ''
  const lay = n.layoutMode ? ' L=' + n.layoutMode + ' gap=' + n.itemSpacing + ' pad=' + n.paddingLeft + ',' + n.paddingRight + ',' + n.paddingTop + ',' + n.paddingBottom : ''
  if (d <= maxD) {
    out.push('  '.repeat(d) + '[' + n.type + '] ' + n.name + box + (fills.length ? ' fills=' + JSON.stringify(fills) : '') + (strokes.length ? ' strokes=' + JSON.stringify(strokes) : '') + cr + lay + t)
  }
  if (n.children && d < maxD + 2) n.children.forEach(c => walk(c, d + 1, out, maxD))
}
const root = raw.nodes['9913:50219'].document
const out = []
// main content frame Frame 1940700344
function find(n, pred) {
  if (pred(n)) return n
  if (n.children) {
    for (const c of n.children) {
      const r = find(c, pred)
      if (r) return r
    }
  }
  return null
}
const main = find(root, n => n.name === 'Frame 1940700344')
if (main) walk(main, 0, out, 6)
// also dump header bar area title
const headerish = find(root, n => n.type === 'TEXT' && (n.characters || '').includes('教师列表'))
if (headerish) {
  out.push('--- TITLE ---')
  walk(headerish.parent || headerish, 0, out, 4)
}
// sort tabs detail
const sortTabs = find(root, n => n.name === 'Frame 1427325699' && n.absoluteBoundingBox && n.absoluteBoundingBox.width > 200 && n.absoluteBoundingBox.width < 400)
if (sortTabs) {
  out.push('--- SORT ---')
  walk(sortTabs, 0, out, 5)
}
// table header row
const table = find(root, n => n.name.includes('Table') || (n.absoluteBoundingBox && n.absoluteBoundingBox.width > 1500 && n.absoluteBoundingBox.height > 400 && n.absoluteBoundingBox.height < 800))
if (table) {
  out.push('--- TABLE ---')
  walk(table, 0, out, 3)
}
console.log(out.join('\n'))
fs.writeFileSync(
  'E:/code/frontend-local/docs/superpowers/V1.7.1/feature/教师列表二级页/requirements/assets/figma-detail-outline.txt',
  out.join('\n'),
  'utf8',
)
