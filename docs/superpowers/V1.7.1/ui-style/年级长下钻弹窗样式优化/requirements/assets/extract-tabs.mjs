import fs from 'node:fs'
const raw = JSON.parse(fs.readFileSync(
  'E:/code/frontend-local/docs/superpowers/V1.7.1/ui-style/年级长下钻弹窗样式优化/requirements/assets/figma-nodes-raw.json',
  'utf8',
))

function hex(c) {
  if (!c) return null
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase()
  return '#' + h(c.r) + h(c.g) + h(c.b)
}
function fills(n) {
  if (!n.fills || !Array.isArray(n.fills)) return []
  return n.fills.filter(f => f.visible !== false).map(f => f.color ? hex(f.color) : f.type)
}
function box(n) {
  const b = n.absoluteBoundingBox
  return b ? `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}` : '-'
}

const main = raw.nodes['9913:57744'].document

// Find Frame 1940700407 (trend head right) and Frame 1940699075 (section)
function walk(n, fn, path=[]) {
  fn(n, path)
  if (n.children) n.children.forEach((c,i) => walk(c, fn, [...path, n.name+'#'+i]))
}

walk(main, (n, path) => {
  if (['Frame 1940700407','Frame 1940699075','Frame 1940699004','suffix','Frame 1427325699'].includes(n.name)
    || (n.type === 'INSTANCE' && n.name === 'suffix')) {
    console.log(`[${n.type}] ${n.name} box=${box(n)} fills=${JSON.stringify(fills(n))} layout=${n.layoutMode||'-'} gap=${n.itemSpacing??'-'} pad=${n.paddingLeft!==undefined?`${n.paddingLeft},${n.paddingRight},${n.paddingTop},${n.paddingBottom}`:'-'} children=${(n.children||[]).map(c=>c.name+':'+box(c)).join(' | ')}`)
  }
})

// Y axis label texts under score chart - find numbers like 100,90 near left of chart
console.log('\n-- score chart Y labels --')
walk(main, (n) => {
  if (n.type === 'TEXT' && /^(100|90|80|70|60|50|40)$/.test(n.characters) && n.absoluteBoundingBox?.x < 17450 && n.absoluteBoundingBox?.y > 540 && n.absoluteBoundingBox?.y < 780) {
    console.log(n.characters, box(n), fills(n), n.style?.fontSize, n.style?.fontWeight)
  }
})

// report grade pills widths for 优秀 vs 待改进
console.log('\n-- report grade pills --')
walk(main, (n) => {
  if (n.name === 'Frame 1940700349' && n.absoluteBoundingBox?.y > 930) {
    const texts = []
    const collect = (x) => { if (x.type==='TEXT') texts.push(x.characters); if (x.children) x.children.forEach(collect) }
    collect(n)
    console.log(box(n), fills(n), 'r='+n.cornerRadius, texts)
  }
})

// 等级分布 cell full structure for one grade pair
console.log('\n-- grade dist cell --')
walk(main, (n, path) => {
  if (n.name === 'Frame 1427325671' && n.absoluteBoundingBox?.y > 340 && n.absoluteBoundingBox?.y < 370 && n.absoluteBoundingBox?.x > 17960) {
    // dump subtree shallow
    const d = (x, depth) => {
      console.log('  '.repeat(depth)+`[${x.type}] ${x.name} ${box(x)} fills=${JSON.stringify(fills(x))} r=${x.cornerRadius??'-'} ${x.type==='TEXT'?x.characters+' '+x.style?.fontSize+'/'+x.style?.fontWeight:''}`)
      if (x.children && depth < 5) x.children.forEach(c => d(c, depth+1))
    }
    d(n, 0)
  }
})

// Compare: what is y-axis max labels - also check if score y is inverted or min at bottom
// Check chart plot area vs axis labels positions
console.log('\n-- chart y label x positions (score) --')
// already have
