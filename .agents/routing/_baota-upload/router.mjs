#!/usr/bin/env node
// Skill 路由 Router 引擎 —— 单文件、纯 Node 零依赖（仅 fs/path）
// 权威数据源：同目录 SKILL_ROUTING.md 的机器块（SKILL_GRAPH_START/END 之间 JSON）
// 用法：node router.mjs --help

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MD_FILE = path.join(__dirname, 'SKILL_ROUTING.md');
const CONFIG_FILE = path.join(__dirname, 'local-config.json');
const CACHE_FILE = path.join(__dirname, 'graph.cache.json');
const START = '<!-- SKILL_GRAPH_START -->';
const END = '<!-- SKILL_GRAPH_END -->';
const RISK = { low: 0, medium: 1, high: 2 };
const DEFAULT_SKILLS_ROOT = path.join(__dirname, '..', 'skills');

// ---------- 本机配置（与 MD 权威解耦） ----------
export function readConfig() {
  const empty = { routingMdPath: '', skillsRoot: '', updatedAt: '' };
  if (!fs.existsSync(CONFIG_FILE)) return { ...empty };
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return {
      routingMdPath: typeof raw.routingMdPath === 'string' ? raw.routingMdPath : '',
      skillsRoot: typeof raw.skillsRoot === 'string' ? raw.skillsRoot : '',
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
    };
  } catch {
    return { ...empty };
  }
}

