# KaliFinder Search UI

> **Embeddable AI-powered search widget for e-commerce**

[![React](https://img.shields.io/badge/react-19.2-blue)]() [![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)]() [![Vite](https://img.shields.io/badge/vite-7.1-646CFF)]() [![Tailwind](https://img.shields.io/badge/tailwind-4.0-38B2AC)]()

Lightweight, fast, and fully isolated search widget that integrates seamlessly into any e-commerce website using Shadow DOM.

---

## 🚀 Quick Start

### CDN Installation

```html
<script
  src="https://cdn.kalifinder.com/kalifind-search.js?storeUrl=https://your-store.com"
  defer
></script>
```

Widget auto-injects search button → Click → Instant search with filters & cart integration

---

## 💻 Development

### Prerequisites

```bash
node >= 20
pnpm >= 10.19.0
```

### Setup

```bash
git clone https://github.com/devsaround/KaliFinder-Search-UI.git
cd KaliFinder-Search-UI
pnpm install
pnpm dev  # http://localhost:8080
```

### Commands

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Dev embed build + preview (localhost:8080) |
| `pnpm build`        | Production build (minified + inline CSS) |
| `pnpm build:dev`    | Dev build (unminified + inline CSS)      |
| `pnpm test:cdn`     | Build + test locally in browser          |
| `pnpm type-check`   | TypeScript checking                      |
| `pnpm lint`         | ESLint                                   |
| `pnpm format`       | Prettier                                 |
| `pnpm check:strict` | All checks + build                       |
| `pnpm clean`        | Remove build artifacts                   |

**Note:** `build` and `build:dev` automatically inline processed CSS into the JS bundle for Shadow DOM isolation.

### Debugging on a local WordPress site (HTTP)

1. Start the dev embed bundle server:

```bash
pnpm dev
```

2. Load the local bundle from WordPress (theme enqueue, header injection, etc.):

```html
<script
  src="http://localhost:8080/kalifind-search.js?storeUrl=http://YOUR_LOCAL_WP_SITE&debug=true"
  defer
></script>
```

3. In Chrome/Edge DevTools:
- Network: confirm `kalifind-search.js` **and** `kalifind-search.js.map` load with 200
- Settings: ensure **JavaScript source maps** are enabled
- Sources: set breakpoints in `src/embed/bootstrap.tsx` / `src/embed/utils/dom-setup.ts`

Tip: you can open the widget without clicking UI:

```js
window.dispatchEvent(new CustomEvent('kalifinder:open', { detail: { query: 'test' } }));
```

Other useful debug hooks:
- After the script loads, the widget exposes `window.Kalifinder` (UMD) and sets `window.KalifinderController`
- You can open the widget with `window.KalifinderController?.open('test')`
- UI debug utility: `window.__KALIFINDER_UI_DEBUG__`

---

## 🌍 Environment

### ⚠️ Critical: Backend URL

`VITE_BACKEND_URL` should **NOT** include `/api` suffix:

```bash
# ✅ CORRECT
VITE_BACKEND_URL=https://api.kalifinder.com

# ❌ WRONG (creates /api/api/v1/...)
VITE_BACKEND_URL=https://api.kalifinder.com/api
```

**Why?** Endpoints already have full paths (`/api/v1/search/search`, not `/search`)

### Files

```bash
# .env.development
NODE_ENV=development
VITE_BACKEND_URL=https://api.kalifinder.com

# .env.production
NODE_ENV=production
VITE_BACKEND_URL=https://api.kalifinder.com
VITE_WIDGET_CDN_URL=https://cdn.kalifinder.com/kalifind-search.js
```

---

## 🔌 API

**Base:** https://api.kalifinder.com  
**Docs:** https://api.kalifinder.com/api-docs  
**Health:** https://api.kalifinder.com/health

### Endpoints

```
GET /api/v1/search/search?storeUrl={url}&q={query}
GET /api/v1/search/autocomplete?storeUrl={url}&q={query}
GET /api/v1/search/recommended?storeUrl={url}
GET /api/v1/facets/configured?storeUrl={url}
GET /api/v1/search/popular?storeUrl={url}
```

---

## � Build Process & Shadow DOM CSS Handling

### Overview

The widget uses **Shadow DOM** for complete style isolation. To achieve this with Tailwind CSS v4, we use a post-build script that inlines the processed CSS into the JavaScript bundle.

### Build Flow

```
1. Vite Build (dev/production)
   ↓
2. Tailwind CSS processes src/index.css
   ↓
3. Outputs dist/kalifind-search.js + dist/kalifind-search.css
   ↓
4. Post-build script (inline-css-build.mjs)
   ↓
5. Reads CSS file content
   ↓
6. Injects CSS as __WIDGET_CSS__ variable at start of JS file
   ↓
7. Deletes separate CSS file
   ↓
8. Single dist/kalifind-search.js with inlined CSS
```

### How It Works

1. **Development Mode** (`pnpm dev`):
   - Uses `src/main.tsx` entry point
   - Vite dev server serves CSS separately
   - No Shadow DOM, direct rendering
   - Hot Module Replacement (HMR) works

2. **Production Build** (`pnpm build` or `pnpm build:dev`):
   - Uses `src/embed-search.tsx` entry point
   - Vite builds to UMD format
   - Tailwind CSS fully compiles `src/index.css`
   - `inline-css-build.mjs` inlines CSS into JS
   - Shadow DOM injects CSS from `__WIDGET_CSS__` variable

### CSS Injection (embed-search.tsx)

```typescript
// CSS is prepended to bundle by inline-css-build.mjs
const __WIDGET_CSS__ = `/* 40KB+ of compiled Tailwind CSS */`;

// Later in initializeEmbeddedWidget()
const shadowRoot = container.attachShadow({ mode: 'open' });
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  :host { all: initial; display: block; }
  ${__WIDGET_CSS__}
`;
shadowRoot.appendChild(styleSheet);
```

### Post-Build Script (inline-css-build.mjs)

Located at project root. Automatically runs after every build:

```javascript
// 1. Reads dist/kalifind-search.css (40KB+)
// 2. Escapes special characters (\, `, $)
// 3. Prepends to JS: const __WIDGET_CSS__ = `...`;
// 4. Deletes separate CSS file
// 5. Result: Single 450KB+ self-contained JS file
```

### Why This Approach?

- ✅ **Shadow DOM Isolation**: Styles cannot leak to/from host page
- ✅ **Single File Distribution**: No separate CSS file to load
- ✅ **Tailwind CSS v4 Support**: Full processing before inlining
- ✅ **CDN-Friendly**: One file to cache and serve
- ✅ **No FOUC**: Styles loaded synchronously with JS

---

## �📂 Structure

```
src/
├── components/       # React components
├── hooks/            # useSearch, useFilters, useAutocomplete
├── stores/           # Zustand (search, filter, UI state)
├── services/         # API client & endpoints
├── analytics/        # UBI tracking
├── index.css         # Tailwind (single source)
├── main.tsx          # Dev entry (localhost)
└── embed-search.tsx  # Production entry (CDN + Shadow DOM)

Root files:
├── inline-css-build.mjs  # Post-build script (CSS inlining)
├── vite.config.ts        # Build config (Tailwind + UMD)
├── test-cdn.html         # Local testing page
└── buildspec.yml         # AWS CodeBuild config
```

### Key Files Explained

**`src/embed-search.tsx`** - Production entry point

- Creates Shadow DOM for style isolation
- Detects host page search elements
- Injects widget with isolated styles
- Defines `__WIDGET_CSS__` variable for CSS injection

**`inline-css-build.mjs`** - Post-build script

- Reads compiled CSS from `dist/kalifind-search.css`
- Injects it into `dist/kalifind-search.js`
- Replaces `__WIDGET_CSS__` placeholder with actual CSS
- Removes separate CSS file (single bundle)

**`vite.config.ts`** - Build configuration

- `@tailwindcss/vite` - Processes Tailwind directives
- UMD format - Universal module definition
- CSS code split: false - Single CSS bundle
- Library mode - Widget build (not SPA)

---

## 🧪 Testing

```bash
pnpm test:cdn
# Opens test-cdn.html → Click purple icon → Test search
```

**Different stores:** Edit `test-cdn.html` → Change `storeUrl` parameter

---

## 📦 Build

### Build Process

```bash
pnpm build
# 1. Clean previous build
# 2. TypeScript compilation
# 3. Vite build (Tailwind CSS processing)
# 4. CSS inlining (inline-css-build.mjs)
# Output: dist/kalifind-search.js (~465 KB)
```

### Shadow DOM CSS Handling

The widget uses **Shadow DOM** for complete style isolation. To ensure Tailwind CSS works correctly:

1. **Development Mode** (`pnpm dev`):
   - Vite dev server processes CSS in real-time
   - Styles work immediately with HMR
   - Uses `main.tsx` entry point

2. **Production Build** (`pnpm build`):
   - Uses `embed-search.tsx` entry point
   - Vite processes `index.css` → Tailwind compiles to CSS
   - `inline-css-build.mjs` inlines the processed CSS into JS
   - Result: Single JS file with embedded styles

**Why not `?inline` import?**  
Using `import './index.css?inline'` would import the **raw unprocessed CSS** before Tailwind compilation. Instead, we:

- Import CSS normally so Tailwind processes it
- Extract the compiled CSS after build
- Inline it into the JS bundle
- Inject into Shadow DOM at runtime

### Build Output

```
dist/
└── kalifind-search.js  # Single file with inlined CSS
```

### AWS Deployment

`buildspec.yml` → CodeBuild → S3 + CloudFront

**Required env vars:**

- `S3_BUCKET`
- `CLOUDFRONT_ID`

---

## 🚨 Troubleshooting

### Widget Not Loading

1. Verify script: `https://cdn.kalifinder.com/kalifind-search.js`
2. Check `storeUrl` parameter is correct
3. Open browser console for errors
4. Verify backend API is accessible

### Blank Modal / Missing Styles

**Symptom:** Widget opens but has no styling (white boxes, no colors)

**Cause:** CSS not properly processed/inlined into Shadow DOM

**Fix:**

```bash
pnpm clean
pnpm build:dev
pnpm test:cdn  # Test locally
```

**Verify:** Check that `dist/kalifind-search.js` contains CSS (search for `background-color`, `flex`, etc.)

### API Connection Issues

**Test API:** `curl https://api.kalifinder.com/health`

**Common issues:**

- Check `VITE_BACKEND_URL` (no `/api` suffix)
- Network tab → Verify endpoints
- CORS issues → Check backend configuration

### 404 Errors

Endpoints must use `/api/v1/search/search` (not `/api/v1/search`)

---

## 📊 Performance

- Bundle: ~465 KB (gzipped: ~120 KB)
- First paint: < 500ms
- Supports 10,000+ products (virtualized)
- Zero host page impact

---

## 🤝 Contributing

```bash
pnpm check:strict  # Before PR
pnpm test:cdn
```

**Standards:**

- TypeScript strict
- Prettier (100 char, single quotes)
- Conventional commits

---

## 📝 Changelog

### v1.0.0 (Oct 29, 2025)

✅ Fixed API endpoint paths  
✅ Fixed environment config (removed `/api` suffix)  
✅ Updated autocomplete & facets endpoints

**Updated endpoints:**

- `/api/v1/search` → `/api/v1/search/search`
- `/v1/autocomplete` → `/api/v1/search/autocomplete`
- `/v1/facets` → `/api/v1/facets/configured`

---

**API Docs:** https://api.kalifinder.com/api-docs  
**Support:** support@kalifinder.com  
**Built with ❤️ by KaliFinder Team**
