# Modern SaaS Billing & Sales Management System

This is a complete, production-ready full-stack web application built exactly as requested. It includes a robust Node.js/Express backend API connected to PostgreSQL, and a modern, Gen-Z styled SaaS React frontend using Vite and TailwindCSS.

## Project Structure

\`\`\`text
billing-system/
├── backend/
│   ├── config/
│   │   └── db.js            # DB connection pool
│   ├── controllers/         # Logic for auth, products, sales, customers
│   ├── middleware/          # JWT Auth Middleware
│   ├── routes/              # Express API Routes
│   ├── .env.example         # Environment template
│   ├── package.json         # Backend dependencies
│   ├── schema.sql           # Database tables structure
│   └── server.js            # Main Express entrypoint
├── frontend/
│   ├── src/                 # React source (components, pages, logic)
│   ├── index.html           # Main HTML shell
│   ├── package.json         # Frontend dependencies
│   ├── postcss.config.js    # Tailwind PostCSS
│   ├── tailwind.config.js   # UI branding
│   └── vite.config.js       # Vite app and API proxy
\`\`\`

## Step-by-Step Setup Instructions

### 1. Database Setup

Ensure you have **PostgreSQL** installed and running on your system.

Option 1: Using psql command line:
\`\`\`bash
# Create a database named billing_db
psql -U postgres -c "CREATE DATABASE billing_db;"

# Import the schema to create tables
psql -U postgres -d billing_db -f "d:\pics\anti\billing-system\backend\schema.sql"
\`\`\`

*(Optionally, you can use pgAdmin/DBeaver to create the \`billing_db\` database and copy-paste the contents of \`backend/schema.sql\` to execute the table creation queries.)*

### 2. Backend Setup

Open a terminal and navigate to the backend directory:

\`\`\`powershell
cd d:\pics\anti\billing-system\backend
npm install
\`\`\`

Create a `.env` file (you can copy `.env.example`):
\`\`\`powershell
Copy-Item .env.example .env
\`\`\`
*(Make sure the \`DATABASE_URL\` inside the \`.env\` matches your local postgres credentials. Standard is \`postgres://postgres:password@localhost:5432/billing_db\`)*

**Start the Backend:**
\`\`\`powershell
npm run dev
\`\`\`
*(Runs on \`http://localhost:5000\`)*

### 3. Frontend Setup

Open **a new/second terminal**, navigate to the frontend directory:

\`\`\`powershell
cd d:\pics\anti\billing-system\frontend
npm install
\`\`\`

**Start the Frontend:**
\`\`\`powershell
npm run dev
\`\`\`
*(Runs on \`http://localhost:3000\`)*

## Final Commands Summary

To get up and running quickly on localhost with the backend running on \`:5000\` and the frontend running dynamically on \`:3000\`, keep your backend process running and launch the frontend:

Open your browser to: \`http://localhost:3000\`
Register a new admin account to access the dashboard!
