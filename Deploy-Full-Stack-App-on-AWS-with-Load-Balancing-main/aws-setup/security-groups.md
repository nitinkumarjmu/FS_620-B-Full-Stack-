# Security Groups

Suggested security group rules:

## ALB Security Group
- Inbound: HTTP (80) from 0.0.0.0/0
- Inbound: HTTPS (443) from 0.0.0.0/0
- Outbound: All traffic

## Backend EC2 Security Group
- Inbound: TCP 5000 from ALB Security Group
- Inbound: TCP 22 (SSH) from your IP (e.g. x.x.x.x/32)
- Outbound: All traffic

## Frontend EC2 Security Group
- Inbound: TCP 80 (HTTP) from 0.0.0.0/0
- Inbound: TCP 22 (SSH) from your IP
- Outbound: All traffic
