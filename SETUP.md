# Finance Expense Manager - Setup Guide

This guide will help you set up and run the Finance Expense Manager application.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Database

Generate Prisma client:
```bash
npx prisma generate
```

Create and run database migrations:
```bash
npx prisma migrate dev --name init
```

Seed the database with sample data:
```bash
npm run prisma:seed
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Start Backend Server

From the `backend` directory:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3000`

### Start Frontend Development Server

From the `frontend` directory (in a new terminal):
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Default Login Credentials

After seeding the database, you can use these credentials:

### Admin Access
- **Email:** admin@financeapp.com
- **Password:** admin123
- **URL:** http://localhost:5173/admin/login

### User Access
- **Email:** user@example.com
- **Password:** user123
- **URL:** http://localhost:5173/login

## Features Overview

### User Panel
1. **Dashboard** - Overview of finances with charts and statistics
2. **Accounts** - Manage bank accounts, mobile finance, and credit cards
3. **Expenses** - Track and categorize expenses
4. **Loans** - Manage loans with automatic amortization schedules
5. **Subscriptions** - Track recurring payments with reminders
6. **Reports** - Analyze spending with calendar and category views

### Admin Panel
1. **Dashboard** - System statistics and user overview
2. **User Management** - View and manage all users

## API Documentation

The backend API runs on port 3000. Key endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/accounts` - Get user accounts
- `GET /api/expenses` - Get expenses
- `GET /api/loans` - Get loans
- `GET /api/subscriptions` - Get subscriptions
- `GET /api/reports/summary` - Get financial summary
- `GET /api/reports/calendar` - Get calendar report

## Database Management

### View Database with Prisma Studio
```bash
cd backend
npx prisma studio
```

### Reset Database
```bash
cd backend
npx prisma migrate reset
```

### Create New Migration
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

## Production Build

### Build Backend
```bash
cd backend
npm run build
npm start
```

### Build Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### Port Already in Use
If port 3000 or 5173 is already in use, you can change them:
- Backend: Edit `backend/.env` and change `PORT=3000`
- Frontend: Edit `frontend/vite.config.ts` and change server port

### Database Issues
If you encounter database issues, try:
```bash
cd backend
rm -f prisma/dev.db
npx prisma migrate reset
npm run prisma:seed
```

### Module Not Found
Make sure all dependencies are installed:
```bash
cd backend && npm install
cd ../frontend && npm install
```

## Additional Features

### Loan Amortization
When creating a loan, the system automatically generates a complete amortization schedule showing:
- Monthly payment breakdown (principal vs interest)
- Remaining balance after each payment
- Total interest paid over the loan term

### Subscription Reminders
The system automatically creates reminders 3 days before each subscription payment. A cron job runs daily at 9:00 AM to check and process reminders.

### Real-time Balance Updates
When expenses are added or deleted, account balances are automatically updated in real-time.

## Support

For issues or questions, please check:
1. Make sure all dependencies are installed
2. Verify database migrations have run
3. Check that both backend and frontend are running
4. Review console logs for error messages
