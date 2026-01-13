# Finance Expense Manager

A comprehensive finance expense management application with separate User and Admin panels.

## Features

- 🔐 **User & Admin Authentication** - Separate login panels with JWT authentication
- 💳 **Account Management** - Bank accounts, Mobile finance accounts, and Credit Cards
- 💰 **Loan Management** - With loan amortization calculator
- 📅 **Subscription Tracker** - Weekly/Monthly/Yearly reminder functionality
- 📊 **Category-wise Expenses** - Organize expenses by custom categories
- 📆 **Calendar Reports** - Filter by date, category, accounts & cards
- 🎨 **Modern UI** - Minimal and responsive dashboard design

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts for visualizations

## Project Structure

```
├── backend/          # Backend API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

3. Start the backend server:
```bash
npm run dev
```

4. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

5. Start the frontend dev server:
```bash
npm run dev
```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Expenses
- `GET /api/expenses` - Get expenses with filters
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Create loan with amortization
- `GET /api/loans/:id/amortization` - Get amortization schedule

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Reports
- `GET /api/reports/calendar` - Get calendar-wise reports
- `GET /api/reports/summary` - Get summary statistics

## License

GPL-2.0 License - see LICENSE file for details
