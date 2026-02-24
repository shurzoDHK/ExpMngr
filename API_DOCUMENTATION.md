# API Documentation Template

## Overview

This document provides a template for documenting the Finance Expense Manager API endpoints.

## Base URL

- Development: `http://localhost:8000/api/v1`
- Production: `https://api.example.com/api/v1`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Getting a Token

**POST** `/auth/login`

Request body:
```json
{
  "username": "user@example.com",
  "password": "yourpassword"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## Error Responses

All endpoints follow a consistent error format:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity (validation error)
- `500` - Internal Server Error

## Pagination

List endpoints support pagination via query parameters:

- `skip` - Number of records to skip (default: 0)
- `limit` - Maximum number of records to return (default: 100)

Example:
```
GET /expenses?skip=0&limit=20
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

#### POST /auth/login
Authenticate and receive access token.

**Request Body (form-data):**
- `username`: Email address
- `password`: User password

**Response:** `200 OK`
```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

#### POST /auth/admin/login
Admin login endpoint.

#### GET /auth/me
Get current authenticated user.

---

### Accounts

#### GET /accounts
List all accounts for the authenticated user.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Main Bank Account",
    "type": "BANK",
    "balance": 5000.00,
    "credit_limit": null,
    "institution": "Bank of Example",
    "account_number": "****1234",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

#### POST /accounts
Create a new account.

**Request Body:**
```json
{
  "name": "Main Bank Account",
  "type": "BANK",
  "balance": 5000.00,
  "institution": "Bank of Example",
  "account_number": "1234567890"
}
```

#### GET /accounts/{id}
Get a specific account.

#### PUT /accounts/{id}
Update an account.

#### DELETE /accounts/{id}
Delete an account.

---

### Categories

#### GET /categories
List all categories.

#### POST /categories
Create a category.

**Request Body:**
```json
{
  "name": "Food & Dining",
  "description": "Restaurants and groceries",
  "color": "#FF5733",
  "icon": "utensils"
}
```

#### PUT /categories/{id}
Update a category.

#### DELETE /categories/{id}
Delete a category.

---

### Expenses

#### GET /expenses
List expenses with optional filters.

**Query Parameters:**
- `start_date` - Filter by start date (YYYY-MM-DD)
- `end_date` - Filter by end date (YYYY-MM-DD)
- `category_id` - Filter by category
- `account_id` - Filter by account
- `skip` - Pagination offset
- `limit` - Pagination limit

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "amount": 50.00,
    "description": "Grocery shopping",
    "date": "2024-01-15",
    "is_recurring": false,
    "category": {
      "id": 1,
      "name": "Food & Dining",
      "color": "#FF5733"
    },
    "account": {
      "id": 1,
      "name": "Main Account"
    },
    "created_at": "2024-01-15T10:00:00"
  }
]
```

#### POST /expenses
Create an expense.

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Grocery shopping",
  "date": "2024-01-15",
  "account_id": 1,
  "category_id": 1,
  "is_recurring": false
}
```

---

### Loans

#### GET /loans
List all loans.

#### POST /loans
Create a loan with automatic amortization calculation.

**Request Body:**
```json
{
  "name": "Home Loan",
  "principal_amount": 500000.00,
  "interest_rate": 7.5,
  "term_months": 240,
  "start_date": "2024-01-01T00:00:00"
}
```

#### GET /loans/{id}/amortization
Get the amortization schedule for a loan.

---

### Subscriptions

#### GET /subscriptions
List all subscriptions.

#### POST /subscriptions
Create a subscription with automatic reminders.

**Request Body:**
```json
{
  "name": "Netflix",
  "amount": 15.99,
  "frequency": "MONTHLY",
  "start_date": "2024-01-01T00:00:00",
  "description": "Streaming service"
}
```

---

### Reports

#### GET /reports/calendar
Get calendar-wise expense report.

**Query Parameters:**
- `year` - Year (required)
- `month` - Month (required)

#### GET /reports/summary
Get summary statistics.

**Response:** `200 OK`
```json
{
  "total_balance": 10000.00,
  "total_expenses": 2500.00,
  "total_debt": 50000.00,
  "monthly_subscriptions": 100.00
}
```

#### GET /reports/by-category
Get expense breakdown by category.

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Anonymous endpoints: 100 requests/minute
- Authenticated endpoints: 300 requests/minute

## Versioning

The API uses URL-based versioning (e.g., `/api/v1/`). Breaking changes will result in a new version.

## OpenAPI Specification

Full API specification is available at:
- Swagger UI: `/api/docs`
- ReDoc: `/api/redoc`
- OpenAPI JSON: `/api/openapi.json`
