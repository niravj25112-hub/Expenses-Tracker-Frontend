# Spend Wise Expense Tracker

## Project Overview

Spend Wise is a full-stack expense tracker web application built with HTML, CSS, JavaScript, Flask, and Supabase. Users can create an account, sign in with email/password or Google, set a monthly budget, add expenses, and view their expense history.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python Flask
- Authentication: Supabase Auth and Google OAuth
- Database: Supabase PostgreSQL
- API Integration: JavaScript `fetch()` with Flask REST APIs

## Features

- Separate login and signup UI
- Google authentication
- Protected dashboard after login
- Monthly budget tracking
- Add expense with validation
- Expense history table
- Search and category filter
- User-specific budget and expense data
- Supabase row-level security policies
- Responsive desktop and mobile design

## Backend APIs

- `POST /api/signup` - create a new user
- `POST /api/login` - login with email and password
- `GET /api/expenses` - get logged-in user's expenses
- `POST /api/expenses` - add an expense
- `DELETE /api/expenses/<id>` - delete an expense
- `GET /api/budget` - get latest budget
- `POST /api/budget` - save a budget

## Deployment Setup

### 1. Deploy Backend

Deploy the Flask backend on Render, Railway, or any Python hosting platform.

Production start command:

```bash
gunicorn app:app
```

Add these environment variables in the hosting platform settings:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Example deployed backend URL:

```txt
https://your-backend-name.onrender.com
```

### 2. Connect Frontend To Deployed Backend

In `script.js`, replace the local API URL with your deployed backend URL:

```js
const API = "https://your-backend-name.onrender.com/api";
```

### 3. Deploy Frontend

Deploy the frontend on Netlify, Vercel, or GitHub Pages.

Example deployed frontend URL:

```txt
https://your-frontend-name.netlify.app
```

### 4. Update Supabase Redirect URLs

In Supabase:

```txt
Authentication -> URL Configuration
Site URL: https://your-frontend-name.netlify.app
Redirect URLs: https://your-frontend-name.netlify.app
```

### 5. Update Google OAuth URLs

In Google Cloud Console:

```txt
Authorized JavaScript origins:
https://your-frontend-name.netlify.app

Authorized redirect URI:
https://zztdlspnbqjrunctjnky.supabase.co/auth/v1/callback
```

## Local Development Setup

Use this only when running the project on your own computer.

### Backend

```bash
cd Expenses-Tracker-Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Local backend URL:

```txt
http://127.0.0.1:5000
```

For local testing, `script.js` can use:

```js
const API = "http://127.0.0.1:5000/api";
```

Do not keep the local API URL when deploying the final frontend.

## Supabase Setup

Run `supabase-schema.sql` in the Supabase SQL Editor. It creates:

- `expenses` table
- `budgets` table
- Row-level security policies for logged-in users

For Google login, configure:

- Supabase Authentication provider: Google
- Supabase URL Configuration
- Google Cloud OAuth consent screen and credentials

## Important Notes

- `.env`, `venv/`, `__pycache__/`, and `.vscode/` should not be pushed.
- Supabase anon key can be used in frontend code.
- Supabase service role key should never be exposed in frontend code.