# 💰 Expense Tracker — Expense Tracker with Budget Alerts

> A full-stack three-tier CRUD application built with **React.js**, **FastAPI**, and **MongoDB**.
> Built as part of the Virtualan Software technical assessment (September 2026).

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│  PRESENTATION LAYER  (React + Vite, port 5173)       │
│  pages/ components/ services/ hooks/ context/         │
└──────────────────┬───────────────────────────────────┘
                   │  HTTP / Axios
┌──────────────────▼───────────────────────────────────┐
│  BUSINESS LOGIC LAYER  (FastAPI, port 8000)          │
│  routes/ controllers/ services/ models/ utils/        │
└──────────────────┬───────────────────────────────────┘
                   │  Motor (async MongoDB driver)
┌──────────────────▼───────────────────────────────────┐
│  DATA LAYER  (MongoDB, port 27017)                   │
│  collections: categories, expenses, budgets           │
└──────────────────────────────────────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Expense CRUD** | Add, view, edit, delete expenses with category tagging and notes |
| **Category CRUD** | Create custom categories with emoji icons and color codes |
| **Budget CRUD** | Set monthly budgets per category |
| **Budget Alerts** | 🟡 Warning at 80% spend · 🔴 Danger at 100%+ |
| **Dashboard** | Stat cards, donut chart, 6-month bar trend, recent expenses |
| **Category Filters** | Filter expenses by month and category |
| **Swagger Docs** | Auto-generated API docs at `/docs` |
| **Docker** | Full containerized setup with `docker-compose up` |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB 7.0 (running locally on port 27017)

---

### 1. Backend — FastAPI

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment (optional — defaults work for localhost)
# Edit backend/.env if needed:
#   MONGO_URI=mongodb://localhost:27017
#   DB_NAME=antiexpense

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend running at: http://localhost:8000  
📖 Swagger UI: http://localhost:8000/docs  
📖 ReDoc: http://localhost:8000/redoc  

---

### 2. Frontend — React (Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

✅ Frontend running at: http://localhost:5173



## 📁 Project Structure

```
antiexpense/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── requirements.txt
│   ├── .env
│   ├── database/
│   │   └── mongo.py               # Motor async client (Data Layer)
│   ├── models/                    # Pydantic schemas
│   │   ├── category_model.py
│   │   ├── expense_model.py
│   │   └── budget_model.py
│   ├── routes/                    # API route handlers (Presentation → Logic)
│   │   ├── category_routes.py
│   │   ├── expense_routes.py
│   │   └── budget_routes.py
│   ├── controllers/               # Business logic layer
│   │   ├── category_controller.py
│   │   ├── expense_controller.py
│   │   └── budget_controller.py
│   ├── services/
│   │   └── alert_service.py       # Budget alert computation
│   └── utils/
│       └── helpers.py             # ObjectId serialization
│
├── frontend/
│   ├── src/
│   │   ├── assets/index.css       # Global design system
│   │   ├── context/AlertContext.jsx
│   │   ├── hooks/useExpenses.js
│   │   ├── services/              # Axios API clients
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Dashboard, Expenses, Categories, Budgets
│   │   └── routes/AppRoutes.jsx
│   └── ...
│
├── docker-compose.yml
└── README.md
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
| GET | `/api/expenses` | List expenses (filter: `month`, `category_id`) |
| GET | `/api/expenses/summary` | Dashboard summary + monthly trend |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/budgets` | List budgets (filter: `month`) |
| GET | `/api/budgets/alerts` | Active budget alerts |
| POST | `/api/budgets` | Set budget |
| PUT | `/api/budgets/{id}` | Update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |

---

## 🧱 MVC Architecture (Backend)

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Model** | `models/` | Pydantic request/response schemas, data validation |
| **View** | `routes/` | HTTP route handlers, request parsing, response serialization |
| **Controller** | `controllers/` | Business logic, rule enforcement, DB orchestration |
| **Service** | `services/` | Cross-cutting concerns (alert computation, aggregations) |
| **Data** | `database/` | MongoDB connection, collection accessors |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| State | React Context API, Custom hooks |
| HTTP | Axios |
| Charts | Recharts |
| Animations | Framer Motion |
| Notifications | react-hot-toast |
| Backend | FastAPI (Python 3.11) |
| DB Driver | Motor (async) |
| Database | MongoDB 7.0 |
| Container | Docker + Docker Compose |

---


