# Ledger — Loan Tracker

> Track informal loans, weekly or monthly repayments, and true profit per borrower — in one clean dashboard.

A full-stack rewrite of the original `LoanAppUI` prototype (which stored everything in
`localStorage`). This version has a real backend, a real database, real auth, and
server-side business logic for loan repayment and profit tracking.

**Live demo →** _add your deployed URL here_
**Demo login →** `demo@demo.com` / `demo1234` (after running the seed script)

**Stack:** React (Vite) + Tailwind CSS · Express.js · MongoDB (Mongoose) · JWT auth

## Features

- Email/password signup and login with hashed passwords and JWT sessions
- Create loans with weekly (26-payment) or monthly (12-payment) repayment schedules
- Record payments with automatic remaining-balance, missed-payment, and next-due-date tracking
- Effective interest-earned calculation once a loan is fully repaid
- **Loan restart**: if a borrower crosses the full loan term without repaying, the lender
  can restart the loan — the unpaid balance is deducted from the next disbursal, and the
  repayment target resets to a fresh full term
- **Profit page**: realized and projected profit per borrower, aggregated across every
  loan cycle (including restarts), with profit % on cash actually disbursed
- Server-side search by borrower name, scoped per logged-in user
- Loading, empty, error, and success states throughout — no blank screens
- Toast notifications for every mutation, with confirm-before-delete and confirm-before-restart
- Responsive, keyboard-accessible UI built on a small design-token system

## Project structure

```
loan-app/
├── backend/          # Express API + MongoDB models
│   ├── config/        # DB connection
│   ├── controllers/    # Route handlers (business logic)
│   ├── middleware/     # auth, error handling, rate limiting
│   ├── models/          # Mongoose schemas (User, Loan)
│   ├── routes/           # Express routers
│   ├── utils/              # helpers (loan math, JWT, seed script)
│   ├── app.js
│   └── server.js
└── frontend/         # React + Vite + Tailwind SPA
    └── src/
        ├── api/          # fetch client + endpoint wrappers
        ├── components/    # LoanCalculator, LoanList, LoanStatus, etc.
        ├── context/        # Auth + Toast providers
        ├── hooks/           # useLoanManagement, useProfitSummary
        ├── pages/            # Login, Register, Dashboard, Profit, NotFound
        └── utils/             # loanTerm (restart-eligibility helpers)
```

## Quick start

### 1. Database

Use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or run MongoDB locally.
Either way you just need a connection string.

### 2. Backend

```bash
cd backend
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm install
npm run dev                # http://localhost:5000
```

Optional: seed a demo account with a couple of sample loans:

```bash
npm run seed
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL=/api works out of the box with the dev proxy
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so both can run
side by side with no CORS setup needed locally.

### Demo login

If you ran `npm run seed` in the backend:

```
demo@demo.com / demo1234
```

## Environment variables

Both apps ship a `.env.example` — copy it to `.env` and fill in real values. Never commit
the actual `.env` file (it's already in `.gitignore`).

**backend/.env**

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `PORT` | API port (default `5000`) |
| `CLIENT_ORIGIN` | Comma-separated allowed CORS origins |

**frontend/.env**

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL for API calls (`/api` uses the dev proxy) |

## API overview

All `/api/loans` routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account, returns a token |
| POST | `/api/auth/login` | Log in, returns a token |
| GET | `/api/auth/me` | Current user (auth required) |
| GET | `/api/loans?search=&page=&limit=` | List the current user's loans, optional name search |
| GET | `/api/loans/profit` | Realized/projected profit summary, per borrower and total |
| GET | `/api/loans/:id` | Get a single loan |
| POST | `/api/loans` | Create a loan |
| POST | `/api/loans/:id/payments` | Record a payment against a loan |
| POST | `/api/loans/:id/restart` | Restart a loan whose term has ended with an unpaid balance |
| DELETE | `/api/loans/:id` | Delete a loan |

## Deployment

- **Backend** → Render, Railway, or any Node host. Set the env vars above.
- **Frontend** → Vercel or Netlify. Set `VITE_API_URL` to your deployed API's origin
  (e.g. `https://your-api.onrender.com/api`) and update `CLIENT_ORIGIN` on the backend
  to match your deployed frontend URL.

## Roadmap

- [x] Auth, CRUD, loan repayment tracking
- [x] Loan restart flow with disbursal shortfall math
- [x] Profit dashboard per borrower
- [ ] Password reset flow
- [ ] Email verification
- [ ] Automated tests + CI
- [ ] CSV export

## License

MIT — see [LICENSE](./LICENSE).

---

Built as part of the Digital Heroes Full Stack Developer trial task.
