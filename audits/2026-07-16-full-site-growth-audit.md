# jquery.app 全站 SEO、内容、UX 与流量增长审核

审核日期：2026-07-16
站点：https://www.jquery.app
项目路径：`J:\网站\jqueryapp`
站点类型：静态、多语言、浏览器端 Web 开发工具目录

## 1. 执行摘要

jquery.app 已经具备良好的静态 SEO 基础：页面可直接抓取，canonical、HTML hreflang、robots.txt、sitemap.xml、结构化数据、llms.txt、社交分享图、隐私与联系页面都已存在。英文工具内容也不薄，148 个工具的主体内容中位数约为 618 个英文单词，FAQ 问题没有发现跨工具重复。

当前最需要解决的不是继续批量增加工具，而是修复功能质量和重新组织现有页面。最重要的发现如下：

1. 3 个已经上线的工具脚本存在 JavaScript 语法错误，工具无法加载。
2. 66 个英文工具页面包含乱码，渲染页面中共检测到 421 处异常字符。
3. 内链分配严重失衡。部分工具获得 300 至 562 次英文站内链接，而 JSON、Regex、Base64、UUID、Markdown、图片压缩等更广泛的工具只有约 6 次。
4. 现有分类无法准确表达内容。`HTML` 类包含 62 个工具，其中混有 JSON、YAML、JWT、Base64、Cron、Hash、QR Code、Markdown 和图片处理工具；`Assets` 类只有 5 个工具。
5. sitemap 中 978 个 URL 的 `lastmod` 全部相同，并且每次构建都会变成当天日期，无法表达真实更新。
6. 英文页面有 85 个 meta description 超过 160 个字符；法语、西班牙语和德语页面也有较多过长标题。5 个较新的工具缺少大部分语言的本地化名称和摘要。
7. 页面内容深度不错，但所有工具页都引用同样的 MDN 首页、W3C 规范首页和项目 GitHub，而不是与具体主题直接相关的官方资料。

综合评分：**74/100**。这是一个具备增长条件的站点，但在扩大页面规模前，应先完成 P0 与 P1 修复。

## 2. 审核范围与方法

本次检查包含：

- 本地源码、数据文件、构建脚本与 `dist` 构建产物
- 148 个工具模块的语法和导出检查
- 1,143 个 HTML 文件的标题、描述、H1、canonical、hreflang、schema、社交图与 noindex 检查
- 166,793 次内部链接引用的目标存在性检查
- 线上首页、工具页、robots.txt、sitemap.xml、llms.txt、重定向和响应头抽样
- 公开搜索结果中的页面收录样本
- 当前开发工具目录竞争站点的覆盖方向
- 与 2026-06-03 旧审核的对照

限制：

- 没有使用 Google Search Console、GA4 或 AdSense 后台数据。
- Google PageSpeed Insights API 返回 429，本次没有把实验室 Lighthouse 分数或真实 Core Web Vitals 当作已验证数据。
- 搜索结果抽样不能替代 Search Console 的完整索引与查询报告。

## 3. 当前站点基线

| 项目 | 当前结果 |
|---|---:|
| 工具 | 148 |
| 工具模块 | 148 |
| HTML 文件 | 1,143 |
| sitemap URL | 978 |
| 语言 | 6：en、de、fr、es、ja、nl |
| 每种语言的预期可索引页面 | 163 |
| 英文工具内容中位数 | 约 618 词 |
| 本地内部链接断链 | 0 |
| OG 图片 | 11 个，均为 1200×630 |
| robots.txt | 200，允许抓取并声明 sitemap |
| sitemap.xml | 200，978 个 URL |
| llms.txt | 200 |
| 在线抽样工具页 | 200 |

工具分布：

| 分类 | 工具数 |
|---|---:|
| HTML | 62 |
| CSS | 45 |
| SEO | 22 |
| GitHub Pages | 14 |
| Assets | 5 |

## 4. 评分

