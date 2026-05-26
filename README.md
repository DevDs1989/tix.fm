# tix.fm

Turn your listening history into shareable music stories.

tix.fm is a social-first music recap app that transforms Last.fm listening data into visually polished story-style cards optimized for sharing on platforms like Instagram, X, and LinkedIn.

Instead of static yearly recaps, tix.fm makes listening stats dynamic, customizable, and instantly exportable directly from the browser.


---

## Why?

Music recap experiences are usually:
- locked behind yearly events
- non-customizable
- platform-specific
- visually repetitive

tix.fm explores a more real-time and expressive approach to music identity by letting users generate high-quality recap cards whenever they want.

The project focuses heavily on:
- polished visual presentation
- fast client-side rendering
- responsive UX
- browser-native image generation
- clean frontend architecture

---

# Features

### Story-Style Recap Cards
Generate visually styled music recap cards inspired by modern social media story formats.

### Last.fm Integration
Fetch top artists and tracks directly from the Last.fm API.

### Multiple Listening Ranges
Generate recaps for:
- 7 Days
- 1 Month
- 3 Months
- 6 Months
- 1 Year
- All Time

### Client-Side Image Export
Export recap cards directly as PNG images without requiring server-side rendering infrastructure.

### Dynamic Artist Artwork
Artist images are resolved dynamically using the `album-art` package.

### Responsive UI
Optimized layouts across desktop and mobile devices.

### Fast Data Fetching
Uses parallel API requests to minimize perceived loading time when switching between listening periods.

### Cross-Browser Compatibility
Patched Firefox-specific rendering crashes caused by `html-to-image`.

---

# Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| APIs | Last.fm API |
| Image Export | html-to-image |
| Artwork Resolution | album-art |
| Patching | patch-package |

---

# Architecture

## Data Flow

```text
User Input
    ↓
Last.fm API Fetch
    ↓
Data Normalization
    ↓
Artist Artwork Resolution
    ↓
Story Card Rendering
    ↓
Client-Side PNG Export
```

---

## API Layer

### `/api/lastfm`

Responsible for:
- fetching top artists
- fetching top tracks
- normalizing Last.fm responses
- mapping tracks to artists
- resolving artwork

### `/api/story`

Uses `next/og` to generate Open Graph-compatible story images using the Edge Runtime.

---

## UI Layer

### `StoryRenderCard.tsx`

Core rendering component responsible for:
- recap layout
- typography
- ranking display
- artwork rendering
- export-ready UI composition

The export system waits for the React tree to fully render before capturing the DOM to avoid partially rendered exports and stale UI state.

---

# Interesting Engineering Problems

## Browser-Native Image Generation

Generating polished exportable images entirely client-side is surprisingly difficult.

The app uses `html-to-image` to capture rendered React components directly from the DOM while preserving:
- gradients
- typography
- responsive layouts
- dynamic artwork

This avoids the complexity and infrastructure cost of server-side rendering pipelines.

---

## Firefox Rendering Failures

Firefox introduced rendering crashes during image export due to canvas font rendering behavior inside `html-to-image`.

The issue was isolated, debugged, and patched locally using `patch-package` to ensure stable exports across browsers.

---

## Last.fm Data Normalization

Last.fm exposes artists and tracks separately with inconsistent metadata quality.

The app normalizes and synchronizes responses into a unified structure to support richer recap generation and consistent rendering.

---

# Local Development

## Clone the repository

```bash
git clone https://github.com/DevDs1989/tix.fm.git
cd tix.fm
```

---

## Install dependencies

```bash
npm install
```

---

## Configure environment variables

Create a `.env.local` file:

```env
LASTFM_API_KEY=
```

---

## Start the development server

```bash
npm run dev
```

---

# Future Improvements

- Spotify integration
- More recap templates
- Animated exports
- Public user profiles
- AI-generated listening summaries
- Shareable hosted recap pages
- Playlist-based recap generation
- Collaborative listening stories

---

# Philosophy

tix.fm treats listening history as social expression rather than analytics.

The goal is not just to display music data, but to make it visually meaningful, personal, and worth sharing.

---

# License

MIT
