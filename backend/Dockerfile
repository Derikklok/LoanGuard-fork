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
RUN . .venv/bin/activate && uv pip install -r requirements.txt || uv pip install --project . -r pyproject.toml


# Stage 2: Runtime
FROM python:3.13-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /app/.venv .venv

# Copy application code
COPY database.py .
COPY main.py .
COPY schemas.py .
COPY routes/ ./routes/
COPY notebooks/ ./notebooks/

# Copy .env (or set during runtime)
COPY .env .env

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD .venv/bin/python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run application
CMD [".venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]