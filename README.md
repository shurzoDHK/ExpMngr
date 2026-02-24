# Finance Expense Manager

A comprehensive full-stack finance expense management application with modern architecture and containerization.

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Robust relational database
- **Redis** - Caching and session management
- **SQLAlchemy** - Async ORM
- **Alembic** - Database migrations
- **JWT** - Authentication with python-jose

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy (production)
- **GitHub Actions** - CI/CD pipeline

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-manager
   ```

2. **Copy environment files**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs

### Local Development

#### Backend Setup

1. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

5. **Start the server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   └── v1/
│   │   │       └── endpoints/ # Route handlers
│   │   ├── core/              # Core utilities
│   │   │   ├── security.py    # JWT, password hashing
│   │   │   └── deps.py        # Dependencies
│   │   ├── db/                # Database models
│   │   │   ├── database.py    # DB connection
│   │   │   └── models.py      # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── main.py            # FastAPI app
│   │   └── config.py          # Settings
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Test files
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Backend Docker config
│   └── .env.example           # Environment template
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript types
│   │   └── context/           # React contexts
│   ├── public/                # Static files
│   ├── package.json           # NPM dependencies
│   ├── Dockerfile             # Production Docker
│   ├── Dockerfile.dev         # Development Docker
│   └── .env.example           # Environment template
├── nginx/                     # Nginx configuration
│   └── nginx.conf             # Reverse proxy config
├── docker-compose.yml         # Main compose file
├── docker-compose.dev.yml     # Development overrides
├── docker-compose.prod.yml    # Production overrides
├── package.json               # Root package.json
└── README.md                  # This file
```

## Available Scripts

### Root Level

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services with Docker |
| `npm run dev:build` | Build and start all services |
| `npm run dev:logs` | View logs from all services |
| `npm run dev:stop` | Stop all services |
| `npm run prod` | Start production stack |
| `npm run prod:build` | Build and start production |
| `npm run prod:stop` | Stop production stack |

### Backend

| Command | Description |
|---------|-------------|
| `uvicorn app.main:app --reload` | Start development server |
| `pytest` | Run tests |
| `pytest --cov=app` | Run tests with coverage |
| `alembic revision --autogenerate -m "message"` | Create migration |
| `alembic upgrade head` | Apply migrations |
| `black .` | Format code |
| `isort .` | Sort imports |
| `mypy app` | Type check |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript check |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/admin/login` | Admin login |
| GET | `/api/v1/auth/me` | Get current user |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts` | Get all accounts |
| POST | `/api/v1/accounts` | Create account |
| GET | `/api/v1/accounts/{id}` | Get account |
| PUT | `/api/v1/accounts/{id}` | Update account |
| DELETE | `/api/v1/accounts/{id}` | Delete account |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | Get all categories |
| POST | `/api/v1/categories` | Create category |
| PUT | `/api/v1/categories/{id}` | Update category |
| DELETE | `/api/v1/categories/{id}` | Delete category |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/expenses` | Get expenses (with filters) |
| POST | `/api/v1/expenses` | Create expense |
| GET | `/api/v1/expenses/{id}` | Get expense |
| PUT | `/api/v1/expenses/{id}` | Update expense |
| DELETE | `/api/v1/expenses/{id}` | Delete expense |

### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/loans` | Get all loans |
| POST | `/api/v1/loans` | Create loan |
| GET | `/api/v1/loans/{id}` | Get loan |
| GET | `/api/v1/loans/{id}/amortization` | Get amortization schedule |
| DELETE | `/api/v1/loans/{id}` | Delete loan |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/subscriptions` | Get all subscriptions |
| POST | `/api/v1/subscriptions` | Create subscription |
| GET | `/api/v1/subscriptions/{id}` | Get subscription |
| PUT | `/api/v1/subscriptions/{id}` | Update subscription |
| DELETE | `/api/v1/subscriptions/{id}` | Delete subscription |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/calendar` | Calendar-wise report |
| GET | `/api/v1/reports/summary` | Summary statistics |
| GET | `/api/v1/reports/by-category` | Category breakdown |

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | Required |
| `REDIS_URL` | Redis connection URL | Required |
| `SECRET_KEY` | JWT secret key | Required |
| `DEBUG` | Enable debug mode | `false` |
| `CORS_ORIGINS` | Allowed CORS origins | `[]` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry time | `30` |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | Required |
| `VITE_APP_NAME` | Application name | `Finance Expense Manager` |
| `VITE_ENV` | Environment | `development` |

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

## Testing

### Backend
```bash
cd backend
pytest                    # Run all tests
pytest --cov=app          # Run with coverage
pytest -v                 # Verbose output
pytest tests/test_api.py  # Run specific file
```

### Frontend
```bash
cd frontend
npm run lint              # Run ESLint
npm run type-check        # Type check
```

## Production Deployment

1. **Build and start production stack**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

3. **Configure SSL**
   - Place SSL certificates in `nginx/ssl/`
   - Update `nginx/nginx.conf` with SSL configuration

## Features

- User & Admin authentication with JWT
- Multi-account support (Bank, Mobile Finance, Credit Cards)
- Category-based expense tracking
- Loan management with amortization calculator
- Subscription tracking with reminders
- Calendar-wise expense reports
- Category-wise expense breakdown
- Real-time balance updates
- Modern responsive UI
- Full API documentation

## License

GPL-2.0 License - see [LICENSE](LICENSE) file for details.
