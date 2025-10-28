# SSR Conversion Guide

This guide explains how to convert remaining pages from client-side rendering to server-side rendering (SSR) for better SEO.

## Pattern Overview

Each page follows this pattern:
1. **Server Component** (`page.tsx`) - Fetches data on server, exports metadata
2. **Client Component** (`PageClient.tsx`) - Handles interactive UI, receives data as props

## Conversion Steps

### Step 1: Create Client Wrapper Component

Create a new file `PageClient.tsx` in the same directory as `page.tsx`:

```typescript
'use client';

import MobileMenuProvider from '../../components/MobileMenuProvider';
import ScrollEffects from '../../components/ScrollEffects';
// ... other imports

interface PageClientProps {
  data: YourDataType;
}

export default function PageClient({ data }: PageClientProps) {
  return (
    <MobileMenuProvider>
      {({ isMobileMenuOpen, toggleMobileMenu }) => (
        <>
          {/* Move all existing JSX here */}
          {/* Replace useState/useEffect data fetching with props */}
          <ScrollEffects />
          {/* Rest of component */}
        </>
      )}
    </MobileMenuProvider>
  );
}
```

### Step 2: Convert page.tsx to Server Component

Replace the entire `page.tsx` file:

```typescript
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageClient from './PageClient';
import { fetchYourData } from '../../lib/data-fetching';

export const metadata: Metadata = {
  title: 'Your Page Title - The Inklined',
  description: 'Page description for SEO',
  openGraph: {
    title: 'Your Page Title',
    description: 'Page description',
    url: 'https://theinklined.com/your-path',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: '/your-path',
  },
};

export default async function YourPage() {
  const data = await fetchYourData();
  
  if (!data) {
    notFound();
  }

  return <PageClient data={data} />;
}
```

### Step 3: Update Data Fetching

If your page uses a data source not in `src/lib/data-fetching.ts`, add a function:

```typescript
export async function fetchYourData() {
  try {
    const dataDir = getDataDir();
    return JSON.parse(
      fs.readFileSync(path.join(dataDir, 'your_data_file.json'), 'utf8')
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}
```

## Key Points

1. **Remove `'use client'`** from `page.tsx`
2. **Remove `useState`, `useEffect`** for data fetching from page component
3. **Keep interactive features** (modals, state) in client component
4. **Add metadata export** for SEO
5. **Use `MobileMenuProvider`** for mobile menu state
6. **Use `ScrollEffects`** for scroll animations (if needed)

## Pages Converted

✅ `/` (homepage)
✅ `/congress`
🔄 `/foreign-affairs` - In progress
⏳ `/trump-admin`
⏳ `/trump-admin/economic-policy`
⏳ `/trump-admin/immigration`
⏳ `/trump-admin/promises-tracker`
⏳ `/trump-admin/spending-cuts`
⏳ `/departments`
⏳ `/courts`
⏳ `/research`
⏳ `/about`
⏳ `/transparency`
⏳ `/contact`

## Testing

After conversion:
1. Run `npm run build` - Should complete without errors
2. Check page renders with `npm run start`
3. Verify data loads correctly
4. Test interactive features still work
5. View page source to confirm HTML is server-rendered

