#!/bin/bash

echo "🚀 Setting up API Credentials Manager..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual database URL and encryption key!"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database connection and encryption key"
echo "2. Run 'npm run db:push' to create database tables"
echo "3. Run 'npm run dev' to start the development server"
