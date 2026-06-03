# jquery.app SEO审计 — 需要手动修复的项目

审计日期：2026-06-03  
自动修复已完成的项目：OG图片占位符、llms.txt去重和AI友好结构、noindex页面语言链接修复、CSS变量补充、focus-visible全局样式、offcanvas关闭按钮和100dvh、筛选器无障碍改进、结构化数据增强、颜色对比度修复

---

## P0 — 必须手动处理的关键问题

### P0-2. 多语言工具页面为混合语言页面

**严重程度：危急**  
**类别：国际SEO、内容质量**

**问题描述：**  
网站生成了5个非英语语言目录（de、fr、es、ja、nl）。模板翻译了UI标签和摘要，但123个工具页面的深层正文字段在所有非英语语言环境中仍然全部回退为英文。受影响的字段：`whatIs`、`quickAnswer`、`howToUse`、`useCases`、`examples`、`mistakes`、`faq`、`limitations`、`verificationSteps`。

**建议操作：**  
选择以下策略之一：

1. **保守方案（推荐首先执行）：** 暂时只为英文建立索引。
   - 从 `data/site.json` 的 `locales` 中移除非英文语言环境
   - 或在多语言页面完全翻译完成前，为其添加 `noindex`
   - 在准备好之前，从站点地图中移除非英文 URL

2. **质量方案：** 全面本地化。
   - 翻译上述所有深层字段
   - 本地化示例、错误说明、FAQ 和验证步骤
   - 在发布带有不完整语言环境覆盖的新工具之前，添加构建时检查

3. **混合方案：** 仅索引完整的语言/分类板块。
   - 先发布英文版，待所有工具完全本地化后再发布德文版，以此类推

### P0-3. 域名和品牌名称可能使 Google 实体理解产生混淆

**严重程度：危急**  
**类别：实体SEO、品牌定位**

**问题描述：**  
域名为 `jquery.app`，但该网站不是 jQuery 库、jQuery 文档站点或官方 jQuery 项目。搜索引擎已经有很强的 "jQuery" 实体认知，可能会误解网站的性质。

**建议操作：**

1. 在首页、关于页面、Organization schema、README 和 `llms.txt` 中明确实体定位
2. **如果网站与 jQuery 无关，请在关于页面和页脚添加明显的免责声明**，例如：
   > "jquery.app is an independent collection of browser-based web publishing tools. It is not affiliated with the jQuery JavaScript library, the jQuery Foundation, or the OpenJS Foundation."
3. 如果有官方项目资料，添加 `sameAs` 链接到 Organization schema（GitHub 仓库已添加）
4. 考虑将标题模式从品牌优先改为任务优先

---

## P1 — 需要手动处理的高优先级问题

### P1-2. 站点地图 lastmod 不按页面区分

**严重程度：高**  
**类别：技术SEO**

**问题描述：**  
每个站点地图条目都使用当前的构建日期作为 `lastmod`，导致搜索引擎可能学会忽略 `lastmod` 信号。

**建议操作：**

1. 为工具、分类、合集和简单页面添加 `lastModified` 或 `updatedAt` 字段
2. 在 `sitemap.xml` 中使用源数据日期
3. 仅在内容发生实质性变化时更新 `lastmod`
4. 添加构建时检查，当新页面缺少日期时构建失败

### P1-3. 遗留 `/en/` 重定向使用 meta refresh 而非 HTTP 重定向

**严重程度：高**  
**类别：索引、链接权重**

**问题描述：**  
遗留的 `/en/*` 路径使用 meta refresh + noindex 进行重定向。Meta refresh 不如 HTTP 301/308 可靠。

**建议操作：**

1. 如果托管服务支持，为 `/en/*` 到 `/*` 实现 HTTP 301 重定向
2. 在 GitHub Pages 上，考虑使用部署层、Cloudflare 规则、Netlify/Vercel 重定向
3. 仅当无法实现 HTTP 重定向时，保留 noindex 回退方案

### P1-5. 页面元数据存在长度和重复问题

**严重程度：高**  
**类别：页面级SEO、CTR**

**问题描述：**  
- 许多英文工具描述在添加固定后缀 "Free in your browser, with no account or upload." 后，超过了推荐的 160 字符长度
- 部分本地化描述过短
- 部分非英文页面复制了英文标题/描述

**建议操作：**

