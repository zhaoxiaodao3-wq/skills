# Superpowers 6.3 瀵规帴浼樺寲 路 瀹炴柦璁″垝

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 鍦ㄤ繚鐣欏洓灞傜洰褰曚笌鏆傚仠闂ㄧ鐨勫墠鎻愪笅锛屾妸瀹樻柟 v6.3.0 鐨勯渶姹傚垎鏋愪笁妗ｄ笌 SDD 鍏抽敭绾︽潫鎺ュ叆鑷缓 Harness銆?

**Architecture:** 瀹樻柟 skill 浠呴潬鍗囨彃浠舵洿鏂帮紱鏈鍒掑彧鏀硅嚜寤虹紪鎺掍笌瑙勫垯鏂囨。銆俙harness-run` 澧炲姞妗ｄ綅鍒嗘祦锛沗HARNESS_RULES` / `SUPERPOWERS_RULES` / `.cursorrules` 鍚屾杈圭晫涓庤矾寰勮鐩栥€?

**Tech Stack:** Markdown skills銆丠arness 瑙勫垯鏂囨。锛涙棤涓氬姟 `src/` 鏀瑰姩銆?

**Spec:** [../specs/01-dev-spec.md](../specs/01-dev-spec.md)  
**Requirement:** [../requirements/01-鍘熷闇€姹?md](../requirements/01-鍘熷闇€姹?md)

## Global Constraints