| 领域 | 分数 | 说明 |
|---|---:|---|
| 技术 SEO | 77/100 | 抓取、canonical、robots 和 sitemap 基础可靠；lastmod、meta refresh 与安全响应头仍需改进。 |
| 内容质量 | 81/100 | 英文深度和 FAQ 唯一性较好；乱码和通用来源降低可信度。 |
| On-page SEO | 68/100 | 标题与描述存在长度问题，首页和工具模板仍可更直接。 |
| 站点架构与内链 | 58/100 | 分类失真，相关工具算法按数据顺序取前 3 个，造成权重严重集中。 |
| 国际 SEO | 78/100 | 深层翻译已大幅补齐，HTML hreflang 完整；仍有 5 个工具的名称与摘要缺失。 |
| Schema 与 GEO | 76/100 | WebApplication、Breadcrumb、ItemList 和 llms.txt 基础良好；FAQPage 的 Google 搜索价值有限，llms.txt 的推荐页需要重新排序。 |
| 功能与 UX | 70/100 | 搜索、筛选和静态可用性不错，但 3 个工具直接失效。 |
| 性能准备度 | 82/100 | 无 npm 依赖、静态托管、按工具动态加载；未取得真实 CWV 数据。 |

## 5. 与 6 月 3 日审核相比已经解决的问题

以下旧问题已经明显改善：

- 11 个 OG 图片已经创建并复制到构建目录，尺寸均为 1200×630。
- 5 个非英语语言的深层工具内容已经基本补齐，不再是全站主体内容回退英文。
- 首页、About、页脚和 Organization schema 已明确说明与 jQuery 官方无关联。
- llms.txt 已移除重复标题，并增加 Site Identity、Best Pages for AI Answers 和维护说明。
- 工具页面已经显示更新时间和来源区域。
- 工具目录筛选已经有 label、结果数量、空结果提示和清除按钮。
- 全量本地内部链接目标检查未发现断链。

这些改动使当前站点比旧审核时更适合继续扩张。

## 6. P0：必须立即处理

### P0-1. 三个线上工具无法加载

严重程度：Critical
影响：功能、用户信任、跳出率、索引质量

受影响工具：

- `/tools/html-invoker-command-generator/`
- `/tools/html-script-loading-strategy-builder/`
- `/tools/markdown-preview-editor/`

本地 152 个 JavaScript 文件语法检查中只有这 3 个失败；线上脚本重新下载后检查，三者仍然失败。

证据：

- `src/assets/tools/html-invoker-command-generator.js:41` 缺少字符串结束引号。
- `src/assets/tools/html-script-loading-strategy-builder.js:40-42` 存在多余结束符和不应出现在单工具模块内的全局挂载代码。
- `src/assets/tools/markdown-preview-editor.js:6` 的模板字符串与代码围栏拼接语法无效。

修复：

1. 修复三个文件并逐一在浏览器中测试默认输入、修改输入、复制输出和预览。
2. 在构建前运行 `node --check` 检查全部 `src/assets/**/*.js`。
3. 再增加模块导入检查，验证每个工具都默认导出 `{ form: string, generate: function }`。
4. 任一工具语法失败时让构建失败，不再发布“页面存在但工具不可用”的结果。

### P0-2. 英文内容存在大范围乱码

严重程度：Critical
影响：内容质量、点击体验、可信度、AI 引用、搜索摘要

结果：

- `data/tools.en.json` 中检测到 344 个特定乱码字符。
- 66 个英文生成页面包含乱码。
- 生成页面中共检测到 421 次异常字符。

已在公开搜索结果中看到异常文本，例如 Focus Ring 页面中的 `閳ユ摱CAG`，以及多处用于代替破折号或箭头的乱码。

证据示例：

- `data/tools.en.json:859`
- `data/tools.en.json:1597`
- `data/tools.en.json:9211`
- `data/tools.en.json:9242`

修复：

1. 先修 `data/tools.en.json`，不要只修 `dist`。
2. 将常见乱码映射回正确字符，例如 em dash、箭头和 WCAG。
3. 人工检查替换上下文，避免把未知乱码全部替换成同一个标点。
4. 增加 UTF-8 质量门禁，阻止包含已知乱码字符的 JSON 和生成 HTML 进入构建。
5. 同时处理法语和西班牙语中已公开出现的 `HTMLà partir` 等拼写或编码异常。

## 7. P1：高影响增长修复

### P1-1. 内链权重分配失衡

严重程度：High
影响：发现、抓取优先级、主题关系、重要页面排名

原因：

