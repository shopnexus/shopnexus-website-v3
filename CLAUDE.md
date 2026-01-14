# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start development server at localhost:3000
bun run build    # Production build
bun run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 ecommerce marketplace application using the App Router with React 19 and TypeScript.

### Stack
- **Framework**: Next.js 16 with App Router (React Server Components enabled)
- **Styling**: Tailwind CSS 4 with CSS variables for theming
- **UI Components**: shadcn/ui (new-york style) with lucide-react icons
- **State Management**: TanStack Query for server state
- **Package Manager**: Bun

### Project Structure

```
app/
├── (marketplace)/           # Main marketplace route group
│   ├── page.tsx            # Home page with hero, categories, products
│   ├── layout.tsx          # Marketplace layout with header/footer
│   ├── product/[slug]/     # Product detail page
│   ├── categories/         # Categories listing and detail pages
│   ├── search/             # Search results page
│   ├── cart/               # Full cart page
│   ├── checkout/           # Multi-step checkout flow
│   └── deals/              # Deals and promotions page
├── layout.tsx              # Root layout with QueryProvider
└── globals.css             # Global styles and CSS variables

components/
├── ui/                     # shadcn/ui components
├── layout/                 # Header, Footer, Navigation
├── product/                # ProductCard, ProductGrid
├── cart/                   # CartSheet (sidebar cart)
└── providers/              # QueryProvider

core/                       # TanStack Query hooks and API layer
├── catalog/                # Product and category queries
│   ├── product.customer.ts # Product listing, detail, recommendations
│   └── category.ts         # Category queries
├── order/                  # Order-related queries
│   └── cart.ts             # Cart operations (get, update, clear)
├── promotion/              # Promotions queries
├── inventory/              # Inventory queries
├── account/                # User account queries
├── analytic/               # Analytics queries
└── common/                 # Shared types (Resource, etc.)

lib/
└── utils.ts                # Utility functions (cn, formatPrice)
```

### Path Aliases
- `@/*` maps to the project root (configured in tsconfig.json)
- shadcn components go in `@/components/ui`
- TanStack Query hooks go in `@/core`
- Utilities in `@/lib`

### Key Patterns

#### TanStack Query Hooks (in ./core)
All data fetching uses TanStack Query with infinite queries for pagination:
```typescript
// Example usage
const { data, isLoading, fetchNextPage, hasNextPage } = useListProductCards({ limit: 12 })
const products = data?.pages.flatMap(page => page.data) ?? []
```

#### Cart Operations
```typescript
const { data: cart } = useGetCart()
const updateCart = useUpdateCart()
const clearCart = useClearCart()

// Add/update item
updateCart.mutate({ sku_id: "...", delta_quantity: 1 })
// Remove item
updateCart.mutate({ sku_id: "...", quantity: 0 })
```

#### Price Formatting
```typescript
import { formatPrice } from "@/lib/utils"
formatPrice(29.99) // "$29.99"
```

### shadcn/ui Configuration
The project uses shadcn/ui with:
- Style: new-york
- Base color: stone
- CSS variables enabled
- Icon library: lucide-react

Add components via: `bunx shadcn@latest add <component>`

### Theming
Global styles in `app/globals.css` define CSS custom properties for light/dark themes using OKLCH color space. Dark mode uses the `.dark` class selector.

### Features Implemented
- Home page with hero section, categories, and product grid
- Product detail page with SKU selection, gallery, and reviews
- Category browsing with filters and sorting
- Search with filters
- Shopping cart (sidebar sheet + full page)
- Multi-step checkout flow
- Deals and promotions page
- Responsive design throughout
