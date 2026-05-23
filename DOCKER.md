# 🐳 LoanGuard Docker Setup

This guide explains how to run the LoanGuard application using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git
- Terminal/Command Prompt

## Quick Start

### 1. Clone and Navigate

```bash
cd LoanGuard
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example backend/.env
```

Edit `backend/.env` if needed (for local development, defaults are fine):

```env
MONGO_URL=mongodb://admin:password@mongodb:27017/homecredit_db?authSource=admin
DB_NAME=homecredit_db
SECRET_KEY=your-super-secret-key-change-in-production
```

**For Production:** Replace with MongoDB Atlas credentials:

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
DB_NAME=homecredit_db
SECRET_KEY=generate-a-strong-random-key
```

### 3. Start All Services

```bash
docker-compose up -d
```

This starts:
- **Backend**: http://localhost:8000 (FastAPI with XGBoost)
- **Frontend**: http://localhost:80 (React)
- **MongoDB**: mongodb://localhost:27017 (Local MongoDB)
- **API Docs**: http://localhost:8000/docs

### 4. Stop All Services

```bash
docker-compose down
```

To also remove volumes:

```bash
docker-compose down -v
```

---

## Architecture

### Backend Dockerfile

- **Base Image**: Python 3.13-slim (optimized)
- **Features**:
  - Multi-stage build (reduces image size)
  - Includes XGBoost ML models from `backend/notebooks/model/models/`
  - FastAPI on port 8000
  - Health checks every 30s
  - Virtual environment for isolated dependencies

### Frontend Dockerfile

- **Base Image**: Node:20-alpine (builder) → nginx:alpine (runtime)
- **Features**:
  - Multi-stage build (optimized)
  - React app built with Vite + Tailwind CSS
  - SPA routing support (all routes → index.html)
  - Proxy to backend API
  - Nginx on port 80

### docker-compose.yml

Services:
- **backend**: FastAPI server with hot-reload support
- **frontend**: Nginx serving React app
- **mongodb**: Local MongoDB instance (optional for development)

---

## Development with Hot-Reload

The `docker-compose.yml` includes volume mounts for development:

```yaml
volumes:
  - ./backend:/app  # Backend code changes reload automatically
```

To rebuild after changing dependencies:

```bash
docker-compose up -d --build
```

---

## Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

---

## Accessing Services

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost | React UI (login, predict, history) |
| Backend | http://localhost:8000 | FastAPI server |
| API Docs | http://localhost:8000/docs | Swagger UI for testing endpoints |
| API Redoc | http://localhost:8000/redoc | ReDoc documentation |
| MongoDB | localhost:27017 | Database (local dev only) |

---

## Production Deployment

### Using MongoDB Atlas

Update `backend/.env`:

```env
MONGO_URL=mongodb+srv://your-user:your-password@your-cluster.mongodb.net/?appName=Cluster0
DB_NAME=homecredit_db
SECRET_KEY=generate-secure-random-key
```

### Build for Production

```bash
docker build -t loanguard-backend backend/
docker build -t loanguard-frontend frontend/
```

### Run without Docker Compose

```bash
# Backend
docker run -p 8000:8000 \
  -e MONGO_URL="mongodb+srv://..." \
  -e SECRET_KEY="..." \
  loanguard-backend

# Frontend
docker run -p 80:80 loanguard-frontend
```

---

## Troubleshooting

### Backend fails to start

```bash
docker-compose logs backend
```

Common issues:
- MongoDB connection: Check `MONGO_URL` in `backend/.env`
- Port 8000 in use: `docker-compose up -d --force-recreate`

### Frontend shows blank page

```bash
docker-compose logs frontend
```

Check if backend is accessible:
```bash
docker-compose logs backend | grep "Application startup complete"
```

### Models not found

Ensure `backend/notebooks/model/models/` contains:
- `tax_risk_model.pkl`
- `model_columns.pkl`

If missing, train the model:

```bash
docker-compose exec backend python notebooks/model/train_model.py
```

### Port already in use

Change ports in `docker-compose.yml`:

```yaml
ports:
  - "8001:8000"  # Backend on 8001
  - "3000:80"    # Frontend on 3000
```

---

## System Requirements

- **Docker**: 4GB+ RAM
- **CPU**: 2+ cores recommended
- **Disk**: 2GB+ free space
- **Network**: Stable internet for MongoDB Atlas (if used)

---

## ML Model Details

The backend includes XGBoost model artifacts:

| File | Size | Purpose |
|------|------|---------|
| `tax_risk_model.pkl` | ~50MB | Trained XGBoost classifier |
| `model_columns.pkl` | <1MB | Feature column names and order |

**Location**: `backend/notebooks/model/models/`

**Training**: To retrain the model:

```bash
docker-compose exec backend python notebooks/model/train_model.py
```

---

## Next Steps

1. **Access Frontend**: http://localhost
2. **Register an account**: Click "Sign Up"
3. **Test Prediction**: Go to "Predict" page, enter loan data
4. **View History**: Check "History" page for prediction audit log
5. **API Testing**: Open http://localhost:8000/docs for Swagger UI

---

## Support

For issues, check:
- Docker logs: `docker-compose logs -f`
- Backend file: [backend/main.py](backend/main.py)
- Frontend file: [frontend/src/pages/](frontend/src/pages/)
