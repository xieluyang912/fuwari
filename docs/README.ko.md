<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/hero-dark.svg">
    <img src="../assets/readme/hero.svg" width="100%" alt="Xieluyang's Blog —— Fuwari 테마를 기반으로 만든 개인 블로그입니다. 왼쪽 아래에 라이브2D 캐릭터가 있고, 프로필 카드·게시물 목록·통계 사이드바로 이루어진 3단 레이아웃을 사용합니다.">
  </picture>
</p>

# 🍥 Xieluyang의 작은 집

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

공부 기록, 이것저것 만져본 과정 등 남겨 둘 만한 것들을 적어 두는 개인 블로그입니다.

[Astro](https://astro.build)로 만들었고, 테마는 [Fuwari](https://github.com/saicaca/fuwari)를 기반으로 [Mizuki](https://github.com/LyraVoid/Mizuki)의 라이브2D 캐릭터, 오른쪽 사이드바, 특별 페이지들을 옮겨 왔습니다.

**🖥️ 사이트 바로가기: [007912.xyz](https://007912.xyz)**

![홈페이지——배너, 프로필 카드, 게시물 목록과 오른쪽 통계 사이드바 (라이트 모드)](images/home-light.png)

🌏 **README 언어:** [English](../README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [Español](README.es.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md)

## ✨ 특징

**글쓰기**

- [마크다운 확장 구문](#-마크다운-확장-구문) —— 어드모니션, GitHub 저장소 카드, 줄 번호와 접이식을 지원하는 [Expressive Code](https://expressive-code.com/) 코드 블록
- 모든 게시물의 목차(TOC)
- [Pagefind](https://pagefind.app/) 기반 전문 검색과 RSS 피드
- [giscus](https://giscus.app/) 댓글

**겉모습**

- 라이트 / 다크 모드, 테마 색상과 배너 이미지 커스터마이즈
- 반응형 레이아웃과 [Swup](https://swup.js.org/) 기반의 부드러운 페이지 전환
- [Astro](https://astro.build)와 [Tailwind CSS](https://tailwindcss.com)로 제작

**업스트림 Fuwari 테마에 더해**

- 왼쪽 아래에 자리 잡은 Live2D 캐릭터 ([oh-my-live2d](https://github.com/hacxy/oh-my-live2d)로 렌더링)
- 오른쪽 세 번째 칸 —— 사이트 통계, 게시물 달력, 카테고리
- 특별 페이지: [프로젝트](https://007912.xyz/projects/), [기술](https://007912.xyz/skills/), [AI 도구](https://007912.xyz/ai-tools/), [타임라인](https://007912.xyz/timeline/)

## 🚀 시작하기

1. **코드 가져오기.** 이 저장소를 포크하거나 템플릿으로 [새 저장소를 생성](https://github.com/Xieluyang912/fuwari/generate)하세요.

    위에 설명한 커스터마이즈가 **포함되지 않은** 원본 Fuwari 테마를 쓰고 싶다면 대신 아래를 실행하세요:

    ```sh
    npm create fuwari@latest
    yarn create fuwari
    pnpm create fuwari@latest
    bun create fuwari@latest
    deno run -A npm:create-fuwari@latest
    ```

2. **의존성 설치**는 `pnpm install`로 합니다. [pnpm](https://pnpm.io)이 없다면 먼저 `npm install -g pnpm`을 실행하세요.
3. **블로그 설정**은 `src/config.ts`에서 합니다. 사이트 제목, 배너, 프로필 카드, 내비게이션, 댓글, Live2D 캐릭터, 사이드바, 특별 페이지가 모두 여기에 있습니다.
4. **첫 게시물 작성**은 `pnpm new-post <파일명>`으로 하고, `src/content/posts/`에서 편집하세요.
5. **배포.** `astro.config.mjs`의 `site`와 `base`를 설정한 뒤, [Astro 공식 가이드](https://docs.astro.build/ko/guides/deploy/)에 따라 Vercel, Netlify, GitHub Pages 등에 배포하세요.

## 📝 게시물 프런트매터

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: ko      # 게시물의 언어가 `config.ts`의 사이트 언어와 다를 때만 설정하세요
---
```

## 🧩 마크다운 확장 구문

Astro가 기본으로 지원하는 [GitHub Flavored Markdown](https://github.github.com/gfm/) 외에도 몇 가지 확장 기능이 활성화되어 있습니다:

- **어드모니션(Admonitions)** 을 디렉티브 구문으로 작성할 수 있습니다:

  ```md
  :::note
  사용자가 반드시 알아 두어야 할 정보.
  :::

  :::tip
  이해를 돕기 위한 선택적 정보.
  :::
  ```

- **GitHub 저장소 카드** 를 `github` 디렉티브로 삽입할 수 있습니다:

  ```md
  ::github{repo="saicaca/fuwari"}
  ```

- **[Expressive Code](https://expressive-code.com/) 기반의 향상된 코드 블록**: 줄 번호, 접을 수 있는 섹션, 복사 버튼을 지원합니다.

## ⚡ 명령어

모든 명령어는 프로젝트 루트 디렉터리에서 실행합니다:

| Command                    | Action                                              |
|:---------------------------|:----------------------------------------------------|
| `pnpm install`             | 의존성을 설치합니다                                     |
| `pnpm dev`                 | `localhost:4321`에서 로컬 개발 서버를 시작합니다         |
| `pnpm build`               | 프로덕션 사이트를 `./dist/`에 빌드합니다                 |
| `pnpm preview`             | 배포 전에 빌드 결과를 로컬에서 미리 봅니다                |
| `pnpm check`               | 코드의 오류를 검사합니다                                |
| `pnpm format`              | Biome로 코드를 포맷합니다                              |
| `pnpm new-post <filename>` | 새 게시물을 만듭니다                                   |
| `pnpm astro ...`           | `astro add`, `astro check` 등 CLI 명령을 실행합니다    |
| `pnpm astro --help`        | Astro CLI 도움말을 표시합니다                          |

## 🙏 크레딧

- [Fuwari](https://github.com/saicaca/fuwari) —— 이 사이트가 기반으로 삼은 테마
- [Mizuki](https://github.com/LyraVoid/Mizuki) —— 라이브2D 캐릭터, 오른쪽 사이드바, "Others" 메뉴의 원본
- [oh-my-live2d](https://github.com/hacxy/oh-my-live2d) —— 라이브2D 렌더링 라이브러리
- [Astro](https://astro.build) · [Svelte](https://svelte.dev) · [Tailwind CSS](https://tailwindcss.com)
- [Pagefind](https://pagefind.app/) · [Swup](https://swup.js.org/) · [giscus](https://giscus.app/) · [Expressive Code](https://expressive-code.com/)

## 📄 라이선스

테마 부분은 [MIT License](../LICENSE)를 따릅니다. 게시물 내용은 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)을 따릅니다.
