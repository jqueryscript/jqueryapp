# jquery.app SEO / GEO / UX 修复计划

生成日期：2026-05-22

目标：提升工具页排名能力、AI 搜索可引用性、用户可用性、移动体验和页面速度。本文按 `todo.md` 中的 17 个问题逐项规划，不直接实现代码。

## 总体原则

- 所有修改都应改源文件，不直接手改 `dist/`。
- 每次完成一个小批次后运行 `npm run build`。
- 保持工具页面的核心体验：打开即用、无登录、无上传、客户端运行。
- 内容扩展必须具体、实用、和工具功能相关，不为了字数堆砌。
- SEO/GEO 优先服务用户任务：更快找到工具、更清楚理解输出、更容易复制正确代码。

## 涉及文件地图

- `data/site.json`：首页和站点级标题、描述、基础定位。
- `data/locales.json`：多语言 UI 文案、目录页标题、分类页文案、翻译覆盖。
- `data/tools.en.json`：英文工具页内容源，包括摘要、说明、用法、案例、FAQ。
- `data/categories.en.json`：分类页源内容。
- `data/collections.en.json`：collection 工作流页源内容。
- `scripts/build.mjs`：页面模板、metadata、schema、hreflang、脚本加载、llms.txt、sitemap 生成。
- `src/assets/styles.css`：响应式、导航、工具卡片、移动布局。
- `src/assets/tools.js`：当前所有工具交互逻辑所在的单体脚本。
- `src/assets/`：未来 OG 图、拆分后的工具脚本、共享 JS 入口。

## 执行顺序

1. P0：首页定位、JS 拆分方案、OG 图片基础设施。
2. P1：内容和信息架构，包括工具页、目录页、collection 页、实体信号。
3. P2：工具发现、移动体验、性能验证、内部链接。
4. P3：GEO 专项，包括短答案、对比表、精选版 llms.txt。
5. 最后做统一构建、抽样检查、移动截图、PageSpeed/Search Console 验证。

## P0-1：重写首页 Title、Meta 和 H1 定位

### 问题

当前首页 title 是 `Small Web Tools for Building, Designing & Publishing`，方向接近，但表达仍偏泛。之前建议把首页压缩成 `Static Website Tools for SEO, HTML, CSS & GitHub Pages` 也不够准确，因为它把网站限制成“静态网站工具集”，没有表达站点真正的理念：在 AI Coding、AI design、AI workflow 变得越来越重的环境下，许多 Web 开发、Web design、mobile design 和发布前的小任务其实不需要 AI，也不值得打开庞大的 AI 工具或消耗额外 tokens。

### 目标

让首页承接更大的主定位：`You might not need AI`。网站不是只服务 static website，而是提供小而美、全而不杂乱的浏览器小工具，用来解决 Web 开发、Web design、mobile UI、SEO、HTML/CSS、GitHub Pages、发布检查等日常小任务。

首页定位应同时满足两点：

- 品牌理念：很多小任务不需要 AI。
- 搜索意图：用户仍会搜索 web tools、developer tools、CSS generators、HTML tools、SEO tools、design helpers、GitHub Pages utilities 等具体需求。

### 具体步骤

1. 更新 `data/site.json`：
   - `tagline` 改为更贴近首页 H1 的主定位。
   - `description` 改为包含 no-AI、browser tools、web developers、designers、HTML、CSS、SEO、publishing、mobile/web design helpers。
2. 检查 `data/locales.json` 中英文首页是否有 `seoTitle`、`seoDescription` 或同类覆盖字段。
3. 在 `scripts/build.mjs` 的 `homePage()` 中确认首页使用的是正确字段：
   - title 应优先使用 `localizedSite.seoTitle` 或明确的首页 SEO 字段。
   - H1 应与 title 语义一致，但不要机械重复。
4. 建议英文：
   - Title option A: `No-AI Web Tools for Developers, Designers & Site Owners`
   - Title option B: `Small Web Tools for Developers, Designers & Publishers`
   - Title option C: `You Might Not Need AI: Small Web Tools for Everyday Web Work`
   - Title option D: `Free Browser Tools for Web Dev, Design, SEO & Publishing`
   - Recommended Title: `Small Web Tools for Developers, Designers & Publishers`
   - Meta option A: `Use fast browser tools for everyday web development, design, SEO, HTML, CSS, mobile UI, and publishing tasks without opening an AI tool or uploading files.`
   - Meta option B: `A no-AI toolkit for quick web work: generate HTML, CSS, SEO tags, design snippets, mobile helpers, GitHub Pages files, and publishing checks in your browser.`
   - Recommended Meta: `A no-AI toolkit for quick web work: generate HTML, CSS, SEO tags, design snippets, mobile helpers, GitHub Pages files, and publishing checks in your browser.`
   - H1 option A: `You might not need AI for every web task`
   - H1 option B: `Small web tools for everyday development and design tasks`
   - Recommended H1: `You might not need AI for every web task`
   - Recommended subheadline: `Use small browser tools for HTML, CSS, SEO, mobile UI, design snippets, GitHub Pages, and publishing checks without uploads, accounts, or token costs.`
5. 为其他语言先保持现有翻译，后续再本地化，不阻塞英文优化。

### 验收标准

- `dist/index.html` 的 `<title>` 已更新。
- `meta name="description"` 已更新。
- 首页 H1 明确表达 `You might not need AI` 或同等 no-AI 任务替代理念。
- Title 保留可搜索的 Web tools / developers / designers / publishers 词汇，不只写品牌口号。
- Meta 同时覆盖 no-AI 差异化和具体工具范围。
- 首页仍自然、准确，不承诺不存在的功能。

### 风险

- Title 不能只写 `You might not need AI`，否则搜索意图太弱。
- Title 也不能只写 `Static Website Tools`，否则限制未来扩展。
- 不要把首页写成“AI 替代品”或“所有开发者工具大全”。更准确的表达是：许多小任务无需 AI，小工具更快、更轻、更省。

## P0-2：拆分或按需加载 `tools.js`

### 问题

当前 `dist/assets/tools.js` 约 160KB，所有工具页都加载完整脚本。工具数量继续增长后，移动端解析和执行成本会越来越高，可能影响 INP 和首次交互。

### 目标

让每个工具页只加载当前工具需要的交互逻辑，同时保留静态 HTML 可索引内容。

### 推荐方案

分阶段做，不要一次大重构。

### 阶段 1：低风险准备

1. 在 `src/assets/tools.js` 中识别共享逻辑：
   - mount 函数。
   - 表单 helper。
   - copy-to-clipboard。
   - common utility。
2. 抽象成 `src/assets/tool-core.js`。
3. 保持旧 `tools.js` 可工作，先不删除。

### 阶段 2：按工具拆分

1. 新建目录：`src/assets/tools/`。
2. 每个工具一个文件：
   - `src/assets/tools/fetch-priority-attribute-generator.js`
   - `src/assets/tools/css-anchor-positioning-generator.js`
   - 以此类推。
3. 每个工具模块只导出当前工具 config。
4. `tool-core.js` 根据页面上的 `data-tool-id` 动态加载：
   - `/assets/tools/{tool-id}.js`
5. 修改 `scripts/build.mjs` 的 `toolPage()`：
   - 用 `<script type="module" src="/assets/tool-core.js"></script>` 替代全量 `tools.js`。

### 阶段 3：构建复制

1. 修改 `scripts/build.mjs` 的资产复制逻辑。
2. 确保 `src/assets/tools/` 被复制到 `dist/assets/tools/`。
3. 保留错误 fallback：如果工具模块加载失败，显示可读错误，不让页面空白。

### 验收标准

- 每个工具页不再加载 `/assets/tools.js`。
- 每个工具页只加载 `tool-core.js` 和自己的工具模块。
- 至少抽查 10 个工具，表单、输出、复制按钮都正常。
- `npm run build` 成功。

### 风险

- 动态 import 路径在 GitHub Pages 上必须是绝对路径或稳定相对路径。
- 如果某些工具共享大量数据，拆分时需要避免重复复制大表。
- 初次重构容易漏工具，建议先拆 5 个工具做试点，再批量迁移。

## P0-3：增加静态社交预览图

### 问题

抽样页面没有 `og:image` 和 `twitter:image`。这不一定直接影响 Google 排名，但会影响分享、收藏、品牌信任和链接点击率。

### 目标

每个重要页面至少有稳定的社交预览图。

### 具体步骤

1. 新建图片目录：
   - `src/assets/social/`
2. 先制作基础图片：
   - `og-default.png`
   - `og-tools.png`
   - `og-seo.png`
   - `og-html.png`
   - `og-css.png`
   - `og-assets.png`
   - `og-github-pages.png`
3. 可选：为 Top 20 工具生成工具专属 OG 图。
4. 修改 `pageShell()` 参数：
   - 新增 `image` 或 `ogImage` 参数。
