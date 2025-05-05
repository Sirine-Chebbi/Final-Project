# backend/Dockerfile
FROM python:3.11-slim

# Install system dependencies required for mysqlclient (using MariaDB)
RUN apt-get update && apt-get install -y \
    pkg-config \
    libmariadb-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Upgrade pip and install the Python dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

RUN pip install gunicorn

# Copy the rest of the application code
COPY . .

# Start the application with Gunicorn
CMD ["gunicorn", "log_validation_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
