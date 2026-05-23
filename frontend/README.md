# Frontend — BillingSaaS

This folder contains the React frontend built with Vite and Tailwind CSS.

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

```bash
cd frontend
npm install
```

## Development

Start Vite dev server:

```bash
npm run dev
# Open http://localhost:3000
```

## Build

Build optimized production assets:

```bash
npm run build
```

Serve the `dist/` folder using a static server or integrate with the backend.

## Environment

- Use a `.env` file for any runtime configuration. Example variables:

- `VITE_API_BASE_URL` — API base URL for the backend (e.g., `http://localhost:5000/api`)

## Notes

- The UI uses the Inter font and a consistent design system (primary: `#2563EB`, background: `#F8FAFC`).
- Components (Card, Button, Input, Table) are in `src/components/` for reuse.

## Deployment suggestions

- Deploy to Netlify, Vercel, or static hosting; or serve assets from the backend under `/static`.