- 瀹樻柟 Superpowers 鐩爣鐗堟湰锛?*v6.3.0**锛涘畼鏂?skill **涓?*鎷疯繘浠撳簱
- 钀界洏璺緞蹇呴』锛歚docs/superpowers/{version}/{type}/{妯″潡}/鈥锛涚姝㈡墎骞?`docs/superpowers/specs/`
- 鍐茬獊鏃讹細鏈湴 `SUPERPOWERS_RULES` / harness-run **楂樹簬** 瀹樻柟榛樿琛屼负
- 鏍囧噯妗ｄ粛寮哄埗鐭?`01-dev-spec.md` + `01-dev-plan.md` + 浜や粯褰掓。锛涗笉鍙栨秷 P 鏆傚仠鐐?
- 鏈鍒?**绂佹** 淇敼涓氬姟 `src/`
- 鎶€鑳芥簮鐮佹牴锛歚E:\code\frontend-local\`锛涙敼 skill 鏀规澶勶紙鍚?`.agents/skills` 涓庨渶鍚屾鐨?`.cursor/skills` 鍓湰锛?

## File Map

| 鏂囦欢 | 鑱岃矗 |
|------|------|
| `.agents/skills/superpowers-harness-run/SKILL.md` | 妗ｄ綅鍒嗙被 + 涓夋。鍒嗘敮 + P2 SDD 绾︽潫 |
| `.cursor/skills/superpowers-harness-run/SKILL.md` | 鑻ラ潪 junction锛屼笌 agents 婧愬悓姝?|
| `docs/superpowers/HARNESS_RULES.md` | 涓夋。琛ㄣ€佽矾寰勮鐩栥€丼DD 绾︽潫銆佸畼鏂瑰叧绯?|
| `docs/superpowers/SUPERPOWERS_RULES.md` | 娴佺▼鑺傝ˉ涓夋。涓庛€屽畼鏂逛笉钀戒粨銆?|
| `.cursorrules` | 涓€琛屽垎妗ｅ叆鍙ｈ鏄?|
| 鏈ā鍧?`archive/*-delivered.md` | 浜や粯蹇収 + 涓€鑷存€ц嚜妫€ |

---

### Task 1: harness-run 鎺ュ叆涓夋。鍒嗘祦锛圥1锛?

> **Skill:** 鏃犻澶?skill锛堢洿鎺ョ紪杈?markdown锛壜?缃俊搴?1.0 路 浜哄伐澶嶆牳锛氭枃妗ｅ瀷浠诲姟锛宺outer 鍦烘櫙 skill 涓嶉€傜敤

**Files:**
- Modify: `E:\code\frontend-local\.agents\skills\superpowers-harness-run\SKILL.md`
- Modify: `E:\code\frontend-local\.cursor\skills\superpowers-harness-run\SKILL.md`锛堣嫢鍐呭鐙珛鍒欏悓姝ワ紱鑻ュ凡鎸囧悜鍚屼竴鏂囦欢鍒欒烦杩囷級

- [x] **Step 1:** 鍦?Step 0 涔嬪悗澧炲姞銆屾。浣嶅垎绫汇€嶏細杞婚噺=spike / 鏍囧噯=bounded / 鍏ㄩ噺=architectural锛涘繀椤诲鍛婃。浣嶏紱鍏佽鐢ㄦ埛鏀规。
- [x] **Step 2:** 鐢ㄣ€屾爣鍑嗘。銆嶆敹缂栧苟鎵╁睍鍘熴€宖ix 杞婚噺閫氶亾銆嶏紙涓嶅啀浠呴檺 type=fix锛夛紱淇濈暀鐭?spec/plan銆丷EADY_TO_DEV銆佸綊妗?
- [x] **Step 3:** 澧炲姞銆岃交閲忔。銆嶅垎鏀紙requirements + 缁撹 archive锛涢粯璁や笉鏀?src锛涘疄鐜板墠纭锛?
- [x] **Step 4:** 銆屽叏閲忔。銆嶆寚鍚戠幇鏈夊畬鏁撮摼锛涚姸鎬佽澧炲姞 `妗ｄ綅: 鈥
- [x] **Step 5:** 鑷锛氬叏鏂囨悳绱㈢‘璁や粛绂佹鎵佸钩 specs锛涗笁妗ｅ潎鍐欍€屽疄鐜板墠绛変汉纭銆?

---

### Task 2: harness-run 鍐欏叆 P2 SDD 绾︽潫

> **Skill:** 鏃犻澶?skill 路 缃俊搴?1.0

**Files:**
- Modify: 鍚屼笂 `superpowers-harness-run/SKILL.md`锛坅gents + 蹇呰鏃?cursor锛?

- [x] **Step 1:** Step C锛氬己鍒?plan 澶?`**Spec:**`锛涘悓褰?Task 鍙爣 `Batch:`
- [x] **Step 2:** Step D / P3锛氶€?Subagent-Driven 鏃跺啓鏄庤窡瀹樻柟 6.3 SDD锛涚宓屽瀛愪唬鐞嗭紱娲惧彂椤绘樉寮忔ā鍨嬶紱闈炵伨闅惧啿绐佸彲璁板綍瑁佸喅鍚庣户缁?
- [x] **Step 3:** Inline锛氫笉寮哄埗瀹樻柟 ledger锛涗粛鎸?plan + skill 鏍囨敞鎵ц

---

### Task 3: 鍚屾 HARNESS_RULES / SUPERPOWERS_RULES / .cursorrules

> **Skill:** 鏃犻澶?skill 路 缃俊搴?1.0

**Files:**
- Modify: `docs/superpowers/HARNESS_RULES.md`
- Modify: `docs/superpowers/SUPERPOWERS_RULES.md`
- Modify: `.cursorrules`锛坄frontend-local`锛涜嫢 `frontend` 鏈夌嫭绔嬪壇鏈垯涓€骞舵敼锛?

- [x] **Step 1:** `HARNESS_RULES` 澧炲姞锛氬畼鏂?vs 鑷缓鑱岃矗銆佽矾寰勮鐩栥€佷笁妗ｈ〃銆丳2 SDD 瑕佺偣
- [x] **Step 2:** `SUPERPOWERS_RULES` 搂4 娴佺▼琛ュ厖涓夋。鍏ュ彛锛涘己璋冨畼鏂?skill 鍗囨彃浠躲€佷笉钀戒粨
- [x] **Step 3:** `.cursorrules` 澧炲姞涓€琛岋細闇€姹傚垎鏋愬垎妗ｏ紙杞婚噺/鏍囧噯/鍏ㄩ噺锛夛紝鍏ュ彛浠?harness-run
- [x] **Step 4:** 纭鏈柊澧炰换浣?`obra/superpowers` 涓嬬殑瀹樻柟 SKILL 鍓湰

---

### Task 4: 浜や粯褰掓。涓?harness 鏍￠獙

> **Skill:** 鏃犻澶?skill 路 缃俊搴?1.0

**Files:**
- Create: `docs/superpowers/V1.6.0/feature/Superpowers-6.3瀵规帴浼樺寲/archive/Superpowers-6.3瀵规帴浼樺寲-delivered.md`

- [x] **Step 1:** 鍕鹃€?spec 搂7 楠屾敹椤癸紙鑳藉嬀鐨勫嬀锛涙彃浠跺崌绾ч」鎸夌敤鎴峰疄闄呮儏鍐靛～鍐欙級
- [x] **Step 2:** 鍐?archive锛堝惈涓€鑷存€ц嚜妫€锛涜繕鍘熷害锛氫笉閫傜敤锛?
- [x] **Step 3:** 鍦?`e:\code\frontend` 璺?`pnpm harness:status -- --match "Superpowers-6.3"` 涓?`pnpm harness:check`
- [x] **Step 4:** 姹囨姤 Harness 闂幆娓呭崟锛?*涓?*鑷姩 commit锛堥櫎闈炵敤鎴疯姹傦級

## Skill 璺敱鎬昏瘎

> CLI锛歚node .agents/routing/router.mjs --annotate 鈥?plans/01-dev-plan.md`锛?026-08-25锛?

| Task | CLI 寤鸿 | 浜哄伐澶嶆牳 |
|------|----------|----------|
| 1锝? | 澶撮儴鍛戒腑 harness 鈫?`superpowers-harness-run` / `superpowers-harness`锛?.70锛?| **閲囩撼璇箟**锛氭湰璁″垝鏈韩灏辨槸鍦ㄦ敼杩欎袱涓?skill/瑙勫垯锛涙墽琛屾椂鎸?Task 鐩存帴缂栬緫鍗冲彲锛屼笉蹇呭啀濂椾竴灞備笟鍔?skill銆備笉婵€娲?figma/echarts/frontend-design銆?|

`riskLevel:` low锛堟棤涓氬姟浠ｇ爜銆佹棤楂樺嵄鑷姩鍖栵級鈫?鏃犻渶鍥犺矾鐢辨殏鍋溿€?
