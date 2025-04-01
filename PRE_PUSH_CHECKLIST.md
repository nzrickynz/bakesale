# ✅ Bake Sale Pre-Push Safety Checklist

Use this before pushing to `main` so Vercel won’t break your site.

---

## 🔁 Code & Build

- [ ] I ran the production build locally:
  ```bash
  npm run build && npm start
  ```
- [ ] No errors during build or app load (tested homepage, dashboard, auth)

---

## 🔐 Environment Variables

- [ ] My `.env.local` file includes:

  ```env
  DATABASE_URL=...
  NEXTAUTH_SECRET=...
  NEXTAUTH_URL=http://localhost:3000
  RESEND_API_KEY=...
  ```

- [ ] Values **match what’s on Vercel**

---

## 🧬 Prisma / Database

- [ ] I ran this after making schema changes:
  ```bash
  npx prisma db push
  ```

- [ ] I ran this if I wanted to reset + reseed the DB:
  ```bash
  npm run db:reset
  ```

- [ ] I checked the Supabase console and confirmed tables/columns are present

---

## 🧪 UI & UX

- [ ] I checked visibility of all text and buttons (especially):
  - Sign in links
  - Form labels
  - Dashboard cards

- [ ] No `Event handlers cannot be passed to Server Component props` errors

---

## 🧹 Final Push Prep

- [ ] Committed and pushed from `main`
- [ ] Checked [Vercel dashboard](https://vercel.com/dashboard) for ✅ green deployment
- [ ] Did a live check at [https://bakesale.co.nz](https://bakesale.co.nz)

---

### ✅ You’re Safe to Push