5. 在 `pageShell()` 中输出：
   - `og:image`
   - `og:image:width`
   - `og:image:height`
   - `twitter:card`
   - `twitter:image`
6. 页面分配逻辑：
   - 首页用 `og-default.png`。
   - `/tools/` 用 `og-tools.png`。
   - 分类页用分类图。
   - 工具页先用分类图，未来再用工具图。

### 验收标准

- 抽样页面有完整 social image meta。
- 图片 URL 是绝对 URL。
- 图片实际存在于 `dist/assets/social/`。
- Open Graph preview 工具可以读取。

### 风险

- 图片文件不要太大，建议 1200x630，压缩后控制在合理体积。
- 不要用过多文字，移动分享卡片上容易看不清。

## P1-4：增强重点工具页内容

### 问题

当前抽样工具页约 500-540 词，结构清楚但可能模板化。对 AI 引用和传统排名来说，重点工具页需要更有独特性、示例性和解释深度。

### 目标

让重点工具页成为“任务答案页”，不是只有一个表单和通用说明。

### 优先页面

1. `fetch-priority-attribute-generator`
2. `preload-tag-builder`
3. `modulepreload-tag-generator`
4. `image-loading-attribute-builder`
5. `csp-starter-policy-generator`
6. `permissions-policy-generator`
7. `llms-txt-generator`
8. `static-sitemap-xml-builder`
9. `github-pages-workflow-generator`
10. `css-anchor-positioning-generator`

### 数据结构计划

在 `data/tools.en.json` 中为重点工具增加可选字段：

- `quickAnswer`
- `bestFor`
- `notFor`
- `compatibility`
- `limitations`
- `comparison`
- `troubleshooting`
- `realExamples`

先只在英文加字段。其他语言可用默认模板或暂不渲染。

### 模板计划

修改 `toolPage()`：

1. 如果有 `quickAnswer`，在工具 UI 上方或下方渲染短答案块。
2. 如果有 `comparison`，渲染表格。
3. 如果有 `realExamples`，渲染真实输入/输出示例。
4. 如果有 `limitations`，渲染限制说明。
5. 所有新增区块必须可选，避免破坏已有 67 个工具。

### 内容写作规则

- 每个新增区块都要服务实际使用。
- 避免空泛句子。
- 不堆砌关键词。
- 优先写“什么时候用、什么时候不用、常见误解、复制示例”。

### 验收标准

- 10 个重点工具页至少增加 2 个独特区块。
- 页面仍然先显示工具，用户不需要先读长文。
- 抽样页面词数可提升到 700-1,100，但不强求所有页面同字数。
- JSON-LD 仍有效。

### 风险

- 增加字段后要保证 build 对旧工具兼容。
- 翻译内容不足时，不要用机器式长文本填充多语言页面。

## P1-5：重写目录页和分类页 Title

### 问题

当前 `/tools/` 和分类页 title 偏泛，例如 `Free Web Tools - jquery.app`、`Free CSS Tools - jquery.app`。

### 目标

让目录页和分类页承接更具体的搜索意图。

### 具体步骤

1. 在 `data/locales.json` 找到：
   - `freeWebToolsTitle`
   - `freeWebToolsDescription`
   - 分类相关 title/description。
2. 修改 `toolsIndexPage()` 的 title 来源，避免硬编码泛标题。
3. 修改 `categoryPage()`：
   - 当前 title 是 `Free ${details.name} - ${site.siteName}`。
   - 改为使用 category 数据里的 `seoTitle`，没有则 fallback。
4. 在 `data/categories.en.json` 给每个分类加：
   - `seoTitle`
   - `seoDescription`

### 推荐英文标题

- `/tools/`: `Free Static Website Tools for SEO, HTML, CSS & GitHub Pages`
- `/tools/css/`: `CSS Generators for Responsive Layouts, Mobile Fixes & Static Sites`
- `/tools/html/`: `HTML Snippet Tools for Static Sites, Blogs & Web Publishing`
- `/tools/seo/`: `SEO Tag Generators for Static Websites and Blog Publishers`
- `/tools/github-pages/`: `GitHub Pages Tools for Custom Domains, Deploys & Static Sites`
- `/tools/assets/`: `Image, Favicon & Manifest Tools for Static Websites`

### 验收标准

- 每个分类页 title 不再是简单 `Free X Tools`。
- Meta description 能准确描述分类里的工具。
- 多语言页面仍能正常构建。

### 风险

- 标题不要太长。
- 不要把一个分类页塞入过多不相关关键词。

## P1-6：扩展 Collection 工作流页

### 问题

抽样 collection 页 `github-pages-workflow` 约 362 词。作为工作流落地页偏薄。

### 目标

把 collection 页从“工具集合”升级为“完成任务的步骤页”。

### 具体步骤

1. 检查 `data/collections.en.json` 的结构。
2. 为每个 collection 增加字段：
   - `workflowSteps`
   - `checklist`
   - `commonMistakes`
   - `recommendedOrder`
   - `relatedCollections`
3. 修改 `collectionPage()`：
   - 在工具列表前后加入工作流步骤和 checklist。
   - 保持工具链接清晰。
4. 优先扩展：
   - GitHub Pages publishing workflow。
   - Beginner CSS。
   - Blog publisher。
   - Multilingual site。

### 内容方向

GitHub Pages 页示例结构：

1. Prepare static output.
2. Configure custom domain.
3. Check DNS records.
4. Add sitemap, robots.txt, 404 page.
5. Test canonical and social previews.
6. Submit sitemap to Search Console.

### 验收标准

- 每个核心 collection 页达到 700-1,100 词左右。
- 页面包含步骤、工具链接、常见错误。
- 工具链接保持静态 HTML。

### 风险

- 不要把 collection 页写成博客文章，仍要保持可扫描。

## P1-7：调整 FAQPage Schema 使用策略

### 问题

工具页有 FAQPage JSON-LD。FAQ 内容对用户有用，但不应被当作主要 Google 富结果策略。

### 目标

保留有用 FAQ，确保结构化数据准确，不为了 schema 过度制造问答。

### 具体步骤

1. 检查 `toolPage()` 中 FAQPage 生成逻辑。
2. 确保 FAQPage 只在页面可见 FAQ 存在时输出。
3. 确保 JSON-LD 中的问题和答案与页面文本完全一致。
4. 考虑加一个构建时校验：
   - FAQ 数量为 0 时不输出 FAQPage。
   - FAQ 字段缺 answer/name 时构建警告。
5. 不需要全站删除 FAQPage，但要避免把 FAQ 当作排名核心。

### 验收标准

- 抽样工具页 FAQPage 与可见 FAQ 一致。
- 无空 FAQ、重复 FAQ、隐藏 FAQ。
- Google Schema validator 不报结构错误。

### 风险

- 删除全部 FAQPage 没必要，可能降低 AI 抽取便利性。

## P1-8：增强实体和信任信号

### 问题

Organization schema 很简短，About 页面也可以更强。工具站提供技术建议，需要明确维护、隐私和适用边界。

### 目标

让用户和 AI 系统更清楚：网站是谁服务、如何维护、是否上传数据、输出是否需要复核。

### 具体步骤

1. 扩展 About 页面英文内容：
   - 目标用户。
   - 工具如何工作。
   - 数据隐私。
   - 技术内容维护方式。
   - 输出复核边界。
2. 在 `pageShell()` 或工具页附近增加简短隐私提示：
   - `Inputs run in your browser and are not uploaded by this tool.`
3. 扩展 Organization/WebSite schema：
   - `description`
   - `url`
   - `sameAs`，如果有 GitHub repo 或社交 profile。
4. 给重点工具页增加可选 `lastUpdated` 字段。
5. 在工具页显示 `Last updated`，前提是确实维护。

### 验收标准

- About 页面内容更具体，不再像占位说明。
- 工具 UI 附近有清晰隐私说明。
- Organization schema 更完整但不过度虚构。

### 风险

- 不要编造作者、公司、资质、社交账号。
- `lastUpdated` 必须真实维护，否则会损害信任。

## P2-9：工具目录增加搜索和过滤

### 问题

`/tools/` 已有 67 个工具。长列表可被抓取，但用户发现具体工具的效率下降。

### 目标

增加轻量客户端搜索，同时保留所有工具静态链接。

### 具体步骤

1. 在 `toolsIndexPage()` 为每张工具卡加 data 属性：
   - `data-tool-name`
   - `data-category`
   - `data-keywords`
2. 在 `/tools/` 页面顶部增加：
   - 搜索框。
   - 分类 filter chips。
   - 可选 workflow filters。
3. 新建小脚本：
   - `src/assets/tool-directory-filter.js`
4. 只在 `/tools/` 加载该脚本，不要放进全站 JS。
5. 搜索逻辑只隐藏/显示已有静态卡片。