- 首页精选工具使用 `tools.slice(0, 6)`，完全由 JSON 数据顺序决定，见 `scripts/build.mjs:564` 和 `scripts/build.mjs:603`。
- 每个工具页的相关工具使用同分类中排在最前面的 3 个，见 `scripts/build.mjs:838`。
- 跨分类推荐也从分类数组头部截取，见 `scripts/build.mjs:847-851`。

结果：

- AI Crawler、Hreflang、ARIA、CSP 等数据前部工具获得约 300 至 562 次英文内部链接。
- Regex、JWT、Base64、URL Encoder、UUID、Cron、Markdown、QR、图片压缩、SVG 与新 CSS 工具只有约 6 次。
- 首页当前首 6 个工具是 AI Crawler、ARIA Live Region、Assetlinks/AASA、Cache-Control、Container Query Units、COOP/COEP/CORP。它们有价值，但不是最适合承担首页大众搜索入口的组合。

修复：

1. 增加显式 `featuredRank`、`trafficTier`、`relatedTools` 和 `workflowTags` 字段。
2. 首页优先展示 JSON Formatter、CSS Flexbox、Regex、Base64、Image Compressor、CSS Grid 或其他已验证的高需求工具。
3. 相关工具按任务关系选择，而不是按数据顺序。
4. 每个工具至少获得 3 至 8 个来自相关工具、集合页和分类页的上下文链接。
5. 用 GSC impressions、clicks 和平均排名每月重新计算内部推广优先级。

### P1-2. 分类体系不能表达现有工具主题

严重程度：High
影响：分类页相关性、用户发现、导航、关键词覆盖

当前问题：

- `HTML` 类包含 JSON Formatter、JSONPath、JSON Schema、YAML、JWT、Base64、URL Encoder、UUID、Cron、Hash、Markdown、QR Code 和 Image Compressor。
- `Assets` 类只有 5 个工具，无法承载图片、SVG、图标、Manifest 和文件处理主题。
- 没有 Data、Encoding、Text、Security、JavaScript、API 或 Images 等更符合用户搜索习惯的分类。

推荐的信息架构：

1. HTML & Accessibility
2. CSS & Design
3. JSON, Data & Formatters
4. Encoders, Hash & Security
5. Images, SVG & Assets
6. SEO & Web Publishing
7. GitHub Pages & Deployment
8. JavaScript & Web APIs

实施时保留现有工具 URL，只修改分类页、面包屑、导航和内链。不要因为改分类而批量更改已发布 URL。

### P1-3. sitemap 的 lastmod 不可信

严重程度：High
影响：抓取信号、更新发现、长期维护

线上 sitemap 的 978 个 URL 全部标为 `2026-06-11`。`scripts/build.mjs:1144-1150` 对所有 URL 使用全局 `buildDate`。每次构建都会把所有页面标成当天更新，即使内容没有变化。

修复：

1. sitemap URL 记录应携带自己的 `lastmod`。
2. 工具页使用 `tool.updatedAt`。
3. 分类和集合增加独立的 `updatedAt`。
4. About、Privacy、Terms、Contact 等静态页使用真实内容更新时间。
5. 只有正文、工具行为或重要元数据发生变化时才更新日期。

### P1-4. 元数据需要语言感知的质量控制

严重程度：High
影响：CTR、搜索摘要、重复内容信号

结果：

- 英文 163 个预期可索引页面中，85 个 description 超过 160 字符。
- 德语有 13 个标题超过 60 字符，法语 26 个，西班牙语 21 个，荷兰语 4 个。
- 英文超长描述最高达到 294 个字符。
- 5 个新工具在 de、fr、es、nl 中缺少 name 与 summary；日语缺少其中 4 个。
- 这些缺失造成相同英文 description 在多个语言页面重复出现。

缺失本地化元数据的工具：

- `css-carousel-generator`
- `css-scroll-state-query-generator`
- `customizable-select-generator`
- `html-invoker-command-generator`
- `view-transition-builder`（日语已有）

修复：

1. 英文工具增加可选 `seoTitle` 和 `seoDescription`，不要无条件给长 summary 追加固定后缀。
2. 按语言设置不同阈值。日语不能套用英文的字符长度规则。
3. 同一语言内检查重复 title 和 description。
4. 本地化 name、summary 或核心正文不完整时，不生成对应 hreflang 或暂不索引该页。

### P1-5. 来源链接过于通用

