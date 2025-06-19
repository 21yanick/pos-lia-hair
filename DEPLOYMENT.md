# 🚀 POS-LIA-HAIR Production Deployment Guide

Complete deployment guide for POS-LIA-HAIR on **Hetzner VPS + Coolify** (2025 optimized).

## 📋 Overview

This deployment strategy uses:
- **Hetzner Cloud VPS** (recommended by Coolify)
- **Coolify** for application management
- **Self-hosted Supabase** for database
- **Automatic SSL** via Let's Encrypt
- **Multi-domain setup**: WordPress + POS System

## 🎯 Final Architecture

```
lia-hair.ch          → WordPress (main website)
pos.lia-hair.ch      → NextJS POS System
db.lia-hair.ch       → Supabase API Gateway
```

## 💻 Server Requirements

### Hetzner VPS Specifications
- **Minimum**: CPX21 (2 vCPU, 4GB RAM, 40GB SSD) - €5.83/month
- **Recommended**: CPX31 (2 vCPU, 8GB RAM, 80GB SSD) - €11.90/month
- **OS**: Ubuntu 24.04 LTS

### Why These Specs?
Based on 2025 best practices research:
- **4GB+ RAM** required for NextJS builds (confirmed user reports)
- **8GB recommended** to handle Supabase + WordPress + POS System
- **SSD storage** for better database performance

## 🛠️ Step-by-Step Deployment

### Phase 1: Server Setup

