# Repository Guidelines

- Project stack: Next.js, React, Tailwind CSS, Prisma or direct SQL access to Neon, Clerk for auth, Inngest for serverless jobs, Stripe for billing, Gemini API for AI content.
- Use TypeScript for both frontend and backend code.
- Prefer module boundaries: `app` directory for routes, `components` for shared UI, `lib` for utilities, `server` for backend logic.
- Environment variables are managed via `.env.local`. Do not commit secrets.
- Testing: prioritize unit tests with Jest or Vitest and integration tests where possible.
- Deployment target: Vercel with Neon database.
- Follow Tailwind CSS utility-first patterns; extract reusable components when duplication occurs.
- Ensure all async operations include proper error handling and logging.
