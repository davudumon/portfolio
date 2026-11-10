# Next.js Portfolio

An interactive portfolio built with the Next.js App Router, TypeScript, GSAP, and Three.js.

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Available validation commands:

```bash
npm run typecheck
npm run lint
npm run build
```

## Structure

- `app/`: App Router entry points, metadata, fonts, and global design tokens.
- `components/`: UI panels, loader, title pill, and carousel components.
- `components/Carousel/`: Three.js scene, shaders, card mesh, and texture painting.
- `context/`: Portfolio UI state managed with a React reducer.
- `data/projects.ts`: Typed project data.
- `lib/`: Carousel constants and utility functions.
- `types/`: Domain types and CSS/Three.js declarations.

## Adding a project

Add a new object to the `projects` array in `data/projects.ts` with:

- `title`, `year`, `role`, `stack`, `description`, `highlight`, and `gradient`.
- An optional `image`, using a public path such as `/images/file-name.webp`.
- If `image` is omitted, the carousel looks for `/images/<lowercase-title-with-hyphens>.webp`.

Images and the CV are stored in `public/`. About content and the CV link are rendered by their respective panel component.