### 验收标准

- 无 JS 时所有工具仍可见。
- 有 JS 时搜索和分类过滤正常。
- 移动端搜索框可用。
- 脚本体积小，不依赖外部库。

### 风险

- 不要让过滤结果改变 URL，除非后续有明确需求。
- 不要因 JS 错误导致工具列表不可见。

## P2-10：优化移动导航

### 问题

当前导航在小屏下横向滚动。工具数量增加后，分类和语言入口可能不够明显。

### 目标

让 360px-430px 宽度用户能快速找到工具、分类和语言，不出现遮挡。

### 具体步骤

1. 用浏览器或 Playwright 检查：
   - 360x740
   - 390x844
   - 430x932
2. 检查：
   - 顶部品牌是否挤压导航。
   - language menu 是否可点。
   - nav 横向滚动是否明显。
   - 工具 UI 是否超宽。
3. 设计方案：
   - 保留顶部核心链接：Tools、SEO、HTML、CSS。
   - 将 Assets、GitHub Pages 放入 More 菜单，或在工具页提供分类 chips。
4. CSS 修改集中在 `src/assets/styles.css` 的移动 media query。

### 验收标准

- 360px 宽度无横向页面溢出。
- 导航和语言选择不重叠。
- 工具表单、输出框、按钮不挤压。

### 风险

- 不要把导航完全隐藏到汉堡菜单里，除非实现可访问键盘操作。

## P2-11：控制 CSS 和首屏渲染成本

### 问题

`styles.css` 约 18KB，当前不算大，但它是 render-blocking。未来设计扩展可能让 CSS 膨胀。

### 目标

保持 CSS 小而稳定，必要时再做 critical CSS。

### 具体步骤

1. 建立 CSS 体积预算：
   - 短期保持低于 30KB 未压缩。
   - 重点防止重复组件样式。
2. 检查无用样式：
   - 搜索不再使用的 class。
3. 如果 PageSpeed 显示 CSS 阻塞明显，再考虑：
   - 内联首屏 critical CSS。
   - 延迟非首屏 CSS。
4. 不引入 UI 框架。

### 验收标准

- CSS 体积没有随功能增加快速膨胀。
- 页面视觉保持一致。
- PageSpeed 没有明显 render-blocking CSS 问题。

### 风险

- 过早拆 CSS 会增加复杂度。先测量，再优化。

## P2-12：建立 Core Web Vitals 字段数据流程

### 问题

本地检查无法确认真实 LCP、INP、CLS。

### 目标

部署后用真实数据确认性能问题，而不是只靠猜测。

### 具体步骤

1. 确认网站已接入 Google Search Console。
2. 提交 sitemap。
3. 等待 Core Web Vitals field data。
4. 定期检查：
   - 首页。
   - `/tools/`。
   - 重点工具页。
   - textarea-heavy 工具页。
5. 用 PageSpeed Insights 抽测移动端：
   - LCP。
   - INP。
   - CLS。
   - Total Blocking Time。
6. 将结果记录到本地 `todo.md` 或单独 `metrics.md`。

### 验收标准

- 有 Search Console 和 PageSpeed 的基准数据。
- 关键页面移动端 LCP <= 2.5s。
- INP <= 200ms。
- CLS <= 0.1。

### 风险

- 新站可能没有足够 CrUX 数据，需要先用 lab data 过渡。

## P2-13：增加优先内部链接模块

### 问题

相关工具链接已有，但可以更强地把工具组织成工作流。

### 目标

让用户和搜索引擎理解工具之间的使用顺序和主题集群。

### 具体步骤

1. 在 `data/tools.en.json` 中增加可选字段：
   - `nextTools`
   - `useWith`
   - `workflow`
2. 修改 `toolPage()`：
   - 渲染 `Use this with`。
   - 渲染 `Next step`。
   - 渲染 `Related workflow`。
3. 先为重点集群配置：
   - Fetch Priority -> Preload -> Image Loading -> Responsive Image。
   - CSP -> Permissions-Policy -> Referrer Policy -> Iframe Sandbox。
   - Hreflang -> Canonical -> Sitemap -> Robots。
   - GitHub Pages Workflow -> CNAME -> DNS -> 404 -> Sitemap。

### 验收标准

- 重点工具页有上下文链接，不只是随机 related tools。
- 链接锚文本描述动作或关系。
- 不出现死链。

### 风险

- 不要每页塞太多链接。优先 3-5 个高相关链接。

## P2-14：增加真实输入示例

### 问题

部分工具示例偏通用。真实输入示例能提升用户信任和 AI 引用价值。

### 目标

每个重点工具都有 1-3 个贴近真实网站发布场景的示例。

### 具体步骤

1. 在 `data/tools.en.json` 的重点工具中扩展 `examples`。
2. 示例格式统一：
   - Scenario。
   - Input。
   - Output。
   - Why this works。
3. 优先场景：
   - GitHub Pages custom domain。
   - Blog post URL。
   - Documentation page。
   - Static image path。
   - Multilingual page set。
4. 修改模板保证示例格式可读。

### 验收标准

- 重点工具页示例不再只是抽象说明。
- 输出可以复制。
- 示例不包含虚假品牌或误导性 URL。

### 风险

- 示例 URL 可使用 `https://example.com/` 或 `https://www.jquery.app/`，避免指向真实第三方。

## P3-15：增加短答案块

### 问题

AI answer engines 偏好短、完整、可引用的段落。当前页面有说明，但不一定有明确 answer block。

### 目标

重点页加入清晰的 quick answer，让用户和 AI 都能快速理解工具用途。

### 具体步骤

1. 在 `data/tools.en.json` 增加 `quickAnswer`。
2. 修改 `toolPage()` 在 H1/lede 后渲染。
3. 文案模式：
   - 1-3 句。
   - 直接回答概念或最佳用法。
   - 不写营销语。
4. 示例：
   - `Use fetchpriority="high" only for the one image or resource most likely to become the Largest Contentful Paint element. Do not mark many resources as high priority because the browser still has to choose what to load first.`

### 验收标准

- 重点页有可见 quick answer。
- 内容准确、短、可独立引用。
- 不影响工具 UI 的首屏使用。

### 风险

- 不要把 quick answer 写成重复 meta description。

## P3-16：增加概念对比表

### 问题

很多 Web 概念容易混淆，搜索和 AI 问答中常见“X vs Y”。当前工具页可以更好承接这些查询。

### 目标

为重点工具增加对比表，提升用户理解和长尾搜索覆盖。

### 优先对比

- `preload` vs `prefetch` vs `modulepreload`。
- `async` vs `defer` vs `type="module"`。
- `loading="lazy"` vs `fetchpriority`。
- `canonical` vs `hreflang`。
- `robots.txt` vs robots meta vs X-Robots-Tag。
- CSP vs Permissions-Policy vs Referrer-Policy。

### 具体步骤

1. 在 `data/tools.en.json` 增加 `comparison` 字段。
2. 字段结构：
   - `columns`
   - `rows`
   - `summary`
3. 修改 `toolPage()` 渲染响应式表格。
4. CSS 确保移动端不溢出：
   - 可横向滚动表格。
   - 或卡片式对比。

### 验收标准

- 表格内容准确。
- 移动端可读。
- 对比表不是空泛 SEO 内容，能实际指导选择。

### 风险

- 技术概念会变，需定期维护。

## P3-17：精选化 `llms.txt`

### 问题

`llms.txt` 已经列出大量工具。随着工具增长，它可能变成长目录，削弱“告诉 AI 这个网站最重要内容是什么”的作用。

### 目标

让 `llms.txt` 更像 AI 入口指南，而不是完整 sitemap。

### 具体步骤

1. 修改 `scripts/build.mjs` 中 `llms.txt` 生成逻辑。
2. 保留：
   - Home。
   - All tools。
   - About。
   - Privacy。
   - Terms。
   - 核心分类页。
3. 新增：
   - `Core Workflows`。
   - `Priority Tools`。
   - `Tool Categories`。
4. 不必列出所有工具，或把完整工具列表放到后半部分。
5. 从 `data/tools.en.json` 中增加可选字段：
   - `priorityForLlms`
   - `workflowGroup`

### 验收标准

- `dist/llms.txt` 更短、更清晰。
- AI/人类读者能快速理解网站主题和核心工具。
- 不影响 sitemap，完整 URL 发现仍由 sitemap 完成。

### 风险

- `llms.txt` 是新兴约定，优先保持可读和准确，不要过度工程化。

## 统一验证计划

### 每批代码后

1. 运行 `npm run build`。
2. 抽查：
   - `dist/index.html`
   - `dist/tools/index.html`
   - 一个分类页。
   - 一个 collection 页。
   - 5 个工具页。
