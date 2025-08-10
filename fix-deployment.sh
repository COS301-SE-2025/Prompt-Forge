#!/bin/bash

# Emergency fix script for prompt-forge deployment
# Run this on the EC2 server to fix the ai-service DNS resolution issue

echo "Prompt Forge Deployment Fix Script"
echo "=================================="

# Stop all conflicting services
echo "1. Stopping all existing services..."
sudo systemctl stop prompt-forge-backend 2>/dev/null || true
sudo systemctl disable prompt-forge-backend 2>/dev/null || true
sudo docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Clean up any orphaned containers
echo "2. Cleaning up Docker..."
sudo docker container prune -f
sudo docker network prune -f

# Verify Docker Compose file exists and is valid
echo "3. Validating Docker Compose configuration..."
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "ERROR: docker-compose.prod.yml not found!"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found - creating template..."
    cat > .env << 'EOF'
DB_URL=jdbc:postgresql://postgres:5432/promptforge
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_here
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
HF_TOKEN=your_hf_token_here
PAYSTACK_SECRET_KEY=your_paystack_key_here
AWS_ACCESS_KEY_ID=your_aws_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_here
AWS_S3_BUCKET=your_bucket_here
EOF
    echo "WARNING: Please update .env file with real values!"
fi

# Start services with full logging
echo "4. Starting services..."
sudo docker-compose -f docker-compose.prod.yml up -d

# Wait for startup
echo "5. Waiting for services to start..."
sleep 45

# Check container status
echo "6. Container status:"
sudo docker-compose -f docker-compose.prod.yml ps

# Test network connectivity
echo "7. Testing network connectivity..."

# Check if all containers are in the same network
network_name=$(sudo docker-compose -f docker-compose.prod.yml ps -q | head -1 | xargs sudo docker inspect --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' | cut -c1-12)
echo "Network ID: $network_name"

# Test DNS resolution from backend container
echo "8. Testing DNS resolution from backend container..."
backend_container=$(sudo docker-compose -f docker-compose.prod.yml ps -q backend)
if [ ! -z "$backend_container" ]; then
    echo "Testing ai-service resolution from backend:"
    sudo docker exec $backend_container nslookup ai-service || echo "ERROR: Cannot resolve ai-service"
    sudo docker exec $backend_container nslookup ml-service || echo "ERROR: Cannot resolve ml-service"
    
    # Test direct connectivity
    echo "Testing direct connectivity:"
    sudo docker exec $backend_container curl -f http://ai-service:8000/health --max-time 10 || echo "ERROR: Cannot connect to ai-service"
    sudo docker exec $backend_container curl -f http://ml-service:8001/health --max-time 10 || echo "ERROR: Cannot connect to ml-service"
else
    echo "ERROR: Backend container not found"
fi

# Test external access through nginx
echo "9. Testing external access through nginx..."
curl -f http://localhost:80/ai/health --max-time 10 && echo "SUCCESS: AI service accessible via nginx" || echo "ERROR: AI service not accessible via nginx"
curl -f http://localhost:80/ml/health --max-time 10 && echo "SUCCESS: ML service accessible via nginx" || echo "ERROR: ML service not accessible via nginx"
curl -f http://localhost:80/api/health --max-time 10 && echo "SUCCESS: Backend accessible via nginx" || echo "ERROR: Backend not accessible via nginx"

# Show logs for troubleshooting
echo "10. Recent service logs:"
echo "--- AI Service Logs ---"
sudo docker-compose -f docker-compose.prod.yml logs --tail=20 ai-service

echo "--- Backend Logs ---"
sudo docker-compose -f docker-compose.prod.yml logs --tail=20 backend

echo "--- Nginx Logs ---"
sudo docker-compose -f docker-compose.prod.yml logs --tail=10 nginx

echo "Fix script completed!"
echo "If services still fail, check the logs above for errors."
