# Use Python base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_AUTO_MIGRATE=0 

# Create working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y\
    pkg-config \
    libmariadb-dev-compat libmariadb-dev\
    build-essential \
    netcat-openbsd \ 
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project files
COPY . .

# Copy wait script and make it executable
COPY wait-for-db.sh /wait-for-db.sh
RUN sed -i 's/\r$//' /wait-for-db.sh && chmod +x /wait-for-db.sh

# Collect static files (only for production, optional in dev)
RUN python manage.py collectstatic --noinput

# Expose port for Django
EXPOSE 8000

