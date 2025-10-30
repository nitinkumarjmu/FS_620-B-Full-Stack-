# Architecture Diagram

## High-Level Architecture
Internet -> Route 53 (optional) -> Application Load Balancer (ALB) -> Backend EC2 instances (Node.js) across multiple AZs
Frontend EC2 (Nginx) serves React build

## Components
- ALB with health checks (/health)
- Backend EC2 (Node.js + PM2) on port 5000
- Frontend EC2 (Nginx) serving static React build
- MongoDB Atlas (optional) or local MongoDB

## Security Groups (summary)
- ALB: Inbound 80/443 from 0.0.0.0/0
- Backend EC2: Inbound 5000 from ALB SG, SSH from your IP
- Frontend EC2: Inbound 80 from 0.0.0.0/0, SSH from your IP
