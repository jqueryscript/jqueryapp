// Audit tool content depth
import { readFile } from "node:fs/promises";

const tools = JSON.parse(await readFile("data/tools.en.json", "utf8"));
const results = tools.map(t => {
  const hasQA = !!t.quickAnswer;
  const hasLimit = !!(t.limitations && t.limitations.length);
  const hasVerify = !!(t.verificationSteps && t.verificationSteps.length);
  const hasComp = !!t.comparison;
  const faqCount = (t.faq || []).length;
  const exampleCount = (t.examples || []).length;
  const mistakeCount = (t.mistakes || []).length;
  const sections = (hasQA?1:0) + (hasLimit?1:0) + (hasVerify?1:0) + (hasComp?1:0) + (faqCount>=3?1:0) + (exampleCount>=2?1:0) + (mistakeCount>=3?1:0);
  return { id: t.id, name: t.name, cat: t.category, qa: hasQA, lim: hasLimit, ver: hasVerify, comp: hasComp, faq: faqCount, ex: exampleCount, mist: mistakeCount, score: sections };
});

const byScore = {};
results.forEach(t => { byScore[t.score] = (byScore[t.score]||0)+1; });
console.log("Content depth score distribution:");
Object.keys(byScore).sort().forEach(s => console.log(`  Score ${s}: ${byScore[s]} tools`));

const thin = results.filter(t => t.score <= 2);
console.log(`\n=== Thin tools (score <= 2): ${thin.length} ===`);
thin.forEach(t => console.log(`  ${t.id} (${t.cat}) faq:${t.faq} ex:${t.ex} mist:${t.mist} qa:${t.qa} lim:${t.lim} ver:${t.ver} comp:${t.comp}`));

const medium = results.filter(t => t.score >= 3 && t.score <= 4);
console.log(`\n=== Medium tools (score 3-4): ${medium.length} ===`);
medium.forEach(t => console.log(`  ${t.id} (${t.cat}) faq:${t.faq} ex:${t.ex} mist:${t.mist} qa:${t.qa} lim:${t.lim} ver:${t.ver} comp:${t.comp}`));

const rich = results.filter(t => t.score >= 5);
console.log(`\n=== Rich tools (score >= 5): ${rich.length} ===`);
rich.forEach(t => console.log(`  ${t.id} (${t.cat}) score:${t.score}`));
