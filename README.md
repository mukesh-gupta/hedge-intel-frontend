This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.jsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Keeping Vercel usage low

The browser reads straight from the backend and Vercel runs no function per poll, provided
two settings are in place:

1. **Vercel → Project → Settings → Environment Variables**: add
   `NEXT_PUBLIC_HEDGE_API_BASE_URL` = the backend's public URL (for Production and Preview),
   then redeploy — the value is inlined at build time.
2. **Render → the backend service → Environment**: add `CORS_ORIGINS` =
   `https://hedge-intel-frontend.vercel.app` (comma-separate any other origins) and redeploy.

Without the first setting, reads fall back to the `/api` proxy routes, which are now
edge-cached (`src/lib/route-response.js`) and polled no faster than `src/lib/refresh.js`
allows; the watchlist's live stream only runs in direct mode, because relaying it through
a Vercel function kept one running around the clock. Writes (scan, watchlist edits,
settings) always go through the proxy, which holds the admin token.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
