# ⚡ Omega Dashboard

A modern, production-quality **SaaS Admin Dashboard** built with React, TypeScript, Vite, and Tailwind CSS. Inspired by the design philosophy of **Linear**, **Stripe**, and **Vercel**.

> **Live API**: [dummyjson.com/products](https://dummyjson.com/products)

---

## ✨ Features

### Core Dashboard
- 📊 **Analytics Overview** — KPI cards, category pie chart, stock bar chart, price area chart
- 🛍️ **Product Management** — Full-featured table with 194+ products
- 🔍 **Product Detail** — Image carousel, thumbnail gallery, reviews, full specs
- ⚙️ **Settings** — Column visibility, theme, pagination preferences

### Product Table Capabilities
- ✅ **Debounced Search** — 400ms debounce for smooth UX
- ✅ **Multi-category Filter** — Select multiple categories simultaneously
- ✅ **Sorting** — By title, price, rating, stock (asc/desc)
- ✅ **Pagination** — Configurable page size (10/20/50)
- ✅ **URL State Sync** — All filters sync to URL params (`?category=smartphones&sort=price`)
- ✅ **Column Visibility** — Show/hide any column, persisted to localStorage
- ✅ **Loading Skeletons** — Professional skeleton UI while loading
- ✅ **Error + Empty States** — Graceful handling with retry options

### Bonus Features
- 🎯 **Command Palette** — `Ctrl+K` / `Cmd+K` for quick navigation
- 🔄 **Real-time Polling** — Auto-refreshes every 30 seconds
- 🌙 **Dark / Light Mode** — Persisted theme toggle
- 🍞 **Toast Notifications** — Contextual feedback for all actions
- ⌨️ **Keyboard Accessibility** — Full keyboard navigation, ARIA labels

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| State | Zustand (with persistence) |
| Charts | Recharts |
| Table | TanStack Table v8 |
| HTTP | Axios |
| Animation | Framer Motion |
| Icons | Lucide React |
| Toasts | React Hot Toast |

---

## 📁 Folder Structure

```
src/
├── components/        # Reusable UI components
│   ├── Badge.tsx
│   ├── CommandPalette.tsx
│   ├── PageLoader.tsx
│   ├── RatingStars.tsx
│   ├── Skeleton.tsx
│   └── StatCard.tsx
├── hooks/             # Custom React hooks
│   ├── useDebounce.ts
│   ├── useKeyboardShortcut.ts
│   ├── useProduct.ts
│   └── useProducts.ts
├── layouts/           # Page layout components
│   ├── DashboardLayout.tsx
│   ├── MobileDrawer.tsx
│   ├── Sidebar.tsx
│   └── TopBar.tsx
├── pages/             # Route page components
│   ├── Dashboard.tsx
│   ├── NotFound.tsx
│   ├── ProductDetail.tsx
│   ├── Products.tsx
│   └── Settings.tsx
├── routes/            # React Router config
│   └── index.tsx
├── services/          # API abstraction layer
│   └── api.ts
├── store/             # Zustand state stores
│   └── index.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── utils/             # Helper utilities
│   └── index.ts
├── App.tsx
├── index.css
└── main.tsx
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/omega-dashboard.git
cd omega-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking
```

---

## 🌍 Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://dummyjson.com
```

See [`.env.example`](.env.example) for reference.

---

## 🚢 Deployment on Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Option 2: CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Build the project
npm run build

# Deploy
vercel --prod
```

### Vercel Configuration

The app works out-of-the-box with Vercel's default settings:
- **Framework**: Vite (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Add your environment variables in the Vercel dashboard under **Project Settings → Environment Variables**.

---

## ⚡ Performance Optimizations

| Technique | Implementation |
|-----------|---------------|
| **Code Splitting** | `React.lazy` + `Suspense` for all pages |
| **Debounced Search** | 400ms debounce prevents excessive re-renders |
| **Memoization** | `React.memo`, `useMemo`, `useCallback` throughout |
| **Lazy Loading** | Product images use `loading="lazy"` |
| **Manual Chunks** | Recharts, Framer Motion, TanStack split into separate bundles |
| **CSS Optimization** | Tailwind CSS v4 with zero-runtime overhead |
| **State Persistence** | Zustand with localStorage to avoid redundant API calls |

---

## 🎨 Design System

- **Primary**: Brand violet `#6274f5`
- **Dark Surface**: `#0a0a0f` → `#16161f`
- **Typography**: Inter (UI), JetBrains Mono (code)
- **Glassmorphism**: Backdrop blur + translucent borders
- **Animations**: Framer Motion page transitions + micro-animations

---

## 📄 License

MIT — free to use and modify.