3. 确认 canonical、hreflang、title、description 正常。
4. 确认 JSON-LD 没有明显语法错误。
5. 确认 `dist/sitemap.xml` 仍生成。
6. 确认 `dist/llms.txt` 仍生成。

### 部署后

1. PageSpeed Insights：
   - 首页。
   - `/tools/`。
   - 5-10 个重点工具页。
2. Search Console：
   - sitemap 提交状态。
   - 页面索引状态。
   - Core Web Vitals。
3. 手动移动端检查：
   - 360px。
   - 390px。
   - 430px。

## 推荐任务拆分

### Sprint 1：P0 基础

- 首页 title/meta/H1。
- OG image 基础设施。
- `tools.js` 拆分试点 5 个工具。

### Sprint 2：P1 内容

- 10 个重点工具页内容增强。
- 目录页和分类页 title 重写。
- collection 页扩展。

### Sprint 3：P2 UX / Performance

- `/tools/` 搜索过滤。
- 移动导航调整。
- 内部链接模块。
- 真实示例模块。

### Sprint 4：P3 GEO

- Quick answer。
- 对比表。
- 精选版 `llms.txt`。
- 验证 schema 和 PageSpeed。

## 完成定义

本计划完成时应满足：

- 首页和核心目录页定位更精准。
- 工具页内容更有独特性，不像纯模板页。
- 单个工具页不再加载所有工具逻辑。
- 重要页面有 social preview image。
- `/tools/` 对用户更容易检索。
- 移动端无明显导航和布局问题。
- `llms.txt` 对 AI 抓取更聚焦。
- 部署后有 Search Console / PageSpeed 的监控流程。

# 全面成熟工具站审核与整改计划（2026-05-25）

本节是对已上线站点的最新全面审核，优先级高于前文中与它冲突的旧建议。执行目标不是继续堆工具数量，而是把 `jquery.app` 变成可靠、快速、可发现、有鲜明品牌理念的成熟工具站。

## 一、定位基准

品牌理念：

`You might not need AI.`

网站解决的问题：

- 在 AI Coding 和 AI Design 普及后，许多 Web development、Web design、mobile UI、SEO 与发布前任务仍然是确定、短小、重复的工作。
- 这些任务用轻量浏览器工具更快，不需要打开大型 AI 工作流，也不需要消耗额外 tokens。
- 站点应是“小而美、全而不杂乱”的工具体系，而不是只服务静态网站，也不是泛化的旧式开发者工具箱。

因此：

- `Static Website Tools` 可以是一个工具主题或 collection，不应成为站点总定位。
- 首页要以 no-AI / lightweight task tools 作为差异化，以 `web tools`, `developers`, `designers`, `HTML`, `CSS`, `SEO`, `mobile UI`, `publishing` 作为可搜索的任务语义。
- 工具选题和内容架构应可以继续覆盖 design helpers、mobile UI helpers、accessibility、performance、browser platform、publishing 与 site maintenance。

## 二、审核范围与已验证事实

### 审核范围

本次检查了：

- 数据与生成逻辑：`data/*.json`, `scripts/build.mjs`, `src/assets/styles.css`, `src/assets/tools.js`。
- 完整生成输出：`dist/` 中的页面、资产、robots、sitemap 与 llms 文件。
- 已部署线上页面：
  - `https://www.jquery.app/`
  - `https://www.jquery.app/tools/`
  - `https://www.jquery.app/tools/fetch-priority-attribute-generator/`
  - `https://www.jquery.app/ja/collections/github-pages-workflow/`
  - 随机不存在 URL 的 404 响应。
  - `https://jquery.app/` 与 `https://cdn.jquery.app/` 的主机状态。

### 站点规模

- 工具总数：67。
- 工具分类：5 个，分别为 `seo`, `html`, `css`, `assets`, `github-pages`。
- 语言：6 个，分别为 `en`, `de`, `fr`, `es`, `ja`, `nl`。
- Sitemap URL 数：492。
- 生成的 `index.html` 页面数：574；另有 `404.html`。
- 旧 `/en/` 路径 noindex redirect 页面：82。

### 已经做得好的地方

- 页面是真正的静态 HTML，主要说明内容不依赖 JavaScript 才能抓取。
- 所有抽查及批量页面均有 title、description、canonical 和单一 H1。
- 站内生成 HTML 引用检查未发现内部死链。
- `robots.txt` 可访问并引用 sitemap。
- `llms.txt` 已存在。
- JSON-LD 均可解析；当前主要类型包含 `WebSite`, `Organization`, `WebApplication`, `BreadcrumbList`, `ItemList`, `FAQPage`, `WebPage`。
- 工具页在线可交互，抽查页无 console error。
- 工具页已经说明 browser-only 与输入不上传，这是强信任信号。
- 首页已经出现 `Most tiny web problems are not AI problems.`，说明品牌理念已有雏形。

### 无法在本次审核中确认的数据

- PageSpeed Insights API 返回配额超限，未取得可引用的 Lighthouse/CrUX 分数。
- 未读取 Google Search Console、Bing Webmaster Tools 或真实流量数据。
- 没有 GA4/Plausible/Umami 等使用数据可判断搜索、复制、重复使用和跳出情况。

后续不能把“性能很好”或“有排名提升”当作既定事实，必须在部署后补数据验证。

## 三、执行优先级总表

| 优先级 | 问题 | 影响 | 首要动作 |
| --- | --- | --- | --- |
| P0 | 裸域 `https://jquery.app/` 证书错误 | 用户流失、品牌信任、索引与外链损失 | 修复 apex DNS/HTTPS，并 301 到 `www` 或改为统一主域 |
| P0 | 多语言页面存在混合语言与通用模板内容 | 国际 SEO 质量、用户信任、规模化低质风险 | 暂停低质量语言索引或完整本地化核心页面 |
| P0 | 工具输出存在事实性错误 | 工具信任、用户代码错误、品牌受损 | 修正已发现错误并建立工具回归测试 |
| P0 | Contact 页仍含占位文字 | 信任、反馈闭环、E-E-A-T/GEO | 设置真实联系渠道并删除 preview 占位文案 |
| P1 | 首页定位未完整承载 no-AI 理念 | 品牌、点击率、未来扩展空间 | 改 title/meta/H1/hero/collection 结构 |
| P1 | 每个工具页加载全部 160KB JS | 工具可用速度、移动交互、INP 风险 | 按工具或类别拆分加载 |
| P1 | Sitemap `lastmod` 每次构建全部刷新 | 抓取信号可信度 | 保存真实页面修改日期，并补 hreflang sitemap |
| P1 | 所有页面没有真实社交图片 meta | 分享点击、品牌识别 | 建立 OG 图片和页面映射 |
| P1 | 目录发现与分类体系滞后于 67 个工具 | 用户找到工具的效率 | 搜索/过滤/主题 collections/标签 |
| P1 | schema 与 FAQ 策略需要治理 | 实体清晰度、标记准确性 | 稳定 Organization，清理通用 FAQ 标记 |
| P2 | 响应头与缓存能力弱 | 安全、重复访问速度 | 评估 Cloudflare/其他前置层与资产缓存策略 |
| P2 | 动态输出无无障碍状态播报 | 键盘和读屏用户体验 | 加 `aria-live`、copy 状态与错误提示 |
| P2 | 测量体系缺失 | 无法知道什么工具有效 | GSC + 隐私友好 analytics + event plan |
| P2 | 变现准备未设计 | 未来广告可能伤害体验和 CWV | 先定广告/赞助约束和 CLS 预算 |
| P3 | llms.txt 与 GEO 内容体系未随规模升级 | AI 可引用性和主题理解 | 按工作流精选、增加可引用答案块 |

## 四、P0：上线可信度与质量问题

## P0-1 修复裸域 HTTPS 与主机规范化

### 证据

- 线上打开 `https://www.jquery.app/` 正常。
- 线上打开 `https://jquery.app/` 返回浏览器证书错误：`ERR_CERT_COMMON_NAME_INVALID`。
- 线上打开 `http://www.jquery.app/` 最终进入 HTTPS `www` 页面。
- `https://cdn.jquery.app/` 当前返回 GitHub Pages 的 404 页面；搜索发现检查中该旧子域可能仍可被发现。

### 为什么必须优先修

- 用户输入不带 `www` 的域名时会看到安全警告，直接损害品牌。
- 外部链接、口口相传、AI 引用或浏览器自动补全可能使用 apex 域名。
- 一个成熟站点不能让主域入口处于证书错误状态。

### 实施步骤

1. 决定唯一 canonical host：
   - 推荐继续使用现有 canonical：`https://www.jquery.app/`。
   - 裸域 `https://jquery.app/` 必须支持有效证书并永久跳转到 `www`。
