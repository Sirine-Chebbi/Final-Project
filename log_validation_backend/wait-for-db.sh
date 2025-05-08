#!/bin/sh

echo "Waiting for MariaDB to be ready..."

# Try connecting to db:3306 until successful
while ! nc -z db 3306; do
  echo "MariaDB is unavailable - sleeping"
  sleep 1
done

echo "MariaDB is up - starting Django"
exec "$@"