严重程度：High
影响：E-E-A-T、AI 引用、技术准确性、用户信任

`scripts/build.mjs:932` 在所有工具页固定输出 MDN 首页、W3C TR 首页和 GitHub 项目页。这些链接不能直接支持 Cron、JWT、security.txt、GitHub Pages、QR Code 或具体 CSS 特性的主张。

修复：

1. 为每个工具增加 `sourceLinks`。
2. 优先使用具体的 MDN 页面、WHATWG/W3C 规范、RFC、Google Search Central、GitHub Docs 或官方浏览器兼容性页面。
3. 来源标题必须说明它支持哪项事实。
4. 对浏览器支持信息增加 `lastReviewed`，避免旧版本声明长期保留。

## 8. P2：中期优化

### P2-1. llms.txt 的推荐逻辑仍按数据顺序

llms.txt 的结构已经明显改善，但存在两个问题：

- 它仍写着非英语页面“可能只有部分翻译”，而目前大多数深层字段已经完成本地化。这会主动降低 AI 对本地化页面的信任。
- `Best Pages for AI Answers` 实际上是数据表前 15 个工具，其中包含已经损坏的 HTML Invoker 工具，也没有优先覆盖 JSON、Regex、Base64、CSS Flexbox 等更广泛的使用场景。

修复：用显式精选列表，排除功能测试失败页面，并按可引用性、搜索需求、内容质量和维护状态排序。

### P2-2. 首页定位有品牌记忆点，但任务词不够直接

H1 `You might not need AI for every web task` 有辨识度，但不能立即说明这是 Web 开发工具目录。建议保留品牌句，同时在 H1 或紧邻副标题中明确加入：

`Free browser tools for HTML, CSS, JSON, SEO, images, and static-site publishing.`

首页的精选工具不应继续依赖数据顺序。

### P2-3. FAQPage schema 不应被当作 Google 富结果策略

工具、分类和集合页面都生成 FAQPage。可见 FAQ 本身有内容价值，但 Google 的 FAQ 富结果主要限制在政府与健康类权威站点。保留 schema 不会自动带来工具站 FAQ 富结果。

建议：

- 优先保证 WebApplication、BreadcrumbList、ItemList 和 Organization 准确。
- FAQ 内容继续保留。
- FAQPage 可作为低优先级标记，不应投入大量时间扩写只为富结果。

### P2-4. 性能基础较好，但必须补真实数据

当前静态资源较轻：

- 首页 HTML：约 31.7 KB
- 工具目录 HTML：约 129 KB
- JSON Formatter 工具页 HTML：约 36.7 KB
- 主 CSS：约 22.4 KB
- tool-core.js：约 4.5 KB
- 单工具脚本平均约 3.3 KB

工具模块按页面动态加载，零 npm 依赖，GitHub Pages 缓存为 10 分钟。这些都支持较好的性能，但不能替代真实 CWV。

下一步应在 GSC 检查 LCP、INP、CLS，并分别测试首页、工具目录、CSS 分类、HTML 分类和至少 5 个交互复杂工具。

### P2-5. GitHub Pages 响应头有限

HTTP、apex 和非 www 版本最终都能到达 `https://www.jquery.app/`，但抽样响应没有 HSTS、CSP、X-Content-Type-Options 和 Referrer-Policy 头。静态页面仍然可安全访问，这不是当前流量瓶颈。

如果以后需要更完整的安全头、真正的 301 规则或更灵活缓存，可在 GitHub Pages 前加 Cloudflare 或迁移到支持自定义响应头的静态平台。

## 9. 工具覆盖与竞争差距

当前竞争站点普遍覆盖格式化、编码、数据转换、API、网络、安全与图片工具，而 jquery.app 的优势更集中在现代 HTML/CSS、Web Publishing 和浏览器 API。

公开目录样本：

- DevTools Hub：107 个工具，明确分 Developer、Text、JSON、Image、Encoding、Generator、CSS 等分类。https://www.devtools.page/
- RunDev：95+ 工具，覆盖 Format、Encode、Generate、Validate、Convert、Test & Debug。https://run-dev.com/
- ToolDock：将 Data & Encoding、Generators、Text & Regex、Network & Security、CSS & Design、API Tools 分开。https://tooldock.org/
- Free.Tools：重点覆盖 HTML/CSS/JS minifier、JSON、Regex、Base64、URL、YAML、Hash 等高频任务。https://free.tools/

