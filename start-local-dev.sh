#!/bin/bash

echo "🚀 Starting AWANA Local Development Environment"
echo "================================================"

# 필요한 디렉토리 생성
echo "📁 Creating necessary directories..."
mkdir -p data/mongodb
mkdir -p data/mysql
mkdir -p data/uploads
mkdir -p logs/mongodb
mkdir -p logs/mysql
mkdir -p logs/backend

# Docker가 실행 중인지 확인
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Docker Compose 파일 존재 확인
if [ ! -f "docker-compose.local.yml" ]; then
    echo "❌ docker-compose.local.yml not found!"
    exit 1
fi

echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.local.yml up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "🔍 Checking service status..."
docker-compose -f docker-compose.local.yml ps

echo ""
echo "✅ Development environment is ready!"
echo "================================================"
echo "📱 Services URLs:"
echo "   - AWANA Main App: http://localhost:3000"
echo "   - TNT Camp App: http://localhost:3100"
echo "   - TNT Camp Admin: http://localhost:3101"
echo "   - Backend API: http://localhost:8080"
echo "   - Event Service: http://localhost:3001"
echo "   - Church Service: http://localhost:3002"
echo "   - Receipt Service: http://localhost:3003"
echo ""
echo "🗄️  Database Info:"
echo "   - MongoDB: localhost:27017 (admin/awana123)"
echo "   - MySQL: localhost:3306 (tntcamp/tntcamp123)"
echo ""
echo "📝 To stop all services:"
echo "   docker-compose -f docker-compose.local.yml down"
echo ""
echo "📊 To view logs:"
echo "   docker-compose -f docker-compose.local.yml logs -f [service-name]"
echo "================================================" 