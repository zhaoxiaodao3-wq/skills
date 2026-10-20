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
  }))
}
function strokes(node) {
  if (!node.strokes || !Array.isArray(node.strokes)) return []
  return node.strokes.filter(s => s.visible !== false).map(s => ({
    color: s.color ? hex(s.color) : undefined,
    weight: node.strokeWeight,
  }))
}
function dump(node, depth, maxDepth) {
  const box = node.absoluteBoundingBox
    ? ` [${Math.round(node.absoluteBoundingBox.x)},${Math.round(node.absoluteBoundingBox.y)} ${Math.round(node.absoluteBoundingBox.width)}x${Math.round(node.absoluteBoundingBox.height)}]`
    : ''
  const f = fills(node)
  const s = strokes(node)
  const cr = typeof node.cornerRadius === 'number' ? ` r=${node.cornerRadius}` : ''
  let t = ''
  if (node.type === 'TEXT') {
    t = ` TEXT="${node.characters}" ${node.style?.fontSize}px/${node.style?.fontWeight} ${JSON.stringify(fills(node))}`
  }
  console.log('  '.repeat(depth) + `[${node.type}] ${node.name}${box}${f.length ? ' fills=' + JSON.stringify(f) : ''}${s.length ? ' strokes=' + JSON.stringify(s) : ''}${cr}${t}`)
  if (node.children && depth < maxDepth) node.children.forEach(c => dump(c, depth + 1, maxDepth))
}

const main = raw.nodes['9913:57744'].document
const level = raw.nodes['9913:58229'].document

function findByName(node, pred, path = []) {
  const hits = []
  if (pred(node, path)) hits.push({ node, path })
  if (node.children) {
    for (const c of node.children) hits.push(...findByName(c, pred, [...path, node.name]))
  }
  return hits
}

console.log('===== 1) 等级分布第一行完整子树 =====')
const gradeRow = findByName(main, n => n.name === 'Frame 1940700350')[0]
if (gradeRow) dump(gradeRow.node, 0, 8)

console.log('\n===== 2) 分页完整子树 =====')
const pag = findByName(main, n => n.name === 'pagination' && n.type === 'FRAME')[0]
if (pag) dump(pag.node, 0, 8)

console.log('\n===== 3) 趋势切换完整子树（main） =====')
const tabs = findByName(main, n => n.name === 'Frame 1427325699' && Math.round(n.absoluteBoundingBox?.width || 0) === 198)[0]
if (tabs) dump(tabs.node, 0, 8)

console.log('\n===== 4) 报告列表第一数据行（含报告评分/等级） =====')
// find first row Frame 1427325673 under reports table
const reportRows = findByName(main, n => n.name === 'Frame 1427325673')
// pick one near y=940
for (const r of reportRows) {
  const y = r.node.absoluteBoundingBox?.y
  if (y && y > 930 && y < 960) {
    dump(r.node, 0, 6)
    break
  }
}

console.log('\n===== 5) 任教组合第一行等级分布单元 =====')
const teacherRows = findByName(main, n => n.name === 'Frame 1427325673')
for (const r of teacherRows) {
  const y = r.node.absoluteBoundingBox?.y
  if (y && y > 340 && y < 370) {
    dump(r.node, 0, 7)
    break
  }
}