jquery.app 已经拥有 JSON、Regex、Base64、JWT、UUID、Cron、Diff 等高需求工具，但它们被放在 HTML 分类并且内链很弱。应先把这些资产重新组织，再新增工具。

## 10. 推荐新增工具优先级

### 第一批：高频、适合纯浏览器运行

1. CSS Grid Generator
2. HTML Formatter & Minifier
3. CSS Formatter & Minifier
4. JavaScript Formatter & Minifier
5. XML Formatter & Validator
6. SQL Formatter
7. HEX/RGB/HSL/OKLCH Color Converter
8. JSON to TypeScript Interface Generator
9. cURL to Fetch/Axios Converter
10. Password Generator & Strength Checker
11. HTML Entity Encoder/Decoder
12. PX/REM/EM Unit Converter

### 第二批：扩大工作流覆盖

1. OpenAPI YAML/JSON Viewer & Validator
2. HTTP Request Code Generator
3. JSON Diff Viewer（可与现有 Text Diff 区分）
4. CSV Viewer、Sorter & Filter
5. Environment Variable / `.env` Formatter
6. CSS Specificity Calculator
7. Favicon Image Generator（不是只生成标签）
8. Image Resize & Crop（可扩展现有 Image Compressor）
9. SVG Viewer & Cleanup Inspector
10. Accessible Color Palette Generator

新增工具的选择顺序应使用 GSC 查询和现有页面曝光数据验证。不要仅按竞争站点数量复制工具。

## 11. 90 天实施路线

### 第 1 周：修复质量门禁

1. 修复 3 个损坏工具。
2. 清理英文数据乱码和法语/西班牙语异常文本。
3. 为全部 JavaScript 增加语法检查与默认导出检查。
4. 增加元数据、乱码、OG 文件和内部链接构建检查。
5. 修复 5 个工具的本地化 name 与 summary。

### 第 2 至 3 周：重构发现路径

1. 重新设计分类，不改工具 URL。
2. 用显式关系替代 `slice(0, 3)` 推荐逻辑。
3. 重做首页精选工具与 llms.txt 精选页。
4. 为 JSON、Regex、Base64、JWT、UUID、Markdown 和图片工具增加集合页或任务页内链。
5. 修复 sitemap 的真实 lastmod。

### 第 4 至 6 周：优化现有高潜页面

1. 导出最近 90 天 GSC 页面和查询数据。
2. 按 impressions 高、CTR 低优化 title 与 description。
3. 按排名 5 至 20 的查询补正文、FAQ、示例和上下文内链。
4. 为前 20 个工具增加具体官方来源和 lastReviewed。
5. 检查不同语言页面的查询与错语言展示。

### 第 7 至 12 周：增加覆盖

1. 先上线第一批中的 6 至 8 个工具，而不是一次发布几十个。
2. 每个工具同时完成页面内容、分类、相关工具、集合页、来源和本地化门禁。
3. 观察 2 至 4 周的抓取、曝光、使用率和复制事件，再决定下一批。
4. 建立 `/updates/` 或 changelog，记录真实新增和重大更新。

## 12. 建议追踪的指标

### Search Console

- 有效索引页面数 / sitemap 页面数
- 各语言页面 impressions、clicks、CTR、平均排名
- 排名 5 至 20 的工具页数量
- 非品牌查询占比
- 错语言页面展示

### GA4

- 工具加载成功率
- 工具交互开始率
- 输出生成率
- Copy 按钮使用率
- 工具页到相关工具的点击率
- 每次会话使用工具数

### 质量门禁

- JavaScript 语法失败：0
- 工具模块导出失败：0
- 内部断链：0
- 乱码字符：0
- 缺失本地化核心字段：0
- 无真实更新时间的 sitemap URL：0

## 13. 最终建议

jquery.app 不缺页面数量。它现在更需要把已有 148 个工具变成一个清晰、可靠、按真实任务组织的产品。

最短增长路径是：先修复 3 个损坏工具和乱码，再重新分类和分配内链，然后用 GSC 选择高曝光页面与新增工具。现在直接继续批量增加工具，会扩大分类混乱、内链失衡和质量检查缺口，未必带来相同比例的自然流量。
