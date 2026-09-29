# Ishaqzada independent store — continuation guide

Owner: nk6341350@gmail.com; GitHub: nk6341350-cloud.
Prepared: 2026-09-28. Configured with the owner's ishaqzada-store Supabase project. Public hosting deployment is still pending.

## Requirements that must survive future chats
- Pashto first; Dari and English selector; luxury navy/gold/white catalog; retain current 20 category images and ordering.
- Customer selects a product and copies its direct link or shares it through WhatsApp.
- ONLY the owner adds, edits, deletes products and uploads photos.
- No ChatGPT login, ChatGPT hosting, OpenAI API key, Sites D1/R2, or Cloudflare Worker dependency.
- Keep source, hosting, Supabase project and recovery methods under the owner's personal accounts.
- Do not modify the older delivery app or online-services home page.
- No card or paid plan has been activated. Free providers have quotas and may pause or change terms; never promise permanent free availability.

## Package contents
- `deploy/`: ready-built static files. Edit `deploy/config.js` with a PUBLIC Supabase URL and publishable/anon key, then upload the CONTENTS to a static host such as Cloudflare Pages Direct Upload owned by the user. No Worker is used.
- `source/`: editable React/Vite source. `npm install`, `npm run build` creates `dist/`. Set `public/config.js` before building. Commit this entire source directory to a repository owned by the user. No Sites manifest belongs here.
- `source/setup.sql`: one-time database/storage setup for a fresh Supabase project. Does not migrate old products.
- `source/README-PS.md`: owner setup steps.

## Auth and permissions
Create/confirm the owner's email/password user using Supabase Authentication > Users. Do not send the password to a chat. Disable public signups in the project. Run setup.sql AFTER creating the owner. SQL looks up the confirmed owner's UUID and inserts it in store_admins. Only the project owner using the SQL editor can grant admin. RLS protects writes even when the browser UI is bypassed.
Customers are anonymous read-only users; admin uses `?admin=1`. The browser stores a short-lived auth session plus refresh token in sessionStorage, with refresh before expiry. Passwords are not embedded in files. No service_role or secret keys may be placed in the website.

## Durable records
Supabase PostgreSQL: store_products and store_admins. Supabase Storage: store-images (public product photos). No products are stored only in the browser. New UUID product links retain identity across edits. Use the same website address when moving providers, or redirect the old one, to preserve customer links.

## Backup and recovery
Regularly export store_products and download the store-images bucket to a separate place controlled by the owner. The code ZIP does NOT contain future products or photos uploaded after deployment. Retain provider account access and recovery methods. Anyone editing in a new chat needs the source/repository and current schema/config; a new chat does not automatically remember this one or obtain account access.

## Validation performed and remaining
Static production build passed. Category assets included. Authentication, refresh, database reads/writes and storage paths implemented against Supabase HTTP APIs; RLS schema separates public reads from owner-only writes. No live Supabase project was configured, so SQL execution, live auth, RLS authorization and a complete upload/share flow MUST be checked on the owner's project before claiming the store is ready for customers. No previous products were recovered or imported. The previous chatgpt.site preview remains separate and unchanged.

## Next steps
1. Identify a Supabase project under the owner's personal account; verify its status. Do not reuse the inaccessible previous project blindly.
2. Create the confirmed admin user, run setup.sql once on a fresh project, supply public config.
3. Validate anonymous reads; anonymous/non-admin writes denied; admin add/edit/delete succeeds; photo uploads work; product links work on another device.
4. Deploy static folder in the owner's Cloudflare Pages account; keep source in their GitHub repository. Verify public catalog and independent admin login.

Official references:
https://supabase.com/docs/guides/auth
https://supabase.com/docs/guides/database/postgres/row-level-security
https://supabase.com/docs/guides/storage/uploads/standard-uploads
https://developers.cloudflare.com/pages/platform/limits/

## Verified progress — 2026-09-28 UTC
- Supabase project: ishaqzada-store, ref ksmkwivbhrmndzfuuzez, organization Ishaqzada Delivery (Free). Do not modify ishaqzada-delivery.
- Public API URL and publishable key are configured in source/public/config.js and deploy/config.js.
- Anonymous store_products SELECT returned HTTP 200 and an empty array (no products yet).
- Anonymous store_products INSERT (empty request) and store_admins SELECT were rejected with HTTP 401 / permission denied.
- Dashboard store_admins contains owner UUID cc7719f9-c4af-4fb2-9e10-f8332e5ac079.
- Public signups disabled; API confirms disable_signup=true. Email login remains enabled.
- Production build passed after configuration.
- Owner password login, upload and edit/delete flows still require end-to-end validation; no customer-ready claim yet.
- Cloudflare dashboard blocked the agent browser with a persistent bot verification screen. No Cloudflare deployment or paid service was created.
- Next: upload deploy contents to owner-controlled static hosting, verify admin and public sharing flow. Keep source ZIP in GitHub for future maintenance.
