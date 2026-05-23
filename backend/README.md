# Backend — BillingSaaS

This folder contains the API server for BillingSaaS built with Node.js and Express.

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure environment

Create a `.env` file in `backend/` or set environment variables. Typical values:

- `PORT=5000`
- `DATABASE_URL=sqlite:./data/db.sqlite` (or Postgres connection string)
- `JWT_SECRET=your_long_secret`

3. Initialize database (if applicable)

```bash
node init-db.js
# or run project-specific migration scripts
```

## Run

- Development (with nodemon)

```bash
npm run dev
```

- Production

```bash
npm start
```

## API

The server exposes REST endpoints under `/api/` (e.g., `/api/products`, `/api/invoices`, `/api/customers`). Use your browser or tools like `curl` / Postman. Read the controllers in `controllers/` for detailed routes and payloads.

## Logging & Errors

- Errors are printed to console. For production, integrate a logging solution (Winston, Bunyan) and configure proper error reporting.

## Secrets & Security

- Keep `JWT_SECRET` and any DB credentials out of source control.
- Use HTTPS and secure headers in production.

## Tests

No unit tests included. Adding tests for critical endpoints is recommended.

## Deployment

- Deploy the backend to any Node.js-capable host (Heroku, AWS, DigitalOcean).
- Use environment variables for production secrets and database connections.