1. 添加构建时元数据审计，设定阈值：
   - 标题目标：35-60 个可见字符
   - 描述目标：90-155 个可见字符
   - 同一语言环境中，可索引页面不得有重复标题/描述
2. 当摘要本身已经很长时，不再追加相同的后缀
3. 为高价值页面添加单独的 `seoTitle` 和 `seoDescription` 字段
4. 将本地化元数据视为独立文案，而非翻译遗留物

### P1-6. 工具页面需要时效性和编辑信任信号

**严重程度：高**  
**类别：E-E-A-T、AI引用可信度**

**问题描述：**  
页面解释了工具的功能，但没有明显展示：
- 最后更新日期
- 最后审核日期
- 作者/编辑/审核者
- 来源或规范参考链接
- 浏览器兼容性可信度
- 生成输出的测试状态

**建议操作：**

1. 为工具数据添加字段：`datePublished`、`dateModified`、`lastReviewed`、`reviewedBy`、`sourceLinks`、`browserSupportNote`
2. 在文章内容附近显示这些字段，不仅仅在 JSON-LD 中
3. 为技术工具添加来源链接，指向 MDN、W3C、WHATWG 等权威文档
4. 为结构化数据添加 `dateModified` 和 `inLanguage`
5. 添加简短的编辑政策页面，并在页脚/关于页面中链接

---

## P2 — 需要手动处理的中优先级问题

### P2-2. 首页定位独特但关键词不够直接

**严重程度：中**  
**类别：首页SEO、转化率**

**问题描述：**  
当前首页 H1 为 "You might not need AI for every web task"。这很有特色，但没有直接说明网站提供什么。

**建议操作：**  
考虑将 H1 和引导语改为更明确的表述，例如：
- H1: `Free Browser Tools for Web Publishing`
- 引导语: `Generate HTML tags, CSS values, SEO metadata, GitHub Pages files, and static-site checks in your browser. No accounts, uploads, or token costs.`

### P2-3. 内部链接干净但主题枢纽可以发挥更大作用

**严重程度：中**  
**类别：网站架构、自然增长**

**建议操作：**

1. 保持现有的5个分类枢纽
2. 添加高意图工作流枢纽，例如：
   - Static site SEO checklist
   - GitHub Pages SEO setup
   - HTML head tag toolkit
   - CSS responsive layout tools
3. 在枢纽页面添加"最适合该任务的工具"板块
4. 使用描述性锚文本增强枢纽到工具、工具到枢纽的链接

### P2-4. 89/123个工具缺少 tags 标签

**严重程度：中**  
**类别：UX、内部发现**

**问题描述：**  
目前只有 CSS 工具（34个）有 `tags`。另外 89 个工具（SEO、HTML、Assets、GitHub Pages）没有标签。分类芯片筛选器的价值有限。

**建议操作：**  
为所有123个工具添加一致的标签，例如：
- `seo`、`metadata`、`accessibility`、`github-pages`
- `performance`、`security`、`responsive`
- `images`、`forms`、`structured-data`、`ai-search`

---

## P3 — 低优先级改进

### P3-1. 站点地图不包含 hreflang 标注

**建议操作：**  
在多语言内容完全翻译之后，考虑添加站点地图 hreflang 标注。在修复混合语言页面问题之前，不要在这方面投入时间。

### P3-2. 网站没有可见的 RSS/feed 或更新日志

**建议操作：**  
添加以下之一：
- `/changelog/`
- `/updates/`
- `/feed.xml`
- `/tools/new/`

### P3-3. AdSense 准备就绪 — 等待

**建议操作：**  
在修复 P0 问题之前不要添加 AdSense。之后：

1. 在启用广告前更新隐私政策
2. 添加预留垂直空间的固定尺寸广告位
3. 避免在工具页面的首屏放置广告
4. 避免在表单字段和输出之间放置广告
5. 在文章区域之后、相关工具组之间或桌面侧边栏放置广告

---

## 优先级建议

1. **P0-2 + P0-3**：决定多语言策略；在主页和关于页面添加非关联声明
2. **P1-5**：添加元数据长度和重复检查；优化过长描述
3. **P1-6**：为高价值工具页面添加日期、来源链接和信任信号
4. **P2-2**：优化首页 H1 和引导文案
5. **P2-4**：为所有工具添加标签（分批次进行）
6. **P1-2 + P1-3**：站点地图 lastmod 精度；HTTP 重定向
7. **P3** 项目：等上述问题稳定后再处理
