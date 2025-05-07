# 1. Use official Python image
FROM python:3.11-slim

# 2. Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev gcc build-essential netcat-openbsd \
    default-libmysqlclient-dev \
    && apt-get clean


# 4. Set working directory
WORKDIR /app

# 5. Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# 6. Copy project files
COPY . .

# 7. Run collectstatic if using Django static files
# RUN python manage.py collectstatic --noinput

# 8. Port & command
EXPOSE 8000
CMD ["gunicorn", "log_validation_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
