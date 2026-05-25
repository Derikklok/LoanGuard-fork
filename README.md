# 🏦 LoanGuard — AI Loan Default Risk Prediction System

LoanGuard is an intelligent loan risk assessment platform that uses **XGBoost machine learning** to predict loan default probability. Built with **FastAPI**, **React**, **MongoDB**, and **Docker**, it provides real-time risk scoring for loan officers compliant with OJK (Indonesian Financial Authority) standards.

## 🎯 Features

- **ML-Powered Risk Prediction**: XGBoost classifier with AUC ~0.86 trained on Home Credit Indonesia dataset
- **Real-Time Scoring**: Instant loan default probability (0-100%)
- **Risk Categorization**: 4 risk levels (Critical, High, Medium, Low)
- **Audit Logging**: Complete prediction history with officer tracking
- **JWT Authentication**: Secure officer accounts with role-based access
- **Responsive UI**: React dashboard with Tailwind CSS
- **MongoDB Persistence**: Audit trails and user management
- **Docker Ready**: Multi-stage builds for production deployment
- **OJK Compliance**: Risk factors and regulatory actions recommendations

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────┐
│                  User Browser                    │
│            (http://localhost)                    │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  Frontend (80)   │      │  Backend (8000)  │
│  React + Nginx   │      │  FastAPI         │
│  - SPA routing   │      │  - XGBoost ML    │
│  - JWT tokens    │      │  - Auth & API    │
└────────────┬─────┘      └────────┬─────────┘
             │                     │
             └────────────┬────────┘
                          ▼
                  ┌────────────────┐
                  │  MongoDB       │
                  │  (27017)       │
                  │  - Users       │
                  │  - Predictions │
                  └────────────────┘
```

## ⚡ Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone/navigate to project
cd LoanGuard

# Build and start all services
docker-compose up -d

# Wait for services to be healthy (30-60s)
docker-compose ps
```

**Access the system:**
- 🌐 Frontend: http://localhost
- 📚 API Docs: http://localhost:8000/docs
- 🗄️ MongoDB: localhost:27017 (admin:password)

### Option 2: Run Locally (Development)

#### Prerequisites
- Python 3.13+
- Node.js 20+
- MongoDB running locally (or change `.env`)

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -e .

# Train ML model (one-time)
python notebooks/model/train_model.py

# Start backend server
uvicorn main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev
```

#### Using Shell Scripts

**On macOS/Linux:**
```bash
./run.sh
```

**On Windows (PowerShell):**
```powershell
.\run.ps1
```

Both scripts start backend and frontend in parallel and provide graceful Ctrl+C shutdown.

---

## 🐳 Docker Deployment

### First Time Setup
```bash
# Create environment file (local MongoDB)
cp .env.example backend/.env

# Build and start
docker-compose up -d --build

# Verify all services are healthy
docker-compose ps
```

### Verify System is Running
```bash
# Check backend
curl http://localhost:8000/health
# Response: {"status":"ok"}

# Check frontend
curl http://localhost
# Response: HTML content (React app)

# View logs
docker-compose logs -f backend
```

### Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost | React UI with dashboard, predictions, history |
| **Backend API** | http://localhost:8000 | REST API with Swagger docs |
| **API Docs** | http://localhost:8000/docs | Interactive Swagger UI |
| **MongoDB** | localhost:27017 | Database (internal) |

### Default Credentials
- **MongoDB**: `admin:password`
- **Database**: `homecredit_db`
- **Create users** via registration endpoint

---

## 📊 Using the System

### 1. Register & Login
```bash
# Register a new officer account
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Officer",
    "email": "john@loanguard.com",
    "password": "SecurePass123!",
    "role": "officer"
  }'

# Login to get JWT token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@loanguard.com",
    "password": "SecurePass123!"
  }'
```

### 2. Make Predictions
```bash
# Get JWT token first (from login response: access_token)
TOKEN="your_jwt_token_here"

