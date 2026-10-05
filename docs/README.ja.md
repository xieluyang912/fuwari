# 🍥 Xieluyang の小屋

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

学習メモや試行錯誤の記録など、書き残しておきたいことを載せている個人ブログです。[Astro](https://astro.build) で構築し、テーマは [Fuwari](https://github.com/saicaca/fuwari) をベースに、[Mizuki](https://github.com/LyraVoid/Mizuki) から看板娘・右サイドバー・特設ページ群を移植しています。

[**🖥️ サイトを見る**](https://007912.xyz)

![ホームページ](images/home-light.png)

🌏 README の言語
[**English**](https://github.com/Xieluyang912/fuwari/blob/main/README.md) /
[**中文**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.zh-CN.md) /
[**한국어**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.ko.md) /
[**Español**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.es.md) /
[**ไทย**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.th.md) /
[**Tiếng Việt**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.vi.md) /
[**Bahasa Indonesia**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.id.md)

## ✨ 特徴

- [x] [Astro](https://astro.build) と [Tailwind CSS](https://tailwindcss.com) で構築
- [x] [Swup](https://swup.js.org/) による滑らかなアニメーションとページ遷移
- [x] ライト / ダークモード
- [x] テーマカラーとバナー画像をカスタマイズ可能
- [x] レスポンシブデザイン
- [x] [Pagefind](https://pagefind.app/) によるサイト内全文検索
- [x] [Markdown 拡張構文](#-markdown-拡張構文)
- [x] 目次（TOC）
- [x] RSS フィード
- [x] [giscus](https://giscus.app/) によるコメント欄
- [x] 左下の Live2D 看板娘（[oh-my-live2d](https://github.com/hacxy/oh-my-live2d) で描画）
- [x] 右サイドバー：サイト統計、記事カレンダー、カテゴリ
- [x] 特設ページ：[プロジェクト](https://007912.xyz/projects/)、[スキル](https://007912.xyz/skills/)、[AI ツール](https://007912.xyz/ai-tools/)、[タイムライン](https://007912.xyz/timeline/)

## 🚀 はじめかた

同じようなブログを作りたい方へ：

1. このリポジトリから始める：
    - このテンプレートから[新しいリポジトリを作成](https://github.com/Xieluyang912/fuwari/generate)するか、このリポジトリをフォークします。
    - 以下のコマンドでオリジナルの Fuwari テーマを初期化することもできますが、その場合は上記のカスタマイズは**含まれません**：
       ```sh
       npm create fuwari@latest
       yarn create fuwari
       pnpm create fuwari@latest
       bun create fuwari@latest
       deno run -A npm:create-fuwari@latest
       ```
2. リポジトリをクローンし、`pnpm install` で依存関係をインストールします。
    - [pnpm](https://pnpm.io) が未導入の場合は `npm install -g pnpm` を実行してください。
3. 設定ファイル `src/config.ts` を編集してブログをカスタマイズします。サイトタイトル、バナー、プロフィールカード、ナビゲーション、コメント、看板娘、サイドバー、特設ページはすべてここで設定します。
4. `pnpm new-post <ファイル名>` で新しい記事を作成し、`src/content/posts/` 内で編集します。
5. デプロイ前に `astro.config.mjs` の `site` と `base` を設定し、[Astro 公式ガイド](https://docs.astro.build/ja/guides/deploy/)に従って Vercel、Netlify、GitHub Pages などにデプロイします。

## 📝 記事のフロントマター

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: ja      # 記事の言語が `config.ts` のサイト言語と異なる場合のみ設定します
---
```

## 🧩 Markdown 拡張構文

Astro が標準でサポートする [GitHub Flavored Markdown](https://github.github.com/gfm/) に加えて、いくつかの拡張機能が有効になっています：

- **Admonitions（注記ブロック）** をディレクティブ構文で記述できます：

  ```md
  :::note
  読者に注意してほしい情報。
  :::

  :::tip
  読者の理解を助ける補足情報。
  :::
  ```

- **GitHub リポジトリカード** を `github` ディレクティブで挿入できます：

  ```md
  ::github{repo="saicaca/fuwari"}
  ```

- **[Expressive Code](https://expressive-code.com/) による高機能なコードブロック**：行番号、折りたたみセクション、コピーボタンに対応しています。

## ⚡ コマンド

すべてのコマンドはプロジェクトのルートディレクトリで実行します：

| Command                    | Action                                              |
|:---------------------------|:----------------------------------------------------|
| `pnpm install`             | 依存関係をインストールします                            |
| `pnpm dev`                 | `localhost:4321` でローカル開発サーバーを起動します      |
| `pnpm build`               | 本番用サイトを `./dist/` にビルドします                 |
| `pnpm preview`             | デプロイ前にビルド結果をローカルでプレビューします        |
| `pnpm check`               | コード内のエラーをチェックします                         |
| `pnpm format`              | Biome でコードをフォーマットします                      |
| `pnpm new-post <filename>` | 新しい記事を作成します                                 |
| `pnpm astro ...`           | `astro add` や `astro check` などの CLI コマンドを実行します |
| `pnpm astro --help`        | Astro CLI のヘルプを表示します                         |

## 🙏 クレジット

- [Fuwari](https://github.com/saicaca/fuwari) —— このサイトがベースにしているテーマ
- [Mizuki](https://github.com/LyraVoid/Mizuki) —— 看板娘、右サイドバー、「Others」メニューの移植元
- [oh-my-live2d](https://github.com/hacxy/oh-my-live2d) —— 看板娘の描画ライブラリ
- [Astro](https://astro.build) · [Svelte](https://svelte.dev) · [Tailwind CSS](https://tailwindcss.com)
- [Pagefind](https://pagefind.app/) · [Swup](https://swup.js.org/) · [giscus](https://giscus.app/) · [Expressive Code](https://expressive-code.com/)

## 📄 ライセンス

テーマ部分は [MIT License](LICENSE) の下で公開されています。記事の内容は [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) に従います。
