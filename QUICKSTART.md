# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Start the Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3000`

### 2. Start the Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### 3. Login and Explore

**User Login:**
- URL: http://localhost:5173/login
- Email: user@example.com
- Password: user123

**Admin Login:**
- URL: http://localhost:5173/admin/login
- Email: admin@financeapp.com
- Password: admin123

## 📋 What's Included

### User Features
✅ Dashboard with financial overview and charts
✅ Account management (Bank, Mobile Finance, Credit Cards)
✅ Expense tracking with categories
✅ Loan management with automatic amortization
✅ Subscription tracking with reminders
✅ Calendar and category-wise reports

### Admin Features
✅ System statistics dashboard
✅ User management (view and delete users)

### Technical Features
✅ JWT-based authentication
✅ Real-time balance updates
✅ Automatic loan amortization calculation
✅ Subscription reminder system (cron job)
✅ RESTful API design
✅ Responsive design with Tailwind CSS

## 🗄️ Database

The database is already set up with:
- 1 Admin user
- 1 Test user
- 6 Default expense categories
- 3 Sample accounts for the test user

View database in GUI:
```bash
cd backend
npx prisma studio
```

## 🔧 Common Commands

### Backend
```bash
cd backend
npm run dev              # Start dev server
npm run build            # Build for production
npm run prisma:seed      # Reseed database
npx prisma studio        # Open database GUI
```

### Frontend
```bash
cd frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

## 📊 API Endpoints

Base URL: `http://localhost:3000/api`

### Authentication
- POST `/auth/register` - Register new user
- POST `/auth/login` - User login
- POST `/auth/admin/login` - Admin login

### Resources
- `/accounts` - Account CRUD
- `/expenses` - Expense CRUD
- `/loans` - Loan CRUD with amortization
- `/subscriptions` - Subscription CRUD
- `/categories` - Category CRUD
- `/reports/summary` - Financial summary
- `/reports/calendar` - Calendar report
- `/users` - User management (admin only)

## 🆘 Troubleshooting

**Backend won't start:**
- Make sure you're in the `backend` directory
- Check that port 3000 is available
- Verify `.env` file exists

**Frontend won't start:**
- Make sure you're in the `frontend` directory
- Check that port 5173 is available
- Clear cache: `rm -rf node_modules .vite && npm install`

**Database issues:**
```bash
cd backend
rm -f prisma/dev.db
npx prisma migrate dev --name init
```

## 📖 Full Documentation

For detailed setup instructions, see [SETUP.md](./SETUP.md)
For feature documentation, see [README.md](./README.md)

## 🎯 Next Steps

1. Create new categories for your expenses
2. Add your own bank accounts
3. Start tracking expenses
4. Set up recurring subscriptions
5. Add loans to track payments
6. View reports to analyze spending

Enjoy managing your finances! 💰
