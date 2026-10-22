# Local verification checklist

Run from the repository root with Node.js 20:

```bash
npm ci
node --check server.js
node --check db/init.js
node --check db/seed.js
npm run init-db
npm run seed
npm start
```

Visit `http://localhost:3000`; verify registration, login, skill browsing, swap requests, and ratings manually.

**Demo-only security:** Seed accounts use a shared, publicly documented password and must not be used in real deployments. The session secret has an insecure development fallback; production should use an environment-specific secret, HTTPS cookies, CSRF protection, login rate limits and persistent session storage.

SQLite data is local. Resetting demo data removes previously seeded content. The GitHub workflow checks syntax and that SQLite initialization works; it is not a browser end-to-end or security test.

**Coursework note:** If this repository was submitted for an assessed assignment and post-submission changes are prohibited, do not merge a portfolio-refinement pull request without confirming the rules.
