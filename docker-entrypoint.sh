#!/bin/sh

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
node dist/index.js