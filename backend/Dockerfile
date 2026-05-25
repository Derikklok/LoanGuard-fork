# Backend: FastAPI with XGBoost ML Model
# Multi-stage build for smaller production image

# Stage 1: Builder
FROM python:3.13-slim as builder

WORKDIR /app

# Install system dependencies and uv
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# Copy dependency file
COPY pyproject.toml .

# Create venv and install dependencies
RUN uv venv
RUN . .venv/bin/activate && uv pip install --no-cache-dir -e .


# Stage 2: Runtime
FROM python:3.13-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /app/.venv .venv

# Copy Python package files and module structure
COPY __init__.py .
COPY database.py .
COPY main.py .
COPY schemas.py .

# Copy routes package
COPY routes/ ./routes/

# Copy notebooks package with ML models
COPY notebooks/ ./notebooks/

# Verify models exist
RUN ls -la notebooks/model/models/ && echo "✅ Models directory found"

# Copy .env configuration
COPY .env .env

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Set environment for production
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Run application
CMD [".venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]