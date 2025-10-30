# EC2 Setup (manual)

1. Launch EC2 instances (Amazon Linux 2 or Ubuntu 22.04)
   - Backend: Launch 2 instances (t3.micro or t2.micro)
   - Frontend: Launch 1 instance

2. Attach appropriate security groups (see security-groups.md)

3. Connect via SSH:
```bash
ssh -i your-key.pem ec2-user@PUBLIC_IP
```

4. Install prerequisites manually or use deployment scripts in /deployment.