2. 检查域名 DNS：
   - `www` CNAME 指向 GitHub Pages 所需目标。
   - apex 按 GitHub Pages 官方说明配置 A/AAAA，或放到支持 apex redirect 与 SSL 的 DNS/CDN 服务上。
3. 在 GitHub Pages custom domain 设置中确认 `www.jquery.app` 及 HTTPS enforcement。
4. 如果 GitHub Pages 无法可靠处理 apex redirect，使用 Cloudflare 等 DNS/CDN 层：
   - 为 apex 提供有效证书。
   - 配置 301 redirect 到 `https://www.jquery.app/$path`。
5. 对 `cdn.jquery.app`：
   - 如果不再使用，删除 DNS 记录或正确设置 noindex/404 清理路径。
   - 在 Google Search Console 对应 property 中检查是否存在索引 URL，必要时使用移除工具并等待重新抓取。
6. 确认所有 canonical、sitemap、hreflang、OG URL 只使用统一 canonical host。

### 验收标准

- `https://jquery.app/any-path` 不再出现证书错误，并返回到对应 `https://www.jquery.app/any-path` 的永久跳转。
- `http://jquery.app/` 与 `http://www.jquery.app/` 都正确跳转到 HTTPS canonical。
- `cdn.jquery.app` 不再向搜索系统暴露无意义的 GitHub Pages 404 内容。
- Search Console 同时验证 domain property 与主 canonical URL property。

### 涉及位置

- DNS / GitHub Pages / 可选 Cloudflare 设置，非单纯代码改动。
- `data/site.json` 和 `dist/CNAME` 用于确认 canonical host 不变。

## P0-2 管理国际化规模化页面质量

### 证据

- 当前有 6 种语言、492 个 sitemap URL。
- `localizeTools()` 对非英文页主要用统一 `toolTemplates` 生成说明、用途、错误与 FAQ。
- `buildLocale()` 使用 `const collections = sourceCollections;`，collection 数据没有本地化。
- 线上日文 `GitHub Pages Publishing Workflow` 页面中：
  - 导航和工具名称部分是日文。
  - H1、lede、介绍、best-for、FAQ 内容大量保持英文。
- 非英文首页仍以 `Static Website Tools` 为 title 定位，与 no-AI 品牌目标不一致。
- 批量分析发现多个跨语言重复 title group。

### 风险

- 页面虽然能索引，但对目标语言用户不是完整产品体验。
- 混合语言和模板化内容容易造成低满意度、低 engagement、弱链接价值。
- 过早让数百个低深度 localized URLs 被索引，会分散抓取和维护精力。

### 推荐策略

不要继续自动扩张多语言 URL，先设质量门槛。

### 实施步骤

1. 定义语言上线门槛：
   - 首页、tools 目录、5 个 category、4 个 collection、隐私/条款/联系页面必须完整本地化。
   - 每种语言至少挑选 15-20 个最有用工具，提供真实本地化说明而非通用模板。
2. 在达到门槛前选择一种方式：
   - 方案 A：暂时对不完整 locale 页输出 `noindex, follow`，从 sitemap 移除。
   - 方案 B：仅保留英文索引，完成一个语言后再开启该语言 sitemap/hreflang。
3. 修改数据结构：
   - 增加 `collections` 的 locale overrides。
   - 分类页所有静态 rail 文字如 `Runs in your browser`、`No account required` 改为 UI 翻译字段。
   - 工具页硬编码 `Before publishing` 也必须本地化。
4. 为非英文工具内容增加质量状态：
   - `translationStatus: "draft" | "reviewed" | "published"`。
   - 构建器只把 `published` 的 locale 页面写入 sitemap 和 hreflang。
5. 改写多语言首页 title/meta 以匹配 no-AI 总理念，而不是静态站限定词。
6. 在发布语言前进行母语校对，至少审核首页、目录、collection 和流量目标工具。

### 验收标准

- 任意可索引 locale 页不混用未说明的英文段落。
- Hreflang 只引用真实等价、可索引、质量合格的页面。
- Sitemap 不包含 draft locale 页面。
- 语言页面具有自己准确的 title、meta、visible content 与 structured data 文案。

### 涉及文件

- `scripts/build.mjs`
- `data/locales.json`
- `data/collections.en.json`，或新增 locale collection 文件
- `data/categories.en.json`
- `data/tools.en.json`，或新增 translation status 数据

## P0-3 建立工具输出正确性审查与回归测试

### 证据

线上 `Fetch Priority Attribute Generator` 默认选择 hero `<img>` 时，输出为 `<img ... fetchpriority="high">`，但紧接着说明：

`Place this tag in the <head> of your document.`

普通内容 `<img>` 应在 body 内容结构中，而不是 `<head>`。只有相应的 preload/link 元素属于 head。

### 风险

- 用户复制错误建议到真实项目。
- 工具站一旦有明显错误，用户会怀疑其它 66 个工具的输出。
- SEO/GEO 内容再好也不能弥补工具结果不可靠。

### 实施步骤

1. 立即修正 fetch-priority 工具：
   - 当类型为 `img` 时，说明改为将图像元素放在页面内容中的 LCP 图片位置。
   - 当类型为 `link` preload/stylesheet 时，才说明放在 `<head>`。
   - 当类型为 `script` 时，根据用途输出准确位置和加载建议。
2. 建立测试目录，例如：
   - `test/tools/fetch-priority-attribute-generator.test.mjs`
   - `test/tools/preload-tag-builder.test.mjs`
3. 为所有工具制定最小测试矩阵：
   - 默认输入输出。
   - 空输入或非法输入。
   - 特殊字符转义。
   - 关键语义/规范规则。
4. 对高风险工具优先测试：
   - CSP、Permissions-Policy、robots、canonical、hreflang、sitemap、JSON-LD、RSS/JSON Feed、GitHub Actions、iframe sandbox、script loading、fetch priority。
5. 在 GitHub Actions 部署前增加测试步骤。
6. 在工具页面为技术行为加入“检查官方文档/浏览器支持”的适度提示，并给关键工具维护更新时间。

### 验收标准

- 已发现的 `<img>` head 指引被修正。
- 高风险工具有自动测试。
- CI 在构建和部署前运行测试，错误输出不会直接上线。
- 每次修改 Web 平台建议时记录维护日期。

### 涉及文件

- `src/assets/tools.js`，后续拆分后是每工具模块
- `package.json`
- `.github/workflows/pages.yml`
- 新增 `test/` 文件
- 重点工具内容数据

## P0-4 设置真实联系渠道并清除上线占位文案

### 证据

线上 `/contact/` 仍显示：

`This preview site is published from GitHub... Add your preferred GitHub issue link or contact email here before wider promotion.`

### 风险

- 公开成熟站点显示未完成占位内容，降低可信度。
- 用户无法报告错误，工具正确性问题没有反馈闭环。
- 技术工具内容缺乏明确负责人和纠错渠道，影响信任与 GEO 实体信号。

### 实施步骤

1. 确定真实反馈渠道：
   - 公共 GitHub issue tracker，或
   - 域名邮箱，例如 `support@jquery.app`，或
   - 两者都提供。
2. 更新 Contact 页：
   - 显示可点击的真实链接或邮箱。
   - 说明 bug report 应包含输入、预期、实际输出、浏览器。
   - 增加 outdated guidance / accessibility / privacy 分类。
3. 更新 About：
   - 明确 `You might not need AI` 的建站缘由。
   - 说明工具由谁维护或至少说明维护方式和反馈路径。
   - 如需要，明确其与 jQuery library/project 是否无关联，避免域名语义混淆。
4. 检查 Privacy 中 `preview version` 等未上线用语，改为当前实际状态。
5. 如果有 GitHub repository，为 Organization schema 增加真实 `sameAs`。

### 验收标准

- Contact 页面没有 placeholder 或 preview 表述。
- 用户能通过真实渠道报告工具错误。
- About/Privacy/Terms 与线上实际服务一致。

### 涉及文件

- `scripts/build.mjs` 中 `simplePages()` 当前内嵌页面内容
- 建议后续将静态页面内容移到 `data/pages.en.json`，减少模板文件内硬编码

## 五、P1：品牌、SEO、GEO 与信息架构

## P1-1 重构首页信息架构与 metadata

### 现状判断

- 当前英文首页 title：`Small Web Tools for Building, Designing & Publishing`。
- 当前 H1 与 title 接近，尚未表达最鲜明的 no-AI 主张。
- 首页正文中已有 `Most tiny web problems are not AI problems.`，这是正确方向。
- 非英文首页被定位成 static website tools，与未来方向不符。

### 推荐首页框架

不要把 `No-AI` 单独作为搜索 title 的唯一词，也不要把网站限制到 static site。

建议用于实施前测试的英文文案：

