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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# Note
'''
Client (browser)
   ↓
LoginForm (submit)
   ↓
API Route (Next.js server)
   ↓
Prisma ORM
   ↓
Supabase (PostgreSQL)
   ↓
Set HTTP-only cookie
   ↓
Client redirect (tanpa pegang token)
'''

app/
  login/page.tsx          → UI halaman login
  api/auth/login/route.ts → backend API

components/
  LoginForm.tsx           → logic form

services/
  authService.ts          → penghubung ke API

lib/
  db.ts                   → akses database

types/
  auth.ts                 → type TypeScript

User and Password



('Cyka Srihana Humaera', 'cyka@sxcej.com', 'kzqvta', 3, NULL, NULL)
('Ahmad Farhan QF', 'farhan.hr6@sxcej.com', 'qazwsx', 5, 1, 2)
('Irfan Akmal Ardianto', 'irfan@sxcej.com', 'qweztx', 4, 1, NULL)
('Sharliz Mayalpen Zafirah', 'sharliz.hr7@sxcej.com', 'edcrfv', 6, 1, 2)# sxc-evaluation-system-next
# sxc-evaluation-system-next
