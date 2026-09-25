/**
 * Astro 构建配置
 *
 * 这个文件决定了博客在「构建时」如何处理内容，主要管四件事：
 * 1. integrations —— 集成了哪些功能（主题、图标、代码高亮、页面过渡等）
 * 2. markdown —— 解析 Markdown 时要跑哪些插件（数学公式、阅读时长、提示框等）
 * 3. vite —— 底层打包工具的配置
 * 4. site / base —— 站点部署地址，部署前必须改，见下方说明
 *
 * 注意：这个文件只在构建时生效，改完需要重启 dev server 才会应用。
 */

import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components";/* 把自定义指令渲染成对应的组件 */
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";/* 处理 ::指令 语法 */
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import { expressiveCodeConfig } from "./src/config.ts";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button.js";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge.ts";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

// Astro 官方配置文档：https://astro.build/config
export default defineConfig({
  // 站点的完整部署地址。部署前必须改成你自己的域名，
  // 它会被用于生成 sitemap、RSS 里的绝对链接和社交分享的 OG 标签。
  // GitHub Pages 的项目仓库（github.com/xieluyang912/fuwari）地址形如
  // https://<用户名>.github.io/<仓库名>/，注意这里不带末尾的仓库名。
  site: "https://xieluyang912.github.io",

  // 部署到子路径时才需要改。仓库名是 fuwari，所以这里是 "/fuwari/"；
  // 若日后把仓库改名为 xieluyang912.github.io 换成根域名，则改回 "/"。
  base: "/fuwari/",

  // 所有链接末尾都带斜杠，即 /posts/foo/ 而不是 /posts/foo。
  // 改动它会导致现有链接失效，一般不要动。
  trailingSlash: "always",

  integrations: [
      // Tailwind CSS，nesting 开启嵌套写法支持
      tailwind({
          nesting: true,
      }),
      // Swup：无刷新页面切换，让站内跳转有过渡动画、不用整页重新加载
      swup({
          theme: false,
          animationClass: "transition-swup-", // 参见 https://swup.js.org/options/#animationselector
          // 默认值 `transition-` 会造成过渡延迟
          // 因为会和 Tailwind 的 `transition-all` 类名冲突
          containers: ["main", "#toc"], // 只替换这两个容器内的内容
          smoothScrolling: true,
          cache: true,
          preload: true, // 提前预加载用户可能点击的页面
          accessibility: true,
          updateHead: true,
          updateBodyClass: false,
          globalInstance: true,
      }),
      // 图标：按图标集前缀引入 Font Awesome 6 的图标
      // "*" 表示引入该图标集下的全部图标，配置里用名称直接引用即可
      icon({
          include: {
              "preprocess: vitePreprocess(),": ["*"],
              "fa6-brands": ["*"],
              "fa6-regular": ["*"],
              "fa6-solid": ["*"],
          },
      }),
      // 代码块增强：行号、折叠、语言标记、复制按钮等，都由这里控制
      expressiveCode({
          // 同一个主题传两次，分别是浅色和深色模式下使用的主题
          themes: [expressiveCodeConfig.theme, expressiveCodeConfig.theme],
          plugins: [
              pluginCollapsibleSections(), // 支持折叠代码块（--collapse 标记）
              pluginLineNumbers(), // 支持显示行号
              pluginLanguageBadge(), // 在代码块右上角显示语言名称
              pluginCustomCopyButton(), // 自定义样式的复制按钮
          ],
          defaultProps: {
              wrap: true, // 代码过长时自动换行，而不是横向滚动
              overridesByLang: {
                  // shell 会话类代码块不显示行号
                  shellsession: {
                      showLineNumbers: false,
                  },
              },
          },
          // 以下都是样式覆盖，颜色全部引用 CSS 变量，
          // 变量定义在 src/styles 下，这样能跟随明暗主题切换
          styleOverrides: {
              codeBackground: "var(--codeblock-bg)",
              borderRadius: "0.75rem",
              borderColor: "none",
              codeFontSize: "0.875rem",
              codeFontFamily:
                  "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              codeLineHeight: "1.5rem",
              // 代码块外框（编辑器标签栏 / 终端标题栏）的配色
              frames: {
                  editorBackground: "var(--codeblock-bg)",
                  terminalBackground: "var(--codeblock-bg)",
                  terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
                  editorTabBarBackground: "var(--codeblock-topbar-bg)",
                  editorActiveTabBackground: "none",
                  editorActiveTabIndicatorBottomColor: "var(--primary)",
                  editorActiveTabIndicatorTopColor: "none",
                  editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
                  terminalTitlebarBorderBottomColor: "none",
              },
              // 代码里 diff / 高亮标记的色相
              textMarkers: {
                  delHue: 0, // 删除行用红色
                  insHue: 180, // 新增行用青色
                  markHue: 250, // 高亮用主题蓝色
              },
          },
          frames: {
              // 关闭内置的复制按钮，改用 pluginCustomCopyButton 提供的自定义版本
              showCopyToClipboardButton: false,
          },
      }),
      svelte(),
      // 自动生成 sitemap.xml，方便搜索引擎收录
      sitemap(),
	],

  // Markdown 处理管线：remark 负责把 Markdown 转成语法树，rehype 负责再加工语法树
  markdown: {
      // remark 插件，执行顺序就是数组顺序，顺序会影响结果
      remarkPlugins: [
          remarkMath, // 支持 $公式$ 和 $$公式$$ 数学语法
          remarkReadingTime, // 统计字数并估算阅读时长
          remarkExcerpt, // 提取摘要，用于文章列表和 SEO 描述
          remarkGithubAdmonitionsToDirectives, // 把 GitHub 的 > [!NOTE] 写法转成指令
          remarkDirective, // 解析 ::指令{} 语法
          remarkSectionize, // 按标题层级切分文章，TOC 依赖它
          parseDirectiveNode, // 把指令节点转换成后续可渲染的节点
      ],
      rehypePlugins: [
          rehypeKatex, // 把数学语法渲染成 KaTeX 公式
          rehypeSlug, // 给标题生成 id，锚点跳转和 TOC 依赖它
          [
              // 把 Markdown 里的自定义指令映射到对应组件
              rehypeComponents,
              {
                  components: {
                      github: GithubCardComponent, // ::github{repo="owner/repo"} 仓库卡片
                      // ::note / ::tip / ::important / ::caution / ::warning 提示框
                      note: (x, y) => AdmonitionComponent(x, y, "note"),
                      tip: (x, y) => AdmonitionComponent(x, y, "tip"),
                      important: (x, y) => AdmonitionComponent(x, y, "important"),
                      caution: (x, y) => AdmonitionComponent(x, y, "caution"),
                      warning: (x, y) => AdmonitionComponent(x, y, "warning"),
                  },
              },
          ],
          [
              // 给标题末尾追加一个可点击的 # 锚点链接
              rehypeAutolinkHeadings,
              {
                  behavior: "append", // 追加到标题内容后面
                  properties: {
                      className: ["anchor"],
                  },
                  content: {
                      type: "element",
                      tagName: "span",
                      properties: {
                          className: ["anchor-icon"],
                          // 告诉 Pagefind 索引时忽略这个 #，否则会被当成正文
                          "data-pagefind-ignore": true,
                      },
                      children: [
                          {
                              type: "text",
                              value: "#",
                          },
                      ],
                  },
              },
          ],
      ],
	},

  // Vite 打包配置
  vite: {
      build: {
          rollupOptions: {
              onwarn(warning, warn) {
                  // 临时屏蔽这个警告
                  // 它来自 import.meta.glob 动态导入图片的写法，
                  // 是主题里已知的、无法避免的告警，不是真正的错误
                  if (
                      warning.message.includes("is dynamically imported by") &&
                      warning.message.includes("but also statically imported by")
                  ) {
                      return;
                  }
                  warn(warning);
              },
          },
      },
	},
});