# JM Majiwa — Remotion promo video

A 15-second vertical promo for the JM Majiwa digital products marketplace,
built with [Remotion](https://www.remotion.dev/) and scaffolded with
`npx create-video@latest`.

## Video specs

| Setting    | Value                                             |
| ---------- | ------------------------------------------------- |
| Composition | `JMMajiwaPromo`                                  |
| Size       | 1080 × 1920 (9:16)                                |
| Frame rate | 30 fps                                            |
| Duration   | 450 frames = exactly 15.0 seconds                |
| Theme      | JM Majiwa navy (`#050b2e`) + orange (`#f97316`) |
| Audio      | Silent — add trending audio in TikTok/Reels/CapCut |

## Timeline

1. **Hook (0.0–3.5s)** — “Learn Faster. Create Smarter. Grow with AI.”
   in a staggered word-by-word reveal.
2. **Products (3.0–7.5s)** — AI Prompt Packs, Canva Templates,
   eBooks & Study Materials, and Business Tools cards slide in.
3. **M-Pesa (7.0–11.0s)** — an animated phone mockup shows STK Push,
   PIN entry, payment confirmation and an instant-download progress bar.
4. **CTA (10.5–15.0s)** — confetti, logo, pulsing “SHOP NOW” button,
   `jmmajiwa.com`, and the WhatsApp contact `0745 198 099`.

Scenes are joined with eased `@remotion/transitions` (slide, fade,
slide-up), each 15 frames (0.5s).

## Run it

Install dependencies:

```bash
npm install
```

Preview/edit in Remotion Studio:

```bash
npm run dev
# equivalent to: npx remotion studio
```

Render the MP4:

```bash
npm run render
# equivalent to: npx remotion render JMMajiwaPromo renders/jm-panda-promo.mp4
```

Render a poster frame (the end card at frame 435):

```bash
npm run poster
```

Type-check and lint:

```bash
npm run lint
```

## Customising

Almost everything lives in [`src/theme.ts`](src/theme.ts): video size,
fps, per-scene durations, brand copy (name, URL, WhatsApp number) and the
colour palette (mirrored from the website's `tailwind.config.ts`).
Scene layout/motion lives in `src/scenes/`, shared animated-text and icon
components in `src/components/ui.tsx`, and the timeline in
[`src/Promo.tsx`](src/Promo.tsx).

## Sandbox/CI rendering (bundled Chromium)

On a normal machine Remotion automatically downloads Chrome Headless
Shell on first render — nothing extra is needed. Some locked-down
sandboxes block that download host, so this project also ships a Chromium
binary through the npm package `@sparticuz/chromium` (pinned to Chromium
141 to match Remotion 4.0.537). In such environments (POSIX shells):

```bash
npm run render:sandbox
```

This evaluates [`scripts/extract-chromium.mjs`](scripts/extract-chromium.mjs),
which extracts the bundled browser and points `remotion.config.ts` at it
via `REMOTION_BROWSER_EXECUTABLE`.

## Output

Rendered files are written to `renders/` (git-ignored):

- `renders/jm-panda-promo.mp4` — the final video
- `renders/poster.png` — optional poster/thumbnail
- `renders/stills/` — QA stills used during development

## License note

Remotion may require a company license for some commercial uses — see
[Remotion's license terms](https://www.remotion.dev/docs/license).