# Make prediction
curl -X POST http://localhost:8000/predict \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "AMT_INCOME_TOTAL": 150000000,
    "AMT_CREDIT": 500000000,
    "AMT_ANNUITY": 25000000,
    "AGE_YEARS": 27,
    "DAYS_EMPLOYED": -1000
  }'

# Response:
# {
#   "risk_score": 42,
#   "risk_level": "MEDIUM RISK (30-50)",
#   "high_risk_probability": 0.38,
#   "low_risk_probability": 0.62,
#   "risk_factors": ["High credit utilization"],
#   "ojk_actions": ["Approve with higher interest rate", "..."]
# }
```

### 3. View Prediction History
```bash
curl -X GET "http://localhost:8000/history?page=1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🛠️ Development Commands

### Local Development
```bash
# Start backend only (development mode with hot-reload)
cd backend
uvicorn main:app --reload

# Start frontend only (Vite dev server)
cd frontend
npm run dev
```

### Docker Development
```bash
# Start all services
docker-compose up -d

# Rebuild after code changes
docker-compose build --no-cache

# Stop services (keeps data)
docker-compose stop

# Restart services
docker-compose start

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop and remove everything including data
docker-compose down -v

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### ML Model Training
```bash
# Train locally
cd backend/notebooks/model
python train_model.py

# Train in Docker
docker-compose exec backend python notebooks/model/train_model.py

# Models are saved to: backend/notebooks/model/models/
# - tax_risk_model.pkl
# - model_columns.pkl
```

### Linting & Building
```bash
# Frontend linting
cd frontend
npm run lint

# Frontend build
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
LoanGuard/
├── backend/                      # FastAPI + XGBoost backend
│   ├── main.py                   # FastAPI app initialization
│   ├── database.py               # MongoDB connection
│   ├── schemas.py                # Pydantic data models
│   ├── routes/
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── predict.py            # ML prediction endpoint
│   │   └── history.py            # Audit log endpoints
│   ├── notebooks/model/
│   │   ├── train_model.py        # XGBoost training script
│   │   ├── predict.py            # Model inference
│   │   ├── cs-training.csv       # Training dataset
│   │   └── models/               # Trained model artifacts
│   │       ├── tax_risk_model.pkl
│   │       └── model_columns.pkl
│   ├── Dockerfile                # Backend Docker image
│   ├── .env                      # Environment variables
│   └── pyproject.toml            # Python dependencies
│
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx               # Main React component
│   │   ├── main.jsx              # React entry point
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Dashboard.jsx     # Dashboard
│   │   │   ├── Predict.jsx       # Prediction form
│   │   │   └── History.jsx       # Prediction history
│   │   ├── components/           # Reusable UI components
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # JWT auth state
│   │   └── lib/
│   │       └── api.js            # Axios API client
│   ├── Dockerfile                # Frontend Docker image
│   ├── package.json              # Node dependencies
│   └── vite.config.js            # Vite build config
│
├── docker-compose.yml            # Multi-service orchestration
├── run.sh                        # Shell script to run locally
├── run.ps1                       # PowerShell script to run locally
├── DOCKER.md                     # Docker documentation
├── DOCKER_DEPLOYMENT.md          # Deployment guide
├── DOCKER_CHECKLIST.md           # Pre-deployment checklist
└── README.md                     # This file
```

---

## 🔧 Configuration

### Backend Environment Variables
```env
# MongoDB Atlas (production)
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0

# Local MongoDB (development)
MONGO_URL=mongodb://admin:password@localhost:27017

# Database & auth
DB_NAME=homecredit_db
SECRET_KEY=your-super-secret-key-change-in-production
```

### Frontend API Configuration
Edit `frontend/src/lib/api.js`:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000'  // Change for production
})
```

---

## 📊 ML Model Information

### Dataset
- **Source**: Home Credit Indonesia
- **Samples**: 150,000 loan applications
- **Target**: Binary classification (Default: Yes/No)

### Model
- **Algorithm**: XGBoost Classifier
- **AUC Score**: ~0.8652
- **Features**: 14 financial indicators
  - Income, Credit, Annuity, Age
  - Employment duration, Debt ratio
  - Credit usage, Payment history, etc.

