<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../assets/readme/hero-dark.svg">
    <img src="../assets/readme/hero.svg" width="100%" alt="Xieluyang's Blog —— un blog personal construido sobre el tema Fuwari, con una mascota Live2D en la esquina inferior izquierda y un diseño de tres columnas: tarjeta de perfil, lista de entradas y barra lateral de estadísticas.">
  </picture>
</p>

# 🍥 La casita de Xieluyang

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

Mi blog personal: apuntes de estudio, cosas que voy trasteando y cualquier otra cosa que merezca la pena dejar por escrito.

Está construido con [Astro](https://astro.build) sobre el tema [Fuwari](https://github.com/saicaca/fuwari), con una mascota Live2D, un diseño de tres columnas y algunas páginas extra portadas del tema [Mizuki](https://github.com/LyraVoid/Mizuki).

**🖥️ Visítalo en [007912.xyz](https://007912.xyz)**

![Página de inicio: banner, tarjeta de perfil, lista de entradas y barra lateral de estadísticas (modo claro)](images/home-light.png)

🌏 **README en:** [English](../README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md)

## ✨ Características

**Escritura**

- [Sintaxis extendida de Markdown](#-sintaxis-extendida-de-markdown): bloques de aviso, tarjetas de repositorios de GitHub y bloques de código de [Expressive Code](https://expressive-code.com/) con números de línea y secciones plegables
- Tabla de contenidos en cada entrada
- Búsqueda de texto completo con [Pagefind](https://pagefind.app/) y feed RSS
- Comentarios con [giscus](https://giscus.app/)

**Aspecto**

- Modo claro / oscuro, con color del tema y banner personalizables
- Diseño responsivo y transiciones de página fluidas gracias a [Swup](https://swup.js.org/)
- Construido con [Astro](https://astro.build) y [Tailwind CSS](https://tailwindcss.com)

**Más allá del tema Fuwari original**

- Una mascota Live2D en la esquina inferior izquierda, renderizada con [oh-my-live2d](https://github.com/hacxy/oh-my-live2d)
- Una tercera columna a la derecha: estadísticas del sitio, calendario de entradas y categorías
- Páginas extra: [Proyectos](https://007912.xyz/projects/), [Habilidades](https://007912.xyz/skills/), [Herramientas de IA](https://007912.xyz/ai-tools/) y [Cronología](https://007912.xyz/timeline/)

## 🚀 Cómo empezar

1. **Consigue el código.** Haz un fork de este repositorio o [genera uno nuevo a partir de la plantilla](https://github.com/Xieluyang912/fuwari/generate).

    ¿Prefieres el tema Fuwari original **sin** las personalizaciones de arriba? Inicialízalo directamente:

    ```sh
    npm create fuwari@latest
    yarn create fuwari
    pnpm create fuwari@latest
    bun create fuwari@latest
    deno run -A npm:create-fuwari@latest
    ```

2. **Instala las dependencias** con `pnpm install`. Si aún no tienes [pnpm](https://pnpm.io), ejecuta antes `npm install -g pnpm`.
3. **Configura tu blog** en `src/config.ts`: el título del sitio, el banner, la tarjeta de perfil, la navegación, los comentarios, la mascota Live2D, la barra lateral y las páginas extra están todos ahí.
4. **Escribe tu primera entrada** con `pnpm new-post <nombre-de-archivo>` y edítala en `src/content/posts/`.
5. **Despliega.** Configura `site` y `base` en `astro.config.mjs` y sigue las [guías de despliegue de Astro](https://docs.astro.build/es/guides/deploy/) para Vercel, Netlify, GitHub Pages, etc.

## 📝 Cabecera de las entradas

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: es      # Solo se define si el idioma de la entrada difiere del idioma del sitio en `config.ts`
---
```

## 🧩 Sintaxis extendida de Markdown

Además del soporte predeterminado de Astro para [GitHub Flavored Markdown](https://github.github.com/gfm/), se incluyen varias funciones extra de Markdown:

- **Admonitions (bloques de aviso)**, escritos como directivas:

  ```md
  :::note
  Información que el lector debería tener en cuenta.
  :::

  :::tip
  Información opcional que ayuda a comprender mejor.
  :::
  ```

- **Tarjetas de repositorios de GitHub**, mediante la directiva `github`:

  ```md
  ::github{repo="saicaca/fuwari"}
  ```

- **Bloques de código mejorados** con [Expressive Code](https://expressive-code.com/): números de línea, secciones plegables y botón de copiar.

## ⚡ Comandos

Todos los comandos se ejecutan desde la raíz del proyecto, en una terminal:

| Command                    | Action                                              |
|:---------------------------|:----------------------------------------------------|
| `pnpm install`             | Instala las dependencias                            |
| `pnpm dev`                 | Inicia el servidor de desarrollo en `localhost:4321` |
| `pnpm build`               | Compila el sitio de producción en `./dist/`          |
| `pnpm preview`             | Previsualiza la compilación en local antes de desplegar |
| `pnpm check`               | Comprueba si hay errores en el código               |
| `pnpm format`              | Formatea el código con Biome                        |
| `pnpm new-post <filename>` | Crea una entrada nueva                              |
| `pnpm astro ...`           | Ejecuta comandos CLI como `astro add`, `astro check` |
| `pnpm astro --help`        | Muestra la ayuda de la CLI de Astro                 |

## 🙏 Créditos

- [Fuwari](https://github.com/saicaca/fuwari) —— el tema en el que se basa este sitio
- [Mizuki](https://github.com/LyraVoid/Mizuki) —— de donde se portaron la mascota Live2D, la barra lateral derecha y el menú «Others»
- [oh-my-live2d](https://github.com/hacxy/oh-my-live2d) —— la librería de renderizado Live2D
- [Astro](https://astro.build) · [Svelte](https://svelte.dev) · [Tailwind CSS](https://tailwindcss.com)
- [Pagefind](https://pagefind.app/) · [Swup](https://swup.js.org/) · [giscus](https://giscus.app/) · [Expressive Code](https://expressive-code.com/)

## 📄 Licencia

El tema se distribuye bajo la [Licencia MIT](../LICENSE). Las entradas del blog se publican bajo [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
