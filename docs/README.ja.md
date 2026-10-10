<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/hero-dark.svg">
    <img src="../assets/readme/hero.svg" width="100%" alt="Xieluyang's Blog —— Fuwari テーマをベースにした個人ブログ。左下に Live2D の看板娘、レイアウトはプロフィールカード・記事一覧・統計サイドバーの三列構成です。">
  </picture>
</p>

# 🍥 Xieluyang の小屋

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

学習メモや試行錯誤の記録など、書き残しておきたいことを載せている個人ブログです。

[Astro](https://astro.build) で構築し、テーマは [Fuwari](https://github.com/saicaca/fuwari) をベースに、[Mizuki](https://github.com/LyraVoid/Mizuki) から看板娘・右サイドバー・特設ページ群を移植しています。

**🖥️ サイトはこちら：[007912.xyz](https://007912.xyz)**

![ホームページ——バナー、プロフィールカード、記事一覧、右の統計サイドバー（ライトモード）](images/home-light.png)

🌏 **README の言語：** [English](../README.md) · [中文](README.zh-CN.md) · [한국어](README.ko.md) · [Español](README.es.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md)

## ✨ 特徴

**書く**

- [Markdown 拡張構文](#-markdown-拡張構文) —— Admonitions、GitHub リポジトリカード、行番号と折りたたみに対応した [Expressive Code](https://expressive-code.com/) のコードブロック
- すべての記事に目次（TOC）
- [Pagefind](https://pagefind.app/) による全文検索と RSS フィード
- [giscus](https://giscus.app/) によるコメント欄

**見た目**

- ライト / ダークモード。テーマカラーとバナー画像はカスタマイズ可能
- レスポンシブなレイアウトと、[Swup](https://swup.js.org/) による滑らかなページ遷移
- [Astro](https://astro.build) と [Tailwind CSS](https://tailwindcss.com) で構築

**上流の Fuwari テーマに加えて**

- 左下に常駐する Live2D 看板娘（[oh-my-live2d](https://github.com/hacxy/oh-my-live2d) で描画）
- 右側の第三カラム —— サイト統計、記事カレンダー、カテゴリ
- 特設ページ：[プロジェクト](https://007912.xyz/projects/)、[スキル](https://007912.xyz/skills/)、[AI ツール](https://007912.xyz/ai-tools/)、[タイムライン](https://007912.xyz/timeline/)

## 🚀 はじめかた

1. **コードを取得する。** このリポジトリをフォークするか、テンプレートから[新しいリポジトリを作成](https://github.com/Xieluyang912/fuwari/generate)します。

    上記のカスタマイズが**含まれない**オリジナルの Fuwari テーマを使いたい場合は、代わりにこちらを実行してください：

    ```sh
    npm create fuwari@latest
    yarn create fuwari
    pnpm create fuwari@latest
    bun create fuwari@latest
    deno run -A npm:create-fuwari@latest
    ```

2. **依存関係をインストールする**には `pnpm install` を実行します。[pnpm](https://pnpm.io) が未導入の場合は、先に `npm install -g pnpm` を実行してください。
3. **ブログを設定する**には `src/config.ts` を編集します。サイトタイトル、バナー、プロフィールカード、ナビゲーション、コメント、看板娘、サイドバー、特設ページはすべてここで設定します。
4. **最初の記事を書く**には `pnpm new-post <ファイル名>` を実行し、`src/content/posts/` 内のファイルを編集します。
5. **デプロイ。** `astro.config.mjs` の `site` と `base` を設定し、[Astro 公式ガイド](https://docs.astro.build/ja/guides/deploy/)に従って Vercel、Netlify、GitHub Pages などにデプロイします。

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

テーマ部分は [MIT License](../LICENSE) の下で公開されています。記事の内容は [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) に従います。
