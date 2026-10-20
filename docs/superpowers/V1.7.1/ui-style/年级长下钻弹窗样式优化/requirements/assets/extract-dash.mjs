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

function walk(n, fn) {
  fn(n)
  if (n.children) n.children.forEach(c => walk(c, fn))
}

// Full dump of switch tabs subtree with dash info
for (const key of ['9913:57744', '9913:58229', '9913:58230']) {
  const root = raw.nodes[key].document
  console.log('\n========', key, root.name, '========')

  // find tabs / switch-like frames
  walk(root, (n) => {
    const name = n.name || ''
    if (/Frame 1427325699|Frame 1940698053|Ellipse|分数趋势|等级趋势|suffix|tab|Tab|switch/i.test(name)
      || (n.type === 'TEXT' && /分数趋势|等级趋势/.test(n.characters || ''))) {
      const fills = (n.fills || []).filter(f => f.visible !== false).map(f => f.color ? hex(f.color) : f.type)
      const strokes = (n.strokes || []).filter(s => s.visible !== false).map(s => ({
        color: s.color ? hex(s.color) : s.type,
        weight: n.strokeWeight,
        dash: n.dashPattern || n.strokeDashes || undefined,
        align: n.strokeAlign,
      }))
      const b = n.absoluteBoundingBox
      const parts = [
        `[${n.type}] ${n.name}`,
        b ? `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}` : '',
        fills.length ? `fills=${JSON.stringify(fills)}` : '',
        strokes.length ? `strokes=${JSON.stringify(strokes)}` : '',
        typeof n.cornerRadius === 'number' ? `r=${n.cornerRadius}` : '',
        n.opacity !== undefined && n.opacity !== 1 ? `op=${n.opacity}` : '',
        n.layoutMode ? `layout=${n.layoutMode} gap=${n.itemSpacing} pad=${n.paddingLeft},${n.paddingRight},${n.paddingTop},${n.paddingBottom}` : '',
        n.type === 'TEXT' ? `TEXT="${n.characters}" ${n.style?.fontSize}/${n.style?.fontWeight}` : '',
      ].filter(Boolean)
      console.log(parts.join(' '))
    }
  })

  // grid vectors with dashPattern
  console.log('-- grid/axis vectors with dash --')
  walk(root, (n) => {
    if (n.type === 'VECTOR' || n.type === 'LINE') {
      const strokes = (n.strokes || []).filter(s => s.visible !== false)
      if (!strokes.length) return
      const b = n.absoluteBoundingBox
      const dash = n.dashPattern || n.strokeDashes
      const color = strokes[0].color ? hex(strokes[0].color) : strokes[0].type
      // only print if interesting (grid color or has dash or is axis-like)
      const c = String(color).toUpperCase()
      if (c.includes('E5E6EB') || c.includes('555555') || (dash && dash.length) || n.strokeWeight !== 1) {
        console.log(
          `[${n.type}] ${n.name} box=${b ? Math.round(b.x)+','+Math.round(b.y)+' '+Math.round(b.width)+'x'+Math.round(b.height) : '-'}`,
          `stroke=${color} w=${n.strokeWeight} dash=${JSON.stringify(dash || [])} align=${n.strokeAlign}`,
        )
      }
    }
  })
}
