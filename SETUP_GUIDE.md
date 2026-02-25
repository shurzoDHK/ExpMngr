# Setup Guide

This guide provides detailed instructions for setting up the Finance Expense Manager application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker](#quick-start-with-docker)
3. [Manual Setup](#manual-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required
- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Git** for cloning the repository

### Optional (for local development)
- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 16+ (if not using Docker)
- **Redis** 7+ (if not using Docker)

## Quick Start with Docker

### 1. Clone the Repository

```bash
git clone <repository-url>
cd finance-manager
```

### 2. Configure Environment

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

### 3. Generate Secret Key

```bash
# Generate a secure secret key for JWT
openssl rand -hex 32
```

Update `backend/.env` with the generated key:
```
SECRET_KEY=your-generated-secret-key-here
```

### 4. Start Services

```bash
# Start all services in detached mode
docker-compose up -d

# Or build and start
docker-compose up --build -d
```

### 5. Verify Services

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **pgAdmin** (optional): Configure in docker-compose

## Manual Setup

### Backend Setup

1. **Create Python Virtual Environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   # or
   .\venv\Scripts\activate  # Windows
   ```

2. **Install Dependencies**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set Up Database**
   ```bash
   # Create PostgreSQL database
   createdb finance_db
   
   # Run migrations
   alembic upgrade head
   ```

5. **Start Development Server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Environment Configuration

### Backend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql+asyncpg://user:pass@host:5432/db` |
| `REDIS_URL` | No | Redis connection string | `redis://localhost:6379/0` |
| `SECRET_KEY` | Yes | JWT signing key | Use `openssl rand -hex 32` |
| `DEBUG` | No | Enable debug mode | `true` or `false` |
| `CORS_ORIGINS` | No | Allowed CORS origins | `["http://localhost:5173"]` |

### Frontend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API URL | `http://localhost:8000/api/v1` |
| `VITE_APP_NAME` | No | Application name | `Finance Manager` |

## Database Setup

### Using Docker (Recommended)

The database is automatically created and configured when using Docker Compose.

### Manual Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE finance_db;
   CREATE USER finance_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE finance_db TO finance_user;
   ```

2. **Run Migrations**
   ```bash
   cd backend
   alembic upgrade head
   ```

3. **Seed Data (Optional)**
   ```bash
   python scripts/seed_db.py
   ```

## Running the Application

### Development Mode

```bash
# Start all services
docker-compose up -d

# Or individually
docker-compose up -d db redis backend frontend
```

### Production Mode

```bash
# Build and start production stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend alembic upgrade head
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Port 5432 is already in use`

**Solution**: Either stop the conflicting service or change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use different host port
```

#### 2. Database Connection Error

**Error**: `Could not connect to database`

**Solution**:
1. Check if database container is running: `docker-compose ps`
2. Verify connection string in `.env`
3. Check database logs: `docker-compose logs db`

#### 3. Permission Denied

**Error**: `Permission denied` when running scripts

**Solution**:
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

#### 4. Module Not Found

**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**:
1. Ensure you're in the `backend` directory
2. Verify virtual environment is activated
3. Reinstall dependencies: `pip install -r requirements.txt`

#### 5. Docker Compose Version

**Error**: `Version in "./docker-compose.yml" is unsupported`

**Solution**: Update Docker Compose to version 2.0+
```bash
# Check version
docker-compose --version

# Update on Linux
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute command in container
docker-compose exec backend /bin/bash
```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v --remove-orphans

# Remove images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## Next Steps

After setup:

1. Create a user account via the registration page
2. Set up your accounts (bank, credit cards, etc.)
3. Create expense categories
4. Start tracking your expenses!
