# Developer Guide - Finance Expense Manager

This guide provides technical details for developers working on this project.

## Architecture Overview

### Backend Architecture
```
├── Express.js Server (Port 3000)
├── Prisma ORM (Database Layer)
├── JWT Authentication Middleware
├── RESTful API Design
└── Cron Job Service (Reminders)
```

### Frontend Architecture
```
├── React 18 (Component-Based)
├── React Router (Client-Side Routing)
├── Context API (State Management)
├── Axios (HTTP Client)
└── Tailwind CSS (Styling)
```

## Development Workflow

### 1. Backend Development

#### Adding a New Model
```typescript
// 1. Update prisma/schema.prisma
model NewModel {
  id        String   @id @default(uuid())
  name      String
  userId    String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

// 2. Run migration
npx prisma migrate dev --name add_new_model

// 3. Generate Prisma Client
npx prisma generate
```

#### Adding a New API Endpoint
```typescript
// 1. Create controller (src/controllers/newmodel.controller.ts)
export const getNewModels = async (req: AuthRequest, res: Response) => {
  // Implementation
};

// 2. Create route (src/routes/newmodel.routes.ts)
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getNewModels } from '../controllers/newmodel.controller';

const router = Router();
router.use(authenticate);
router.get('/', getNewModels);
export default router;

// 3. Register route in src/index.ts
import newModelRoutes from './routes/newmodel.routes';
app.use('/api/newmodels', newModelRoutes);
```

### 2. Frontend Development

#### Adding a New Page
```typescript
// 1. Create page component (src/pages/NewPage.tsx)
import Layout from '../components/Layout';

const NewPage = () => {
  return (
    <Layout>
      <div>New Page Content</div>
    </Layout>
  );
};

export default NewPage;

// 2. Add route in src/App.tsx
<Route
  path="/new-page"
  element={
    <PrivateRoute>
      <NewPage />
    </PrivateRoute>
  }
/>

// 3. Add navigation in src/components/Layout.tsx
const navItems = [
  { path: '/new-page', icon: IconName, label: 'New Page' },
];
```

#### Making API Calls
```typescript
// Use the pre-configured axios instance
import api from '../services/api';

// GET request
const response = await api.get('/endpoint');

// POST request
const response = await api.post('/endpoint', data);

// PUT request
const response = await api.put('/endpoint/:id', data);

// DELETE request
await api.delete('/endpoint/:id');
```

## Database Schema Details

### User Model
- Stores user credentials and profile
- Role field: "USER" or "ADMIN"
- Relations: accounts, expenses, loans, subscriptions, categories

### Account Model
- Type field: "BANK", "MOBILE_FINANCE", or "CREDIT_CARD"
- Balance automatically updates with expenses

### Expense Model
- Links to Account and Category
- Date field for calendar views
- Triggers balance updates on Account

### Loan Model
- Stores principal, interest rate, term
- Automatically generates amortization schedule
- Status: "ACTIVE", "PAID_OFF", or "DEFAULTED"

### Subscription Model
- Frequency: "WEEKLY", "MONTHLY", or "YEARLY"
- Automatically creates reminders 3 days before payment
- Next payment date calculated automatically

## Authentication Flow

```
1. User submits credentials → POST /api/auth/login
2. Backend validates credentials
3. Backend generates JWT token
4. Frontend stores token in localStorage
5. Frontend adds token to all API requests (Authorization: Bearer <token>)
6. Backend middleware verifies token on protected routes
7. Request proceeds with user context (req.user)
```

## Styling Guidelines

### Tailwind CSS Classes
```jsx
// Card container
<div className="card">

// Button variants
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-danger">Danger</button>

// Input field
<input className="input" />

// Label
<label className="label">Label Text</label>
```

### Color Palette
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Danger: Red (#EF4444)
- Warning: Orange (#F59E0B)
- Info: Purple (#8B5CF6)

## Error Handling

### Backend
```typescript
try {
  // Operation
  res.json(result);
} catch (error) {
  console.error('Operation error:', error);
  res.status(500).json({ error: 'Failed to perform operation' });
}
```

### Frontend
```typescript
try {
  await api.post('/endpoint', data);
  toast.success('Success message');
} catch (error: any) {
  toast.error(error.response?.data?.error || 'Operation failed');
}
```

## Testing

### Backend Testing
```bash
# Start backend
npm run dev

# Test with curl
curl http://localhost:3000/api/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
```

### Frontend Testing
```bash
# Start frontend
npm run dev

# Access at http://localhost:5173
# Login with test credentials
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=development
```

### Production Considerations
- Change DATABASE_URL to PostgreSQL connection string
- Use strong JWT_SECRET (32+ characters, random)
- Set NODE_ENV=production
- Enable CORS with specific origins
- Add rate limiting
- Implement request logging

## Database Migrations

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

### Reset Database
```bash
npx prisma migrate reset
```

### Apply Migrations (Production)
```bash
npx prisma migrate deploy
```

## Code Organization

### Backend Structure
```
src/
├── controllers/    # Request handlers (business logic)
├── middleware/     # Authentication, validation
├── routes/         # API route definitions
├── services/       # External services (cron, email)
└── utils/          # Helper functions (jwt, prisma)
```

### Frontend Structure
```
src/
├── components/     # Reusable UI components
├── context/        # React contexts (state)
├── pages/          # Route components
├── services/       # API client, utilities
└── types/          # TypeScript definitions
```

## Performance Optimization

### Backend
- Database indexes on frequently queried fields
- Pagination for large datasets
- Use `select` to limit returned fields
- Aggregate queries for statistics

### Frontend
- Lazy load routes with React.lazy()
- Debounce search inputs
- Use React.memo for expensive components
- Optimize images

## Security Best Practices

1. **Never commit .env files** - Use .env.example instead
2. **Validate all inputs** - Backend and frontend
3. **Use parameterized queries** - Prisma handles this
4. **Hash passwords** - bcrypt with salt rounds ≥ 10
5. **Secure JWT tokens** - Strong secret, reasonable expiry
6. **Sanitize user inputs** - Prevent XSS attacks
7. **Use HTTPS** - In production
8. **Rate limiting** - Prevent abuse
9. **CORS configuration** - Whitelist specific origins

## Debugging Tips

### Backend Debugging
```typescript
// Add console.logs in controllers
console.log('Request body:', req.body);
console.log('User:', req.user);

// Use Prisma Studio to inspect data
npx prisma studio
```

### Frontend Debugging
```typescript
// Add console.logs
console.log('State:', state);

// Use React DevTools
// Check Network tab for API calls
// Check Console for errors
```

## Deployment

### Backend Deployment
1. Build: `npm run build`
2. Set environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Start: `npm start`

### Frontend Deployment
1. Build: `npm run build`
2. Deploy dist/ folder to static hosting
3. Configure environment variables
4. Set up redirects for SPA

## Common Issues

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

### Database locked
```bash
# Close all connections
# Delete database and recreate
rm prisma/dev.db
npx prisma migrate dev
```

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and test
3. Commit with clear messages
4. Push and create pull request
5. Wait for review

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
