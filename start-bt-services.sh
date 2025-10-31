#!/bin/bash

echo "🚀 Starting BT Services..."

# BT 백엔드 서비스만 시작
docker-compose up -d mongodb bt-service

echo "✅ BT Services started successfully!"
echo ""
echo "📋 Service URLs:"
echo "🔧 BT API: http://localhost:3004"
echo "📊 BT API Health: http://localhost:3004/health"
echo "🌐 Frontend: 별도 실행 (Lovable 또는 로컬에서 npm start)"
echo ""
echo "🔍 To view logs:"
echo "docker-compose logs -f bt-service"
echo ""
echo "🛑 To stop services:"
echo "docker-compose down"