export function writeConfig(partial = {}) {
  const cur = readConfig();
  const next = {
    routingMdPath: partial.routingMdPath !== undefined ? String(partial.routingMdPath || '') : cur.routingMdPath,
    skillsRoot: partial.skillsRoot !== undefined ? String(partial.skillsRoot || '') : cur.skillsRoot,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

/** 建议默认值（不自动写入）：同目录 MD + 旁路 skills */
export function suggestedDefaults() {
  return {
    routingMdPath: fs.existsSync(MD_FILE) ? MD_FILE : '',
    skillsRoot: fs.existsSync(DEFAULT_SKILLS_ROOT) ? DEFAULT_SKILLS_ROOT : '',
  };
}

export function resolveMdPath(override) {
  if (override && typeof override === 'string' && override.trim()) return path.resolve(override.trim());
  const c = readConfig();
  if (c.routingMdPath && c.routingMdPath.trim()) return path.resolve(c.routingMdPath.trim());
  return null;
}

export function hasMachineBlock(mdPath) {
  try {
    const raw = fs.readFileSync(mdPath, 'utf8');
    return raw.includes(START) && raw.includes(END);
  } catch {
    return false;
  }
}

// ---------- 工具 ----------
const norm = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

// 短语匹配：先整串包含；多词短语则要求所有 token 均出现（允许中间夹字）
function matchPhrase(text, phrase) {
  const t = norm(text);
  const p = norm(phrase);
  if (!p) return false;
  if (t.includes(p)) return true;
  const tokens = p.split(' ').filter(Boolean);
  return tokens.length > 1 && tokens.every(tok => t.includes(tok));
}

function extractBlock(md) {
  const i = md.indexOf(START);
  const j = md.indexOf(END);
  if (i === -1 || j === -1 || j <= i) return null;
  return md.slice(i + START.length, j).trim();
}

// ---------- 零依赖校验（覆盖 JSON Schema 核心约束） ----------
function validateGraph(g) {
  const errors = [];
  if (!g || typeof g !== 'object') return { ok: false, errors: ['图谱必须是对象'] };
  if (typeof g.version !== 'number') errors.push('version 缺失或非数字');
  const gc = g.globalConfig;
  if (!gc || typeof gc !== 'object') errors.push('globalConfig 缺失');
  else {
    if (typeof gc.maxSkillsPerPlan !== 'number') errors.push('globalConfig.maxSkillsPerPlan 缺失');
    if (typeof gc.minConfidence !== 'number') errors.push('globalConfig.minConfidence 缺失');
    if (!['low', 'medium', 'high'].includes(gc.autoActivateRiskLevel)) errors.push('globalConfig.autoActivateRiskLevel 非法');
  }
  const catIds = new Set();
  if (!Array.isArray(g.categories)) errors.push('categories 缺失或非数组');
  else {
    for (const c of g.categories) {
      if (!c || typeof c.id !== 'string' || typeof c.name !== 'string') errors.push('分类需含字符串 id/name');
      else if (catIds.has(c.id)) errors.push(`分类 id 重复: ${c.id}`);
      else catIds.add(c.id);
    }
    const byId = new Map((g.categories || []).filter((c) => c && c.id).map((c) => [c.id, c]));
    for (const c of g.categories) {
      if (!c || typeof c.id !== 'string') continue;
      const pid = c.parentId;
      if (pid == null || pid === '') continue;
      if (typeof pid !== 'string') {
        errors.push(`分类 ${c.id} parentId 必须为字符串`);
        continue;
      }
      if (pid === c.id) errors.push(`分类 ${c.id} parentId 不能指向自身`);
      else if (!catIds.has(pid)) errors.push(`分类 ${c.id} parentId 引用不存在的分类 ${pid}`);
      else {
        // 环检测
        const seen = new Set([c.id]);
        let cur = pid;
        let hops = 0;
        while (cur && hops < 64) {
          if (seen.has(cur)) {
            errors.push(`分类 ${c.id} parentId 链存在环`);
            break;
          }
          seen.add(cur);
          const p = byId.get(cur);
          cur = p && p.parentId ? p.parentId : '';
          hops++;
        }
      }
    }
  }
  const skillIds = new Set();
  if (!Array.isArray(g.skills)) errors.push('skills 缺失或非数组');
  else for (const s of g.skills) {
    if (!s || typeof s !== 'object') { errors.push('skill 项必须为对象'); continue; }
    for (const k of ['id', 'categoryId', 'name', 'path']) if (typeof s[k] !== 'string') errors.push(`skill 缺字段 ${k}: ${s.id ?? '(无id)'}`);
    if (s.id != null) { if (skillIds.has(s.id)) errors.push(`skill id 重复: ${s.id}`); else skillIds.add(s.id); }
    if (!catIds.has(s.categoryId)) errors.push(`skill ${s.id} 引用不存在的分类 ${s.categoryId}`);
    if (typeof s.path === 'string' && !s.path.trim()) errors.push(`skill ${s.id} 的 path 不能为空`);
    // path 可为相对（../skills/x）或本机绝对路径（跨机器各自配置）
    if (s.riskLevel && !['low', 'medium', 'high'].includes(s.riskLevel)) errors.push(`skill ${s.id} riskLevel 非法`);
    if (s.status && !['draft', 'active', 'deprecated'].includes(s.status)) errors.push(`skill ${s.id} status 非法`);
    if (!Array.isArray(s.triggers)) errors.push(`skill ${s.id} triggers 缺失或非数组`);
  }
  return { ok: errors.length === 0, errors };
}

// ---------- 加载（含降级兜底） ----------
export function loadGraph(mdPath) {
  const resolved = resolveMdPath(mdPath);
  if (!resolved) {
    return {
      ok: false,
      graph: null,
      errors: ['未配置路由文件（local-config.json 中 routingMdPath 为空）'],
      needConfig: true,
      fallbackUsed: false,
      suggestions: suggestedDefaults(),
    };
  }
  let raw;
  try { raw = fs.readFileSync(resolved, 'utf8'); }
  catch (e) {
    return {
      ok: false,
      graph: null,
      errors: [`无法读取 ${resolved}: ${e.message}`],
      needConfig: true,
      fallbackUsed: false,
      suggestions: suggestedDefaults(),
    };
  }
  const block = extractBlock(raw);
  if (!block) {
    return {
      ok: false,
      graph: null,
      errors: ['未找到机器块标记 SKILL_GRAPH_START/END'],
      needConfig: false,
      fallbackUsed: false,
    };
  }

  let graph;
  try { graph = JSON.parse(block); }
  catch (e) {
    if (fs.existsSync(CACHE_FILE)) {
      try {
        graph = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        const v = validateGraph(graph);
        return { ok: v.ok, graph, errors: [`机器块 JSON 非法（${e.message}），已降级使用 graph.cache.json`].concat(v.errors), fallbackUsed: true, needConfig: false };
      } catch (e2) {
        return { ok: false, graph: null, errors: [`机器块 JSON 非法: ${e.message}；缓存也非法: ${e2.message}`], fallbackUsed: true, needConfig: false };
      }
    }
    return { ok: false, graph: null, errors: [`机器块 JSON 非法: ${e.message}`], fallbackUsed: false, needConfig: false };
  }
  const v = validateGraph(graph);
  return { ok: v.ok, graph, errors: v.errors, fallbackUsed: false, needConfig: false, mdPath: resolved };
}

// ---------- 必要性测评（单步 × 单 skill） ----------
export function assessNecessity(stepText, skill) {
  const t = norm(stepText);
  const triggerHits = (skill.triggers || []).filter(x => matchPhrase(t, x));
  const applicableHits = (skill.applicableConditions || []).filter(c => matchPhrase(t, c));
  const unsuitableHits = (skill.unsuitableConditions || []).filter(c => matchPhrase(t, c));

  let confidence = 0;
  let reason = '';
  if (unsuitableHits.length > 0) {
    confidence = 0;
    reason = `命中不适用护栏: ${unsuitableHits.join(' / ')}`;
  } else if (triggerHits.length > 0) {
    confidence = Math.min(0.95, 0.7 + 0.1 * applicableHits.length);
    reason = `触发词命中: ${triggerHits.join(' / ')}${applicableHits.length ? '；适用场景: ' + applicableHits.join(' / ') : ''}`;
  } else if (applicableHits.length > 0) {
    confidence = Math.min(0.6, 0.4 + 0.1 * applicableHits.length);
    reason = `仅命中适用场景（无触发词）: ${applicableHits.join(' / ')}`;
  } else {
    confidence = 0.1;
    reason = '未命中触发词或护栏，默认低置信（由 agent 判断）';
  }

  return {
    skillId: skill.id,
    confidence,
    reason,
    triggerHits,
    applicableHits,
    unsuitableHits,
    riskLevel: skill.riskLevel || 'low',
    needsSkill: unsuitableHits.length === 0 && confidence > 0,
  };
}

// ---------- 模式 B：自由文本路由 ----------
export function route(task, graph) {
  const gc = graph.globalConfig;
  const t = norm(task);
  const results = [];
  for (const s of graph.skills) {
    if (s.status === 'deprecated') continue;
    const matchedTriggers = (s.triggers || []).filter(x => matchPhrase(t, x));
    const matchedTags = (s.semanticTags || []).filter(x => matchPhrase(t, x));
    const score = matchedTriggers.length * 1.0 + matchedTags.length * 0.2;
    if (score <= 0) continue;
    const riskLevel = s.riskLevel || 'low';
    results.push({
      skillId: s.id,
      name: s.name,
      confidence: Math.min(score, 1.0),
      matchedTriggers,
      matchedTags,
      riskLevel,
      autoActivate: RISK[riskLevel] <= RISK[gc.autoActivateRiskLevel],
      reason: `触发词命中 ${matchedTriggers.length} 个、语义标签命中 ${matchedTags.length} 个`,
    });
  }
  results.sort((a, b) => b.confidence - a.confidence);
  const capped = results.slice(0, gc.maxSkillsPerPlan);
  return {
    task,
    results: capped,
    active: capped.filter(r => r.confidence >= gc.minConfidence),
    lowConfidence: capped.filter(r => r.confidence < gc.minConfidence),
  };
}

// ---------- 模式 A：计划标注 ----------
export function annotatePlan(planSteps, graph) {
  const gc = graph.globalConfig;
  const steps = planSteps.map((s, i) =>
    typeof s === 'string'
      ? { id: String(i + 1), text: s }
      : { id: s.id ?? String(i + 1), text: s.text ?? s.title ?? '' }
  );
  let used = 0;
  const annotated = [];
  for (const step of steps) {
    const suggestions = [];
    for (const skill of graph.skills) {
      if (skill.status === 'deprecated') continue;
      if (used >= gc.maxSkillsPerPlan) break;
      const a = assessNecessity(step.text, skill);
      if (a.confidence >= gc.minConfidence) {
        suggestions.push({
          skillId: a.skillId,
          confidence: a.confidence,
          reason: a.reason,
          riskLevel: a.riskLevel,
          autoActivate: RISK[a.riskLevel] <= RISK[gc.autoActivateRiskLevel],
        });
      }
    }
    suggestions.sort((a, b) => b.confidence - a.confidence);
    used += suggestions.length;
    annotated.push({ step: step.id, text: step.text, needsSkill: suggestions.length > 0, suggestions });
  }
  return annotated;
}

// ---------- 保存（写回 MD，含人类可读说明重生成） ----------
function serializeProse(graph) {
  const lines = ['## 分类与 Skill 明细（人类可读，画板自动重生成）', ''];
  for (const cat of graph.categories) {
    lines.push(`### ${cat.name}`);
    const skills = graph.skills.filter((s) => s.categoryId === cat.id);
    if (skills.length === 0) {
      lines.push('- （暂未预置 skill）');
    } else {
      for (const s of skills) {
        const desc = s.userDescription || s.systemDescription || s.name;
        lines.push(`- **${s.name}** — ${desc}`);
        const trig = (s.triggers || []).slice(0, 5).join(' / ');
        if (trig) lines.push(`  - 触发：${trig}`);
      }
    }
    lines.push('');
  }
  return lines.join('\n');
}

export function saveGraph(graph, mdPath) {
  const v = validateGraph(graph);
  if (!v.ok) return { ok: false, errors: v.errors };

  const resolved = resolveMdPath(mdPath);
  if (!resolved) {
    return { ok: false, errors: ['未配置路由文件，无法保存'], needConfig: true };
  }

  let md;
  try { md = fs.readFileSync(resolved, 'utf8'); }
  catch (e) { return { ok: false, errors: [`无法读取 ${resolved}: ${e.message}`] }; }

  const i = md.indexOf(START);
  const j = md.indexOf(END);
  if (i === -1 || j === -1) return { ok: false, errors: ['MD 中未找到机器块标记 SKILL_GRAPH_START/END'] };

  const newJson = JSON.stringify(graph, null, 2);
  const top = md.slice(0, i + START.length);
  const bottom = '\n\n' + serializeProse(graph).trimEnd() + '\n';
  const newMd = top + '\n' + newJson + '\n' + END + bottom;

  try { fs.writeFileSync(resolved, newMd, 'utf8'); }
  catch (e) { return { ok: false, errors: [`写入失败: ${e.message}`] }; }

  try { fs.writeFileSync(CACHE_FILE, JSON.stringify(graph, null, 2), 'utf8'); } catch (_) {}
  return { ok: true, errors: [], mdPath: resolved };
}

// ---------- CLI ----------
function printHelp() {
  console.log(`Skill 路由 Router（单文件 · 零依赖）

用法：
  node router.mjs "任务描述"                 模式 B：自由文本路由
  node router.mjs --annotate <计划文件>      模式 A：逐步骤必要性测评并标注
  node router.mjs --list                    列出所有 skill 概要
  node router.mjs --validate                仅校验当前配置（或旁路默认）路由 MD
  node router.mjs --write-cache             解析成功后写 graph.cache.json
  node router.mjs --help                    显示本帮助
`);
}

function failAndExit(r) {
  console.error('[FAIL] 加载图谱失败:');
  for (const e of r.errors) console.error('  - ' + e);
  process.exitCode = 1;
}

function loadForCli() {
  const p = resolveMdPath() || (fs.existsSync(MD_FILE) ? MD_FILE : null);
  return p ? loadGraph(p) : loadGraph();
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) return printHelp();

  if (args.includes('--validate')) {
    const r = loadForCli();
    if (!r.ok) return failAndExit(r);
    console.log('[OK] 路由 MD 机器块校验通过');
    console.log(`  文件 ${r.mdPath || resolveMdPath() || MD_FILE}`);
    console.log(`  分类 ${r.graph.categories.length} 个、skill ${r.graph.skills.length} 个`);
    return;
  }

  if (args.includes('--write-cache')) {
    const r = loadForCli();
    if (!r.ok) return failAndExit(r);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(r.graph, null, 2), 'utf8');
    console.log('[OK] 已写入 ' + CACHE_FILE);
    return;
  }

  if (args.includes('--list')) {
    const r = loadForCli();
    if (!r.ok) return failAndExit(r);
    for (const c of r.graph.categories) {
      console.log(`# ${c.name} (${c.id})`);
      for (const s of r.graph.skills.filter(s => s.categoryId === c.id)) {
        console.log(`  - ${s.id}  [风险:${s.riskLevel ?? 'low'}]  ${s.userDescription ?? ''}`);
      }
    }
    return;
  }

  const ai = args.indexOf('--annotate');
  if (ai !== -1) {
    const file = args[ai + 1];
    if (!file) { console.error('[FAIL] --annotate 需要一个文件路径'); process.exitCode = 1; return; }
    const r = loadForCli();
    if (!r.ok) return failAndExit(r);
    let raw;
    try { raw = fs.readFileSync(file, 'utf8'); }
    catch (e) { console.error(`[FAIL] 无法读取计划文件 ${file}: ${e.message}`); process.exitCode = 1; return; }
    const steps = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.startsWith('>'));
    const annotated = annotatePlan(steps, r.graph);
    for (const a of annotated) {
      if (a.needsSkill) {
        console.log(`[${a.step}] ${a.text}`);
        for (const s of a.suggestions) {
          const tag = s.autoActivate ? '自动激活' : '需人工确认';
          console.log(`    ↳ 建议 skill: ${s.skillId}  置信度 ${s.confidence.toFixed(2)}  [${s.riskLevel}·${tag}]`);
          console.log(`      理由: ${s.reason}`);
        }
      } else {
        console.log(`[${a.step}] ${a.text}  → 无需 skill`);
      }
    }
    return;
  }

  // 默认：模式 B
  const task = args.join(' ');
  const r = loadForCli();
  if (!r.ok) return failAndExit(r);
  const res = route(task, r.graph);
  if (res.results.length === 0) {
    console.log('无匹配 skill（可考虑 find-skill 搜索）');
    return;
  }
  for (const x of res.results) {
    const tag = x.autoActivate ? '自动激活' : '需人工确认';
    const conf = x.confidence >= r.graph.globalConfig.minConfidence ? '达标' : '低置信';
    console.log(`- ${x.skillId}  置信度 ${x.confidence.toFixed(2)} [${conf}]  [${x.riskLevel}·${tag}]`);
    console.log(`  ${x.reason}${x.matchedTriggers.length ? ` → ${x.matchedTriggers.join(' / ')}` : ''}`);
  }
}

// 仅当直接执行时运行 CLI（被 import 时不运行，避免污染宿主进程）
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