1. **Order Hetzner VPS**
   - Go to [Hetzner Cloud Console](https://console.hetzner.cloud)
   - Create CPX31 server with Ubuntu 24.04
   - Note down the server IP address

2. **Install Coolify**
   ```bash
   # SSH into your server
   ssh root@YOUR_SERVER_IP
   
   # Install Coolify (latest version)
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```

3. **Access Coolify**
   - Open `https://YOUR_SERVER_IP`
   - Complete initial setup (create admin account)
   - Set up SSL certificate for Coolify dashboard

### Phase 2: Domain Configuration

1. **DNS Settings** (in your domain provider)
   ```
   Type  Name              Value
   A     lia-hair.ch       YOUR_SERVER_IP
   A     pos.lia-hair.ch   YOUR_SERVER_IP
   A     db.lia-hair.ch    YOUR_SERVER_IP
   ```

2. **Wait for DNS Propagation** (5-30 minutes)
   ```bash
   # Test DNS resolution
   dig lia-hair.ch
   dig pos.lia-hair.ch
   dig db.lia-hair.ch
   ```

### Phase 3: Deploy Supabase

1. **Create Supabase Service**
   - Coolify Dashboard → **Services** → **Add New Service**
   - Select **Supabase** from templates
   - Configuration:
     ```
     Name: supabase-pos
     Domain: db.lia-hair.ch
     Database Password: [Generate strong password]
     ```

2. **Deploy and Configure**
   - Click **Deploy**
   - Wait for deployment (5-10 minutes)
   - **Important**: Copy generated keys from service configuration:
     - `SERVICE_SUPABASEANON_KEY`
     - `SERVICE_SUPABASESERVICE_ROLE_KEY`
     - `SERVICE_SUPABASEJWT_SECRET`

3. **Initialize Database**
   - Access Supabase Studio: `https://db.lia-hair.ch`
   - SQL Editor → Run migrations from `/supabase/migrations/`
   - Start with `00_complete_business_centric_schema.sql`

### Phase 4: Deploy NextJS POS Application

1. **Create Application**
   - Coolify Dashboard → **Projects** → **Add New Project**
   - **Git Repository**: Connect your POS-LIA-HAIR repository
   - **Branch**: `main` (or production branch)

2. **Configure Application**
   ```
   Application Type: Docker Compose
   Docker Compose File: .coolify/docker-compose.yml
   Domain: pos.lia-hair.ch
   Port: 3000
   ```

3. **Environment Variables**
   Copy from `.env.production.template` and set in Coolify:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://db.lia-hair.ch
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[from_supabase_service]
   SUPABASE_SERVICE_ROLE_KEY=[from_supabase_service]
   SITE_URL=https://pos.lia-hair.ch
   API_EXTERNAL_URL=https://db.lia-hair.ch
   NODE_OPTIONS=--max-old-space-size=3072
   ```

4. **Deploy Application**
   - Click **Deploy**
   - Monitor build process (may take 5-15 minutes)
   - Check logs for any build errors

### Phase 5: Deploy WordPress (Optional)

1. **Create WordPress Service**
   - Coolify Dashboard → **Services** → **Add New Service**
   - Select **WordPress** from templates
   - Domain: `lia-hair.ch`

2. **Configure WordPress**
   - Follow Coolify's WordPress setup wizard
   - Configure SSL automatically
   - Set up admin account

## 🔧 Post-Deployment Configuration

### 1. SSL Certificates
- Coolify automatically provisions Let's Encrypt certificates
- Verify all domains have valid SSL:
  - ✅ `https://lia-hair.ch`
  - ✅ `https://pos.lia-hair.ch`
  - ✅ `https://db.lia-hair.ch`

### 2. Test POS System
- Access: `https://pos.lia-hair.ch`
- Test login functionality
- Create test sale
- Verify PDF generation
- Check health endpoint: `https://pos.lia-hair.ch/api/health`

### 3. Database Verification
- Access Supabase Studio: `https://db.lia-hair.ch`
- Verify all tables exist
- Check user authentication
- Test API endpoints

## 📊 Monitoring & Maintenance

### Health Monitoring
- **Application**: `https://pos.lia-hair.ch/api/health`
- **Database**: Supabase Studio dashboard
- **Server**: Coolify system metrics

### Backup Strategy
1. **Automatic Backups** (Coolify built-in)
   - Database: Daily PostgreSQL dumps
   - Application: Git-based versioning

2. **External Backups** (Optional)
   - Configure S3-compatible storage in Coolify
   - Weekly full system backups

### Performance Monitoring
```bash
# SSH monitoring commands
htop                    # Server resources
docker ps              # Container status
docker logs [container] # Application logs
df -h                   # Disk usage
free -h                 # Memory usage
```

## 🔒 Security Best Practices

### Implemented Security Features
- ✅ **SSL/TLS encryption** (automatic Let's Encrypt)
- ✅ **Non-root Docker containers**
- ✅ **Environment variable secrets**
- ✅ **Database access restrictions**
- ✅ **Firewall configuration** (Coolify managed)

### Additional Security
1. **Regular Updates**
   ```bash
   # Update Coolify
   coolify self-update
   
   # Update server packages
   apt update && apt upgrade -y
   ```

2. **Backup Verification**
   - Test backup restoration monthly
   - Verify data integrity

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check server resources
   htop
   
   # Enable swap if needed
   fallocate -l 2G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   ```

2. **Database Connection Issues**
   - Verify Supabase service is running
   - Check environment variables
   - Test connection from POS app

3. **Domain/SSL Issues**
   - Verify DNS propagation: `dig your-domain.com`
   - Check Coolify SSL status
   - Force SSL renewal if needed

### Log Access
```bash
# Coolify logs
docker logs coolify

# Application logs
docker logs [app-container-name]

# System logs
journalctl -f
```

## 📈 Scaling Considerations

### Vertical Scaling (Same Server)
- Upgrade to CPX41 (4 vCPU, 16GB RAM) for higher traffic
- Monitor resource usage via Coolify dashboard

### Horizontal Scaling (Future)
- Separate database server
- Load balancer setup
- CDN integration

## 💰 Cost Estimation

### Monthly Costs (EUR)
- **VPS CPX31**: €11.90/month (8GB RAM, 80GB SSD)
- **Domain**: €10-15/year
- **Total**: ~€12-13/month

### Cost Comparison
- **Self-hosted**: €12-13/month (unlimited usage)
- **Supabase Cloud**: €25+ (with usage limits)
- **Vercel + Database**: €20-40+ (with bandwidth limits)

## 🎯 Next Steps

After successful deployment:

1. **Test all functionality** thoroughly
2. **Set up monitoring alerts** in Coolify
3. **Configure automated backups**
4. **Train users** on the POS system
5. **Plan maintenance windows** for updates

## 📞 Support

- **Coolify Documentation**: [docs.coolify.io](https://docs.coolify.io)
- **Hetzner Support**: Available 24/7
- **Application Logs**: Available in Coolify dashboard

## 🔄 Update Process

### Application Updates
1. Push code changes to Git repository
2. Coolify automatically detects changes
3. Review and deploy via Coolify dashboard

### System Updates
- Coolify handles container updates
- Server OS updates via `apt update && apt upgrade`
- Database migrations via Supabase Studio

---

**Deployment prepared with 2025 best practices for Coolify + Hetzner VPS.**