- Title：`Small No-AI Web Tools for Developers & Designers | jquery.app`
- Meta：`Solve everyday HTML, CSS, SEO, mobile UI and publishing tasks with fast browser tools. No uploads, accounts or AI token costs.`
- H1：`You might not need AI for every web task`
- Subheadline：`Small browser tools for developers, designers and publishers: fix HTML, shape CSS, check SEO, prepare mobile UI and finish web work without token costs.`
- Primary CTA：`Browse all tools`
- Secondary CTA：`Explore by task`

Title 最终必须在 Search Console impressions/CTR 数据出来后再迭代，不应凭感觉频繁更改。

### 页面结构改进

1. Hero 第一屏明确：
   - 解决何种任务。
   - 为什么不用 AI。
   - 隐私与速度承诺。
2. 用 task-based入口替代只展示旧首发工具：
   - Build HTML snippets。
   - Style and mobile UI。
   - SEO and publishing。
   - Performance and browser behavior。
   - GitHub Pages and static hosting。
3. 增加“为什么不用 AI”短区块：
   - deterministic output。
   - no tokens。
   - local processing。
   - copy/paste and review。
4. 首页推荐工具不应永久固定前 6 个创建顺序：
   - 增加 `featured` / `featuredOrder` 数据。
   - 按品牌任务和用户需求选择推荐工具。

### 涉及文件

- `data/site.json`
- `data/locales.json`
- `scripts/build.mjs` 的 `homePage()`
- 未来可增加 homepage feature 数据配置

### 验收标准

- 首页读者在 5 秒内理解“何时不用 AI、这里能完成什么”。
- Title 不把站点限制为 static websites。
- 首页任务分类支持今后扩展 web/mobile design 工具。

## P1-2 拆分工具脚本，优化 Tool Time-to-Use

### 证据

- `src/assets/tools.js` / 线上解码后 JS 约 160.7KB。
- 线上抽样工具页传输脚本约 38.5KB gzip。
- 页面打开只需要一个工具，却加载 67 个工具交互实现。
- 工具 UI 完全由 JS mount，脚本越大，“工具可用”越晚。

### 实施设计

1. 将共享 UI/helper 拆到 `tool-core.js`：
   - 表单字段 helper。
   - mount/render。
   - output copy。
   - common escape utilities。
2. 将各工具 config 拆为单独 ES module，或先按小类别拆分。
3. `toolPage()` 输出当前工具脚本标识：
   - 只加载 core。
   - core 用 `data-tool-id` dynamic import 当前 module。
4. 为页面增加无 JS fallback 文案：
   - 工具需要 JS 运行，但正文和示例仍可阅读。
5. 为 build/CI 增加 bundle budget：
   - core 建议低于 15KB gzip。
   - 单工具脚本建议低于 10KB gzip，特殊数据型工具单独评估。

### 验收标准

- 打开任意工具页不再请求整包 `assets/tools.js`。
- 首页与工具目录不加载工具交互代码。
- 抽查 10 个工具功能一致。
- 在移动网络下工具表单能更快显示。

### 涉及文件

- `src/assets/tools.js`
- 新增 `src/assets/tool-core.js`
- 新增 `src/assets/tools/*.js`
- `scripts/build.mjs` 的 asset copy 和 `toolPage()`

## P1-3 修正 sitemap、hreflang 与抓取信号

### 证据

- `sitemap.xml` 含 492 个 URL。
- `sitemapXml()` 当前把 `new Date().toISOString().slice(0, 10)` 作为所有 URL 的 `<lastmod>`。
- 每次构建即使页面内容未改，也会把全站修改时间刷新为同一天。
- Sitemap 不含 `xhtml:link` alternate；页面 HTML 中有 hreflang。

### 风险

- 虚假的全站 lastmod 会削弱 sitemap 更新时间信号价值。
- 国际页面量增长后，仅依靠 HTML hreflang 的维护/验证成本更高。

### 实施步骤

1. 在页面源数据层维护真实更新时间：
   - 工具增加 `updatedAt`。
   - 分类与 collection 增加 `updatedAt`。
   - 简单页面增加 `updatedAt`。
2. Sitemap 为每条 URL 使用内容真实修改日期。
3. 只有内容或功能变更时更新对应页面日期，不因全站构建刷新所有日期。
4. 为语言等价组在 sitemap 增加 hreflang alternates，前提是该语言页达到可索引质量门槛。
5. 建立构建校验：
   - Sitemap URL 对应文件存在。
   - canonical 与 sitemap loc 一致。
   - hreflang reciprocity 完整。
   - draft/noindex 页面不进入 sitemap。

### 验收标准

- 全站 rebuild 不会无差别改写所有 `lastmod`。
- 只对 published locale 生成 alternate。
- GSC 中 sitemap 可正确解析且不提交 noindex URL。

### 涉及文件

- `scripts/build.mjs`
- `data/tools.en.json`
- `data/categories.en.json`
- `data/collections.en.json`
- 页面 locale 状态数据

## P1-4 添加 OG 分享图与品牌资产

### 证据

- 批量检查生成页面的 head，未找到 `<meta property="og:image">`。
- 站点当前只包含小型 SVG favicon，没有实际品牌分享资产。

### 实施步骤

1. 创建统一社交图体系：
   - 首页品牌图。
   - 每个任务主题/category 图。
   - 后期为重要工具创建单独图。
2. 在 `pageShell()` 支持：
   - `og:image`
   - `og:image:width`
   - `og:image:height`
   - `og:image:alt`
   - `twitter:image`
3. 工具页默认继承主题图；featured 工具使用工具图。
4. 图片必须清楚显示：
   - `jquery.app`
   - `You might not need AI`
   - 页面/工具名称，文字数量控制在分享卡可读范围。
5. 图片压缩，避免给页面增加过大负担。

### 验收标准

- 首页、所有分类、所有 collection 和 featured 工具有可预览分享图。
- 分享调试器显示正确标题、描述与图片。

## P1-5 建立符合愿景的主题架构和工具发现

### 证据

- 当前只有 5 个历史分类。
- 67 个工具中已经出现 performance、security、accessibility、modern CSS、feed、design/mobile 相关意图，但仍被放在 SEO/HTML/CSS 大桶中。
- `/tools/` 在线页有 67 个卡片但没有搜索输入或 filter。

### 目标

不必破坏已有 URL；在已有 category 之上增加 task taxonomy 和 collection 层。

### 建议主题层

- `No-AI Web Publishing`
- `HTML & Browser Markup`
- `CSS & Visual Design`
- `Mobile UI & Responsive Layout`
- `Performance & Loading`
- `Accessibility`
- `SEO & Discoverability`
- `Security & Privacy`
- `GitHub Pages & Static Hosting`

### 实施步骤

1. 为工具数据增加：
   - `topics`
   - `tasks`
   - `audiences`
   - `featured`
   - `relatedWorkflow`
2. 保留现有工具 URL 和 canonical，避免迁移风险。
3. 创建高价值 collection landing pages，而不是增加空分类 URL。
4. `/tools/` 加客户端搜索和 filters：
   - Tool name。
   - Topic。
   - Intended user/workflow。
5. 无 JS 时仍输出全量工具链接；搜索只是 progressive enhancement。
6. 首页推荐 task collection，而不只是最早的 6 个工具。

### 验收标准

- 用户可以在 1-2 步内找到 performance、mobile UI 或 accessibility 工具。
- 新的品牌边界支持未来工具扩展。
- 现有 URL 与索引信号不受损。

### 涉及文件

- `data/tools.en.json`
- `data/collections.en.json`
- `scripts/build.mjs`
- 新增小型 directory filter JS
- `src/assets/styles.css`

## P1-6 内容深度、GEO 可引用性与程序化页面治理

### 证据

- 英文主页面 82 个，其中 10 个页面低于 400 words，包含 4 个 collection/category landing pages。
- 英文工具页面平均约 561 words；最薄的具体工具页从约 471 words 起。
- 非英文工具页使用统一 template，独特解释深度不足。
- Collection 页面尚未覆盖新增的 67 工具体系。

### 原则

工具页不是长文博客，不应为了字数添加废话。改进重点是任务准确性、具体示例和可引用答案。

### 实施步骤

1. 把工具页内容模型扩展为可选模块：
   - `quickAnswer`
   - `whenToUse`
   - `whenNotToUse`
   - `browserSupport` 或 `hostingLimitations`
   - `comparisonTable`
   - `realWorldExamples`
   - `verificationSteps`
   - `updatedAt`
2. 先增强高意图工具 cluster：
   - loading/performance：fetch priority、preload、modulepreload、image loading、script loading。
   - indexability：canonical、hreflang、robots、sitemap。
   - security/privacy：CSP、permissions、referrer、iframe sandbox。
   - mobile/design：safe area、viewport units、anchor positioning、popover。
3. 将 collection 改成真正的工作流页面：
   - 背景问题。
   - 步骤顺序。
   - 何时使用哪些工具。
   - Checklist。
   - 常见错误。
