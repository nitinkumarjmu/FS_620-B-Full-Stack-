#!/bin/bash

# Backend Deployment Script for AWS EC2
# Run this script on each backend EC2 instance

set -e

echo "======================================"
echo "Backend Deployment Script"
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

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    sudo npm install -g pm2
    echo -e "${GREEN}PM2 installed successfully${NC}"
else
    echo -e "${GREEN}PM2 already installed${NC}"
fi

# Create app directory
APP_DIR="$HOME/app"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Creating app directory...${NC}"
    mkdir -p "$APP_DIR"
fi

cd "$APP_DIR"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOF
PORT=5000
NODE_ENV=production
EOF
    echo -e "${GREEN}.env file created${NC}"
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "backend"; then
    echo -e "${YELLOW}Stopping existing backend process...${NC}"
    pm2 stop backend
    pm2 delete backend
fi

# Start application with PM2
echo -e "${YELLOW}Starting application with PM2...${NC}"
pm2 start server.js --name backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
if [ ! -f /etc/systemd/system/pm2-$USER.service ]; then
    echo -e "${YELLOW}Setting up PM2 startup script...${NC}"
    pm2 startup systemd -u $USER --hp $HOME
fi

# Check if app is running
sleep 3
if pm2 list | grep -q "online"; then
    echo -e "${GREEN}======================================"
    echo -e "Backend deployed successfully!"
    echo -e "======================================${NC}"
    echo ""
    echo "Testing health endpoint..."
    curl -s http://localhost:5000/health || true
    echo ""
    echo -e "${GREEN}Deployment complete!${NC}"
    echo ""
    echo "Useful commands:"
    echo "  pm2 status        - Check status"
    echo "  pm2 logs backend  - View logs"
    echo "  pm2 restart backend - Restart app"
    echo "  pm2 stop backend  - Stop app"
else
    echo -e "${RED}Deployment failed! Check logs with: pm2 logs backend${NC}"
    exit 1
fi