### Risk Scoring
- **0-30**: LOW RISK → Approve
- **30-50**: MEDIUM RISK → Approve with conditions
- **50-70**: HIGH RISK → Review/Hold
- **70-100**: CRITICAL RISK → Reject/Escalate

---

## 🚀 Production Deployment

### Using MongoDB Atlas
1. Create Atlas cluster: https://mongodb.com/cloud/atlas
2. Get connection string from Atlas
3. Update `backend/.env`:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
   ```
4. Deploy with `docker-compose up -d`

### Environment Variables (Production)
```env
# Change all defaults
SECRET_KEY=generate-a-strong-random-key
MONGO_URL=mongodb+srv://prod_user:prod_pass@prod-cluster...
DB_NAME=homecredit_prod
```

### Docker Image Deployment
```bash
# Build production images
docker-compose build --no-cache

# Push to registry (e.g., Docker Hub)
docker tag loanguard-backend:latest myregistry/loanguard-backend:1.0
docker push myregistry/loanguard-backend:1.0

# Deploy to cloud platform (AWS, GCP, Azure, etc.)
# Update docker-compose.yml with pushed image tags
```

---

## 📝 API Endpoints

### Authentication
- `POST /auth/register` — Create officer account
- `POST /auth/login` — Login and get JWT token
- `GET /auth/me` — Get current user info

### Predictions
- `POST /predict` — Make loan risk prediction
- `GET /predict` — Get ML model metadata

### History
- `GET /history` — List predictions (paginated)
- `GET /history/{record_id}` — Get specific prediction
- `DELETE /history/{record_id}` — Delete prediction (admin only)

### Health
- `GET /health` — Backend health check
- `GET /` — API info

---

## 🐛 Troubleshooting

### Services not starting?
```bash
# Check logs
docker-compose logs

# Verify ports are available
# Port 80: Frontend
# Port 8000: Backend
# Port 27017: MongoDB

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### MongoDB connection failed?
```bash
# Check MongoDB health
docker-compose logs mongodb

# Verify connection string in backend/.env
# Local: mongodb://admin:password@mongodb:27017
# Atlas: mongodb+srv://user:pass@cluster...
```

### Models not found?
```bash
# Check if models exist
ls -la backend/notebooks/model/models/

# Train models
docker-compose exec backend python notebooks/model/train_model.py

# Verify in logs
docker-compose logs backend | grep "Models"
```

### Frontend blank page?
```bash
# Clear browser cache
# Ctrl+Shift+R (hard refresh)

# Check frontend logs
docker-compose logs frontend

# Ensure backend is healthy
curl http://localhost:8000/health
```

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Docker Guide**: See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **Deployment Checklist**: See [DOCKER_CHECKLIST.md](DOCKER_CHECKLIST.md)
- **Comprehensive Docker Docs**: See [DOCKER.md](DOCKER.md)

---

## 👨‍💻 Development Team

**LoanGuard** — Building intelligent risk assessment for financial institutions.

### Tech Stack Summary
- **Backend**: FastAPI 0.136.1, Uvicorn 0.47.0, Motor 3.7.1
- **ML**: XGBoost 3.2.0, scikit-learn 1.8.0
- **Frontend**: React 19.2.6, Vite 8.0.12, Tailwind CSS 4.3.0
- **Database**: MongoDB 7.0, PyMongo 4.17.0
- **Auth**: PyJWT 2.12.1, bcrypt 5.0.0
- **Deployment**: Docker, Docker Compose, Nginx

---

## 📄 License

This project is for educational purposes. For production use, ensure compliance with OJK and local regulations.

---

## 🎓 Quick Reference

### Start System
```bash
# Docker (Recommended)
docker-compose up -d

# Local - Shell (macOS/Linux)
./run.sh

# Local - PowerShell (Windows)
.\run.ps1
```

### Access
- Frontend: http://localhost
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### Stop System
```bash
# Docker
docker-compose down

# Local (Ctrl+C in terminal)
```

---

**Ready to assess loan risks intelligently? Start LoanGuard now!** 🚀