4. GEO 内容要求：
   - 每个重点页顶部有 2-3 句可独立理解的 direct answer。
   - 对容易混淆的概念增加对比表。
   - 结论以可验证 Web 标准或官方文档为依据。
5. 为未来批量工具设上线 quality gate：
   - 有可运行功能。
   - 有具体示例。
   - 有错误/限制提醒。
   - 有相关工作流链接。
   - 有人工正确性审核。

### 验收标准

- 核心 collection 页是可完成任务的指南，不只是卡片页。
- 重点工具页具备独特 answer blocks 和验证说明。
- 新工具没有仅替换名称的薄模板正文。

## P1-7 治理 structured data 与实体表达

### 证据

- JSON-LD 无解析错误。
- 工具页共输出大量 `WebApplication` 与 `FAQPage`。
- `homePage()` 对每个 locale 的 `Organization.url` 使用 locale homepage URL；组织实体应尽量使用一个稳定主 URL。
- Breadcrumb schema 中 `Home` 与 `Tools` 文案在非英文页仍可能硬编码英语。
- 工具站不属于可从 FAQ rich result 获得普遍收益的政府/健康站点类型。

### 实施步骤

1. 保留一个稳定 Organization entity：
   - `url: https://www.jquery.app/`
   - 只有存在真实官方资料时才加 `sameAs`。
   - 添加准确 description，不虚构公司或作者资质。
2. WebSite / WebPage 按 locale 表示 `inLanguage` 和对应 URL。
3. Breadcrumb 文案在每种语言中本地化。
4. FAQ：
   - 仅页面可见且真正解决疑问时保留。
   - 不把 FAQPage 作为 Google 富结果增长策略。
   - 非英文模板化 FAQ 在未完成本地化前不要批量输出。
5. WebApplication：
   - 确保 name、description、URL 与页面一致。
   - 检查免费 Offer 是否有必要；保留时确保含义准确。

### 验收标准

- Schema validator 无错误或明显实体重复问题。
- 非英文页面 schema 文案与页面语言相符。
- Organization 统一指向主站实体。

## 六、P2：性能、安全、可访问性与产品运营

## P2-1 缓存与安全响应头策略

### 证据

线上同源读取到的响应头显示：

