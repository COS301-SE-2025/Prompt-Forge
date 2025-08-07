FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies and Python packages in one layer
RUN apt-get update && apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt && \
    pip cache purge

# Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Install only essential tools
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Copy installed packages from builder stage
COPY --from=builder /root/.local /root/.local

# Copy the application code
COPY . .

# Create models directory
RUN mkdir -p training/fine_tuned_model

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "ai_service:app", "--host", "0.0.0.0", "--port", "8000"]
