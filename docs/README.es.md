# 🍥 La casita de Xieluyang

![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)

Mi blog personal: apuntes de estudio, cosas que voy trasteando y cualquier otra cosa que merezca la pena dejar por escrito. Está construido con [Astro](https://astro.build) sobre el tema [Fuwari](https://github.com/saicaca/fuwari), con una mascota Live2D, un diseño de tres columnas y algunas páginas extra portadas del tema [Mizuki](https://github.com/LyraVoid/Mizuki).

[**🖥️ Ver el sitio**](https://007912.xyz)

![Página de inicio](images/home-light.png)

🌏 README en
[**English**](https://github.com/Xieluyang912/fuwari/blob/main/README.md) /
[**中文**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.zh-CN.md) /
[**日本語**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.ja.md) /
[**한국어**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.ko.md) /
[**ไทย**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.th.md) /
[**Tiếng Việt**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.vi.md) /
[**Bahasa Indonesia**](https://github.com/Xieluyang912/fuwari/blob/main/docs/README.id.md)

## ✨ Características

- [x] Construido con [Astro](https://astro.build) y [Tailwind CSS](https://tailwindcss.com)
- [x] Animaciones y transiciones de página fluidas, gracias a [Swup](https://swup.js.org/)
- [x] Modo claro / oscuro
- [x] Color del tema y banner personalizables
- [x] Diseño responsivo
- [x] Búsqueda de texto completo con [Pagefind](https://pagefind.app/)
- [x] [Sintaxis extendida de Markdown](#-sintaxis-extendida-de-markdown)
- [x] Tabla de contenidos
- [x] Feed RSS
- [x] Comentarios con [giscus](https://giscus.app/)
- [x] Mascota Live2D en la esquina inferior izquierda, renderizada con [oh-my-live2d](https://github.com/hacxy/oh-my-live2d)
- [x] Barra lateral derecha con estadísticas del sitio, calendario de entradas y categorías
- [x] Páginas extra: [Proyectos](https://007912.xyz/projects/), [Habilidades](https://007912.xyz/skills/), [Herramientas de IA](https://007912.xyz/ai-tools/) y [Cronología](https://007912.xyz/timeline/)

## 🚀 Cómo empezar

¿Quieres montar un blog como este?

1. Empieza desde este repositorio:
    - [Genera un nuevo repositorio](https://github.com/Xieluyang912/fuwari/generate) a partir de esta plantilla, o haz un fork de este repositorio.
    - También puedes inicializar el tema Fuwari original con estos comandos, pero ten en cuenta que así obtienes el tema original **sin** las personalizaciones descritas arriba:
       ```sh
       npm create fuwari@latest
       yarn create fuwari
       pnpm create fuwari@latest
       bun create fuwari@latest
       deno run -A npm:create-fuwari@latest
       ```
2. Clona tu repositorio y ejecuta `pnpm install` para instalar las dependencias.
    - Si aún no tienes [pnpm](https://pnpm.io), instálalo con `npm install -g pnpm`.
3. Edita el archivo de configuración `src/config.ts` para personalizar tu blog: el título del sitio, el banner, la tarjeta de perfil, la navegación, los comentarios, la mascota Live2D, la barra lateral y las páginas extra están todos ahí.
4. Ejecuta `pnpm new-post <nombre-de-archivo>` para crear una entrada nueva y edítala en `src/content/posts/`.
5. Antes de desplegar, configura `site` y `base` en `astro.config.mjs` y despliega en Vercel, Netlify, GitHub Pages, etc. siguiendo las [guías de Astro](https://docs.astro.build/es/guides/deploy/).

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

El tema se distribuye bajo la [Licencia MIT](LICENSE). Las entradas del blog se publican bajo [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