console.log('\n===== 6) 图表网格/线 关键节点（main 分数趋势卡） =====')
const chartCard = findByName(main, n => n.name === 'Frame 1940698628' && Math.round(n.absoluteBoundingBox?.width || 0) === 920)[0]
if (chartCard) {
  // dump only first 3 levels
  dump(chartCard.node, 0, 3)
  // find path-like nodes
  const vectors = findByName(chartCard.node, n => n.type === 'VECTOR' || n.type === 'LINE' || n.name.includes('Line') || n.name.includes('path') || n.name.includes('Ellipse'))
  console.log('-- vectors/lines/ellipses --')
  for (const v of vectors.slice(0, 30)) {
    const n = v.node
    const box = n.absoluteBoundingBox
    console.log(`[${n.type}] ${n.name} box=${box ? Math.round(box.x)+','+Math.round(box.y)+' '+Math.round(box.width)+'x'+Math.round(box.height) : '-'} fills=${JSON.stringify(fills(n))} strokes=${JSON.stringify(strokes(n))}`)
  }
  // y axis labels and x axis labels already known; find stroke colors of grid frames
  const gridFrames = findByName(chartCard.node, n => n.name.startsWith('Frame 19406988'))
  console.log('-- grid frames --')
  for (const g of gridFrames.slice(0, 20)) {
    const n = g.node
    const box = n.absoluteBoundingBox
    console.log(`${n.name} box=${box ? Math.round(box.x)+','+Math.round(box.y)+' '+Math.round(box.width)+'x'+Math.round(box.height) : '-'} fills=${JSON.stringify(fills(n))} strokes=${JSON.stringify(strokes(n))} children=${(n.children||[]).length}`)
  }
}

console.log('\n===== 7) 等级趋势图 9913:58229 图表卡 =====')
const levelChart = findByName(level, n => n.name === 'Frame 1940698628' && Math.round(n.absoluteBoundingBox?.width || 0) === 920)[0]
if (levelChart) {
  dump(levelChart.node, 0, 4)
  const vectors = findByName(levelChart.node, n => n.type === 'VECTOR' || n.type === 'LINE' || n.name.includes('Line') || n.name.includes('Ellipse'))
  console.log('-- vectors --')
  for (const v of vectors.slice(0, 30)) {
    const n = v.node
    const box = n.absoluteBoundingBox
    console.log(`[${n.type}] ${n.name} box=${box ? Math.round(box.x)+','+Math.round(box.y)+' '+Math.round(box.width)+'x'+Math.round(box.height) : '-'} fills=${JSON.stringify(fills(n))} strokes=${JSON.stringify(strokes(n))}`)
  }
}

console.log('\n===== 8) 报告评分单元格搜索（TEXT 含纯数字 + 父级 fills） =====')
// find all TEXT under main that are pure numbers near report table
const allText = findByName(main, n => n.type === 'TEXT')
for (const t of allText) {
  const chars = t.node.characters
  if (/^\d+(\.\d+)?$/.test(chars) && t.node.absoluteBoundingBox?.y > 930 && t.node.absoluteBoundingBox?.y < 1320) {
    // walk parent chain fills
    // We don't have parent pointers; search children of rows
  }
}
// better: dump one full report row columns
const reportRow = findByName(main, n => n.name === 'Frame 1427325673').find(r => {
  const y = r.node.absoluteBoundingBox?.y
  return y && y > 930 && y < 960
})
if (reportRow) {
  // print all descendants with fills or text
  const stack = [{ n: reportRow.node, d: 0 }]
  while (stack.length) {
    const { n, d } = stack.pop()
    const f = fills(n)
    const box = n.absoluteBoundingBox
    const info = `[${n.type}] ${n.name} box=${box ? Math.round(box.x)+','+Math.round(box.y)+' '+Math.round(box.width)+'x'+Math.round(box.height) : '-'}`
    if (f.length || n.type === 'TEXT' || strokes(n).length) {
      let extra = f.length ? ' fills=' + JSON.stringify(f) : ''
      if (strokes(n).length) extra += ' strokes=' + JSON.stringify(strokes(n))
      if (n.type === 'TEXT') extra += ` TEXT="${n.characters}" ${n.style?.fontSize}px/${n.style?.fontWeight}`
      if (typeof n.cornerRadius === 'number') extra += ` r=${n.cornerRadius}`
      console.log('  '.repeat(d) + info + extra)
    }
    if (n.children) for (let i = n.children.length - 1; i >= 0; i--) stack.push({ n: n.children[i], d: d + 1 })
  }
}
