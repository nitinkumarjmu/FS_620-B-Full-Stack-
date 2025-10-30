#!/bin/bash

# Frontend Deployment Script for AWS EC2
# Run this script on the frontend EC2 instance

set -e

echo "======================================"
echo "Frontend Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run as root${NC}"
    exit 1
fi

echo -e "${YELLOW}Installing Node.js...${NC}"

# Install Node.js 18.x
if ! command -v node &> /dev/null; then
    curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
    echo -e "${GREEN}Node.js installed successfully${NC}"
else
    echo -e "${GREEN}Node.js already installed: $(node --version)${NC}"
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing Nginx...${NC}"
    sudo yum install -y nginx
    echo -e "${GREEN}Nginx installed successfully${NC}"
else
    echo -e "${GREEN}Nginx already installed${NC}"
fi

# Build directory
BUILD_DIR="/tmp/react-build"

echo -e "${YELLOW}Checking for build files in $BUILD_DIR...${NC}"

if [ ! -d "$BUILD_DIR" ] || [ -z "$(ls -A $BUILD_DIR)" ]; then
    echo -e "${RED}No build files found in $BUILD_DIR${NC}"
    echo "Please transfer your build files first:"
    echo "  scp -i your-key.pem -r ./frontend/build/* ec2-user@your-ip:/tmp/react-build/"
    exit 1
fi

# Stop Nginx
echo -e "${YELLOW}Stopping Nginx...${NC}"
sudo systemctl stop nginx || true

# Backup existing files
BACKUP_DIR="/usr/share/nginx/html.backup.$(date +%Y%m%d_%H%M%S)"
if [ -d "/usr/share/nginx/html" ]; then
    echo -e "${YELLOW}Backing up existing files to $BACKUP_DIR...${NC}"
    sudo cp -r /usr/share/nginx/html "$BACKUP_DIR"
fi

# Clear nginx html directory
echo -e "${YELLOW}Clearing nginx html directory...${NC}"
sudo rm -rf /usr/share/nginx/html/* || true

# Copy build files
echo -e "${YELLOW}Copying build files to nginx directory...${NC}"
sudo cp -r $BUILD_DIR/* /usr/share/nginx/html/

# Set proper permissions
sudo chown -R nginx:nginx /usr/share/nginx/html
sudo chmod -R 755 /usr/share/nginx/html

# Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
sudo tee /etc/nginx/conf.d/app.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable cache for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Test Nginx configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}Nginx configuration is valid${NC}"
else
    echo -e "${RED}Nginx configuration test failed!${NC}"
    exit 1
fi

# Start Nginx
echo -e "${YELLOW}Starting Nginx...${NC}"
sudo systemctl start nginx
sudo systemctl enable nginx

# Check if Nginx is running
sleep 2
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}======================================"
    echo -e "Frontend deployed successfully!"
    echo -e "======================================${NC}"
    echo ""
    echo "Testing website..."
    curl -s http://localhost/health || true
    echo ""
    echo -e "${GREEN}Deployment complete!${NC}"
    echo ""
    echo "Your app is now available at:"
    echo "  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo 'FRONTEND_IP')"
    echo ""
    echo "Useful commands:"
    echo "  sudo systemctl status nginx  - Check Nginx status"
    echo "  sudo systemctl restart nginx - Restart Nginx"
    echo "  sudo nginx -t               - Test configuration"
    echo "  sudo tail -f /var/log/nginx/error.log - View error logs"
else
    echo -e "${RED}Nginx failed to start! Check logs with: sudo journalctl -u nginx${NC}"
    exit 1
fi
