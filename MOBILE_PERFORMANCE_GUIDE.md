# Mobile Performance Optimization Guide for Tauri

## Quick Wins (5-10% improvement)

### 1. Parallel API Calls
Instead of fetching categories, batches, and farmers sequentially, fetch them in parallel.

**Current:** Takes ~3000ms if each API is 1000ms
**After:** Takes ~1000ms

```typescript
// Instead of:
const categories = await inventoryModule.listCategories();
const batches = await inventoryModule.listBatches();
const farmers = await inventoryModule.listFarmers();

// Use Promise.all:
const [categories, batches, farmers] = await Promise.all([
  inventoryModule.listCategories(),
  inventoryModule.listBatches(),
  inventoryModule.listFarmers(),
]);
```

### 2. Image Optimization
Convert hero image to WebP and lazy-load below-fold images.

```typescript
// Before: Large unoptimized JPG loaded on initial render
<img src={hero} alt="Hero" />

// After: WebP with size optimization + lazy loading
<img 
  src="hero.webp" 
  srcSet="hero-480w.webp 480w, hero-1024w.webp 1024w"
  loading="lazy"
  alt="Fresh produce"
/>
```

### 3. Disable Page Animations on Mobile
Framer-motion is expensive on low-end devices.

```typescript
// Add to PageTransition.tsx
const isMobile = window.innerWidth < 768;
const duration = isMobile ? 0.1 : 0.3; // Shorter on mobile
const pageVariants = {
  initial: { opacity: isMobile ? 1 : 0, x: isMobile ? 0 : 20 },
  enter: { 
    opacity: 1, 
    x: 0,
    transition: { duration, ease: "easeOut" }
  },
};
```

---

## Medium Impact (15-20% improvement)

### 4. Code Splitting with Lazy Loading
Load pages only when needed, not upfront.

```typescript
// Instead of: import Cart from "./pages/Cart.tsx"
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const Track = lazy(() => import("./pages/Track.tsx"));

// Then wrap routes with Suspense:
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/cart" element={<Cart />} />
</Suspense>
```

### 5. Skeleton Screens + Request Caching
Show skeleton immediately, cache results aggressively.

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min cache on mobile
      gcTime: 10 * 60 * 1000,   // 10 min garbage collection
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### 6. Vite Build Optimization
Update vite.config.ts:

```typescript
export default defineConfig({
  build: {
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: 'terser', // Better minification than esbuild
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs
        passes: 2,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'framer': ['framer-motion'],
          'radix': Object.keys(dependencies)
            .filter(key => key.startsWith('@radix-ui'))
            .slice(0, 5), // Split radix into chunks
          'query': ['@tanstack/react-query'],
        }
      }
    }
  }
});
```

---

## Heavy Lifting (25-40% improvement)

### 7. Tauri Preload Optimization
Reduce IPC calls on app startup:

```typescript
// src-tauri/src/main.rs
#[tauri::command]
fn get_initial_data() -> InitialData {
    // Fetch all data in single backend call instead of 3 frontend calls
    InitialData {
        categories: get_categories(),
        featured_products: get_featured(),
        config: get_app_config(),
    }
}

// Frontend
const { data: initial } = useQuery({
  queryKey: ["initial-data"],
  queryFn: () => invoke("get_initial_data"), // Single IPC call
});
```

### 8. Remove Unused Dependencies
You're loading ALL of shadcn/ui + all Radix UI components even if you don't use them.

```bash
# Audit bundle
npm install -g bundle-buddy
vite build --mode analyze

# Remove unused:
# - Remove embla-carousel if not using carousels
# - Remove react-resizable-panels if not using splits
# - Tree-shake unused radix components
```

### 9. Service Worker Caching (for Tauri)
Cache static assets and API responses:

```typescript
// Create public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/src/main.jsx',
        '/assets/hero-produce.webp',
      ]);
    })
  );
});
```

### 10. Reduce Tailwind CSS Size
Your tailwind config is probably including unused utilities.

```js
// tailwind.config.ts
export default {
  content: ['./src/**/*.{js,tsx}'], // Scan only src
  theme: {
    extend: {
      // Only include used animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        // Remove unused animations
      }
    }
  },
}
```

---

## Measurement & Monitoring

Add performance markers:

```typescript
// Check initial load time
if (window.performance) {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('Page load time:', pageLoadTime, 'ms');
  
  // Send to analytics
  if (pageLoadTime > 3000) {
    console.warn('Slow load detected on mobile');
  }
}
```

---

## Priority Implementation Order

1. **First**: Parallel API calls (#1) + Image optimization (#2) - Quick wins, 10-15% gain
2. **Second**: Code splitting (#4) + Build optimization (#6) - 15-20% gain
3. **Third**: Tauri preload (#7) + Remove unused deps (#8) - 20-30% gain
4. **Last**: Service workers (#9) + CSS tree-shaking (#10) - Diminishing returns

**Expected Results**: 
- Before: ~3500ms on mid-range mobile
- After Phase 1: ~3000ms (14% faster)
- After Phase 2: ~2200ms (37% faster)
- After Phase 3: ~1500ms (57% faster)

