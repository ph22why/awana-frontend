#!/bin/bash

echo "🚀 Starting BT Services..."

# BT 서비스만 시작
docker-compose up -d mongodb bt-service awana-bt-app

echo "✅ BT Services started successfully!"
echo ""
echo "📋 Service URLs:"
echo "🌐 BT App: http://localhost:3005"
echo "🔧 BT API: http://localhost:3004"
echo "📊 BT API Health: http://localhost:3004/health"
echo ""
echo "🔍 To view logs:"
echo "docker-compose logs -f bt-service"
echo "docker-compose logs -f awana-bt-app"
echo ""
echo "🛑 To stop services:"
echo "docker-compose down"