- HTML、CSS、JS 的 `cache-control` 均为 `max-age=600`。
- `tools.js` 和 `styles.css` 内容可 gzip 传输。
- 未读取到响应头形式的：
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`

### 判断

- 当前无第三方脚本、无账户和无上传，使风险低于动态应用。
- 但成熟站点仍应有合理缓存和基本安全头。
- GitHub Pages 原生对自定义 response headers 能力有限；不要在代码中假设可直接设置这些头。

### 实施路径

1. 短期在 GitHub Pages 上：
   - 继续避免第三方脚本。
   - 可谨慎评估 `<meta http-equiv="Content-Security-Policy">`，但明确其不支持所有 header 能力。
2. 中期若需要更完整性能/安全控制：
   - 用 Cloudflare 代理 `www` 和 apex。
   - 设置静态资产长期缓存，文件名 fingerprint 后可设 immutable。
   - 设置 HSTS、nosniff、Referrer-Policy、Permissions-Policy、CSP。
3. 重构资产输出：
   - 指纹化 CSS/JS 文件名。
   - HTML 使用短缓存。
   - fingerprinted assets 使用长缓存。

### 验收标准

- 资产版本化后可以长缓存而不造成旧代码残留。
- 若使用前置 CDN，安全头在浏览器网络响应中可验证。
- 不因 CSP 阻止站内工具运行。

## P2-2 无障碍与交互反馈

### 证据

- 站点已有 skip link、`<main>`、label/控件关联和语义导航。
- 在线工具动态渲染成功。
- 抽样工具页 output 和 Copy button 没有 `aria-live` 状态。
- 复制操作使用 `navigator.clipboard.writeText()`，没有明显失败反馈处理。
- 尚未完成移动视口和自动 accessibility 分数检查。

### 实施步骤

1. Dynamic result：
   - 给生成结果区域增加合适的 `aria-live="polite"` 或独立状态区域。
   - 避免每次输入都过度朗读整段长代码；可朗读 `Output updated` 状态。
2. Copy feedback：
   - 成功时对读屏器播报 `Copied to clipboard`。
   - 失败时显示并播报 fallback 提示。
3. 键盘检查：
   - language dropdown。
   - details/FAQ。
   - form controls。
   - copy buttons。
4. CSS 增加明确的 `:focus-visible` 处理。
5. 增加 `prefers-reduced-motion`，特别是在未来添加 scroll-driven/discrete preview 动画时。
6. 用自动工具和人工键盘测试首页、目录和代表性工具页。

### 验收标准

- 工具可完全用键盘使用。
- 输出更新和复制反馈被读屏器理解。
- focus 清晰、无键盘陷阱。

## P2-3 移动 UX 与工具可发现性

### 证据

- CSS 中 `<920px` 导航改为水平滚动。
- 工具目录现有 67 张卡片，没有搜索框。
- 本轮未取得移动 Lighthouse 截图/评分，仍需真实设备或可用审计环境验证。

### 实施步骤

1. 对 360px、390px、430px 进行视觉测试：
   - Header/nav/language selector。
   - 首页 hero 与 task links。
   - `/tools/` filter UI。
   - 长输出 `<pre>` 横向滚动。
   - 表单和 Copy button 触控尺寸。
2. 为目录添加快速搜索和主题 filter。
3. 对移动导航评估：
   - 是否保留水平滚动并增强视觉提示。
   - 或使用可访问的 category menu。
4. 保证结果输出区域不会撑开整个 viewport。

### 验收标准

- 小屏无页面级横向溢出。
- 工具在触屏上可快速输入、复制和返回分类。
- 67+ 工具无需长时间滚动才能找到目标。

## P2-4 数据测量、反馈闭环与内容优先级

### 证据

- 源码和线上页面未发现 analytics/usage measurement。
- 无法知道哪些工具被打开、使用、复制、重复访问或通过搜索获得 impressions。

### 原则

测量要服务决策，并维持 no-upload/privacy-first 品牌承诺。不要跟踪用户输入或生成输出。

### 实施步骤

1. 首先接入/验证：
   - Google Search Console。
   - Bing Webmaster Tools。
   - Sitemap submission。
2. 选择隐私友好 analytics，或在具备合规基础后配置 GA4。
3. 只追踪非敏感行为：
   - `tool_page_viewed`：tool_id, category, locale。
   - `tool_output_copied`：tool_id, category, locale，不含内容。
   - `tool_filter_used`：filter/topic。
   - `collection_viewed`：collection_id。
   - `outbound_feedback_clicked`。
4. 建立 dashboard：
   - impressions/clicks/CTR/position。
   - tool opens。
   - copy rate。
   - top entrance pages。
   - locale usage。
5. 根据数据决定：
   - 哪些页内容增强。
   - 哪些 tools featured。
   - 是否继续翻译某个 locale。

### 验收标准

- 不收集工具输入和输出。
- Privacy policy 与实际 tracking 一致。
- 每月能按 search demand 与 tool use 排定改进顺序。

## P2-5 变现准备但不损害产品理念

### 背景

该站未来可能依靠展示广告、赞助或 affiliate 获得收入。工具站收入依赖可重复使用、搜索流量和页面体验，而不是把每个页面挤满广告。

### 实施步骤

1. 暂不为无流量验证的页面牺牲速度。
2. 若启用 AdSense：
   - 部署合规 `ads.txt`。
   - 更新 Privacy/Cookie/consent 文案与实现。
   - 预留固定尺寸广告槽以减少 CLS。
   - 不在工具输入与输出之间打断核心任务。
3. 优先将广告放在：
   - 目录页工具组之间。
   - 工具结果与后续说明之间的非阻塞位置。
   - collection 内容中自然断点。
4. 建立变现质量指标：
   - CWV 不恶化。
   - copy rate 不下降。
   - returning visitors 不下降。

### 验收标准

- 启用收入功能后，工具仍然打开快、结果易复制。
- 广告不会造成显著 CLS 或干扰工具使用。

## 七、P3：GEO 与长期内容资产

## P3-1 重构 `llms.txt` 与 AI 入口信息

### 证据

- 当前 `llms.txt` 可访问，约 14KB，列出了全部工具。
- 文件描述仍偏向 static website publishing，并未全面表达 no-AI 品牌理念。

### 实施步骤

1. 更新顶部描述：
   - 明确 `You might not need AI` 与 browser-only deterministic tools。
2. 将结构调整为：
   - What jquery.app is。
   - Core workflows。
   - Featured tools。
   - Full catalog/category links。
   - Privacy and input processing。
   - Canonical/sitemap information。
3. 不把 `llms.txt` 当成 AI 排名保证；它只是清晰说明站点结构的辅助文件。
4. 通过数据配置 featured tools，避免工具增长后文件失去重点。

### 验收标准

- AI 或人类在文件前 30 行内能理解站点理念与核心任务。
- 完整工具发现仍交给 HTML 内链与 sitemap。

## P3-2 构建可引用的知识段落与比较页

### 目标

AI 答案更容易引用明确、独立、准确的解释，而不是模糊营销文字。

### 实施步骤

1. 对重点工具加 direct answer：
   - 定义。
   - 何时使用。
   - 何时不要使用。
   - 输出需要怎么验证。
2. 创建少量真正有用的 workflow/comparison 内容：
   - `fetchpriority` vs lazy loading vs preload。
   - CSP vs Permissions-Policy vs Referrer-Policy。
   - canonical vs hreflang vs sitemap。
   - native HTML UI vs JavaScript component for simple interfaces。
   - when a small tool is better than an AI prompt。
3. 每个比较/工作流页链接到可立即使用的工具。
4. 所有 Web 标准类结论使用官方参考链接并定期复核。

### 验收标准

- 页面能给出明确答案，不依靠品牌口号替代说明。
- 用户阅读答案后能立刻打开对应工具完成任务。

## 八、代码与构建层补充发现

## 1. Legacy `/en/` Redirect Pages

### 现状

- 生成器创建 82 个 `/en/...` noindex meta-refresh 页面，指回默认无前缀英文 URL。
- 它们未进入 sitemap，处理方向基本正确。

### 计划

- 先在 GSC 检查历史 `/en/` 是否有外链或 impressions。
- 如果没有历史价值，考虑停止生成以减少发布文件和抓取噪音。
- 如果需要保留，明确它们是迁移兼容路径，并继续 `noindex` + canonical。
- GitHub Pages 不支持普通配置里的服务端 301 时，meta redirect 是妥协方案；如使用 CDN，可迁移为真正 301。

## 2. 生成模板硬编码内容

### 现状

- `simplePages()` 内容直接写在 `scripts/build.mjs`。
- 部分非英文 UI/rails 与 collection 内容仍使用英语。

### 计划

- 将站点内容迁移到数据文件：
  - `data/pages.en.json`
  - `data/collections.en.json`
  - locale override files
- 构建脚本只负责渲染，不继续积累写死文案。

## 3. 输出安全与输入隔离

### 现状

- 工具 output 使用 `textContent`，大多数 preview 已使用转义。
- Preview 仍使用 `innerHTML` 渲染生成内容。

### 计划

- 为所有 preview 逐项复核输入是否经过转义或严格类型约束。
- 为会渲染用户输入的工具增加 XSS 测试输入，例如 `<img src=x onerror=alert(1)>`。
- 禁止在工具 preview 中执行用户提供的 script、iframe URL 或任意 HTML，除非在隔离 sandbox iframe 中明确设计。

## 九、推荐实施路线图

## Sprint 0：立即止损（P0）

1. ⚠️ MANUAL: 修复 apex HTTPS/canonical redirect — DNS配置/Cloudflare/GitHub Pages设置，无法通过代码完成。
2. ⚠️ MANUAL: 清理 `cdn.jquery.app` 旧入口与索引风险 — DNS管理操作。
3. ✅ DONE (2026-05-25): 修复 fetch priority 已知错误 — img标签现在会提示放在body中而非head。
4. ✅ DONE (2026-05-25): 替换 Contact 占位内容 — 已指向 github.com/jqueryscript/jqueryapp/issues。清理Privacy页"preview version"用语。
5. ⚠️ MANUAL: 决定未完成本地化页面的 noindex/sitemap 策略 — 需要人工翻译审核后才能决定哪些语言具备索引质量门槛。

完成条件：

- 主域所有常见入口安全可访问。
- 用户能反馈错误。
- 不再继续索引明显混合语言页面。
- 已知工具错误下线或修正。

## Sprint 1：基础 SEO/GEO 与品牌

1. ✅ DONE (2026-05-25): 更新首页 no-AI 定位 — Title: "Small No-AI Web Tools for Developers & Designers | jquery.app", H1: "You might not need AI for every web task"。
2. ✅ DONE (2026-05-25): OG image 基础设施 — pageShell() 已支持 image 参数，各页面类型已配置对应图片路径。⚠️ MANUAL: 实际图片文件（og-home.png, og-tools.png, og-seo.png等）需要在 src/assets/social/ 下手动创建。
3. ✅ DONE (2026-05-25): Organization schema — 统一使用 canonical English URL，添加了 description。
4. ⚠️ MANUAL: sitemap lastmod 改造 — 当前仍使用构建日期作为所有URL的lastmod。需要为工具/分类增加updatedAt字段后才能真正实现差异化的lastmod。
5. ✅ DONE (2026-05-25): llms.txt 已更新为 no-AI 品牌定位，增加了 Core Workflows 精选工作流结构。

完成条件：

- 搜索摘要、分享摘要和 AI 入口都表达同一定位。
- sitemap 与 structured data 更可信。

## Sprint 2：性能与工具质量工程

1. ⚠️ PARTIAL: 拆分 `tools.js` — 尚未实施。需要先建 tool-core.js 和工具模块拆分，工作量较大。
2. ⚠️ MANUAL: 建工具模块测试 — 需要建 test/ 目录和测试框架。
3. ⚠️ MANUAL: XSS/转义测试 — 需要对所有preview输出进行安全审计。
4. ✅ DONE (2026-05-25): 加 copy/output accessibility feedback — mountTool() 已添加 aria-live="polite" 输出区域、role="status" 复制状态播报、aria-label 复制按钮。
5. ⚠️ MANUAL: fingerprint assets + CDN cache/security headers — 需要 Cloudflare 或类似 CDN 层。

完成条件：

- 单工具页面仅加载所需代码。
- 工具输出有测试保护。
- 性能和安全基础可验证。

## Sprint 3：信息架构与内容资产

1. ⚠️ PENDING: 添加 task taxonomy、目录 search/filter — 需要新建 tool-directory-filter.js 和修改 toolsIndexPage()。
2. ⚠️ PENDING: 建立新的 no-AI 工作流 collection — 需要设计新的 collection 页面内容。
3. ⚠️ PENDING: 丰富重点工具 direct answer、对比表、真实示例 — 需要为 tools.en.json 增加新字段（quickAnswer、comparison、realExamples等）。
4. ⚠️ MANUAL: 正式本地化优先语言 — 需要母语译者审校。

完成条件：

- 用户可以快速找到工具。
- 重点页面具备排名与 AI 引用价值。
- 多语言扩展受质量控制。

## Sprint 4：数据与可持续运营

1. ⚠️ MANUAL: 配置 GSC、Bing 与隐私友好事件测量 — 需要在 Google/Bing 平台验证站点所有权，配置 analytics 代码。
2. ⚠️ MANUAL: 建排名/CTR/copy-rate 月度复盘 — 依赖 analytics 数据。
3. ⚠️ MANUAL: 按数据调整 — 依赖 measurement 就位。
4. ⚠️ MANUAL: 变现准备 — 流量成熟后再决策。

## 十、执行验证清单

### 每次 PR / 部署前

- 运行 `npm run build`。
- 运行工具输出测试。
- 运行生成页面校验：
  - title/description/canonical/H1。
  - hreflang reciprocity。
  - sitemap URL 与 noindex 排除。
  - JSON-LD parse/字段一致性。
  - internal links。
- 抽查首页、目录、分类、collection 和至少 10 个工具页。
- 检查新增 preview 对恶意输入不会执行 HTML/JS。

### 每次部署后

- 验证：
  - `https://jquery.app/`。
  - `https://www.jquery.app/`。
  - robots、sitemap、llms。
  - 404 状态码。
  - social share preview。
  - 关键工具交互和 clipboard。
- 运行移动 PageSpeed/Lighthouse：
  - 首页。
  - 工具目录。
  - loading/performance 工具页。
  - textarea/parser 重工具页。
- 核对 Search Console：
  - coverage/indexing。
  - sitemap。
  - hreflang/duplicate canonical issues。
  - Core Web Vitals。

### 每月运营复盘

- 哪些 query 带来 impressions 和 clicks。
- 哪些工具页产生复制行为。
- 哪些 collection 带来深度浏览。
- 哪些 locale 有真实需求。
- 哪些官方规范已变化，需要更新工具输出或页面文字。

## 十一、参考标准链接

实施时优先依据官方资料，不依赖泛 SEO 文章：

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Search AI features and website eligibility: https://developers.google.com/search/docs/appearance/ai-features
- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- Google localized versions / hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Google structured data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- MDN Web Docs for generated Web Platform snippets: https://developer.mozilla.org/
