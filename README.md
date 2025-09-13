# Multi-tenant Notes (Prisma + Postgres + Next.js App Router)

Multi-tenant approach: shared schema with tenantId on users and notes. All requests require a JWT carrying tenantId; server-side enforcement ensures tenant isolation.

Local:
1. cp .env.example .env and set DATABASE_URL and JWT_SECRET
2. npm install
3. npx prisma generate
4. npx prisma migrate dev --name init
5. npm run seed
6. npm run dev

Predefined accounts (password: password):
- admin@acme.test (Admin, tenant: Acme)
- user@acme.test (Member, tenant: Acme)
- admin@globex.test (Admin, tenant: Globex)
- user@globex.test (Member, tenant: Globex)
