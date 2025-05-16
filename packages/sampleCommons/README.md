This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/drsHostnameSlice.ts`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Sample Commons

This is a sample implementation of a Gen3 Commons site.

## Development

### Standard Development

```bash
npm run dev
```

### Optimized Development (Faster Hot Reloading)

For faster hot reloading during development, use the optimized development script:

```bash
npm run dev:fast
```

This script:
- Increases the Node.js memory limit to 4GB
- Uses Next.js Turbo mode for faster compilation
- Takes advantage of webpack optimizations in next.config.js
- Uses content caching to avoid expensive reloads

If you need HTTPS, use:

```bash
npm run devssh:fast
```

## Performance Optimizations

The following optimizations have been implemented to improve hot reload performance:

1. **Webpack Optimizations in next.config.js**:
   - Reduced filesystem operations with optimized watchOptions
   - Enabled module resolution caching
   - Used faster source maps in development mode

2. **Content Caching in _app.tsx**:
   - Content is loaded only once during development
   - Subsequent hot reloads use cached content
   - This avoids expensive filesystem operations on every reload

3. **Next.js Turbo Mode**:
   - Experimental feature that can significantly improve development performance
   - Used in the dev:fast and devssh:fast scripts

These optimizations should reduce hot reload times from 30+ seconds to just a few seconds.
